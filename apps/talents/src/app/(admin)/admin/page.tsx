export default function AdminPage() {
  return (
    <section aria-labelledby="admin-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
        Authorized administration
      </p>
      <h1 id="admin-heading" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
        Admin foundation
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-graphite">
        Server-enforced admin access is active. Moderation and inquiry functionality
        are intentionally deferred.
      </p>
    </section>
  );
}
