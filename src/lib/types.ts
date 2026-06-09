/**
 * Shared, brand-agnostic types that cross module boundaries. Kept in `lib` (lowest layer) so
 * connectors, server, and app can all depend on them without depending on each other.
 */

/** A half-open time window [from, to), always in UTC. */
export interface ConsumptionWindow {
  from: Date
  to: Date
}

/** A device as listed by a provider's cloud, before Evon maps it to a MeterDevice. */
export interface ProviderDevice {
  /** The id used to address this device in the provider's cloud API. */
  providerDeviceId: string
  name?: string
  /** Raw provider payload, kept for traceability. */
  raw: unknown
}

/**
 * Consumption for one device over a window.
 *
 * Quantities are carried as decimal strings (never JS numbers) so no precision is lost before
 * the biller parses them into Money. `raw` is the verbatim cloud response stored in
 * meter_readings.raw_payload for traceability.
 */
export interface DeviceConsumption {
  providerDeviceId: string
  /** kWh consumed over the window, as a decimal string. */
  kwh: string
  /** Cumulative counter readings, present only if the provider is a cumulative counter. */
  counterStart?: string
  counterEnd?: string
  /** When the reading was taken / the window closed. */
  readAt: Date
  raw: unknown
}
