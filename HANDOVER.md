# Sodales Talents — Agent Handover

## Purpose

This file transfers the current planning state of the Sodales Talents project
between AI coding agents.

Any new agent must read this file and all authoritative project documents
before proposing changes or writing code.

---

## Authority Order

1. `docs/sdd/05-talents.md`
   - Authoritative product/system specification.

2. `docs/patterns/neon-app-setup.md`
   - Binding Neon/database/auth implementation contract.

3. `docs/brand/sodales-brand-guidelines.pdf`
   - Brand guideline source supplied by the senior developer.

4. `docs/brand/README.md`
   - Documents brand-source provenance and authority.

5. Future approved Talents design/architecture documents.

6. `HANDOVER.md`
   - This file. Current project state and confirmed decisions.

7. `references/`
   - Inspiration and planning references only.
   - Must never override items above.

This order matches `CLAUDE.md` and `AGENTS.md`, which are the agent-role
instruction files for this repository. Earlier revisions of this handover
omitted `HANDOVER.md` from its own ranking; rank 6 is the operative position.

---

## Reference Rules

### Academy document

`references/teammate-academy-frontend-design.md`

This is NOT a Sodales Talents requirements document.

It exists only as an example of:

- planning quality
- architecture thinking
- documentation structure
- implementation preparation

Do not copy Academy-specific stack, auth, typography, architecture, or product
requirements into Talents unless independently required by the Talents sources.

### Lusion screenshots

Inspiration only for:

- first-load branded entrance
- route transition motion
- premium motion quality

Do not copy Lusion branding, 3D/WebGL implementation, or exact design.

### Toptal screenshots

Inspiration only for:

- talent discovery
- category navigation
- featured-talent interaction
- information hierarchy

Do not copy:

- branding
- portrait treatment
- expert badges
- employer logos
- consulting/services product scope
- generic elevated card grids

### Reference availability (important)

`references/screenshots/` is excluded by `.gitignore` and is **not tracked in
version control**.

The Lusion and Toptal screenshots exist only on the original development
machine. A fresh clone, or an agent working on another machine, will find
`references/readme.md` describing screenshots that are not present.

Either commit them or treat them as non-portable. Do not assume a future agent
can see them.

---

## Current Project State

The expedited P0 testing milestone is implemented and deployed for human
presentation review. This is not the completed production application: database,
authentication, dashboard, and moderation implementation remain deferred.

Completed:

- Project repo created.
- Talents SDD added.
- Neon app setup contract added.
- Sodales brand guideline PDF added.
- Reference hierarchy documented.
- Lusion references collected (local only — see Reference availability).
- Toptal references collected (local only — see Reference availability).
- Teammate Academy planning reference added.
- `AGENTS.md` added — coding-agent instructions, authority order, role split.
- `CLAUDE.md` added — Claude UI/UX role, ownership boundaries, motion boundary.
- Initial Antigravity READ-ONLY audit completed.
- Human review of that audit completed.
- Revision 2 corrections requested.
- **Step 11 / Revision 2 pre-implementation audit completed.**
- **Revision 2 human review completed — APPROVED.**
- **Step 12A — Domain Requirements Clarification ✅ COMPLETE** — human-approved.
- **Step 12B — UI / Brand / Motion Requirements Clarification ✅ COMPLETE** —
  human-approved, expedited (testing-milestone deadline). Decisions 1–8 all
  approved.
- Official Sodales brand mark assets added
  (`docs/brand/assets/sodales-symbol.png`,
  `docs/brand/assets/sodales-wordmark-horizontal.png`).
- Root pnpm/Turbo workspace, `apps/talents` Next.js 15 application, Tailwind v4,
  and shared `packages/ui` foundation implemented.
- Responsive P0 routes implemented: `/`, `/talents`, `/talents/[slug]`,
  `/login`, and `/sign-up`.
- Approved Step 12B first-load entrance, top-level route transitions, loading,
  error, empty, 404, and reduced-motion behavior implemented for the testing
  milestone.
- Production build, lint, typecheck, exact-viewport responsive QA, local route
  smoke tests, and protected Vercel preview smoke tests completed successfully.

Revision 2 audit of record:

`docs/audits/pre-implementation-audit-r2.md`

