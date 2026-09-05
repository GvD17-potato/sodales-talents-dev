# Sodales Talents — Step 12B UI / Brand / Motion Decisions

## Status

Human-approved, expedited (testing-milestone deadline).

All eight decisions below are **APPROVED**. Decisions 7 and 8 were resolved
under deadline mode rather than the one-at-a-time interview format used for
Decisions 1–6, then approved together with one wording correction to Decision
7 (Inquiry Dialog).

**Revision note (post-milestone):** Decisions 3 and 4's visual mechanism were
subsequently revised by explicit product direction from "symbol scales →
disappears → destination appears" to the **Sodales Brand Aperture**
concept — the symbol's own silhouette used as a look-through mask/aperture
into the already-rendered destination, with heavy overlap between symbol
scale, violet-fill fade, destination reveal, and Obsidian recession. This
revision explicitly **supersedes** the original Decision 3 language "a
'curtain pull,' not a precise clip-path/mask of the symbol's own geometry."
Cadence, timing ranges, skip/interruption behaviour, and route-transition
scope rules are unchanged. The revision introduces one new, unresolved
implementation blocker — see each revised decision's "Implementation
constraints" and "Remaining UI / Motion Blockers" below.

Owned by Claude Sonnet (UI/UX and motion design intent) per `CLAUDE.md`.
Production animation code, dialog implementation, and technique choices remain
Codex's to implement per `AGENTS.md`.

---

## Decision 1 — `SODALES | TALENTS` Lockup Construction

**Final decision:** One shared `BrandWordmark` component. Base = official
horizontal mark (icon + official `SODALES` wordmark), unmodified — no redraw,
no approximation. `| TALENTS` appended typographically in Inter, uppercase,
restrained wide tracking. Manrope is unaffected (it remains the display
typeface elsewhere).

No icon-only mobile fallback: the full lockup is preserved at every SDD-
required shell size (public header, footer, auth shell, admin shell) via
proportional scaling, restrained spacing adjustments, and surrounding-
navigation simplification. If the full lockup genuinely cannot fit even after
these techniques, that is flagged for human review — it is never silently
resolved by switching to icon-only.

Colour: on light/Soft-Ivory chrome, the official mark stays in its approved
dark treatment, `TALENTS` is set in Electric Violet `#5E4FB3`, and the
separator stays visually restrained. On Obsidian/dark chrome, an approved
reversed/light treatment is used; Electric Violet is not forced onto small
lockup text if contrast is insufficient. This is one component with two
approved colour variants, not two different lockup designs.

Clear space: the official horizontal mark's clear-space proportions are
preserved and extended around the appended `| TALENTS` text.

**Reason:** SDD §10/§14 require a single shared lockup that literally reads
`SODALES | TALENTS`; no pre-made asset exists, so its construction had to be
specified; the senior developer confirmed the Talents SDD governs over the
brand deck's slash-based corporate sub-brand system.

**Source basis:** SDD §10, §14 (lockup requirement, "no approximated icon,"
Electric Violet used sparingly, Inter for UI labels); senior developer
decision (pipe separator; Talents SDD governs over the brand deck); brand PDF
pp.5–6, 8–9 (official horizontal/vertical marks and clear-space grids, used
only as the asset source, not as governing typography).

**Design implications:** single reusable component rather than a bespoke
per-context lockup; light/dark colour variants defined once.

**Responsive implications:** full identity preserved at 375/768/1280/1440 —
mechanism specified in Decision 8.

**Accessibility / reduced-motion implications:** not a motion decision. The
dark-chrome variant's contrast must meet 4.5:1 — plain `#5E4FB3` on Obsidian
may need the accessible tint (`#887BD8`-style) instead of the full corporate
violet for small lockup text; this was explicitly flagged, not assumed safe.

**Implementation constraints for Codex:** one `BrandWordmark` component with a
light/dark variant switch; no SVG redraw/distortion of the official assets;
enforce minimum clear space; never truncate `TALENTS`; escalate rather than
silently fall back to icon-only.

**Remaining uncertainty:** exact contrast-safe violet treatment for `TALENTS`
on dark chrome is not numerically finalized — verify at build time against the
real type size in the browser.

---

## Decision 2 — Missing Hero-Image Treatment

**Final decision:** Reserve the intended hero-media frame in the layout. Fill
it with a flat approved Sodales brand ground and the official Sodales symbol
only — no redraw, no distortion.

Do NOT use: stock photography, AI-generated people/portraits, invented
NICO/MARA imagery, external image/CDN placeholders, fake documentary imagery,
a broken-image state, or copy implying the placeholder is the final hero
image.

