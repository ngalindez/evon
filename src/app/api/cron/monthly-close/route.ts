import { getEnv } from '@/infra/config/env'
import { logger } from '@/infra/observability/logger'
import { type NextRequest, NextResponse } from 'next/server'

// Never statically optimized — this must run at request time with the live secret.
export const dynamic = 'force-dynamic'

/**
 * Monthly close cron entrypoint. Vercel Cron calls this on day 1 at 06:00 UTC (vercel.json) and
 * attaches `Authorization: Bearer $CRON_SECRET` automatically. This endpoint is public HTTP, so
 * the secret check is mandatory: without it anyone could trigger billing for every building.
 */
export async function GET(request: NextRequest) {
  const provided = request.headers.get('authorization')
  if (provided !== `Bearer ${getEnv().CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  logger.info('cron: monthly-close invoked')

  // TODO(evon): select the buildings with an open period and process ONE per invocation (to stay
  // under the serverless time limit), calling runMonthlyCloseForBuilding(buildingId, year, month)
  // from '@/server/orchestration/billing-cycle'. See CLAUDE.md "Monthly billing cycle".
  return NextResponse.json({ ok: true, processed: 0 })
}
