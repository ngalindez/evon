import { Badge } from '@/components/ds/Badge'
import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { DeleteButton } from '@/components/panel/DeleteButton'
import { getBuilding, listConnectionsForBuilding, listUnitsForBuilding } from '@/server/catalog'
import type { Provider } from '@prisma/client'
import { ArrowLeft, Cpu, MapPin, Pencil, Plug, PlugZap, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteBuildingAction } from '../actions'
import { deleteConnectionAction } from './connections/actions'
import { deleteUnitAction } from './units/actions'

export const dynamic = 'force-dynamic'

const PROVIDER_LABEL: Record<Provider, string> = {
  shelly: 'Shelly',
  tuya: 'Tuya',
  ewelink: 'eWeLink',
}

export default async function BuildingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [building, units, connections] = await Promise.all([
    getBuilding(id),
    listUnitsForBuilding(id),
    listConnectionsForBuilding(id),
  ])
  if (!building) notFound()

  const totalDevices = units.reduce((s, u) => s + u._count.meterDevices, 0)

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">
            <Link href="/buildings" className="evk-back-link">
              <ArrowLeft size={12} strokeWidth={2.4} aria-hidden="true" />
              Consorcios
            </Link>
          </p>
          <h1 className="evk-h1">{building.name}</h1>
          {building.address && (
            <p
              style={{
                margin: '6px 0 0',
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <MapPin size={14} strokeWidth={1.9} />
              {building.address}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/buildings/${id}/edit`}>
            <Button
              type="button"
              variant="secondary"
              iconLeft={<Pencil size={14} strokeWidth={1.9} />}
            >
              Editar datos
            </Button>
          </Link>
          <DeleteButton
            action={deleteBuildingAction.bind(null, id)}
            confirmText={`Eliminar "${building.name}"? Se borran sus unidades, disyuntores y períodos.`}
            label="Eliminar consorcio"
            size="md"
          />
        </div>
      </div>

      <div className="evk-stats">
        <Card padded>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                font: 'var(--weight-semibold) var(--text-2xs)/1.2 var(--font-sans)',
                letterSpacing: 'var(--tracking-caps)',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}
            >
              Distribuidora
            </span>
            <Badge tone="brand">{building.distribuidora}</Badge>
          </div>
        </Card>
        <Card padded>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                font: 'var(--weight-semibold) var(--text-2xs)/1.2 var(--font-sans)',
                letterSpacing: 'var(--tracking-caps)',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}
            >
              Unidades funcionales
            </span>
            <strong className="evk-mono" style={{ fontSize: 26 }}>
              {units.length}
            </strong>
          </div>
        </Card>
        <Card padded>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                font: 'var(--weight-semibold) var(--text-2xs)/1.2 var(--font-sans)',
                letterSpacing: 'var(--tracking-caps)',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}
            >
              Disyuntores
            </span>
            <strong className="evk-mono" style={{ fontSize: 26 }}>
              {totalDevices}
            </strong>
          </div>
        </Card>
        <Card padded>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                font: 'var(--weight-semibold) var(--text-2xs)/1.2 var(--font-sans)',
                letterSpacing: 'var(--tracking-caps)',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}
            >
              Conexiones cloud
            </span>
            <strong className="evk-mono" style={{ fontSize: 26 }}>
              {connections.length}
            </strong>
          </div>
        </Card>
      </div>

      <Card
        title="Unidades funcionales"
        subtitle="Cada UF se cobra como una línea del CSV."
        action={
          <Link href={`/buildings/${id}/units/new`}>
            <Button type="button" size="sm" iconLeft={<Plus size={14} strokeWidth={1.9} />}>
              Agregar unidad
            </Button>
          </Link>
        }
      >
        {units.length === 0 ? (
          <div className="evk-empty" style={{ padding: '40px 20px' }}>
            <Users size={26} strokeWidth={1.9} />
            <p>Sin unidades cargadas todavía.</p>
            <span>Agregá una por cochera medida.</span>
          </div>
        ) : (
          <div className="evk-tablewrap">
            <table className="evk-table">
              <thead>
                <tr>
                  <th>Etiqueta</th>
                  <th>Propietario</th>
                  <th>Ref. en expensas</th>
                  <th className="num">Disyuntores</th>
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
                    <td
                      style={{
                        display: 'flex',
                        gap: 8,
                        justifyContent: 'flex-end',
                      }}
                    >
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
                        confirmText={`Eliminar la unidad "${u.label}"? Se borran sus disyuntores y lecturas.`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card
        title="Conexiones al cloud"
        subtitle="Credenciales encriptadas en reposo. Cada disyuntor apunta a una conexión."
        action={
          <Link href={`/buildings/${id}/connections/new`}>
            <Button type="button" size="sm" iconLeft={<Plug size={14} strokeWidth={1.9} />}>
              Agregar conexión
            </Button>
          </Link>
        }
      >
        {connections.length === 0 ? (
          <div className="evk-empty" style={{ padding: '40px 20px' }}>
            <PlugZap size={26} strokeWidth={1.9} />
            <p>Sin conexiones cargadas todavía.</p>
            <span>Agregá una conexión para empezar a leer disyuntores.</span>
          </div>
        ) : (
          <div className="evk-tablewrap">
            <table className="evk-table">
              <thead>
                <tr>
                  <th>Etiqueta</th>
                  <th>Fabricante</th>
                  <th className="num">Disyuntores</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {connections.map((c) => (
                  <tr key={c.id}>
                    <td className="evk-table__uf">
                      <Cpu
                        size={14}
                        strokeWidth={1.9}
                        style={{ verticalAlign: 'middle', marginRight: 6 }}
                      />
                      {c.label ?? '—'}
                    </td>
                    <td>
                      <Badge tone="brand">{PROVIDER_LABEL[c.provider] ?? c.provider}</Badge>
                    </td>
                    <td className="num evk-mono">{c._count.meterDevices}</td>
                    <td
                      style={{
                        display: 'flex',
                        gap: 8,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Link href={`/buildings/${id}/connections/${c.id}`}>
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
                        action={deleteConnectionAction.bind(null, id, c.id)}
                        confirmText={`Eliminar la conexión "${c.label ?? c.id}"? Se borran sus disyuntores.`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
