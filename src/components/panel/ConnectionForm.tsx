'use client'

import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { Input } from '@/components/ds/Input'
import type { Provider } from '@prisma/client'
import Link from 'next/link'
import { useState } from 'react'

type Connection = {
  provider: Provider
  label: string | null
}

type Props = {
  initial?: Connection
  action: (formData: FormData) => Promise<unknown>
  submitLabel: string
  buildingId: string
  mode: 'create' | 'edit'
}

const PROVIDERS: Array<{ value: Provider; label: string }> = [
  { value: 'shelly', label: 'Shelly' },
  { value: 'tuya', label: 'Tuya' },
  { value: 'ewelink', label: 'eWeLink' },
]

const SAMPLE_PLACEHOLDERS: Record<Provider, string> = {
  shelly: '{"email": "admin@evon.com.ar", "token": "..."}',
  tuya: '{"accessKey": "...", "secretKey": "..."}',
  ewelink: '{"email": "...", "password": "..."}',
}

export function ConnectionForm({ initial, action, submitLabel, buildingId, mode }: Props) {
  const [pending, setPending] = useState(false)
  const [provider, setProvider] = useState<Provider>(initial?.provider ?? 'shelly')

  return (
    <Card padded>
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
          <label className="evon-field__label" htmlFor="provider">
            Fabricante
          </label>
          <select
            id="provider"
            name="provider"
            defaultValue={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            className="evon-select"
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          name="label"
          label="Etiqueta"
          defaultValue={initial?.label ?? ''}
          placeholder="p. ej. 'Shelly Cloud — Torres del Río'"
        />

        <div className="evon-field">
          <label className="evon-field__label" htmlFor="credentialsPlaintext">
            Credenciales del cloud {mode === 'create' && <span className="req">*</span>}
          </label>
          <textarea
            id="credentialsPlaintext"
            name="credentialsPlaintext"
            placeholder={SAMPLE_PLACEHOLDERS[provider]}
            rows={5}
            className="evon-textarea"
            required={mode === 'create'}
          />
          <span className="evon-field__hint">
            JSON con la credencial del fabricante. Se encripta con AES-256-GCM antes de guardarse.{' '}
            {mode === 'edit' && 'Dejá vacío para mantener la actual.'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Button type="submit" loading={pending}>
            {submitLabel}
          </Button>
          <Link href={`/buildings/${buildingId}/connections`}>
            <Button variant="ghost" type="button">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </Card>
  )
}
