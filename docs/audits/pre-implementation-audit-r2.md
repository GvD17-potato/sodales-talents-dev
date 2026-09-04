# Sodales Talents — Pre-Implementation Audit, Revision 2

> Stage: **Step 11B** · Mode: READ-ONLY verification · Date: 2026-09-05
> Prepared by: Claude (Opus 5) · Continues the Antigravity Revision 1 audit via `HANDOVER.md`
> Status: **awaiting human review** — no code, schema, migration, package, or Git state was created or changed.

---

## 0. Method

Every claim in `HANDOVER.md` was checked against the authoritative sources, in the authority
order defined by `CLAUDE.md` / `AGENTS.md`:

| # | Source | Read |
| --- | --- | --- |
| 1 | `docs/sdd/05-talents.md` | in full (352 lines) |
| 2 | `docs/patterns/neon-app-setup.md` | in full (328 lines) |
| 3 | `docs/brand/sodales-brand-guidelines.pdf` | in full (26 pages) |
| 4 | `docs/brand/README.md` | in full |
| 5 | Approved Talents design docs | none exist yet |
| 6 | `HANDOVER.md` | in full — the subject of this audit |
| 7 | `references/` | `readme.md`, Academy doc, Toptal + Lusion screenshots |

Also read (added to the repo after Revision 1 was written, and **not yet reflected in
`HANDOVER.md`**): `CLAUDE.md`, `AGENTS.md`.

**Note on the brand PDF.** It is a Canva export containing no text layer — 26 rasterised page
images. It was decoded page-by-page and read visually, and its swatches were sampled at pixel
level. Findings from it are therefore first-hand, not inferred. Page references below are to the
PDF page order.

### Label taxonomy (per `AGENTS.md` §"No Hallucinated Decisions")

- **SOURCE REQUIREMENT** — stated explicitly in an authoritative document. Cited.
- **CONFIRMED SENIOR DECISION** — recorded in `HANDOVER.md` as answered by the senior developer.
- **APPROVED PROJECT DECISION** — a supplemental decision already accepted for this project.
- **PROPOSAL** — this audit's suggestion. Binding on nobody.
- **UNRESOLVED** — needs a human decision. Not guessed at anywhere in this document.

---

## 1. Verdict on `HANDOVER.md`

`HANDOVER.md` is **substantially accurate and is preserved**. Every product rule, lifecycle
transition, security rule and palette value in it was checked and matches the sources. All eight
of its unresolved items are genuine and remain unresolved.

Revision 2 makes **no product decisions**. It corrects nine factual/classification points,
records seven source-level conflicts Revision 1 did not capture, and adds six unresolved items.

| Outcome | Count |
| --- | --- |
| Confirmed against sources | 24 claims |
| Corrected (factual or classification error) | 9 |
| Source conflicts newly identified | 7 |
| Unresolved items carried forward | 8 |
| Unresolved items added | 6 |

---

## 2. Confirmed — `HANDOVER.md` statements verified against sources

These are correct and require no change. Citations are given so a future agent need not re-derive.

| `HANDOVER.md` claim | Verified against |
| --- | --- |
| Only `approved` profiles are public; filtering in SQL | SDD §3 ("filter `status = 'approved'` **in SQL**"), §14, §17, §18 |
| Draft/pending/hidden slugs render the app 404 | SDD §3, §11, §14 |
| Roles resolved server-side; every sensitive action re-checks session + role + ownership | SDD §3, §7, §18; contract §3f RULES |
| Client-side guards are not authorization | SDD §7; contract §3f |
| A talent may edit only their own profile | SDD §3, §14 |
| `draft → pending` (submit for review) | SDD §3, §4b, §5.1 |
| `pending → approved` (admin approve) | SDD §4c, §5.2 |
| `pending → hidden`, `approved → hidden` (admin hide) | SDD §4c ("Hide remains available for pending/approved profiles") |
| `approved → pending` after a material talent edit | SDD §4b, §5.2, §14 |
| `pending → draft` after a talent edit | SDD §4b, §5.2, §14 |
| `hidden → pending` via explicit resubmit | SDD §3, §4b, §5.4 |
| Stale approval must fail; mechanism = reviewed `updatedAt` + transaction + row lock + still-pending check + atomic audit row | SDD §4c, §7, §14, §18 — the handover's description matches the SDD clause for clause |
| Honeypot ⇒ fake success, no DB row | SDD §4a, §7, §14, §18 |
| Approve/hide must write a `profile_moderation` row | SDD §4c, §14 |
| Manrope = display, Inter = UI/body | SDD §10 (but see conflict **C-2**) |
| Obsidian `#111111`, Soft Ivory `#F4F2ED`, Graphite `#35373B`, Electric Violet `#5E4FB3` | SDD §10 **and** brand PDF p.16 — labelled hexes identical; artwork sampled at exactly `#5E4FB3` on pp.25–26 |
| `#887BD8` accessible violet on Obsidian surfaces | SDD §10, §14 |
| Supporting `#DAD4F5`, `#8072D2`, `#2A2440` subordinate to the core four | SDD §10, §14 |
| "SDD wins over a generic Talents accent elsewhere" | Correct — and now corroborated by the brand PDF, see **C-1** |
| Search-first homepage, editorial rows, no generic card grid, flat surfaces, minimal shadows, restrained borders | SDD §4a, §10 |
| No invented talent portraits; type-led member surfaces | SDD §10 ("the product never invents portraits or faux identity assets") |
| Electric Violet used sparingly | SDD §10 **and** brand PDF p.16 ("Electric Violet is used sparingly for emphasis, motion, links, digital accents and sub-brand signals") |
| `prefers-reduced-motion` is supplemental, **not** an original SDD requirement | Correct — SDD §12 does not mention it; verified by full-text read of §11/§12 |
| Accessibility list (landmarks, one h1, labels, aria-label, honeypot out of tab flow, visible focus, Radix keyboard, 4.5:1, status-by-text, aria-live count) | SDD §12, verbatim |

