// Resolves the signed-in inbox user from the existing CRM session cookie.
// Same check as requireAdmin() in app/leads/actions.ts (timing-safe compare
// against ADMIN_SESSION_TOKEN), kept separate so the CRM file is untouched.
// Server-only. Fails closed: a missing ADMIN_SESSION_TOKEN means nobody is
// signed in, even though middleware.ts would let the page render.
import { cookies } from 'next/headers'
import { timingSafeEqual } from 'node:crypto'
import { OWNER, type Actor } from './access'

if (typeof window !== 'undefined') {
  throw new Error('lib/whatsapp/admin-session.ts must not be imported in the browser')
}

export const SESSION_COOKIE = 'edify_admin_session'

export function actorFromCookie(value: string | undefined, expected: string | undefined): Actor | null {
  if (!expected || !value) return null
  const a = Buffer.from(value)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return null
  return timingSafeEqual(a, b) ? OWNER : null
}

export async function currentActor(): Promise<Actor | null> {
  const jar = await cookies()
  return actorFromCookie(jar.get(SESSION_COOKIE)?.value, process.env.ADMIN_SESSION_TOKEN)
}
