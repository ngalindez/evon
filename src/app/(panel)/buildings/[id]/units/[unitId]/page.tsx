import { UnitForm } from '@/components/panel/UnitForm'
import { getBuilding, getUnit } from '@/server/catalog'
import { notFound } from 'next/navigation'
import { updateUnitAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Editar unidad · Evon' }

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>
}) {
  const { id, unitId } = await params
  const [building, unit] = await Promise.all([getBuilding(id), getUnit(unitId)])
  if (!building || !unit) notFound()
  if (unit.buildingId !== id) notFound()

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">{building.name} · Unidades</p>
          <h1 className="evk-h1">Editar {unit.label}</h1>
        </div>
      </div>
      <UnitForm
        initial={{ label: unit.label, ownerName: unit.ownerName, externalRef: unit.externalRef }}
        action={updateUnitAction.bind(null, id, unitId)}
        submitLabel="Guardar cambios"
        buildingId={id}
      />
    </div>
  )
}
