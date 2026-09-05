import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { PublicTalent } from "@/features/talents/types";

export function TalentRow({ talent, index }: { talent: PublicTalent; index?: number }) {
  return (
    <Link
      href={`/talents/${talent.slug}`}
      className="group grid gap-5 border-t border-graphite/25 px-1 py-7 transition-colors hover:bg-white/55 focus-visible:bg-white/55 motion-reduce:transition-none sm:grid-cols-[44px_1.25fr_1fr_auto] sm:items-center sm:gap-6 sm:px-3"
    >
      <span className="text-xs font-semibold tracking-[0.16em] text-violet">
        {String((index ?? 0) + 1).padStart(2, "0")}
      </span>
      <span>
        <span className="block font-display text-2xl font-semibold tracking-[-0.03em] text-obsidian sm:text-3xl">
          {talent.displayName}
        </span>
        <span className="mt-2 block max-w-xl text-sm leading-6 text-graphite">
          {talent.headline}
        </span>
      </span>
      <span className="flex flex-wrap gap-2">
        {talent.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="border border-graphite/20 bg-ivory px-2.5 py-1 text-[11px] font-medium text-graphite"
          >
            {skill}
          </span>
        ))}
      </span>
      <span className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.12em] text-graphite group-hover:text-violet sm:block">
        <span className="sm:sr-only">View profile</span>
        <ArrowUpRight aria-hidden="true" size={20} />
      </span>
    </Link>
  );
}
