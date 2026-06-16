'use server'

import type { PeriodStatus } from '@prisma/client'
import { z } from 'zod'

import { pendingPeriodCountDelta } from '@/lib/pending-period-delta'
import { ApproveError, UnapproveError, approvePeriod, unapprovePeriod } from '@/server/billing'

const approveSchema = z.object({
  buildingId: z.string().min(1),
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  margin: z.string().optional(),
})

export type PeriodMutationResult =
  | { ok: true; periodStatus: PeriodStatus; pendingPeriodDelta: number }
  | { ok: false; error: string }

export type ApprovePeriodResult = PeriodMutationResult
export type UnapprovePeriodResult = PeriodMutationResult

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
    const { period, previousStatus } = await approvePeriod({
      buildingId: parsed.data.buildingId,
      year: parsed.data.year,
      month: parsed.data.month,
      marginOverride: parsed.data.margin,
    })
    return {
      ok: true,
      periodStatus: period.status,
      pendingPeriodDelta: pendingPeriodCountDelta(previousStatus, period.status),
    }
  } catch (err) {
    if (err instanceof ApproveError) {
      return { ok: false, error: err.message }
    }
    throw err
  }
}

const periodKeySchema = z.object({
  buildingId: z.string().min(1),
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
})

export async function unapprovePeriodAction(formData: FormData): Promise<UnapprovePeriodResult> {
  const parsed = periodKeySchema.safeParse({
    buildingId: formData.get('buildingId'),
    year: formData.get('year'),
    month: formData.get('month'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    const { period, previousStatus } = await unapprovePeriod(parsed.data)
    return {
      ok: true,
      periodStatus: period.status,
      pendingPeriodDelta: pendingPeriodCountDelta(previousStatus, period.status),
    }
  } catch (err) {
    if (err instanceof UnapproveError) {
      return { ok: false, error: err.message }
    }
    throw err
  }
}