---

## 3. Corrections to `HANDOVER.md`

Nine items. None reverse a senior decision; they sharpen or fix classification.

### H-1 — The authority order omits `HANDOVER.md` itself

`HANDOVER.md` §"Authority Order" lists six ranks and does not place itself. `CLAUDE.md` §"Authority
Order" and `AGENTS.md` §"Authority Order" — both committed after Revision 1 — place
`HANDOVER.md` at **rank 6, above `references/`**.

**Correction:** the operative order is SDD → Neon contract → brand PDF → brand README → approved
design docs → `HANDOVER.md` → `references/`. `HANDOVER.md` should adopt this and cross-reference
`CLAUDE.md` / `AGENTS.md`, which it currently does not mention at all.

### H-2 — `CLAUDE.md` and `AGENTS.md` are missing from the project-state record

Commit `5107567 docs: define Codex and Claude agent roles` added both files after Revision 1 was
drafted. They define the Claude/Codex ownership split, the animation boundary, and the label
taxonomy this audit uses. `HANDOVER.md` §"Current Project State" does not list them.

**Correction:** add to the completed list. Material because `CLAUDE.md` assigns Claude
"visual review in browser", which collides with a Neon-contract rule — see **U-9**.

### H-3 — The reference screenshots are not in version control

`HANDOVER.md` records "Lusion references collected" and "Toptal references collected" as complete.
They exist on disk, but `.gitignore` line "Local reference screenshots" excludes
`references/screenshots/`. `git ls-files` confirms zero screenshots are tracked.

**Correction:** they are **local-only**. A fresh clone — or the next agent on another machine —
gets `references/readme.md` describing screenshots that are not there. Either commit them or record
them as non-portable. This is a handover-integrity issue, not a product issue.

### H-4 — Project structure: several items are source-explicit, not "may include"

`HANDOVER.md` frames the foundation as things that "may include, where required". The sources are
more definite than that. Precise classification:

| Item | Status | Citation |
| --- | --- | --- |
| `apps/talents` | **SOURCE REQUIREMENT** | SDD line 3; contract §6 |
| Package name `@sodales/talents` | **SOURCE REQUIREMENT** | SDD §14 (`pnpm --filter @sodales/talents …`) |
| pnpm workspace | **SOURCE REQUIREMENT** (implied by `--filter`) | SDD §14; contract §1 |
| Turborepo | **SOURCE REQUIREMENT** | SDD §15 ("`lint`/`typecheck`/`build` per PR (Turborepo)") |
| `packages/ui` **at that path** | **SOURCE REQUIREMENT** | contract §5 ("Shared tokens live in `packages/ui/src/globals.css`") |
| `@sodales/ui` package name | **SOURCE REQUIREMENT** | SDD stack line 5 |
| `scripts/db-smoke.mjs` at repo root | **SOURCE REQUIREMENT** | SDD §14, §15; contract §1, §4e, §7 |
| App-internal layout (`src/app`, `src/db`, `src/features/<domain>`, `src/lib`) | **SOURCE REQUIREMENT** | contract §6; SDD §7, §9 |
| Root `.env.example` | **SOURCE REQUIREMENT** | contract §2 |
| Whether anything *other* than `@sodales/ui` lives in `packages/` | **PROPOSAL** territory | — |

Note the Academy document chose a standalone repo with **no** `packages/ui` (Academy §11, D-5).
That is an Academy owner decision and per `AGENTS.md` §"Reference Rules" must **not** be carried
into Talents. The Talents sources require the workspace.

### H-5 — `visitor` is a product role, not a database role

`HANDOVER.md` lists "Roles: visitor, talent, admin". Correct as product roles (SDD §2), but the
`user_role.role` enum in SDD §6 is **`talent | admin` only**. A visitor is simply an
unauthenticated request.

**Correction:** state this explicitly so no one adds a `visitor` value to the `pgEnum`.

### H-6 — The lifecycle list omits the completeness gate

