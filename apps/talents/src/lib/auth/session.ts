import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { authorizeApplicationUser, type UserRole } from "@/domain";
import { getApplicationAccount } from "@/features/auth/account-provisioning";
import { auth } from "./server";

export const getCurrentUser = cache(async () => {
  const { data } = await auth.getSession();
  if (!data?.user) return null;

  const account = await getApplicationAccount(data.user.id);
  return {
    id: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: account?.role ?? null,
    profileId: account?.profileId ?? null,
  };
});

export async function requireUser() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  return currentUser;
}
export async function requireRole(...allowedRoles: UserRole[]) {
  const currentUser = await requireUser();
  const decision = authorizeApplicationUser({
    authenticated: true,
    role: currentUser.role,
    hasTalentProfile: Boolean(currentUser.profileId),
    allowedRoles,
  });

  if (decision === "account-incomplete") {
    redirect("/login?error=account-setup");
  }
  if (decision !== "allow") redirect("/");

  return currentUser as typeof currentUser & { role: UserRole };
}
