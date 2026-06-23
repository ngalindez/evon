import { getEnv } from '@/infra/config/env'
import { logger } from '@/infra/observability/logger'
import { pollAllDevices } from '@/server/metering'
import { type NextRequest, NextResponse } from 'next/server'

// Never statically optimized — this must run at request time with the live secret.
export const dynamic = 'force-dynamic'

/**
 * Daily counter-poll cron. Vercel Cron calls this at 06:00 UTC (vercel.json) with
 * `Authorization: Bearer $CRON_SECRET`. Public HTTP, so the secret check is mandatory. Snapshots
 * every device's cumulative counter into a MeterSample; the device usage graphs feed off these.
 */
export async function GET(request: NextRequest) {
  const provided = request.headers.get('authorization')
  if (provided !== `Bearer ${getEnv().CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  logger.info('cron: poll-samples invoked')
  const result = await pollAllDevices()
  logger.info('cron: poll-samples done', result)
  return NextResponse.json({
    ok: true,
    total: result.total,
    succeeded: result.ok,
    failed: result.failed,
  })
}
