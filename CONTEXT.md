# Evon

Evon bills the electricity used to charge electric cars in building parking spots, injecting it
as a line item in the monthly building-fee statement. This glossary fixes the language. The
schema is all English; untranslatable Argentine domain terms live here only.

## Language

**Building** (es: consorcio):
A horizontal-property building under Argentine "propiedad horizontal" law.
_Avoid_: consorcio (identifiers), property, complex.

**Unit** (es: unidad funcional):
An individually-owned space (apartment or parking spot) — the thing that gets billed.
_Avoid_: UF, apartment, lot.

**Building admin** (es: administrador):
Evon's paying customer; manages several Buildings (~13). The tenant root. NOT an Evon employee.
_Avoid_: admin, administrator (ambiguous with Evon staff), customer, company.

**Distribuidora**:
The electricity utility (EDESUR / EDENOR) that defines the per-kWh tariff.
_Avoid_: provider, utility company.

**Smart breaker**:
A WiFi meter (Shelly first) in a parking spot's panel; the source of consumption data.
_Avoid_: disyuntor, meter (the device is the breaker; its data is a Reading).

**Tariff**:
A per-kWh price effective from a date, keyed by Distribuidora. Not owned by a Building.
_Avoid_: rate, price (price is one field of a Tariff).

**Expensas**:
The monthly common building fee each Unit pays. The statement Evon's line item joins.
_Avoid_: fees, dues (keep the Spanish term — it is the customer's word).

**Expensas software**:
The third-party system the building admin already uses (Octopus, ConsorcioAbierto, AdminProp).
Has no API; Evon hands it a CSV.

**Export profile**:
The CSV layout specific to one expensas software. MVP ships only the generic profile.
_Avoid_: format, template.

**SIRO**:
Banco Roela collections platform the expensas software uploads to. Out of scope for Evon's MVP.

**Billing period**:
One month's billing cycle for one Building. Moves through a state machine (see ADR).
_Avoid_: month, cycle.

**Reading** (meter reading):
The consumption attributed to one Smart breaker for one Billing period, plus the cloud's raw
payload kept for traceability.
_Avoid_: measurement, sample.

**Billing line**:
The per-Unit charge produced for a Billing period (including Units at $0).
_Avoid_: charge, item, row.

## Relationships

- A **Building admin** owns many **Buildings** (tenant root).
- A **Building** has many **Units** and one-or-more **cloud connections**.
- A **Smart breaker** belongs to one **Unit** and one cloud connection.
- A **Tariff** is global, looked up by **Distribuidora** + effective date — not owned by a Building.
- A **Billing period** belongs to one **Building**; it has many **Readings** and many **Billing lines**.
- A **Reading** belongs to one Billing period + one Smart breaker.
- A **Billing line** belongs to one Billing period + one Unit.

## Example dialogue

> **Dev:** "When the monthly close runs, does it create a **Billing line** for every **Unit**?"
> **Domain expert:** "Yes — every Unit in the Building, even ones at $0, so the **Expensas
> software** import is complete. The line's amount comes from that Unit's **Smart breaker**
> **Reading** times the **Tariff** in effect."

## Flagged ambiguities

- "administrator" was ambiguous between Evon's customer and Evon staff — resolved: **Building
  admin** is always the customer. Evon staff are out of the domain model entirely for MVP.
- "meter" conflated the device and its data — resolved: the device is a **Smart breaker**, the
  data is a **Reading**.
