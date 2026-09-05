import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profileModerationActionEnum } from "./enums";
import { talentProfile } from "./talent-profile";

export const profileModeration = pgTable(
  "profile_moderation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => talentProfile.id, {
        onDelete: "cascade",
        onUpdate: "no action",
      }),
    action: profileModerationActionEnum("action").notNull(),
    note: text("note"),
    moderatorUserId: uuid("moderator_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("profile_moderation_profile_id_created_at_idx").on(
      table.profileId,
      table.createdAt,
    ),
  ],
);
