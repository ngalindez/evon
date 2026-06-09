export default function PeriodsPage() {
  // TODO(evon): guard with requireBuildingAdmin() and load billing_periods for the selected
  // building. The monthly close moves a period through the ADR-0001 state machine.
  return (
    <section>
      <h1 className="text-xl font-semibold">Períodos</h1>
      <p className="mt-2 text-gray-600">Sin períodos todavía.</p>
    </section>
  )
}
