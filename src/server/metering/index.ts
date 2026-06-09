import { NotImplementedError } from '@/lib/errors'
import type { ConsumptionWindow } from '@/lib/types'

/**
 * Metering: pull the month's consumption from every Smart breaker in a Building and persist it.
 *
 * Plain English: for each breaker in the Building we ask its cloud (via the connector registry)
 * how many kWh it used over the period, then store that as a Reading — including the cloud's raw
 * payload, so any billed amount can be reconstructed later.
 */

/** Read consumption for all of a Building's devices over the window and persist Readings. */
export async function readConsumptionForBuilding(
  buildingId: string,
  window: ConsumptionWindow,
): Promise<void> {
  // TODO(evon): for each MeterDevice in the Building, resolve its CloudConnection, pick the
  // connector via the registry (by Provider), authenticate with decrypted credentials, call
  // getConsumption(window), and persist meter_readings (kwh + raw_payload). Depends on the Shelly
  // API shape (cumulative counter vs. interval — baseline reading?) — see CLAUDE.md "TODO / open
  // questions: Shelly API shape" and "Monthly billing cycle" step 2.
  void buildingId
  void window
  throw new NotImplementedError('readConsumptionForBuilding')
}
