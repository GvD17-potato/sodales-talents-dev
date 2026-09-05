"use client";

import { RotateCcw } from "lucide-react";
import { WRAP } from "@/lib/layout";
import { BrandWordmark } from "./brand-wordmark";
import { TransitionLink, useEntranceReplay } from "./transition-shell";

export function SiteFooter() {
  const replay = useEntranceReplay();

  return (
    <footer className="border-t border-graphite bg-obsidian pb-6 pt-12 text-ivory">
      <div className={WRAP}>
        <div className="flex flex-wrap items-start justify-between gap-10 border-b border-white/15 pb-10">
          <div>
            <TransitionLink href="/" className="inline-flex bg-white px-3 py-2">
              <BrandWordmark compact />
            </TransitionLink>
            <p className="mt-5 max-w-xs text-sm leading-[1.65] text-ivory/65">
              Independent minds.
              <br />
              Shared ambition.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap gap-8 text-xs">
            <TransitionLink href="/talents" className="hover:text-violet-accessible">
              Find talent
            </TransitionLink>
            <TransitionLink href="/sign-up" className="hover:text-violet-accessible">
              Join the collective
            </TransitionLink>
            <TransitionLink href="/login" className="hover:text-violet-accessible">
              Sign in
            </TransitionLink>
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-[10px] text-ivory/60">
          <span>© 2026 Sodales. Made for what&rsquo;s next.</span>
          <span>Testing preview · fixture data</span>
          <button
            type="button"
            onClick={replay}
            className="flex items-center gap-2 text-violet-accessible hover:text-violet-soft"
          >
            <RotateCcw aria-hidden="true" size={13} />
            Replay entrance
          </button>
        </div>
      </div>
    </footer>
  );
}
