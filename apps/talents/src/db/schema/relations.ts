import { relations } from "drizzle-orm";
import { inquiry } from "./inquiry";
import { profileModeration } from "./profile-moderation";
import { talentCategory } from "./talent-category";
import { talentPortfolioLink } from "./talent-portfolio-link";
import { talentProfile } from "./talent-profile";
import { talentSkill } from "./talent-skill";

export const talentCategoryRelations = relations(talentCategory, ({ many }) => ({
  profiles: many(talentProfile),
}));

export const talentProfileRelations = relations(
  talentProfile,
  ({ one, many }) => ({
    category: one(talentCategory, {
      fields: [talentProfile.categoryId],
      references: [talentCategory.id],
    }),
    skills: many(talentSkill),
    portfolioLinks: many(talentPortfolioLink),
    inquiries: many(inquiry),
    moderationHistory: many(profileModeration),
  }),
);

export const talentSkillRelations = relations(talentSkill, ({ one }) => ({
  profile: one(talentProfile, {
    fields: [talentSkill.profileId],
    references: [talentProfile.id],
  }),
}));

export const talentPortfolioLinkRelations = relations(
  talentPortfolioLink,
  ({ one }) => ({
    profile: one(talentProfile, {
      fields: [talentPortfolioLink.profileId],
      references: [talentProfile.id],
    }),
  }),
);

export const inquiryRelations = relations(inquiry, ({ one }) => ({
  talentProfile: one(talentProfile, {
    fields: [inquiry.talentProfileId],
    references: [talentProfile.id],
  }),
}));

export const profileModerationRelations = relations(
  profileModeration,
  ({ one }) => ({
    profile: one(talentProfile, {
      fields: [profileModeration.profileId],
      references: [talentProfile.id],
    }),
  }),
);
