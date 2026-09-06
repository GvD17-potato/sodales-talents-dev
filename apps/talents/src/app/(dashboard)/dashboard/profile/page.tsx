import { StatusBadge } from "@sodales/ui/status-badge";
import { ProfileEditorForm } from "@/components/profile-editor-form";
import {
  getTalentProfileWorkspace,
  listEditableTalentCategories,
} from "@/features/talents/profile-editor";
import { requireRole } from "@/lib/auth/session";

export default async function DashboardProfilePage() {
  const currentUser = await requireRole("talent");
  const [workspace, categories] = await Promise.all([
    getTalentProfileWorkspace(currentUser.id),
    listEditableTalentCategories(),
  ]);
  if (!workspace) throw new Error("Talent profile workspace not found.");

  return (
    <section aria-labelledby="profile-heading" className="mx-auto max-w-5xl">
      <div className="mb-10 flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">Talent profile</p>
          <h1 id="profile-heading" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Edit your profile</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-graphite">Keep the public facts, claims, skills, and destinations that represent your work accurate.</p>
        </div>
        <div className="flex items-center gap-3"><span className="text-sm text-graphite">Status</span><StatusBadge status={workspace.status} /></div>
      </div>
      <ProfileEditorForm initialValues={workspace.values} initialStatus={workspace.status} categories={categories} />
    </section>
  );
}