Step 12A decision record:

`docs/decisions/step-12a-domain-decisions.md`

Step 12B decision record:

`docs/decisions/step-12b-ui-motion-decisions.md`

Current phase:

**Backend Phase 2 — Neon Auth and account provisioning ✅ COMPLETE.**

Current implementation phase: **Backend Phase 3 — Real Public Talent
Queries**. Do not start it without the next explicit implementation task.

Backend Phase 1 is source-complete and verified against the real Neon
development database: the existing migration, six-category seed, connectivity,
exactly seven application tables, and four enums are confirmed. The approved
P0 public frontend remains fixture-backed.

Phase 2 contains the Neon Auth handler/middleware, real sign-up, sign-in and
sign-out actions, server-side session/role guards, idempotent talent role plus
draft-profile reconciliation, controlled first-admin bootstrap, minimal
protected route shells, and focused Auth tests. Managed Neon Auth is enabled
and verified on the existing `Sodales-Talent` `development` branch. Real app
sign-up and login redirect to `/dashboard`; session enforcement, talent denial
from `/admin`, logout, signed-out protection, idempotent provisioning, and test
user cleanup passed. `ADMIN_EMAIL` and `ADMIN_PASSWORD` are not locally
configured, so the controlled first-admin command remains awaiting operator
credentials. See `docs/decisions/backend-phase-2-neon-auth.md`.

The current Phase 1 seed remains categories-only. Rich demo talent/auth,
inquiry, and moderation seed content remains deferred and has not been created.

The senior developer authorised and Codex completed the same-day P0 testing
implementation using Step 12B Decisions 1–8 as its UI/brand/motion basis. This
authorization and deployment remain scoped to the testing milestone.

The full formal gate ladder below still governs the main production build and
is not being asserted as complete or bypassed beyond that scope:

1. ~~Step 12A — Domain Requirements Clarification~~ (complete)
2. ~~Step 12B — UI / Brand / Motion Requirements Clarification~~ (complete)
3. Visual / motion specification (not yet produced as a standalone spec
   document — Step 12B's decision record serves as its basis for the testing
   build)
4. Architecture design
5. Implementation plan
6. Human approval
7. Full production scaffolding

Scaffolding/implementation for the **testing milestone specifically** is
authorised now, per this decision. Gates 3–7 above remain open for the main
production build.

### Expedited P0 testing deployment — 2026-09-05

Deployment record: `docs/deployment/testing-milestone-2026-09-05.md`

- Vercel project: `sodales-talents-p0-testing-20260905`
- Deployment: `dpl_DWPQdfwtD8sxnHciBE6DJHjNGEYQ`
- Preview:
  `https://sodales-talents-p0-testing-20260905-jtixyr0mu.vercel.app`
- Vercel state: `READY`
- Access: protected by the team's Vercel Authentication policy; authorised
  project members can open the preview, and authenticated CLI smoke testing
  passed behind the gate.
- Data source: **TESTING FIXTURE DATA** containing approved demo profiles only.
  The stable `listApprovedTalents()` and `getApprovedTalentBySlug()` boundaries
  are in place for a later SQL adapter. This is not a database implementation.
- Public unknown profile slugs return the application 404.
- Official supplied brand PNGs are copied byte-for-byte into the application
  and used unchanged on controlled light asset surfaces.

**TESTING-MILESTONE DEFERRALS:** Neon Postgres, Drizzle schema/migrations, real
SQL queries, Neon Auth, persisted inquiry submission, talent dashboard/profile
editing, admin moderation, domain state machines, audit records, and their
automated integration tests. The login/sign-up and inquiry experiences are
truthful non-persisting testing shells; they do not transmit credentials or
claim success.

Known visual limitation: the supplied official PNG marks have opaque white
backgrounds and no transparent/reversed variants. Final dark-chrome treatment
remains dependent on approved source assets; no replacement or recoloured logo
was invented.

---

## Confirmed Senior Developer Decisions

### Post-Revision-2 senior decisions

Received after the Revision 2 handover update. These are CONFIRMED SENIOR
DECISIONS and close three previously open items.

**1. `scripts/db-smoke.mjs` — this repository creates it.**

The senior developer confirmed the Talents smoke script is to be created here,
not supplied from elsewhere. Closes Unresolved 10.

