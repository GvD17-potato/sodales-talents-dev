import { z } from "zod";

export const USER_ROLES = ["talent", "admin"] as const;
export const PROFILE_STATUSES = [
  "draft",
  "pending",
  "approved",
  "hidden",
] as const;
export const INQUIRY_STATUSES = ["new", "read", "archived"] as const;
export const PROFILE_MODERATION_ACTIONS = ["approved", "hidden"] as const;

export const userRoleSchema = z.enum(USER_ROLES);
export const profileStatusSchema = z.enum(PROFILE_STATUSES);
export const inquiryStatusSchema = z.enum(INQUIRY_STATUSES);
export const profileModerationActionSchema = z.enum(
  PROFILE_MODERATION_ACTIONS,
);

export type UserRole = z.infer<typeof userRoleSchema>;
export type ProfileStatus = z.infer<typeof profileStatusSchema>;
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;
export type ProfileModerationAction = z.infer<
  typeof profileModerationActionSchema
>;
