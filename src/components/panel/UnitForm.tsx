'use client'

import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { Input } from '@/components/ds/Input'
import Link from 'next/link'
import { useState } from 'react'

type Unit = {
  label: string
  ownerName: string | null
  externalRef: string | null
}

type Props = {
  initial?: Unit
  action: (formData: FormData) => Promise<unknown>
  submitLabel: string
  buildingId: string
}

export function UnitForm({ initial, action, submitLabel, buildingId }: Props) {
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
          name="label"
          label="Etiqueta"
          defaultValue={initial?.label ?? ''}
          required
          placeholder="3.º B / Cochera 12 / PB 2"
        />
        <Input
          name="ownerName"
          label="Propietario"
          defaultValue={initial?.ownerName ?? ''}
          placeholder="Nombre opcional"
        />
        <Input
          name="externalRef"
          label="Referencia en el software de expensas"
          defaultValue={initial?.externalRef ?? ''}
          placeholder="Clave para matchear el CSV (opcional)"
          hint="Si está vacía, el CSV usa la etiqueta como identificador."
          mono
        />

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Button type="submit" loading={pending}>
            {submitLabel}
          </Button>
          <Link href={`/buildings/${buildingId}/units`}>
            <Button variant="ghost" type="button">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </Card>
  )
}
