import { BuildingForm } from '@/components/panel/BuildingForm'
import { createBuildingAction } from '../actions'

export const metadata = { title: 'Nuevo consorcio · Evon' }

export default function NewBuildingPage() {
  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">Cartera · Nuevo</p>
          <h1 className="evk-h1">Agregar consorcio</h1>
        </div>
      </div>
      <BuildingForm action={createBuildingAction} submitLabel="Crear consorcio" />
    </div>
  )
}
