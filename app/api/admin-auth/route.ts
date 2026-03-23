// app/api/admin-auth/route.ts
// Validates password server-side, issues a session cookie.
// Password and token never reach the browser in plaintext.
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SECRET  = process.env.ADMIN_SECRET         // the password to accept
const SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN  // opaque random string for cookie
const COOKIE_NAME   = 'edify_admin_session'
const COOKIE_MAX    = 60 * 60 * 24 // 24 hours

export async function POST(req: NextRequest) {
  if (!ADMIN_SECRET || !SESSION_TOKEN) {
    return NextResponse.json(
      { error: 'Server misconfigured — ADMIN_SECRET and ADMIN_SESSION_TOKEN must be set in Vercel env vars' },
      { status: 503 }
    )
  }

  const { password } = await req.json().catch(() => ({ password: '' }))

  if (password !== ADMIN_SECRET) {
    // Add delay to resist brute-force
    await new Promise(r => setTimeout(r, 300 + Math.random() * 200))
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, SESSION_TOKEN, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production' && !req.nextUrl.hostname.includes('localhost'),
    sameSite: 'strict',
    maxAge:   COOKIE_MAX,
    path:     '/',
  })
  return res
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}
