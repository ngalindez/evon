import { BuildingForm } from '@/components/panel/BuildingForm'
import { getBuilding } from '@/server/catalog'
import { notFound } from 'next/navigation'
import { updateBuildingAction } from '../../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Editar consorcio · Evon' }

export default async function EditBuildingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const building = await getBuilding(id)
  if (!building) notFound()

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">Cartera · Editar</p>
          <h1 className="evk-h1">{building.name}</h1>
        </div>
      </div>
      <BuildingForm
        initial={building}
        action={updateBuildingAction.bind(null, id)}
        submitLabel="Guardar cambios"
      />
    </div>
  )
}
