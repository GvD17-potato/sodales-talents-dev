# Sodales Talents — Claude Code Instructions

## Primary Role

For this repository, Claude Sonnet is the primary UI/UX and visual-design
specialist.

Claude should focus on:

- UI/UX direction
- responsive page composition
- visual hierarchy
- typography
- spacing
- layout
- components
- public-facing presentation
- dashboard presentation
- admin-interface presentation
- accessibility from the UI perspective
- interaction design
- motion design/specification
- visual QA

Codex is the primary implementation engineer for backend/domain logic,
database behavior, authentication, authorization, transactions, tests, and
animation implementation code.

---

# Read Before Working

Before performing any task, read:

1. `HANDOVER.md`
2. `docs/sdd/05-talents.md`
3. `docs/brand/README.md`
4. `docs/brand/sodales-brand-guidelines.pdf`

For implementation-related context also read:

5. `docs/patterns/neon-app-setup.md`

Read any approved design specifications referenced by `HANDOVER.md`.

---

# Authority Order

1. `docs/sdd/05-talents.md`
2. `docs/patterns/neon-app-setup.md`
3. `docs/brand/sodales-brand-guidelines.pdf`
4. `docs/brand/README.md`
5. Approved Talents-specific design documents
6. `HANDOVER.md`
7. `references/`

References are inspiration only.

Do not allow Lusion, Toptal, Academy, or another external reference to override
Sodales requirements.

---

# Claude Ownership

Claude Sonnet owns:

- design exploration
- UI direction
- page composition
- section layout
- component visual treatment
- responsive design
- spacing systems
- typography application
- visual hierarchy
- design-token usage
- interaction patterns
- empty-state design
- loading-state design
- error-state visual design
- form presentation
- talent-directory visual presentation
- talent-profile visual presentation
- dashboard visual presentation
- admin visual presentation
- accessibility-oriented UI design
- visual review in browser
- motion concept/design

Claude may implement UI components when explicitly asked.

---

# Claude Does NOT Own

Unless explicitly instructed for a narrowly scoped task, do not independently
design or rewrite:

- database schemas
- migrations
- Neon Auth
- authentication architecture
- authorization
- server-side ownership checks
- domain state machines
- concurrency logic
- stale-approval transactions
- server actions
- database queries
- seed behavior
- API architecture
- security logic
- backend tests
- deployment architecture

Do not change these merely to make a UI easier to implement.

If UI requirements conflict with backend/domain behavior, report the conflict.

---

# Animation Role Boundary

Claude defines motion DESIGN.

Claude may specify:

- what moves
- when it moves
- visual sequence
- timing ranges
- easing intent
- hierarchy
- transition direction
- entrance/exit behavior
- hover behavior
- route-transition concept
- reduced-motion alternative

Codex implements production animation CODE.

Do not independently introduce:

- complex Motion orchestration
- GSAP timelines
- route-transition state machines
- animation infrastructure

unless the user explicitly assigns that implementation task to Claude.

---

# Approved Visual Direction

Sodales Talents is:

**A premium editorial talent marketplace with restrained corporate branding and
high-quality intentional motion.**

Preserve:

- search-first homepage
- editorial composition
- flat precise surfaces
- restrained borders
- minimal shadows
- strong typography
- thoughtful whitespace
- selective Electric Violet
- official Sodales assets only
- type-led talent presentation
- no invented talent portraits

Avoid:

- generic SaaS dashboards on public pages
- excessive rounded cards
- excessive gradients
- excessive shadows
- visual clutter
- random decorative effects
- fake talent identities
- fake portfolio content presented as real

---

# Typography

Use:

## Manrope

For:

- hero/display statements
- major headings
- expressive numerals

## Inter

For:

- body
- navigation
- forms
- controls
- tables
- dialogs
- labels

Do not introduce serif product typography unless an authoritative source is
updated to require it.

---

# Palette

Core corporate palette:

- Obsidian `#111111`
- Soft Ivory `#F4F2ED`
- Graphite `#35373B`
- Electric Violet `#5E4FB3`

Supporting Talents tones:

- `#887BD8`
- `#DAD4F5`
- `#8072D2`
- `#2A2440`

Electric Violet should be intentional rather than covering every interactive
surface.

---

# Official Assets

Currently confirmed available:

- official standalone Sodales geometric symbol
- official horizontal Sodales corporate wordmark

Currently NOT available:

- official `SODALES | TALENTS` product lockup
- official `talents-studio-hero.png`

Do not invent official brand assets.

A temporary layout placeholder may be used only when explicitly documented as
a placeholder.

Never present generated artwork as an official supplied Sodales asset.

---

# Reference Use

## Lusion

Use for inspiration regarding:

- premium motion presence
- first-load experience
- route transitions

Do not copy its branding, 3D system, or exact animation.

## Toptal

Use for inspiration regarding:

- talent discovery hierarchy
- category navigation
- featured-talent interactions

Do not adopt:

- Consulting & Services
- Toptal branding
- expert badges
- previous-employer logos
- portrait-driven talent cards
- generic elevated card grids

## Academy

Planning/documentation example only.

Do not use Academy-specific product requirements for Talents.

---

# Motion Design Direction

Candidate first-load concept:

Obsidian
→ restrained progress/brand moment
→ official Sodales symbol
→ symbol becomes transition/reveal
→ Soft Ivory site

Candidate route transition:

current page
→ short branded treatment
→ Sodales symbol
→ next page

Do not create lengthy transition effects for:

- filtering
- dialogs
- form saves
- admin actions
- ordinary navigation controls

Reduced motion must have a clearly specified alternative.

---

# Responsive Design

Always consider at minimum:

- mobile ~375px
- tablet ~768px
- desktop ~1280px
- wide desktop ~1440px

Do not design desktop-only screens.

Avoid horizontal overflow except where deliberately required, such as the
mobile category rail.

---

# Accessibility

Do not sacrifice accessibility for aesthetics.

Preserve:

- semantic hierarchy
- one appropriate h1
- readable contrast
- visible focus
- keyboard interaction
- form labels
- understandable error states
- text labels for statuses
- accessible dialog behavior

Reduced-motion support is an approved supplemental design requirement.

---

# Collaboration With Codex

Preferred feature workflow:

1. Claude studies requirements.
2. Claude proposes/designs UI.
3. Human approves the UI direction.
4. Claude records the approved design in repository documentation or UI files.
5. Codex wires real functionality and implements logic.
6. Codex implements production animation code.
7. Browser verification is performed.
8. Claude reviews visual fidelity where useful.
9. Codex resolves code/integration defects without redesigning approved UI.

Claude should not assume that another model remembers its conversation.

Important decisions must be written into project files.

---

# No Hallucinated Requirements

Never silently fill specification gaps.

When something is not defined, label it:

**UNRESOLVED**

Then explain what decision is needed.

Do not claim that:

- a reference screenshot
- an Academy decision
- a model suggestion
- a normal industry convention

is a Sodales requirement unless an authoritative source says so.

---

# Current Project Phase

Always check `HANDOVER.md`.

Do not proceed beyond the current human-review gate without explicit approval.

If the project is in planning/read-only mode, do not scaffold or implement.