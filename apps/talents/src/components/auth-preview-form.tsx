"use client";

import { Button } from "@sodales/ui/button";
import { type FormEvent, useState } from "react";

export function AuthPreviewForm({ mode }: { mode: "login" | "sign-up" }) {
  const [notice, setNotice] = useState(false);
  const isSignUp = mode === "sign-up";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-9 space-y-6">
      <p className="border-l-2 border-violet bg-violet-soft/45 p-4 text-xs leading-6 text-graphite">
        Interactive preview. Use sample details; no real account or password
        is stored.
      </p>
      {isSignUp ? (
        <div>
          <label htmlFor="auth-name" className="mb-2 block text-[13px] font-medium">
            Full name
          </label>
          <input id="auth-name" name="name" required minLength={2} maxLength={80} autoComplete="name" className="min-h-12 w-full border border-graphite/40 bg-transparent px-3.5 text-base outline-none focus:border-violet focus:shadow-[0_0_0_1px_var(--sodales-violet)]" />
        </div>
      ) : null}
      <div>
        <label htmlFor="auth-email" className="mb-2 block text-[13px] font-medium">
          Email address
        </label>
        <input id="auth-email" name="email" type="email" required autoComplete="email" className="min-h-12 w-full border border-graphite/40 bg-transparent px-3.5 text-base outline-none focus:border-violet focus:shadow-[0_0_0_1px_var(--sodales-violet)]" />
      </div>
      <div>
        <label htmlFor="auth-password" className="mb-2 block text-[13px] font-medium">
          Password
        </label>
        <input id="auth-password" name="password" type="password" required minLength={8} autoComplete={isSignUp ? "new-password" : "current-password"} className="min-h-12 w-full border border-graphite/40 bg-transparent px-3.5 text-base outline-none focus:border-violet focus:shadow-[0_0_0_1px_var(--sodales-violet)]" />
      </div>
      {notice ? (
        <p role="alert" className="border border-violet/35 bg-violet-soft/45 p-4 text-sm leading-6 text-graphite">
          <strong className="block text-obsidian">Testing preview only</strong>
          Neon Auth is not connected in this milestone build. No credentials
          were transmitted or stored.
        </p>
      ) : null}
      <Button type="submit" className="w-full">
        {isSignUp ? "Create talent profile" : "Sign in"}
      </Button>
    </form>
  );
}
