export default function TalentProfileLoading() {
  return (
    <main id="main-content" aria-busy="true" className="mx-auto min-h-[70vh] max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="sr-only">Loading the approved talent profile.</p>
      <div className="h-4 w-32 animate-pulse bg-violet-soft motion-reduce:animate-none" />
      <div className="mt-10 h-28 max-w-4xl animate-pulse bg-graphite/10 motion-reduce:animate-none" />
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="h-64 animate-pulse bg-white/45 motion-reduce:animate-none" />
        <div className="h-64 animate-pulse bg-white/45 motion-reduce:animate-none" />
      </div>
    </main>
  );
}
