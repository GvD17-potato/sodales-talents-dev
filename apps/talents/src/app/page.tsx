import { Button } from "@sodales/ui/button";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { TalentProfileRow } from "@/components/talent-profile-row";
import { TransitionLink } from "@/components/transition-shell";
import { WRAP } from "@/lib/layout";
import {
  getPublicProofCounts,
  listApprovedTalents,
  listTalentCategories,
} from "@/features/talents/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, talents, counts] = await Promise.all([
    listTalentCategories(),
    listApprovedTalents({ limit: 4 }),
    getPublicProofCounts(),
  ]);

  const popularSearches = categories.slice(0, 3);

  return (
    <main id="main-content">
      <section className="border-b border-border pt-8 sm:pt-10 lg:pt-16">
        <div className={`grid gap-0 min-[1100px]:grid-cols-[1.05fr_1fr] min-[1100px]:gap-14 ${WRAP}`}>
          <div className="pt-4">
            <p className="mb-7 flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-violet">
              <span aria-hidden="true" className="mr-3 inline-block h-0.5 w-6 bg-violet" />
              Curated creative talent
            </p>
            <h1 className="max-w-4xl font-display text-[clamp(3.75rem,6.45vw,6rem)] font-semibold leading-[1.035] tracking-[-0.065em] text-obsidian">
              Find the <span className="text-violet">right mind</span> for the work that
              matters.
            </h1>
            <div className="mt-8 flex items-center justify-between gap-5">
              <p className="max-w-md text-base leading-[1.8] text-graphite">
                Independent designers, developers, photographers, writers,
                filmmakers, and musicians—curated by Sodales for ambitious
                projects.
              </p>
              <a
                href="#discover"
                aria-label="Explore the collective"
                className="hidden size-[54px] shrink-0 place-items-center rounded-full border border-graphite/30 -rotate-45 transition-colors hover:bg-violet-soft sm:grid"
              >
                <ArrowRight aria-hidden="true" className="rotate-45" />
              </a>
            </div>
          </div>

          <figure className="relative min-w-0 pb-8">
            <Image
              src="/media/testing/talents-studio-hero.png"
              alt=""
              aria-hidden="true"
              width={1448}
              height={1086}
              priority
              fetchPriority="high"
              className="h-[280px] w-full object-cover sm:h-[380px] min-[1100px]:h-[418px]"
            />
            <span className="absolute left-4 top-4 bg-ivory px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-graphite">
              Astra design reference — testing only
            </span>
            <figcaption className="flex items-center justify-between pt-3 text-[10px] tracking-[0.08em] text-graphite/70">
              <span>TEMPORARY VISUAL REFERENCE</span>
              <span className="flex items-center gap-3 text-[11px] tracking-normal">
                Not final photography <ArrowUpRight aria-hidden="true" size={14} />
              </span>
            </figcaption>
          </figure>

          <div className="min-[1100px]:col-span-2">
            <SearchForm />
            <div className="mt-4 flex flex-wrap items-center gap-6 text-[11px]">
              <span className="text-[9px] font-semibold tracking-[0.14em] text-graphite/60">
                POPULAR SEARCHES
              </span>
              {popularSearches.map((category) => (
                <Link
                  key={category.id}
                  href={`/talents?category=${category.slug}`}
                  className="flex items-center gap-2 text-graphite/80 hover:text-violet"
                >
                  {category.name}
                  <ArrowUpRight aria-hidden="true" size={12} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="proof-heading" className="border-b border-t border-border">
        <div className={`grid grid-cols-2 py-7 sm:grid-cols-4 ${WRAP}`}>
          {[
            [String(counts.talents).padStart(2, "0"), "Approved talent"],
            [String(counts.categories).padStart(2, "0"), "Creative disciplines"],
            [String(counts.skills), "Distinct skills"],
            [String(counts.cities).padStart(2, "0"), "Locations"],
          ].map(([value, label], index) => (
            <div
              key={label}
              className={`flex flex-col border-graphite/20 px-5 first:pl-0 sm:border-r sm:px-9 sm:last:border-r-0 ${
                index >= 2 ? "mt-6 sm:mt-0" : ""
              }`}
            >
              <strong className="mb-2 font-display text-4xl font-medium tracking-[-0.06em] text-obsidian">
                {value}
                <span aria-hidden="true" className="ml-3 align-top text-lg text-violet">
                  ↗
                </span>
              </strong>
              <span id={index === 0 ? "proof-heading" : undefined} className="text-[9px] font-semibold uppercase tracking-[0.15em] text-graphite/70">
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="sr-only">
          <ArrowDown aria-hidden="true" />
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="border-b border-border" id="discover">
        <div className={`grid gap-9 py-16 sm:py-20 md:grid-cols-[0.7fr_1.3fr] md:gap-16 lg:py-24 ${WRAP}`}>
          <div className="flex items-start justify-between gap-8 md:block">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
                01 / Find your people
              </p>
              <h2 id="categories-heading" className="mt-4 max-w-md font-display text-4xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-5xl">
                Start with the craft you need.
              </h2>
            </div>
            <p className="hidden max-w-[340px] text-sm leading-[1.8] text-graphite md:block">
              Six disciplines. Countless possibilities. Find the right mind
              for what you have in mind.
            </p>
          </div>
          <ol className="border-b border-graphite/40">
            {categories.map((category, index) => (
              <li key={category.id}>
                <Link
                  href={`/talents?category=${category.slug}`}
                  className="group grid grid-cols-[30px_1fr_auto_22px] items-center gap-4 border-t border-graphite/40 py-6 transition-[padding-left,color] duration-300 hover:pl-3 hover:text-violet motion-reduce:transition-none sm:grid-cols-[42px_1fr_85px_24px]"
                >
                  <span className="text-xs text-graphite/50">
                    0{index + 1}
                  </span>
                  <span>
                    <span className="block font-display text-2xl font-semibold tracking-[-0.04em] sm:text-[26px]">
                      {category.name}
                    </span>
                    <span className="mt-1 hidden text-[13px] text-graphite/75 sm:block">
                      {category.description}
                    </span>
                  </span>
                  <span className="hidden text-xs text-graphite/60 sm:block">
                    {category.approvedTalentCount} talent{category.approvedTalentCount === 1 ? "" : "s"}
                  </span>
                  <ArrowUpRight aria-hidden="true" className="text-graphite group-hover:text-violet" size={22} />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="featured-heading" className="border-b border-border bg-[#eae7e1]">
        <div className={`py-16 sm:py-20 lg:py-24 ${WRAP}`}>
          <div className="mb-11 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
                02 / The people behind the possibilities
              </p>
              <h2 id="featured-heading" className="mt-4 font-display text-4xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-5xl">
                Independent minds.
                <br />
                Remarkable potential.
              </h2>
            </div>
            <Button asChild variant="secondary" className="hidden sm:inline-flex">
              <TransitionLink href="/talents">
                Meet the collective <ArrowUpRight aria-hidden="true" size={17} />
              </TransitionLink>
            </Button>
          </div>
          {talents.length ? (
            <div className="grid gap-x-10 sm:grid-cols-2">
              {talents.map((talent, index) => (
                <TalentProfileRow key={talent.id} talent={talent} index={index} />
              ))}
            </div>
          ) : (
            <div className="border-y border-graphite/40 py-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet">
                The collective is being curated
              </p>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-graphite/70">
                Approved talent profiles will appear here as they join the directory.
              </p>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="process-heading">
        <div className={`py-16 sm:py-20 lg:py-24 ${WRAP}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
            03 / From hello to let&rsquo;s go
          </p>
          <h2 id="process-heading" className="mt-4 font-display text-4xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-5xl">
            Good work starts
            <br />
            with a conversation.
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-14">
            {[
              ["01", "Browse", "Explore approved talent by discipline, capability, or location."],
              ["02", "Inquire", "Share the project context with the Sodales review team."],
              ["03", "Collaborate", "If there is a fit, Sodales coordinates the next conversation."],
            ].map(([number, title, copy]) => (
              <li key={number}>
                <span className="font-display text-5xl font-normal leading-none tracking-[-0.06em] text-violet">
                  {number}
                </span>
                <h3 className="mt-6 border-t border-graphite/40 pt-6 font-display text-2xl font-semibold tracking-[-0.035em]">
                  {title}
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-[1.8] text-graphite/80">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-obsidian text-ivory">
        <div className={`flex flex-col items-start gap-9 py-16 sm:py-20 md:flex-row md:items-center md:justify-between lg:py-24 ${WRAP}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#aaa0d8]">
              Your next chapter starts here
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.06] tracking-[-0.055em] sm:text-6xl">
              You bring the talent.
              <br />
              We make the connection.
            </h2>
          </div>
          <Button asChild className="border-violet-accessible bg-violet-accessible text-obsidian hover:bg-violet-soft">
            <TransitionLink href="/sign-up">
              Find your place <ArrowUpRight aria-hidden="true" size={17} />
            </TransitionLink>
          </Button>
        </div>
      </section>
    </main>
  );
}
