import { ConnectionForm } from '@/components/panel/ConnectionForm'
import { getBuilding, getCloudConnection } from '@/server/catalog'
import { notFound } from 'next/navigation'
import { updateConnectionAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Editar conexión · Evon' }

export default async function EditConnectionPage({
  params,
}: {
  params: Promise<{ id: string; connectionId: string }>
}) {
  const { id, connectionId } = await params
  const [building, connection] = await Promise.all([
    getBuilding(id),
    getCloudConnection(connectionId),
  ])
  if (!building || !connection) notFound()
  if (connection.buildingId !== id) notFound()

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">{building.name} · Conexiones</p>
          <h1 className="evk-h1">Editar conexión</h1>
        </div>
      </div>
      <ConnectionForm
        initial={{ provider: connection.provider, label: connection.label }}
        action={updateConnectionAction.bind(null, id, connectionId)}
        submitLabel="Guardar cambios"
        buildingId={id}
        mode="edit"
      />
    </div>
  )
}