The exact assertions are **not** decided. They are to be designed by Codex from
the Talents SDD acceptance criteria (§14, §15) and approved during
architecture / implementation planning. Do not invent them before that gate.

**2. `NEON_AUTH_COOKIE_SECRET` — this project is authorised to create and
configure a secure value.**

The senior developer **authorised this project / the developer** to create and
configure a secure `NEON_AUTH_COOKIE_SECRET`. Responsibility for doing so sits
with this project, not with the senior developer. Closes Unresolved 11.

It is a **required secure environment value** for this project. The actual
secret must never be committed, logged, printed, or placed in documentation.

No production fallback strategy was approved. The senior confirmed provisioning
only; whether the code should fail closed rather than fall back outside
development was not addressed and must not be presented as decided.

**3. Talents brand lockup and display typography — follow the Talents SDD
exactly.**

The senior developer confirmed:

- The product lockup is **`SODALES | TALENTS`** — pipe, per SDD §10 and §14.
- **Manrope** is the Talents display typeface.
- Inter remains body / UI, as the SDD requires.

The brand deck does **not** override the senior-approved Talents SDD. The
slash-based corporate sub-brand system (brand PDF pp.10–15, 21) and the deck's
Inter / Neue Haas Grotesk display designation (p.17) are recorded as context in
the Revision 2 audit, not as governing requirements for Talents.

Still open, but as **design work rather than an unresolved requirement**: there
is no supplied pre-made `SODALES | TALENTS` asset, so the exact visual and
component construction from the available official Sodales assets is a UI
implementation/design decision. See Unresolved 5.

### Repository / monorepo

There is NO existing Sodales monorepo or starter repository.

There is also NO orchestrator. `docs/patterns/neon-app-setup.md` is written as
if an orchestrator has already provisioned `.env.local`, installed
dependencies, and supplied `scripts/db-smoke.mjs`. None of that is true here.

The foundation must be created **in this repository**.

Do not assume a missing external monorepo exists, and do not wait on an
orchestrator that does not exist.

Revision 2 refined the classification below. These are **explicitly required by
source documents**, not optional implementation choices:

| Item | Cited by |
| --- | --- |
| `apps/talents` | SDD line 3; Neon contract §6 |
| package name `@sodales/talents` | SDD §14 (`pnpm --filter @sodales/talents`) |
| pnpm workspace | SDD §14; Neon contract §1 |
| Turborepo | SDD §15 |
| `packages/ui` at that path | Neon contract §5 (`packages/ui/src/globals.css`) |
| `@sodales/ui` package name | SDD stack line |
| `scripts/db-smoke.mjs` at repo root | SDD §14, §15; Neon contract §1, §4e, §7 |
| app-internal layout (`src/app`, `src/db`, `src/features/<domain>`, `src/lib`) | Neon contract §6; SDD §7, §9 |
| root `.env.example` | Neon contract §2 |

Anything beyond that list is an implementation proposal and must be labelled as
one.

Note: the Academy reference document chose a standalone repo with no
`packages/ui` (Academy §11, D-5). That is an Academy owner decision and must
NOT be carried into Talents. The Talents sources require the workspace.

### Missing visual assets

There is currently NO official:

- `talents-studio-hero.png`
- `SODALES | TALENTS` product-lockup asset

Official assets currently available separately:

- standalone Sodales geometric symbol
- horizontal Sodales corporate wordmark

The missing hero image `/media/talents-studio-hero.png`:

- remains a **final visual dependency** — required by SDD §10 and §14 to be
  responsive, locally served and described with useful alt text
- is required for final visual/acceptance compliance
- does NOT block scaffolding or construction of the hero layout
- must not be replaced with invented/generated artwork unless explicitly approved

A temporary layout placeholder may be used only when explicitly documented as a
placeholder (`CLAUDE.md`). Final acceptance cannot be claimed without the asset
or an approved change to the requirement.

The lockup **naming is settled**: `SODALES | TALENTS`, confirmed by the senior
developer per the Talents SDD.

No pre-made asset for it has been supplied, so its exact visual construction
from the available official assets remains a UI design decision, to be approved
at the visual/motion specification gate. See Unresolved 5.

---

