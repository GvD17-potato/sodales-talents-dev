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

6. `references/`
   - Inspiration and planning references only.
   - Must never override items above.

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
- Lusion references collected.
- Toptal references collected.
- Teammate Academy planning reference added.
- Initial Antigravity READ-ONLY audit completed.
- Human review of that audit completed.
- Revision 2 corrections were requested.

Current stage:

**Step 11B — Pre-implementation audit Revision 2**

Next stage after approval:

**Step 12 — constrained `/grill-me` / requirements clarification**

Do NOT scaffold the application yet.

---

## Confirmed Senior Developer Decisions

### Repository / monorepo

There is NO existing Sodales monorepo or starter repository.

The developer is expected to create the required foundation.

This may include, where required by the SDD / Neon contract:

- workspace root
- `apps/talents`
- `packages/ui`
- `@sodales/ui`
- pnpm workspace configuration
- Turborepo configuration
- root scripts
- `scripts/db-smoke.mjs`

Important:

Do not assume a missing external monorepo exists.

Also distinguish between:

- structure explicitly required by source documents
- structure proposed as an implementation choice

### Missing visual assets

There is currently NO official:

- `talents-studio-hero.png`
- `SODALES | TALENTS` product-lockup asset

Official assets currently available separately:

- standalone Sodales geometric symbol
- horizontal Sodales corporate wordmark

The missing hero image:

- is required for final visual/acceptance compliance
- does NOT block scaffolding or construction of the hero layout
- must not be replaced with invented/generated artwork unless explicitly approved

The exact construction of the required `SODALES | TALENTS` lockup remains an
unresolved design decision.

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

Roles:

- visitor
- talent
- admin

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

### 5. Product lockup

There is no official `SODALES | TALENTS` lockup asset.

Need an approved implementation strategy using official available Sodales
assets.

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

Approved supplemental requirement:

- prefers-reduced-motion support

---

## Current Audit Status

An initial Antigravity READ-ONLY audit was produced.

Human review found it strong overall but requested corrections covering:

- incorrect assumption that an external monorepo existed
- draft profile field nullability
- material-edit ambiguity
- hidden-profile edit behavior
- inquiry transition ambiguity
- auth middleware interpretation
- seed credential safety
- hero-image classification
- official logo/lockup status
- reduced-motion provenance
- authoritative-vs-proposed project structure

The Antigravity session hit its usage quota while Revision 2 was being prepared.

A new agent should NOT redo planning from scratch.

It should:

1. Read all authoritative documents.
2. Read this HANDOVER.
3. Read the existing Antigravity audit if available.
4. Incorporate the confirmed senior-developer answers above.
5. Produce/complete Revision 2 only.
6. Stop for human review.

---

## Immediate Next Task

Complete the corrected pre-implementation audit.

Do NOT:

- scaffold Next.js
- install application dependencies
- initialize Neon
- create migrations
- create production code
- start detailed implementation planning
- make new product decisions without evidence

The corrected audit should end with:

`READY FOR HUMAN REVIEW — REVISION 2`