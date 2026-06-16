import { PeriodReviewScreen } from '@/components/panel/PeriodReview'
import { getActivePeriod, getPeriodReview } from '@/server/billing'
import { getActiveBuilding } from '@/server/catalog'
import { Building2 } from 'lucide-react'
import { approvePeriodAction, unapprovePeriodAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function PeriodsPage() {
  // TODO(evon): once auth is wired, replace getActiveBuilding() with the admin's selected
  // building. The CSV download route + approval action both take buildingId/year/month, so
  // they're already auth-agnostic.
  const building = await getActiveBuilding()

  if (!building) {
    return (
      <div className="evk-page">
        <div className="evk-page__head">
          <div>
            <p className="evk-eyebrow">Períodos</p>
            <h1 className="evk-h1">Sin consorcios cargados</h1>
          </div>
        </div>
        <div className="evk-empty">
          <Building2 size={26} strokeWidth={1.9} />
          <p>Agregá un consorcio antes de revisar un período.</p>
          <span>El piloto se configura desde la sección Consorcios.</span>
        </div>
      </div>
    )
  }

  const selected = await getActivePeriod()
  const data = await getPeriodReview(building.id, selected)
  return (
    <PeriodReviewScreen
      data={data}
      approveAction={approvePeriodAction}
      unapproveAction={unapprovePeriodAction}
      currentMonth={selected}
    />
  )
}
