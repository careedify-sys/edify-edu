// middleware.ts — Runs at Edge before any request
// 1. Protects /admin/* routes with server-side session cookie authentication.
// 2. Issues 301 redirects for old/truncated university slugs indexed by Google.
import { NextRequest, NextResponse } from 'next/server'
import { OLD_SLUG_REDIRECTS } from '@/lib/redirects-old-slugs'

const PROTECTED_PATHS = ['/admin', '/admin/cms', '/blog/write']
const LOGIN_COOKIE = 'edify_admin_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 1. Old university slug 301 redirects ─────────────────────────────────
  // Match /universities/{slug} or /universities/{slug}/{rest}
  const uniMatch = pathname.match(/^\/universities\/([^/]+)(\/.*)?$/)
  if (uniMatch) {
    const oldSlug = uniMatch[1]
    const rest = uniMatch[2] || ''
    const newSlug = OLD_SLUG_REDIRECTS[oldSlug]
    if (newSlug) {
      const target = newSlug === '__universities_list__'
        ? '/universities'
        : `/universities/${newSlug}${rest}`
      const url = req.nextUrl.clone()
      url.pathname = target
      return NextResponse.redirect(url, 301)
    }
  }

  // ── 2. Admin auth guard ───────────────────────────────────────────────────
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  if (pathname === '/api/admin-auth') return NextResponse.next()

  const session = req.cookies.get(LOGIN_COOKIE)
  if (session?.value === process.env.ADMIN_SESSION_TOKEN) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/admin-login', req.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/admin/cms/:path*', '/blog/write', '/universities/:path*'],
}
