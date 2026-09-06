"use client";

import { Button } from "@sodales/ui/button";
import { useActionState, useState, type FormEvent } from "react";
import { signInSchema, signUpSchema } from "@/domain";
import {
  initialAuthActionState,
  type AuthField,
} from "@/features/auth/action-state";
import {
  signInAction,
  signUpAction,
} from "@/features/auth/actions";

function FieldError({ field, errors }: { field: AuthField; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={`auth-${field}-error`} className="mt-2 text-sm text-red-700">
      {errors[0]}
    </p>
  );
}

export function AuthForm({ mode }: { mode: "login" | "sign-up" }) {
  const isSignUp = mode === "sign-up";
  const action = isSignUp ? signUpAction : signInAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialAuthActionState,
  );
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<AuthField, string[]>>
  >({});
  const fieldErrors = Object.keys(clientErrors).length
    ? clientErrors
    : state.fieldErrors;

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const values = {
      ...(isSignUp ? { name: String(formData.get("name") ?? "") } : {}),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
    const result = (isSignUp ? signUpSchema : signInSchema).safeParse(values);
    if (result.success) {
      setClientErrors({});
      return;
    }

    event.preventDefault();
    const nextErrors: Partial<Record<AuthField, string[]>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field !== "name" && field !== "email" && field !== "password") {
        continue;
      }
      (nextErrors[field] ??= []).push(issue.message);
    }
    setClientErrors(nextErrors);
  }

  return (
    <form action={formAction} onSubmit={validateBeforeSubmit} className="mt-9 space-y-6">
      {isSignUp ? (
        <div>
          <label htmlFor="auth-name" className="mb-2 block text-[13px] font-medium">
            Full name
          </label>
          <input
            id="auth-name"
            name="name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors?.name?.length)}
            aria-describedby={fieldErrors?.name?.length ? "auth-name-error" : undefined}
            className="min-h-12 w-full border border-graphite/40 bg-transparent px-3.5 text-base outline-none focus:border-violet focus:shadow-[0_0_0_1px_var(--sodales-violet)]"
          />
          <FieldError field="name" errors={fieldErrors?.name} />
        </div>
      ) : null}
      <div>
        <label htmlFor="auth-email" className="mb-2 block text-[13px] font-medium">
          Email address
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors?.email?.length)}
          aria-describedby={fieldErrors?.email?.length ? "auth-email-error" : undefined}
          className="min-h-12 w-full border border-graphite/40 bg-transparent px-3.5 text-base outline-none focus:border-violet focus:shadow-[0_0_0_1px_var(--sodales-violet)]"
        />
        <FieldError field="email" errors={fieldErrors?.email} />
      </div>
      <div>
        <label htmlFor="auth-password" className="mb-2 block text-[13px] font-medium">
          Password
        </label>
        <input
          id="auth-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          aria-invalid={Boolean(fieldErrors?.password?.length)}
          aria-describedby={fieldErrors?.password?.length ? "auth-password-error" : undefined}
          className="min-h-12 w-full border border-graphite/40 bg-transparent px-3.5 text-base outline-none focus:border-violet focus:shadow-[0_0_0_1px_var(--sodales-violet)]"
        />
        <FieldError field="password" errors={fieldErrors?.password} />
      </div>
      {state.status === "error" && state.message ? (
        <p role="alert" className="border border-red-700/30 bg-red-50 p-4 text-sm leading-6 text-red-900">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
        {pending
          ? isSignUp
            ? "Creating talent profile…"
            : "Signing in…"
          : isSignUp
            ? "Create talent profile"
            : "Sign in"}
      </Button>
    </form>
  );
}
