# Sodales Talents — Coding Agent Instructions

## Purpose

These instructions apply to coding agents working on Sodales Talents.

Before doing any project work, read:

1. `HANDOVER.md`
2. `docs/sdd/05-talents.md`
3. `docs/patterns/neon-app-setup.md`
4. `docs/brand/README.md`

Then read any approved planning documents referenced by `HANDOVER.md`.

Do not assume conversation history from another AI agent is available.
The repository documentation is the persistent project context.

---

## Authority Order

When sources conflict, use this order:

1. `docs/sdd/05-talents.md`
   - authoritative product and system specification

2. `docs/patterns/neon-app-setup.md`
   - binding Neon/database/auth implementation contract

3. `docs/brand/sodales-brand-guidelines.pdf`
   - corporate brand reference supplied by the project senior developer

4. `docs/brand/README.md`
   - brand-source provenance and implementation notes

5. Approved project-specific design, architecture, and implementation documents

6. `HANDOVER.md`
   - current project state and confirmed decisions

7. `references/`
   - inspiration/planning references only

Reference material must never override authoritative requirements.

If two authoritative sources genuinely conflict, stop and report the conflict
instead of silently choosing a new behavior.

---

# Agent Role

## Codex is the primary implementation engineer

Codex owns implementation of:

- project/workspace scaffolding
- application architecture
- Next.js integration
- TypeScript implementation
- Neon Postgres
- Neon Auth
- Drizzle schemas and queries
- Zod validation
- server actions
- authentication
- authorization
- ownership checks
- domain/business logic
- profile lifecycle behavior
- inquiry lifecycle behavior
- concurrency protection
- stale approval protection
- database transactions
- migrations
- seeds
- smoke tests
- automated tests / TDD
- API/backend behavior
- real data integration
- application state wiring
- error handling
- loading behavior
- SEO implementation
- performance
- animation implementation
- route-transition implementation
- Motion / animation libraries
- reduced-motion implementation
- build/lint/typecheck fixes
- deployment-related code

---

# UI Ownership Boundary

Claude Sonnet is the primary UI/UX designer for this project.

Approved UI work may come from:

- visual specifications
- Claude-created layouts/components
- approved design decisions

Codex must preserve the approved visual intent when implementing functionality.

Do not unnecessarily redesign Claude-approved UI.

Codex MAY change UI code when required for:

- accessibility
- functionality
- responsive correctness
- data integration
- security
- performance
- framework correctness
- maintainability

If a required engineering change would materially alter the approved design,
report the conflict before making the design change.

---

# Animation Boundary

Claude Sonnet defines the intended motion experience.

Codex implements the animation code.

Examples:

Claude defines:
- sequence
- timing intent
- visual hierarchy
- transition concept
- easing feel
- reduced-motion alternative

Codex implements:
- Motion / React animation code
- animation state
- route-transition orchestration
- performance safeguards
- cleanup
- reduced-motion detection
- loading integration

Do not invent complex visual motion that has not been approved.

---

# Core Product Safety Rules

## Public profile visibility

Only `approved` talent profiles may appear publicly.

Filtering must happen at the SQL/data-query level.

Never:

- fetch every status and filter in the client
- rely on CSS or React conditions for authorization
- expose draft, pending, or hidden data publicly

Non-approved public slugs must return the application 404.

---

## Authentication and authorization

Authorization is server-side.

Every sensitive write must independently verify:

1. authenticated session
2. required role
3. ownership where applicable
4. validated input

Client-side guards are UX only and are not security boundaries.

---

## Ownership

Talents may modify only their own profile.

Profile ownership must be re-checked server-side for every relevant mutation.

---

## Profile lifecycle

Do not invent state transitions.

Current confirmed transitions include:

- `draft -> pending`
- `pending -> approved`
- `pending -> hidden`
- `approved -> hidden`
- `approved -> pending` after approved material edit
- `pending -> draft` after talent edit
- `hidden -> pending` after explicit resubmission

Unresolved lifecycle decisions must remain unresolved until approved.

---

## Stale approval protection

Admin profile approval is concurrency-sensitive.

The implementation must prevent this:

admin reads version A
→ talent creates version B
→ admin approves stale version A

Follow the SDD's stale-review requirements.

Do not replace the database-level protection with client-side checks.

---

## Admin moderation

Approve/hide mutations must create the required moderation audit record
atomically with the status change.

---

## Inquiry honeypot

A honeypot submission must:

- appear successful to the submitter
- create no inquiry record

---

# Database Rules

Do not invent database constraints from UI validation rules.

In particular, incomplete draft-profile representation is a project decision
that must be resolved from approved planning before finalizing schema
nullability.

Use transactions where required by the SDD.

Database behavior must remain compatible with the documented Neon setup
contract.

---

# Visual Requirements

Preserve the approved Sodales design direction:

- premium editorial talent marketplace
- search-first homepage
- flat precise surfaces
- restrained borders
- minimal shadows
- no generic SaaS card grid
- no invented talent portraits
- official Sodales assets only
- Electric Violet used sparingly
- editorial talent presentation

Typography:

- Manrope for expressive/display typography
- Inter for UI/body/forms/tables

Core palette:

- Obsidian `#111111`
- Soft Ivory `#F4F2ED`
- Graphite `#35373B`
- Electric Violet `#5E4FB3`
- accessible violet `#887BD8`
- `#DAD4F5`
- `#8072D2`
- `#2A2440`

---

# Reference Rules

## Academy

The Academy frontend document is a planning example only.

Never copy Academy-specific requirements into Talents unless an authoritative
Talents source independently requires them.

## Lusion

Use only as motion-quality inspiration.

Do not copy:
- branding
- product design
- WebGL/3D implementation
- exact transitions

## Toptal

Use only for marketplace interaction/information inspiration.

Do not introduce:
- Consulting & Services
- expert badges
- employer logos
- portrait-heavy talent cards
- Toptal branding
- Toptal product scope

---

# Development Workflow

Follow the current project phase recorded in `HANDOVER.md`.

Do not skip human-review gates.

When instructed to perform a read-only task:

- do not edit files
- do not install packages
- do not modify Git
- do not scaffold

Before implementation:

1. verify requirements
2. verify approved architecture
3. verify implementation plan
4. work from an isolated feature branch/worktree

During implementation:

- prefer small coherent changes
- use TDD for high-risk domain/security behavior
- run relevant tests frequently
- do not silently weaken requirements to make tests pass

---

# Cross-Agent Collaboration

Claude Sonnet and Codex must not independently redesign the same feature.

Normal flow:

Claude Sonnet
→ UI/UX design
→ human approval
→ design/spec saved in repository
→ Codex implementation
→ functional verification
→ Claude visual review if needed
→ Codex fixes implementation issues

Do not rely on another agent's private conversation history.

Use repository documents for handoff.

If significant project decisions change, update `HANDOVER.md`.

---

# No Hallucinated Decisions

If a requirement is unresolved:

STOP.

State:

- what is known
- what is unknown
- what decision is required

Do not invent the missing decision.

Never present a proposal as though it came from the SDD or senior developer.

Clearly label:

- SOURCE REQUIREMENT
- CONFIRMED SENIOR DECISION
- APPROVED PROJECT DECISION
- PROPOSAL
- UNRESOLVED