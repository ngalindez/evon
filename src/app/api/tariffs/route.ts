import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// price_per_kwh arrives as a decimal STRING (never a float) — parsed into Money server-side.
const createTariffSchema = z.object({
  distribuidora: z.string().min(1),
  pricePerKwh: z.string().regex(/^\d+(\.\d+)?$/, 'must be a decimal string'),
  effectiveFrom: z.string().datetime(),
})

export async function POST(request: Request) {
  const parsed = createTariffSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  // TODO(evon): persist the tariff (server/tariffs write side). margin = 0 for the MVP; VAT /
  // surcharges / fixed charge undecided — see CLAUDE.md "Detailed tariff rules".
  return NextResponse.json({ error: 'not implemented' }, { status: 501 })
}
