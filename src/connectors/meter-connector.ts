import type { ConsumptionWindow, DeviceConsumption, ProviderDevice } from '@/lib/types'

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
}

/** Decrypted credentials handed to a connector. Shape is provider-specific (parsed JSON). */
export type ConnectorCredentials = Record<string, unknown>
