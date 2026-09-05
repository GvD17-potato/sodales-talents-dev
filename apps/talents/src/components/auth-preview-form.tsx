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
    <form onSubmit={handleSubmit} className="mt-9 space-y-5">
      {isSignUp ? (
        <div>
          <label htmlFor="auth-name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em]">
            Name
          </label>
          <input id="auth-name" name="name" required minLength={2} maxLength={80} autoComplete="name" className="min-h-12 w-full border border-graphite/30 bg-white px-4 outline-none focus:border-violet" />
        </div>
      ) : null}
      <div>
        <label htmlFor="auth-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em]">
          Email
        </label>
        <input id="auth-email" name="email" type="email" required autoComplete="email" className="min-h-12 w-full border border-graphite/30 bg-white px-4 outline-none focus:border-violet" />
      </div>
      <div>
        <label htmlFor="auth-password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em]">
          Password
        </label>
        <input id="auth-password" name="password" type="password" required minLength={8} autoComplete={isSignUp ? "new-password" : "current-password"} className="min-h-12 w-full border border-graphite/30 bg-white px-4 outline-none focus:border-violet" />
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
