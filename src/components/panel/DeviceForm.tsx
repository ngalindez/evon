'use client'

import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { Input } from '@/components/ds/Input'
import Link from 'next/link'
import { useState } from 'react'

type Unit = { id: string; label: string }
type Connection = { id: string; provider: string; label: string | null }

type Device = {
  unitId: string
  connectionId: string
  providerDeviceId: string
  label: string | null
}

type Props = {
  initial?: Device
  units: Unit[]
  connections: Connection[]
  action: (formData: FormData) => Promise<unknown>
  submitLabel: string
  cancelHref: string
}

const PROVIDER_LABEL: Record<string, string> = {
  shelly: 'Shelly',
  tuya: 'Tuya',
  ewelink: 'eWeLink',
}

function connectionLabel(c: Connection): string {
  const provider = PROVIDER_LABEL[c.provider] ?? c.provider
  return c.label ? `${c.label} (${provider})` : provider
}

export function DeviceForm({
  initial,
  units,
  connections,
  action,
  submitLabel,
  cancelHref,
}: Props) {
  const [pending, setPending] = useState(false)
  const noUnits = units.length === 0
  const noConnections = connections.length === 0
  const blocked = noUnits || noConnections

  return (
    <Card padded>
      {blocked && (
        <div
          style={{
            background: 'var(--warning-soft)',
            color: 'var(--warning-text)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            marginBottom: 18,
          }}
        >
          {noUnits && <p style={{ margin: 0 }}>Cargá al menos una unidad antes de un disyuntor.</p>}
          {noConnections && (
            <p style={{ margin: 0 }}>Cargá una conexión al cloud antes de un disyuntor.</p>
          )}
        </div>
      )}

      <form
        action={async (fd) => {
          setPending(true)
          try {
            await action(fd)
          } finally {
            setPending(false)
          }
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <div className="evon-field">
          <label className="evon-field__label" htmlFor="unitId">
            Unidad funcional
          </label>
          <select
            id="unitId"
            name="unitId"
            defaultValue={initial?.unitId ?? ''}
            className="evon-select"
            required
            disabled={noUnits}
          >
            <option value="" disabled>
              Seleccionar…
            </option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        <div className="evon-field">
          <label className="evon-field__label" htmlFor="connectionId">
            Conexión al cloud
          </label>
          <select
            id="connectionId"
            name="connectionId"
            defaultValue={initial?.connectionId ?? ''}
            className="evon-select"
            required
            disabled={noConnections}
          >
            <option value="" disabled>
              Seleccionar…
            </option>
            {connections.map((c) => (
              <option key={c.id} value={c.id}>
                {connectionLabel(c)}
              </option>
            ))}
          </select>
        </div>

        <Input
          name="providerDeviceId"
          label="Device ID del cloud"
          defaultValue={initial?.providerDeviceId ?? ''}
          required
          mono
          placeholder="shelly-1a2b"
          hint="Identificador con el que el cloud direcciona este disyuntor."
        />

        <Input
          name="label"
          label="Etiqueta"
          defaultValue={initial?.label ?? ''}
          placeholder="Opcional. p. ej. 'Disyuntor cochera 3.º B'"
        />

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Button type="submit" loading={pending} disabled={blocked}>
            {submitLabel}
          </Button>
          <Link href={cancelHref}>
            <Button variant="ghost" type="button">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </Card>
  )
}