## Important Product Requirements Already Confirmed

### Public visibility

Only `approved` talent profiles may appear publicly.

This filtering must occur in SQL/database queries.

Do NOT:

- fetch all statuses then filter in React
- rely on client-side status checks

Draft, pending and hidden profile slugs must behave as public 404s.

### Roles

Product actors:

- visitor
- talent
- admin

**`visitor` is a product actor, not a persisted role.**

The `user_role.role` enum in SDD §6 is `talent | admin` only. A visitor is
simply an unauthenticated request. Do not add a `visitor` value to the
`pgEnum`.

Role resolution is server-side.

Every sensitive server action must independently re-check:

- authenticated session
- required role
- ownership where relevant

Client-side guards are not authorization.

### Talent ownership

A talent may edit only their own profile.

Every relevant write must re-check ownership server-side.

### Profile lifecycle

Confirmed transitions include:

- `draft -> pending` via submit for review
- `pending -> approved` via admin approval
- `pending -> hidden` via admin hide
- `approved -> hidden` via admin hide
- `approved -> pending` after a material talent edit
- `pending -> draft` after a talent edit
- `hidden -> pending` via explicit resubmit

Only approved profiles are public.

Phase 1 supplemental decision: pending-profile normalized no-op saves preserve
`pending`. Only an actual persisted profile change counts as an edit that
withdraws a pending submission to `draft`; this includes reorder-only,
material/content, and any other genuine persisted change.

### Publication completeness gates

`draft -> pending` and `pending -> approved` are **gated** transitions, not free
ones.

Per SDD §7, both submission and approval must re-check, **on the server**:

- headline
- bio
- location
- a valid category
- at least one skill

Portfolio links remain optional (SDD §4b, §14).

Do not treat the client-side checklist in `/dashboard` as the gate.

### Stale approval protection

Admin approval has concurrency requirements.

The implementation must protect against:

Admin opens version A
→ talent edits to version B
→ admin attempts approval using stale version A

The stale approval must fail.

Expected mechanism is based on the SDD:

- capture reviewed `updatedAt`
- transaction
- row lock / equivalent safe concurrency mechanism
- verify still `pending`
- verify `updatedAt` unchanged
- approve
- create moderation audit row atomically

Do not reduce this to a client-side timestamp check.

### Inquiry honeypot

Inquiry form contains a honeypot.

If populated:

- return fake success
- do NOT create a database inquiry

### Admin moderation audit

Admin approve/hide operations must create `profile_moderation` audit rows.

---

## Confirmed Design Direction

Sodales Talents should feel like a:

**Premium editorial talent marketplace with restrained corporate branding and
high-quality brand motion.**

Key requirements:

- search-first homepage
- flat precise surfaces
- restrained borders
- minimal shadows
- no generic SaaS card grid
- no invented talent portraits
- Electric Violet used sparingly
- official Sodales assets only
- editorial talent rows
- motion supports hierarchy/branding rather than delaying normal actions

Typography from the SDD:

- Manrope — display / expressive headings / large numerals
- Inter — body / UI / forms / tables / controls

**Confirmed by the senior developer** after the Revision 2 update: follow the
Talents SDD exactly. Manrope is the Talents display typeface; Inter is
preserved for body/UI. The corporate-brand typography conflict is closed in
favour of the SDD. See **Human Review Classifications — C** below.

### Design-system authority split (Revision 2)

`docs/patterns/neon-app-setup.md` §5 and SDD §10 disagree on surface treatment.
Resolution by authority order:

- Neon contract §5 governs **structure, primitives and quality bar** — the
  admin shell (SDD §4c adopts it by reference), Radix/`Button asChild`,
  `Toaster`, loading/empty/error expectations.
- SDD §10 governs **the visual language** — flat precise surfaces, restrained
  borders, minimal shadows, editorial rows, `max-w-7xl`, no card grids, no
  decorative gradients, no initials avatars, no serif chrome.

Where they differ on surface treatment, **SDD §10 wins**. The contract's §5
card/gradient/hover/container/font guidance is superseded for Talents.

This is recorded because contract §5 reads as prescriptive and is the item most
likely to be misapplied by a future agent.

Important palette:

