import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryDialog } from "@/components/inquiry-dialog";
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
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/talents" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-graphite hover:text-violet">
            <ArrowLeft aria-hidden="true" size={16} /> Back to directory
          </Link>

          <div className="mt-12 grid gap-10 pb-5 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
                {talent.category.name}
              </p>
              <h1 className="mt-5 max-w-5xl font-display text-[clamp(3.5rem,9vw,8.5rem)] font-semibold leading-[0.84] tracking-[-0.07em]">
                {talent.displayName}
              </h1>
              <p className="mt-8 max-w-3xl font-display text-2xl font-medium leading-8 tracking-[-0.025em] text-graphite sm:text-3xl sm:leading-10">
                {talent.headline}
              </p>
            </div>
            <div className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="flex items-center gap-2 text-sm text-graphite">
                <MapPin aria-hidden="true" size={17} className="text-violet" />
                {talent.location}
              </p>
              <p className="mt-3 text-sm text-graphite/65">Member since {talent.memberSince}</p>
              <div className="mt-6">
                <InquiryDialog talentName={talent.displayName} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.65fr] lg:gap-20 lg:px-8 lg:py-24">
        <section aria-labelledby="about-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">Profile</p>
          <h2 id="about-heading" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em]">About</h2>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-graphite">{talent.bio}</p>

          <div className="mt-14">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">Selected links</h2>
            <ul className="mt-5 border-b border-border">
              {talent.portfolioLinks.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-5 border-t border-border py-5 font-display text-xl font-semibold tracking-[-0.02em] hover:text-violet sm:text-2xl">
                    {link.label}
                    <ArrowUpRight aria-hidden="true" size={20} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside aria-labelledby="skills-heading" className="border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <h2 id="skills-heading" className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">Skills</h2>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {talent.skills.map((skill) => (
              <li key={skill} className="border border-graphite/25 bg-white/35 px-3 py-2 text-sm text-graphite">
                {skill}
              </li>
            ))}
          </ul>
          <div className="mt-12 bg-violet-deep p-6 text-ivory sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-accessible">Have a project in mind?</p>
            <p className="mt-4 font-display text-2xl font-semibold leading-8 tracking-[-0.03em]">
              Share the context. Sodales will review the fit.
            </p>
            <div className="mt-6">
              <InquiryDialog talentName={talent.displayName} />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
