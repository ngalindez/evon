import { TariffForm } from '@/components/panel/TariffForm'
import { createTariffAction } from '../actions'

export const metadata = { title: 'Nueva tarifa · Evon' }

export default function NewTariffPage() {
  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">Configuración · Nueva</p>
          <h1 className="evk-h1">Agregar tarifa</h1>
        </div>
      </div>
      <TariffForm action={createTariffAction} submitLabel="Crear tarifa" />
    </div>
  )
}
