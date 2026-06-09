export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Evon</h1>
      <p className="mt-2 text-gray-600">
        Panel de administración.{' '}
        <a className="text-blue-600 underline" href="/login">
          Ingresar
        </a>
      </p>
    </main>
  )
}
