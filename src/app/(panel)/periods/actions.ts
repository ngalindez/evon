'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { ApproveError, approvePeriod } from '@/server/billing'

const approveSchema = z.object({
  buildingId: z.string().min(1),
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  margin: z.string().optional(),
})

export type ApprovePeriodResult = { ok: true } | { ok: false; error: string }

/**
 * Approve the current Building's period for (year, month). Margin override (the chip selection)
 * comes in as a string; falls back to the tariff default if missing.
 */
export async function approvePeriodAction(formData: FormData): Promise<ApprovePeriodResult> {
  const parsed = approveSchema.safeParse({
    buildingId: formData.get('buildingId'),
    year: formData.get('year'),
    month: formData.get('month'),
    margin: formData.get('margin') ?? undefined,
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await approvePeriod({
      buildingId: parsed.data.buildingId,
      year: parsed.data.year,
      month: parsed.data.month,
      marginOverride: parsed.data.margin,
    })
  } catch (err) {
    if (err instanceof ApproveError) {
      return { ok: false, error: err.message }
    }
    throw err
  }

  revalidatePath('/periods')
  revalidatePath('/dashboard')
  return { ok: true }
}
