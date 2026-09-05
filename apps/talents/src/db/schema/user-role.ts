import { pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";

export const userRole = pgTable(
  "user_role",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    role: userRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("user_role_user_id_uidx").on(table.userId)],
);
