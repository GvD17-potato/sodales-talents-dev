import { Button } from "@sodales/ui/button";
import { ArrowDown, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { TalentRow } from "@/components/talent-row";
import { TransitionLink } from "@/components/transition-shell";
import {
  getPublicProofCounts,
  listApprovedTalents,
  listTalentCategories,
} from "@/features/talents/queries";

export default async function HomePage() {
  const [categories, talents, counts] = await Promise.all([
    listTalentCategories(),
    listApprovedTalents(),
    getPublicProofCounts(),
  ]);

  return (
    <main id="main-content">
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 min-[1100px]:grid-cols-[1.12fr_0.88fr] min-[1100px]:items-stretch min-[1100px]:gap-14 min-[1100px]:px-8 min-[1100px]:py-20">
          <div className="flex flex-col justify-between">
            <div>
              <p className="mb-7 text-xs font-semibold uppercase tracking-[0.2em] text-violet">
                Curated creative talent
              </p>
              <h1 className="max-w-4xl font-display text-[clamp(3.1rem,7vw,6.9rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-obsidian">
                Find the right mind for the work that matters.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-graphite sm:text-lg sm:leading-8">
                Independent designers, developers, photographers, writers,
                filmmakers, and musicians—curated by Sodales for ambitious
                projects.
              </p>
            </div>

            <div className="mt-10 max-w-3xl">
              <SearchForm />
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Button asChild>
                  <TransitionLink href="/talents">
                    Browse all talent <ArrowRight aria-hidden="true" size={17} />
                  </TransitionLink>
                </Button>
                <TransitionLink
                  href="/sign-up"
                  className="min-h-11 border-b border-obsidian py-3 text-sm font-semibold text-obsidian transition-colors hover:border-violet hover:text-violet motion-reduce:transition-none"
                >
                  Join as a talent
                </TransitionLink>
              </div>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden bg-violet-deep sm:min-h-[480px] min-[1100px]:min-h-[640px]">
            <div className="absolute inset-x-0 top-0 flex items-center border-b border-white/20 px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/70">
              <span>Creative intelligence</span>
            </div>
            <div className="absolute inset-0 grid place-items-center px-10 pt-12">
              <div className="grid aspect-square w-[46%] max-w-[230px] place-items-center">
                <Image
                  src="/media/sodales-symbol-transparent.png"
                  alt=""
                  aria-hidden="true"
                  width={203}
                  height={203}
                  className="h-auto w-full"
                  priority
                />
              </div>
            </div>
            <p className="absolute bottom-5 left-5 max-w-[16rem] text-xs leading-5 text-ivory/65">
              Official Sodales symbol shown in the reserved editorial hero frame.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="proof-heading" className="border-b border-border bg-white/35">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-5">
            <h2 id="proof-heading" className="text-xs font-semibold uppercase tracking-[0.18em] text-graphite">
              Live collective
            </h2>
            <ArrowDown aria-hidden="true" size={18} className="text-violet" />
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
            {[
              ["Approved talent", counts.talents],
              ["Disciplines", counts.categories],
              ["Creative skills", counts.skills],
              ["Locations", counts.cities],
            ].map(([label, value]) => (
              <div key={label} className="bg-ivory p-5 sm:p-7">
                <dd className="font-display text-4xl font-semibold tracking-[-0.04em] text-obsidian sm:text-5xl">
                  {value}
                </dd>
                <dt className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-graphite/70">
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-9 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">Disciplines</p>
              <h2 id="categories-heading" className="mt-4 max-w-md font-display text-4xl font-semibold leading-[1] tracking-[-0.045em] sm:text-5xl">
                Start with the craft you need.
              </h2>
            </div>
            <ol className="border-b border-border">
              {categories.map((category, index) => (
                <li key={category.id}>
                  <Link
                    href={`/talents?category=${category.slug}`}
                    className="group grid grid-cols-[42px_1fr_auto] items-center gap-3 border-t border-border py-5 transition-colors hover:bg-white/50 motion-reduce:transition-none sm:px-3"
                  >
                    <span className="text-xs tracking-[0.14em] text-violet">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block font-display text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                        {category.name}
                      </span>
                      <span className="mt-1 hidden text-sm text-graphite/70 sm:block">
                        {category.description}
                      </span>
                    </span>
                    <ArrowRight aria-hidden="true" className="text-graphite group-hover:text-violet" size={19} />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="featured-heading" className="border-b border-border bg-white/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mb-10 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">Featured talent</p>
              <h2 id="featured-heading" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Proof of work, first.
              </h2>
            </div>
            <TransitionLink href="/talents" className="hidden text-sm font-semibold hover:text-violet sm:block">
              View directory →
            </TransitionLink>
          </div>
          <div className="border-b border-border">
            {talents.slice(0, 3).map((talent, index) => (
              <TalentRow key={talent.id} talent={talent} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="process-heading">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">How it works</p>
          <h2 id="process-heading" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            A considered way to collaborate.
          </h2>
          <ol className="mt-10 grid border-y border-border md:grid-cols-3">
            {[
              ["01", "Browse", "Explore approved talent by discipline, capability, or location."],
              ["02", "Inquire", "Share the project context with the Sodales review team."],
              ["03", "Collaborate", "If there is a fit, Sodales coordinates the next conversation."],
            ].map(([number, title, copy]) => (
              <li key={number} className="border-b border-border py-8 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
                <span className="text-xs font-semibold tracking-[0.16em] text-violet">{number}</span>
                <h3 className="mt-7 font-display text-3xl font-semibold tracking-[-0.035em]">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-graphite/75">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-obsidian text-ivory">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-9 px-4 py-16 sm:px-6 sm:py-20 md:flex-row md:items-end md:justify-between lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-accessible">For independent creatives</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1] tracking-[-0.045em] sm:text-6xl">
              Bring your best work into the collective.
            </h2>
          </div>
          <Button asChild className="border-violet-accessible bg-violet-accessible text-obsidian hover:bg-violet-soft">
            <TransitionLink href="/sign-up">Join as a talent</TransitionLink>
          </Button>
        </div>
      </section>
    </main>
  );
}
