import { requireRole } from "@/lib/auth/session";

export default async function DashboardPage() {
  const currentUser = await requireRole("talent", "admin");

  return (
    <section aria-labelledby="dashboard-heading" className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
        Account ready
      </p>
      <h1 id="dashboard-heading" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
        {currentUser.role === "admin" ? "Talent dashboard access" : "Your talent dashboard"}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-graphite">
        Authentication and application account provisioning are active. Profile
        editing and lifecycle controls arrive in a later backend phase.
      </p>
    </section>
  );
}
