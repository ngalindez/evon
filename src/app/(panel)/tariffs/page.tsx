export default function TariffsPage() {
  // TODO(evon): guard with requireBuildingAdmin() and list tariffs by distribuidora + effective
  // date (server/tariffs). margin = 0 for the MVP — see CLAUDE.md "Detailed tariff rules".
  return (
    <section>
      <h1 className="text-xl font-semibold">Tarifas</h1>
      <p className="mt-2 text-gray-600">Sin tarifas todavía.</p>
    </section>
  )
}
