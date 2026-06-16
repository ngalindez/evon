import type { PeriodStatus } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import { getPeriodPageTitle, getPeriodStepPhases } from './period-steps'

describe('getPeriodStepPhases', () => {
  it('marks all steps pending when there is no period', () => {
    expect(getPeriodStepPhases(null)).toEqual({
      lectura: 'pending',
      revision: 'pending',
      importar: 'pending',
    })
  })

  it('marks lectura pending before readings are ready', () => {
    expect(getPeriodStepPhases('open')).toEqual({
      lectura: 'pending',
      revision: 'pending',
      importar: 'pending',
    })
  })

  it('marks lectura current while processing', () => {
    expect(getPeriodStepPhases('processing')).toEqual({
      lectura: 'current',
      revision: 'pending',
      importar: 'pending',
    })
  })

  it('marks revision current when the period is ready to review', () => {
    expect(getPeriodStepPhases('pending_review')).toEqual({
      lectura: 'done',
      revision: 'current',
      importar: 'pending',
    })
  })

  it('marks importar current after approval', () => {
    expect(getPeriodStepPhases('approved')).toEqual({
      lectura: 'done',
      revision: 'done',
      importar: 'current',
    })
  })

  it('marks all steps done after export', () => {
    expect(getPeriodStepPhases('exported')).toEqual({
      lectura: 'done',
      revision: 'done',
      importar: 'done',
    })
  })

  it('covers every period status', () => {
    const statuses: PeriodStatus[] = [
      'open',
      'processing',
      'pending_review',
      'approved',
      'exported',
      'failed',
    ]
    for (const status of statuses) {
      expect(getPeriodStepPhases(status)).toBeDefined()
    }
  })
})

describe('getPeriodPageTitle', () => {
  it('uses the review title before approval', () => {
    expect(getPeriodPageTitle(null)).toBe('Revisar consumo de carga')
    expect(getPeriodPageTitle('pending_review')).toBe('Revisar consumo de carga')
  })

  it('uses the import title after approval', () => {
    expect(getPeriodPageTitle('approved')).toBe('Importar CSV')
  })

  it('uses the exported title after import', () => {
    expect(getPeriodPageTitle('exported')).toBe('Período exportado')
  })
})
