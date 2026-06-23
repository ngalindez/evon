import type { ConnectorCredentials, MeterConnector } from '@/connectors/meter-connector'
import type {
  ConsumptionWindow,
  CounterReading,
  DeviceConsumption,
  ProviderDevice,
} from '@/lib/types'

/**
 * Reads kWh from the Shelly cloud. Shelly is the MVP target connector (CLAUDE.md "MVP scope"):
 * the body is a stub here, but it is NOT a roadmap/V2 stub, so we throw a plain Error rather than
 * NotImplementedError.
 *
 * Real HTTP against the Shelly cloud (auth + device list + consumption) is deferred until we can
 * confirm the API shape against a physical device.
 */
export class ShellyConnector implements MeterConnector {
  async authenticate(_credentials: ConnectorCredentials): Promise<void> {
    // TODO(evon): real Shelly cloud auth — see CLAUDE.md "Cloud credentials" / "Connectors".
    throw new Error('TODO(evon): ShellyConnector.authenticate')
  }

  async listDevices(): Promise<ProviderDevice[]> {
    // TODO(evon): list devices from the Shelly cloud — see CLAUDE.md "Connectors".
    throw new Error('TODO(evon): ShellyConnector.listDevices')
  }

  async getConsumption(
    _providerDeviceId: string,
    _window: ConsumptionWindow,
  ): Promise<DeviceConsumption> {
    // TODO(evon): Shelly API shape unconfirmed — is consumption a cumulative counter (needs a
    // baseline reading at period start, fill counterStart/counterEnd) or interval consumption
    // (kwh directly)? Confirm against a physical device — see CLAUDE.md "Shelly API shape".
    throw new Error('TODO(evon): ShellyConnector.getConsumption')
  }

  async readCounter(_providerDeviceId: string): Promise<CounterReading> {
    // TODO(evon): read the Shelly cumulative energy counter — see CLAUDE.md "Shelly API shape".
    throw new Error('TODO(evon): ShellyConnector.readCounter')
  }
}
