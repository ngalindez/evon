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

// Credential fields per provider. The form assembles these into the JSON the server expects
// (credentialsPlaintext), so the server/encryption contract is unchanged.
type CredField = { name: string; label: string; type?: string; placeholder?: string }

const CREDENTIAL_FIELDS: Record<Provider, CredField[]> = {
  tuya: [
    { name: 'accessKey', label: 'Access Key (Client ID)', placeholder: 'your-client-id' },
    { name: 'secretKey', label: 'Secret Key (Client Secret)', type: 'password' },
  ],
  shelly: [
    { name: 'email', label: 'Email', placeholder: 'admin@evon.com.ar' },
    { name: 'token', label: 'Token', type: 'password' },
  ],
  ewelink: [
    { name: 'email', label: 'Email', placeholder: 'admin@evon.com.ar' },
    { name: 'password', label: 'Contraseña', type: 'password' },
  ],
}

export function ConnectionForm({ initial, action, submitLabel, buildingId, mode }: Props) {
  const [pending, setPending] = useState(false)
  // Empty until a provider is chosen (so the credential fields stay hidden on a fresh create).
  const [provider, setProvider] = useState<Provider | ''>(initial?.provider ?? '')
  const [error, setError] = useState<string | null>(null)

  return (
    <Card padded>
      {error && (
        <div
          style={{
            background: 'var(--danger-soft)',
            color: 'var(--danger-text)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            marginBottom: 18,
          }}
        >
          {error}
        </div>
      )}
      <form
        action={async (fd) => {
          setError(null)
          // Assemble the per-provider fields into the credentialsPlaintext JSON the server reads.
          // In edit mode, all-blank means "keep the existing credentials" (we never decrypt to
          // prefill), so we only set credentialsPlaintext when at least one field is filled.
          const creds: Record<string, string> = {}
          let anyFilled = false
          for (const f of provider ? CREDENTIAL_FIELDS[provider] : []) {
            const v = (fd.get(`cred_${f.name}`)?.toString() ?? '').trim()
            if (v) anyFilled = true
            creds[f.name] = v
            fd.delete(`cred_${f.name}`)
          }
          if (anyFilled) fd.set('credentialsPlaintext', JSON.stringify(creds))
          setPending(true)
          try {
            const res = (await action(fd)) as { ok?: boolean; error?: string } | undefined
            if (res && res.ok === false) {
              setError(res.error ?? 'No se pudo guardar la conexión')
            }
          } finally {
            setPending(false)
          }
        }}
        autoComplete="off"
        style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <div className="evon-field">
          <label className="evon-field__label" htmlFor="provider">
            Fabricante
          </label>
          <select
            id="provider"
            name="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider | '')}
            className="evon-select"
            required
          >
            <option value="" disabled>
              Seleccioná un fabricante…
            </option>
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

        {provider && (
          <div className="evon-field" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span className="evon-field__label">
              Credenciales del cloud {mode === 'create' && <span className="req">*</span>}
            </span>
            {CREDENTIAL_FIELDS[provider].map((f) => (
              <Input
                key={`${provider}-${f.name}`}
                name={`cred_${f.name}`}
                label={f.label}
                type={f.type ?? 'text'}
                placeholder={f.placeholder}
                required={mode === 'create'}
                // Chrome ignores autoComplete="off" next to a password field (looks like a login);
                // "new-password" on secrets suppresses the saved-login dropdown. data-* opt out of
                // 1Password / LastPass.
                autoComplete={f.type === 'password' ? 'new-password' : 'off'}
                data-1p-ignore=""
                data-lpignore="true"
              />
            ))}
            <span className="evon-field__hint">
              Se encripta con AES-256-GCM antes de guardarse.{' '}
              {mode === 'edit' && 'Dejá los campos vacíos para mantener las credenciales actuales.'}
            </span>
          </div>
        )}

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
