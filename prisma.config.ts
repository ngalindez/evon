import 'dotenv/config'
import { defineConfig } from 'prisma/config'

/**
 * Prisma 7 configuration file.
 *
 * Plain English: Prisma 7 removed `url`/`directUrl` from schema.prisma. The CLI (migrate,
 * generate, db push, db seed) now reads connection info from here, while the runtime
 * PrismaClient takes a driver adapter (see src/infra/db/client.ts).
 *
 * Two URLs (CLAUDE.md "Database"): DATABASE_URL is the pooled connection used by the app at
 * runtime; DIRECT_URL is the non-pooled connection that migrations need. On local Postgres
 * they're the same; on Neon they differ.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
})