- Obsidian `#111111`
- Soft Ivory `#F4F2ED`
- Graphite `#35373B`
- Electric Violet `#5E4FB3`
- Accessible Violet on dark `#887BD8`
- Supporting violet `#DAD4F5`
- Supporting violet `#8072D2`
- Supporting deep violet `#2A2440`

If another document contains a generic Talents accent inconsistent with the
Talents SDD, the Talents SDD wins.

---

## Supplemental Motion Direction

Candidate first-load experience:

Obsidian
→ restrained loading/brand treatment
→ official Sodales symbol
→ symbol scales / reveals page
→ Soft Ivory homepage

Candidate internal route transition:

current route
→ short branded overlay
→ Sodales mark
→ next route

Do not replay long brand animation for:

- search/filter
- dialog opening
- saves
- admin mutations
- ordinary controls

`prefers-reduced-motion` support is an approved supplemental project
requirement.

It is not being claimed as an explicit original Talents SDD requirement.

---

## Unresolved Decisions

This section preserves every U-number for audit and history references.

Eleven items were raised through Revision 2. **Seven have since been closed by
senior developer decisions or the human-approved Step 12A domain decisions**
and are marked RESOLVED in place. They are not deleted or renumbered, so audit
references U-1…U-11 in `docs/audits/pre-implementation-audit-r2.md` stay valid.

| # | Item | Status |
| --- | --- | --- |
| 1 | Draft profile database representation | **RESOLVED** — Step 12A |
| 2 | Definition of "material edit" | **RESOLVED** — Step 12A |
| 3 | Hidden profile editing behavior | **RESOLVED** — Step 12A |
| 4 | Inquiry direct-archive behavior | **RESOLVED** — Step 12A |
| 5 | Product lockup / sub-brand conflict | **RESOLVED** (naming) — construction is design work |
| 6 | Hero image | UNRESOLVED |
| 7 | Seed credential / deployment safety | UNRESOLVED |
| 8 | Auth middleware behavior | UNRESOLVED — verify empirically |
| 9 | Standalone execution / environment contract | UNRESOLVED |
| 10 | `scripts/db-smoke.mjs` | **RESOLVED** (provisioning) — assertions deferred to Codex |
| 11 | `NEON_AUTH_COOKIE_SECRET` | **RESOLVED** (provisioning) — no fallback strategy approved |

The four still marked UNRESOLVED remain **genuinely unresolved**. None has
been answered by inference, precedent, industry convention, or agent proposal.
Per `AGENTS.md`, do not invent a missing decision — state what is known, what is
unknown, and what decision is required.

Where a source contains partial evidence, that evidence is quoted below and the
question is still left open.

### 1. Draft profile database representation — RESOLVED

`headline`, `bio`, `location`, and `category_id` are nullable regardless of
status. Draft and hidden profiles may be incomplete; pending and approved
profiles must pass server-side publication-completeness checks. Draft-save
validation remains separate, failed completeness transitions preserve status,
and portfolio links remain optional.

### 2. Definition of "material edit" — RESOLVED

For approved profiles, changes to display name, headline, bio, location,
category, slug, skill membership/content, or portfolio-link membership,
destination, or label are material. Pure skill or portfolio-link reordering is
non-material. Normalized no-op saves are non-material; any save containing a
material change is material. A material approved save atomically persists the
change and transitions `approved -> pending`.

### 3. Hidden profile editing — RESOLVED

Every normal save keeps a hidden profile `hidden`, including incomplete,
no-op, reorder-only, and material saves. Only explicit **Resubmit for review**
may perform `hidden -> pending`, after server-side completeness validation. A
failed resubmission remains `hidden`; `hidden -> draft` and automatic
save-driven resubmission are not allowed.

### 4. Inquiry archive behavior — RESOLVED

Allowed transitions are `new -> read`, `read -> new`, `new -> archived`,
`read -> archived`, and `archived -> read`. Direct `archived -> new` is not
allowed; use `archived -> read -> new`. Restoration does not add previous-status
storage, archive history, or another inquiry status.

The complete human-approved record for U-1 through U-4 is:

`docs/decisions/step-12a-domain-decisions.md`

### 5. Product lockup / corporate sub-brand conflict — RESOLVED (naming), design work remains

