import { z } from 'zod'

/**
 * Environment schema for Evon. Validated lazily via getEnv() — NEVER at import time — so that
 * `next build` (and the client bundle analysis) don't require real secrets to be present.
 */
const envSchema = z.object({
  // Neon: pooled URL for queries, direct URL for migrations.
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // 32-byte key (base64) for AES-256-GCM credential encryption. See src/infra/crypto.
  ENCRYPTION_KEY: z.string().min(1),

  // Auth.js session secret.
  AUTH_SECRET: z.string().min(1),

  // Shared secret the Vercel Cron request must carry (Authorization: Bearer <CRON_SECRET>).
  CRON_SECRET: z.string().min(1),

  // Resend (email). Optional until notifications are wired.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Cloudflare R2 (S3-compatible). Optional until storage is wired.
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),

  // Shelly cloud. TODO(evon): exact base URL / auth shape — see CLAUDE.md "Shelly API shape".
  SHELLY_API_BASE: z.string().optional(),

  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export type Env = z.infer<typeof envSchema>

let cached: Env | null = null

/** Parse and validate process.env once, on first use. Throws if required vars are missing. */
export function getEnv(): Env {
  if (cached) return cached
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(`Invalid environment variables:\n${parsed.error.toString()}`)
  }
  cached = parsed.data
  return cached
}
