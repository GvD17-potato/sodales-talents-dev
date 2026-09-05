import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import type { PublicTalent } from "@/features/talents/types";

export function DirectoryTalentCard({ talent }: { talent: PublicTalent }) {
  return (
    <Link
      href={`/talents/${talent.slug}`}
      className="group block border-t border-graphite/25 px-1 py-7 transition-colors hover:bg-white/55 focus-visible:bg-white/55 motion-reduce:transition-none sm:px-3"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-violet">
          {talent.category.name}
        </span>
        <MapPin aria-hidden="true" size={17} className="text-graphite/55" />
      </div>

      <div className="mt-6">
        <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-obsidian sm:text-4xl">
          {talent.displayName}
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-graphite">{talent.headline}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {talent.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="border border-graphite/20 px-2.5 py-1 text-[11px] text-graphite">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-graphite">
        <span>{talent.location}</span>
        <ArrowUpRight aria-hidden="true" size={18} className="group-hover:text-violet" />
      </div>
    </Link>
  );
}
