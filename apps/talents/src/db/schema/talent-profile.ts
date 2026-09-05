import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { profileStatusEnum } from "./enums";
import { talentCategory } from "./talent-category";

export const talentProfile = pgTable(
  "talent_profile",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    slug: text("slug").notNull(),
    displayName: text("display_name").notNull(),
    headline: text("headline"),
    bio: text("bio"),
    location: text("location"),
    categoryId: uuid("category_id").references(() => talentCategory.id, {
      onDelete: "restrict",
      onUpdate: "no action",
    }),
    status: profileStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("talent_profile_user_id_uidx").on(table.userId),
    uniqueIndex("talent_profile_slug_uidx").on(table.slug),
    index("talent_profile_status_updated_at_idx").on(
      table.status,
      table.updatedAt,
    ),
    index("talent_profile_status_category_id_idx").on(
      table.status,
      table.categoryId,
    ),
  ],
);
