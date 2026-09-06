# Sodales Talents — Backend Phase 4 Talent Dashboard and Profile Lifecycle

## Status

Implemented and verified against the real Neon development branch on 2026-09-06.

## Scope

Phase 4 replaces the authenticated talent dashboard shells with a real private
workspace and profile editor. It uses the existing seven-table Phase 1 schema,
Phase 2 Neon Auth session boundary, Phase 3 approved-only public queries, and
the human-approved Step 12A lifecycle decisions. No schema or migration change
was required.

## Authenticated workspace

- `/dashboard` accepts authenticated talent and admin accounts. Talent accounts
  receive their owner-scoped profile overview; admin accounts receive no talent
  profile controls and are directed to the admin workspace.
- `/dashboard/profile` and both profile server actions require the `talent`
  role.
- The current Auth user ID determines ownership on the server. Profile IDs and
  status values are never accepted from form input.
- Every read and mutation scopes the profile by its persisted `user_id`.
- Anonymous users are redirected to sign in, and admin accounts cannot invoke
  talent-owned profile operations.

## Profile data and validation

The editor persists display name, public slug, headline, biography, location,
category, ordered skills, and ordered portfolio links. Categories come from
the real `talent_category` table.

Draft-save validation remains distinct from publication completeness:

- drafts and hidden profiles may store nullable headline, biography, location,
  and category values;
- supplied values must still satisfy their scalar formats and limits;
- skills are limited to 15, trimmed, case-insensitively unique, and 1–40
  characters each;
- portfolio links are limited to 8, require a 1–60 character label, and use an
  HTTPS URL;
- portfolio links remain optional;
- slug conflicts and missing categories return safe field-level errors.

Client validation improves feedback but is not authoritative. Every server
action parses and validates its own input.

## Save lifecycle

The save path locks the owner’s `talent_profile` row and derives materiality
and the next status from the current persisted profile inside one transaction.
It compares normalized scalar content and deterministically ordered child rows.

- `draft`: every normal save remains `draft`, including incomplete saves.
- `pending`: a normalized no-op preserves `pending`; every actual persisted
  change, including reorder-only changes, transitions to `draft`.
- `approved`: a normalized no-op and reorder-only save preserve `approved`;
  any material change atomically saves the new content and transitions to
  `pending`.
- `hidden`: all normal saves preserve `hidden`, whether incomplete, no-op,
  reorder-only, or material.

No-op saves perform no profile or child-row write and do not update
`updated_at`. When a save writes collection changes, existing owner-scoped
skills and links are replaced inside the same transaction with deterministic
zero-based positions.

For approved material changes, the content write, child writes, and
`approved -> pending` transition commit together. Because every public query
requires `talent_profile.status = 'approved'`, the changed profile disappears
from public SQL visibility as part of that commit. A forced child-write failure
was verified to roll back profile content, status, and child rows together.

## Explicit submission lifecycle

Save and submission are separate actions. Submission never trusts form values;
it locks and re-reads the persisted profile, category, skills, and links in one
transaction and re-runs publication completeness server-side.

- a complete `draft` may explicitly transition to `pending`;
- a complete `hidden` profile may explicitly resubmit to `pending`;
- failed completeness leaves the current status unchanged;
- `pending` and `approved` cannot use the submission action.

Completeness requires a valid display name, slug, headline, biography,
location, an existing category, at least one valid skill, and valid optional
portfolio links.

## Concurrency and failure behavior

Profile save and submission transactions use `SELECT ... FOR UPDATE` on the
current owner-scoped profile row. Concurrent writers therefore derive their
transition from the latest committed status rather than stale browser state.
A verified concurrent approved-profile test produced `approved -> pending` for
the first material save and `pending -> draft` for the second actual save.

Expected validation, slug, category, ownership, and transition failures return
safe results. Unexpected database failures log only the operation and database
error code; profile content, credentials, connection details, and submitted
values are not logged.

## Dashboard experience

The dashboard follows the approved Astra-derived visual specification:

- flat bordered editorial surfaces, Manrope headings, Inter UI copy, and
  restrained violet accents;
- a private-workspace header and navigation that do not let public marketplace
  navigation dominate authenticated work;
- persisted status badges, publication-readiness checklist, profile counts,
  and an approved-only public-profile link;
- a responsive profile editor with native labels, instructions, character
  limits, category selection, keyboard-operable add/remove/reorder controls,
  pending states, field errors, live action feedback, and toasts;
- explicit lifecycle guidance for draft, pending, approved, and hidden states;
- accessible loading and error states with reduced-motion-safe skeletons.

No Motion animation or UI/UX Pro Max recommendation was applied in this phase.
The approved public Astra presentation and official brand assets were not
changed.

## Verification

Automated verification passed with 104 tests:

- domain: 26;
- Auth and authorization: 14;
- public queries: 19;
- Phase 4 profile lifecycle/integration: 45.

The Phase 4 suite covers incomplete and complete draft saves, explicit submit
and resubmit, failed completeness, pending normalized no-op and actual edits,
approved no-op/reorder/material variants, hidden edits, ownership, arbitrary-ID
rejection, scalar and collection validation, slug/category failures, rollback,
concurrent saves, public removal, and owner-scoped workspace reads.

Real browser QA passed against the local production build and real Neon
development services for anonymous protection, signup and draft provisioning,
editing, both submission paths, pending no-op/edit behavior, approved reorder
and material behavior, hidden editing, validation feedback, public 404 after an
approved material edit, and browser runtime errors. All namespace-scoped test
application rows and Auth identities were removed afterward.

Regression verification also confirms the production build, lint, typecheck,
Drizzle consistency, database smoke checks, and clean Git diff. The development
database remains at exactly seven application tables, four PostgreSQL enums,
and six seeded categories.

## Deferred

Backend Phase 5 remains responsible for admin moderation, moderation audit
records, inquiry persistence and inquiry operations. Phase 4 does not create an
admin account, alter production Neon, add demo content, push, or deploy.
