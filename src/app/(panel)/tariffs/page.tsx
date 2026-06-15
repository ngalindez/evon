import { Badge } from '@/components/ds/Badge'
import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { DeleteButton } from '@/components/panel/DeleteButton'
import { fmtMoney } from '@/lib/format'
import { listTariffs } from '@/server/tariffs'
import { Pencil, Percent, Plus } from 'lucide-react'
import Link from 'next/link'
import { deleteTariffAction } from './actions'

export const dynamic = 'force-dynamic'

function formatPct(margin: string): string {
  const n = Number.parseFloat(margin)
  if (Number.isNaN(n)) return '—'
  return `${(n * 100).toFixed(1).replace(/\.0$/, '')} %`
}

export default async function TariffsPage() {
  const tariffs = await listTariffs()

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">Configuración</p>
          <h1 className="evk-h1">Tarifas y margen</h1>
        </div>
        <Link href="/tariffs/new">
          <Button iconLeft={<Plus size={17} strokeWidth={1.9} />}>Agregar tarifa</Button>
        </Link>
      </div>

      {tariffs.length === 0 ? (
        <div className="evk-empty">
          <Percent size={26} strokeWidth={1.9} />
          <p>Sin tarifas cargadas todavía.</p>
          <span>Agregá una tarifa por distribuidora con su fecha de vigencia.</span>
        </div>
      ) : (
        <Card title="Tarifas vigentes" subtitle="Se aplica la más reciente por distribuidora">
          <div className="evk-tablewrap">
            <table className="evk-table">
              <thead>
                <tr>
                  <th>Distribuidora</th>
                  <th className="num">Precio kWh</th>
                  <th className="num">Margen</th>
                  <th>Vigente desde</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {tariffs.map((t) => (
                  <tr key={t.id}>
                    <td className="evk-table__uf">
                      <Badge tone="brand">{t.distribuidora}</Badge>
                    </td>
                    <td className="num evk-mono strong">
                      {fmtMoney(Number.parseFloat(t.pricePerKwh.toString()))} / kWh
                    </td>
                    <td className="num evk-mono">{formatPct(t.margin.toString())}</td>
                    <td className="evk-mono">
                      {new Date(t.effectiveFrom).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Link href={`/tariffs/${t.id}`}>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          iconLeft={<Pencil size={14} strokeWidth={1.9} />}
                        >
                          Editar
                        </Button>
                      </Link>
                      <DeleteButton
                        action={deleteTariffAction.bind(null, t.id)}
                        confirmText={`Eliminar tarifa ${t.distribuidora} vigente desde ${new Date(t.effectiveFrom).toLocaleDateString('es-AR')}?`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
