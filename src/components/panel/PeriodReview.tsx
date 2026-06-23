'use client'
import type { PeriodMutationResult } from '@/app/(panel)/periods/actions'
import { Alert } from '@/components/ds/Alert'
import { Badge } from '@/components/ds/Badge'
import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { Tag } from '@/components/ds/Tag'
import { usePanelChrome } from '@/components/panel/PanelChromeProvider'
import { fmtMoney, fmtNum } from '@/lib/format'
import { type StepPhase, getPeriodPageTitle, getPeriodStepPhases } from '@/lib/period-steps'
import type { PeriodReview } from '@/server/billing'
import type { PeriodStatus } from '@prisma/client'
import { Check, CheckCircle2, Cpu, Download, FunctionSquare, Undo2 } from 'lucide-react'
import { useEffect, useMemo, useState, useTransition } from 'react'

type ApproveAction = (formData: FormData) => Promise<PeriodMutationResult>
type UnapproveAction = (formData: FormData) => Promise<PeriodMutationResult>

const MARGIN_OPTIONS = [0, 0.05, 0.08, 0.12] as const

/**
 * Display-only recomputation as the user toggles the margin chip.
 *
 * Server-side billing uses Prisma.Decimal end-to-end (see src/lib/money.ts and
 * src/server/billing). Here we are previewing what the totals would look like — accuracy
 * to the cent doesn't matter, and we don't want to ship decimal.js to the browser. Number
 * arithmetic is fine; we round to integer pesos which matches fmtMoney's display rounding.
 */

const STATUS_LABEL: Record<NonNullable<PeriodReview['period']>['status'], string> = {
  open: 'Abierto',
  processing: 'Procesando',
  pending_review: 'En revisión',
  approved: 'Aprobado',
  exported: 'Exportado',
  failed: 'Falló',
}

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

type Props = {
  data: PeriodReview
  approveAction: ApproveAction
  unapproveAction: UnapproveAction
  /** The calendar month the page was rendered for — needed to upsert a period if none exists. */
  currentMonth: { year: number; month: number }
}

function stepClass(phase: StepPhase): string {
  if (phase === 'done') return 'evk-step is-done'
  if (phase === 'current') return 'evk-step is-current'
  return 'evk-step'
}

function PeriodStepBar({ status }: { status: PeriodStatus | null }) {
  const steps = getPeriodStepPhases(status ?? null)

  return (
    <div className="evk-steps">
      <span className={stepClass(steps.lectura)}>
        {steps.lectura === 'done' ? (
          <>
            <Check size={14} strokeWidth={2.2} /> Lectura
          </>
        ) : (
          'Lectura'
        )}
      </span>
      <span className={stepClass(steps.revision)}>
        {steps.revision === 'done' ? (
          <>
            <Check size={14} strokeWidth={2.2} /> Revisión
          </>
        ) : (
          '2 · Revisión'
        )}
      </span>
      <span className={stepClass(steps.importar)}>
        {steps.importar === 'done' ? (
          <>
            <Check size={14} strokeWidth={2.2} /> Importar
          </>
        ) : (
          '3 · Importar'
        )}
      </span>
    </div>
  )
}

