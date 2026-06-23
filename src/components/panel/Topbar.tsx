import { RefreshCw } from 'lucide-react'

import { getActivePeriod, listPeriodsForPicker } from '@/server/billing'
import { getActiveBuilding, listBuildingsForPicker } from '@/server/catalog'
import { BuildingPicker } from './BuildingPicker'
import { PeriodPicker } from './PeriodPicker'

/**
 * Topbar: building + period pickers, sync hint.
 *
 * Plain English: this is rendered server-side so the selected building and the period options
 * can come straight from Prisma without an extra client fetch. The actual click handlers live
 * inside the BuildingPicker/PeriodPicker client components.
 */

export async function Topbar() {
  const [active, buildings] = await Promise.all([getActiveBuilding(), listBuildingsForPicker()])
  const periodOptions = active ? await listPeriodsForPicker(active.id) : []
  const activePeriod = await getActivePeriod()

  return (
    <header className="evk-topbar">
      <div className="evk-topbar__left">
        <BuildingPicker
          active={
            active
              ? {
                  id: active.id,
                  name: active.name,
                  address: active.address,
                  distribuidora: active.distribuidora,
                }
              : null
          }
          options={buildings}
        />
        <span className="evk-topbar__divider" />
        <PeriodPicker active={activePeriod} options={periodOptions} />
      </div>

      <div className="evk-topbar__right">
        <span className="evk-sync">
          <RefreshCw size={15} strokeWidth={1.9} />
          Datos del piloto (seed local)
        </span>
      </div>
    </header>
  )
}
