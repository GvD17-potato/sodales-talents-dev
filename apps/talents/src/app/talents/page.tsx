import type { Metadata } from "next";
import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { TalentProfileRow } from "@/components/talent-profile-row";
import { WRAP } from "@/lib/layout";
import {
  listApprovedTalents,
  listTalentCategories,
} from "@/features/talents/queries";

export const metadata: Metadata = {
  title: "Creative talent directory",
  description:
    "Browse approved independent creative talent across design, development, photography, writing, video, and music.",
};

export const dynamic = "force-dynamic";

type DirectoryPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function TalentsPage({ searchParams }: DirectoryPageProps) {
  const requested = await searchParams;
  const requestedCategory = requested.category?.trim().toLocaleLowerCase();
  const query = requested.q?.trim() ?? "";
  const [categories, talents] = await Promise.all([
    listTalentCategories(),
    listApprovedTalents({ q: query, category: requestedCategory }),
  ]);
  const selectedCategory = categories.find(
    (category) => category.slug === requestedCategory,
  );
  const allTalentCount = categories.reduce(
    (total, category) => total + category.approvedTalentCount,
    0,
  );

  return (
    <main id="main-content" className="min-h-[70vh]">
      <header className={`border-b border-border py-12 sm:py-16 ${WRAP}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
          The creative directory
        </p>
        <h1 className="mt-5 font-display text-[clamp(2.8125rem,5.5vw,4.75rem)] font-semibold leading-[1.06] tracking-[-0.055em]">
          Find your people.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-graphite">
          Independent talent. A shared commitment to good work.
        </p>
        <div className="mt-9 max-w-3xl">
          <SearchForm defaultValue={query} />
        </div>
      </header>

      <div className={`grid gap-10 py-10 sm:py-14 lg:grid-cols-[200px_1fr] ${WRAP}`}>
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start" aria-label="Filter by discipline">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-graphite/65">
            Disciplines
          </p>
          <nav className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-5 lg:mx-0 lg:block lg:overflow-visible lg:px-0">
            <Link
              href={query ? `/talents?q=${encodeURIComponent(query)}` : "/talents"}
              aria-current={!selectedCategory ? "page" : undefined}
              className="flex shrink-0 items-center justify-between gap-4 border-b border-graphite/25 py-3 text-sm text-graphite transition-colors hover:text-violet aria-[current=page]:border-violet aria-[current=page]:font-semibold aria-[current=page]:text-violet motion-reduce:transition-none lg:w-full"
            >
              All
              <span className="text-xs text-graphite/60">{allTalentCount}</span>
            </Link>
            {categories.map((category) => {
              const params = new URLSearchParams();
              if (query) params.set("q", query);
              params.set("category", category.slug);
              return (
                <Link
                  key={category.id}
                  href={`/talents?${params.toString()}`}
                  aria-current={selectedCategory?.slug === category.slug ? "page" : undefined}
                  className="flex shrink-0 items-center justify-between gap-4 border-b border-graphite/25 py-3 text-sm text-graphite transition-colors hover:text-violet aria-[current=page]:border-violet aria-[current=page]:font-semibold aria-[current=page]:text-violet motion-reduce:transition-none lg:w-full"
                >
                  {category.name}
                  <span className="text-xs text-graphite/60">{category.approvedTalentCount}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0" aria-labelledby="results-heading">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-5">
            <p id="results-heading" aria-live="polite" className="text-sm text-graphite">
              {talents.length} {talents.length === 1 ? "creative" : "creatives"}
              {selectedCategory ? ` in ${selectedCategory.name}` : ""}
              {query ? ` matching "${query}"` : ""}
            </p>
            <p className="hidden text-[9px] font-semibold uppercase tracking-[0.15em] text-graphite/60 sm:block">
              The curated collective
            </p>
          </div>

          {talents.length ? (
            <div className="grid gap-x-7 xl:grid-cols-2">
              {talents.map((talent, index) => (
                <TalentProfileRow key={talent.id} talent={talent} index={index} dense />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[45vh] flex-col items-center justify-center gap-5 px-6 py-20 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet">No matches</p>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.04em]">No matches just yet.</h2>
              <p className="max-w-md text-sm leading-6 text-graphite/70">
                Try a different skill, name, or discipline.
              </p>
              <Link
                href="/talents"
                className="mt-2 inline-flex min-h-11 items-center justify-center border border-obsidian px-5 text-sm font-semibold text-obsidian hover:bg-obsidian hover:text-ivory"
              >
                Clear filters
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
