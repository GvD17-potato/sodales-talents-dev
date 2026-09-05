import { BrandWordmark } from "./brand-wordmark";
import { TransitionLink } from "./transition-shell";

export function SiteFooter() {
  return (
    <footer className="bg-obsidian text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-8 lg:py-16">
        <div>
          <div className="inline-flex bg-white px-3 py-2">
            <BrandWordmark compact />
          </div>
          <p className="mt-5 max-w-md text-sm leading-6 text-ivory/65">
            A curated marketplace connecting ambitious projects with independent
            creative talent.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <TransitionLink href="/talents" className="hover:text-violet-accessible">
            Browse talent
          </TransitionLink>
          <TransitionLink href="/sign-up" className="hover:text-violet-accessible">
            Join the collective
          </TransitionLink>
          <a href="https://sodales.com" className="hover:text-violet-accessible">
            Sodales
          </a>
        </nav>

        <div className="border-t border-white/15 pt-5 text-[11px] uppercase tracking-[0.16em] text-ivory/50 md:col-span-2 md:flex md:items-center md:justify-between">
          <p>© 2026 Sodales</p>
          <p className="mt-2 md:mt-0">Testing preview · fixture data</p>
        </div>
      </div>
    </footer>
  );
}
