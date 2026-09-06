import { requireRole } from "@/lib/auth/session";

export default async function DashboardProfilePage() {
  await requireRole("talent");

  return (
    <section aria-labelledby="profile-foundation-heading" className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
        Talent only
      </p>
      <h1 id="profile-foundation-heading" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
        Profile workspace
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-graphite">
        This authenticated route is ready. The real profile editor is intentionally
        deferred and no fixture or browser-local profile state is used here.
      </p>
    </section>
  );
}
