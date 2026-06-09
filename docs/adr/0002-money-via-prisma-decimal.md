# Money via Prisma.Decimal, not standalone decimal.js

CLAUDE.md's stack lists "decimal.js in code". We instead standardize on **Prisma.Decimal** as
the single money type and do NOT add the standalone `decimal.js` dependency.

## Why

Prisma already returns `Prisma.Decimal` (a bundled decimal.js build) for every `NUMERIC`
column. Adding standalone `decimal.js` would create two distinct `Decimal` classes that fail
`instanceof`/`===` checks and force conversions at every Prisma boundary — a subtle source of
bugs. Using `Prisma.Decimal` everywhere satisfies the real requirement ("never float, exact
decimal arithmetic") with one type.

`src/lib/money.ts` wraps it: re-exports `Money` (= `Prisma.Decimal`) and a `roundUnitTotal`
helper pinned to `ROUND_HALF_UP`, 2 dp — the only place rounding mode is configured.

Column scales: money `NUMERIC(12,2)`, kWh `NUMERIC(12,3)`, price_per_kwh `NUMERIC(12,6)`,
raw counters `NUMERIC(14,3)`. Prices carry more decimals than totals so rounding happens once,
on the final per-unit total (CLAUDE.md rounding rule).

This deviates from the literal CLAUDE.md wording, so it is recorded here; CLAUDE.md's stack
line was updated to match.
