import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

/**
 * Single Prisma client for the app.
 *
 * Plain English: Prisma 7 requires a driver adapter — the actual database driver is a separate
 * package (`pg` here) wrapped by `@prisma/adapter-pg`. The runtime URL comes from DATABASE_URL
 * (pooled). Migration tools read DIRECT_URL via prisma.config.ts.
 *
 * In dev, Next.js hot-reload re-evaluates modules, which would otherwise open a new connection
 * pool every reload — so we cache the instance on globalThis.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
