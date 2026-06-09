# Billing period state machine

A **Billing period** moves through an explicit six-state machine rather than an ad-hoc
status field, because the monthly close has a mandatory human review gate and runs on a
failure-prone serverless cron.

States and transitions:

```
open ──(cron day 1)─→ processing
                        ├─ success ─→ pending_review ──(admin approves)─→ approved ──(download/import)─→ exported
                        └─ error   ─→ failed ──(manual/auto retry)─→ processing
```

- **open** — period created, awaiting its close date.
- **processing** — cron is reading breakers, pricing, generating lines/CSV/PDF.
- **pending_review** — artifacts ready; the building admin must review before anything leaves Evon.
- **approved** — admin signed off; CSV is final.
- **exported** — admin downloaded/imported into their expensas software (Evon's job ends).
- **failed** — an error occurred during `processing`; retryable back into `processing`.

## Why

- `processing` and `failed` are distinct so a cron timeout/error is retryable without losing
  the period or double-billing — required because each building is processed in its own
  serverless invocation under a time limit.
- `pending_review → approved` encodes the non-negotiable human gate: Evon never sends a CSV the
  admin hasn't approved.
- `exported` is tracked (not inferred) so the panel can show what has actually left Evon.

Reversing this later (e.g. collapsing states) would require touching the orchestrator, cron
retry logic, panel, and a data migration — hence recorded here.
