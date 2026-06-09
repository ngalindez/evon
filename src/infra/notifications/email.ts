import { NotImplementedError } from '@/lib/errors'

/**
 * Transactional email to the building admin.
 *
 * Plain English: once a Billing period is closed and its CSV is ready for review, Evon emails the
 * building admin with the CSV attached so they can import it into their expensas software. This is
 * a stub — sending is not wired yet.
 *
 * TODO(evon): compose + send via Resend — `new Resend(getEnv().RESEND_API_KEY)` — with the CSV as
 * an attachment, once EMAIL_FROM and the message templates are decided. The 'resend' package is
 * intentionally not imported yet (it would be unused). See CLAUDE.md monthly cycle step 4.
 */

/** The "your Billing period is ready for review" email payload. */
export interface PeriodReadyEmail {
  to: string
  buildingName: string
  periodLabel: string
  csv: {
    filename: string
    content: string
  }
}

/** Send the period-ready notification with the CSV attached. */
export async function sendPeriodReadyEmail(_input: PeriodReadyEmail): Promise<void> {
  throw new NotImplementedError('notifications/email.sendPeriodReadyEmail')
}
