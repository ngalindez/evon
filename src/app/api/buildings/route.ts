import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Zod validation at the API boundary (CLAUDE.md "Validation").
const createBuildingSchema = z.object({
  name: z.string().min(1),
  distribuidora: z.string().min(1),
  address: z.string().optional(),
})

export async function GET() {
  // TODO(evon): return the authenticated building admin's buildings via
  // server/catalog.listBuildings(adminId) once auth (the building_admin) is wired.
  return NextResponse.json({ buildings: [] })
}

export async function POST(request: Request) {
  const parsed = createBuildingSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  // TODO(evon): persist via server/catalog (write side) scoped to the authenticated admin.
  return NextResponse.json({ error: 'not implemented' }, { status: 501 })
}
