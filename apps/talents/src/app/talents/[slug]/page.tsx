import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryDialog } from "@/components/inquiry-dialog";
import { WRAP } from "@/lib/layout";
import {
  getApprovedTalentBySlug,
  listApprovedTalents,
} from "@/features/talents/queries";

type TalentProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const talents = await listApprovedTalents();
  return talents.map((talent) => ({ slug: talent.slug }));
}

export async function generateMetadata({ params }: TalentProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const talent = await getApprovedTalentBySlug(slug);
  if (!talent) return { title: "Profile not found" };

  return {
    title: `${talent.displayName} — ${talent.headline}`,
    description: talent.bio.slice(0, 155),
    openGraph: {
      title: `${talent.displayName} | Sodales Talents`,
      description: talent.bio.slice(0, 155),
    },
  };
}

export default async function TalentProfilePage({ params }: TalentProfilePageProps) {
  const { slug } = await params;
  const talent = await getApprovedTalentBySlug(slug);
  if (!talent) notFound();

  return (
    <main id="main-content">
      <div className={`py-8 sm:py-10 ${WRAP}`}>
        <Link href="/talents" className="inline-flex items-center gap-2.5 text-[13px] text-violet">
          <ArrowLeft aria-hidden="true" size={16} /> The collective
        </Link>

        <div className="mt-9 flex flex-col gap-8 border-b border-graphite/40 pb-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
              {talent.category.name} / Independent creative
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.8125rem,5.5vw,4.75rem)] font-semibold leading-[1.06] tracking-[-0.055em]">
              {talent.displayName}
            </h1>
            <p className="mt-4 max-w-[640px] text-2xl leading-[1.4] text-graphite">{talent.headline}</p>
            <p className="mt-6 flex flex-wrap items-center gap-2.5 text-[13px] text-graphite">
              <MapPin aria-hidden="true" size={16} className="text-violet" />
              {talent.location}
              <span className="ml-3.5">Member since {talent.memberSince}</span>
            </p>
          </div>
          <div className="shrink-0">
            <InquiryDialog talentName={talent.displayName} />
          </div>
        </div>

        <div className="grid gap-14 pt-12 lg:grid-cols-[1.5fr_1fr] lg:gap-24">
          <section aria-labelledby="about-heading">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">01 / About</p>
            <h2 id="about-heading" className="mt-4 font-display text-[34px] font-semibold tracking-[-0.03em]">
              A little perspective.
            </h2>
            <p className="my-7 max-w-3xl whitespace-pre-wrap text-lg leading-[1.9] text-graphite">
              {talent.bio}
            </p>

            <p className="mt-11 text-xs font-semibold uppercase tracking-[0.18em] text-violet">
              02 / Selected work
            </p>
            <h2 className="mt-4 font-display text-[34px] font-semibold tracking-[-0.03em]">See the work.</h2>
            {talent.portfolioLinks.length ? (
              <ul className="mt-5 border-b border-graphite/40">
                {talent.portfolioLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-5 border-t border-graphite/40 py-5 text-[15px] text-violet"
                    >
                      {link.label}
                      <ArrowUpRight aria-hidden="true" size={19} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-graphite/70">Portfolio links will appear here when added.</p>
            )}
          </section>

          <aside aria-labelledby="skills-heading">
            <p id="skills-heading" className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
              Expertise
            </p>
            <ul className="my-6 flex flex-wrap gap-2.5">
              {talent.skills.map((skill) => (
                <li key={skill} className="border border-graphite/35 px-3 py-[7px] text-[13px] text-graphite">
                  {skill}
                </li>
              ))}
            </ul>
            <div className="mt-9 border-t border-graphite/40 pt-7">
              <h3 className="font-display text-2xl font-semibold tracking-[-0.03em]">
                Have something in mind?
              </h3>
              <p className="my-3 text-[15px] leading-[1.8] text-graphite">
                Share the idea with Sodales. Our team reviews every brief and
                coordinates the next step.
              </p>
              <InquiryDialog talentName={talent.displayName} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
