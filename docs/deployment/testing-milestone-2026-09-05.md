# Sodales Talents — Expedited P0 Testing Deployment

## Status

Deployed and smoke-tested on 2026-09-05.

- Vercel project: `sodales-talents-p0-testing-20260905`
- Deployment ID: `dpl_DWPQdfwtD8sxnHciBE6DJHjNGEYQ`
- Preview:
  `https://sodales-talents-p0-testing-20260905-jtixyr0mu.vercel.app`
- Vercel state: `READY`
- Access: protected by the team's Vercel Authentication policy

The repository's pre-existing local Vercel link targets a different project.
This milestone was deployed explicitly to the project above from a clean
temporary source staging directory so the team's Git-author policy did not
misclassify the CLI deployment. Do not assume an unqualified `vercel deploy`
targets this testing project.

## Implemented P0 scope

- pnpm/Turbo workspace and shared UI package
- Next.js 15 and Tailwind v4 application
- official supplied Sodales brand assets, used unchanged
- responsive public header and footer
- `/`, `/talents`, `/talents/[slug]`, `/login`, and `/sign-up`
- approved-only public data boundary and deterministic search/filter behavior
- first-session homepage entrance
- restrained approved top-level route transitions
- reduced-motion entrance and direct reduced-motion navigation
- loading, error, empty, and 404 states required by P0

## Data disclosure

The deployment uses **TESTING FIXTURE DATA** containing approved demo profiles
only. This is not a Neon or database implementation.

`listApprovedTalents()` and `getApprovedTalentBySlug()` are retained as the
stable public-query boundary for replacement by a SQL adapter. An explicit
database data-source setting fails rather than silently pretending fixtures are
database results.

## Verification

Local verification passed:

- ESLint
- TypeScript typecheck
- optimized production build
- route/content smoke tests
- unknown-profile 404
- horizontal-overflow checks at 375, 768, 1280, and 1440 pixels
- reduced-motion entrance presence and timely dissolve
- visual screenshot review of homepage, directory, profile, and login layouts

Authenticated remote smoke testing passed behind Vercel Authentication for:

- `/`
- `/talents`
- `/talents?q=TypeScript`
- `/talents?category=photography`
- `/talents/lena-ortiz`
- `/login`
- `/sign-up`
- both official brand image URLs
- the official-symbol `/icon.png`
- `/talents/not-a-real-profile` returning HTTP 404

## Testing-milestone deferrals

- Neon Postgres and Drizzle schema/migrations
- real approved-only SQL queries
- Neon Auth
- persisted inquiry submissions
- talent dashboard and profile editing
- admin moderation
- profile and inquiry state machines
- moderation audit records
- integration tests for deferred backend behavior

Login, sign-up, and inquiry forms are truthful non-persisting testing shells.
They do not transmit credentials or report fabricated success.

## Known visual limitation

The supplied official PNG marks have opaque white backgrounds and no approved
transparent/reversed variants. They are placed only on controlled light asset
surfaces. No recolouring, tracing, geometry replacement, or unofficial reversed
logo was introduced. Final dark-chrome treatment remains dependent on approved
source assets.
