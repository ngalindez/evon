import type { CloudConnection, MeterSample } from '@prisma/client'
import type { Prisma, Provider } from '@prisma/client'

import { getConnector } from '@/connectors/registry'
import { decryptCredentials } from '@/infra/crypto'
import { prisma } from '@/infra/db/client'
import { logger } from '@/infra/observability/logger'
import { NotImplementedError } from '@/lib/errors'
import { money } from '@/lib/money'
import type { ConsumptionWindow } from '@/lib/types'

/**
 * Metering: read cumulative counters from the breakers' clouds and store them.
 *
 * Plain English: each breaker only reports a lifetime kWh total. We snapshot that number into a
 * MeterSample — on demand, at setup (the baseline), and once a day by cron. How much was used in
 * any span is the difference between two snapshots, which is also what drives the usage graph.
 */

/** Decrypt + JSON-parse a connection's stored cloud credentials. */
function loadCredentials(connection: CloudConnection): Record<string, unknown> {
  const plaintext = decryptCredentials(Buffer.from(connection.encryptedCredentials))
  try {
    return JSON.parse(plaintext) as Record<string, unknown>
  } catch {
    throw new Error('Las credenciales guardadas no son JSON válido.')
  }
}

// Providers whose connector can actually authenticate today. Shelly/eWeLink are still stubs, so
// their credentials are stored unvalidated until their connector lands — add them here then.
const VERIFIABLE_PROVIDERS: Provider[] = ['tuya']

/**
 * Check that credentials actually authenticate against the provider cloud (used on connection
 * save). Providers without a real connector yet (Shelly, eWeLink) can't be checked, so we let
 * those through rather than block — only a genuine auth failure rejects the save.
 */
export async function verifyConnectionCredentials(
  provider: Provider,
  credentialsPlaintext: string,
): Promise<void> {
  let credentials: Record<string, unknown>
  try {
    credentials = JSON.parse(credentialsPlaintext) as Record<string, unknown>
  } catch {
    throw new Error('Las credenciales deben ser un JSON válido.')
  }
  if (!VERIFIABLE_PROVIDERS.includes(provider)) return
  try {
    await getConnector(provider).authenticate(credentials)
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'error desconocido'
    throw new Error(`No se pudo validar la conexión con el cloud: ${detail}`)
  }
}

/**
 * Read a device's current cumulative counter and persist it as a MeterSample.
 *
 * Shared by the "Leer ahora" button, the auto-read at device setup (baseline), and the daily
 * poll cron. Returns the stored sample.
 */
export async function readDeviceCounter(deviceId: string): Promise<MeterSample> {
  const device = await prisma.meterDevice.findUnique({
    where: { id: deviceId },
    include: { connection: true },
  })
  if (!device) throw new Error(`Dispositivo ${deviceId} no encontrado.`)

  const credentials = loadCredentials(device.connection)
  const connector = getConnector(device.connection.provider)
  // ponytail: re-auths per device. Group by connection + reuse the token if device count grows.
  await connector.authenticate(credentials)
  const reading = await connector.readCounter(device.providerDeviceId)

  return prisma.meterSample.create({
    data: {
      deviceId,
      counterKwh: reading.counterKwh,
      rawPayload: reading.raw as Prisma.InputJsonValue,
      readAt: reading.readAt,
    },
  })
}

/** The most recent sample for a device, or null if it has never been read. */
export function getLatestSample(deviceId: string): Promise<MeterSample | null> {
  return prisma.meterSample.findFirst({ where: { deviceId }, orderBy: { readAt: 'desc' } })
}

/**
 * Read every device's counter and store a sample. Called by the daily poll cron.
 *
 * One failure (offline breaker, bad creds) doesn't stop the others — it's logged and counted.
 */
