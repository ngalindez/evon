'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import {
  createCloudConnection,
  deleteCloudConnection,
  updateCloudConnection,
} from '@/server/catalog'

const baseSchema = z.object({
  provider: z.enum(['shelly', 'tuya', 'ewelink']),
  label: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  credentialsPlaintext: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
})

const createSchema = baseSchema.refine((d) => !!d.credentialsPlaintext, {
  message: 'Las credenciales son requeridas al crear',
  path: ['credentialsPlaintext'],
})

export type ConnectionActionResult = { ok: true } | { ok: false; error: string }

function parseFromForm(formData: FormData) {
  return {
    provider: formData.get('provider')?.toString() ?? '',
    label: formData.get('label')?.toString() ?? '',
    credentialsPlaintext: formData.get('credentialsPlaintext')?.toString() ?? '',
  }
}

export async function createConnectionAction(
  buildingId: string,
  formData: FormData,
): Promise<ConnectionActionResult> {
  const parsed = createSchema.safeParse(parseFromForm(formData))
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  try {
    await createCloudConnection(buildingId, parsed.data)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo crear la conexión' }
  }
  revalidatePath(`/buildings/${buildingId}/connections`)
  revalidatePath('/buildings')
  redirect(`/buildings/${buildingId}/connections`)
}

export async function updateConnectionAction(
  buildingId: string,
  connectionId: string,
  formData: FormData,
): Promise<ConnectionActionResult> {
  // Edit allows leaving credentials blank to keep the existing blob.
  const parsed = baseSchema.safeParse(parseFromForm(formData))
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  try {
    await updateCloudConnection(connectionId, parsed.data)
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'No se pudo actualizar la conexión',
    }
  }
  revalidatePath(`/buildings/${buildingId}/connections`)
  redirect(`/buildings/${buildingId}/connections`)
}

export async function deleteConnectionAction(
  buildingId: string,
  connectionId: string,
): Promise<void> {
  await deleteCloudConnection(connectionId)
  revalidatePath(`/buildings/${buildingId}/connections`)
  revalidatePath('/buildings')
  redirect(`/buildings/${buildingId}/connections`)
}
