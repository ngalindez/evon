'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { logger } from '@/infra/observability/logger'
import { createMeterDevice, deleteMeterDevice, updateMeterDevice } from '@/server/catalog'
import { readDeviceCounter } from '@/server/metering'

const deviceSchema = z.object({
  unitId: z.string().min(1, 'Seleccioná una unidad'),
  connectionId: z.string().min(1, 'Seleccioná una conexión'),
  providerDeviceId: z.string().trim().min(1, 'Device ID requerido').max(120),
  label: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
})

export type DeviceActionResult = { ok: true } | { ok: false; error: string }

function parse(formData: FormData) {
  return deviceSchema.safeParse({
    unitId: formData.get('unitId')?.toString() ?? '',
    connectionId: formData.get('connectionId')?.toString() ?? '',
    providerDeviceId: formData.get('providerDeviceId')?.toString() ?? '',
    label: formData.get('label')?.toString() ?? '',
  })
}

export async function createDeviceAction(formData: FormData): Promise<DeviceActionResult> {
  const parsed = parse(formData)
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  const device = await createMeterDevice(parsed.data)
  // Best-effort baseline read. Never blocks creation: a wrong device id / offline breaker just
  // leaves the device with no reading, and the detail page shows a "read failed, retry" hint.
  try {
    await readDeviceCounter(device.id)
  } catch (err) {
    logger.warn('baseline read failed on device create', {
      deviceId: device.id,
      error: err instanceof Error ? err.message : String(err),
    })
  }
  revalidatePath('/devices')
  revalidatePath('/dashboard')
  redirect(`/devices/${device.id}`)
}

export async function updateDeviceAction(
  id: string,
  formData: FormData,
): Promise<DeviceActionResult> {
  const parsed = parse(formData)
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  await updateMeterDevice(id, parsed.data)
  revalidatePath('/devices')
  revalidatePath(`/devices/${id}`)
  redirect(`/devices/${id}`)
}

/** "Leer ahora": read the device's current cumulative counter and store a sample. */
export async function triggerReadAction(id: string): Promise<DeviceActionResult> {
  try {
    await readDeviceCounter(id)
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'No se pudo leer el dispositivo',
    }
  }
  revalidatePath(`/devices/${id}`)
  revalidatePath('/devices')
  return { ok: true }
}

export async function deleteDeviceAction(id: string): Promise<void> {
  await deleteMeterDevice(id)
  revalidatePath('/devices')
  revalidatePath('/dashboard')
  redirect('/devices')
}
