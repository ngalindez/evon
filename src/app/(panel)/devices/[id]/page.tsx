import { DeviceForm } from '@/components/panel/DeviceForm'
import {
  getActiveBuilding,
  getMeterDevice,
  listConnectionsForBuilding,
  listUnitsForBuilding,
} from '@/server/catalog'
import { notFound } from 'next/navigation'
import { updateDeviceAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Editar disyuntor · Evon' }

export default async function EditDevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const device = await getMeterDevice(id)
  if (!device) notFound()
  const buildingId = device.unit.buildingId
  const [units, connections, activeBuilding] = await Promise.all([
    listUnitsForBuilding(buildingId),
    listConnectionsForBuilding(buildingId),
    getActiveBuilding(),
  ])

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">{activeBuilding?.name ?? 'Consorcio'} · Dispositivos</p>
          <h1 className="evk-h1">Editar {device.providerDeviceId}</h1>
        </div>
      </div>
      <DeviceForm
        initial={{
          unitId: device.unitId,
          connectionId: device.connectionId,
          providerDeviceId: device.providerDeviceId,
          label: device.label,
        }}
        units={units}
        connections={connections}
        action={updateDeviceAction.bind(null, id)}
        submitLabel="Guardar cambios"
        cancelHref="/devices"
      />
    </div>
  )
}
