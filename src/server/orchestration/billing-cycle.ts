import { prisma } from '@/infra/db/client'
import { logger } from '@/infra/observability/logger'
import { PeriodStatus } from '@prisma/client'

/**
 * Run the monthly close for ONE building.
 *
 * Plain English: once a month the cron wakes up and, for each building separately, this
 * function reads the smart breakers, prices the kWh, builds the per-unit billing lines,
 * generates the CSV/PDFs, and emails the building admin for review. It is deliberately
 * scoped to a single building per call so each run stays under the serverless time limit
 * (CLAUDE.md "Monthly billing cycle"; one building per cron invocation).
 *
 * This function OWNS the Billing period state-machine transitions described in
 * docs/adr/0001-billing-period-state-machine.md: it moves the period into `processing`,
 * and on the happy path the pipeline ends in `pending_review`; on any error it lands in
 * `failed` (which is retryable back into `processing`).
 *
 * Only the state-machine bookkeeping is implemented here. The actual work is left as
 * numbered TODO(evon) steps below.
 */
export async function runMonthlyCloseForBuilding(
  buildingId: string,
  year: number,
  month: number,
): Promise<void> {
  logger.info('billing-cycle: starting monthly close', { buildingId, year, month })

  // month is 1-based (1 = January). UTC half-open window [periodStart, periodEnd).
  const periodStart = new Date(Date.UTC(year, month - 1, 1))
  const periodEnd = new Date(Date.UTC(year, month, 1))

  // Move the period into `processing` (create it if this is the first close for the month).
  const period = await prisma.billingPeriod.upsert({
    where: { buildingId_year_month: { buildingId, year, month } },
    create: {
      buildingId,
      year,
      month,
      status: PeriodStatus.processing,
      periodStart,
      periodEnd,
    },
    update: {
      status: PeriodStatus.processing,
    },
  })

  try {
    // The real monthly-close pipeline. Each step is server-only and lives in its own module;
    // they are referenced here by path but intentionally NOT imported yet (stubs / unused).
    //
    // TODO(evon): 1. metering.readConsumptionForBuilding(buildingId, { from: periodStart, to: periodEnd })
    //    Read each smart breaker's kWh for the window via the connector registry and persist
    //    Readings (incl. raw_payload) against period.id. — see CLAUDE.md "Monthly billing cycle"
    //    and "Connectors"; @/server/metering.
    // TODO(evon): 2. billing.buildBillingLines(period.id)
    //    Aggregate Readings by Unit and apply the Tariff in effect × kWh (pricing engine),
    //    producing one Billing line per Unit including Units at $0. — see CLAUDE.md "Pricing
    //    engine"/"Monthly billing cycle"; @/server/billing + @/server/pricing.
    // TODO(evon): 3. output.generateCsv(...) + per-unit PDFs -> storage.putObject -> record output_files
    //    Render the generic export profile CSV and per-Unit detail PDFs, upload to R2, and
    //    record output_files rows. — see CLAUDE.md "MVP scope"/"Folder structure"; @/server/output,
    //    @/infra/storage.
    // TODO(evon): 4. status = pending_review; notifications.sendPeriodReadyEmail(...) with the CSV attached
    //    Transition the period to PeriodStatus.pending_review (the non-negotiable human review
    //    gate per ADR-0001) and email the building admin the CSV. — see CLAUDE.md "Monthly
    //    billing cycle"; @/infra/notifications.
    //
    // Until the pipeline exists, fail loudly so a half-run period never sits in `processing`.
    throw new Error('TODO(evon): metering -> billing -> output -> notify steps not implemented')
  } catch (err) {
    // ADR-0001: any error during `processing` drops the period to `failed` (retryable).
    await prisma.billingPeriod.update({
      where: { id: period.id },
      data: { status: PeriodStatus.failed, error: String(err) },
    })
    logger.error('billing-cycle: monthly close failed', {
      buildingId,
      year,
      month,
      error: String(err),
    })
    throw err
  }
}