`HANDOVER.md`'s transition list is accurate but silent on preconditions. SDD §7 requires that
**both** submission and approval re-check headline, bio, location, a valid category and ≥1 skill
**on the server**; portfolio links stay optional (SDD §4b, §14).

**Correction:** `draft → pending` and `pending → approved` are gated transitions, not free ones.

### H-7 — The accessibility list is missing two explicit SDD requirements

`HANDOVER.md` §"Accessibility" reproduces SDD §12 correctly, but two explicit requirements live
outside §12 and are absent:

- **SDD §11:** "Every boundary exposes `aria-busy="true"` with a concise screen-reader loading
  announcement" — applies to every `loading.tsx`.
- **SDD §7:** forms link errors with `aria-describedby`, run the same zod schemas client-side, and
  retain native `required`/length/type/pattern constraints; the profile editor is a semantic
  HTML form.

Both are **SOURCE REQUIREMENT**, not supplemental.

### H-8 — The typography decision carries an unflagged source conflict

`HANDOVER.md` records Manrope/Inter as settled. It is settled by authority order, but it
contradicts the brand PDF. See **C-2**. `AGENTS.md` line 47 requires that genuine conflicts between
authoritative sources be reported rather than silently resolved — so it must be recorded, even
though the resolution direction is clear.

### H-9 — The product-lockup item is materially understated

`HANDOVER.md` §Unresolved 5 says only that no `SODALES | TALENTS` asset exists. The brand PDF shows
the problem is larger: there is an **official sub-brand system** and its construction differs from
the SDD's. See **C-3** and **U-5**.

---

## 4. Conflicts between authoritative sources

Seven. Six resolve cleanly by authority order; two need a human (**C-2**, **C-3**).

### C-1 — Talents accent colour: emerald vs Electric Violet — **RESOLVED**

- `neon-app-setup.md` §5 accent table: `Talents → emerald oklch(0.6 0.15 163)`.
- SDD §10 / §14: Electric Violet `#5E4FB3`, with `#887BD8` on Obsidian.
- Brand PDF p.16: Electric Violet `#5E4FB3` is one of only four corporate colours, "used sparingly
  for emphasis, motion, links, digital accents and **sub-brand signals**".

**Resolution:** Electric Violet. SDD outranks the contract, and the brand PDF independently
corroborates the SDD — the contract's table is a stale generic default. `HANDOVER.md` already
anticipated this correctly; it is now evidenced. Emerald survives only where SDD §10 puts it:
the *approved* admin status Badge.

### C-2 — Display typeface: Manrope vs Inter / Neue Haas Grotesk — **NEEDS SIGN-OFF**

- Brand PDF p.17 designates **"Display Typeface: Inter / Neue Haas Grotesk"** (Bold 80pt / Bold
  36pt / Regular 16pt), alternative **Akzidenz-Grotesk**. Manrope appears nowhere in the deck.
- SDD §10 makes **Manrope** the Talents display face; Inter the UI/body face.
- `docs/brand/README.md` §Authority rule 3: project-specific enhancements "may supplement these
  sources but **must not contradict them**."

**By authority order the SDD wins and Manrope stands.** But this is a contradiction of the
corporate display face, not a supplement, so rule 3 is engaged. Two sub-points agree across both
sources and are safe either way: uppercase ~12px wide-tracked UI labels (brand p.17 "UI / LABEL —
UPPERCASE 12PT WIDE TRACKING"; SDD §10), and no serif product chrome (SDD §10; the deck contains
no serif).

**Action:** proceed on Manrope per authority order; obtain explicit senior confirmation before the
type system is locked. Recorded as **U-14**.

### C-3 — Product lockup: `SODALES | TALENTS` vs the official `SODALES / DIVISION` system — **NEEDS SIGN-OFF**

The brand PDF defines a complete, official sub-brand system that Revision 1 did not have sight of:

- **p.10 "Sub Brand"** — "The SODALES ecosystem is built around **five specialized divisions**":
  `/ STUDIO`, `/ CINEMA`, `/ PERSONA`, `/ LABS`, `/ ACADEMY`.
- **Construction:** the corporate wordmark, with the division set **below it**, left-aligned to the
  wordmark, as `/ NAME` in a **bold italic grotesque**, in a **division-specific colour**
  (pp.10–15). Sampled: STUDIO ≈`#414A89`, CINEMA ≈`#A01C25`, PERSONA ≈`#5F2C81`,
  LABS ≈`#3B743C`, ACADEMY ≈`#CB7E29`.
- **p.21 "Website"** — division sites put `[icon] SODALES / LABS` and `SODALES / CINEMA` in the
  site header. This is the official pattern for exactly the surface the SDD is specifying.

Three distinct problems follow:

1. **Separator.** SDD §10 / §14 specify a **pipe**: `SODALES | TALENTS`. The official system uses a
   **slash**: `SODALES / TALENTS`.
2. **Talents is not one of the five named divisions.** Neither is Store. (The contract §5 app roster
   is Academy, Persona, Cinema, Talents, Store; the brand's five are Studio, Cinema, Persona, Labs,
   Academy.) So there is no approved Talents division mark, and no approved Talents division colour.
