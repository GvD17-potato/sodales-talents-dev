import Image from "next/image";

type BrandWordmarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandWordmark({
  compact = false,
  className = "",
}: BrandWordmarkProps) {
  return (
    <span
      aria-label="Sodales Talents"
      className={`inline-flex shrink-0 items-center ${compact ? "gap-1.5" : "gap-2.5"} ${className}`}
    >
      <span className="inline-flex shrink-0 items-center bg-white px-1 py-0.5">
        <Image
          src="/media/sodales-wordmark-horizontal.png"
          alt=""
          aria-hidden="true"
          width={456}
          height={100}
          priority
          className={compact ? "h-auto w-[112px] sm:w-[130px]" : "h-auto w-[138px] sm:w-[164px]"}
        />
      </span>
      <span aria-hidden="true" className="text-graphite/45">
        |
      </span>
      <span
        aria-hidden="true"
        className={`font-sans font-semibold uppercase text-violet ${compact ? "text-[10px] tracking-[0.16em] sm:text-[11px]" : "text-[11px] tracking-[0.2em] sm:text-xs"}`}
      >
        Talents
      </span>
    </span>
  );
}
