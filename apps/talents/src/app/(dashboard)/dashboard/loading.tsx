export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-8">
      <span className="sr-only">Loading talent workspace</span>
      <div className="h-4 w-28 animate-pulse bg-border motion-reduce:animate-none" />
      <div className="h-12 max-w-xl animate-pulse bg-border motion-reduce:animate-none" />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="h-72 animate-pulse border border-border bg-white/30 motion-reduce:animate-none" />
        <div className="h-72 animate-pulse border border-border bg-white/30 motion-reduce:animate-none" />
      </div>
    </div>
  );
}
