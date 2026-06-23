import type { Building, Provider } from '@prisma/client'

import type { DeviceStatus } from '@/components/ds/StatusDot'
import { prisma } from '@/infra/db/client'
import { ACTIVE_BUILDING_COOKIE } from '@/server/active/constants'

/**
 * Catalog: configuration browsing for the admin panel.
 *
 * Plain English: this is the read side of "what does this Building admin have set up" — their
 * Buildings and the Units inside each one. The panel calls these to render the configuration
 * screens. Writes (create/update) come later.
 */

/** All Buildings owned by one Building admin, alphabetical. */
export function listBuildings(buildingAdminId: string): Promise<Building[]> {
  return prisma.building.findMany({
    where: { buildingAdminId },
    orderBy: { name: 'asc' },
  })
}

/** All Units in one Building, ordered by label (e.g. "Cochera 12"). */
export function listUnits(buildingId: string) {
  return prisma.unit.findMany({
    where: { buildingId },
    orderBy: { label: 'asc' },
  })
}

/**
 * The Building currently visible in the admin panel.
 *
 * Plain English: reads the topbar's cookie selection (`evon.activeBuildingId`). If unset or
 * stale (id no longer exists), falls back to the oldest Building. Returns null only when the
 * database has no Buildings at all.
 *
 * TODO(evon): once auth ships, scope the lookup to the authenticated admin's buildings.
 */
export async function getActiveBuilding(): Promise<Building | null> {
  // Dynamic import keeps this file usable from non-request contexts (seed, tests).
  const { cookies } = await import('next/headers')
  let selectedId: string | undefined
  try {
    selectedId = (await cookies()).get(ACTIVE_BUILDING_COOKIE)?.value
  } catch {
    selectedId = undefined
  }
  if (selectedId) {
    const selected = await prisma.building.findUnique({ where: { id: selectedId } })
    if (selected) return selected
  }
  return prisma.building.findFirst({ orderBy: { createdAt: 'asc' } })
}

/** All buildings, for the topbar building switcher. Lightweight projection. */
export function listBuildingsForPicker() {
  return prisma.building.findMany({
    select: { id: true, name: true, address: true, distribuidora: true },
    orderBy: { name: 'asc' },
  })
}

/** A row joining a MeterDevice with its Unit, Provider and most recent counter sample. */
export type DeviceRow = {
  /** MeterDevice id. */
  id: string
  /** Unit label (e.g. "3.º B"). */
  uf: string
  /** Cloud-side device id (e.g. "shelly-1a2b"). */
  providerDeviceId: string
  provider: Provider
  status: DeviceStatus
  /** Latest cumulative counter (kWh) as a string, or null if never read. */
  lastCounterKwh: string | null
  /** When the latest sample was taken, or null. */
  lastReadAt: Date | null
}

/**
 * Derive a coarse on/idle/offline state from the latest sample recency.
 *
 * No "live ping" channel exists — we only know about persisted samples — so we treat a device
 * with a sub-24h sample as online, 1-7d as idle, and anything older (or never read) as offline.
 */
export function deriveStatus(readAt: Date | null, now: Date): DeviceStatus {
  if (!readAt) return 'offline'
  const ageMs = now.getTime() - readAt.getTime()
  const day = 24 * 60 * 60 * 1000
  if (ageMs < day) return 'online'
  if (ageMs < 7 * day) return 'idle'
  return 'offline'
}

/** All MeterDevices in a Building, decorated with Unit, Provider, and latest counter sample. */
export async function listDeviceRows(
  buildingId: string,
  now: Date = new Date(),
): Promise<DeviceRow[]> {
  const devices = await prisma.meterDevice.findMany({
    where: { unit: { buildingId } },
    include: {
      unit: { select: { label: true } },
      connection: { select: { provider: true } },
      samples: { orderBy: { readAt: 'desc' }, take: 1 },
    },
    orderBy: [{ unit: { label: 'asc' } }],
  })

  return devices.map((d) => {
    const latest = d.samples[0] ?? null
    return {
      id: d.id,
      uf: d.unit.label,
      providerDeviceId: d.providerDeviceId,
      provider: d.connection.provider,
      status: deriveStatus(latest?.readAt ?? null, now),
      lastCounterKwh: latest ? latest.counterKwh.toString() : null,
      lastReadAt: latest?.readAt ?? null,
    }
  })
}

