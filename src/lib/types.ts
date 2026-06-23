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

/**
 * A single cumulative-counter snapshot for a device, taken "now".
 *
 * This is the point-in-time read behind a MeterSample. The counter is a monotonic lifetime
 * total (kWh); period consumption is the delta between two of these. Carried as a decimal
 * string so no precision is lost before it becomes a Prisma.Decimal.
 */
export interface CounterReading {
  /** Cumulative lifetime counter as a decimal string (kWh). */
  counterKwh: string
  /** When the snapshot was taken. */
  readAt: Date
  raw: unknown
}
