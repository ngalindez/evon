'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/infra/db/client'
import { seedDemoData } from '@/server/demo/seed-data'

export type ReseedResult =
  | { ok: true; units: number; readings: number }
  | { ok: false; error: string }

export async function reseedDemoAction(): Promise<ReseedResult> {
  try {
    const summary = await seedDemoData(prisma)
    revalidatePath('/', 'layout')
    return { ok: true, units: summary.units, readings: summary.readings }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
