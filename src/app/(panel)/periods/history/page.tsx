import { Badge, type BadgeTone } from '@/components/ds/Badge'
import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { fmtMoney, fmtNum } from '@/lib/format'
import { listPeriodHistory } from '@/server/billing'
import { getActiveBuilding } from '@/server/catalog'
import type { PeriodStatus } from '@prisma/client'
import { ArrowRight, Building2, CalendarCheck2 } from 'lucide-react'
import Link from 'next/link'
import { OpenPeriodLink } from './open-period-link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Períodos · Evon' }

const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const STATUS_TONE: Record<PeriodStatus, BadgeTone> = {
  open: 'warning',
  processing: 'warning',
  pending_review: 'warning',
  approved: 'success',
  exported: 'success',
  failed: 'danger',
}

const STATUS_LABEL: Record<PeriodStatus, string> = {
  open: 'Borrador',
  processing: 'Procesando',
  pending_review: 'En revisión',
  approved: 'Aprobado',
  exported: 'Exportado',
  failed: 'Falló',
}

export default async function PeriodHistoryPage() {
  const building = await getActiveBuilding()
  if (!building) {
    return (
      <div className="evk-page">
        <div className="evk-page__head">
          <div>
            <p className="evk-eyebrow">Históricos</p>
            <h1 className="evk-h1">Sin consorcios cargados</h1>
          </div>
        </div>
        <div className="evk-empty">
          <Building2 size={26} strokeWidth={1.9} />
          <p>Agregá un consorcio antes de revisar períodos.</p>
        </div>
      </div>
    )
  }

  const rows = await listPeriodHistory(building.id)

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">{building.name}</p>
          <h1 className="evk-h1">Históricos de períodos</h1>
        </div>
        <Link href="/periods">
          <Button variant="secondary">Ver período activo</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="evk-empty">
          <CalendarCheck2 size={26} strokeWidth={1.9} />
          <p>Todavía no hay períodos cerrados.</p>
          <span>El cierre automático corre el día 1 de cada mes (06:00 UTC).</span>
        </div>
      ) : (
        <Card title={`${rows.length} períodos`} subtitle="Ordenados por más recientes primero">
          <div className="evk-tablewrap">
            <table className="evk-table">
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Estado</th>
                  <th className="num">Lecturas</th>
                  <th className="num">Líneas CSV</th>
                  <th className="num">Consumo</th>
                  <th className="num">Importe</th>
                  <th>Aprobado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td className="evk-table__uf">
                      {MONTH_LABELS[p.month - 1]} {p.year}
                    </td>
                    <td>
                      <Badge tone={STATUS_TONE[p.status]} dot>
                        {STATUS_LABEL[p.status]}
                      </Badge>
                    </td>
                    <td className="num evk-mono">{p.readingCount}</td>
                    <td className="num evk-mono">{p.lineCount}</td>
                    <td className="num evk-mono">
                      {p.lineCount > 0 ? `${fmtNum(p.totalKwh.toNumber())} kWh` : '—'}
                    </td>
                    <td className="num evk-mono strong">
                      {p.lineCount > 0 ? fmtMoney(p.totalImporte.toNumber()) : '—'}
                    </td>
                    <td className="evk-muted">
                      {p.approvedAt
                        ? p.approvedAt.toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="num">
                      <OpenPeriodLink year={p.year} month={p.month}>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          iconRight={<ArrowRight size={14} strokeWidth={1.9} />}
                        >
                          Ver
                        </Button>
                      </OpenPeriodLink>
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