Frame ratio vs. real dimensions: the real asset's intrinsic dimensions are
unknown, so no claim is made about matching them exactly. Decision 8 / the
visual specification defines the intended hero container aspect ratio and
crop behaviour; that stable frame is reserved now so the composition doesn't
collapse. When the real NICO/MARA asset arrives, its true intrinsic
dimensions are fit/cropped into the approved frame; if its composition
materially conflicts with the planned crop, that is flagged for visual
review rather than distorting the image.

Accessibility: the placeholder symbol is treated as decorative (`alt=""` /
equivalent) — the hero already carries visible branding elsewhere, and the
placeholder is not page content. Screen readers are not forced to announce
placeholder/development information. Final alt text for the real photograph
is determined from its actual semantic content when it arrives — no factual
alt text is pre-written for an image not yet received. The placeholder may be
visibly polished; its temporary status is documented in project/design
documentation, not exposed as a public "coming soon" message.

**Reason:** satisfies "never invent an official asset / talent portrait"
while avoiding a visibly broken layout; keeps layout stable without inventing
unknown source dimensions; gives the placeholder its correct accessibility
treatment as decorative filler.

**Source basis:** SDD §10 (hero photo requirements — `next/image`, responsive
sizing, stable aspect ratio, alt text, no CDN dependency); `HANDOVER.md`
Unresolved 6 / `CLAUDE.md` (a placeholder is permitted only when explicitly
documented as one; never an invented official asset).

**Design implications:** the hero layout can be built and reviewed today
without the final photograph existing.

**Responsive implications:** exact frame aspect ratio/crop plan is set in
Decision 8.

**Accessibility / reduced-motion implications:** `alt=""` decorative
treatment during the placeholder period; no motion is attached to this
element, so no reduced-motion implication.

**Implementation constraints for Codex:** `next/image` with dimensions
reserved from the visual spec; the swap-in path for the real asset must not
require a layout rewrite; alt text is a separate, later decision tied to the
real photo.

**Remaining uncertainty:** exact hero frame aspect ratio not yet numerically
fixed (addressed in Decision 8); real asset delivery date remains unknown
(`HANDOVER.md` Unresolved 6, unchanged, non-blocking for testing).

---

## Decision 3 — First-Load Branded Entrance ("Sodales Brand Aperture")

**Final decision:**

*Cadence:* unchanged — runs at most once per browser session, and only when
the first pageview of that session is `/`. A first pageview that is a deep
link (e.g. `/talents/[slug]`, `/login`, `/dashboard`, `/admin`) never shows
it. Internal navigation never replays it. Refreshing `/` later in the same
session does not replay it.

*Visual concept — Brand Aperture:* the official Sodales symbol's own
silhouette becomes a look-through aperture into the destination page, which
is already rendered underneath the entrance from the start (not mounted
late). The feeling is "moving through the brand mark into the product," not
"a logo plays, then the page appears." **This explicitly supersedes** the
original Decision 3 wording that ruled out using the symbol as "a precise
clip-path/mask of the symbol's own geometry" — that restriction no longer
applies; the symbol's true, unaltered geometry is now the mask.

Target sub-phase timing (design intent, not frame-exact; Codex tunes exact
values during browser review):

| Window | Behaviour |
| --- | --- |
| 0–180ms | Obsidian field already present (must cover first paint — no homepage flash) |
| 120–350ms | Violet-filled symbol resolves at center |
| 350–550ms | Brief composed hold |
| 500–750ms | Destination begins becoming visible through the symbol's exact silhouette |
| 650–1250ms | Symbol undergoes a strong, smooth scale toward the viewer; the violet fill's opacity is *independently* reduced across this same window, so the destination reads more clearly through the aperture as it enlarges |
| 900–1350ms | Surrounding Obsidian field simultaneously fades/recedes |
| 1250–1450ms | Symbol passes beyond the viewport edges; violet fill is fully gone; destination reaches full clarity |

*Overlap principle (critical):* symbol scale, violet-fill fade, destination
reveal, and Obsidian recession must overlap substantially — the destination
must never wait for the symbol animation to "finish" before it starts
becoming visible. A sequence that reads as "logo finishes → overlay
disappears → page suddenly appears" is explicitly the wrong result.

*Geometry constraint (unchanged from the original decision):* no redraw, no
approximation, no distortion of the symbol. The mask must use the symbol's
real geometry, not a shape derived, traced, or regenerated from it.

*Duration:* the sub-phase table above targets ~1.45s total, consistent with
the original approximately 1.0–1.6 second range — design intent, not a
frame-exact requirement; Codex may tune during browser review while
preserving the overlap principle and maximum-restraint principle.

*Design goal:* cinematic, editorial, fluid, premium, brand-specific. Explicitly
**not**: a loader, a spinner, a gaming-style transition, a "Marvel-style"
theatrical intro, a glitch effect, or a flashy tech demo. The Sodales
identity itself is the transition language — no generic transition effect
should be recognizable independent of the brand mark.

