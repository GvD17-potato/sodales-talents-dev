import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const requestedApp = process.argv[2] ?? "talents";

if (requestedApp !== "talents") {
  console.error(`Unsupported database smoke target: ${requestedApp}`);
  process.exit(1);
}

function unquote(value) {
  const trimmed = value.trim();
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function readDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();

  for (const path of [
    join(repositoryRoot, "apps", "talents", ".env.local"),
    join(repositoryRoot, ".env.local"),
  ]) {
    if (!existsSync(path)) continue;
    const line = readFileSync(path, "utf8")
      .split(/\r?\n/)
      .find((candidate) => candidate.startsWith("DATABASE_URL="));
    if (!line) continue;
    const value = unquote(line.slice("DATABASE_URL=".length));
    if (value) return value;
  }

  return undefined;
}

const databaseUrl = readDatabaseUrl();
if (!databaseUrl) {
  console.error("BLOCKED ON DATABASE CREDENTIAL: DATABASE_URL is not configured.");
  process.exit(1);
}

const requireFromApp = createRequire(
  join(repositoryRoot, "apps", "talents", "package.json"),
);
const postgres = requireFromApp("postgres");
const sql = postgres(databaseUrl, { prepare: false, max: 1 });

const expectedTables = [
  "user_role",
  "talent_category",
  "talent_profile",
  "talent_skill",
  "talent_portfolio_link",
  "inquiry",
  "profile_moderation",
];

const expectedEnums = {
  user_role_type: ["talent", "admin"],
  talent_profile_status: ["draft", "pending", "approved", "hidden"],
  inquiry_status: ["new", "read", "archived"],
  profile_moderation_action: ["approved", "hidden"],
};

try {
  const connectivity = await sql`select 1::integer as ok`;
  if (connectivity[0]?.ok !== 1) {
    throw new Error("CONNECTIVITY_CHECK_FAILED");
  }

  const tableRows = await sql`
    select table_name
    from information_schema.tables
    where table_schema = current_schema()
      and table_type = 'BASE TABLE'
  `;
  const availableTables = new Set(tableRows.map((row) => row.table_name));
  const missingTables = expectedTables.filter(
    (table) => !availableTables.has(table),
  );
  const unexpectedTables = [...availableTables].filter(
    (table) => !expectedTables.includes(table),
  );
  if (missingTables.length > 0) {
    console.error(`Database smoke failed: missing tables ${missingTables.join(", ")}.`);
    process.exitCode = 1;
  }
  if (unexpectedTables.length > 0) {
    console.error(
      `Database smoke failed: unexpected application tables ${unexpectedTables.join(", ")}.`,
    );
    process.exitCode = 1;
  }

  const enumRows = await sql`
    select type.typname as enum_name, value.enumlabel as enum_value
    from pg_type as type
    join pg_enum as value on type.oid = value.enumtypid
    join pg_namespace as namespace on namespace.oid = type.typnamespace
    where namespace.nspname = current_schema()
    order by type.typname, value.enumsortorder
  `;

  for (const [enumName, expectedValues] of Object.entries(expectedEnums)) {
    const actualValues = enumRows
      .filter((row) => row.enum_name === enumName)
      .map((row) => row.enum_value);
    if (JSON.stringify(actualValues) !== JSON.stringify(expectedValues)) {
      console.error(`Database smoke failed: enum ${enumName} does not match.`);
      process.exitCode = 1;
    }
  }

  if (!process.exitCode) {
    console.log(
      `Database smoke passed: connectivity, ${expectedTables.length} tables, and ${Object.keys(expectedEnums).length} enums verified.`,
    );
  }
} catch (error) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "UNKNOWN";
  console.error(`Database smoke failed (${code}); connection details were not printed.`);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
