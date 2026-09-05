"use client";

import { Button } from "@sodales/ui/button";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WRAP } from "@/lib/layout";
import { BrandWordmark } from "./brand-wordmark";
import { TransitionLink } from "./transition-shell";

const navigation = [
  { href: "/talents", label: "Find talent" },
  { href: "/#how-it-works", label: "How it works" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ivory/95 backdrop-blur-[18px]">
      <div className={`flex min-h-[72px] items-center justify-between gap-7 sm:min-h-20 lg:min-h-24 ${WRAP}`}>
        <TransitionLink href="/" aria-label="Sodales Talents home">
          <BrandWordmark compact />
        </TransitionLink>

        <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <TransitionLink
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className="text-sm text-graphite transition-colors hover:text-violet aria-[current=page]:text-violet motion-reduce:transition-none"
            >
              {item.label}
            </TransitionLink>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <TransitionLink
            href="/login"
            className="hidden text-sm text-graphite transition-colors hover:text-violet motion-reduce:transition-none sm:inline-block"
          >
            Sign in
          </TransitionLink>
          <Button asChild className="hidden sm:inline-flex">
            <TransitionLink href="/sign-up">
              Join as a talent <ArrowUpRight aria-hidden="true" size={17} />
            </TransitionLink>
          </Button>

          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex size-11 items-center justify-center border border-border bg-transparent text-obsidian md:hidden"
          >
            {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-border bg-ivory px-5 py-3 md:hidden">
          {[...navigation, { href: "/login", label: "Sign in" }, { href: "/sign-up", label: "Join as a talent" }].map(
            (item) => (
              <TransitionLink
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className="flex min-h-12 items-center border-b border-border text-sm text-graphite last:border-b-0 aria-[current=page]:text-violet"
              >
                {item.label}
              </TransitionLink>
            ),
          )}
        </nav>
      ) : null}
    </header>
  );
}
