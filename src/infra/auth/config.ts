import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

/**
 * Auth.js (next-auth v5) configuration for the building-admin panel.
 *
 * Plain English: this sets up a username/password login that keeps you signed in via an
 * httpOnly cookie. The actual password check is not written yet — that depends on how we
 * decide to store and hash `building_admins` credentials. Everything around it (session
 * strategy, the login page, the helpers in session.ts, the middleware) is wired so that
 * implementing one function later flips auth on.
 *
 * AUTH_SECRET is read from the environment automatically by next-auth (see env.ts).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  // httpOnly cookie session backed by a signed JWT (no session table needed).
  session: { strategy: 'jwt' },
  // Required when running outside Vercel/dev so next-auth trusts the Host header.
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (_credentials) => {
        // TODO(evon): verify the building admin's email+password against building_admins.
        // Credential storage/hashing is undecided — see CLAUDE.md "Auth".
        return null
      },
    }),
  ],
})
