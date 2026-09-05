import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import type { PublicTalent } from "@/features/talents/types";

export function DirectoryTalentCard({ talent }: { talent: PublicTalent }) {
  return (
    <article className="group relative flex min-h-[330px] flex-col border border-graphite/25 bg-ivory p-6 transition-colors hover:border-violet hover:bg-white/40 motion-reduce:transition-none sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-violet">
          {talent.category.name}
        </span>
        <MapPin aria-hidden="true" size={17} className="text-graphite/55" />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-obsidian sm:text-4xl">
          <Link href={`/talents/${talent.slug}`} className="after:absolute after:inset-0">
            {talent.displayName}
          </Link>
        </h2>
        <p className="mt-4 text-sm leading-6 text-graphite">{talent.headline}</p>
      </div>

      <div className="relative mt-auto pt-8">
        <div className="flex flex-wrap gap-2">
          {talent.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="border border-graphite/20 px-2.5 py-1 text-[11px] text-graphite">
              {skill}
            </span>
          ))}
        </div>
        <div className="mt-7 flex items-center justify-between border-t border-graphite/20 pt-4 text-xs font-semibold uppercase tracking-[0.12em] text-graphite">
          <span>{talent.location}</span>
          <ArrowUpRight aria-hidden="true" size={18} className="group-hover:text-violet" />
        </div>
      </div>
    </article>
  );
}
