// Presentational-only status pill. Extracted from the Astra reference's
// `.status` treatment (flat, bordered, capitalized) for reuse once the
// dashboard/admin routes are implemented — see
// docs/design/astra-dashboard-admin-visual-spec.md. Colors follow the SDD's
// own admin status convention (approved/read = emerald, pending/new = amber,
// hidden/archived = destructive, draft = secondary), not Astra's own hex
// values, since the SDD's palette is the source of truth for status color.
type Status = "draft" | "pending" | "approved" | "hidden" | "new" | "read" | "archived";

const styles: Record<Status, string> = {
  approved: "border-emerald-700/40 bg-emerald-50 text-emerald-800",
  read: "border-emerald-700/40 bg-emerald-50 text-emerald-800",
  pending: "border-amber-700/40 bg-amber-50 text-amber-800",
  new: "border-amber-700/40 bg-amber-50 text-amber-800",
  hidden: "border-red-700/40 bg-red-50 text-red-800",
  archived: "border-graphite/30 bg-transparent text-graphite",
  draft: "border-graphite/30 bg-transparent text-graphite",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block border px-2.5 py-1 text-xs capitalize tracking-[0.01em] ${styles[status]}`}
    >
      {status}
    </span>
  );
}
