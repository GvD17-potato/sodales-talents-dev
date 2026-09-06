import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";
import { userRole } from "./schema";

const localEnvironmentFiles = [
  fileURLToPath(new URL("../../.env.local", import.meta.url)),
  fileURLToPath(new URL("../../../../.env.local", import.meta.url)),
];

function unquote(value: string) {
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

function readEnvironmentValue(name: string) {
  const processValue = process.env[name]?.trim();
  if (processValue) return processValue;

  for (const path of localEnvironmentFiles) {
    if (!existsSync(path)) continue;
    const line = readFileSync(path, "utf8")
      .split(/\r?\n/)
      .find((candidate) => candidate.startsWith(`${name}=`));
    if (!line) continue;
    const value = unquote(line.slice(name.length + 1));
    if (value) return value;
  }
  return undefined;
}

function requireEnvironmentValue(name: string) {
  const value = readEnvironmentValue(name);
  if (!value) throw new Error(`BLOCKED ON ADMIN BOOTSTRAP CREDENTIAL: ${name} is not configured.`);
  return value;
}

async function bootstrapAdmin() {
  let databaseUrl = requireEnvironmentValue("DATABASE_URL");
  const authBaseUrl = requireEnvironmentValue("NEON_AUTH_BASE_URL");
  const adminEmail = z.email().parse(requireEnvironmentValue("ADMIN_EMAIL").toLowerCase());
  const adminPassword = z.string().min(8).parse(requireEnvironmentValue("ADMIN_PASSWORD"));

  if (!URL.canParse(authBaseUrl) || new URL(authBaseUrl).protocol !== "https:") {
    throw new Error("BLOCKED ON ADMIN BOOTSTRAP CREDENTIAL: NEON_AUTH_BASE_URL is invalid.");
  }

  const sqlClient = postgres(databaseUrl, { prepare: false, max: 1 });
  const database = drizzle(sqlClient);

  try {
    const response = await fetch(`${authBaseUrl}/sign-up/email`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: authBaseUrl,
      },
      body: JSON.stringify({
        email: adminEmail,
        name: "Sodales Admin",
        password: adminPassword,
      }),
    });

    const responseBody = await response.text();
    let responseCode = "";
    try {
      const parsed = JSON.parse(responseBody) as { code?: unknown };
      responseCode = typeof parsed.code === "string" ? parsed.code : "";
    } catch {
      responseCode = "";
    }

    if (!response.ok && !responseCode.includes("USER_ALREADY_EXISTS")) {
      throw new Error("Admin Auth account creation was not accepted.");
    }

    let authUserId: string | undefined;
    for (const delay of [0, 100, 300, 600]) {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      const rows = await sqlClient<{ id: string }[]>`
        select id
        from neon_auth."user"
        where lower(email) = ${adminEmail}
        limit 1
      `;
      authUserId = rows[0]?.id;
      if (authUserId) break;
    }

    if (!authUserId) {
      throw new Error("Admin Auth identity could not be verified in the development database.");
    }

    await database
      .insert(userRole)
      .values({ userId: authUserId, role: "admin" })
      .onConflictDoUpdate({
        target: userRole.userId,
        set: { role: "admin", updatedAt: new Date() },
      });

    console.log("First-admin bootstrap complete: Auth identity and admin role verified.");
  } finally {
    databaseUrl = "";
    await sqlClient.end({ timeout: 5 });
  }
}

bootstrapAdmin().catch((error: unknown) => {
  if (error instanceof Error && error.message.startsWith("BLOCKED ON")) {
    console.error(error.message);
  } else {
    console.error("First-admin bootstrap failed without exposing credential details.");
  }
  process.exitCode = 1;
});