3. **Division colour.** SDD §10 assigns Electric Violet as "the Talents division signal". The
   nearest official division colour, STUDIO's, is a related violet. Whether Talents may take
   Electric Violet as its division signal is a brand call, not an implementation call.

**What is *not* blocked:** the official standalone icon mark and the official horizontal
icon + wordmark lockup both exist (brand pp.5, 6, 9), in violet, white-on-Obsidian and
black-on-white (p.8). SDD §14's rule is "no geometric icon is **approximated**" — using the
official symbol asset is compliant; drawing a lookalike is not.

Recorded as **U-5**, upgraded.

### C-4 — Design-system surface language: contract §5 vs SDD §10 — **RESOLVED, and broader than recorded**

This is the largest structural finding of Revision 2. `HANDOVER.md` anticipated only the accent
colour; in fact most of `neon-app-setup.md` §5's *visual* guidance is superseded for Talents.
The contract's §5 **structure** still binds (SDD §4c explicitly adopts "sidebar layout per patterns
doc §5"); its **surface styling** does not.

| Topic | Contract §5 | SDD §10 / §4a | Governs |
| --- | --- | --- | --- |
| Card surfaces | `rounded-xl border bg-card`, `shadow-sm`, `p-6` | "flat and precise", "restrained borders", "minimal shadows", "square/editorial image frames" | **SDD** |
| Directory layout | feature grids; card grids | "editorial bordered row"; "no generic elevated card grid" | **SDD** |
| Home categories | card grid | "indexed editorial list rather than a generic card grid" | **SDD** |
| Gradients | "hero with gradient/typographic composition"; "use gradients" | "no … decorative gradient" | **SDD** |
| Hover motion | `hover:-translate-y-0.5` | flat, restrained; motion supports hierarchy | **SDD** |
| Container width | `max-w-6xl` (marketing `max-w-5xl`) | "`max-w-7xl` public composition" | **SDD** |
| Fonts | `geist` package, `--font-geist-sans`; serif (Georgia) display permitted | `next/font/google` Manrope + Inter; "No serif product chrome is introduced" | **SDD** |
| Avatars | "initials avatars" | type-led; "never invents portraits or faux identity assets" | **SDD** |
| Header | "sticky translucent … `bg-background/80 backdrop-blur`" | "sticky restrained header" | **SDD** (translucency is a judgement call within "restrained") |
| Images | "No external images ANYWHERE" | locally bundled hero, "no runtime image-CDN dependencies" | **compatible** — both forbid external hosts |
| Toaster | `<Toaster richColors position="top-right" />` | identical | **agree** |
| `Button asChild` (Radix Slot) | required | SDD §10 repeats it | **agree** |
| Admin shell structure (route group, sidebar, `Table` in `Card`, `DropdownMenu` row actions, `requireRole("admin")` first) | required | SDD §4c adopts it by reference | **contract** |

**Resolution:** for Talents, read contract §5 as *structure + primitives + quality bar*, and SDD §10
as *the visual language*. Where they differ on surface treatment, SDD §10 wins.

### C-5 — Dev server: forbidden by the contract, required by the SDD and by Claude's role — **UNRESOLVED (U-9)**

- Contract §1: "**NEVER** run a dev server (ports 3000-3005 are busy with the orchestrator's Docker
  stack). Verify with `build`, `typecheck`, `lint` instead."
- SDD line 3: "`apps/talents`, **dev port 3004**".
- `CLAUDE.md` §Claude Ownership: "visual review in browser".

The contract's prohibition is premised on an orchestrator Docker stack that, per the confirmed
senior decision, does not exist here. Not resolvable by authority order — it is a factual question
about this machine.

### C-6 — Command environment: the contract assumes infrastructure that does not exist — **UNRESOLVED (U-9)**

Contract §1/§2 assume: the repo lives in WSL at `/home/reymar/Programming/Sojales`; an orchestrator
has already written `.env.local`; dependencies are "already installed"; `pnpm install` must never be
run; `git` must never be run ("the orchestrator commits"); `scripts/db-smoke.mjs` already exists.

Actual state: repo at `e:\Projects\SodalesTalent\sodales-talents-dev` on Windows; no
`.env.local`; no `node_modules`; no `scripts/`; no orchestrator. `AGENTS.md`
§"Development Workflow" meanwhile instructs agents to "work from an isolated feature
branch/worktree" — which requires git.

Every one of the contract's §7 definition-of-done commands is currently unexecutable.

### C-7 — Missing documents cited as binding

| Cited file | Cited by | Status |
| --- | --- | --- |
| `docs/brand/website-guidelines.md` | SDD §10 ("the visual source of truth") | **Resolved** — `docs/brand/README.md` records the senior developer's substitution of the Canva deck / PDF. |
| `docs/sdd/00-platform.md` | contract §4c | **Missing.** Cited for schema conventions; the conventions actually needed are restated inline in §4c, so impact is low. |
| `scripts/db-smoke.mjs` | SDD §14, §15; contract §1, §4e, §7 | **Missing, and no reference copy exists to follow.** SDD §14 makes `node scripts/db-smoke.mjs talents` an acceptance criterion, but nothing defines what it must assert. See **U-10**. |

