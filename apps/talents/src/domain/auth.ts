import { z } from "zod";
import type { UserRole } from "./constants";

export const signInSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
  })
  .strict();

export const signUpSchema = signInSchema
  .extend({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(80, "Name must be 80 characters or fewer."),
  })
  .strict();

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

export type AuthorizationDecision =
  | "allow"
  | "unauthenticated"
  | "account-incomplete"
  | "forbidden";

export function authorizeApplicationUser(input: {
  authenticated: boolean;
  role: UserRole | null;
  hasTalentProfile: boolean;
  allowedRoles: readonly UserRole[];
}): AuthorizationDecision {
  if (!input.authenticated) return "unauthenticated";
  if (!input.role) return "account-incomplete";
  if (input.role === "talent" && !input.hasTalentProfile) {
    return "account-incomplete";
  }
  return input.allowedRoles.includes(input.role) ? "allow" : "forbidden";
}
export function destinationForRole(role: UserRole) {
  return role === "admin" ? "/admin" : "/dashboard";
}
