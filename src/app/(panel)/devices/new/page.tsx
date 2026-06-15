import { DeviceForm } from '@/components/panel/DeviceForm'
import {
  getActiveBuilding,
  listConnectionsForBuilding,
  listUnitsForBuilding,
} from '@/server/catalog'
import { Building2 } from 'lucide-react'
import { createDeviceAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Nuevo disyuntor · Evon' }

export default async function NewDevicePage() {
  const building = await getActiveBuilding()
  if (!building) {
    return (
      <div className="evk-page">
        <div className="evk-page__head">
          <div>
            <p className="evk-eyebrow">Dispositivos</p>
            <h1 className="evk-h1">Sin consorcios cargados</h1>
          </div>
        </div>
        <div className="evk-empty">
          <Building2 size={26} strokeWidth={1.9} />
          <p>Agregá un consorcio antes de cargar disyuntores.</p>
          <span>El consorcio define qué unidades y conexiones aplican.</span>
        </div>
      </div>
    )
  }

  const [units, connections] = await Promise.all([
    listUnitsForBuilding(building.id),
    listConnectionsForBuilding(building.id),
  ])

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">{building.name} · Dispositivos</p>
          <h1 className="evk-h1">Agregar disyuntor</h1>
        </div>
      </div>
      <DeviceForm
        units={units}
        connections={connections}
        action={createDeviceAction}
        submitLabel="Crear disyuntor"
        cancelHref="/devices"
      />
    </div>
  )
}
