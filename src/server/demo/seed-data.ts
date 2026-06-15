import type { PrismaClient } from '@prisma/client'

import { encryptCredentials } from '@/infra/crypto'

/**
 * Shared seed routine used by `pnpm db:seed` and the panel's "Re-cargar datos demo" button.
 *
 * Plain English: wipes every business table, then plants a small Building (Torres del Río)
 * with eight Units / disyuntores, seven MeterReadings, an EDESUR tariff and an open
 * BillingPeriod for the current calendar month. Idempotent — running it twice leaves the
 * database in the same state.
 */

const UNITS: Array<{
  label: string
  providerDeviceId: string
  kwh: number | null
  agoMin: number | null
}> = [
  { label: '3.º B', providerDeviceId: 'shelly-1a2b', kwh: 148.6, agoMin: 6 },
  { label: '5.º A', providerDeviceId: 'sonoff-9f3c', kwh: 92.0, agoMin: 8 },
  { label: 'PB 2', providerDeviceId: 'tuya-77de', kwh: 204.3, agoMin: 12 },
  { label: '7.º D', providerDeviceId: 'shelly-4c5e', kwh: 90.7, agoMin: 4 },
  { label: '2.º A', providerDeviceId: 'sonoff-2b8a', kwh: 0, agoMin: 1440 },
  { label: '9.º C', providerDeviceId: 'shelly-6f1d', kwh: 157.3, agoMin: 9 },
  { label: '4.º B', providerDeviceId: 'tuya-3e90', kwh: null, agoMin: null },
  { label: '8.º A', providerDeviceId: 'shelly-7a2c', kwh: 88.8, agoMin: 11 },
]

export type SeedSummary = {
  buildings: number
  units: number
  readings: number
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

  await prisma.tariff.create({
    data: {
      distribuidora: 'EDESUR',
      pricePerKwh: '84.020000',
      margin: '0.08',
      effectiveFrom: new Date('2026-01-01T00:00:00Z'),
    },
  })

  const building = await prisma.building.create({
    data: {
      buildingAdminId: admin.id,
      name: 'Torres del Río',
      address: 'Av. Libertador 4820',
      distribuidora: 'EDESUR',
      exportProfile: 'generic',
    },
  })

  const connection = await prisma.cloudConnection.create({
    data: {
      buildingId: building.id,
      provider: 'shelly',
      label: 'Shelly Cloud — Torres del Río',
      encryptedCredentials: new Uint8Array(
        encryptCredentials(JSON.stringify({ email: 'admin@evon.com.ar', token: 'demo-token' })),
      ),
    },
  })

  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1
  const period = await prisma.billingPeriod.create({
    data: {
      buildingId: building.id,
      year,
      month,
      status: 'open',
      periodStart: new Date(Date.UTC(year, month - 1, 1)),
      periodEnd: new Date(Date.UTC(year, month, 1)),
    },
  })

  let readings = 0
  for (const u of UNITS) {
    const unit = await prisma.unit.create({
      data: {
        buildingId: building.id,
        label: u.label,
        externalRef: u.label.replace(/\W+/g, '-').toLowerCase(),
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

    if (u.kwh != null && u.agoMin != null) {
      const readAt = new Date(now.getTime() - u.agoMin * 60_000)
      await prisma.meterReading.create({
        data: {
          periodId: period.id,
          deviceId: device.id,
          kwhConsumed: u.kwh.toFixed(3),
          rawPayload: { source: 'seed', kwh: u.kwh },
          readAt,
        },
      })
      readings += 1
    }
  }

  return { buildings: 1, units: UNITS.length, readings }
}
