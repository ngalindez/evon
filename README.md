# Evon

B2B service for building (consorcio) administrators in Argentina. It automates billing the
electricity used to charge electric cars in individual parking spots, injecting it as one more
line item in the monthly expensas statement.

See [`CLAUDE.md`](./CLAUDE.md) for the full product/architecture guide, [`CONTEXT.md`](./CONTEXT.md)
for the domain glossary, and [`docs/adr/`](./docs/adr) for recorded decisions.

> Status: **skeleton**. Integrations (Shelly API, CSV profiles, tariff rules) are typed stubs
> marked `// TODO(evon):`. Search the repo for `TODO(evon)` to find them.

## Stack

Next.js (App Router) + TypeScript (strict) · Prisma + Neon (Postgres) · Auth.js v5 · Tailwind ·
Biome · Vitest · Zod · Resend · Cloudflare R2 · Vercel (+ Cron). Package manager: pnpm.

## Running locally

```bash
pnpm install                 # installs deps + generates the Prisma client (postinstall)
cp .env.example .env         # then fill in ENCRYPTION_KEY, AUTH_SECRET, CRON_SECRET (see below)
docker compose up -d         # local Postgres on :5432 (matches the default DATABASE_URL)
pnpm prisma:migrate          # apply the initial migration
pnpm dev                     # Next.js dev server
```

Generate the required secrets:

```bash
openssl rand -base64 32      # use for ENCRYPTION_KEY (must decode to 32 bytes)
openssl rand -base64 32      # use for AUTH_SECRET
openssl rand -base64 32      # use for CRON_SECRET
```

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | Biome check (lint + format verify) |
| `pnpm format` | Biome write (auto-fix) |
| `pnpm test` | Vitest (run once) |
| `pnpm prisma:generate` | Regenerate the Prisma client |
| `pnpm prisma:migrate` | Create/apply a dev migration |
| `pnpm prisma:studio` | Prisma Studio |

## Monthly close (cron)

Vercel Cron calls `POST /api/cron/monthly-close` on day 1 at 06:00 UTC (`vercel.json`). The route
is guarded by `Authorization: Bearer $CRON_SECRET` (Vercel attaches this automatically). It runs
the orchestrator for one building per invocation. See `src/server/orchestration/billing-cycle.ts`.
