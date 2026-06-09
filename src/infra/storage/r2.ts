import { NotImplementedError } from '@/lib/errors'

/**
 * Cloudflare R2 object storage (S3-compatible).
 *
 * Plain English: generated CSVs and per-Unit PDFs need to live somewhere durable so the building
 * admin can download them. R2 is the chosen bucket. This is a stub — the real client is not wired
 * yet.
 *
 * TODO(evon): real Cloudflare R2 client. Needs @aws-sdk/client-s3 (NOT yet a dependency — must be
 * approved before adding) plus the R2_* env vars (account id, bucket, access key, secret). See
 * CLAUDE.md "File storage".
 */

/** A reference to a stored object — its key within the bucket. */
export interface StoredObject {
  key: string
}

/** Upload bytes under `key`; resolves to the stored-object reference. */
export async function putObject(
  _key: string,
  _body: Uint8Array,
  _contentType: string,
): Promise<StoredObject> {
  throw new NotImplementedError('storage/r2.putObject')
}

/** Produce a time-limited signed URL the building admin can use to download `key`. */
export async function getSignedDownloadUrl(_key: string): Promise<string> {
  throw new NotImplementedError('storage/r2.getSignedDownloadUrl')
}
