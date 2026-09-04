# Neon App Setup — Reference Patterns (READ THIS FULLY BEFORE CODING)

This is the canonical implementation pattern for every Sodales database-backed app.
Follow it exactly. It is verified against current Neon Auth docs. If you follow this file,
your auth, database, and layout will be consistent with the other five apps.

---

## 1. Command environment (CRITICAL)

Run pnpm/node commands in the operating system that owns the repository filesystem. On macOS,
Linux, or from an already-open WSL shell, run them natively from the repo root. If invoking from
a Windows host while the repository is stored in WSL, cross the boundary once with `wsl.exe`.

```bash
# macOS, Linux, or an existing WSL shell:
pnpm --filter @sodales/<app> build
node scripts/db-smoke.mjs <app>

# Windows host targeting a repository stored in WSL:
# wsl.exe -d Ubuntu-22.04 -e bash -lc "cd /home/reymar/Programming/Sojales && export HOME=/home/reymar && <YOUR COMMAND>"
```

HARD RULES:
- Run pnpm commands with `pnpm --filter @sodales/<app> <script>` — NEVER bare `pnpm install`
  (other agents run in parallel; do not touch the lockfile or root node_modules).
- NEVER run a dev server (ports 3000-3005 are busy with the orchestrator's Docker stack).
  Verify with `build`, `typecheck`, `lint` instead.
- NEVER run `git` commands (the orchestrator commits).
- NEVER print or copy the values in your app's `.env.local` into any file, log, or report.

## 2. Environment

`.env.local` (already written by the orchestrator, git-ignored) contains:
`DATABASE_URL` (pooled, dev branch), `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`,
`NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL`, `ADMIN_EMAIL`.
`.env.example` documents the names. Read values at runtime only:

```ts
const env = {
  DATABASE_URL: process.env.DATABASE_URL!,            // server-only, never expose
  NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL!,
  NEON_AUTH_COOKIE_SECRET: process.env.NEON_AUTH_COOKIE_SECRET ?? "dev-insecure-secret",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "admin@sodales.com",
};
```

NOTE: `.env.local` values are wrapped in double quotes by Neon's env pull; standard
dotenv handling strips them — do not hand-parse this file in app code. (Scripts that
must hand-parse can copy `scripts/db-smoke.mjs`.)

## 3. Auth — Neon Auth (managed Better Auth) via @neondatabase/auth

Dependencies (already installed in your app): `@neondatabase/auth`, `next`, `react`.

### 3a. Server instance — `src/lib/auth/server.ts`

```ts
import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET ?? "dev-insecure-secret-32-chars-min!!" },
});
```

### 3b. API route — `src/app/api/auth/[...path]/route.ts`

```ts
import { auth } from "@/lib/auth/server";

export const { GET, POST } = auth.handler();
```

### 3c. Middleware — `src/middleware.ts`

```ts
import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/login" });

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/auth/:path*",
  ], // adjust to your app's protected route prefixes; do NOT match public pages
};
```

Middleware redirects unauthenticated users to `/login` for protected prefixes. It does NOT
do role checks — roles are checked server-side in data access (section 3f).

### 3d. Client — `src/lib/auth/client.ts`

```ts
"use client";
import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();
```

### 3e. Sign-up / sign-in / sign-out (server actions, useActionState-friendly)

```ts
"use server";
import { auth } from "@/lib/auth/server";

// state shape: { error?: string }
export async function signUpAction(prev: unknown, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!name || !email || password.length < 8) return { error: "All fields are required. Password must be at least 8 characters." };
  const res = await auth.signUp.email({ name, email, password });
  if (res.error) return { error: res.error.message ?? "Sign up failed" };
  return {}; // success — client redirects
}

export async function signInAction(prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const res = await auth.signIn.email({ email, password });
  if (res.error) return { error: res.error.message ?? "Invalid email or password" };
  return {};
}

export async function signOutAction() {
  await auth.signOut();
}
```

### 3f. Session + role — `src/lib/auth/session.ts`

```ts
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./server";
import { getRoleForUserId } from "@/db/queries"; // your app's data access

export const getSession = cache(async () => {
  const { data } = await auth.getSession();
  return data; // { user: { id, email, name, ... }, session } | null
});

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireUser();
  const role = await getRoleForUserId(session.user.id);
  if (!role || !roles.includes(role)) redirect("/"); // or render 403 page
  return { session, role };
}
```

RULES:
- Authorization checks ALWAYS run server-side, in data-access functions or page-level
  guards. Never trust client state. Admin pages call `requireRole("admin")`.
- Pages using `auth.getSession()` must be dynamic (they read cookies, so they are).
- Sign-in/sign-up pages are PUBLIC; if a logged-in user visits them, redirect to /dashboard.
- Every DB app ships /login (+ /sign-up or combined page) at the routes in its SDD.

## 4. Database — Drizzle ORM + postgres.js

Dependencies (already installed): `drizzle-orm`, `postgres`, dev: `drizzle-kit`, `tsx`.

### 4a. Client — `src/db/index.ts`

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 10 });

