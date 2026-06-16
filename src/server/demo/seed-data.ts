import type { PrismaClient } from '@prisma/client'

import { encryptCredentials } from '@/infra/crypto'
import { ZERO, money, roundUnitTotal } from '@/lib/money'

/**
 * Shared seed routine used by `pnpm db:seed` and the panel's "Re-cargar datos demo" button.
 *
 * Plain English: wipes every business table, then plants three Buildings of varying size with
 * past + current BillingPeriods. Older periods are already approved (billing_lines persisted);
 * the current month is left open with a few missing readings so the demo can walk through
 * margin + approval + CSV download.
 *
 * Idempotent — running it twice leaves the database in the same state.
 */

type UnitSeed = {
  label: string
  ownerName?: string
  providerDeviceId: string
  externalRef?: string
}

type BuildingSeed = {
  name: string
  address: string
  distribuidora: 'EDESUR' | 'EDENOR'
  pricePerKwh: string
  margin: string
  provider: 'shelly' | 'tuya' | 'ewelink'
  connectionLabel: string
  units: UnitSeed[]
  /** Historical kWh values for past + current periods (one number per unit per period). null = missing reading. */
  history: Array<Array<number | null>>
}

const TORRES: BuildingSeed = {
  name: 'Torres del Río',
  address: 'Av. Libertador 4820, CABA',
  distribuidora: 'EDESUR',
  pricePerKwh: '84.020000',
  margin: '0.08',
  provider: 'shelly',
  connectionLabel: 'Shelly Cloud — Torres del Río',
  units: [
    { label: '3.º B', ownerName: 'Marina Gómez', providerDeviceId: 'shelly-1a2b' },
    { label: '5.º A', ownerName: 'Lucas Pereyra', providerDeviceId: 'sonoff-9f3c' },
    { label: 'PB 2', ownerName: 'Roxana Díaz', providerDeviceId: 'tuya-77de' },
    { label: '7.º D', ownerName: 'Sebastián Vega', providerDeviceId: 'shelly-4c5e' },
    { label: '2.º A', ownerName: 'Carla Iglesias', providerDeviceId: 'sonoff-2b8a' },
    { label: '9.º C', ownerName: 'Tomás Bertoldi', providerDeviceId: 'shelly-6f1d' },
    { label: '4.º B', ownerName: 'Sofía Martínez', providerDeviceId: 'tuya-3e90' },
    { label: '8.º A', ownerName: 'Damián Ruiz', providerDeviceId: 'shelly-7a2c' },
  ],
  history: [
    // 2 periods ago — approved
    [132.4, 88.0, 198.2, 85.1, 0, 142.6, 51.0, 79.4],
    // 1 period ago — approved
    [141.0, 90.5, 201.7, 88.0, 0, 150.3, 60.2, 84.1],
    // current period — open, one missing
    [148.6, 92.0, 204.3, 90.7, 0, 157.3, null, 88.8],
  ],
}

const BELGRANO: BuildingSeed = {
  name: 'Edificio Belgrano',
  address: 'Cabildo 2310, CABA',
  distribuidora: 'EDESUR',
  pricePerKwh: '84.020000',
  margin: '0.05',
  provider: 'tuya',
  connectionLabel: 'Tuya Cloud — Belgrano',
  units: [
    { label: '1.º A', ownerName: 'Mariano Costa', providerDeviceId: 'tuya-belg-01' },
    { label: '1.º B', ownerName: 'Ana Salgado', providerDeviceId: 'tuya-belg-02' },
    { label: '2.º A', ownerName: 'Pablo Riera', providerDeviceId: 'tuya-belg-03' },
    { label: 'PB', ownerName: 'Vivienda compartida', providerDeviceId: 'tuya-belg-04' },
  ],
  history: [
    [104.2, 62.0, 71.4, 0],
    [110.0, 65.5, 76.0, 0],
    [115.8, 70.1, 80.3, 0],
  ],
}

const SAN_MARTIN: BuildingSeed = {
  name: 'Plaza San Martín',
  address: 'Av. Santa Fe 950, CABA',
  distribuidora: 'EDENOR',
  pricePerKwh: '78.500000',
  margin: '0.10',
  provider: 'ewelink',
  connectionLabel: 'eWeLink Cloud — San Martín',
  units: [
    { label: 'PH 1', ownerName: 'Estudio Jurídico Saavedra', providerDeviceId: 'ewe-sm-01' },
    { label: '3.º A', ownerName: 'Familia Greco', providerDeviceId: 'ewe-sm-02' },
    { label: '6.º A', ownerName: 'Familia Linares', providerDeviceId: 'ewe-sm-03' },
    { label: '6.º B', ownerName: 'Familia Núñez', providerDeviceId: 'ewe-sm-04' },
    { label: '10.º C', ownerName: 'Carolina Mansilla', providerDeviceId: 'ewe-sm-05' },
    { label: 'PB', ownerName: 'Local comercial', providerDeviceId: 'ewe-sm-06' },
  ],
  history: [
    [220.0, 95.5, 80.0, 60.0, 110.0, 35.0],
    [232.4, 100.1, 84.5, 64.2, 117.2, 38.4],
    [241.8, 108.0, 90.0, 68.1, 121.5, null],
  ],
}

const BUILDINGS: BuildingSeed[] = [TORRES, BELGRANO, SAN_MARTIN]

export type SeedSummary = {
  buildings: number
  units: number
  readings: number
  periods: number
}