**Status: the naming and separator decision is RESOLVED.**

CONFIRMED SENIOR DECISION: follow the Talents SDD exactly — the lockup is
**`SODALES | TALENTS`**. The corporate sub-brand conflict below is closed in
favour of the SDD; the brand deck does not override it.

Resolved sub-points:

- **(a) Separator — RESOLVED.** Pipe, per SDD §10 and §14. Explicitly confirmed
  by the senior developer.
- **(b) Division status — RESOLVED.** The brand deck naming only five divisions
  does not block Talents. Follows from the senior directive that the Talents
  SDD governs.
- **(c) Division colour — RESOLVED.** Electric Violet `#5E4FB3`, per SDD §10
  ("the Talents division signal use Electric Violet"). Follows from the same
  directive rather than a separate statement.

**What remains open is design work, not an unresolved requirement.**

There is still no supplied pre-made `SODALES | TALENTS` asset. The exact visual
and component construction — how the official standalone symbol and official
horizontal wordmark are composed with the `TALENTS` half, and how that half is
set — is a UI implementation/design decision owned by Claude per `CLAUDE.md`,
to be approved at the visual/motion specification gate.

Constraint that still applies: SDD §14 forbids **approximating** a geometric
icon. Using the official asset is compliant; drawing a lookalike is not. Do not
present generated artwork as an official supplied Sodales asset.

---

Context retained below for the design work. It is **not** a live conflict.

Revision 2 read the brand PDF page by page. The brand guidelines define an
**official sub-brand system**:

- Page 10 names **five divisions**: `/ STUDIO`, `/ CINEMA`, `/ PERSONA`,
  `/ LABS`, `/ ACADEMY`.
- Construction is the wordmark with the division set **below it**, left-aligned,
  as `/ NAME` in bold italic, in a division-specific colour (pp.10–15).
- Page 21 shows division **websites** using `[icon] SODALES / LABS` and
  `SODALES / CINEMA` in the site header.

That system is how other Sodales divisions are marked. Talents does not follow
it: sub-points (a), (b) and (c) above are closed in favour of the Talents SDD
by the senior decision. The deck is useful here only as a guide to how the
official assets are composed and spaced.

Available official assets for the design work: the standalone symbol and the
horizontal icon + wordmark lockup both exist (brand pp.5, 6, 9), including
reversed and single-colour variants (p.8).

The Academy `SODALES | ACADEMY` precedent remains reference-only and did not
settle this — the senior decision did.

### 6. Hero image

Official required NICO/MARA `talents-studio-hero.png` has not been supplied.

Layout can proceed later with an explicit unresolved asset dependency, but
final acceptance cannot be claimed without the required asset or an approved
change to the requirement.

### 7. Seed credential safety

Need to establish whether `db:seed` is development-only.

If production can execute it, fixed demo/admin credentials require a safe
production strategy.

### 8. Auth middleware

Do not confuse:

- `/api/auth/:path*` being matched by middleware

with:

- requiring an existing authenticated session on authentication endpoints

Anonymous sign-up/sign-in endpoints must remain usable.

Implementation must follow the Neon contract exactly.

Scope note from Revision 2: the seed is **not** affected. It calls
`${NEON_AUTH_BASE_URL}/sign-up/email` server-to-server, bypassing Next
middleware entirely. Only browser sign-up/sign-in is at risk.

Resolution is **empirical**: keep the matcher verbatim and verify anonymous
sign-up and sign-in end to end at first wiring. Do not edit the matcher ahead
of evidence.

### 9. Standalone execution / environment contract

`docs/patterns/neon-app-setup.md` §1–§2 assume a WSL repository path, an
orchestrator-written `.env.local`, pre-installed dependencies, no
`pnpm install`, no `git`, and no dev server (ports 3000–3005 claimed by an
orchestrator Docker stack).

None of those premises hold for this repository. Every command in the
contract's §7 definition of done is currently unexecutable.

Decisions needed:

- Who provisions Neon and writes `.env.local`.
- Whether `pnpm install` is authorised for the initial workspace creation.
- Whether agents may run `git` here, given `AGENTS.md` requires isolated
  branch/worktree discipline.
- Whether a dev server on port 3004 (SDD line 3) is authorised. This one
  directly gates `CLAUDE.md`'s assignment of "visual review in browser" to
  Claude.

