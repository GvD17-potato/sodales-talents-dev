# Sodales Talents — Backend Phase 3 Public Queries

## Status

Complete. The public talent experience now reads from the existing
`Sodales-Talent` Neon project's `development` branch through Drizzle. Real
database integration and production-route browser QA are verified.

This record does not supersede the SDD, the Neon setup contract, the Step 12A
domain decisions, or the approved Astra visual specification.

## Public query architecture

- The server-only talent query module is the single public data adapter for the
  homepage, directory, category options and profile detail.
- Every public profile query applies `talent_profile.status = 'approved'` in
  SQL. The boundary also requires the approved row to retain publication
  completeness: headline, bio, location, category and at least one skill.
- Public list/detail selections are explicit projections. They do not select
  owner Auth IDs, profile status, moderation data, role data, inquiries or
  internal update timestamps.
- Skills and portfolio links are loaded in two batched queries for the selected
  profile IDs, avoiding per-profile N+1 queries. Both use position then ID as a
  deterministic ordering rule.
- Public talent rows use `updated_at DESC, id ASC` for deterministic ordering.
  The homepage applies its four-profile limit in SQL and does not add a
  fixture-era `featured` field to the schema.

## Search and category semantics

Search follows SDD §3 exactly: a trimmed query matches display name, headline,
bio, location and skill name with parameterized SQL `ILIKE` conditions. SQL
wildcards supplied as user text are escaped. Search does not include category
name because the SDD assigns category selection to the category filter.

Category options come from `talent_category`. Each public category count is
calculated from approved, publication-complete profiles only. A valid category
slug resolves to its database ID before filtering; an unknown normalized slug
is treated as All categories. Search and category predicates compose in the
same approved-only query.

## Profile detail and HTTP 404 boundary

The detail query selects by slug and approved status in the same SQL predicate;
it never fetches another status for later React filtering. Draft, pending,
hidden and nonexistent slugs therefore share the same absent result.

Next.js App Router may emit a streamed not-found page after committing an HTTP
200 status. The existing middleware now performs a minimal approved-only slug
existence query for `/talents/:slug` using the supported Node.js middleware
runtime. An absent result rewrites to the application not-found route with
HTTP 404. The page query repeats the approved-only check as its own security
boundary and retains `notFound()` behavior. Auth middleware behavior and its
protected matchers remain in place.

## Cache and freshness strategy

The three public pages use `dynamic = "force-dynamic"`. Each request therefore
observes the current committed moderation state rather than persisting a
build-time or indefinite public cache. The per-render React cache only dedupes
the repeated detail lookup within a render. Later write phases do not need a
new invalidation system for this Phase 3 strategy.

## Fixture retirement and empty state

The runtime fixture adapter and fixture dataset were removed. No public route
falls back to fixtures when Neon contains zero approved profiles. The homepage
uses the existing Astra composition with an honest curated-collective empty
state; the directory's approved empty/search state remains intact.

## Demo seed decision

Phase 3 does not install a durable demo seed. The authoritative final rich seed
also includes real Auth identities, inquiries and moderation history that are
outside this phase. Query and route verification instead used clearly prefixed,
temporary development-only profile, skill and portfolio rows and deleted them
after each run. The six Phase 1 categories remain the only durable application
seed data.

## Index and migration review

The Phase 1 schema already supplies the required indexes: unique profile slug,
`(status, updated_at)`, `(status, category_id)`, and child
`(profile_id, position)` indexes. Phase 3 demonstrated no schema or index gap,
so the existing migration remains unchanged and no migration was generated.

## Verification completed

- Existing domain tests: 26 passing.
- Existing Auth/provisioning tests: 13 passing.
- Focused real-Neon public-query tests: 19 passing; they cover every profile status, approved detail,
  nonexistent detail, category filtering/counts, search, composed filters,
  explicit public projection and deterministic profile/child ordering.
- Production-route QA covers homepage, directory, search, category filtering,
  approved detail HTTP 200, non-approved and missing detail HTTP 404, Auth
  pages, honest zero-approved rendering and browser runtime errors.
- Temporary integration profiles and their cascading child rows were removed.
- Typecheck, lint, the Next.js production build, Drizzle consistency and
  database smoke all pass. Database smoke confirms exactly seven application
  tables and four enums; the public integration suite confirms all six seeded
  categories.
- The migration, official brand/reference assets and Astra visual treatment
  are unchanged. The ignored local environment is untracked and no configured
  secret value appears in tracked source or client build output.

## Known deferrals

- Talent dashboard editing and profile lifecycle mutations remain Backend
  Phase 4.
- Admin moderation UI/actions, inquiry persistence/administration, media
  uploads and rich project galleries remain deferred.
- The final development demo dataset remains deferred until its real Auth and
  credential requirements are in scope.
- No Motion or UI/UX Pro Max enhancement is part of Phase 3.
