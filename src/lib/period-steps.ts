import type { PeriodStatus } from '@prisma/client'

export type StepPhase = 'pending' | 'current' | 'done'

export type PeriodStepPhases = {
  lectura: StepPhase
  revision: StepPhase
  importar: StepPhase
}

/** Maps billing-period status to the three UI stepper phases. */
export function getPeriodStepPhases(status: PeriodStatus | null): PeriodStepPhases {
  if (!status) {
    return { lectura: 'pending', revision: 'pending', importar: 'pending' }
  }

  switch (status) {
    case 'open':
      return { lectura: 'pending', revision: 'pending', importar: 'pending' }
    case 'processing':
    case 'failed':
      return { lectura: 'current', revision: 'pending', importar: 'pending' }
    case 'pending_review':
      return { lectura: 'done', revision: 'current', importar: 'pending' }
    case 'approved':
      return { lectura: 'done', revision: 'done', importar: 'current' }
    case 'exported':
      return { lectura: 'done', revision: 'done', importar: 'done' }
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

export function getPeriodPageTitle(status: PeriodStatus | null): string {
  switch (status) {
    case 'approved':
      return 'Importar CSV'
    case 'exported':
      return 'Período exportado'
    case 'open':
    case 'processing':
    case 'pending_review':
    case 'failed':
    case null:
      return 'Revisar consumo de carga'
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}
