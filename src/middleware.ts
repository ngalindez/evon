// Auth.js middleware: wraps requests with the session so panel routes can be protected.
// TODO(evon): add an `authorized` callback in src/infra/auth/config.ts to actually redirect
// unauthenticated users once authorize() is implemented — see CLAUDE.md "Auth".
export { auth as middleware } from '@/infra/auth/config'

export const config = {
  // Protect the building-admin panel routes (the /login and / marketing routes are intentionally excluded).
  matcher: [
    '/dashboard/:path*',
    '/buildings/:path*',
    '/periods/:path*',
    '/tariffs/:path*',
    '/devices/:path*',
    '/settings/:path*',
  ],
}
