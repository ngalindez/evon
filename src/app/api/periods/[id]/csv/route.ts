import { buildCsvForPeriod } from '@/server/output'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/periods/[id]/csv?margin=0.08
 *
 * Plain English: streams the period's CSV as a download. Optional `margin` query overrides the
 * tariff default when the period hasn't been approved yet — that's how the chip on the review
 * screen flows through to the file.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await ctx.params
  const margin = req.nextUrl.searchParams.get('margin') ?? undefined
  try {
    const csv = await buildCsvForPeriod(id, { marginOverride: margin })
    return new NextResponse(csv.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${csv.filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }
}
