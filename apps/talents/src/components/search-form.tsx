import { Search } from "lucide-react";

type SearchFormProps = {
  defaultValue?: string;
  compact?: boolean;
};

export function SearchForm({ defaultValue = "", compact = false }: SearchFormProps) {
  return (
    <form
      action="/talents"
      role="search"
      className={`flex w-full border border-graphite/40 bg-white ${compact ? "min-h-12" : "min-h-14 sm:min-h-16"}`}
    >
      <label htmlFor={compact ? "directory-search" : "hero-search"} className="sr-only">
        Search talent by name, skill, or location
      </label>
      <Search aria-hidden="true" className="ml-4 self-center text-violet" size={20} />
      <input
        id={compact ? "directory-search" : "hero-search"}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search skill or location"
        className="min-w-0 flex-1 bg-transparent px-3 text-sm text-obsidian outline-none placeholder:text-graphite/55 sm:text-base"
      />
      <button
        type="submit"
        className="m-1.5 shrink-0 bg-violet px-4 text-xs font-bold uppercase tracking-[0.12em] text-ivory transition-colors hover:bg-violet-deep motion-reduce:transition-none sm:px-6"
      >
        Search
      </button>
    </form>
  );
}
