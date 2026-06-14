import { PeriodReviewScreen } from '@/components/panel/PeriodReview'
import { getPeriodReview } from '@/server/billing'
import { getActiveBuilding } from '@/server/catalog'
import { Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PeriodsPage() {
  // TODO(evon): once auth is wired, replace getActiveBuilding() with the admin's selected
  // building. "Descargar CSV" + "Aprobar" buttons in PeriodReviewScreen still need server actions
  // (server/output for CSV, server/billing for approve).
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

  const data = await getPeriodReview(building.id)
  return <PeriodReviewScreen data={data} />
}
