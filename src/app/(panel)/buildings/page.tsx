import { Button } from '@/components/ds/Button'
import { Building2, Plus } from 'lucide-react'

export default function BuildingsPage() {
  // TODO(evon): guard with requireBuildingAdmin() and load via server/catalog.listBuildings()
  // once authorize() is implemented. Left ungated for now so the skeleton is browsable.
  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">Cartera</p>
          <h1 className="evk-h1">Consorcios</h1>
        </div>
        <Button iconLeft={<Plus size={17} strokeWidth={1.9} />}>Agregar consorcio</Button>
      </div>
      <div className="evk-empty">
        <Building2 size={26} strokeWidth={1.9} />
        <p>Sin consorcios cargados todavía.</p>
        <span>
          Agregá el primer consorcio para configurar sus unidades funcionales y disyuntores.
        </span>
      </div>
    </div>
  )
}