/** Input shape for create/update of a Building. */
export type BuildingInput = {
  name: string
  address?: string | null
  distribuidora: string
  exportProfile?: string
  timezone?: string
}

/**
 * Resolve the BuildingAdmin that owns new records.
 *
 * Plain English: auth isn't wired yet, so creates need to point at *someone*. The seeded admin
 * (the only row) takes ownership. Throws if the DB is empty (run `pnpm db:seed` first).
 *
 * TODO(evon): once auth ships, replace with the session's `buildingAdminId`.
 */
async function resolveOwnerAdminId(): Promise<string> {
  const admin = await prisma.buildingAdmin.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!admin) {
    throw new Error('No BuildingAdmin exists. Run `pnpm db:seed` to create the seeded admin.')
  }
  return admin.id
}

/** Find one Building by id. Returns null if not found. */
export function getBuilding(id: string) {
  return prisma.building.findUnique({ where: { id } })
}

/** Create a Building under the seeded admin (auth pending). */
export async function createBuilding(input: BuildingInput) {
  const buildingAdminId = await resolveOwnerAdminId()
  return prisma.building.create({
    data: {
      buildingAdminId,
      name: input.name,
      address: input.address ?? null,
      distribuidora: input.distribuidora,
      exportProfile: input.exportProfile ?? 'generic',
      timezone: input.timezone ?? 'America/Argentina/Buenos_Aires',
    },
  })
}

/** Update an existing Building. */
export function updateBuilding(id: string, input: BuildingInput) {
  return prisma.building.update({
    where: { id },
    data: {
      name: input.name,
      address: input.address ?? null,
      distribuidora: input.distribuidora,
      exportProfile: input.exportProfile ?? 'generic',
      timezone: input.timezone ?? 'America/Argentina/Buenos_Aires',
    },
  })
}

/** Delete a Building and everything that hangs off it (cascade via schema). */
export function deleteBuilding(id: string) {
  return prisma.building.delete({ where: { id } })
}

/** All Buildings + counts of related rows, for the listing page. */
export async function listBuildingsWithCounts() {
  const buildings = await prisma.building.findMany({
    include: {
      _count: { select: { units: true, cloudConnections: true } },
    },
    orderBy: { name: 'asc' },
  })
  // Device counts require a join through unit; compute in one extra trip.
  const deviceCounts = await prisma.meterDevice.groupBy({
    by: ['unitId'],
    _count: { unitId: true },
  })
  const deviceCountByUnit = new Map(deviceCounts.map((d) => [d.unitId, d._count.unitId]))
  const unitsByBuilding = await prisma.unit.findMany({
    where: { buildingId: { in: buildings.map((b) => b.id) } },
    select: { id: true, buildingId: true },
  })
  const deviceCountByBuilding = new Map<string, number>()
  for (const u of unitsByBuilding) {
    deviceCountByBuilding.set(
      u.buildingId,
      (deviceCountByBuilding.get(u.buildingId) ?? 0) + (deviceCountByUnit.get(u.id) ?? 0),
    )
  }
  return buildings.map((b) => ({
    ...b,
    unitCount: b._count.units,
    connectionCount: b._count.cloudConnections,
    deviceCount: deviceCountByBuilding.get(b.id) ?? 0,
  }))
}

// ----------------- Units -----------------

export type UnitInput = {
  label: string
  ownerName?: string | null
  externalRef?: string | null
}

export function getUnit(id: string) {
  return prisma.unit.findUnique({ where: { id } })
}

