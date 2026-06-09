import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const listPeriodsSchema = z.object({
  buildingId: z.string().min(1),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = listPeriodsSchema.safeParse({ buildingId: searchParams.get('buildingId') })
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  // TODO(evon): list billing_periods for the building (scoped to the authenticated admin).
  return NextResponse.json({ periods: [] })
}
