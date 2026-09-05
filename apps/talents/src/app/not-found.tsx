import { Button } from "@sodales/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-[68vh] place-items-center px-4 py-16 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">404 · Not found</p>
        <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">
          This profile is not public.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-graphite/70">
          The page may have moved, or the profile may not currently be approved
          for the public directory.
        </p>
        <Button asChild className="mt-8">
          <Link href="/talents">Browse approved talent</Link>
        </Button>
      </div>
    </main>
  );
}
