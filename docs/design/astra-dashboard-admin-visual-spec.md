# Astra Dashboard / Admin — Approved Visual Specification (not yet implemented)

## Status

This document is a **visual specification only**. None of `/dashboard`,
`/dashboard/profile`, `/admin`, `/admin/talents`, `/admin/talents/[id]`,
`/admin/inquiries`, or `/admin/inquiries/[id]` are implemented in production
yet — Neon Auth (Phase 2) and admin moderation server actions haven't been
built. This spec exists so that when those routes are implemented, the
approved Astra visual design is what gets built, rather than a fresh
redesign.

**Do not use this document to scaffold routes, mock data, or fake
functionality now.** It records design intent for a future implementation
pass, per the source task's explicit instruction not to fake these screens
ahead of the backend that would make them real.

One reusable visual primitive has been extracted early because it is purely
presentational and carries no backend dependency: `@sodales/ui/status-badge`
(`packages/ui/src/components/status-badge.tsx`) — a flat, bordered status
pill matching Astra's `.status` treatment, recolored to the SDD's own
admin status convention (approved/read = emerald, pending/new = amber,
hidden/archived = destructive, draft = secondary — not Astra's raw hex
values). It is not imported anywhere yet.

## Screen-by-screen mapping

### `/dashboard`
- Eyebrow "Your creative space" (violet) + H1 "Hello, {first name}." (page-title scale).
- A persistent, honest banner (matching the login/sign-up pattern already
  shipped): "Testing preview — profile editing is not yet connected to a
  real account."
- A `dashboard-card`: flex row, border only (no fill), talent's display name
  + `StatusBadge` + one line of status-contextual copy (draft/pending/
  approved/hidden wording lifted from Astra's own copy, which already
  matches the SDD's real lifecycle states) + action buttons ("Edit profile",
  "View public page" when approved, "Submit for review" gated on the SDD's
  real completeness rule — not a client-only checklist).
- A `Checklist` block below (readiness checklist: headline/bio/location/
  category/≥1 skill) — purely a visual read of server-validated state, never
  the actual gate (SDD §7 already requires server-side re-validation).

### `/dashboard/profile`
- Two-column field grid (name/headline/location/slug), bio textarea with
  live character count, a native `<select>`-style discipline picker,
  reorderable skill chips (move up/down/remove, add up to 15), portfolio
  link editor (label + HTTPS-only URL, up to 8, add/remove).
- Astra's material-edit-triggers-re-review behavior is **already the real
  SDD rule** (Step 12A, U-2) — the editor's visual "save" affordance should
  not imply anything beyond what the real transition rules allow.

### `/admin`
- Sidebar: eyebrow "The review studio" + three links (Overview/Talents/
  Inquiries), selected state = violet text + violet underline.
- A 4-cell stat strip (bordered, no fill) — total profiles / pending review
  / approved / new inquiries — using the exact same visual language as the
  homepage's proof strip.
- Two tables ("Pending review", "Newest inquiries") each with a "View all"
  link to the fuller list route.
- Persistent banner: "Admin preview — moderation actions are not yet
  connected to a real audit trail." (Astra's own banner makes the same
  point; ours must say so honestly rather than implying a working demo.)

### `/admin/talents`
- Status filter chips (draft/pending/approved/hidden) + category filter
  chips, both flat bordered pills, selected = filled violet.
- Table: name (links to detail) / discipline / location / skill count /
  `StatusBadge` / updated date.

### `/admin/talents/[id]`
- Back link, `dashboard-card`-style header with `StatusBadge` + name +
  headline + category/location.
- Moderation actions ("Approve profile" gated on pending + complete per the
  SDD's real rule; "Hide profile") — the button being visually enabled or
  disabled must reflect a real server check once built, never a purely
  client-side guess.
- Bio, skill tags, portfolio links, the same `Checklist` block as
  `/dashboard`.

### `/admin/inquiries`
- Status filter chips (new/read/archived — matching the SDD's real allowed
  transitions from Step 12A U-4, which excludes direct archived→new).
- Table: sender + message excerpt / target talent / `StatusBadge` / date.

### `/admin/inquiries/[id]`
- `brief-card`: `StatusBadge`, sender name, "For {talent} · {date}", full
  message, a `mailto:` reply link, and read/archive toggle buttons that must
  map onto the SDD's real allowed transitions, not Astra's simulated ones.

## Explicit mock-behavior exclusions

None of the following from Astra may be carried into the real
implementation of these screens:

- Client-only `role` state or the one-click "Talent workspace" / "Admin
  review studio" demo buttons.
- `localStorage`-based profile/inquiry/audit persistence
  (`sodales-demo-v1`, `sodales-demo-audit`).
- Unauthenticated `moderate()` calls with a hardcoded `moderator: 'demo-admin'`.
- Client-side-only route guarding (`useEffect` redirect based on client
  `role` state) as a substitute for real `requireRole` server checks.

Real implementation must use Neon Auth sessions, server-side `requireRole`,
and the SDD's actual lifecycle/audit rules (§6–§9) throughout.
