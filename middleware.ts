// middleware.ts — Runs at Edge before any request
// Protects /admin/* routes with server-side session cookie authentication.
// The password NEVER leaves the server — no client-side string matching.
import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/admin', '/admin/cms', '/blog/write']
const LOGIN_COOKIE = 'edify_admin_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect admin and write paths
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // Allow the login API through without auth check
  if (pathname === '/api/admin-auth') return NextResponse.next()

  // Check for valid session cookie
  const session = req.cookies.get(LOGIN_COOKIE)
  if (session?.value === process.env.ADMIN_SESSION_TOKEN) {
    return NextResponse.next()
  }

  // Redirect to login page with return URL
  const loginUrl = new URL('/admin-login', req.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/admin/cms/:path*', '/blog/write'],
}