export function createUnit(buildingId: string, input: UnitInput) {
  return prisma.unit.create({
    data: {
      buildingId,
      label: input.label,
      ownerName: input.ownerName ?? null,
      externalRef: input.externalRef ?? null,
    },
  })
}

export function updateUnit(id: string, input: UnitInput) {
  return prisma.unit.update({
    where: { id },
    data: {
      label: input.label,
      ownerName: input.ownerName ?? null,
      externalRef: input.externalRef ?? null,
    },
  })
}

export function deleteUnit(id: string) {
  return prisma.unit.delete({ where: { id } })
}

export function listUnitsForBuilding(buildingId: string) {
  return prisma.unit.findMany({
    where: { buildingId },
    include: { _count: { select: { meterDevices: true } } },
    orderBy: { label: 'asc' },
  })
}

// ----------------- Cloud connections -----------------

export type CloudConnectionInput = {
  provider: Provider
  label?: string | null
  /** Plaintext JSON credentials — server encrypts before persisting. Pass undefined to keep existing. */
  credentialsPlaintext?: string
}

export function getCloudConnection(id: string) {
  return prisma.cloudConnection.findUnique({ where: { id } })
}

export function listConnectionsForBuilding(buildingId: string) {
  return prisma.cloudConnection.findMany({
    where: { buildingId },
    include: { _count: { select: { meterDevices: true } } },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createCloudConnection(buildingId: string, input: CloudConnectionInput) {
  const { encryptCredentials } = await import('@/infra/crypto')
  if (!input.credentialsPlaintext) {
    throw new Error('Las credenciales son requeridas al crear una conexión.')
  }
  const { verifyConnectionCredentials } = await import('@/server/metering')
  await verifyConnectionCredentials(input.provider, input.credentialsPlaintext)
  return prisma.cloudConnection.create({
    data: {
      buildingId,
      provider: input.provider,
      label: input.label ?? null,
      encryptedCredentials: new Uint8Array(encryptCredentials(input.credentialsPlaintext)),
    },
  })
}

export async function updateCloudConnection(id: string, input: CloudConnectionInput) {
  const { encryptCredentials } = await import('@/infra/crypto')
  if (input.credentialsPlaintext) {
    const { verifyConnectionCredentials } = await import('@/server/metering')
    await verifyConnectionCredentials(input.provider, input.credentialsPlaintext)
    return prisma.cloudConnection.update({
      where: { id },
      data: {
        provider: input.provider,
        label: input.label ?? null,
        encryptedCredentials: new Uint8Array(encryptCredentials(input.credentialsPlaintext)),
      },
    })
  }
  return prisma.cloudConnection.update({
    where: { id },
    data: { provider: input.provider, label: input.label ?? null },
  })
}

export function deleteCloudConnection(id: string) {
  return prisma.cloudConnection.delete({ where: { id } })
}

// ----------------- Meter devices -----------------

export type MeterDeviceInput = {
  unitId: string
  connectionId: string
  providerDeviceId: string
  label?: string | null
}

export function getMeterDevice(id: string) {
  return prisma.meterDevice.findUnique({
    where: { id },
    include: {
      unit: { select: { id: true, label: true, buildingId: true } },
      connection: { select: { id: true, label: true, provider: true, buildingId: true } },
    },
  })
}

export function createMeterDevice(input: MeterDeviceInput) {
  return prisma.meterDevice.create({
    data: {
      unitId: input.unitId,
      connectionId: input.connectionId,
      providerDeviceId: input.providerDeviceId,
      label: input.label ?? null,
    },
  })
}

export function updateMeterDevice(id: string, input: MeterDeviceInput) {
  return prisma.meterDevice.update({
    where: { id },
    data: {
      unitId: input.unitId,
      connectionId: input.connectionId,
      providerDeviceId: input.providerDeviceId,
      label: input.label ?? null,
    },
  })
}

export function deleteMeterDevice(id: string) {
  return prisma.meterDevice.delete({ where: { id } })
}
