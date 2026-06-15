'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createBuilding, deleteBuilding, updateBuilding } from '@/server/catalog'

/**
 * Server actions backing the Buildings CRUD pages.
 *
 * Plain English: HTML forms POST to these functions directly (no API route, no client-side
 * fetch). The action validates the form payload with Zod, runs the matching Prisma write, then
 * either redirects back to /buildings or surfaces a validation error to the form.
 */

const buildingSchema = z.object({
  name: z.string().trim().min(1, 'Nombre requerido').max(120),
  address: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  distribuidora: z.string().trim().min(1, 'Distribuidora requerida').max(60),
  exportProfile: z.string().trim().min(1).max(60).default('generic'),
  timezone: z.string().trim().min(1).max(60).default('America/Argentina/Buenos_Aires'),
})

export type BuildingActionResult = { ok: true } | { ok: false; error: string }

function parseForm(formData: FormData) {
  return buildingSchema.safeParse({
    name: formData.get('name')?.toString() ?? '',
    address: formData.get('address')?.toString() ?? '',
    distribuidora: formData.get('distribuidora')?.toString() ?? '',
    exportProfile: formData.get('exportProfile')?.toString() || 'generic',
    timezone: formData.get('timezone')?.toString() || 'America/Argentina/Buenos_Aires',
  })
}

export async function createBuildingAction(formData: FormData): Promise<BuildingActionResult> {
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }
  await createBuilding(parsed.data)
  revalidatePath('/buildings')
  redirect('/buildings')
}

export async function updateBuildingAction(
  id: string,
  formData: FormData,
): Promise<BuildingActionResult> {
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }
  await updateBuilding(id, parsed.data)
  revalidatePath('/buildings')
  revalidatePath(`/buildings/${id}`)
  redirect('/buildings')
}

export async function deleteBuildingAction(id: string): Promise<void> {
  await deleteBuilding(id)
  revalidatePath('/buildings')
  redirect('/buildings')
}
