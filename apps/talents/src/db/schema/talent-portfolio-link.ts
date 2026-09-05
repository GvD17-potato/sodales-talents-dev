import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { talentProfile } from "./talent-profile";

export const talentPortfolioLink = pgTable(
  "talent_portfolio_link",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => talentProfile.id, {
        onDelete: "cascade",
        onUpdate: "no action",
      }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    position: integer("position").default(0).notNull(),
  },
  (table) => [
    index("talent_portfolio_link_profile_id_position_idx").on(
      table.profileId,
      table.position,
    ),
    check(
      "talent_portfolio_link_position_nonnegative",
      sql`${table.position} >= 0`,
    ),
  ],
);
