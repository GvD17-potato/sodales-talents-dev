import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import type { PublicTalent } from "@/features/talents/types";

// Astra's `ProfileRow` — the single editorial row design used both for the
// homepage's featured talent and the full directory (directory uses the
// `dense` variant: a slightly smaller heading and tighter grid gap).
export function TalentProfileRow({
  talent,
  index,
  dense = false,
}: {
  talent: PublicTalent;
  index: number;
  dense?: boolean;
}) {
  return (
    <Link href={`/talents/${talent.slug}`} className="group block border-t border-graphite/40 py-7 pb-6">
      <div className="mb-[22px] flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-violet">
          {talent.category.name}
        </span>
        <span className="text-xs text-graphite/60">{String(index + 1).padStart(2, "0")}</span>
      </div>

      <h3
        className={`flex items-center justify-between gap-4 font-display font-semibold tracking-[-0.03em] text-obsidian transition-colors group-hover:text-violet ${
          dense ? "text-2xl sm:text-[26px]" : "text-2xl sm:text-[30px]"
        }`}
      >
        {talent.displayName}
        <ArrowUpRight aria-hidden="true" size={20} className="shrink-0" />
      </h3>

      <p className="mb-6 mt-[7px] max-w-xl text-sm text-graphite">{talent.headline}</p>

      <div className="flex flex-wrap gap-[7px]">
        {talent.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="border border-graphite/35 px-2.5 py-1 text-[10px] text-graphite/80">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-[26px] flex items-center justify-between gap-3 text-[11px] text-graphite/70">
        <span className="flex items-center gap-[7px]">
          <MapPin aria-hidden="true" size={14} />
          {talent.location}
        </span>
        <span className="flex items-center gap-[7px] text-graphite">
          View profile <ArrowRight aria-hidden="true" size={15} />
        </span>
      </div>
    </Link>
  );
}