*Progress:* no percentage, no counter, no progress bar, no fake measured
loading state. The entrance is decorative brand motion, not a loading screen;
the actual homepage renders normally underneath/behind it, and the motion
must not be used to artificially delay data or content readiness.

*Interruption/skip:* the user must be able to dismiss it early. Escape
dismisses it; a deliberate tap/click on the entrance surface may dismiss it;
a keyboard interaction intended specifically to dismiss/continue may dismiss
it. No visible mandatory "Skip intro" control unless later usability testing
shows it's needed. Once dismissed, transition immediately to the normal page
state with no replay that session. Exact event handling is Codex's
implementation decision and must preserve normal interaction/accessibility
behaviour.

**What must NOT happen:** no Lusion percentage-counter imitation, no
digit-flip imitation, no diagonal-panel-wipe imitation, no WebGL/3D brand
scene, no heavy theatrical sequence, no loader/spinner language, no
gaming-style transition, no glitch effect, no flashy-tech-demo feel, no
replay on normal navigation/filters/dialogs/saves/form actions/admin
mutations, no artificial waiting for the animation's sake, no distortion/
redrawing/approximation of the official symbol's geometry.

**Reason:** the original scale-and-disappear mechanic read as "a logo plays,
then the page appears" — two discrete beats with a hard cut between them.
The Brand Aperture concept replaces this with one continuous, overlapping
gesture built from the identity mark itself, which reads as more cinematic,
more premium, and more brand-specific, while preserving every previously
approved restraint principle (once-per-session, home-only, no fake loading
state, no theatrical excess).

