import type { Metadata } from "next";
import Link from "next/link";
import { DirectoryTalentCard } from "@/components/directory-talent-card";
import { SearchForm } from "@/components/search-form";
import {
  listApprovedTalents,
  listTalentCategories,
} from "@/features/talents/queries";

export const metadata: Metadata = {
  title: "Creative talent directory",
  description:
    "Browse approved independent creative talent across design, development, photography, writing, video, and music.",
};

type DirectoryPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function TalentsPage({ searchParams }: DirectoryPageProps) {
  const requested = await searchParams;
  const categories = await listTalentCategories();
  const selectedCategory = categories.find(
    (category) => category.slug === requested.category,
  );
  const query = requested.q?.trim() ?? "";
  const talents = await listApprovedTalents({
    q: query,
    category: selectedCategory?.slug,
  });

  return (
    <main id="main-content" className="min-h-[70vh]">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
            Talent directory
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <h1 className="font-display text-5xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-7xl">
                Independent minds, carefully selected.
              </h1>
            </div>
            <div>
              <p className="mb-5 max-w-xl text-sm leading-6 text-graphite/75">
                Search by name, skill, discipline, or location. Every profile
                shown here has been approved for the public directory.
              </p>
              <SearchForm defaultValue={query} compact />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-10 lg:px-8 lg:py-14">
        <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Filter by discipline">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-graphite/65">
            Discipline
          </p>
          <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-5 lg:mx-0 lg:block lg:overflow-visible lg:px-0">
            <Link
              href={query ? `/talents?q=${encodeURIComponent(query)}` : "/talents"}
              aria-current={!selectedCategory ? "page" : undefined}
              className="block shrink-0 border border-graphite/25 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:border-violet hover:text-violet aria-[current=page]:border-violet aria-[current=page]:bg-violet aria-[current=page]:text-ivory motion-reduce:transition-none lg:mb-2 lg:w-full"
            >
              All
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
                  className="block shrink-0 border border-graphite/25 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:border-violet hover:text-violet aria-[current=page]:border-violet aria-[current=page]:bg-violet aria-[current=page]:text-ivory motion-reduce:transition-none lg:mb-2 lg:w-full"
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section aria-labelledby="results-heading" className="mt-5 lg:mt-0">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
            <div>
              <p id="results-heading" className="text-xs font-semibold uppercase tracking-[0.15em] text-graphite/65">
                {selectedCategory ? selectedCategory.name : "All disciplines"}
              </p>
              <p aria-live="polite" className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">
                {talents.length} {talents.length === 1 ? "profile" : "profiles"}
              </p>
            </div>
            {query || selectedCategory ? (
              <Link href="/talents" className="text-sm font-semibold text-violet hover:underline">
                Clear filters
              </Link>
            ) : null}
          </div>

          {talents.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {talents.map((talent) => (
                <DirectoryTalentCard key={talent.id} talent={talent} />
              ))}
            </div>
          ) : (
            <div className="border border-border px-6 py-16 text-center sm:px-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet">No matches</p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em]">Try a broader search.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-graphite/70">
                Clear a filter or search for a related capability, discipline,
                or location.
              </p>
              <Link href="/talents" className="mt-7 inline-block border-b border-obsidian pb-1 text-sm font-semibold hover:border-violet hover:text-violet">
                View all talent
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
