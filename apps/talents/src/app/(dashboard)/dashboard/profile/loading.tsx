export default function ProfileLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="mx-auto max-w-5xl space-y-8">
      <span className="sr-only">Loading profile editor</span>
      <div className="h-12 max-w-xl animate-pulse bg-border motion-reduce:animate-none" />
      <div className="h-96 animate-pulse border border-border bg-white/30 motion-reduce:animate-none" />
    </div>
  );
}
