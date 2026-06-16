/**
 * `pnpm db:seed` entrypoint. Delegates the actual work to src/server/demo/seed-data.ts so the
 * panel's "Re-cargar datos demo" button can run the same routine through the shared Prisma
 * client (with adapter).
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

import { seedDemoData } from '../src/server/demo/seed-data'

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const summary = await seedDemoData(prisma)
  console.log(
    `✓ seed complete: ${summary.buildings} buildings, ${summary.units} units, ${summary.periods} periods, ${summary.readings} readings`,
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
