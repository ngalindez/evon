import { redirect } from 'next/navigation'

/**
 * Login is disabled until auth is wired. Anything that lands here just bounces to the panel.
 *
 * TODO(evon): restore the credential form (the previous version is in git history) once
 * authorize() + the authorized() middleware callback are implemented (CLAUDE.md "Auth").
 */
export default function LoginPage() {
  redirect('/dashboard')
}