**Source basis:** the candidate first-load concept already recorded in
`HANDOVER.md`/`CLAUDE.md` ("Obsidian → brand moment → symbol → symbol
becomes transition/reveal → Soft Ivory site") anticipated the symbol itself
acting as the reveal mechanism; the specific Brand Aperture mask/look-through
mechanism, its sub-phase timing, and the overlap principle are an approved
PRODUCT DECISION refining that concept, not a new SDD requirement. The broad
restraint and non-replay principle remains source/project-direction informed.

**Design implications:** the entrance is the one deliberately theatrical
moment in an otherwise restrained system; nothing else in Decisions 4–8
matches its scale. The aperture concept must remain legible as the Sodales
mark throughout — at no point should the shape read as an abstract loading
graphic disconnected from the brand.

**Responsive implications:** applies uniformly across breakpoints; mobile is
biased toward the shorter end of the duration range (Decision 8). On narrow
viewports the symbol must remain large enough, before it begins scaling, to
read clearly as the brand mark — the aperture concept fails if the mark is
too small to recognize at the moment the look-through begins.

**Accessibility / reduced-motion implications:** per Decision 5 — the
aperture scale-through (mask expansion, independent violet-fade, and the
overlapping destination reveal) is **not used** under `prefers-reduced-
motion`. Instead: Obsidian field → static centered violet symbol → a short,
opacity-only dissolve → destination. No mask expansion, no scale, no
independent fill-fade choreography. The reduced-motion version is also
materially shorter in time, not just simplified in kind (no prolonged hold
for theatrical effect); no exact millisecond value is hardcoded here. The
once-per-session/home-first cadence is unchanged under reduced motion.
Dismissal behaviour is identically available under both settings.

**Implementation constraints for Codex:**

- `sessionStorage`-based one-time flag scoped to "first pageview was `/`" —
  unchanged from the existing implementation; preserve it.
- The destination page must already be mounted and rendered in its final
  state beneath the entrance overlay from the first frame — the "look-through"
  has nothing to reveal otherwise. This is consistent with, and reinforces,
  the pre-hydration `data-sodales-entrance` attribute architecture already in
  place (no post-paint mounting).
- The violet fill must be an independently controllable layer, separate from
  the mask shape itself, so its opacity can fade on its own timeline while the
  mask continues to scale (e.g. a violet-filled copy of the symbol composited
  above the destination, with the symbol's true alpha geometry as the mask/
  clip source for the destination layer beneath it).
- Prefer animating a `transform: scale()` on the masked container over
  regenerating or resizing the mask asset itself, for performance.
- **CRITICAL / UNRESOLVED — mask asset dependency:** this technique requires
  the official Sodales symbol as a genuine alpha-channel source (SVG
  preferred, or a PNG with a real transparent background matching the exact
  official geometry). The currently committed asset
  (`docs/brand/assets/sodales-symbol.png` and its app runtime copies) is an
  **opaque PNG on a white background** — it has no alpha channel and cannot
  function as a mask today. Earlier in this same milestone, an unauthorized
  AI-generated "transparent" replacement was created, contained visible
  geometry distortion and stray-pixel artifacts, and was reverted per the
  standing brand-asset rule (no silently substituting generated artwork into
  the official brand path). That rule still governs here: **do not generate a
  new transparent asset to unblock this without an explicit human decision
  and documented provenance.** See "Remaining UI / Motion Blockers" below —
  this is a genuine implementation blocker, not a Codex-tunable detail.
- No CSS/SVG/Motion/GSAP technique is otherwise prescribed — that choice
  belongs to Codex within the approved architecture, once the mask-asset
  dependency is resolved.

**Remaining uncertainty:** exact millisecond timing for both the full-motion
and reduced-motion versions is explicitly left to Codex/browser review; the
mask-asset dependency above is unresolved and blocking, not a tuning detail;
whether the look-through is best implemented via CSS `mask-image`/
`clip-path` or an SVG `<mask>` element is an open technical question that
should be spiked once an alpha-channel asset exists.

---

## Decision 4 — Internal Route Transitions

**Final decision:**

*Which navigations receive it:* the branded Obsidian overlay is used only for
deliberate transitions between the main public/auth sections — `/` ↔
`/talents`, `/` ↔ `/login`, `/` ↔ `/sign-up`, `/talents` ↔ `/login`,
`/talents` ↔ `/sign-up`, and equivalent deliberate top-level public/auth
navigation where neither endpoint is dashboard/admin and the navigation
represents a section change. Implementation may group these by route category
rather than hardcode every pair.

*Excluded — profile drill-down:* routine talent browsing (`/talents` ↔
`/talents/[slug]`, and between two `/talents/[slug]` routes) does **not** use
the full branded overlay. These are high-frequency content-navigation actions
and must stay fast and editorial. A subtle page/content transition may be
specified later under interactive/page motion if appropriate, but it must not
be the full branded route overlay. (Not designed under this expedited pass —
see Decision 7's remaining uncertainty.)

*Never used for:* `/dashboard/*`, `/admin/*`, any navigation into or out of
dashboard/admin, search/filter/category searchParam changes, dialog open/
close (including the inquiry dialog), form saves, profile edits, admin
approve/hide, inquiry triage, ordinary state changes, browser back/forward
navigation, and routine talent profile drill-down as defined above.

*Visual treatment (revised — fast Brand Aperture):* the same Brand Aperture
language as Decision 3, compressed and made significantly faster: a brief
Obsidian takeover → a small violet symbol resolves at center (smaller than
the Decision 3 entrance symbol) → the destination (already rendered
underneath) becomes visible through the symbol's exact silhouette almost
immediately → a fast scale-through while the violet fill fades and the
Obsidian field clears, with the same overlap principle as Decision 3 (no
discrete "logo finishes, then page appears" cut) → destination at full
clarity. No counter, no progress bar, no loader language, no Lusion
panel-wipe imitation, no symbol redraw/distortion/approximation. It must
read as a brief brand punctuation mark, not another intro — the long
composed hold from Decision 3 (350–550ms) is not replayed here.

*Duration:* target approximately 550–750ms total — an approved design
target, not an exact technical requirement; Codex may tune it during browser
review with the goal that it remains clearly shorter and less theatrical than
Decision 3. This uses the same layered technique as Decision 3 (violet fill
as an independent, separately-fading layer over the destination revealed
through the symbol's true geometry as mask), so it carries the same
**mask-asset dependency** flagged in Decision 3's implementation constraints
— it cannot be implemented before that dependency is resolved either.

*Loading/data readiness:* the transition is independent from real loading. It
must not be extended simply because destination data is slow; if the
destination isn't ready after the normal transition duration, the
SDD-required route/loading state takes over. The branded transition decorates
navigation; it does not measure loading, does not replace `loading.tsx`, and
does not become a waiting screen.

*Rapid/interrupted navigation:* if another navigation occurs while the
branded transition is active, transitions are not queued or stacked — the
latest valid navigation wins, and the current transition may be
shortened/cancelled cleanly. Exact cancellation/event mechanics are Codex's.

*Back/forward:* browser-history back/forward navigation remains immediate and
does not intentionally trigger the branded overlay. If reliable
history-vs-link distinction proves technically fragile during
implementation, Codex should flag it for review rather than adding brittle
navigation interception.

**Reason:** reinforces brand identity at meaningful section boundaries
without adding friction to high-frequency browsing (profile drill-down,
back/forward) or to task-oriented dashboard/admin work.

**Source basis:** the candidate route-transition concept in
`HANDOVER.md`/`CLAUDE.md` ("current page → short branded overlay → mark →
next page"); the restraint principle (no lengthy transitions for filters/
dialogs/saves/admin mutations) is already established project direction. The
exact route grouping, the profile-drilldown exclusion, timing, the
always-Obsidian overlay, and the back/forward exclusion are approved project/
design decisions, not explicit SDD requirements.

**Design implications:** deliberately smaller and less frequent than the
entrance, so the entrance remains the system's one distinctive brand moment.

**Responsive implications:** applies uniformly; mobile is biased toward the
shorter end of the duration range (Decision 8).

**Accessibility / reduced-motion implications:** per Decision 5 — under
`prefers-reduced-motion`, the full-screen branded overlay does not replay at
all for these navigations. Navigate directly; preserve normal destination/
loading states; no full-viewport overlay; no centered-symbol interstitial; no
artificial delay. A tiny opacity change that is naturally part of page
rendering may remain only if it is effectively imperceptible and does not
delay navigation.

**Implementation constraints for Codex:** route-category-based trigger logic,
not hardcoded URL pairs; must coexist with, not replace, `loading.tsx`; must
not intercept back/forward except where reliably distinguishable, and must
flag rather than force a brittle solution if that proves hard; cancellation-
safe under rapid navigation.

**Remaining uncertainty:** whether reliably distinguishing browser-history
navigation from same-URL link navigation is technically clean in the chosen
router is unresolved until implementation is attempted.

---

## Decision 5 — Reduced-Motion Experience

**Final decision:** the project respects the OS-level
`prefers-reduced-motion: reduce` setting only; no separate in-product motion
setting is added for MVP.

*Entrance (Decision 3):* preserve the Obsidian brand field, the official
centered symbol, a brief brand presence, and the transition into the Soft
Ivory homepage. Remove symbol scaling, the Brand Aperture scale-through and
its independent violet-fade, masks/clip-path look-through reveals, parallax,
translation, and staggered choreography. Use
only a static composition and a restrained opacity transition. Reduced motion
also reduces time, not merely transforms — the reduced-motion entrance is
materially shorter than the standard 1.0–1.6s entrance: a brief static brand
confirmation and a short opacity dissolve, with no prolonged hold purely for
theatrical effect. No exact millisecond value is hardcoded here; Codex tunes
the shortest comfortable duration during implementation/browser review. The
once-per-session/home-first cadence from Decision 3 is unchanged.

*Route transitions (Decision 4):* under reduced motion, the full-screen
branded Obsidian overlay does **not** replay at all for the approved top-
level navigations. Navigate directly; preserve normal destination/loading
states; no full-viewport overlay; no centered-symbol interstitial; no
artificial transition delay. A naturally-occurring, effectively imperceptible
opacity change may remain only if it does not delay navigation. Reason:
Decision 4's transitions can occur repeatedly during normal browsing, and
even opacity-only full-screen changes become intrusive when repeated; the
one-time entrance may retain a minimal brand beat, but routine navigation
prioritizes immediacy for reduced-motion users.

*General contract, governing Decisions 6–8:*

| Full motion | Reduced motion |
| --- | --- |
| scale / zoom | remove |
| translate / slide | remove; render at final position |
| parallax | remove |
| mask / clip-path wipe | remove |
| large viewport transition | remove or replace with direct state change |
| staggered multi-element choreography | remove stagger; show together or use one restrained opacity change |
| decorative looping motion | stop entirely |
| opacity | may remain only when subtle, brief, and useful for continuity |
| duration | never longer than the full-motion version; normally shorter |

*UI feedback must remain:* focus states, hover-state differences, active/
selected states, pressed states, and validation/status changes are all
preserved. The distinction is state change vs. animated transition — e.g. a
button may still change from normal to hover colour, but under reduced
motion that colour change may happen immediately rather than animating over
time. Focus rings must remain fully visible and must not depend on
animation.

*Skip/interruption:* Decision 3's dismissal behaviour remains available
under reduced motion; reduced motion must not make the entrance harder to
dismiss.

**What must NOT happen:** no scale/recede entrance, no mask reveal, no
parallax, no transform-heavy section reveals, no full-screen branded route
overlay during reduced-motion navigation, no longer animation durations, no
removal of focus/hover/selected feedback, no mandatory manual motion-
preference toggle, no assumption that opacity is automatically harmless
merely because it isn't a transform.

**Reason:** `prefers-reduced-motion` targets vestibular-motion triggers
(scaling, parallax, sliding, masked reveals), not brand presence or ordinary
UI feedback; treating it as "show nothing" would be inaccessible-by-omission
in the other direction.

**Source basis:** `prefers-reduced-motion` support itself is an approved
supplemental project requirement (`HANDOVER.md`/`CLAUDE.md`). The exact
fallback behaviours specified above are approved Step 12B design decisions.

**Design implications:** establishes one contract inherited by every motion
decision that follows, rather than re-litigating "what survives reduction"
per decision.

**Responsive implications:** applies identically across all breakpoints — no
breakpoint carve-out for reduced motion.

**Accessibility / reduced-motion implications:** this decision *is* the
accessibility/reduced-motion specification.

**Implementation constraints for Codex:** detection via the standard
`prefers-reduced-motion` media query (CSS vs. JS technique unspecified —
Codex's choice); both the reduced-motion entrance and the reduced-motion
route-transition-skip are first-class code paths, not an afterthought toggle;
hover/focus/active states must remain present — only their animation, not
their existence, may become instantaneous.

**Remaining uncertainty:** exact reduced-motion millisecond values are left
to Codex/browser review.

---

## Decision 6 — Section-Reveal / Scroll Motion

**Final decision:** no scroll-triggered reveal system on the homepage. Hero
content renders immediately in its final state. Proof counts render
immediately at their real final values (no count-up animation). Categories,
Featured Talents, How It Works, and the final CTA all render normally. No
IntersectionObserver-based reveal choreography is required, no staggered
section-entrance system, no count-up animation for the proof/stat milestone,
and no decorative looping motion anywhere on the page. The first-load branded
entrance (Decision 3) remains the primary and sole homepage brand-motion
moment.

**Reason:** avoids the generic "everything fades up as you scroll"
SaaS-marketing-template signature, which directly conflicts with the
editorial/flat/precise/restrained direction and the explicit "no generic SaaS
dashboards on public pages" rule; keeps the motion budget concentrated in the
one moment designed to carry it.

**Source basis:** DESIGN RECOMMENDATION — the SDD is silent on scroll motion
entirely; the reasoning draws on the restraint direction already recorded in
`HANDOVER.md`/`CLAUDE.md` and consistency with Decisions 3–5.

**Design implications:** every homepage section is simply present, laid out
content — scrolling to a section is never itself a motion event.

**Responsive implications:** identical static-render behaviour at all four
breakpoints; nothing to adapt per breakpoint since nothing animates on
scroll.

**Accessibility / reduced-motion implications:** no impact and no carve-out
needed — there is no scroll motion to reduce.

**Implementation constraints for Codex:** no scroll-visibility observers are
needed for these sections; proof counts render server-computed final values
directly, with no client-side count-up logic.

**Remaining uncertainty:** none identified.

---

## Decision 7 — Interactive Motion

**Final decision:**

*Category selection* (home index list / directory filter rail): selected/
active state indicated via colour (Electric Violet, used sparingly) and
border/underline change only. Hover on desktop is a subtle colour/border
shift, with no lift, scale, or shadow growth. A simple CSS colour transition
(no animation library) is sufficient.

*Featured-talent selection and talent rows* (`/talents` directory rows):
hover/focus feedback via border-colour and/or background-tint shift only —
these are editorial bordered rows, not cards. This explicitly departs from
the Neon contract §5's generic `hover:-translate-y-0.5` + `shadow-sm` pattern,
consistent with the Design-system authority split already recorded in
`HANDOVER.md` (SDD §10 governs surface treatment: no generic elevated card
grid, minimal shadows). Selecting a row navigates to the profile with plain,
instant navigation — no page-transition animation is added for this
drill-down in this expedited pass; Decision 4 left the door open to "a
subtle content transition... if appropriate" later, and that remains
deferred, not declined.

*Buttons/links:* use the shared `Button` component's existing hover/focus/
active colour-state styling only (already an SDD §10 requirement via the
shared component). No scale-press or bounce effects. The `asChild`/Radix Slot
pattern is unchanged (pre-existing requirement).

*Inquiry dialog (corrected):* Radix Dialog supplies the accessible dialog
primitive and its open/closed state (mount/unmount, focus trap, ARIA
attributes) — it does **not** itself supply a default visual transition; any
visual motion is a separate, deliberately restrained choice specified here.
If visual motion is applied: use only a brief, restrained opacity transition
for the dialog and its backdrop. An optional very slight scale effect may be
used in the standard-motion version only, and only if it remains subtle. No
custom theatrical choreography. Under `prefers-reduced-motion`, the
open/close state change renders effectively instant or opacity-minimal — no
scale, no eased fade. No animation-library requirement is decided here; that
choice belongs to Codex.

*Directory filter changes* (search box, category rail, "All"): no motion
beyond the normal DOM update when results change — no fade/cross-fade of the
result grid, consistent with Decision 6's "no reveal motion for ordinary
content" extended to filtered results. Any brief loading indication while
results stream is the existing SDD §11 loading-state requirement, not a new
animation.

**Reason:** every listed interaction gets the simplest possible state-
feedback treatment (colour/border/opacity only), which is both the most
restrained option available and the lowest-risk path to a working testing
build by deadline; it explicitly avoids introducing the Neon contract's
generic "elevated card" hover gesture, keeping surface treatment consistent
with SDD §10's flat/restrained direction.

**Source basis:** SDD §10 (shared `Button` + `asChild`, flat/restrained
surfaces, no generic elevated card grid, minimal shadows, Electric Violet
used sparingly); SDD §12 (Radix keyboard navigation for Dialog, focus-visible
rings, status conveyed by text); SDD §4a (`aria-live` result count, sticky/
scrollable rail — behaviour unchanged, only its state-feedback styling
addressed here); the "no branded transition for filters/dialogs/ordinary
controls" principle already established in Decision 4. The rejection of the
Neon contract's translate/shadow hover pattern is a DESIGN RECOMMENDATION
applying the already-resolved Design-system authority split, not a new
conflict.

**Design implications:** no interaction on this list requires a bespoke
animation — every one is either a primitive's own accessible state or a
simple CSS colour/opacity transition.

**Responsive implications:** identical colour/border-state feedback at all
four breakpoints. On touch devices (tablet/mobile), hover states are not
reachable, so active/pressed and focus states must carry equivalent feedback
on tap — no interaction should depend on hover alone to be understandable.

**Accessibility / reduced-motion implications:** consistent with Decision 5's
contract — these are state changes, not motion effects, so they are largely
unaffected by `prefers-reduced-motion`; such transitions may happen
immediately rather than animating over time under reduced motion (e.g. hover
colour change applies instantly). Focus rings, hover/active/selected
distinctness, and validation/status feedback remain fully present regardless
of motion preference. The dialog's open/close state change collapses to
effectively instant/opacity-minimal under reduced motion, per the corrected
rule above.

**Implementation constraints for Codex:** use existing shared `Button`/Radix
primitives' built-in states wherever possible rather than custom animation
code; category/row/link hover-active-focus states are implemented via simple
CSS transitions only (no animation library required); the dialog's accessible
state comes from Radix, any visual motion applied to it is a separate,
restrained, optional layer per the corrected rule; filter/result updates
render via normal server-component re-render, with no added transition
wrapper.

**Remaining uncertainty:** whether profile drill-down (`/talents` →
`/talents/[slug]`) eventually receives the "subtle content transition"
Decision 4 left open is explicitly undecided — this build ships with plain
instant navigation there, and the gap should be revisited outside deadline
mode, not treated as a permanent decision.

---

## Decision 8 — Responsive Visual Behavior

**Final decision:**

*Hero composition:* at 1280/1440 desktop, a two-column composition —
headline, search box, and secondary CTAs on one side, the hero media frame
(Decision 2's placeholder today, the real photo later) on the other, with
generous whitespace; the media frame maintains its stable aspect ratio at
every size. At 768 tablet, a single-column stack — headline/search/CTAs
first, hero media frame below; the search box remains full-width and the
dominant primary action. At 375 mobile, fully stacked single column; the
media frame shrinks with the container while preserving its aspect ratio; the
search box stays full-width and visually dominant over secondary CTAs.

*`SODALES | TALENTS` lockup handling* (settling Decision 1's deferred
responsive question): at 1440/1280, the full lockup at full intended size,
normal navigation alongside it. At 768, the full lockup is preserved; primary
navigation may begin condensing (fewer visible top-level links, tightened
spacing) to protect the lockup's space. At 375, the full lockup is preserved
via (a) proportional scaling of the whole lockup to a smaller but still
legible size, (b) tightened header horizontal padding, and (c) navigation
links collapsed behind a menu control — never via truncating or dropping
`TALENTS`, and never via an icon-only fallback. If real browser testing shows
the full lockup still cannot fit at 375px after all three techniques, that is
flagged for human review rather than silently switched to icon-only
(restating Decision 1's escape hatch, not a new rule).

*Category rail behaviour* (the SDD-mandated sticky-desktop/horizontal-scroll-
mobile behaviour is unchanged; only the breakpoint boundary is set here): at
1440/1280, sticky, per SDD §4a. At 768, horizontally scrollable (treated as
the "mobile" side of SDD's binary rule at this width, since a sticky rail
needs more surrounding whitespace than a 768px viewport comfortably offers).
At 375, horizontally scrollable including "All," per SDD §4a, unchanged.

*Featured-talent layout/interaction* (homepage section only — distinct from
the `/talents` directory's own SDD-mandated responsive 1/2-column rows, which
are unchanged): a single-column vertical editorial list at every breakpoint
from 1440 through 375 — deliberately not a 2-up arrangement on wide desktop,
to avoid drifting toward "card grid" territory on the section most likely to
be mistaken for one. Only horizontal padding and row height adjust per
breakpoint. Interaction feedback matches Decision 7 (border/background/colour
only, full row as the click target) identically across breakpoints.

*Whitespace/section spacing:* vertical rhythm between homepage sections
(hero → proof → categories → featured → How It Works → final CTA) scales
down proportionally as the viewport narrows — generous at 1440/1280,
moderately compressed at 768, further compressed at 375 — without ever
compressing so tightly that sections visually collide, and without leaving
so much dead space on mobile that users scroll past nothing. Exact spacing
tokens are a visual-spec/implementation detail, not fixed here.

*Motion simplification:* Decision 3's entrance and Decision 4's route
transitions apply uniformly across all four breakpoints with no breakpoint-
specific disabling; on mobile, Codex should favour the shorter end of each
decision's approved duration range rather than a heavier treatment, given
smaller viewports and typically lower-powered devices — a bias, not a
different design. The category rail's horizontal scroll (mobile/tablet) is
native scroll behaviour, not "motion design," and does not conflict with the
restraint principle. Decision 7's hover/focus/active feedback applies
identically across breakpoints; touch devices rely on active/focus/tap
feedback rather than hover. No new mobile-only motion (no swipe-triggered
animation, no scroll-jacking) is introduced anywhere.

**Reason:** settles every named sub-topic using the same restraint/
consistency logic as Decisions 1–7, while explicitly fulfilling the
responsive obligations those decisions deferred here (Decision 1
Modification 1's lockup-preservation technique; Decision 2 Clarification 1's
hero aspect-ratio/crop framing; Decisions 3–4's mobile motion bias).

**Source basis:** SDD §4a (category rail sticky-desktop/scrollable-mobile —
unchanged, only its 768 boundary set here; the `/talents` directory's
responsive 1/2-column rows — unchanged, explicitly not applied to the
homepage's featured section); SDD §10 (`max-w-7xl` container, stable hero
aspect ratio, search as the dominant interaction, no generic card grid);
Decision 1 Modification 1 (lockup-preservation technique, explicitly
delegated to this decision); Decision 2 Clarification 1 (hero frame ratio/
crop, explicitly delegated to this decision). The single-column featured-
talent choice, the 768 rail-boundary placement, and the whitespace-scaling
principle are DESIGN RECOMMENDATIONs, not drawn from a source.

**Design implications:** this decision is the responsive specification for
the six named sub-topics; nothing here changes any SDD-defined behaviour.

**Responsive implications:** this decision *is* the responsive
specification.

**Accessibility / reduced-motion implications:** the mobile nav-collapse
control (lockup handling) must remain keyboard-operable and carry an
`aria-label` on its icon-only control, per the existing SDD §12 requirement —
unchanged, just newly relevant here. The horizontal-scroll category rail must
remain keyboard-reachable, consistent with existing accessibility
requirements. Nothing here introduces a new motion effect beyond what
Decisions 3–7 already govern.

**Implementation constraints for Codex:** the lockup component exposes a
smaller-size/condensed-nav variant rather than a separate component; the hero
media frame's aspect ratio is decided once (visual-spec stage) and reserved
consistently across breakpoints; the category rail's sticky-vs-scroll
behaviour is a single breakpoint-driven rule, not duplicated markup; the
featured-talent section must not reuse the directory's row/grid component if
it carries grid-specific assumptions.

**Remaining uncertainty:** the exact hero media frame aspect ratio/crop plan
is not numerically fixed yet (ties to Decision 2's own open item); exact
pixel breakpoint values beyond the four named reference widths (375/768/
1280/1440) are implementation detail, not fixed here; whether 768 truly needs
its own distinct treatment or can simply inherit the mobile treatment
wholesale is a judgment call to confirm once real content is in the browser.

---

## New Conflicts Discovered

None. Decision 7's rejection of the Neon contract §5 hover/shadow pattern is
an application of the Design-system authority split already recorded in
`HANDOVER.md` (SDD §10 governs surface treatment), not a newly discovered
conflict.

## Remaining UI / Motion Blockers

**One genuine blocker, introduced by the Brand Aperture revision to
Decisions 3 and 4:** the look-through mask/aperture technique requires the
official Sodales symbol as a true alpha-channel source (SVG, or a PNG with a
real transparent background matching the exact official geometry). No such
asset currently exists in the repository — the committed
`docs/brand/assets/sodales-symbol.png` and its app runtime copies are opaque
PNGs on a white background. An unauthorized AI-generated transparent
replacement was created earlier in this milestone, contained visible
geometry distortion and artifacts, and was reverted; per the standing
brand-asset rule, a replacement must not be silently generated to unblock
this. Resolving this requires an explicit human decision between: (a)
obtaining an approved vector/alpha-channel source from the brand owner, or
(b) commissioning a deterministic, provenance-documented background removal
of the current asset, reviewed and approved before entering the official
asset path. **The Brand Aperture entrance and route-transition mechanism
cannot be implemented until this is resolved.** Until resolved, the
previously implemented and shipped scale/opacity entrance (the mechanism
this revision supersedes) remains the working fallback in production — it is
not removed or broken by this decision record.

Every other open item above (contrast-safe violet on dark chrome, exact
millisecond timings, the hero frame aspect ratio, back/forward detection
reliability, the 768 rail-boundary judgment call) is buildable with a
reasonable Codex default and does not prevent a testing deployment.

`HANDOVER.md` Unresolved 9 (standalone execution/environment contract) may
bear on whether a testing deployment can be stood up at all today — that is
an infrastructure blocker already tracked there, not a UI/motion blocker, and
is out of scope for this record.