export const db = drizzle(client);
export * as schema from "./schema"; // adjust to your schema export style
```

### 4b. Config — `drizzle.config.ts` (app root)

```ts
import { defineConfig } from "drizzle-kit";
import { readFileSync } from "node:fs";

// .env.local values are quoted; strip them
const raw = readFileSync(".env.local", "utf8");
const url = raw.split("\n").find((l) => l.startsWith("DATABASE_URL="))!
  .split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: { url },
});
```

### 4c. Schema conventions (see also docs/sdd/00-platform.md)

- One file per domain under `src/db/schema/` + a barrel `index.ts`.
- UUID PKs (`uuid("id").primaryKey().defaultRandom()`), snake_case names.
- `created_at`/`updated_at` timestamps on mutable tables.
- Public slugs: `.notNull().unique()`.
- Draft/publish: `status` enum column (`pgEnum`), not booleans.
- Role mapping: your app's profile/role table has `user_id uuid NOT NULL UNIQUE` referencing
  the Neon Auth user id (no FK to neon_auth possible cross-schema in drizzle-kit — enforce
  in code), plus `role` text/enum column.

### 4d. Package scripts (add to your app's package.json)

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio",
"db:seed": "tsx src/db/seed.ts"
```

Workflow: write schema → `pnpm --filter @sodales/<app> db:generate` → `db:migrate`
(applies to the DEV branch via .env.local) → `db:seed`.

### 4e. Seed — `src/db/seed.ts`

- Load env by hand (strip quotes) like `drizzle.config.ts` above; DO NOT add dotenv deps.
- Idempotent: use `onConflictDoNothing()` everywhere so re-running is safe.
- FIRST-ADMIN BOOTSTRAP (mandatory):
  1. POST to `${process.env.NEON_AUTH_BASE_URL}/sign-up/email` with JSON
     `{ email: ADMIN_EMAIL, name: "Sodales Admin", password: "sodales-admin-2026!" }`
     via fetch. You MUST include the header `origin: <NEON_AUTH_BASE_URL>` — the Neon Auth
     API rejects server-to-server sign-ups without it (`400 MISSING_ORIGIN`). Also send
     `content-type: application/json`. Treat an error body containing "USER_ALREADY_EXISTS"
     as success. If the request fails for another reason (e.g. HTTP 429 rate limit), log a
     clear warning and continue (the role upsert below will succeed on a later seed run
     once the user exists).
  2. Look up the user id: `SELECT id FROM neon_auth."user" WHERE email = $1`.
  3. Upsert your app's role/profile row for that user with the `admin` role.
- Create RICH DEMO CONTENT (this powers the beautiful UI): realistic names, descriptions,
  prices, categories — see your SDD's seed section. Also create 2-3 demo users the same way
  (e.g. `demo@sodales.app`, `creator@sodales.app`, password `sodales-demo-2026!`) with
  appropriate roles, and document them in your app README.
- Verify with: `node scripts/db-smoke.mjs <app>` (run from repo root, via the WSL wrapper).

## 5. Design system — "Sodales family" look

Shared tokens live in `packages/ui/src/globals.css` (imported via your globals.css).
Your app adds personality through accent colors and typography — but the skeleton is shared:

### Layout skeleton (every app)
- `<html lang="en" suppressHydrationWarning>` + `<body className="min-h-dvh bg-background font-sans text-foreground antialiased">`
- Fonts via `geist` package (already installed): `import { GeistSans } from "geist/font/sans"`
  → `<body className={GeistSans.variable}>` with `@theme inline { --font-sans: var(--font-geist-sans); }`
  in globals.css. Display headings may use `font-serif` stack (Georgia) for editorial contrast.