The Academy document independently reports the same class of gap (Academy §18.5), which supports
treating this as a programme-wide documentation problem rather than a Talents-specific mistake.

---

## 5. Section A — Explicit source requirements

Consolidated for implementation reference. Everything here is traceable to a citation. Items
already tabulated in §2 are not repeated.

### A-1 Stack and platform
Next.js 15 App Router · TypeScript · Tailwind v4 · `@sodales/ui` · Neon Postgres + Neon Auth ·
Drizzle ORM · zod v4 (SDD lines 5–6). Neon project `sodales-talents`
(`weathered-salad-79846921`, aws-ap-southeast-1) (SDD line 4). Vercel project `sodales-talents`,
root `apps/talents`, region `sin1` (SDD §16). Dev port 3004 (SDD line 3 — see **C-5**).

### A-2 Data model (SDD §6)
Seven tables, snake_case, UUID PKs, `pgEnum` statuses: `user_role`, `talent_category`,
`talent_profile`, `talent_skill`, `talent_portfolio_link`, `inquiry`, `profile_moderation`.
`user_role.user_id` and `talent_profile.user_id` are UNIQUE and reference the Neon Auth user id
with **no cross-schema FK** — enforced in code (SDD §6; contract §4c). Skills and links cascade
from profile. `talent_skill` is UNIQUE on (`profile_id`, `name`).

### A-3 Validation (SDD §7)
Inquiry: name 2–80, valid email, message 20–2000, hidden `website` honeypot must be empty.
Profile: `displayName` 2–80, `headline` 10–120, `bio` 50–2000, `location` 2–80, `categoryId` uuid
(must exist), `slug` `^[a-z0-9]+(-[a-z0-9]+)*$` 3–60 unique (server-checked, excluding own
profile), `skills` 1–15 × 1–40 chars deduped, `links` 0–8 × { label 1–60, `z.url()` starting
`https://` }. Auth: name 2–80, email, password ≥ 8. Moderation note trimmed, ≤ 1000 chars.
Every update must verify its affected-row count before reporting success.

### A-4 Auth (SDD §8; contract §3)
`createNeonAuth` server instance; `auth.handler()` at `/api/auth/[...path]`;
`auth.middleware({ loginUrl: "/login" })` with matcher `/dashboard/:path*`, `/admin/:path*`,
`/api/auth/:path*`; `createAuthClient`; `useActionState` server actions; cached `getSession`;
`requireUser` / `requireRole`. Sign-up creates the `talent` role row **and** a draft profile, slug
derived from name and uniquified with a numeric suffix. Sign-in self-heals role/profile rows
**without ever overwriting an existing `admin` role**. Provisioning prefers the auth response's
user id, falls back to a bounded lookup retry for replication lag, verifies the rows, and only then
redirects.

### A-5 Seed (SDD §9; contract §4e)
Idempotent. First-admin bootstrap POSTs `${NEON_AUTH_BASE_URL}/sign-up/email` with the
**required `origin` header** and `content-type: application/json`; `USER_ALREADY_EXISTS` counts as
success; other failures warn and continue. Then upsert `user_role(admin)`, promoting a stale talent
role. Six demo talents; four approved (Lena/Design, Marco/Development, Yuki/Photography,
Priya/Writing), Tomás/Video **pending**, Nadia/Music **hidden** with a historical
`profile_moderation` row. Six categories. Four inquiries across `new`/`read`/`archived`.
`ON CONFLICT DO NOTHING` throughout. `ADMIN_EMAIL` and other env values are never printed
(contract §1 hard rule). Internally consistent: SDD §15's "directory shows 4 approved talents only"
matches §9's roster exactly.

### A-6 States, SEO, performance
`loading.tsx` for directory, profile detail, dashboard, dashboard profile, each admin list, admin
profile review, inquiry detail — each `aria-busy="true"` with an SR announcement (SDD §11).
Designed empty states, root `error.tsx` + `not-found.tsx` (SDD §11). Metadata template
`%s | Sodales Talents`; `generateMetadata` on `/talents/[slug]`; `robots: { index: false }` on
dashboard and admin (SDD §13). Server components throughout; SQL-level filtering and search;
aggregated subqueries (no N+1); featured profiles limited in SQL; one pooled client
(`prepare: false`, `max: 10`); `revalidatePath` after mutations (SDD §17; contract §4a).

### A-7 Definition of done (SDD §14; contract §7)
`db:generate` → `db:migrate` → `db:seed` succeed and are re-run safe · `node scripts/db-smoke.mjs
talents` passes · `pnpm --filter @sodales/talents typecheck && lint && build` green.

---

## 6. Section B — Confirmed senior-developer decisions (preserved)

Carried forward from `HANDOVER.md` unchanged in substance.

