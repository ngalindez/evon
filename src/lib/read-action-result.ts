export type ReadActionResult = { ok: true } | { ok: false; error: string }

const DEFAULT_READ_ERROR = 'No se pudo leer el dispositivo.'

/** Turn connector/server errors into short Spanish messages for the panel. */
export function toUserFacingError(message: string): string {
  const trimmed = message.trim()
  if (!trimmed) return DEFAULT_READ_ERROR

  if (/^TODO\(evon\):\s*ShellyConnector/i.test(trimmed)) {
    return 'Todavía no podemos conectar con Shelly Cloud.'
  }
  if (/^TODO\(evon\):\s*EwelinkConnector/i.test(trimmed)) {
    return 'Todavía no podemos conectar con eWeLink.'
  }
  if (/^TODO\(evon\):/i.test(trimmed)) {
    return 'Esta operación todavía no está disponible.'
  }
  if (/ is not implemented yet$/i.test(trimmed)) {
    if (/Shelly/i.test(trimmed)) return 'Todavía no podemos conectar con Shelly Cloud.'
    if (/Ewelink/i.test(trimmed)) return 'Todavía no podemos conectar con eWeLink.'
    return 'Esta operación todavía no está disponible.'
  }
  if (/credentials must include "accessKey"/i.test(trimmed)) {
    return 'Faltan credenciales de Tuya. Revisá Access Key y Secret Key en la conexión cloud.'
  }
  if (/Tuya HTTP 401/i.test(trimmed)) {
    return 'Las credenciales de Tuya no son válidas.'
  }
  if (/Tuya API error/i.test(trimmed)) {
    if (/not found|28841002/i.test(trimmed)) {
      return 'No se encontró el dispositivo en Tuya. Verificá el Device ID.'
    }
    if (/permission|1106/i.test(trimmed)) {
      return 'Sin permiso para acceder al dispositivo en Tuya. Verificá credenciales y Device ID.'
    }
    return 'El cloud de Tuya rechazó la lectura. Verificá credenciales y Device ID.'
  }
  if (/returned no numeric total_forward_energy/i.test(trimmed)) {
    return 'El dispositivo no reportó consumo acumulado. Verificá que sea un medidor compatible.'
  }
  if (/Tuya HTTP/i.test(trimmed)) {
    return 'No se pudo contactar al cloud de Tuya. Intentá de nuevo en unos minutos.'
  }
  if (/Las credenciales guardadas no son JSON válido/i.test(trimmed)) {
    return 'Las credenciales guardadas están corruptas. Volvé a cargar la conexión cloud.'
  }
  if (/^Tuya:/i.test(trimmed)) {
    return 'No se pudo leer el dispositivo en Tuya. Verificá credenciales y Device ID.'
  }

  return trimmed
}

export function readActionFailureMessage(
  result: ReadActionResult | undefined,
  thrown: unknown,
): string | null {
  if (thrown !== undefined) {
    const message = thrown instanceof Error ? thrown.message : DEFAULT_READ_ERROR
    return toUserFacingError(message)
  }
  if (result && !result.ok) {
    return toUserFacingError(result.error || DEFAULT_READ_ERROR)
  }
  return null
}
