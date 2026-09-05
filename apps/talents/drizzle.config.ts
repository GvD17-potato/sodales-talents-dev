import { defineConfig } from "drizzle-kit";
import { readDatabaseUrl } from "./src/db/read-database-url";

const databaseUrl = readDatabaseUrl();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  strict: true,
  verbose: true,
  ...(databaseUrl ? { dbCredentials: { url: databaseUrl } } : {}),
});
