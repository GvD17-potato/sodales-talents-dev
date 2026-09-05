import { pgEnum } from "drizzle-orm/pg-core";
import {
  INQUIRY_STATUSES,
  PROFILE_MODERATION_ACTIONS,
  PROFILE_STATUSES,
  USER_ROLES,
} from "../../domain/constants";

export const userRoleEnum = pgEnum("user_role_type", USER_ROLES);
export const profileStatusEnum = pgEnum(
  "talent_profile_status",
  PROFILE_STATUSES,
);
export const inquiryStatusEnum = pgEnum("inquiry_status", INQUIRY_STATUSES);
export const profileModerationActionEnum = pgEnum(
  "profile_moderation_action",
  PROFILE_MODERATION_ACTIONS,
);
