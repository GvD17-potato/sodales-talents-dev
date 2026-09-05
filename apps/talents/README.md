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
pnpm --filter @sodales/talents lint
pnpm --filter @sodales/talents typecheck
pnpm --filter @sodales/talents build
```

## Testing data boundary

The public preview uses **TESTING FIXTURE DATA** containing approved demo
profiles only. `listApprovedTalents()` and `getApprovedTalentBySlug()` provide
the stable public-query boundary for a later approved-only SQL adapter. Unknown
profile slugs return the application 404.

Setting `TALENTS_DATA_SOURCE=database` currently fails explicitly because the
Neon/Drizzle adapter is a testing-milestone deferral; it does not silently fall
back to fixtures while claiming database integration.

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

Neon Postgres, Drizzle, real SQL queries, Neon Auth, persisted inquiries,
talent/admin dashboards, moderation/domain state machines, audit records, and
their integration tests are not implemented in this preview. Login, sign-up,
and inquiry forms are truthful non-persisting shells and do not transmit
credentials or claim success.
