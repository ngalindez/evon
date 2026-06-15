import type { Building, MeterReading, Provider } from '@prisma/client'

import type { DeviceStatus } from '@/components/ds/StatusDot'
import { prisma } from '@/infra/db/client'

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
 * Plain English: until login + a building selector ship, the panel just picks the oldest
 * Building in the database. Returns null if the database is empty.
 *
 * TODO(evon): replace with the authenticated admin's actively-selected building once
 * requireBuildingAdmin() and a building switcher exist (CLAUDE.md "Auth").
 */
export function getActiveBuilding(): Promise<Building | null> {
  return prisma.building.findFirst({ orderBy: { createdAt: 'asc' } })
}

/** A row joining a MeterDevice with its Unit, Provider and most recent Reading. */
export type DeviceRow = {
  /** MeterDevice id. */
  id: string
  /** Unit label (e.g. "3.º B"). */
  uf: string
  /** Cloud-side device id (e.g. "shelly-1a2b"). */
  providerDeviceId: string
  provider: Provider
  status: DeviceStatus
  /** Latest persisted Reading, if any. */
  latestReading: MeterReading | null
}

/**
 * Derive a coarse on/idle/offline state from the latest reading recency.
 *
 * No "live ping" channel exists — the schema only knows about persisted Readings — so we treat
 * a device with a sub-24h reading as online, 1-7d as idle, and anything older (or never read)
 * as offline. This is good enough for the dashboard's status dots.
 */
function deriveStatus(reading: MeterReading | null, now: Date): DeviceStatus {
  if (!reading) return 'offline'
  const ageMs = now.getTime() - reading.readAt.getTime()
  const day = 24 * 60 * 60 * 1000
  if (ageMs < day) return 'online'
  if (ageMs < 7 * day) return 'idle'
  return 'offline'
}

/** All MeterDevices in a Building, decorated with Unit, Provider, and latest Reading. */
export async function listDeviceRows(
  buildingId: string,
  now: Date = new Date(),
): Promise<DeviceRow[]> {
  const devices = await prisma.meterDevice.findMany({
    where: { unit: { buildingId } },
    include: {
      unit: { select: { label: true } },
      connection: { select: { provider: true } },
      readings: { orderBy: { readAt: 'desc' }, take: 1 },
    },
    orderBy: [{ unit: { label: 'asc' } }],
  })

  return devices.map((d) => {
    const latestReading = d.readings[0] ?? null
    return {
      id: d.id,
      uf: d.unit.label,
      providerDeviceId: d.providerDeviceId,
      provider: d.connection.provider,
      status: deriveStatus(latestReading, now),
      latestReading,
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

// TODO(evon): create/update of units, cloud connections and meter devices still to come — these
// are the next CRUD surfaces after Buildings/Tariffs. See CLAUDE.md "Administrator web panel".
