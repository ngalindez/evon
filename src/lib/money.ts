import { Prisma } from '@prisma/client'

/**
 * The single money / decimal type for Evon.
 *
 * Plain English: money is never a floating-point number here — floats lose cents. Postgres
 * stores it as NUMERIC and Prisma hands it back as `Prisma.Decimal`, which is exact decimal
 * arithmetic (a decimal.js build). We standardize on that one type everywhere. See
 * docs/adr/0002-money-via-prisma-decimal.md.
 */
export const Money = Prisma.Decimal
export type Money = Prisma.Decimal

export type DecimalInput = string | number | Prisma.Decimal

export const ZERO: Money = new Prisma.Decimal(0)

/** Construct a Money value from a string, number, or Decimal. Prefer strings for literals. */
export function money(value: DecimalInput): Money {
  return new Prisma.Decimal(value)
}

/**
 * Round a per-unit total to 2 decimals, half-up.
 *
 * This is the ONLY place a money value is rounded — CLAUDE.md: "round only the final per-unit
 * total, to 2 decimals, half-up". Intermediate math stays at full precision.
 */
export function roundUnitTotal(value: Money): Money {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
}

/** Round a kWh quantity to 3 decimals, half-up (CLAUDE.md: kWh to 3 decimals). */
export function roundKwh(value: Money): Money {
  return value.toDecimalPlaces(3, Prisma.Decimal.ROUND_HALF_UP)
}
