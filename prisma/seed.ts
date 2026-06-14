/**
 * Local-dev seed for the Evon panel demo.
 *
 * Plain English: drops everything (idempotent), then creates one Building admin, one Building
 * with eight Units + smart breakers, one Tariff, one open BillingPeriod for the current month,
 * and a handful of MeterReadings — enough to make /dashboard and /devices look populated.
 *
 * Run: `pnpm prisma db seed` (after `pnpm prisma migrate dev`).
 */

import { PrismaClient } from '@prisma/client'

import { encryptCredentials } from '../src/infra/crypto'

const prisma = new PrismaClient()

const UNITS = [
  { label: '3.º B', providerDeviceId: 'shelly-1a2b', kwh: 148.6, agoMin: 6 },
  { label: '5.º A', providerDeviceId: 'sonoff-9f3c', kwh: 92.0, agoMin: 8 },
  { label: 'PB 2', providerDeviceId: 'tuya-77de', kwh: 204.3, agoMin: 12 },
  { label: '7.º D', providerDeviceId: 'shelly-4c5e', kwh: 90.7, agoMin: 4 },
  { label: '2.º A', providerDeviceId: 'sonoff-2b8a', kwh: 0, agoMin: 1440 },
  { label: '9.º C', providerDeviceId: 'shelly-6f1d', kwh: 157.3, agoMin: 9 },
  { label: '4.º B', providerDeviceId: 'tuya-3e90', kwh: null, agoMin: null },
  { label: '8.º A', providerDeviceId: 'shelly-7a2c', kwh: 88.8, agoMin: 11 },
]

async function main() {
  console.log('→ wiping existing data')
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

  console.log('→ creating building admin')
  const admin = await prisma.buildingAdmin.create({
    data: {
      email: 'marina@admin.evon.com.ar',
      name: 'Marina Gómez',
    },
  })

  console.log('→ creating tariff (EDESUR T1-R)')
  await prisma.tariff.create({
    data: {
      distribuidora: 'EDESUR',
      pricePerKwh: '84.020000',
      margin: '0.08',
      effectiveFrom: new Date('2026-01-01T00:00:00Z'),
    },
  })

  console.log('→ creating building: Torres del Río')
  const building = await prisma.building.create({
    data: {
      buildingAdminId: admin.id,
      name: 'Torres del Río',
      address: 'Av. Libertador 4820',
      distribuidora: 'EDESUR',
      exportProfile: 'generic',
    },
  })

  console.log('→ creating Shelly cloud connection')
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

  console.log('→ creating current-month billing period')
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1
  const periodStart = new Date(Date.UTC(year, month - 1, 1))
  const periodEnd = new Date(Date.UTC(year, month, 1))
  const period = await prisma.billingPeriod.create({
    data: {
      buildingId: building.id,
      year,
      month,
      status: 'open',
      periodStart,
      periodEnd,
    },
  })

  console.log(`→ creating ${UNITS.length} units + devices + readings`)
  for (const u of UNITS) {
    const unit = await prisma.unit.create({
      data: {
        buildingId: building.id,
        label: u.label,
        ownerName: null,
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
          counterStart: null,
          counterEnd: null,
          rawPayload: { source: 'seed', kwh: u.kwh },
          readAt,
        },
      })
    }
  }

  console.log('✓ seed complete')
  console.log(`   admin:    ${admin.email}`)
  console.log(`   building: ${building.name}`)
  console.log(
    `   period:   ${year}-${String(month).padStart(2, '0')} (${UNITS.filter((u) => u.kwh != null).length}/${UNITS.length} readings)`,
  )
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