Escalated to the senior developer. May be resolved in parallel with Step 12.

### 10. `scripts/db-smoke.mjs` definition — RESOLVED (provisioning)

**Status: provisioning is RESOLVED.**

CONFIRMED SENIOR DECISION: this repository creates `scripts/db-smoke.mjs`. It
is not waiting on a shared script from elsewhere.

Original question: `node scripts/db-smoke.mjs talents` is an acceptance
criterion (SDD §14, §15) but the script does not exist and no reference copy is
available.

Remaining work, deliberately not decided here: the exact assertions are to be
designed by **Codex** from the Talents SDD acceptance criteria and approved
during architecture / implementation planning.

Do not invent the assertions in documentation, and do not treat them as settled
before that gate.

### 11. `NEON_AUTH_COOKIE_SECRET` provisioning — RESOLVED (provisioning)

**Status: secret provisioning is RESOLVED.**

CONFIRMED SENIOR DECISION: the senior developer **authorised this project / the
developer** to create and configure a secure `NEON_AUTH_COOKIE_SECRET`.
Creating and configuring it is this project's responsibility.

`NEON_AUTH_COOKIE_SECRET` is a **required secure environment value** for this
project. The actual secret must never be committed, logged, printed, or placed
in documentation — consistent with the Neon contract §1 hard rule on
`.env.local` values.

Original question: Neon contract §3a signs session cookies with
`process.env.NEON_AUTH_COOKIE_SECRET ?? "dev-insecure-secret-32-chars-min!!"`,
and the variable is absent from the contract's §2 `.env.local` inventory and
from SDD §16's Vercel environment list. If unset in production, every session
cookie would be signed with a secret published in this repository.

**Not decided:** whether the code should fail closed rather than fall back to
the documented default outside development. The senior confirmed provisioning
only. No production fallback strategy has been approved — do not record or
implement one as though it had been.

---

## Accessibility

Explicit SDD requirements and supplemental enhancements must remain separately
identified.

Explicit requirements include:

- semantic landmarks
- one explicit h1
- form labels
- aria-label on icon-only controls
- honeypot removed from accessibility/tab flow
- visible focus
- keyboard-accessible Radix controls
- 4.5:1 contrast
- status text, not color alone
- aria-live result count

Two further explicit requirements live outside SDD §12 and were missing from
earlier revisions of this handover. Both are SOURCE REQUIREMENTS:

- **`aria-busy="true"` plus a concise screen-reader loading announcement on
  every loading boundary** (SDD §11). Applies to every `loading.tsx`.
- **`aria-describedby` linking field errors to their inputs** (SDD §7), with
  the same zod schemas run client-side and native
  `required`/length/type/pattern constraints retained. The profile editor is a
  semantic HTML form.

Approved supplemental requirement:

- prefers-reduced-motion support

---

## Human Review Classifications (Revision 2)

These were decided at the Revision 2 human review gate. They are binding
working decisions for Step 12 onward.

### A. Next.js version

**SOURCE REQUIREMENT — Next.js 15.**

The Academy document's Next.js 16 information (16.3.4 stable, `middleware.ts`
deprecated in favour of `proxy.ts`, async `params`/`searchParams`/`cookies()`,
`next lint` removed) is **reference-only** and does not override Talents.

Talents follows SDD line 5 (Next.js 15) and Neon contract §3c
(`src/middleware.ts`).

### B. Migration connection

**Follow `docs/patterns/neon-app-setup.md` as written.**

Contract §4b reads `DATABASE_URL` (pooled) for `drizzle.config.ts`. That stands
unless:

- the senior developer explicitly changes the contract, **or**
- empirical verification demonstrates an actual problem.

The pooled/unpooled concern raised in Revision 2 is a **technical observation,
not an approved architecture change**. Do not switch to
`DATABASE_URL_UNPOOLED` unilaterally.

### C. Typography — SENIOR SIGN-OFF RECEIVED

**Requirement: Manrope for Talents display typography, Inter for UI/body.**

The Talents SDD is authoritative (SDD §10).

The corporate-brand conflict is real and recorded: brand PDF p.17 designates
Inter / Neue Haas Grotesk as the display typeface, with Akzidenz-Grotesk as the
alternative; Manrope appears nowhere in the deck.

