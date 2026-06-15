import { UnitForm } from '@/components/panel/UnitForm'
import { getBuilding } from '@/server/catalog'
import { notFound } from 'next/navigation'
import { createUnitAction } from '../actions'

export const metadata = { title: 'Nueva unidad · Evon' }

export default async function NewUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const building = await getBuilding(id)
  if (!building) notFound()
  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">{building.name} · Unidades</p>
          <h1 className="evk-h1">Agregar unidad</h1>
        </div>
      </div>
      <UnitForm
        action={createUnitAction.bind(null, id)}
        submitLabel="Crear unidad"
        buildingId={id}
      />
    </div>
  )
}