function shiftMonth(year: number, month: number, offset: number): { year: number; month: number } {
  const idx = year * 12 + (month - 1) + offset
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 }
}

export async function seedDemoData(prisma: PrismaClient): Promise<SeedSummary> {
  await prisma.meterReading.deleteMany()
  await prisma.billingLine.deleteMany()
  await prisma.outputFile.deleteMany()
  await prisma.billingPeriod.deleteMany()
  await prisma.meterDevice.deleteMany()
  await prisma.cloudConnection.deleteMany()
  await prisma.unit.deleteMany()
  await prisma.building.deleteMany()
  await prisma.tariff.deleteMany()
  await prisma.buildingAdmin.deleteMany()
  await prisma.auditLog.deleteMany()

  const admin = await prisma.buildingAdmin.create({
    data: { email: 'marina@admin.evon.com.ar', name: 'Marina Gómez' },
  })

  // One Tariff per distribuidora, effective from start of last year so every past period
  // resolves it.
  const tariffs = new Map<string, string>()
  const distribuidoras = new Map<string, string>()
  for (const b of BUILDINGS) {
    if (distribuidoras.has(b.distribuidora)) continue
    distribuidoras.set(b.distribuidora, b.pricePerKwh)
  }
  for (const [distribuidora, price] of distribuidoras) {
    const t = await prisma.tariff.create({
      data: {
        distribuidora,
        pricePerKwh: price,
        margin: '0.00',
        effectiveFrom: new Date(Date.UTC(new Date().getUTCFullYear() - 1, 0, 1)),
      },
    })
    tariffs.set(distribuidora, t.id)
  }

  const now = new Date()
  const curYear = now.getUTCFullYear()
  const curMonth = now.getUTCMonth() + 1
  let totalUnits = 0
  let totalReadings = 0
  let totalPeriods = 0

  for (const seed of BUILDINGS) {
    const building = await prisma.building.create({
      data: {
        buildingAdminId: admin.id,
        name: seed.name,
        address: seed.address,
        distribuidora: seed.distribuidora,
        exportProfile: 'generic',
      },
    })

    const connection = await prisma.cloudConnection.create({
      data: {
        buildingId: building.id,
        provider: seed.provider,
        label: seed.connectionLabel,
        encryptedCredentials: new Uint8Array(
          encryptCredentials(JSON.stringify({ source: 'seed', building: seed.name })),
        ),
      },
    })

    const units = []
    for (const u of seed.units) {
      const unit = await prisma.unit.create({
        data: {
          buildingId: building.id,
          label: u.label,
          ownerName: u.ownerName ?? null,
          externalRef: u.externalRef ?? u.label.replace(/\W+/g, '-').toLowerCase(),
        },
      })
      const device = await prisma.meterDevice.create({
        data: {
          unitId: unit.id,
          connectionId: connection.id,
          providerDeviceId: u.providerDeviceId,
          label: `Disyuntor cochera ${u.label}`,
        },
      })
      units.push({ unit, device })
      totalUnits += 1
    }

    // History: oldest first. Last entry = current month (open). Earlier entries = approved.
    const periodCount = seed.history.length
    const oldestOffset = -(periodCount - 1)
    const tariffId = tariffs.get(seed.distribuidora)
    const margin = money(seed.margin)
    const price = money(seed.pricePerKwh)
    const onePlusMargin = money(1).plus(margin)

    for (let i = 0; i < periodCount; i += 1) {
      const offset = oldestOffset + i
      const { year, month } = shiftMonth(curYear, curMonth, offset)
      const periodStart = new Date(Date.UTC(year, month - 1, 1))
      const periodEnd = new Date(Date.UTC(year, month, 1))
      const isCurrent = i === periodCount - 1
      const status = isCurrent ? 'open' : 'approved'
      const approvedAt = isCurrent ? null : new Date(Date.UTC(year, month, 2, 6, 30))

      const period = await prisma.billingPeriod.create({
        data: {
          buildingId: building.id,
          year,
          month,
          status,
          periodStart,
          periodEnd,
          approvedAt,
          processedAt: approvedAt,
        },
      })
      totalPeriods += 1

      const kwhRow = seed.history[i]
      for (let j = 0; j < units.length; j += 1) {
        const { unit, device } = units[j]
        const kwh = kwhRow[j]

        if (kwh != null) {
          const readAt = isCurrent
            ? new Date(now.getTime() - (j + 1) * 7 * 60_000)
            : new Date(Date.UTC(year, month, 1, 6, 0))
          await prisma.meterReading.create({
            data: {
              periodId: period.id,
              deviceId: device.id,
              kwhConsumed: kwh.toFixed(3),
              rawPayload: { source: 'seed', kwh },
              readAt,
            },
          })
          totalReadings += 1
        }

        if (!isCurrent) {
          // For approved past periods, persist billing_lines (so /periods/history shows totals).
          const kwhDec = kwh != null ? money(kwh.toString()) : ZERO
          const amount = roundUnitTotal(kwhDec.times(price).times(onePlusMargin))
          await prisma.billingLine.create({
            data: {
              periodId: period.id,
              unitId: unit.id,
              kwh: kwhDec.toString(),
              pricePerKwh: price.toString(),
              amount: amount.toString(),
              tariffId,
            },
          })
        }
      }
    }
  }

  return {
    buildings: BUILDINGS.length,
    units: totalUnits,
    readings: totalReadings,
    periods: totalPeriods,
  }
}
