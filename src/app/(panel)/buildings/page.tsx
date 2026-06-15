import { Badge } from '@/components/ds/Badge'
import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { DeleteButton } from '@/components/panel/DeleteButton'
import { listBuildingsWithCounts } from '@/server/catalog'
import { Building2, Pencil, Plus } from 'lucide-react'
import Link from 'next/link'
import { deleteBuildingAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function BuildingsPage() {
  const buildings = await listBuildingsWithCounts()

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">Cartera</p>
          <h1 className="evk-h1">Consorcios</h1>
        </div>
        <Link href="/buildings/new">
          <Button iconLeft={<Plus size={17} strokeWidth={1.9} />}>Agregar consorcio</Button>
        </Link>
      </div>

      {buildings.length === 0 ? (
        <div className="evk-empty">
          <Building2 size={26} strokeWidth={1.9} />
          <p>Sin consorcios cargados todavía.</p>
          <span>
            Agregá el primer consorcio para configurar sus unidades funcionales y disyuntores.
          </span>
        </div>
      ) : (
        <Card subtitle={`${buildings.length} consorcios bajo administración`} title="Cartera">
          <div className="evk-tablewrap">
            <table className="evk-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Distribuidora</th>
                  <th className="num">Unidades</th>
                  <th className="num">Dispositivos</th>
                  <th>Perfil CSV</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {buildings.map((b) => (
                  <tr key={b.id}>
                    <td className="evk-table__uf">{b.name}</td>
                    <td>{b.address ?? '—'}</td>
                    <td>
                      <Badge tone="brand">{b.distribuidora}</Badge>
                    </td>
                    <td className="num evk-mono">{b.unitCount}</td>
                    <td className="num evk-mono">{b.deviceCount}</td>
                    <td>
                      <Badge tone="neutral">{b.exportProfile}</Badge>
                    </td>
                    <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Link href={`/buildings/${b.id}`}>
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
                        action={deleteBuildingAction.bind(null, b.id)}
                        confirmText={`Eliminar "${b.name}"? Se borran sus unidades, disyuntores y períodos.`}
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
