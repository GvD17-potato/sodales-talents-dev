# Sodales Talents

Next.js 15 application for the Sodales Talents marketplace. The current build
is the expedited P0 testing milestone, not the completed production product.

## Run locally

From the workspace root:

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000` by default.

Verification commands:

```bash
pnpm --filter @sodales/talents test:domain
pnpm --filter @sodales/talents lint
pnpm --filter @sodales/talents typecheck
pnpm --filter @sodales/talents build
```

## Database foundation

Backend Phase 1 adds a server-only Neon/Postgres client, the seven-table
Drizzle schema, generated migrations, domain validation/state primitives, and
an explicit idempotent development category seed. Configure `DATABASE_URL` in
an ignored `.env.local`; never expose it through a `NEXT_PUBLIC_*` variable.

From the workspace root:

```bash
pnpm --filter @sodales/talents db:generate
pnpm --filter @sodales/talents db:migrate
pnpm --filter @sodales/talents db:seed
node scripts/db-smoke.mjs talents
```

The Phase 1 seed ensures the six SDD categories only: Design, Development,
Photography, Writing, Video, and Music. Auth users and demo talent records are
deferred so this phase does not introduce Neon Auth or fixed seed credentials.
Final SDD seed acceptance is not complete: the first-admin bootstrap, six demo
talent auth users/profiles, four inquiries, and historical moderation demo data
remain deferred to the Auth/integration phase.

Foreign-key policy is intentional: deleting a referenced category is
restricted so an approved profile cannot silently become incomplete; deleting
a talent profile cascades to its owned skills, portfolio links, inquiries, and
moderation history as required by the SDD. Auth user IDs have no database
foreign key because Neon Auth owns them in a separate schema; later write paths
must enforce those references in server-side application logic.

## Testing data boundary

The public preview uses **TESTING FIXTURE DATA** containing approved demo
profiles only. `listApprovedTalents()` and `getApprovedTalentBySlug()` provide
the stable public-query boundary for a later approved-only SQL adapter. Unknown
profile slugs return the application 404.

Setting `TALENTS_DATA_SOURCE=database` still fails explicitly because Phase 1
does not connect public reads to Neon. It does not silently fall back to
fixtures while claiming database integration.

## Testing deployment

- Preview:
  `https://sodales-talents-p0-testing-20260905-jtixyr0mu.vercel.app`
- Deployment ID: `dpl_DWPQdfwtD8sxnHciBE6DJHjNGEYQ`
- State: `READY`
- Access: protected by the team's Vercel Authentication policy

The supplied official brand PNGs are used unchanged. Their opaque white
backgrounds and lack of transparent/reversed variants remain a known limitation
for the final dark-chrome treatment.

## Testing-milestone deferrals

Remote database application, real SQL-backed public queries, Neon Auth,
persisted inquiries, talent/admin dashboards, lifecycle mutation actions,
moderation writes, and their integration tests are not implemented in this
preview. Login, sign-up, and inquiry forms are truthful non-persisting shells
and do not transmit credentials or claim success.
