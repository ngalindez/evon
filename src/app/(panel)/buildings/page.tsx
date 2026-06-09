export default function BuildingsPage() {
  // TODO(evon): guard with requireBuildingAdmin() and load via server/catalog.listBuildings()
  // once authorize() is implemented. Left ungated for now so the skeleton is browsable.
  return (
    <section>
      <h1 className="text-xl font-semibold">Edificios</h1>
      <p className="mt-2 text-gray-600">Sin edificios todavía.</p>
    </section>
  )
}