- **B-1.** There is **no** existing Sodales monorepo or starter repository. The developer creates
  the foundation. Do not assume a missing external monorepo exists. *(Corroborated: Academy §11 D-5
  shows the programme has not standardised on one repo. Classification refined in **H-4**.)*
- **B-2.** No official `talents-studio-hero.png` exists. Its absence does **not** block scaffolding
  or hero layout construction, but final visual/acceptance compliance requires it. It must not be
  replaced with invented or generated artwork unless explicitly approved.
- **B-3.** No official `SODALES | TALENTS` product lockup exists. Available official assets: the
  standalone geometric symbol and the horizontal corporate wordmark. Construction of the lockup is
  an open design decision. *(Upgraded by **C-3**.)*
- **B-4.** The Canva **SODALES Brand Identity Guidelines** replace the missing
  `docs/brand/website-guidelines.md` as the corporate brand source (`docs/brand/README.md`).
- **B-5.** Where a non-SDD document carries a generic Talents accent, the Talents SDD wins.
  *(Now evidenced — **C-1**.)*
- **B-6.** References (Lusion, Toptal, Academy) are inspiration only and never override Sodales
  requirements.

---

## 7. Section C — Approved supplemental decisions

Approved for the project; **not** original SDD requirements. Keeping this boundary visible is a
standing `AGENTS.md` rule.

- **S-1. `prefers-reduced-motion` support.** Explicitly recorded as supplemental in `HANDOVER.md`
  and `CLAUDE.md` ("Reduced-motion support is an approved supplemental design requirement").
  Absent from SDD §12. `CLAUDE.md` adds: reduced motion must have a *clearly specified alternative*,
  not merely a disabled animation.
- **S-2. Brand motion direction.** The SDD specifies **no motion system at all** — verified by full
  read. The first-load entrance (Obsidian → restrained brand moment → official symbol → reveal →
  Soft Ivory) and the short branded route transition are **candidate** concepts in `HANDOVER.md`
  and `CLAUDE.md`, not requirements.
- **S-3. Motion restraint rule.** No long brand animation for search/filter, dialogs, saves, admin
  mutations, or ordinary controls (`HANDOVER.md`, `CLAUDE.md`).
- **S-4. Responsive breakpoints** ~375 / 768 / 1280 / 1440 px (`CLAUDE.md`). Not in the SDD.
- **S-5. Agent role split.** Claude owns UI/UX and motion *design*; Codex owns backend, domain,
  concurrency and animation *implementation* (`CLAUDE.md`, `AGENTS.md`).

---

## 8. Section D — Unresolved questions

Fourteen. **None is resolved or guessed at here.** Where a source contains partial evidence, the
evidence is quoted and the question is still left open.

### U-1 — Draft-profile database representation *(carried forward)*
Sign-up creates a draft profile before publication fields exist (SDD §8), and the dashboard has a
completeness checklist (SDD §4b) — so the schema must permit incomplete rows. SDD §6 does not state
nullability for any column.