export async function pollAllDevices(): Promise<{ total: number; ok: number; failed: number }> {
  const devices = await prisma.meterDevice.findMany({ select: { id: true } })
  let ok = 0
  let failed = 0
  // ponytail: sequential loop. Parallelize / batch by connection if device count grows large.
  for (const d of devices) {
    try {
      await readDeviceCounter(d.id)
      ok++
    } catch (err) {
      failed++
      logger.warn('poll-samples: device read failed', {
        deviceId: d.id,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
  return { total: devices.length, ok, failed }
}

export type Granularity = 'day' | 'week' | 'month'

export type UsageBucket = {
  /** Stable bucket key (e.g. "2026-06-23"). */
  key: string
  /** Short human label for the axis (e.g. "23/06"). */
  label: string
  /** kWh used in this bucket. */
  kwh: number
}

// ponytail: ART is a fixed UTC-3 offset (no DST since 2009), so we shift then read UTC parts
// instead of pulling a tz library. Revisit if Argentina reintroduces DST.
const ART_OFFSET_MS = 3 * 60 * 60 * 1000

function bucketOf(readAt: Date, granularity: Granularity): { key: string; label: string } {
  const art = new Date(readAt.getTime() - ART_OFFSET_MS)
  const y = art.getUTCFullYear()
  const m = art.getUTCMonth() + 1
  const d = art.getUTCDate()
  const dd = String(d).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  if (granularity === 'month') {
    return { key: `${y}-${mm}`, label: `${mm}/${String(y).slice(2)}` }
  }
  if (granularity === 'week') {
    // Monday-anchored week. getUTCDay: 0=Sun..6=Sat -> days since Monday.
    const daysSinceMonday = (art.getUTCDay() + 6) % 7
    const monday = new Date(art.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000)
    const wm = String(monday.getUTCMonth() + 1).padStart(2, '0')
    const wd = String(monday.getUTCDate()).padStart(2, '0')
    return { key: `${monday.getUTCFullYear()}-${wm}-${wd}`, label: `${wd}/${wm}` }
  }
  return { key: `${y}-${mm}-${dd}`, label: `${dd}/${mm}` }
}

const MAX_BUCKETS: Record<Granularity, number> = { day: 30, week: 12, month: 12 }

/**
 * Usage per bucket (daily/weekly/monthly) for a device's graph.
 *
 * Plain English: the counter only ever goes up, so usage between two snapshots is the difference.
 * We compute each adjacent difference, drop it into the bucket of the later snapshot, and sum.
 * A drop in the counter means the device was reset, so we count just the new value rather than a
 * negative number. Returns at most the last N buckets.
 */
/** One cumulative-counter snapshot — the pure inputs to {@link computeUsageSeries}. */
export type CounterSample = { counterKwh: Prisma.Decimal; readAt: Date }

/** Pure bucketing of counter snapshots into per-period usage. Exported for testing. */
export function computeUsageSeries(
  samples: CounterSample[],
  granularity: Granularity,
): UsageBucket[] {
  if (samples.length < 2) return []

  const totals = new Map<string, { label: string; kwh: Prisma.Decimal }>()
  for (let i = 1; i < samples.length; i++) {
    const prev = samples[i - 1].counterKwh
    const curr = samples[i].counterKwh
    const delta = curr.lessThan(prev) ? money(curr) : money(curr).minus(prev)
    const { key, label } = bucketOf(samples[i].readAt, granularity)
    const acc = totals.get(key)
    if (acc) acc.kwh = acc.kwh.plus(delta)
    else totals.set(key, { label, kwh: delta })
  }

  const buckets = [...totals.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, v]) => ({ key, label: v.label, kwh: v.kwh.toNumber() }))
  return buckets.slice(-MAX_BUCKETS[granularity])
}

export async function getUsageSeries(
  deviceId: string,
  granularity: Granularity,
): Promise<UsageBucket[]> {
  const samples = await prisma.meterSample.findMany({
    where: { deviceId },
    orderBy: { readAt: 'asc' },
    select: { counterKwh: true, readAt: true },
  })
  return computeUsageSeries(samples, granularity)
}

/** Read consumption for all of a Building's devices over the window and persist Readings. */
export async function readConsumptionForBuilding(
  buildingId: string,
  window: ConsumptionWindow,
): Promise<void> {
  // TODO(evon): billing close. Aggregate meter_samples into a per-period MeterReading (counter
  // delta over [periodStart, periodEnd)) and price it. Separate from this push — see CLAUDE.md
  // "Monthly billing cycle" step 2.
  void buildingId
  void window
  throw new NotImplementedError('readConsumptionForBuilding')
}