- Sticky translucent header: `sticky top-0 z-40 border-b bg-background/80 backdrop-blur`.
- Content container: `mx-auto max-w-6xl px-4 sm:px-6` (marketing pages `max-w-5xl`).
- Footer: muted, small, with product name + sibling-app links (sodales.com siblings) + © 2026 Sodales.
- `next-themes` + `sonner` are installed: add `<Toaster richColors position="top-right" />`
  (from `sonner`) in the root layout. A ThemeProvider + toggle is optional per app.
- lucide-react icons everywhere (`lucide-react` installed). No external images ANYWHERE —
  use gradients, geometric patterns, lucide icons, or initials avatars instead.
- Toaster + sonner for action feedback (success/error toasts on create/edit/delete).

### Quality bar (this is a hard requirement)
- Every page: mobile-first responsive; keyboard navigable; semantic landmarks (header/main/nav/footer);
  labeled inputs (Label + Input); focus-visible rings come free from primitives.
- Every list page: `<Skeleton />` loading rows via `loading.tsx`, designed empty state
  (icon + heading + description + CTA), error via `error.tsx` ("Something went wrong" + retry).
- Every form: client-side zod validation + server-action re-validation, inline field errors,
  success toast, disabled/submitting button state (`useActionState` pending flag).
- Cards/tables/polish: consistent `rounded-xl border bg-card` surfaces, `shadow-sm`,
  generous padding (`p-6`), `Badge` for statuses with semantic colors.
- Marketing/home pages should feel ALIVE: hero with gradient/typographic composition,
  feature grids, subtle hover transitions (`transition-colors`, `hover:-translate-y-0.5`).
- `Button` supports `asChild` (Radix Slot): `<Button asChild><Link href="/x">Go</Link></Button>`
  renders a Next `<Link>` with button styles — no separate LinkButton component needed.

### Accent palette per app (override tokens in your app's globals.css `:root`)
| App      | Accent (use as `primary`)          |
| -------- | ---------------------------------- |
| Academy  | indigo `oklch(0.51 0.23 277)`      |
| Persona  | rose `oklch(0.65 0.24 16)`         |
| Cinema   | amber `oklch(0.77 0.16 70)` (dark theme default) |
| Talents  | emerald `oklch(0.6 0.15 163)`      |
| Store    | sky `oklch(0.62 0.16 234)`         |

To theme: set `--primary`, `--primary-foreground`, `--ring` in `:root` (and `.dark`).
Cinema sets `className="dark"` on `<html>` (dark-first product).

### Admin panel skeleton (DB apps)
- Route group `src/app/(admin)/admin/…` with its own layout:
  sidebar nav (app name, section links, "View site" link, sign-out) on desktop,
  collapsible on mobile; topbar with page title + user email.
- Lists: `Table` in `Card`, row actions in `DropdownMenu` (edit/publish/hide/delete),
  status `Badge`s, empty state, skeleton loading.
- Forms: create/edit pages or `Dialog`s; zod-validated server actions with toasts.
- All admin pages call `requireRole("admin")` (or app-specific roles) server-side FIRST.

## 6. Standard app structure

```
apps/<app>/src/
├── app/                  (public routes; (auth) group for login/signup; (admin) group for admin; (dashboard) for user area)
├── lib/auth/{server,client,session}.ts
├── lib/{validation,utils,constants}.ts
├── db/{index.ts, seed.ts, schema/*, migrations/}
├── components/           (app-local: site-header, site-footer, cards, forms, admin bits)
└── features/<domain>/    (server actions + data-access queries per domain)
```

Data access lives in `features/<domain>/queries.ts` + `actions.ts` ("use server").
Pages are thin: fetch via queries, render components. Validation schemas in
`lib/validation.ts` with zod. NEVER import another app's code.

## 7. Definition of done (verify ALL before reporting)

```bash
# from repo root, via the WSL wrapper:
pnpm --filter @sodales/<app> db:generate && pnpm --filter @sodales/<app> db:migrate && pnpm --filter @sodales/<app> db:seed
node scripts/db-smoke.mjs <app>
pnpm --filter @sodales/<app> typecheck
pnpm --filter @sodales/<app> lint
pnpm --filter @sodales/<app> build
```

All green + seed verified + admin guarded + states present. Main (no DB) skips db steps.
