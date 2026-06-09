import type { Building, Unit } from '@prisma/client'

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
export function listUnits(buildingId: string): Promise<Unit[]> {
  return prisma.unit.findMany({
    where: { buildingId },
    orderBy: { label: 'asc' },
  })
}

// TODO(evon): create/update of buildings, units, cloud connections and meter devices is still to
// come (the panel write side) — see CLAUDE.md "MVP scope" / "Administrator web panel".
