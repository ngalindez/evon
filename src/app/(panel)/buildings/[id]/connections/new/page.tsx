import { ConnectionForm } from '@/components/panel/ConnectionForm'
import { getBuilding } from '@/server/catalog'
import { notFound } from 'next/navigation'
import { createConnectionAction } from '../actions'

export const metadata = { title: 'Nueva conexión · Evon' }

export default async function NewConnectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const building = await getBuilding(id)
  if (!building) notFound()
  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">{building.name} · Conexiones</p>
          <h1 className="evk-h1">Agregar conexión al cloud</h1>
        </div>
      </div>
      <ConnectionForm
        action={createConnectionAction.bind(null, id)}
        submitLabel="Crear conexión"
        buildingId={id}
        mode="create"
      />
    </div>
  )
}
