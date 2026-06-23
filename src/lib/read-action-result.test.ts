import { describe, expect, it } from 'vitest'

import { readActionFailureMessage, toUserFacingError } from './read-action-result'

const DEFAULT_READ_ERROR = 'No se pudo leer el dispositivo.'

describe('toUserFacingError', () => {
  it('replaces Shelly TODO stubs with a plain message', () => {
    expect(toUserFacingError('TODO(evon): ShellyConnector.authenticate')).toBe(
      'Todavía no podemos conectar con Shelly Cloud.',
    )
  })

  it('replaces NotImplementedError messages', () => {
    expect(toUserFacingError('EwelinkConnector is not implemented yet')).toBe(
      'Todavía no podemos conectar con eWeLink.',
    )
  })

  it('simplifies Tuya API errors', () => {
    expect(toUserFacingError('Tuya API error (28841002): device not found')).toBe(
      'No se encontró el dispositivo en Tuya. Verificá el Device ID.',
    )
  })

  it('keeps already readable Spanish messages', () => {
    expect(toUserFacingError('Dispositivo abc no encontrado.')).toBe('Dispositivo abc no encontrado.')
  })
})

describe('readActionFailureMessage', () => {
  it('returns null on success', () => {
    expect(readActionFailureMessage({ ok: true }, undefined)).toBeNull()
  })

  it('sanitizes server error messages on ok:false', () => {
    expect(
      readActionFailureMessage({ ok: false, error: 'TODO(evon): ShellyConnector.readCounter' }, undefined),
    ).toBe('Todavía no podemos conectar con Shelly Cloud.')
  })

  it('returns a default message when ok:false has no error', () => {
    expect(readActionFailureMessage({ ok: false, error: '' }, undefined)).toBe(DEFAULT_READ_ERROR)
  })

  it('sanitizes thrown Error messages', () => {
    expect(readActionFailureMessage(undefined, new Error('TODO(evon): ShellyConnector.authenticate'))).toBe(
      'Todavía no podemos conectar con Shelly Cloud.',
    )
  })
})
