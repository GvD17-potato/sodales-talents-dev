# Sodales Talents — Step 12D Astra Design Injection

## Status

**HUMAN VISUAL REVIEW APPROVED — 2026-09-05.** The approved visual baseline is
the **Astra visual layer + production architecture**. This is not a "some Astra ideas added" update — per explicit
instruction, the Astra reference project's approved visual design became the
production frontend's visual source of truth for entrance, header,
homepage, directory, profile, and login/sign-up. Production remains
authoritative for architecture, routing, data, auth, and domain behavior.
This document supersedes Step 12B/12C's entrance-timing conclusions where
noted below; it does not touch Step 12A's domain decisions.

The temporary hero remains **TESTING ONLY**. The dashboard/admin design remains
preserved as a future visual specification, and Neon Auth remains Phase 2.

## What changed

1. **Entrance** — replaced the CSS mask/transform "Brand Aperture" engine
   (Step 12C's subject) with Astra's actual Canvas 2D algorithm: smoothstep
   easing, `destination-out` compositing, exponential scale
   (`base * Math.exp(flight * Math.log(target/base))`), and Astra's full
   phase timing (reveal 1.05–2.35s, flight 1.6–4.7s, obsidian fade
   3.1–4.6s, natural finish ~4.8s, 6.5s watchdog) — see
   `apps/talents/src/components/canvas-entrance.tsx`. This is a deliberate
   reversal of Step 12C's "keep CSS, don't regress to canvas" recommendation
   — the user explicitly authorized canvas and asked for Astra's actual
   timing as the new baseline, not a retimed CSS approximation.
2. **Route transitions** — unchanged. The CSS mask `.route-aperture` system
   (Decision 4, ~650ms) still runs for `/` ↔ `/talents` ↔ `/login` ↔
   `/sign-up`; this task did not touch it.
3. **Reduced motion** — unchanged: the existing CSS-only static-symbol +
   short opacity dissolve (`.brand-entrance` / `entrance-reduced-field`,
   ~360ms) is untouched and still gates out the Canvas path entirely.
4. **Header, homepage, directory, profile, login/sign-up** — rebuilt to
   Astra's composition, typography scale, spacing, and interaction styling,
   translated into the existing Tailwind-utility system (no bespoke global
   CSS classes were introduced, matching how the rest of the app is built).
   See `src/lib/layout.ts` (the `WRAP` container helper, Astra's `.wrap`
   translated to Tailwind) and `src/components/talent-profile-row.tsx` (the
   single shared row design Astra uses for both the homepage-featured and
   directory sections, replacing the two previously-divergent components).
5. **Hero photo** — Astra's `talents-studio-hero.png` was copied unmodified
   into `apps/talents/public/media/testing/` (explicitly documented as
   temporary, not final photography) and is now used on the homepage hero,
   superseding Step 12B Decision 2's placeholder-symbol treatment **for this
   review only**. See `apps/talents/public/media/testing/README.md`.
6. **Dashboard/admin** — not implemented (no routes exist). Full visual
   specification recorded in
   `docs/design/astra-dashboard-admin-visual-spec.md`, plus one safe,
   presentational-only primitive (`@sodales/ui/status-badge`) extracted for
   later use.

## Design parity deviations (every intentional difference from Astra)

| Area | Astra | Production | Why |
|---|---|---|---|
| Container | Custom `.wrap` breakpoints (600/1150px) | Tailwind `WRAP` helper using `sm`/`lg` (640/1024px) | Production's whole system is Tailwind-utility based; replicating Astra's bespoke breakpoint values pixel-for-pixel isn't compatible with that architecture. |
| Header nav collapse | Collapses at 900px | Collapses at `md` (768px) | Same reason — nearest Tailwind breakpoint. |
| Hero photo caption | "IN GOOD COMPANY / Nico & Mara · Studio stories" | "TEMPORARY VISUAL REFERENCE / Not final photography" | Astra's caption names fictional people as if real; that would misrepresent the image on a real product page. Accessibility/truthfulness requirement explicitly overrides visual literalism here. |
| Auth panel accent color | Raw hex `#c5bddc` / `#b7abee` (not in our approved palette) | `violet-accessible` (`#887BD8`) / `violet-soft` (`#DAD4F5`) | Brand-asset correctness: CLAUDE.md's approved supporting palette doesn't include Astra's raw lavender hexes; mapped to the nearest already-approved tokens. |
| Auth story photo | Same studio photo reused in the auth panel | Omitted | Avoids multiplying the temporary/fictional-imagery footprint beyond the one explicitly requested homepage placement. |
| Category/profile-row index color | Gray (`#8a838d`) | Matched to gray (`text-graphite/50` / `/60`) | Corrected — production had previously colored these violet; this is a fix toward parity, not a deviation. |
| Featured-talent layout | 2-column grid (same as directory) | Now 2-column (was 1-column under old Step 12B Decision 8) | Explicit instruction in this task supersedes Decision 8's single-column mandate for this section. |
| Skip-intro control | Visible "Skip intro ↗" button | No visible button; Escape + click-anywhere-on-overlay only | Preserves the still-relevant Step 12B Decision 3 accessibility call ("no visible mandatory skip control unless usability testing shows otherwise") — this task's brief didn't revisit that call, only the entrance's rendering technique and timing. |
| Auth/inquiry demo banner | Shown only implicitly via Astra's demo framing | Persistent, explicit "Interactive preview" banner shown before submission (not just after) | More honest than Astra's own pattern; strengthens truthful-disclosure requirements without changing functional behavior. |
| Astra's admin one-click role switch, `localStorage` backend, fake moderation | N/A | Not ported anywhere | Explicitly excluded per Step 11 of the source task and standing AGENTS.md/CLAUDE.md rules. |

## What was not touched

Database schema, migrations, seed, domain state machines, Neon Auth,
authorization, server actions, validation, moderation rules, inquiry rules,
approved-only visibility, or any Backend Phase 1 file. `docs/decisions/`
Step 12A is unaffected. Step 12B/12C's entrance *timing conclusions* are
superseded per item 1 above, but their reduced-motion and route-transition
rules stand unchanged.

## Next step

Human visual review is complete. Any optional UI/UX Pro Max audit or Motion
evaluation must preserve Astra as the visual source of truth. Neon Auth remains
the separate Phase 2 implementation and has not started.
