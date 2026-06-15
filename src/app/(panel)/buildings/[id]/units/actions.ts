'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createUnit, deleteUnit, updateUnit } from '@/server/catalog'

const unitSchema = z.object({
  label: z.string().trim().min(1, 'Etiqueta requerida').max(60),
  ownerName: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  externalRef: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
})

export type UnitActionResult = { ok: true } | { ok: false; error: string }

function parse(formData: FormData) {
  return unitSchema.safeParse({
    label: formData.get('label')?.toString() ?? '',
    ownerName: formData.get('ownerName')?.toString() ?? '',
    externalRef: formData.get('externalRef')?.toString() ?? '',
  })
}

export async function createUnitAction(
  buildingId: string,
  formData: FormData,
): Promise<UnitActionResult> {
  const parsed = parse(formData)
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  await createUnit(buildingId, parsed.data)
  revalidatePath(`/buildings/${buildingId}/units`)
  revalidatePath('/buildings')
  redirect(`/buildings/${buildingId}/units`)
}

export async function updateUnitAction(
  buildingId: string,
  unitId: string,
  formData: FormData,
): Promise<UnitActionResult> {
  const parsed = parse(formData)
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  await updateUnit(unitId, parsed.data)
  revalidatePath(`/buildings/${buildingId}/units`)
  redirect(`/buildings/${buildingId}/units`)
}

export async function deleteUnitAction(buildingId: string, unitId: string): Promise<void> {
  await deleteUnit(unitId)
  revalidatePath(`/buildings/${buildingId}/units`)
  revalidatePath('/buildings')
  redirect(`/buildings/${buildingId}/units`)
}