Narrowing what is *not* in question: `slug` must be NOT NULL + UNIQUE (contract §4c "Public slugs:
`.notNull().unique()`"; SDD §8 derives it at sign-up), and `display_name` is available from the auth
name at sign-up. **Genuinely open:** `headline`, `bio`, `location`, `category_id`. Note
`category_id` is a uuid FK, so "empty string" is not available to it — the choice there is
nullable vs. a seeded default category. **Decision needed:** nullable, sentinel-empty, or another
contract-defined representation, per column. `AGENTS.md` §"Database Rules" explicitly reserves this.

### U-2 — Definition of "material edit" *(carried forward)*
SDD §4b requires an approved profile to return to `pending` after a *material* edit and §14 makes it
an acceptance criterion, but no source defines which fields are material. Undefined at minimum:
whether slug-only, skill-reorder, or link-label changes qualify. **Do not invent the definition.**

### U-3 — Hidden-profile editing *(carried forward)*
SDD §4b defines edit-driven transitions for **approved** and **pending** only. SDD §5.4 says a
talent with a hidden profile "can edit + resubmit (`pending` again)", which *reads as* edit leaving
the status at `hidden` until an explicit resubmit — but it does not say so. **Decision needed:**
what `hidden` + edit + no resubmit yields. Stated as evidence, not as a resolution.

### U-4 — Inquiry archive transition *(carried forward, sharpened into two questions)*
SDD §5.3 describes the happy path "new → read → archived". SDD §4c lists row/detail actions as
"mark **read** / **unread** and **archive** / **restore**", which reads as two independent axes.
**(a)** Is `new → archived` valid directly? **(b)** What status does *restore* return an archived
inquiry to — `new` or `read`? Both undefined.

### U-5 — Product lockup *(carried forward, upgraded — see C-3)*
Three linked decisions: **(a)** separator — the SDD's `|` or the brand's official `/`;
**(b)** whether Talents is an approved sub-brand division at all, given the deck names five and
Talents is not among them; **(c)** if it is, its division colour, and whether Electric Violet is
available for it. The Academy precedent — "`SODALES | ACADEMY` sets only the product half in Inter"
(Academy §10) — is a **reference-only** precedent and, per `AGENTS.md`, cannot settle this.

### U-6 — Hero image *(carried forward)*
`/media/talents-studio-hero.png` (SDD §10) is required by SDD §14 to be responsive, locally served
and alt-described. Not supplied. Layout may proceed with an explicitly documented placeholder
(`CLAUDE.md` permits a placeholder only when documented as one); final acceptance cannot be claimed
without the asset or an approved change to the requirement.

### U-7 — Seed credential safety *(carried forward)*
SDD §9 and contract §4e both hard-code `sodales-admin-2026!` and `sodales-demo-2026!`. Neither
document restricts `db:seed` to development. Contract §4d frames the workflow as dev-branch;
SDD §16 mentions only migrations for production and does not mention seeding. **Decision needed:**
is `db:seed` development-only, and if production can execute it, what protects those credentials?

### U-8 — Auth middleware and `/api/auth/:path*` *(carried forward, sharpened)*
Both authoritative sources prescribe the identical matcher including `/api/auth/:path*`
(SDD §3; contract §3c), and the contract must be "followed exactly". The risk is behavioural, not
textual: if `auth.middleware` treats every matched path as requiring a session, an anonymous
browser POST to `/api/auth/sign-up/email` redirects to `/login` and sign-up cannot complete.

Scope note: the seed is **not** affected — it calls `${NEON_AUTH_BASE_URL}/sign-up/email`
server-to-server (SDD §9, contract §4e), bypassing Next middleware entirely. Only browser
sign-up/sign-in is at risk. **Resolution is empirical:** keep the matcher verbatim and verify
anonymous sign-up and sign-in end-to-end at first wiring. Do not "fix" it by editing the matcher
ahead of evidence.

### U-9 — Command environment and execution contract *(new — see C-5, C-6)*
The contract's operating premises (WSL path, orchestrator-written `.env.local`, pre-installed
dependencies, no `pnpm install`, no `git`, no dev server) do not hold for this repository.
**Decisions needed:** (a) who provisions Neon and writes `.env.local`; (b) whether `pnpm install`
is authorised for the initial workspace; (c) whether agents may run `git` here, given `AGENTS.md`
requires branch/worktree discipline; (d) whether a dev server on port 3004 is authorised — this
one directly gates `CLAUDE.md`'s "visual review in browser".

### U-10 — `scripts/db-smoke.mjs` *(new)*
An acceptance criterion (SDD §14) with no reference implementation and no specification of what
`node scripts/db-smoke.mjs talents` must assert. Contract §4e/§1 refer to it as pre-existing.
**Decision needed:** supply the shared script, or define the Talents assertions.

### U-11 — `NEON_AUTH_COOKIE_SECRET` provenance *(new)*
Contract §3a signs session cookies with
`process.env.NEON_AUTH_COOKIE_SECRET ?? "dev-insecure-secret-32-chars-min!!"`, but contract §2's
`.env.local` inventory does **not** list that variable, and SDD §16's Vercel env list names only
`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_AUTH_*`, `ADMIN_EMAIL`. If the variable is unset in
production, every session cookie is signed with a secret published in this repository.
**Decision needed:** confirm the variable is set in Vercel, and whether the code should fail closed
rather than fall back outside development. Flagged as a security item, not a style preference.

### U-12 — Migration connection: pooled vs unpooled *(new)*
Contract §4b's `drizzle.config.ts` reads `DATABASE_URL` — the **pooled** URL (contract §2) — while
`DATABASE_URL_UNPOOLED` exists and is provisioned (SDD §16). Migrations over a transaction-pooled
endpoint are a known operational hazard. **Decision needed:** confirm the contract is to be
followed verbatim, or whether migrations should target the unpooled URL. Not changed unilaterally —
the contract is binding.

### U-13 — Next.js 15 vs 16 *(new)*
SDD line 5 specifies Next.js 15 and contract §3c specifies `src/middleware.ts`. The Academy document
(dated 2026-09-03) records that 16.3.4 is current stable, that `middleware.ts` is deprecated in
favour of `proxy.ts`, that `params`/`searchParams`/`cookies()` are async, and that `next lint` is
removed. That is a **reference** observation with no authority over Talents. **Decision needed:**
confirm Talents stays on 15 (default reading of the SDD), or approve 16 and accept the middleware
consequence for A-4/U-8.

### U-14 — Display typeface confirmation *(new — see C-2)*
Manrope stands by authority order but contradicts the brand deck's display face. Needs explicit
senior confirmation before the type system is locked.

---

## 9. Section E — Implementation proposals

**Non-binding.** Offered so review can accept, reject or ignore them. None is a requirement and
none resolves anything in §8.

- **P-1. Record the audit trail in-repo.** Revision 1 was lost when the previous agent's session
  ended, which is exactly the failure `AGENTS.md` §"Cross-Agent Collaboration" warns about. Keeping
  audits under `docs/audits/` and linking them from `HANDOVER.md` prevents a recurrence.
