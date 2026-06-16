import 'dotenv/config'
import { performance } from 'node:perf_hooks'

import { prisma } from '../src/infra/db/client'
import { approvePeriod } from '../src/server/billing/approve'
import { unapprovePeriod } from '../src/server/billing/unapprove'

async function main() {
  const dbHost = process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@') ?? '(unset)'
  console.log('DATABASE_URL:', dbHost)

  const t0 = performance.now()
  await prisma.$queryRaw`SELECT 1`
  console.log(`ping: ${(performance.now() - t0).toFixed(0)}ms`)

  const building = await prisma.building.findFirst()
  if (!building) throw new Error('no building')

  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1

  const period = await prisma.billingPeriod.findUnique({
    where: { buildingId_year_month: { buildingId: building.id, year, month } },
  })
  if (period?.status === 'approved') {
    const tUn = performance.now()
    await unapprovePeriod({ buildingId: building.id, year, month })
    console.log(`unapprove (setup): ${(performance.now() - tUn).toFixed(0)}ms`)
  }

  const t1 = performance.now()
  await approvePeriod({
    buildingId: building.id,
    year,
    month,
    marginOverride: '0.08',
  })
  console.log(`approvePeriod: ${(performance.now() - t1).toFixed(0)}ms`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
