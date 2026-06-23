import type { ConnectorCredentials, MeterConnector } from '@/connectors/meter-connector'
import { NotImplementedError } from '@/lib/errors'
import type {
  ConsumptionWindow,
  CounterReading,
  DeviceConsumption,
  ProviderDevice,
} from '@/lib/types'

/**
 * eWeLink cloud connector.
 *
 * TODO(evon): eWeLink connector is V2 — out of MVP scope (CLAUDE.md "MVP scope"). Stubbed with
 * NotImplementedError until then.
 */
export class EwelinkConnector implements MeterConnector {
  async authenticate(_credentials: ConnectorCredentials): Promise<void> {
    throw new NotImplementedError('EwelinkConnector')
  }

  async listDevices(): Promise<ProviderDevice[]> {
    throw new NotImplementedError('EwelinkConnector')
  }

  async getConsumption(
    _providerDeviceId: string,
    _window: ConsumptionWindow,
  ): Promise<DeviceConsumption> {
    throw new NotImplementedError('EwelinkConnector')
  }

  async readCounter(_providerDeviceId: string): Promise<CounterReading> {
    throw new NotImplementedError('EwelinkConnector')
  }
}
