import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

import { getEnv } from '@/infra/config/env'

/**
 * Encrypt cloud-connection credentials at rest.
 *
 * Plain English: a Smart breaker's cloud login must never sit in the database in plaintext. We
 * scramble it with AES-256-GCM — a standard authenticated cipher — using a secret key from the
 * environment. "Authenticated" means decryption also verifies the data wasn't tampered with.
 *
 * The encrypted blob is laid out as a single Buffer so it maps cleanly onto the Prisma `Bytes`
 * column `cloud_connections.encrypted_credentials`:
 *
 *   [ 12-byte IV ][ 16-byte auth tag ][ ciphertext ... ]
 *
 * See CLAUDE.md "Cloud credentials".
 */

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // AES-256 -> 256-bit key.
const IV_LENGTH = 12 // GCM standard nonce length.
const AUTH_TAG_LENGTH = 16 // GCM produces a 128-bit tag.

/**
 * Decode and validate the AES-256 key from the environment.
 *
 * TODO(evon): key rotation / derivation is undecided — for now there is exactly one static
 * base64 key in ENCRYPTION_KEY. Rotating it (versioned key ids, re-encrypting old rows) and
 * whether to derive per-tenant keys is open. See CLAUDE.md "Cloud credentials".
 */
function loadKey(): Buffer {
  const key = Buffer.from(getEnv().ENCRYPTION_KEY, 'base64')
  if (key.length !== KEY_LENGTH) {
    throw new Error(`ENCRYPTION_KEY must decode to exactly ${KEY_LENGTH} bytes, got ${key.length}`)
  }
  return key
}

/** Encrypt a UTF-8 plaintext into the [IV][authTag][ciphertext] blob. */
export function encryptCredentials(plaintext: string): Buffer {
  const key = loadKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, ciphertext])
}

/** Reverse {@link encryptCredentials}: verify and decrypt the blob back to plaintext. */
export function decryptCredentials(blob: Buffer): string {
  if (blob.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('encrypted credentials blob is too short to contain IV + auth tag')
  }
  const key = loadKey()
  const iv = blob.subarray(0, IV_LENGTH)
  const authTag = blob.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const ciphertext = blob.subarray(IV_LENGTH + AUTH_TAG_LENGTH)
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}
