'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { ACTIVE_BUILDING_COOKIE, ACTIVE_PERIOD_COOKIE } from './constants'

/**
 * Server actions that drive the topbar selection cookies.
 *
 * Plain English: the building/period switchers don't persist anywhere in the DB — they live as
 * simple cookies the panel reads on each render. Setting one invalidates every panel route so
 * data refetches under the new selection.
 */

const COOKIE_OPTS = {
  path: '/',
  // ~1 year. Cookie is not security-sensitive; demo selection only.
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax' as const,
}

export async function setActiveBuildingAction(buildingId: string): Promise<void> {
  ;(await cookies()).set(ACTIVE_BUILDING_COOKIE, buildingId, COOKIE_OPTS)
  revalidatePath('/', 'layout')
}

/** Persist the selected period as a YYYY-MM string (e.g. "2026-06"). */
export async function setActivePeriodAction(yearMonth: string): Promise<void> {
  const trimmed = yearMonth.trim()
  if (!/^\d{4}-\d{1,2}$/.test(trimmed)) return
  ;(await cookies()).set(ACTIVE_PERIOD_COOKIE, trimmed, COOKIE_OPTS)
  revalidatePath('/', 'layout')
}
