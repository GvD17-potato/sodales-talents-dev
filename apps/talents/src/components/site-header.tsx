"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandWordmark } from "./brand-wordmark";
import { TransitionLink } from "./transition-shell";

const navigation = [
  { href: "/talents", label: "Find talent" },
  { href: "/sign-up", label: "Join as talent" },
  { href: "/login", label: "Sign in" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ivory/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <TransitionLink href="/" aria-label="Sodales Talents home">
          <BrandWordmark compact />
        </TransitionLink>

        <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <TransitionLink
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className="border-b border-transparent py-2 text-xs font-semibold uppercase tracking-[0.14em] text-graphite transition-colors hover:border-violet hover:text-violet aria-[current=page]:border-violet aria-[current=page]:text-violet motion-reduce:transition-none"
            >
              {item.label}
            </TransitionLink>
          ))}
        </nav>

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

      {menuOpen ? (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-border bg-ivory px-4 py-3 md:hidden"
        >
          {navigation.map((item) => (
            <TransitionLink
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className="flex min-h-12 items-center justify-between border-b border-border text-sm font-semibold uppercase tracking-[0.12em] text-graphite last:border-b-0 aria-[current=page]:text-violet"
            >
              {item.label}
              <span aria-hidden="true">↗</span>
            </TransitionLink>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
