import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const localEnvironmentFiles = [
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), "apps/talents/.env.local"),
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

function readLocalDatabaseUrl() {
  for (const path of localEnvironmentFiles) {
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

export function readDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() || readLocalDatabaseUrl();
}

export function requireDatabaseUrl() {
  const databaseUrl = readDatabaseUrl();
  if (!databaseUrl) {
    throw new Error(
      "BLOCKED ON DATABASE CREDENTIAL: DATABASE_URL is not configured.",
    );
  }
  return databaseUrl;
}
