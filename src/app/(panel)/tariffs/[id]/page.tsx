import { TariffForm } from '@/components/panel/TariffForm'
import { getTariff } from '@/server/tariffs'
import { notFound } from 'next/navigation'
import { updateTariffAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Editar tarifa · Evon' }

export default async function EditTariffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tariff = await getTariff(id)
  if (!tariff) notFound()

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">Configuración · Editar</p>
          <h1 className="evk-h1">Tarifa {tariff.distribuidora}</h1>
        </div>
      </div>
      <TariffForm
        initial={{
          id: tariff.id,
          distribuidora: tariff.distribuidora,
          pricePerKwh: tariff.pricePerKwh.toString(),
          margin: tariff.margin.toString(),
          effectiveFrom: tariff.effectiveFrom,
        }}
        action={updateTariffAction.bind(null, id)}
        submitLabel="Guardar cambios"
      />
    </div>
  )
}
