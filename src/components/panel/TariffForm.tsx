'use client'

import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { Input } from '@/components/ds/Input'
import Link from 'next/link'
import { useState } from 'react'

type Tariff = {
  id: string
  distribuidora: string
  pricePerKwh: string | { toString(): string }
  margin: string | { toString(): string }
  effectiveFrom: string | Date
}

type Props = {
  initial?: Tariff
  action: (formData: FormData) => Promise<unknown>
  submitLabel: string
}

function dateInputValue(d: string | Date | undefined): string {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return ''
  // YYYY-MM-DD for the date input, using UTC so a tariff with effective_from at UTC midnight
  // displays as the same calendar day everywhere.
  return date.toISOString().slice(0, 10)
}

export function TariffForm({ initial, action, submitLabel }: Props) {
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
          name="pricePerKwh"
          label="Precio por kWh (ARS)"
          defaultValue={initial?.pricePerKwh?.toString() ?? ''}
          required
          mono
          placeholder="84.020000"
          hint="Hasta 6 decimales. Aceptamos coma o punto como separador."
        />
        <Input
          name="margin"
          label="Margen del consorcio (fracción)"
          defaultValue={initial?.margin?.toString() ?? '0'}
          required
          mono
          placeholder="0.08"
          hint="0.08 = 8 %. MVP usa 0 por defecto; el chip del período sobreescribe al aprobar."
        />
        <Input
          name="effectiveFrom"
          label="Vigente desde"
          type="date"
          defaultValue={dateInputValue(initial?.effectiveFrom)}
          required
          hint="Se aplica al período de cada lectura cuya fecha sea posterior."
        />

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Button type="submit" loading={pending}>
            {submitLabel}
          </Button>
          <Link href="/tariffs">
            <Button variant="ghost" type="button">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </Card>
  )
}
