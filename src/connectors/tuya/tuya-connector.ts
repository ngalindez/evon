import { createHash, createHmac } from 'node:crypto'

import type { ConnectorCredentials, MeterConnector } from '@/connectors/meter-connector'
import { NotImplementedError } from '@/lib/errors'
import { money } from '@/lib/money'
import type {
  ConsumptionWindow,
  CounterReading,
  DeviceConsumption,
  ProviderDevice,
} from '@/lib/types'

// ponytail: US data center hardcoded — the pilot's Tuya project lives there. Add a `region` key
// to the credentials JSON (us/eu/cn/in -> base URL) when a non-US project appears.
const BASE_URL = 'https://openapi.tuyaus.com'

// ponytail: scale 2 (value / 100 = kWh) per the pilot breaker's `total_forward_energy` spec.
// If a device reports a different scale, read it from /v1.0/devices/{id}/specifications instead.
const COUNTER_SCALE = 100

const ENERGY_CODE = 'total_forward_energy'

type TuyaResponse<T> = {
  success: boolean
  result: T
  code?: number
  msg?: string
}

type StatusItem = { code: string; value: unknown }

/**
 * Tuya cloud connector.
 *
 * Plain English: Tuya signs every request with an HMAC of (client id + token + timestamp + a
 * canonical request string). We grab a short-lived access token, then read the breaker's status
 * and pull its cumulative energy counter. The breaker only exposes a lifetime total, so this is a
 * counter reader — period consumption is the difference between two reads (done in the metering
 * layer). See tuya_test.py for the reference request flow.
 */
export class TuyaConnector implements MeterConnector {
  private accessKey?: string
  private secretKey?: string
  private accessToken?: string

  async authenticate(credentials: ConnectorCredentials): Promise<void> {
    const accessKey = typeof credentials.accessKey === 'string' ? credentials.accessKey : ''
    const secretKey = typeof credentials.secretKey === 'string' ? credentials.secretKey : ''
    if (!accessKey || !secretKey) {
      throw new Error('Tuya: credentials must include "accessKey" and "secretKey".')
    }
    this.accessKey = accessKey
    this.secretKey = secretKey
    this.accessToken = await this.fetchToken()
  }

  async listDevices(): Promise<ProviderDevice[]> {
    // Not needed: device ids are entered by hand in the panel. Implement via
    // /v1.0/users/{uid}/devices if device discovery is ever wanted.
    throw new NotImplementedError('TuyaConnector.listDevices')
  }

  async getConsumption(
    _providerDeviceId: string,
    _window: ConsumptionWindow,
  ): Promise<DeviceConsumption> {
    // Tuya is a cumulative counter: window-based consumption is a delta of two readCounter()
    // snapshots, computed by the metering layer. Billing close will use that, not this method.
    throw new NotImplementedError('TuyaConnector.getConsumption')
  }

  async readCounter(providerDeviceId: string): Promise<CounterReading> {
    if (!this.accessToken) {
      throw new Error('Tuya: not authenticated — call authenticate() first.')
    }
    const res = await this.signedGet<StatusItem[]>(`/v1.0/devices/${providerDeviceId}/status`)
    const energy = res.result.find((s) => s.code === ENERGY_CODE)
    if (energy == null || typeof energy.value !== 'number') {
      throw new Error(`Tuya: device ${providerDeviceId} returned no numeric ${ENERGY_CODE}.`)
    }
    const counterKwh = money(energy.value).div(COUNTER_SCALE).toString()
    return { counterKwh, readAt: new Date(), raw: res }
  }

  // ---- Tuya request signing (HMAC-SHA256, see tuya_test.py) ----

  private async fetchToken(): Promise<string> {
    const res = await this.signedRequest<{ access_token: string }>(
      'GET',
      '/v1.0/token?grant_type=1',
      false,
    )
    return res.result.access_token
  }

  private signedGet<T>(urlPath: string): Promise<TuyaResponse<T>> {
    return this.signedRequest<T>('GET', urlPath, true)
  }

  private async signedRequest<T>(
    method: string,
    urlPath: string,
    withToken: boolean,
  ): Promise<TuyaResponse<T>> {
    const accessKey = this.accessKey
    const secretKey = this.secretKey
    if (!accessKey || !secretKey) {
      throw new Error('Tuya: not authenticated — call authenticate() first.')
    }
    const t = Date.now().toString()
    const contentSha256 = createHash('sha256').update('').digest('hex')
    const stringToSign = [method, contentSha256, '', urlPath].join('\n')
    const token = withToken ? (this.accessToken ?? '') : ''
    const signStr = accessKey + token + t + stringToSign
    const sign = createHmac('sha256', secretKey).update(signStr).digest('hex').toUpperCase()

    const headers: Record<string, string> = {
      client_id: accessKey,
      sign,
      t,
      sign_method: 'HMAC-SHA256',
    }
    if (withToken) headers.access_token = token

    const resp = await fetch(BASE_URL + urlPath, { method, headers })
    if (!resp.ok) {
      throw new Error(`Tuya HTTP ${resp.status} ${resp.statusText} en ${urlPath}`)
    }
    let data: TuyaResponse<T>
    try {
      data = (await resp.json()) as TuyaResponse<T>
    } catch {
      throw new Error(`Tuya: respuesta no-JSON de ${urlPath}`)
    }
    if (!data.success) {
      throw new Error(`Tuya API error (${data.code ?? '?'}): ${data.msg ?? 'request failed'}`)
    }
    return data
  }
}
