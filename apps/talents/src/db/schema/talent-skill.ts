import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { talentProfile } from "./talent-profile";

export const talentSkill = pgTable(
  "talent_skill",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => talentProfile.id, {
        onDelete: "cascade",
        onUpdate: "no action",
      }),
    name: text("name").notNull(),
    position: integer("position").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("talent_skill_profile_id_name_uidx").on(
      table.profileId,
      table.name,
    ),
    index("talent_skill_profile_id_position_idx").on(
      table.profileId,
      table.position,
    ),
    check("talent_skill_position_nonnegative", sql`${table.position} >= 0`),
  ],
);
