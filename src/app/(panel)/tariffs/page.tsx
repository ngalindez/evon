import { HardHat } from 'lucide-react'

export default function TariffsPage() {
  // TODO(evon): guard with requireBuildingAdmin() and list tariffs by distribuidora + effective
  // date (server/tariffs). margin = 0 for the MVP — see CLAUDE.md "Detailed tariff rules".
  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">Configuración</p>
          <h1 className="evk-h1">Tarifas y margen</h1>
        </div>
      </div>
      <div className="evk-empty">
        <HardHat size={26} strokeWidth={1.9} />
        <p>Próximamente.</p>
        <span>El piloto usa una tarifa cargada manualmente con fecha de vigencia.</span>
      </div>
    </div>
  )
}
