import type {
  ConsumptionWindow,
  CounterReading,
  DeviceConsumption,
  ProviderDevice,
} from '@/lib/types'

/**
 * The common interface every smart-breaker cloud integration implements.
 *
 * Business logic depends on THIS, never on a concrete brand (CLAUDE.md "Connectors"): the
 * registry picks the implementation by provider, so the biller never knows whether the data came
 * from Shelly, Tuya, or eWeLink.
 */
export interface MeterConnector {
  /** Authenticate against the provider cloud using already-decrypted credentials. */
  authenticate(credentials: ConnectorCredentials): Promise<void>

  /** List the devices visible to the authenticated account. */
  listDevices(): Promise<ProviderDevice[]>

  /**
   * Consumption for one device over a window. The window is half-open [from, to) in UTC.
   * Returns the raw payload too, for traceability.
   */
  getConsumption(providerDeviceId: string, window: ConsumptionWindow): Promise<DeviceConsumption>

  /**
   * Read the device's current cumulative counter "now" (kWh lifetime total).
   *
   * This is the read behind a MeterSample: on-demand reads, the setup baseline, and the daily
   * poll cron all call this. Period consumption is the delta between two snapshots, computed by
   * the metering layer — the connector stays a dumb counter reader.
   */
  readCounter(providerDeviceId: string): Promise<CounterReading>
}

/** Decrypted credentials handed to a connector. Shape is provider-specific (parsed JSON). */
export type ConnectorCredentials = Record<string, unknown>
