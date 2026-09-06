import { Button } from "@sodales/ui/button";
import { StatusBadge } from "@sodales/ui/status-badge";
import { ArrowUpRight, Check, Circle } from "lucide-react";
import Link from "next/link";
import { ProfileReviewAction } from "@/components/profile-review-action";
import { getTalentProfileWorkspace } from "@/features/talents/profile-editor";
import { requireRole } from "@/lib/auth/session";

export default async function DashboardPage() {
  const currentUser = await requireRole("talent", "admin");

  if (currentUser.role === "admin") {
    return (
      <section aria-labelledby="dashboard-heading" className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">Admin account</p>
        <h1 id="dashboard-heading" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Talent workspace access
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-graphite">
          Profile editing is limited to talent-owned accounts. Continue to the admin workspace for moderation operations.
        </p>
        <Button asChild className="mt-8"><Link href="/admin">Open admin workspace</Link></Button>
      </section>
    );
  }

  const workspace = await getTalentProfileWorkspace(currentUser.id);
  if (!workspace) throw new Error("Talent profile workspace not found.");
  const firstName = currentUser.name?.trim().split(/\s+/)[0] || workspace.values.displayName;
  const completedCount = workspace.requirements.filter((item) => item.complete).length;

  return (
    <div className="space-y-10">
      <section aria-labelledby="dashboard-heading" className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">Talent overview</p>
          <h1 id="dashboard-heading" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Hello, {firstName}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-graphite">
            Manage the profile that represents your work across the Sodales talent directory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-graphite">Profile status</span>
          <StatusBadge status={workspace.status} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section aria-labelledby="readiness-heading" className="border border-border p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">Publication gate</p>
              <h2 id="readiness-heading" className="mt-3 font-display text-2xl font-semibold tracking-[-0.035em]">Profile readiness</h2>
            </div>
            <p className="text-sm text-graphite">{completedCount}/{workspace.requirements.length} complete</p>
          </div>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {workspace.requirements.map((requirement) => (
              <li key={requirement.key} className="flex items-start gap-3 text-sm leading-6">
                {requirement.complete ? (
                  <Check aria-hidden="true" className="mt-1 shrink-0 text-emerald-700" size={16} />
                ) : (
                  <Circle aria-hidden="true" className="mt-1 shrink-0 text-graphite/50" size={16} />
                )}
                <span className={requirement.complete ? "text-obsidian" : "text-graphite"}>{requirement.label}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="secondary"><Link href="/dashboard/profile">Edit profile</Link></Button>
            {workspace.status === "approved" ? (
              <Button asChild variant="quiet"><Link href={`/talents/${workspace.values.slug}`}>View public profile <ArrowUpRight aria-hidden="true" size={16} /></Link></Button>
            ) : null}
          </div>
        </section>

        <aside aria-labelledby="review-heading" className="border border-border p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">Moderation</p>
          <h2 id="review-heading" className="mt-3 font-display text-2xl font-semibold tracking-[-0.035em]">Review status</h2>
          <p className="mt-4 text-sm leading-6 text-graphite">
            {workspace.status === "hidden"
              ? "This profile remains hidden while you edit. Resubmission is always explicit."
              : workspace.status === "draft"
                ? "Save freely, then submit when every publication requirement is complete."
                : workspace.status === "pending"
                  ? "No-op saves preserve review. Any actual saved change withdraws the submission to draft."
                  : "Your profile is public. Material saved changes require a new review."}
          </p>
          <div className="mt-7">
            <ProfileReviewAction status={workspace.status} publicationComplete={workspace.publicationComplete} />
          </div>
        </aside>
      </div>

      <section aria-labelledby="profile-summary-heading" className="border-t border-border pt-8">
        <h2 id="profile-summary-heading" className="font-display text-2xl font-semibold tracking-[-0.035em]">Current profile</h2>
        <dl className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-3">
          <div className="bg-ivory p-5"><dt className="text-xs uppercase tracking-[0.14em] text-graphite">Category</dt><dd className="mt-2 text-sm font-medium">{workspace.categoryName ?? "Not selected"}</dd></div>
          <div className="bg-ivory p-5"><dt className="text-xs uppercase tracking-[0.14em] text-graphite">Skills</dt><dd className="mt-2 text-sm font-medium">{workspace.values.skills.length}</dd></div>
          <div className="bg-ivory p-5"><dt className="text-xs uppercase tracking-[0.14em] text-graphite">Portfolio links</dt><dd className="mt-2 text-sm font-medium">{workspace.values.links.length}</dd></div>
        </dl>
      </section>
    </div>
  );
}
