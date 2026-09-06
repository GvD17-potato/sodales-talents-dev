"use server";

import { redirect } from "next/navigation";
import { signInSchema, signUpSchema } from "@/domain";
import { auth } from "@/lib/auth/server";
import { reconcileApplicationAccount } from "./account-provisioning";
import type { AuthActionState, AuthField } from "./action-state";
import {
  authenticateAccount,
  registerTalent,
  terminateSession,
  type AuthIdentity,
  type AuthProviderGateway,
} from "./workflows";

function identityFromUser(
  user: { id: string; email: string; name?: string | null } | null | undefined,
): AuthIdentity | null {
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name ?? null };
}

function safeProviderMessage(
  operation: "sign-in" | "sign-up",
  error: { code?: string; message?: string },
) {
  if (
    operation === "sign-up" &&
    ["USER_ALREADY_EXISTS", "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"].includes(
      error.code ?? "",
    )
  ) {
    return "An account already exists for this email address. Try signing in.";
  }
  return operation === "sign-in"
    ? "The email address or password was not accepted."
    : "Account creation failed. Please check your details and try again.";
}

const provider: AuthProviderGateway = {
  async signUp(input) {
    try {
      const result = await auth.signUp.email(input);
      if (result.error) {
        return {
          ok: false,
          message: safeProviderMessage("sign-up", result.error),
        };
      }
      return {
        ok: true,
        identity: identityFromUser(result.data?.user),
      };
    } catch {
      return {
        ok: false,
        message: "Account creation is temporarily unavailable. Please try again.",
      };
    }
  },
  async signIn(input) {
    try {
      const result = await auth.signIn.email(input);
      if (result.error) {
        return {
          ok: false,
          message: safeProviderMessage("sign-in", result.error),
        };
      }
      return {
        ok: true,
        identity: identityFromUser(result.data?.user),
      };
    } catch {
      return {
        ok: false,
        message: "Sign in is temporarily unavailable. Please try again.",
      };
    }
  },
  async getIdentity() {
    const { data } = await auth.getSession();
    return identityFromUser(data?.user);
  },
  async signOut() {
    await auth.signOut();
  },
};

const provisioner = { reconcile: reconcileApplicationAccount };

function fieldErrorsFromIssues(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>,
) {
  const fieldErrors: Partial<Record<AuthField, string[]>> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (field !== "name" && field !== "email" && field !== "password") continue;
    (fieldErrors[field] ??= []).push(issue.message);
  }
  return fieldErrors;
}

function invalidState(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>,
): AuthActionState {
  return {
    status: "error",
    message: "Check the highlighted fields and try again.",
    fieldErrors: fieldErrorsFromIssues(issues),
  };
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return invalidState(parsed.error.issues);

  const result = await registerTalent(parsed.data, provider, provisioner);
  if (!result.ok) return { status: "error", message: result.message };
  redirect(result.destination);
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return invalidState(parsed.error.issues);

  const result = await authenticateAccount(parsed.data, provider, provisioner);
  if (!result.ok) return { status: "error", message: result.message };
  redirect(result.destination);
}

export async function signOutAction() {
  await terminateSession(provider);
  redirect("/");
}
