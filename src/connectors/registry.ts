import { EwelinkConnector } from '@/connectors/ewelink/ewelink-connector'
import type { MeterConnector } from '@/connectors/meter-connector'
import { ShellyConnector } from '@/connectors/shelly/shelly-connector'
import { TuyaConnector } from '@/connectors/tuya/tuya-connector'
import { Provider } from '@prisma/client'

/**
 * Picks the connector implementation for a provider (CLAUDE.md "Connectors"): business logic asks
 * the registry by provider and gets back a MeterConnector, so the biller never knows the brand.
 */
export function getConnector(provider: Provider): MeterConnector {
  switch (provider) {
    case Provider.shelly:
      return new ShellyConnector()
    case Provider.tuya:
      return new TuyaConnector()
    case Provider.ewelink:
      return new EwelinkConnector()
    default: {
      // Exhaustiveness: if a new Provider is added, this stops compiling.
      const _exhaustive: never = provider
      throw new Error(`Unknown provider: ${String(_exhaustive)}`)
    }
  }
}
