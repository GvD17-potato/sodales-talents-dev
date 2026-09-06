# Sodales Talents — Backend Phase 2 Neon Auth Integration

## Status

Complete. Source implementation and real integration are verified against the
existing `Sodales-Talent` Neon project's `development` branch.

This record does not supersede the SDD, the Neon setup contract, or the Step 12A
domain decisions.

## Neon Auth architecture

- The application uses `@neondatabase/auth` with the Next.js server adapter.
- `createNeonAuth` is configured once in `src/lib/auth/server.ts`.
- `/api/auth/[...path]` delegates to `auth.handler()`.
- `src/middleware.ts` uses `auth.middleware({ loginUrl: "/login" })` for the
  SDD matcher covering `/dashboard`, `/admin`, and `/api/auth`.
- The SDK's built-in Auth API skip routes keep anonymous sign-up and sign-in
  endpoints accessible even though `/api/auth/:path*` is matched.
- Server pages and actions resolve the Auth session dynamically. Application
  role checks never depend on client state.
- `@neondatabase/auth` `0.5.0-beta` is pinned. Its official Next.js guide says
  Next.js 15+ is supported and the application compiles on Next.js 15.5.25. The
  package currently advertises an optional Next.js 16 peer range. Real
  Next.js 15.5.25 handler, middleware, session, and redirect behavior has now
  passed against Managed Neon Auth.

## Auth identity and application rows

The Neon Auth user ID is stored as `user_role.user_id` and
`talent_profile.user_id`. No application users table exists or is added.

`user_role` is authoritative for application roles. The only persisted roles
remain `talent` and `admin`; an unauthenticated visitor has no row.

## Sign-up provisioning strategy

Self-service sign-up accepts only name, email, and password. The input schema is
strict and does not accept a requested role. Every public sign-up provisions a
`talent` account.

After Neon Auth creates or authenticates the identity, application
reconciliation runs in one Postgres transaction:

1. Insert `user_role(talent)` on conflict do nothing.
2. Re-read the persisted role, preserving an existing `admin` role.
3. For a talent, create one `draft` profile on conflict do nothing.
4. Derive a normalized name-based slug and try bounded numeric suffixes on
   collisions.
5. Re-read and verify the required role/profile rows before redirecting.

The initial draft stores `headline`, `bio`, `location`, and `category_id` as
null and remains `draft`. Publication completeness is not applied during
account creation.

Neon Auth and application writes cannot share one transaction. The selected
consistency strategy is therefore idempotent reconciliation after sign-up and
on every successful sign-in. If identity or application verification fails,
the application terminates the new session, reports a safe setup error, and
does not grant protected-route access. A later sign-in safely retries missing
application rows.

## Role enforcement

- `getCurrentUser` resolves the Auth identity and its application account.
- `requireUser` rejects requests without an Auth session.
- `requireRole` checks `user_role` server-side and treats a talent role without
  its required profile as incomplete application state.
- `/dashboard` permits talent and admin per SDD §3.
- `/dashboard/profile` permits talent only.
- `/admin/*` permits admin only.
- Middleware supplies authentication-only protection; page guards supply role
  authorization.

## First-admin bootstrap

The explicit operator command is:

```text
corepack pnpm --filter @sodales/talents auth:bootstrap-admin
```

It requires the administrator email and password through server-only
environment values, calls the branch-scoped Neon Auth endpoint with the
required origin header, treats an existing Auth account as repeatable state,
looks up the real Auth user ID, and idempotently upserts `user_role(admin)`.
There is no public admin registration page and normal sign-up cannot select an
admin role.

## Environment variables

Names only:

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `NEON_BRANCH`
- `NEON_AUTH_BASE_URL`
- `NEON_AUTH_JWKS_URL`
- `NEON_AUTH_COOKIE_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

`NEON_AUTH_COOKIE_SECRET` is required, must contain at least 32 characters,
and has no code fallback. Local values belong only in ignored environment
files.

## Verification completed

- Existing domain tests: 26 passing.
- Auth/provisioning/authorization tests: 13 passing.
- TypeScript: passing.
- ESLint: passing.
- Next.js 15 production build: passing with the branch-scoped development Auth
  configuration.
- Database smoke: connectivity, exactly seven application tables, and four
  enums passing.
- Managed Neon Auth: enabled on `development`; the provider-managed
  `neon_auth` schema and branch-scoped endpoint are present.
- Real handler and browser integration: public Auth API access, talent sign-up,
  exactly one `user_role(talent)` row, exactly one `talent_profile(draft)` row,
  idempotent reconciliation, login/session cookies, `/dashboard` redirects and
  access, `/admin` denial for talent, logout, and signed-out protection passed.
- Test-data cleanup: all clearly prefixed temporary Auth identities and their
  application rows were removed; seeded categories were retained.
- First-admin bootstrap was not executed because `ADMIN_EMAIL` and
  `ADMIN_PASSWORD` are not configured. The controlled, idempotent operator
  command remains ready; public sign-up's inability to request admin is covered
  by the focused Auth tests.

## Known deferrals

- SQL-backed public talent queries remain fixture-backed until Backend Phase 3.
- Full talent dashboard/profile editing is deferred.
- Admin moderation and inquiry administration are deferred.
- No migration or application schema change is part of Phase 2.
- No UI/UX Pro Max or Motion work is part of Phase 2.
