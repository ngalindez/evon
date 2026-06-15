import { Badge } from '@/components/ds/Badge'
import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { DeleteButton } from '@/components/panel/DeleteButton'
import { getBuilding, listConnectionsForBuilding } from '@/server/catalog'
import { ArrowLeft, Pencil, Plug, PlugZap } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteConnectionAction } from './actions'

export const dynamic = 'force-dynamic'

const PROVIDER_LABEL: Record<string, string> = {
  shelly: 'Shelly',
  tuya: 'Tuya',
  ewelink: 'eWeLink',
}

export default async function ConnectionsListPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const building = await getBuilding(id)
  if (!building) notFound()
  const connections = await listConnectionsForBuilding(id)

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">
            <Link href="/buildings" style={{ color: 'inherit', textDecoration: 'none' }}>
              <ArrowLeft size={11} strokeWidth={2.4} style={{ verticalAlign: 'middle' }} />{' '}
              Consorcios
            </Link>
            {' · '}
            {building.name}
          </p>
          <h1 className="evk-h1">Conexiones al cloud</h1>
        </div>
        <Link href={`/buildings/${id}/connections/new`}>
          <Button iconLeft={<Plug size={17} strokeWidth={1.9} />}>Agregar conexión</Button>
        </Link>
      </div>

      {connections.length === 0 ? (
        <div className="evk-empty">
          <PlugZap size={26} strokeWidth={1.9} />
          <p>Sin conexiones cargadas todavía.</p>
          <span>Cada conexión guarda las credenciales encriptadas para leer los disyuntores.</span>
        </div>
      ) : (
        <Card
          title={`${connections.length} conexiones`}
          subtitle="Credenciales encriptadas en reposo (AES-256-GCM). Editar permite reemplazar el blob."
        >
          <div className="evk-tablewrap">
            <table className="evk-table">
              <thead>
                <tr>
                  <th>Etiqueta</th>
                  <th>Fabricante</th>
                  <th className="num">Disyuntores</th>
                  <th>Creada</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {connections.map((c) => (
                  <tr key={c.id}>
                    <td className="evk-table__uf">{c.label ?? '—'}</td>
                    <td>
                      <Badge tone="brand">{PROVIDER_LABEL[c.provider] ?? c.provider}</Badge>
                    </td>
                    <td className="num evk-mono">{c._count.meterDevices}</td>
                    <td className="evk-muted">
                      {c.createdAt.toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
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
                        confirmText={`Eliminar la conexión "${c.label ?? c.id}"? Se borran sus dispositivos.`}
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
