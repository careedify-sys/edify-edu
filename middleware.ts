// middleware.ts — Runs at Edge before any request
// 1. www → non-www permanent redirect (308)
// 2. 308 redirects for old/truncated university slugs indexed by Google
// 3. Admin route auth guard
//
// NOTE on www redirect (section 1):
// This only fires if www.edifyedu.in is configured as an ALIAS domain in Vercel
// (Settings → Domains → add www as a domain that serves the project).
// If www is configured as a Vercel REDIRECT domain, Vercel intercepts with 307
// at the CDN layer before middleware runs. In that case, fix is in Vercel dashboard:
//   Settings → Domains → click www.edifyedu.in → change from "Redirect" to domain alias
// Once that change is made, this middleware issues 308 instead.
//
// NOTE on OLD_SLUG_REDIRECTS:
// Inlined here (not imported) because Vercel's Edge Runtime cannot bundle
// external modules via @/ path aliases. Keeping it in sync with
// lib/redirects-old-slugs.ts is a manual step when adding new entries.
import { NextRequest, NextResponse } from 'next/server'

// Old/truncated university slugs indexed by Google → current slugs
// Verified against lib/data.ts UNIVERSITIES array (2026-04-17)
const OLD_SLUG_REDIRECTS: Record<string, string> = {
  'alagappa-universi': 'alagappa-university-online',
  'amrita-vishwa-vidyapee': 'amrita-vishwa-vidyapeetham-online',
  'andhra-universi': 'andhra-university-online',
  'arka-jain-universi': 'arka-jain-university-online',
  'bangalor-universi': 'bangalore-university-online',
  'bharath-institut-of-higher': 'bharath-university-online',
  'bharathi-universi': 'bharathidasan-university-online',
  'chitkara-universi': 'chitkara-university-online',
  'dayanand-sagar-universi': 'dayananda-sagar-university-online',
  'deen-dayal-upadhyay-gorakhpu': 'deen-dayal-upadhyay-gorakhpur-university-online',
  'desh-bhagat-universi': 'desh-bhagat-university-online',
  'devi-ahilya-vishwavi': 'devi-ahilya-vishwavidyalaya-online',
  'gla-universi': 'gla-university-online',
  'gls-universi': 'gls-university-online',
  'guru-ghasidas-vishwavi': 'guru-ghasidas-vishwavidyalaya-online',
  'guru-gobind-singh-indrapra': 'guru-gobind-singh-indraprastha-university-online',
  'guru-kashi-universi': 'guru-kashi-university-online',
  'hindusta-institut-of-technolo': 'hindustan-institute-technology-online',
  'icfai-foundati-for-higher': 'icfai-university-online',
  'jaipur-national-universi': 'jaipur-national-university-online',
  'jaypee-universi': 'jaypee-university-online',
  'kalasali-academy-of-research': 'kalasalingam-university-online',
  'kalinga-institut-of-industri': 'kalinga-institute-industrial-technology-online',
  'karnatak-state-open-universi': 'karnataka-state-open-university-online',
  'mahatma-jyotiba-phule-rohilkha': 'mahatma-jyotiba-phule-rohilkhand-university-online',
  'mangalay-universi': 'mangalayatan-university-online',
  'manonman-sundaran-universi': 'manonmaniam-sundaranar-university-online',
  'marwadi-universi': 'marwadi-university-online',
  'meenaksh-academy-of-higher': 'meenakshi-academy-higher-education-online',
  'pp-savani-universi': 'pp-savani-university-online',
  'shanmugh-arts-science-technolo': 'shanmugha-arts-science-technology-research-online',
  'shri-ramasamy-memorial-univers': 'shri-ramasamy-memorial-university-online',
  'sri-ramachandra-universi': 'sri-ramachandra-university-online',
  'teerthanker-universi': 'teerthanker-mahaveer-university-online',
  'universi-of-mysore': 'university-of-mysore-online',
  'vellore-institut-of-technolo': 'vit-vellore-online',
  'yenepoya-universi': 'yenepoya-university-online',
  'symbiosis': 'symbiosis-university-online',
  'nmims': 'nmims-online',
  'mahe-manipal': 'manipal-academy-higher-education-online',
  'jain': 'jain-university-online',
  'lpu': 'lovely-professional-university-online',
  'sikkim-manipal': 'sikkim-manipal-university-online',
}

const PROTECTED_PATHS = ['/admin', '/admin/cms', '/blog/write']
const LOGIN_COOKIE = 'edify_admin_session'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const { pathname } = req.nextUrl

  // ── 1. www → non-www permanent redirect (308) ────────────────────────────
  // Runs first — collapse any www request to apex before further processing.
  // This handles the case where www is an alias (not a Vercel redirect domain).
  // Combined with an old-slug on www, this produces a single 308 hop:
  //   www.edifyedu.in/universities/lpu/mca → edifyedu.in/universities/lovely-professional-university-online/mca
  if (host === 'www.edifyedu.in') {
    const uniWwwMatch = pathname.match(/^\/universities\/([^/]+)(\/.*)?$/)
    if (uniWwwMatch) {
      const oldSlug = uniWwwMatch[1]
      const rest = uniWwwMatch[2] || ''
      const newSlug = OLD_SLUG_REDIRECTS[oldSlug]
      if (newSlug) {
        // Collapse www + old-slug into single hop
        const newPath = newSlug === '__universities_list__'
          ? '/universities'
          : `/universities/${newSlug}${rest}`
        const url = req.nextUrl.clone()
        url.host = 'edifyedu.in'
        url.pathname = newPath
        return NextResponse.redirect(url, 308)
      }
    }
    // Standard www → apex redirect for all other paths
    const url = req.nextUrl.clone()
    url.host = 'edifyedu.in'
    return NextResponse.redirect(url, 308)
  }

  // ── 2. Old university slug 308 redirects ─────────────────────────────────
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
      return NextResponse.redirect(url, 308)
    }
  }

  // ── 3. Admin auth guard ───────────────────────────────────────────────────
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
  // matcher covers all paths so the www check and uni-slug redirects both fire.
  // Admin paths are also matched so the auth guard runs.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logos|public).*)'],
}
