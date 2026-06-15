'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createMeterDevice, deleteMeterDevice, updateMeterDevice } from '@/server/catalog'

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
  await createMeterDevice(parsed.data)
  revalidatePath('/devices')
  revalidatePath('/dashboard')
  redirect('/devices')
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
  redirect('/devices')
}

export async function deleteDeviceAction(id: string): Promise<void> {
  await deleteMeterDevice(id)
  revalidatePath('/devices')
  revalidatePath('/dashboard')
  redirect('/devices')
}