export function PeriodReviewScreen({ data, approveAction, unapproveAction, currentMonth }: Props) {
  const { adjustPendingPeriodCount } = usePanelChrome()
  const { building, period, tariff, rows, totals } = data
  const [periodStatus, setPeriodStatus] = useState<PeriodStatus | null>(period?.status ?? null)

  useEffect(() => {
    setPeriodStatus(period?.status ?? null)
  }, [period?.status])
  const tariffMarginDefault = tariff ? Number.parseFloat(tariff.margin) : 0.08
  const [margin, setMargin] = useState<number>(
    MARGIN_OPTIONS.includes(tariffMarginDefault as (typeof MARGIN_OPTIONS)[number])
      ? tariffMarginDefault
      : 0.08,
  )
  const [isApproving, startApprove] = useTransition()
  const [isUnapproving, startUnapprove] = useTransition()
  const [approveError, setApproveError] = useState<string | null>(null)
  const [unapproveError, setUnapproveError] = useState<string | null>(null)
  const isApproved = periodStatus === 'approved' || periodStatus === 'exported'
  const isExported = periodStatus === 'exported'
  const isLocked = isApproved
  const canApprove = !isApproved && totals.total > 0
  const canUnapprove = periodStatus === 'approved'
  const canDownload = totals.withReading > 0 || isApproved
  const pageTitle = getPeriodPageTitle(periodStatus)

  const csvHref = period
    ? `/api/periods/${period.id}/csv${isApproved ? '' : `?margin=${margin}`}`
    : null

  function periodFormData(): FormData {
    const fd = new FormData()
    fd.set('buildingId', building.id)
    fd.set('year', String(currentMonth.year))
    fd.set('month', String(currentMonth.month))
    return fd
  }

  function handleApprove() {
    setApproveError(null)
    const fd = periodFormData()
    fd.set('margin', String(margin))
    startApprove(async () => {
      const res = await approveAction(fd)
      if (!res.ok) {
        setApproveError(res.error)
        return
      }
      setPeriodStatus(res.periodStatus)
      adjustPendingPeriodCount(res.pendingPeriodDelta)
    })
  }

  function handleUnapprove() {
    setUnapproveError(null)
    startUnapprove(async () => {
      const res = await unapproveAction(periodFormData())
      if (!res.ok) {
        setUnapproveError(res.error)
        return
      }
      setPeriodStatus(res.periodStatus)
      adjustPendingPeriodCount(res.pendingPeriodDelta)
    })
  }

  const pricePerKwh = tariff ? Number.parseFloat(tariff.pricePerKwh) : null

  const computed = useMemo(
    () =>
      rows.map((r) => {
        const kwh = r.kwh != null ? Number.parseFloat(r.kwh) : null
        const importe =
          kwh != null && pricePerKwh != null ? Math.round(kwh * pricePerKwh * (1 + margin)) : null
        return { ...r, kwhNum: kwh, importeNum: importe }
      }),
    [rows, pricePerKwh, margin],
  )

  const totalKwh = computed.reduce((s, r) => (r.kwhNum != null ? s + r.kwhNum : s), 0)
  const totalImporte = computed.reduce((s, r) => (r.importeNum != null ? s + r.importeNum : s), 0)

  const periodMonthLabel = period
    ? `${MONTH_LABELS[period.month - 1]} ${period.year}`
    : `${MONTH_LABELS[new Date().getUTCMonth()]} ${new Date().getUTCFullYear()}`

  const periodEndStr = period
    ? new Date(period.periodEnd).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
    : null

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">
            {building.name} · Período · {periodMonthLabel}
          </p>
          <h1 className="evk-h1">{pageTitle}</h1>
        </div>
        <PeriodStepBar status={periodStatus} />
      </div>

      {!period && (
        <Card padded>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            No hay período abierto para {periodMonthLabel}. Aprobando se abre y se cierra en un solo
            paso. También podés revisar los dispositivos en{' '}
            <a href="/devices" style={{ color: 'var(--text-link)' }}>
              Dispositivos
            </a>
            .
          </p>
        </Card>
      )}

      {approveError && (
        <Alert tone="danger" title="No se pudo aprobar el período">
          {approveError}
        </Alert>
      )}

      {unapproveError && (
        <Alert tone="danger" title="No se pudo deshacer la aprobación">
          {unapproveError}
        </Alert>
      )}

      {periodStatus === 'approved' && (
        <Alert tone="success" title="Período aprobado">
          El CSV ya quedó congelado con los importes finales. Podés descargarlo abajo o deshacer la
          aprobación para ajustar el margen.
        </Alert>
      )}

      {isExported && (
        <Alert tone="success" title="Período exportado">
          El CSV ya fue importado en tu software de expensas. Este período no se puede modificar.
        </Alert>
      )}

      <div className="evk-runbar">
        <div className="evk-runbar__metrics">
          <div>
            <span className="evk-runbar__k">Consumo total</span>
            <span className="evk-runbar__v evk-mono">{fmtNum(totalKwh)} kWh</span>
          </div>
          <div>
            <span className="evk-runbar__k">
              Tarifa {tariff ? tariff.distribuidora : building.distribuidora}
            </span>
            <span className="evk-runbar__v evk-mono">
              {tariff ? `${fmtMoney(Number.parseFloat(tariff.pricePerKwh))} /kWh` : 'Sin tarifa'}
            </span>
          </div>
          <div className="evk-margin">
            <span className="evk-runbar__k">Margen del consorcio</span>
            <div className="evk-margin__ctrl">
              {MARGIN_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`evk-chip${margin === m ? ' is-on' : ''}`}
                  disabled={isLocked}
                  onClick={() => setMargin(m)}
                >
                  {Math.round(m * 100)}%
                </button>
              ))}
            </div>
          </div>
          <div className="evk-runbar__total">
            <span className="evk-runbar__k">Total a cobrar</span>
            <span className="evk-runbar__v evk-runbar__big evk-mono">{fmtMoney(totalImporte)}</span>
          </div>
        </div>
      </div>

      <Card
        title="Detalle por unidad funcional"
        subtitle={
          period
            ? `${totals.withReading} de ${totals.total} unidades con lectura válida · estado: ${STATUS_LABEL[period.status]}`
            : `${totals.total} unidades · sin período abierto todavía`
        }
        action={
          <span className="evk-formula">
            <span className="evk-formula__pill" title="kWh × tarifa × (1 + margen)">
              <FunctionSquare size={15} strokeWidth={1.9} /> Cómo se calcula
            </span>
          </span>
        }
        footer={
          <>
            {csvHref ? (
              <a href={csvHref} download style={{ textDecoration: 'none' }}>
                <Button
                  type="button"
                  variant="secondary"
                  iconLeft={<Download size={17} strokeWidth={1.9} />}
                  disabled={!canDownload}
                >
                  Descargar CSV
                </Button>
              </a>
            ) : (
              <Button
                type="button"
                variant="secondary"
                iconLeft={<Download size={17} strokeWidth={1.9} />}
                disabled
              >
                Descargar CSV
              </Button>
            )}
            <Button
              type="button"
              iconLeft={<CheckCircle2 size={17} strokeWidth={1.9} />}
              disabled={!canApprove}
              loading={isApproving}
              onClick={handleApprove}
            >
              {isApproved ? 'Período aprobado' : 'Aprobar e importar'}
            </Button>
            {canUnapprove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                iconLeft={<Undo2 size={17} strokeWidth={1.9} />}
                disabled={isUnapproving}
                loading={isUnapproving}
                onClick={handleUnapprove}
                aria-label="Deshacer aprobación"
                title="Deshacer aprobación"
              />
            )}
            <span className="evk-foot-note">
              {periodEndStr && `El cierre se programa el ${periodEndStr}.`}
            </span>
          </>
        }
      >
        <div className="evk-tablewrap">
          <table className="evk-table">
            <thead>
              <tr>
                <th>UF</th>
                <th>Dispositivo</th>
                <th className="num">Lectura inicial</th>
                <th className="num">Lectura final</th>
                <th className="num">Consumo</th>
                <th className="num">Importe</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {computed.map((d) => (
                <tr key={d.deviceId} className={d.kwh == null ? 'is-missing' : ''}>
                  <td className="evk-table__uf">{d.uf}</td>
                  <td>
                    <Tag mono icon={<Cpu size={14} strokeWidth={1.9} />}>
                      {d.providerDeviceId}
                    </Tag>
                  </td>
                  <td className="num evk-mono">
                    {d.counterStart == null ? '—' : fmtNum(Number.parseFloat(d.counterStart))}
                  </td>
                  <td className="num evk-mono">
                    {d.counterEnd == null ? '—' : fmtNum(Number.parseFloat(d.counterEnd))}
                  </td>
                  <td className="num evk-mono strong">
                    {d.kwhNum == null ? '—' : fmtNum(d.kwhNum)}
                  </td>
                  <td className="num evk-mono strong">
                    {d.importeNum == null ? '—' : fmtMoney(d.importeNum)}
                  </td>
                  <td>
                    {d.kwh == null ? (
                      <Badge tone="danger" dot>
                        Sin lectura
                      </Badge>
                    ) : (
                      <Badge tone="success" dot>
                        Validado
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
              {computed.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px 0' }}>
                    Sin dispositivos cargados en este consorcio todavía.
                  </td>
                </tr>
              )}
            </tbody>
            {computed.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4}>Total del período · {totals.withReading} unidades</td>
                  <td className="num evk-mono strong">{fmtNum(totalKwh)}</td>
                  <td className="num evk-mono strong">{fmtMoney(totalImporte)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  )
}
