import { describe, expect, it } from 'vitest'
import { UnapproveError, assertCanUnapprove } from './unapprove'

describe('assertCanUnapprove', () => {
  it('allows undo from approved', () => {
    expect(() => assertCanUnapprove('approved')).not.toThrow()
  })

  it('refuses undo once exported', () => {
    expect(() => assertCanUnapprove('exported')).toThrow(UnapproveError)
    expect(() => assertCanUnapprove('exported')).toThrow(/exportado/)
  })

  it('refuses undo when the period is not approved', () => {
    for (const status of ['open', 'processing', 'pending_review', 'failed'] as const) {
      expect(() => assertCanUnapprove(status)).toThrow(UnapproveError)
    }
  })
})
