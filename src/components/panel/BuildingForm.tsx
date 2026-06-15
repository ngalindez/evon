'use client'

import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { Input } from '@/components/ds/Input'
import Link from 'next/link'
import { useState } from 'react'

type Building = {
  id: string
  name: string
  address: string | null
  distribuidora: string
  exportProfile: string
  timezone: string
}

type Props = {
  initial?: Building
  action: (formData: FormData) => Promise<unknown>
  submitLabel: string
}

export function BuildingForm({ initial, action, submitLabel }: Props) {
  const [pending, setPending] = useState(false)

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
        <Input
          name="name"
          label="Nombre del consorcio"
          defaultValue={initial?.name ?? ''}
          required
          placeholder="Torres del Río"
        />
        <Input
          name="address"
          label="Dirección"
          defaultValue={initial?.address ?? ''}
          placeholder="Av. Libertador 4820"
        />
        <div>
          <Input
            name="distribuidora"
            label="Distribuidora"
            defaultValue={initial?.distribuidora ?? ''}
            required
            placeholder="EDESUR o EDENOR"
            list="distribuidoras"
          />
          <datalist id="distribuidoras">
            <option value="EDESUR" />
            <option value="EDENOR" />
          </datalist>
        </div>
        <Input
          name="exportProfile"
          label="Perfil de exportación CSV"
          defaultValue={initial?.exportProfile ?? 'generic'}
          hint="Por ahora solo 'generic'. Otros perfiles llegan cuando se confirme el software del piloto."
          required
        />
        <Input
          name="timezone"
          label="Zona horaria"
          defaultValue={initial?.timezone ?? 'America/Argentina/Buenos_Aires'}
          required
        />

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Button type="submit" loading={pending}>
            {submitLabel}
          </Button>
          <Link href="/buildings">
            <Button variant="ghost" type="button">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </Card>
  )
}