**Resolved.** The senior developer confirmed after the Revision 2 update:
follow the Talents SDD exactly — Manrope for Talents display typography, Inter
preserved for body/UI. The brand deck does not override the senior-approved
Talents SDD.

This is no longer a working assumption awaiting sign-off. See Post-Revision-2
senior decisions above.

Two sub-points agree across both sources and are safe regardless:

- uppercase ~12px wide-tracked UI labels
- no serif product chrome

---

## Escalations to the Senior Developer

These **may be resolved in parallel with Step 12B** — they do not block the
remaining requirements clarification.

Still open with the senior developer:

- Unresolved 9 — standalone execution / environment contract
- Unresolved 7 — seed credential / deployment safety
- Unresolved 6 — missing `talents-studio-hero.png`

Closed by senior decision after the Revision 2 update:

- Unresolved 10 — `scripts/db-smoke.mjs` — this repo creates it; assertions
  deferred to Codex at the architecture / implementation planning gate
- Unresolved 11 — `NEON_AUTH_COOKIE_SECRET` — this project is authorised and
  responsible for creating/configuring a secure value; no fallback strategy
  approved
- Unresolved 5 — lockup naming resolved to `SODALES | TALENTS`; visual
  construction is now design work, not an escalation
- Classification C — display typeface resolved in favour of Manrope (Talents
  SDD governs)

Product decisions U-1 through U-4 were resolved and human-approved in Step 12A.
See `docs/decisions/step-12a-domain-decisions.md`.

---

## Current Audit Status

**Step 12A — Domain Requirements Clarification is COMPLETE and human-approved.**

Decision record:

`docs/decisions/step-12a-domain-decisions.md`

**Step 11 / Revision 2 is COMPLETE and APPROVED.**

Audit of record:

`docs/audits/pre-implementation-audit-r2.md`

History:

1. An initial Antigravity READ-ONLY audit was produced (Revision 1).
2. Human review found it strong overall but requested corrections covering the
   external-monorepo assumption, draft profile nullability, material-edit
   ambiguity, hidden-profile edit behavior, inquiry transition ambiguity, auth
   middleware interpretation, seed credential safety, hero-image
   classification, official logo/lockup status, reduced-motion provenance, and
   authoritative-vs-proposed project structure.
3. The Antigravity session hit its usage quota mid-revision.
4. Revision 2 was completed by Claude (Opus 5) against all authoritative
   sources, including a page-by-page read of the brand PDF.
5. Human review of Revision 2 completed — **approved**.

Revision 2 confirmed this handover as substantially accurate. It made no
product decisions. It applied nine corrections, recorded seven source-level
conflicts, and added three unresolved items (9–11). All corrections are now
folded into this file.

Notable outcome: the brand PDF is a Canva export with no text layer. Revision 2
decoded and read all 26 pages and sampled its swatches at pixel level, which is
how the sub-brand conflict (Unresolved 5) and the typography conflict
(Classification C) were found. A page map is in the audit appendix — the PDF
cannot be text-searched, so use the map rather than re-deriving it.

Conflicts resolved by authority order and now settled:

- Talents accent is **Electric Violet `#5E4FB3`**, not the Neon contract's
  emerald. The brand PDF p.16 independently corroborates the SDD; the
  contract's accent table is a stale generic default. Emerald survives only as
  the admin *approved* status Badge (SDD §10).
- `docs/brand/website-guidelines.md` is superseded by the Canva deck / PDF per
  `docs/brand/README.md`.
- Neon contract §5 vs SDD §10 — see Design-system authority split above.

Still missing and cited as binding by a source: `docs/sdd/00-platform.md`
(Neon contract §4c). Impact is low; the conventions needed are restated inline
in §4c.

---

## Immediate Next Task

**Backend Phase 3 — Real Public Talent Queries.**

Replace the approved public talent fixtures with SQL-backed queries that expose
only approved profiles, following the SDD and Neon setup contract. Do not begin
without an explicit Phase 3 implementation task. The controlled first-admin
bootstrap remains an operator action awaiting locally configured
`ADMIN_EMAIL` and `ADMIN_PASSWORD`.
