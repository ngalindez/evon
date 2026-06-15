'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createTariff, deleteTariff, updateTariff } from '@/server/tariffs'

/**
 * Server actions backing the Tariffs CRUD pages.
 *
 * Plain English: prices and margins arrive as strings in `Decimal(12, 6)` shape — preserving
 * them as strings (no Number parsing) avoids float drift before they hit Prisma. Effective
 * dates are interpreted as UTC midnight on the supplied calendar day.
 */

// Accept either dot or comma decimal in the form input, but normalize to dot for Prisma.
const decimalString = (max: number) =>
  z
    .string()
    .trim()
    .min(1, 'Requerido')
    .transform((v) => v.replace(',', '.'))
    .refine((v) => /^-?\d+(\.\d+)?$/.test(v), 'Número inválido')
    .refine((v) => v.replace('-', '').replace('.', '').length <= max, 'Demasiados dígitos')

const tariffSchema = z.object({
  distribuidora: z.string().trim().min(1, 'Distribuidora requerida').max(60),
  pricePerKwh: decimalString(12),
  margin: decimalString(12),
  effectiveFrom: z
    .string()
    .min(1, 'Fecha requerida')
    .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), 'Fecha inválida')
    .transform((v) => new Date(`${v}T00:00:00Z`)),
})

export type TariffActionResult = { ok: true } | { ok: false; error: string }

function parseForm(formData: FormData) {
  return tariffSchema.safeParse({
    distribuidora: formData.get('distribuidora')?.toString() ?? '',
    pricePerKwh: formData.get('pricePerKwh')?.toString() ?? '',
    margin: formData.get('margin')?.toString() ?? '',
    effectiveFrom: formData.get('effectiveFrom')?.toString() ?? '',
  })
}

export async function createTariffAction(formData: FormData): Promise<TariffActionResult> {
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }
  await createTariff(parsed.data)
  revalidatePath('/tariffs')
  redirect('/tariffs')
}

export async function updateTariffAction(
  id: string,
  formData: FormData,
): Promise<TariffActionResult> {
  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }
  await updateTariff(id, parsed.data)
  revalidatePath('/tariffs')
  revalidatePath(`/tariffs/${id}`)
  redirect('/tariffs')
}

export async function deleteTariffAction(id: string): Promise<void> {
  await deleteTariff(id)
  revalidatePath('/tariffs')
  redirect('/tariffs')
}
