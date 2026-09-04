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

Planning stage only.

No production application has been scaffolded yet.

No implementation should begin until the remaining planning/review gates are
completed.

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

Revision 2 audit of record:

`docs/audits/pre-implementation-audit-r2.md`

Current phase:

**Step 12 — Requirements Clarification**

Remaining gates, in order:

1. **Step 12 — requirements clarification** (current)
2. Visual / motion specification
3. Architecture design
4. Implementation plan
5. Human approval
6. Only then: scaffolding

Do NOT scaffold the application yet. Scaffolding is gate 6 and has not been
reached.

---

## Confirmed Senior Developer Decisions

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

The exact construction of the required `SODALES | TALENTS` lockup remains an
unresolved design decision — and Revision 2 found it conflicts with the
corporate sub-brand system. See Unresolved 5.

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

See **Human Review Classifications — C** below. Manrope/Inter is the working
requirement. A corporate-brand typography conflict exists and is awaiting
senior sign-off; it does not block Step 12.

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

These still need to be resolved before final architecture/implementation.

All eleven survived the Revision 2 human review and remain **genuinely
unresolved**. None has been answered by inference, precedent, industry
convention, or agent proposal. Per `AGENTS.md`, do not invent a missing
decision — state what is known, what is unknown, and what decision is required.

Where a source contains partial evidence, that evidence is quoted below and the
question is still left open.

### 1. Draft profile database representation

Sign-up creates a draft profile before all publication fields are complete.

Do not assume without evidence that:

- headline
- bio
- location
- category

are all database NOT NULL values.

Need decision on:

- nullable values
- empty values
- or another contract-defined representation

### 2. Definition of "material edit"

The SDD requires an approved profile to become pending after a material edit.

Exactly which edits count as material remains undefined.

Do not invent the definition.

### 3. Hidden profile editing

Need to determine the status behavior when:

hidden profile
→ talent edits
→ has NOT yet explicitly selected Resubmit

Do not invent a transition.

### 4. Inquiry archive behavior

Need to clarify whether:

`new -> archived`

is valid directly, or whether inquiry must first become `read`.

### 5. Product lockup / corporate sub-brand conflict

There is no official `SODALES | TALENTS` lockup asset.

Revision 2 read the brand PDF page by page and found this is larger than a
missing asset. The brand guidelines define an **official sub-brand system**:

- Page 10 names **five divisions**: `/ STUDIO`, `/ CINEMA`, `/ PERSONA`,
  `/ LABS`, `/ ACADEMY`.
- Construction is the wordmark with the division set **below it**, left-aligned,
  as `/ NAME` in bold italic, in a division-specific colour (pp.10–15).
- Page 21 shows division **websites** using `[icon] SODALES / LABS` and
  `SODALES / CINEMA` in the site header — the exact surface the SDD specifies.

Three linked decisions are therefore open:

- **(a) Separator** — the SDD's `|` or the brand system's `/`.
- **(b) Division status** — Talents is not one of the five named divisions, so
  no approved Talents division mark exists.
- **(c) Division colour** — SDD §10 assigns Electric Violet as the Talents
  division signal; the nearest official division colour (STUDIO's) is a related
  violet. Whether Talents may take Electric Violet is a brand call.

What is NOT blocked: the official standalone symbol and the official horizontal
icon + wordmark lockup both exist (brand pp.5, 6, 9), including reversed and
single-colour variants (p.8). SDD §14 forbids **approximating** a geometric
icon; using the official asset is compliant.

The Academy `SODALES | ACADEMY` precedent is reference-only and cannot settle
this.

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

### 10. `scripts/db-smoke.mjs` definition

`node scripts/db-smoke.mjs talents` is an acceptance criterion (SDD §14, §15)
but the script does not exist, no reference copy is available, and nothing
defines what it must assert for Talents.

Decision needed: supply the shared script, or define the Talents assertions.

### 11. `NEON_AUTH_COOKIE_SECRET` provisioning

Neon contract §3a signs session cookies with
`process.env.NEON_AUTH_COOKIE_SECRET ?? "dev-insecure-secret-32-chars-min!!"`.

That variable is absent from the contract's §2 `.env.local` inventory and from
SDD §16's Vercel environment list.

If it is unset in production, every session cookie is signed with a secret
published in this repository.

Decision needed: confirm the variable is set in Vercel, and whether the code
should fail closed rather than fall back outside development.

Escalated to the senior developer. Security item — must close before any
production deploy.

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

### C. Typography

**Working requirement: Manrope for Talents display typography, Inter for
UI/body.**

The Talents SDD is authoritative (SDD §10).

The corporate-brand conflict is real and recorded: brand PDF p.17 designates
Inter / Neue Haas Grotesk as the display typeface, with Akzidenz-Grotesk as the
alternative; Manrope appears nowhere in the deck.

That conflict is **awaiting senior sign-off but does not block Step 12**.
Proceed on Manrope/Inter.

Two sub-points agree across both sources and are safe regardless:

- uppercase ~12px wide-tracked UI labels
- no serif product chrome

---

## Escalations to the Senior Developer

Open with the project senior developer. These **may be resolved in parallel
with Step 12** — they do not block requirements clarification.

Environment / infrastructure:

- Unresolved 9 — standalone execution / environment contract
- Unresolved 10 — `scripts/db-smoke.mjs` definition
- Unresolved 11 — `NEON_AUTH_COOKIE_SECRET` provisioning
- Unresolved 7 — seed credential / deployment safety

Brand:

- Unresolved 5 — `SODALES | TALENTS` lockup and corporate sub-brand conflict
- Unresolved 6 — missing `talents-studio-hero.png`
- Human Review Classification C — display typeface conflict

Product decisions (Unresolved 1–4) belong to Step 12 and are **not** escalated
as brand or environment questions.

---

## Current Audit Status

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

**Step 12 — Requirements Clarification.**

Purpose: close the product-level unresolved decisions with evidence, not
invention.

In scope for Step 12 — Unresolved 1–4:

1. Draft profile database representation
2. Definition of "material edit"
3. Hidden profile editing behavior
4. Inquiry direct-archive behavior

Also confirm, where the source is silent, anything else Step 12 surfaces. Every
answer must be recorded in this file before it is treated as decided.

Running in parallel (escalated, not blocking): Unresolved 5, 6, 7, 9, 10, 11
and Classification C. See Escalations above.

Do NOT:

- scaffold Next.js
- install application dependencies
- create workspace files
- initialize Neon
- create schemas or migrations
- create production code
- begin architecture design or implementation planning
- make new product decisions without evidence

Scaffolding remains gate 6. Gates 2–5 (visual/motion specification,
architecture design, implementation plan, human approval) have not started.

When a gate completes, update this file. Do not rely on any agent's
conversation history.