import { PrismaClient } from '@prisma/client'

/**
 * Single Prisma client for the app. In dev, Next.js hot-reload re-evaluates modules, which would
 * otherwise open a new connection pool every reload — so we cache the instance on globalThis.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
