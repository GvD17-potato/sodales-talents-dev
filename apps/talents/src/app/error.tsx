"use client";

import { Button } from "@sodales/ui/button";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="grid min-h-[68vh] place-items-center px-4 py-16 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">Something went wrong</p>
        <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.055em]">The page could not be loaded.</h1>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-graphite/70">
          Try the request again. If the problem continues, return to the talent
          directory.
        </p>
        <Button type="button" onClick={reset} className="mt-8">Try again</Button>
      </div>
    </main>
  );
}
