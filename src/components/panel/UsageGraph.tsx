'use client'

import { useState } from 'react'

type Granularity = 'day' | 'week' | 'month'
type Bucket = { key: string; label: string; kwh: number }

type Props = {
  series: Record<Granularity, Bucket[]>
}

const TABS: Array<{ g: Granularity; label: string }> = [
  { g: 'day', label: 'Diario' },
  { g: 'week', label: 'Semanal' },
  { g: 'month', label: 'Mensual' },
]

/**
 * Per-period consumption as simple CSS bars. No chart dependency: the bar heights are just
 * percentages of the largest bucket. The three granularities are precomputed server-side, so the
 * toggle is a pure client switch with no round-trip.
 */
export function UsageGraph({ series }: Props) {
  const [granularity, setGranularity] = useState<Granularity>('day')
  const buckets = series[granularity]
  const max = buckets.reduce((m, b) => Math.max(m, b.kwh), 0)

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {TABS.map((t) => (
          <button
            key={t.g}
            type="button"
            onClick={() => setGranularity(t.g)}
            className="evon-btn evon-btn--sm"
            style={{
              background: granularity === t.g ? 'var(--brand)' : 'var(--surface-2, transparent)',
              color: granularity === t.g ? 'var(--brand-on)' : 'var(--text-secondary)',
              border: granularity === t.g ? 'none' : '1px solid var(--border)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {buckets.length === 0 ? (
        <div className="evk-empty" style={{ padding: '40px 20px' }}>
          <p>Sin datos suficientes para el gráfico.</p>
          <span>Hacen falta al menos dos lecturas. Se va llenando con cada lectura diaria.</span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 6,
            height: 180,
            paddingTop: 8,
          }}
        >
          {buckets.map((b) => {
            const pct = max > 0 ? Math.max(2, Math.round((b.kwh / max) * 100)) : 2
            return (
              <div
                key={b.key}
                title={`${b.label}: ${b.kwh.toFixed(3)} kWh`}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  height: '100%',
                  justifyContent: 'flex-end',
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${pct}%`,
                    background: 'var(--brand)',
                    borderRadius: '4px 4px 0 0',
                  }}
                />
                <span
                  style={{
                    fontSize: 'var(--text-2xs)',
                    color: 'var(--text-tertiary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {b.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
