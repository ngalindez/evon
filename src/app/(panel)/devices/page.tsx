import { Badge, type BadgeTone } from '@/components/ds/Badge'
import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { StatusDot } from '@/components/ds/StatusDot'
import { Tag } from '@/components/ds/Tag'
import { ClickableTableRow } from '@/components/panel/ClickableTableRow'
import { fmtNum, formatRelative } from '@/lib/format'
import { getActiveBuilding, listDeviceRows } from '@/server/catalog'
import type { Provider } from '@prisma/client'
import { Building2, Cpu, Filter, Plus, Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PROVIDER_LABEL: Record<Provider, string> = {
  shelly: 'Shelly',
  tuya: 'Tuya',
  ewelink: 'eWeLink',
}

const PROVIDER_TONE: Record<Provider, BadgeTone> = {
  shelly: 'brand',
  tuya: 'neutral',
  ewelink: 'info',
}

export default async function DevicesPage() {
  // TODO(evon): once auth is wired, replace getActiveBuilding() with the admin's selected
  // building. "Agregar disyuntor" should open the onboarding flow (connectors/shelly first).
  const building = await getActiveBuilding()

  if (!building) {
    return (
      <div className="evk-page">
        <div className="evk-page__head">
          <div>
            <p className="evk-eyebrow">Dispositivos</p>
            <h1 className="evk-h1">Sin consorcios cargados</h1>
          </div>
        </div>
        <div className="evk-empty">
          <Building2 size={26} strokeWidth={1.9} />
          <p>Agregá un consorcio antes de cargar dispositivos.</p>
          <span>El piloto se configura desde la sección Consorcios.</span>
        </div>
      </div>
    )
  }

  const now = new Date()
  const rows = await listDeviceRows(building.id, now)

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">{building.name}</p>
          <h1 className="evk-h1">Dispositivos</h1>
        </div>
        <Link href="/devices/new">
          <Button iconLeft={<Plus size={17} strokeWidth={1.9} />}>Agregar disyuntor</Button>
        </Link>
      </div>

      <div className="evk-toolbar">
        <div className="evk-search">
          <Search size={16} strokeWidth={1.9} />
          <input placeholder="Buscar por UF o ID de dispositivo" />
        </div>
        <div className="evk-toolbar__filters">
          <Tag icon={<Filter size={14} strokeWidth={1.9} />}>Todos los fabricantes</Tag>
          <Tag>
            {rows.length} {rows.length === 1 ? 'dispositivo' : 'dispositivos'}
          </Tag>
        </div>
      </div>

      <Card
        title="Disyuntores inteligentes"
        subtitle="Conectados al cloud del fabricante vía API REST"
      >
        {rows.length === 0 ? (
          <div className="evk-empty" style={{ padding: '64px 20px' }}>
            <Cpu size={26} strokeWidth={1.9} />
            <p>Sin disyuntores cargados.</p>
            <span>Agregá el primer dispositivo para empezar a leer kWh por cochera.</span>
          </div>
        ) : (
          <div className="evk-tablewrap">
            <table className="evk-table">
              <thead>
                <tr>
                  <th>UF</th>
                  <th>Fabricante</th>
                  <th>Device ID</th>
                  <th>Estado</th>
                  <th className="num">Acumulado</th>
                  <th className="num">Última lectura</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => {
                  const lastKwh = d.lastCounterKwh == null ? null : Number(d.lastCounterKwh)
                  return (
                    <ClickableTableRow key={d.id} href={`/devices/${d.id}`}>
                      <td className="evk-table__uf">{d.uf}</td>
                      <td>
                        <Badge tone={PROVIDER_TONE[d.provider]}>{PROVIDER_LABEL[d.provider]}</Badge>
                      </td>
                      <td>
                        <Tag mono icon={<Cpu size={14} strokeWidth={1.9} />}>
                          {d.providerDeviceId}
                        </Tag>
                      </td>
                      <td>
                        <StatusDot status={d.status} pulse={d.status === 'online'} />
                      </td>
                      <td className="num evk-mono">
                        {lastKwh == null ? '—' : `${fmtNum(lastKwh)} kWh`}
                      </td>
                      <td className="num evk-mono evk-muted">
                        {formatRelative(d.lastReadAt, now)}
                      </td>
                    </ClickableTableRow>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
