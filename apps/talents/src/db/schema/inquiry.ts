import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { inquiryStatusEnum } from "./enums";
import { talentProfile } from "./talent-profile";

export const inquiry = pgTable(
  "inquiry",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    talentProfileId: uuid("talent_profile_id")
      .notNull()
      .references(() => talentProfile.id, {
        onDelete: "cascade",
        onUpdate: "no action",
      }),
    senderName: text("sender_name").notNull(),
    senderEmail: text("sender_email").notNull(),
    message: text("message").notNull(),
    status: inquiryStatusEnum("status").default("new").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("inquiry_status_created_at_idx").on(table.status, table.createdAt),
    index("inquiry_talent_profile_id_idx").on(table.talentProfileId),
  ],
);
