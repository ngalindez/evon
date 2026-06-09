import { redirect } from 'next/navigation'

import { auth } from '@/infra/auth/config'

/**
 * Session helpers for server components and route handlers.
 *
 * Plain English: `getSession()` tells you who (if anyone) is logged in.
 * `requireBuildingAdmin()` is a guard for panel pages — if no one is logged in it bounces the
 * request to the login page; otherwise it hands back the session.
 */

/** Return the current Auth.js session, or null if there is none. */
export async function getSession() {
  return auth()
}

/**
 * Guard for building-admin-only pages: redirect to /login when there is no authenticated user,
 * otherwise return the session.
 *
 * TODO(evon): this guard only becomes meaningful once Credentials.authorize() in config.ts is
 * implemented — until then no session is ever issued, so every protected page redirects to
 * /login. See CLAUDE.md "Auth".
 */
export async function requireBuildingAdmin() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return session
}