- **P-2. Commit the reference screenshots, or record them as non-portable** (see **H-3**).
- **P-3. Add a conflict-resolution note to `HANDOVER.md`** capturing **C-4** — that contract §5 is
  *structure and primitives* for Talents while SDD §10 is *the visual language*. It is the single
  most likely thing for a future agent to get wrong, because contract §5 reads as prescriptive.
- **P-4. Contrast guardrails.** Computed from the approved palette (WCAG 2.x, sRGB), so the design
  system starts from verified numbers rather than assumption:

  | Pair | Ratio | Use |
  | --- | --- | --- |
  | `#5E4FB3` on `#F4F2ED` | **5.78:1** | passes for normal text |
  | `#F4F2ED` on `#5E4FB3` | **5.78:1** | passes — violet buttons take an ivory/white foreground |
  | `#111111` on `#5E4FB3` | **2.92:1** | fails — never put Obsidian text on a violet fill |
  | `#5E4FB3` on `#111111` | **2.92:1** | fails — this is precisely why SDD §10 mandates `#887BD8` on Obsidian |
  | `#887BD8` on `#111111` | **5.28:1** | passes |
  | `#35373B` on `#F4F2ED` | **10.66:1** | passes |
  | `#8072D2` on `#F4F2ED` | **3.57:1** | fails — supporting tone only, never body text on ivory |
  | `#DAD4F5` on `#111111` | **13.2:1** | passes |
  | `#F4F2ED` on `#2A2440` | **13.2:1** | passes |
  | `#887BD8` on `#2A2440` | **4.12:1** | fails — do not put the accessible tint on the deep violet surface |

  Note for **S-2**: the brand deck itself renders the mark in `#5E4FB3` directly on Obsidian
  (pp.25–26) at 2.92:1. Acceptable for large decorative artwork; if the proposed entrance animation
  puts the symbol on Obsidian at small size or pairs it with text, it needs `#887BD8`.
- **P-5. Skip a dark-mode toggle.** Contract §5 calls `next-themes` "optional per app"; the SDD
  specifies a single ivory-and-Obsidian system with no dark variant. Adding one would multiply the
  contrast surface for no stated requirement.
- **P-6. Sequence U-9, U-10 and U-11 before Step 12.** They are environment and infrastructure
  questions, not product questions, so they can be answered in parallel with — and need not wait
  for — the `/grill-me` product clarification round.

---

## 10. Readiness assessment

**Blocking for scaffolding (Step 13+), not for Step 12:** U-9 (nothing can be installed, run or
verified until the execution contract is settled), U-10 (an acceptance criterion with no
definition).

**Blocking for schema finalisation:** U-1. `AGENTS.md` §"Database Rules" already forbids inferring
nullability from UI validation, so this must be answered before the first migration is generated.

**Blocking for domain implementation:** U-2, U-3, U-4.

**Blocking for final visual acceptance, not for construction:** U-5, U-6, U-14.

**Security items to close before any production deploy:** U-7, U-11.

**Verify empirically at wiring time, do not pre-emptively change:** U-8, U-12, U-13.

Nothing found in this audit contradicts a confirmed senior decision. `HANDOVER.md` remains the
current cross-agent project state, with the nine corrections in §3 applied.

---

## 11. Appendix — brand PDF page map

Recorded because the PDF has no text layer and cannot be searched.

| Page | Content |
| --- | --- |
| 1 | Cover — violet ground, white icon + wordmark, positioning statement |
| 2 | Brand Story — Convergence; Collective / Intelligence |
| 3 | Brand Mark — construction rationale; stacked lockup with "CREATIVE INTELLIGENCE COLLECTIVE" |
| 4 | The Logo — rationale + stacked lockup |
| 5 | Logo System — **icon mark**, **word mark** (reversed on violet) |
| 6 | Logo System — **vertical mark**, **horizontal mark** (reversed on violet) |
| 7 | Clear-space / construction grid, stacked lockup |
| 8 | Reversed and single-colour lockups — white-on-black, black-on-white |
| 9 | Clear-space / construction grid, **horizontal** lockup |
| 10 | **Sub Brand** — five divisions: `/ STUDIO`, `/ CINEMA`, `/ PERSONA`, `/ LABS`, `/ ACADEMY` |
| 11–15 | One page per division, each with its `/ NAME` lockup and remit |
| 16 | **Colour Palette** — `#5E4FB3`, `#F4F2ED`, `#35373B`, `#111111`; "Electric Violet is used sparingly" |
| 17 | **Typography** — display **Inter / Neue Haas Grotesk**; alternative Akzidenz-Grotesk; UI label uppercase 12pt wide tracking |
| 18 | Applications — app icon, social avatar |
| 19–20 | Business card, stationery |
| 21 | **Website** — division site headers render `[icon] SODALES / LABS`, `SODALES / CINEMA` |
| 22–24 | Social media, mobile apps, ID badges |
| 25–26 | Closing — mark and wordmark on Obsidian |

---

READY FOR HUMAN REVIEW — REVISION 2
