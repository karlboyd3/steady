# Steady

A mobile-first, installable PWA that guides people through 30 days of knee rehabilitation, built to be white-labeled and licensed by physical therapy clinics.

**Live demo:** [ADD LIVE URL HERE]

![Steady demo](ADD_GIF_PATH_HERE.gif)

## Highlights

- **Guided workout flow.** Overview, exercise detail sheet, and a session player with timers, wake lock (the screen stays on mid-exercise), audio cues, and reduced-motion support.
- **Multi-tenant white-labeling.** Middleware resolves each request's hostname (`clinic.getsteady.app` or a clinic's own custom domain) into a tenant, then the server applies that clinic's theme, copy, and PWA manifest. Unknown hosts fail soft to the default tenant instead of erroring.
- **3D pet companion.** A react-three-fiber companion with six species, a coin and cosmetic reward system, loadable GLB cosmetics, and per-species animation overrides, which keeps patients coming back day after day.
- **Safe data migration.** Progress lives in tenant-scoped localStorage, with a versioned migration that upgrades legacy saved data without losing anyone's streak.
- **Operator admin panel.** A password-protected admin route, gated in middleware.
- **Security by default.** A strict Content-Security-Policy and security headers, a dependency audit that runs before every production build, and Zod validation at data boundaries.
- **Android distribution.** Packaged for Google Play as a Trusted Web Activity, with Digital Asset Links generation and verification scripts.

## Tech stack

Next.js 15 (App Router), React 19, TypeScript, Supabase (Postgres), react-three-fiber and drei, Zod, Vitest, Testing Library, Vercel.

## Testing

301 tests across 33 test files cover the session engine, rewards, storage migration, tenant resolution, middleware, and UI components.

```bash
npm ci
npm test          # vitest run
npm run typecheck # tsc --noEmit
```

## Running locally

```bash
cp .env.example .env.local   # fill in Supabase URL, service role key, and ADMIN_TOKEN
npm ci
npm run dev
```

In development, preview any tenant with `?tenant=<slug>` (for example `http://localhost:3000/?tenant=demo`). The override is read only when `NODE_ENV` is not `production`, so it cannot be used against a deployed build.

## Project structure

```
src/
  middleware.ts        hostname -> tenant resolution, admin gating
  app/                 routes (home, session, level, buddy, admin, legal pages)
  components/          UI (SessionPlayer, WorkoutOverview, PetScreen, ...)
  hooks/               useSessionEngine, useWakeLock, usePoseLoop, ...
  lib/                 session engine, rewards, storage + migration, tenant layer
supabase/migrations/   tenants table and default species
twa/                   Google Play (Trusted Web Activity) packaging
```

## Why I built it

Home exercise programs fail when patients stop doing them. Steady treats adherence as the core product problem: short guided sessions, visible progress, and a companion that rewards consistency. Clinics get all of this under their own brand.
