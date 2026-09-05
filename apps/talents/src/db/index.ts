import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { requireDatabaseUrl } from "./read-database-url";
import * as schema from "./schema";

type SqlClient = ReturnType<typeof postgres>;

const globalForDatabase = globalThis as typeof globalThis & {
  sodalesTalentsSqlClient?: SqlClient;
};

const sqlClient =
  globalForDatabase.sodalesTalentsSqlClient ??
  postgres(requireDatabaseUrl(), { prepare: false, max: 10 });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.sodalesTalentsSqlClient = sqlClient;
}

export const db = drizzle(sqlClient, { schema });
export { schema };
