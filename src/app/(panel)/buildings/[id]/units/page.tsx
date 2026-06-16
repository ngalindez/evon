import { Badge } from '@/components/ds/Badge'
import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { DeleteButton } from '@/components/panel/DeleteButton'
import { getBuilding, listUnitsForBuilding } from '@/server/catalog'
import { ArrowLeft, Pencil, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteUnitAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function UnitsListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const building = await getBuilding(id)
  if (!building) notFound()
  const units = await listUnitsForBuilding(id)

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow evk-eyebrow--row">
            <Link href="/buildings" className="evk-back-link">
              <ArrowLeft size={12} strokeWidth={2.4} aria-hidden="true" />
              Consorcios
            </Link>
            <span>{` · ${building.name}`}</span>
          </p>
          <h1 className="evk-h1">Unidades funcionales</h1>
        </div>
        <Link href={`/buildings/${id}/units/new`}>
          <Button iconLeft={<Plus size={17} strokeWidth={1.9} />}>Agregar unidad</Button>
        </Link>
      </div>

      {units.length === 0 ? (
        <div className="evk-empty">
          <Users size={26} strokeWidth={1.9} />
          <p>Sin unidades cargadas todavía.</p>
          <span>Agregá una unidad por cochera medida (UF / departamento + ref. del software).</span>
        </div>
      ) : (
        <Card
          title={`${units.length} unidades`}
          subtitle="Cada unidad concentra los dispositivos y termina como una línea del CSV."
        >
          <div className="evk-tablewrap">
            <table className="evk-table">
              <thead>
                <tr>
                  <th>Etiqueta</th>
                  <th>Propietario</th>
                  <th>Ref. en expensas</th>
                  <th className="num">Dispositivos</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id}>
                    <td className="evk-table__uf">{u.label}</td>
                    <td>{u.ownerName ?? '—'}</td>
                    <td>
                      {u.externalRef ? (
                        <Badge tone="neutral">{u.externalRef}</Badge>
                      ) : (
                        <span className="evk-muted">—</span>
                      )}
                    </td>
                    <td className="num evk-mono">{u._count.meterDevices}</td>
                    <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Link href={`/buildings/${id}/units/${u.id}`}>
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
                        action={deleteUnitAction.bind(null, id, u.id)}
                        confirmText={`Eliminar la unidad "${u.label}"? Se borran sus dispositivos y lecturas.`}
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
