# Evon — Project Guide (CLAUDE.md)

This file orients Claude Code. It summarizes what Evon is, the decisions already made, the
architecture, and the conventions. Unknowns are marked as TODO and resolved as we go. Keep
this file at the repo root.

## What Evon is

A B2B service for building administrators in Argentina. It automates billing the electricity
used to charge electric cars in individual parking spots, injecting it as one more line item
in the monthly expensas (building-fee) statement.

Flow: one smart breaker per parking spot measures kWh -> Evon reads them from the
manufacturer's cloud -> applies the current electricity tariff -> generates a CSV the
administrator imports into their existing expensas software. The expensas software handles
collection (via SIRO, out of Evon's scope). The resident never uses Evon: they see the charge
on their statement and pay as usual.

## Naming convention

The schema is **all English**. Argentine domain concepts that have no clean English
equivalent are kept as named terms only in this glossary (expensas, SIRO, EDESUR/EDENOR),
never as table or column names.

## Domain glossary

- **Building** (consorcio): a horizontal-property building under Argentine "propiedad
  horizontal" law. Table: `buildings`.
- **Unit** (unidad funcional): an individual unit (apartment / parking spot) with an owner.
  The unit that gets billed. Table: `units`.
- **Building admin** (administrador): Evon's paying customer. The tenant root. Manages several
  buildings (~13 on average). Table: `building_admins`. NOT an Evon staff member.
- **Expensas**: the monthly common building fee each unit pays.
- **Distribuidora**: the electricity utility (EDESUR / EDENOR). Defines the per-kWh tariff.
- **Smart breaker**: a WiFi meter installed in each parking spot's panel (Shelly first). The
  source of consumption data. Table: `meter_devices`.
- **Expensas software**: the system the administrator already uses (Octopus, ConsorcioAbierto,
  AdminProp, etc.). Evon hands it a CSV; it has no API.
- **Export profile**: the CSV format specific to each expensas software.
- **SIRO**: collections platform (Banco Roela) the expensas software uploads to. Evon does
  NOT integrate with it in the MVP.

## MVP scope

In scope:

- Connector to the Shelly cloud (read kWh per device and period).
- Pricing engine (kWh x price; no margin for now).
- CSV generation (generic profile) and per-unit detail PDF.
- Building-admin web panel (configure buildings/units/tariffs, review the month, download CSV).
- Automated monthly closing cycle.

Out of scope (roadmap):

- Resident app, remote charge control, reservations, CSMS (V2).
- Tuya / eWeLink connectors (V2).
- Direct SIRO integration and payment reconciliation (V3).

## Stack

- **Framework**: Next.js (App Router) + TypeScript (strict). Panel and API in the same project.
- **Hosting**: Vercel. Monthly cron via Vercel Cron.
- **Database**: Neon (Postgres). Two URLs: pooled (queries) and direct (migrations).
- **ORM / migrations**: Prisma.
- **File storage**: Cloudflare R2.
- **Email**: Resend.
- **Package manager**: pnpm.
- **Lint/format**: Biome. **Tests**: Vitest. **Validation**: Zod. **UI**: Tailwind.
  **Auth**: httpOnly cookie session (Auth.js v5). Wired from the skeleton — `authorize()` is a
  `TODO(evon)` (depends on how `building_admins` credentials are stored/hashed). `middleware.ts`
  protects `(panel)/*`. Cron routes are machine-auth: guarded by an `Authorization: Bearer
  CRON_SECRET` check (Vercel Cron sends it) — non-optional, the close endpoint is public HTTP.
- **Money**: NUMERIC columns in Postgres + `Prisma.Decimal` in code (a bundled decimal.js; no
  standalone decimal.js dep — see ADR 0002). **Never float.**

## Folder structure

```
evon/
|- prisma/
|  |- schema.prisma
|  |- migrations/
|- src/
|  |- app/                          # Next.js App Router (UI + API)
|  |  |- (panel)/                   # building-admin panel pages
|  |  |  |- login/  buildings/  periods/  tariffs/
|  |  |- api/                       # route handlers = the HTTP API
|  |  |  |- buildings/  periods/  tariffs/
|  |  |  |- cron/monthly-close/     # called by Vercel Cron on day 1
|  |- server/                       # business logic (server-only)
|  |  |- catalog/  metering/  tariffs/  pricing/  billing/  output/
|  |  |- orchestration/billing-cycle.ts
|  |- connectors/                   # integrations
|  |  |- meter-connector.ts         # common interface
|  |  |- shelly/  tuya/  ewelink/
|  |  |- registry.ts
|  |- infra/                        # support
|  |  |- auth/  crypto/  db/  notifications/  storage/  config/  observability/
|  |- lib/                          # shared types, Money/Decimal, utils
|- vercel.json                      # defines the day-1 Cron Job
|- .env.example
|- docker-compose.yml               # local Postgres for development
|- package.json
```

Dependency rule: `app/` -> `server/` -> (`connectors/` | `infra/` | `lib/`). Never the reverse.
Everything under `server/`, `connectors/`, and `infra/` is server-only (never bundled to the client).

## Data model

Configuration tables: `buildings`, `units`, `cloud_connections`, `meter_devices`, `tariffs`.

Monthly-cycle tables: `billing_periods`, `meter_readings`, `billing_lines`.

Peripheral: `building_admins`, `output_files`, `audit_log`.

Key relations and notes:

- `building_admins` is the tenant root. One row = one customer = one login (MVP).
- `buildings.building_admin_id` -> `building_admins`. One admin manages many buildings.
- `units.building_id` -> `buildings`.
- `cloud_connections.building_id` -> `buildings` (a building can have more than one, e.g.
  mixed brands; in the MVP normal case there is one Shelly account per building).
- `meter_devices.unit_id` -> `units` and `meter_devices.connection_id` -> `cloud_connections`.
- `tariffs` does not belong to a building: looked up by distribuidora + effective date.
- `meter_readings.period_id` -> `billing_periods`, `meter_readings.device_id` -> `meter_devices`.
  Stores `raw_payload` (JSONB) with the cloud's raw response, for traceability.
- `billing_lines.period_id` -> `billing_periods`, `billing_lines.unit_id` -> `units`.
- `output_files.period_id` -> `billing_periods` (R2 storage key + profile + type).

## Conventions

- **Rounding**: round only the final per-unit total, to 2 decimals, half-up. kWh to 3 decimals.
- **Time zone**: store timestamps in UTC (`timestamptz`); display in Argentina time. Cron runs
  at 06:00 UTC = 03:00 ART.
- **Validation**: Zod at every API boundary.
- **Connectors**: a common interface (`MeterConnector`) with authenticate / list devices /
  get consumption between two dates. `ShellyConnector` first; a registry picks the
  implementation by provider. Business logic never knows which brand the data came from.
- **Cloud credentials**: encrypted at rest (key from env var). Never plaintext, never committed.
- **Traceability**: every billed amount must be reconstructible from the raw reading + the
  applied tariff (`audit_log` + `raw_payload`).

## Monthly billing cycle

1. Vercel Cron calls `/api/cron/monthly-close` on day 1 (06:00 UTC).
2. For each building (one per invocation, to stay within the serverless time limit): read the
   month's consumption from each breaker (via connector), apply the tariff in effect per
   reading, aggregate by unit, generate `billing_lines` (including units at $0).
3. Generate CSV (the admin's software profile) + per-unit PDFs. State: `pending_review`.
4. Notify the admin by email with the CSV attached.
5. The admin reviews, approves, and imports the CSV into their expensas software. From there on
   Evon is not involved.

## TODO / open questions

- [ ] **Shelly API shape**: cumulative counter or interval consumption? Confirm with a physical
      device. Affects the `ShellyConnector` implementation and whether a baseline reading is needed
      at period start. The `MeterConnector` interface does not change.
- [ ] **CSV format** of the pilot's expensas software. For now: a generic profile
      (`unit, concept, amount, detail`). Adding specific profiles means adding implementations,
      not rewriting.
- [ ] **Detailed tariff rules** (VAT, surcharges, fixed charge, source of the tariff tables).
      For now: `amount = kWh x price_per_kwh`, `margin = 0`, price entered manually with an
      effective date.
- [ ] **Pilot building**: not yet identified. It unblocks the real CSV format and the tariff
      numbers.

## Running locally

```
pnpm install
docker-compose up -d            # local Postgres
pnpm prisma migrate dev
pnpm dev                        # Next.js
pnpm test                       # Vitest
```
