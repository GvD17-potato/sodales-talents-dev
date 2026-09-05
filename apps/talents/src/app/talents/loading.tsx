export default function TalentsLoading() {
  return (
    <main id="main-content" aria-busy="true" className="mx-auto min-h-[70vh] max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="sr-only">Loading the approved talent directory.</p>
      <div className="h-4 w-36 animate-pulse bg-violet-soft motion-reduce:animate-none" />
      <div className="mt-6 h-16 max-w-2xl animate-pulse bg-graphite/10 motion-reduce:animate-none" />
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-80 animate-pulse border border-border bg-white/45 motion-reduce:animate-none" />
        ))}
      </div>
    </main>
  );
}
