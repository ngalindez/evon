export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="text-xl font-semibold">Ingresar</h1>
      {/* TODO(evon): wire to Auth.js signIn('credentials', ...) once authorize() is implemented
          (src/infra/auth/config.ts). See CLAUDE.md "Auth". */}
      <form className="mt-4 space-y-3">
        <input
          className="w-full border border-gray-300 p-2"
          type="email"
          name="email"
          placeholder="Email"
        />
        <input
          className="w-full border border-gray-300 p-2"
          type="password"
          name="password"
          placeholder="Contraseña"
        />
        <button
          className="w-full bg-black p-2 text-white disabled:opacity-50"
          type="submit"
          disabled
        >
          Ingresar
        </button>
      </form>
    </main>
  )
}
