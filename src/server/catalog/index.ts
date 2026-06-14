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

// TODO(evon): create/update of buildings, units, cloud connections and meter devices is still to
// come (the panel write side) — see CLAUDE.md "MVP scope" / "Administrator web panel".
