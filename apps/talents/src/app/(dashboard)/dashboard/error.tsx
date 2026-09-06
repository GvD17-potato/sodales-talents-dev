"use client";

import { Button } from "@sodales/ui/button";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section role="alert" className="max-w-2xl border border-red-700/30 bg-red-50 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-800">Workspace unavailable</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">We could not load your talent workspace.</h1>
      <p className="mt-4 text-sm leading-6 text-red-900">Your saved profile has not been changed. Try loading the workspace again.</p>
      <Button type="button" onClick={reset} className="mt-6">Try again</Button>
    </section>
  );
}
