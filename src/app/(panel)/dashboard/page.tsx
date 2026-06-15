import { Alert } from '@/components/ds/Alert'
import { Badge } from '@/components/ds/Badge'
import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { ProgressBar } from '@/components/ds/ProgressBar'
import { Stat } from '@/components/ds/Stat'
import { StatusDot } from '@/components/ds/StatusDot'
import { fmtMoney, fmtNum } from '@/lib/format'
import { getActivePeriod, getDashboardSummary } from '@/server/billing'
import { getActiveBuilding } from '@/server/catalog'
import { Building2, History, Table2 } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

function formatMarginPct(margin: { toNumber(): number } | null): string {
  if (!margin) return '—'
  return `${Math.round(margin.toNumber() * 100)}%`
}

export default async function DashboardPage() {
  // TODO(evon): once auth is wired, replace getActiveBuilding() with the admin's selected
  // building (requireBuildingAdmin() + building switcher).
  const building = await getActiveBuilding()

  if (!building) {
    return (
      <div className="evk-page">
        <div className="evk-page__head">
          <div>
            <p className="evk-eyebrow">Resumen</p>
            <h1 className="evk-h1">Sin consorcios cargados</h1>
          </div>
        </div>
        <div className="evk-empty">
          <Building2 size={26} strokeWidth={1.9} />
          <p>Agregá un consorcio para empezar.</p>
          <span>El piloto se configura desde la sección Consorcios.</span>
        </div>
      </div>
    )
  }

  const selectedPeriod = await getActivePeriod()
  const monthLabel = MONTH_NAMES[selectedPeriod.month - 1]
  const summary = await getDashboardSummary(building.id, selectedPeriod)
  const { period, tariff, rows, totals } = summary

  const periodEndStr = period
    ? period.periodEnd.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
    : null

  const periodBadge = period ? (
    period.status === 'open' ||
    period.status === 'processing' ||
    period.status === 'pending_review' ? (
      <Badge tone="warning" dot>
        Borrador{periodEndStr ? ` · cierra el ${periodEndStr}` : ''}
      </Badge>
    ) : period.status === 'approved' || period.status === 'exported' ? (
      <Badge tone="success" dot>
        Aprobado
      </Badge>
    ) : (
      <Badge tone="danger" dot>
        Falló el cierre
      </Badge>
    )
  ) : (
    <Badge tone="neutral" dot>
      Sin período abierto
    </Badge>
  )

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">Período activo</p>
          <h1 className="evk-h1">Resumen de {monthLabel}</h1>
        </div>
        {periodBadge}
      </div>

      {totals.missing > 0 && (
        <Alert tone="warning" title={`${totals.missing} dispositivos sin lectura`}>
          Revisá la conexión de los disyuntores antes de generar el archivo del período.
        </Alert>
      )}

      <div className="evk-stats">
        <Card padded>
          <Stat label="Consumo del período" value={fmtNum(totals.kwh.toNumber())} unit="kWh" />
        </Card>
        <Card padded>
          <Stat label="Importe a cobrar" value={fmtMoney(totals.importe.toNumber())} mono />
        </Card>
        <Card padded>
          <Stat
            label="Dispositivos con lectura"
            value={`${totals.read} / ${totals.total}`}
            footnote={`${totals.missing} sin lectura`}
          />
        </Card>
        <Card padded>
          <Stat
            label="Tarifa aplicada"
            value={tariff ? fmtMoney(tariff.pricePerKwh.toNumber()) : '—'}
            mono
            unit="/kWh"
            footnote={tariff ? building.distribuidora : 'Sin tarifa vigente'}
          />
        </Card>
      </div>

      <div className="evk-grid-2">
        <Card
          title={
            period
              ? `Período de ${monthLabel} ${selectedPeriod.year}`
              : `Sin período abierto para ${monthLabel}`
          }
          subtitle={`${totals.total} dispositivos · margen ${formatMarginPct(tariff?.margin ?? null)}`}
          action={
            period && periodEndStr ? <Badge tone="brand">CSV listo al {periodEndStr}</Badge> : null
          }
          footer={
            <>
              <Link href="/periods">
                <Button iconLeft={<Table2 size={17} strokeWidth={1.9} />}>Revisar y generar</Button>
              </Link>
              <Link href="/periods/history">
                <Button variant="ghost" iconLeft={<History size={17} strokeWidth={1.9} />}>
                  Ver períodos anteriores
                </Button>
              </Link>
            </>
          }
        >
          <div className="evk-progress-block">
            <ProgressBar
              label="Lecturas sincronizadas"
              value={totals.read}
              max={Math.max(totals.total, 1)}
              showValue
              valueText={`${totals.read} / ${totals.total}`}
            />
            <ProgressBar
              label="Unidades con consumo registrado"
              value={totals.read}
              max={Math.max(totals.total, 1)}
              tone="volt"
              showValue
            />
          </div>
          <p className="evk-note">
            El día 1 del próximo mes Evon te envía el CSV por email, listo para importar como
            concepto variable en tu software de expensas.
          </p>
        </Card>

        <Card
          title="Actividad de dispositivos"
          subtitle={`${totals.total} disyuntores en ${building.name}`}
          action={
            <Link href="/devices">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          }
        >
          {rows.length === 0 ? (
            <div className="evk-empty" style={{ padding: '40px 20px' }}>
              <Building2 size={22} strokeWidth={1.9} />
              <p>Sin disyuntores cargados.</p>
              <span>Agregá el primer dispositivo desde la sección Dispositivos.</span>
            </div>
          ) : (
            <ul className="evk-devlist">
              {rows.slice(0, 5).map((d) => (
                <li key={d.id} className="evk-devlist__row">
                  <span className="evk-devlist__uf">{d.uf}</span>
                  <span className="evk-mono evk-devlist__id">{d.providerDeviceId}</span>
                  <StatusDot
                    status={d.status}
                    label={
                      d.status === 'offline'
                        ? 'Sin conexión'
                        : d.status === 'idle'
                          ? 'Inactivo'
                          : 'En línea'
                    }
                  />
                  <span className="evk-mono evk-devlist__kwh">
                    {d.kwh == null ? '—' : `${fmtNum(d.kwh.toNumber())} kWh`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
