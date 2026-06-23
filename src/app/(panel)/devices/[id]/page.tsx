import { Badge } from '@/components/ds/Badge'
import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { StatusDot } from '@/components/ds/StatusDot'
import { DeleteButton } from '@/components/panel/DeleteButton'
import { ReadNowButton } from '@/components/panel/ReadNowButton'
import { UsageGraph } from '@/components/panel/UsageGraph'
import { fmtNum, formatRelative } from '@/lib/format'
import { deriveStatus, getMeterDevice } from '@/server/catalog'
import { getLatestSample, getUsageSeries } from '@/server/metering'
import type { Provider } from '@prisma/client'
import { ArrowLeft, Cpu } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteDeviceAction, triggerReadAction } from '../actions'

export const dynamic = 'force-dynamic'

const PROVIDER_LABEL: Record<Provider, string> = {
  shelly: 'Shelly',
  tuya: 'Tuya',
  ewelink: 'eWeLink',
}

export default async function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const device = await getMeterDevice(id)
  if (!device) notFound()

  const [latest, day, week, month] = await Promise.all([
    getLatestSample(id),
    getUsageSeries(id, 'day'),
    getUsageSeries(id, 'week'),
    getUsageSeries(id, 'month'),
  ])

  const now = new Date()
  const status = deriveStatus(latest?.readAt ?? null, now)
  const heading = device.label ?? device.providerDeviceId

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">
            <Link href="/devices" className="evk-back-link">
              <ArrowLeft size={12} strokeWidth={2.4} aria-hidden="true" />
              Dispositivos
            </Link>
          </p>
          <h1 className="evk-h1">{heading}</h1>
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
            <Cpu size={14} strokeWidth={1.9} />
            <span className="evk-mono">{device.providerDeviceId}</span>
          </p>
        </div>
        <ReadNowButton action={triggerReadAction.bind(null, id)}>
          <Link href={`/devices/${id}/edit`}>
            <Button type="button" variant="secondary">
              Editar datos
            </Button>
          </Link>
          <DeleteButton
            action={deleteDeviceAction.bind(null, id)}
            confirmText={`Eliminar disyuntor "${device.providerDeviceId}"? Se borran sus lecturas.`}
            label="Eliminar"
            size="md"
          />
        </ReadNowButton>
      </div>

      {!latest && (
        <div
          style={{
            background: 'var(--warning-soft)',
            color: 'var(--warning-text)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
          }}
        >
          Todavía no hay lecturas de este disyuntor. Usá "Leer ahora" para tomar la primera
          (verificá el Device ID y que el disyuntor esté online si falla).
        </div>
      )}

      <div className="evk-stats">
        <Card padded>
          <div className="evon-stat">
            <div className="evon-stat__label">Unidad funcional</div>
            <div className="evon-stat__value">{device.unit.label}</div>
          </div>
        </Card>
        <Card padded>
          <div className="evon-stat">
            <div className="evon-stat__label">Fabricante</div>
            <div className="evon-stat__value">
              <Badge tone="brand">{PROVIDER_LABEL[device.connection.provider]}</Badge>
            </div>
          </div>
        </Card>
        <Card padded>
          <div className="evon-stat">
            <div className="evon-stat__label">Estado</div>
            <div className="evon-stat__value">
              <StatusDot status={status} pulse={status === 'online'} />
            </div>
          </div>
        </Card>
        <Card padded>
          <div className="evon-stat">
            <div className="evon-stat__label">Acumulado</div>
            <div className="evon-stat__value evon-stat__value--mono">
              {latest ? fmtNum(Number(latest.counterKwh), 3) : '—'}
              {latest && <span className="unit">kWh</span>}
            </div>
            <div className="evon-stat__foot">
              <span>{formatRelative(latest?.readAt ?? null, now, 'sin lecturas')}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Consumo" subtitle="Diferencia de lecturas acumuladas por período.">
        <UsageGraph series={{ day, week, month }} />
      </Card>
    </div>
  )
}
