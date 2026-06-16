import { prisma } from '../src/infra/db/client'
import { approvePeriod } from '../src/server/billing/approve'

async function main() {
  const building = await prisma.building.findFirst()
  if (!building) throw new Error('no building')
  const now = new Date()
  const result = await approvePeriod({
    buildingId: building.id,
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    marginOverride: '0.08',
  })
  console.log('approved:', result.period.status, result.period.approvedAt?.toISOString())
  const lines = await prisma.billingLine.findMany({
    include: { unit: true },
    orderBy: { unit: { label: 'asc' } },
  })
  console.log('lines created:', lines.length)
  for (const l of lines) {
    console.log(
      `  ${l.unit.label.padEnd(8)}  ${l.kwh.toString().padStart(10)} kWh  $${l.amount.toString()}`,
    )
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
