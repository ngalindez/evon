import type { ConnectorCredentials, MeterConnector } from '@/connectors/meter-connector'
import { NotImplementedError } from '@/lib/errors'
import type { ConsumptionWindow, DeviceConsumption, ProviderDevice } from '@/lib/types'

/**
 * Tuya cloud connector.
 *
 * TODO(evon): Tuya connector is V2 — out of MVP scope (CLAUDE.md "MVP scope"). Stubbed with
 * NotImplementedError until then.
 */
export class TuyaConnector implements MeterConnector {
  async authenticate(_credentials: ConnectorCredentials): Promise<void> {
    throw new NotImplementedError('TuyaConnector')
  }

  async listDevices(): Promise<ProviderDevice[]> {
    throw new NotImplementedError('TuyaConnector')
  }

  async getConsumption(
    _providerDeviceId: string,
    _window: ConsumptionWindow,
  ): Promise<DeviceConsumption> {
    throw new NotImplementedError('TuyaConnector')
  }
}
