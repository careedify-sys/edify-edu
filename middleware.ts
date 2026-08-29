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
import CANONICAL_SLUGS from './lib/canonical-slugs.json'
import MA_ALLOWLIST from './lib/data/programme-allowlist-ma.json'
import BCOM_ALLOWLIST from './lib/data/programme-allowlist-bcom.json'
import MCOM_ALLOWLIST from './lib/data/programme-allowlist-mcom.json'
import MBA_ALLOWLIST from './lib/data/programme-allowlist-mba.json'
import BBA_ALLOWLIST from './lib/data/programme-allowlist-bba.json'
import BCA_ALLOWLIST from './lib/data/programme-allowlist-bca.json'
import MCA_ALLOWLIST from './lib/data/programme-allowlist-mca.json'
import BA_ALLOWLIST from './lib/data/programme-allowlist-ba.json'
import MSC_ALLOWLIST from './lib/data/programme-allowlist-msc.json'
import BSC_ALLOWLIST from './lib/data/programme-allowlist-bsc.json'
import SPEC_ALLOWLIST_RAW from './lib/data/spec-allowlist.json'

// Old/truncated university slugs indexed by Google → current slugs
// Verified against lib/data.ts UNIVERSITIES array (2026-04-17)
const OLD_SLUG_REDIRECTS: Record<string, string> = {
  'vit-vellore-online': 'vit-university-online',
  'kiit-university-online': 'kalinga-institute-industrial-technology-online',
  'shanmugha-arts-science-technology-research-online': 'sastra-university-online',
  'shree-guru-gobind-singh-tricentenary-university-online': 'sgt-university-online',
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
  'shanmugh-arts-science-technolo': 'sastra-university-online',
  'shri-ramasamy-memorial-univers': 'srm-university-sikkim-online',
  'sri-ramachandra-universi': 'sri-ramachandra-university-online',
  'teerthanker-universi': 'teerthanker-mahaveer-university-online',
  'universi-of-mysore': 'university-of-mysore-online',
  'vellore-institut-of-technolo': 'vit-university-online',
  'yenepoya-universi': 'yenepoya-university-online',
  'symbiosis': 'symbiosis-university-online',
  // 2026-08-20: repoint bits-pilani-online → bits-pilani-work-integrated-online.
  // Google indexed /universities/bits-pilani-online/mba with BITS Pilani intent
  // (1,692 impr, pos 12.56 in the 16-May-15-Aug-2026 GSC window). The prior
  // target bit-mesra-online is a *different* institution (Birla Institute of
  // Technology, Ranchi, Jharkhand, NAAC A, NIRF #77), not BITS Pilani (Rajasthan,
  // NAAC A+, NIRF #7 University 2025), so the redirect was landing searchers on
  // the wrong university. bits-pilani-work-integrated-online is the canonical
  // BITS Pilani WILP entry in lib/data.ts:6948. BIT Mesra continues to serve
  // directly at /universities/bit-mesra-online/.
  'bits-pilani-online': 'bits-pilani-work-integrated-online',
  'nmims': 'nmims-online',
  'mahe-manipal': 'manipal-academy-higher-education-online',
  'jain': 'jain-university-online',
  'lpu': 'lovely-professional-university-online',
  'sikkim-manipal': 'sikkim-manipal-university-online',
  'manipal-jaipur': 'manipal-university-jaipur-online',
  'manipal': 'manipal-academy-higher-education-online',
  'ignou': 'ignou-online',
  'maharish-markande-universi': 'maharishi-markandeshwar-university-online',
  'chatrapa-shahuji-maharaj-unive': 'chhatrapati-shahu-ji-maharaj-university-online',
  'universi-of-petroleu-and': 'upes-online',
  'uttaranc-universi': 'uttaranchal-university-online',
  'madurai-kamaraj-universi': 'madurai-kamaraj-university-online',
  'aligarh-muslim-universi': 'aligarh-muslim-university-online',
  'guru-nanak-dev-universi': 'guru-nanak-dev-university-online',
  'adichunc-universi': 'adichunchanagiri-university-online',
  'centurio-universi-of-technolo': 'centurion-university-online',
  'centurion-university-of-technology-and-management-online': 'centurion-university-online',
  'jamia-hamdard': 'jamia-hamdard-online',
  'graphic-era-universi': 'graphic-era-university-online',
  'shree-guru-gobind-singh': 'sgt-university-online',
  'kiit-universi': 'kalinga-institute-industrial-technology-online',
  'sage-universi': 'sage-university-online',
  'iift': 'iift-online',
  'guru-jambhesh-universi-of': 'guru-jambheshwar-university-online',
  'bharati-vidyapee-universi': 'bharati-vidyapeeth-university-online',
  'manipal-academy-of-higher-education-online': 'manipal-academy-higher-education-online',
  'amrita-vishwa-vidyapeetham-university-online': 'amrita-vishwa-vidyapeetham-online',
  'bharati-vidyapeeth-online': 'bharati-vidyapeeth-university-online',
  'bs-abdur-rahman-institute-of-science-and-technology-online': 'bs-abdur-rahman-university-online',
  'central-university-of-himachal-pradesh-online': 'central-university-himachal-pradesh-online',
  'charotar-university-of-science-technology-online': 'charusat-university-online',
  'chatrapati-shahuji-maharaj-university-online': 'chhatrapati-shahu-ji-maharaj-university-online',
  'christ-deemed-to-be-university-online': 'christ-university-online',
  'datta-meghe-institute-of-higher-education-and-research-online': 'datta-meghe-university-online',
  'dayanand-sagar-university-online': 'dayananda-sagar-university-online',
  'dr-dy-patil-vidyapeeth-pune-online': 'dr-dy-patil-vidyapeeth-online',
  'dr-mgr-educational-and-research-institute-online': 'dr-mgr-educational-research-institute-online',
  'dy-patil-navi-mumbai-online': 'dy-patil-university-online',
  'graphic-era-online': 'graphic-era-university-online',
  'guru-gobind-singh-indraprastha-vishwavidyalaya-online': 'guru-gobind-singh-indraprastha-university-online',
  'guru-jambheshwar-university-of-science-and-technology-online': 'guru-jambheshwar-university-online',
  'hindustan-institute-of-technology-and-science-hits-online': 'hindustan-institute-technology-online',
  'icfai-foundation-for-higher-education-online': 'icfai-university-online',
  'indian-institute-of-foreign-trade-online': 'iift-online',
  'jain-deemed-to-be-university-online': 'jain-university-online',
  'jamia-millia-islamia-university-online': 'jamia-millia-islamia-online',
  'jaypee-institute-of-information-technology-online': 'jaypee-university-online',
  'jss-academy-of-education-and-research-online': 'jss-university-online',
  'kalasalingam-academy-of-research-and-higher-education-online': 'kalasalingam-university-online',
  'kalinga-institute-of-industrial-technology-online': 'kalinga-institute-industrial-technology-online',
  'karunya-institute-of-technology-and-sciences-online': 'karunya-university-online',
  'koneru-lakshmaiah-education-foundation-online': 'kl-university-online',
  'maharishi-markandeshwar-online': 'maharishi-markandeshwar-university-online',
  'manav-rachna-international-institute-of-research-studies-online': 'manav-rachna-online',
  'manipal-university-online': 'manipal-university-jaipur-online',
  'meenakshi-academy-of-higher-education-and-research-online': 'meenakshi-academy-higher-education-online',
  'mody-university-of-science-and-technology-online': 'mody-university-online',
  'narsee-monjee-institute-of-management-studies-nmims-online': 'nmims-online',
  'sathyabama-institute-of-science-and-technology-online': 'sathyabama-university-online',
  'shanmugha-arts-science-technology-research-academy-online': 'sastra-university-online',
  'shiv-nadar-institution-of-eminence-online': 'shiv-nadar-university-online',
  'shobhit-institute-of-engineering-technology-online': 'shobhit-university-online',
  'shoolini-university-of-biotechnology-and-management-sciences-online': 'shoolini-university-online',
  'sri-ramachandra-institute-of-higher-education-and-research-online': 'sri-ramachandra-university-online',
  'srm-institute-of-sciences-and-technology-online': 'srm-institute-science-technology-online',
  'swami-vivekanand-subharti-university-online': 'subharti-university-online',
  'symbiosis-international-online': 'symbiosis-university-online',
  'the-northcap-university-online': 'northcap-university-online',
  'university-of-petroleum-and-energy-studies-online': 'upes-online',
  'vellore-institute-of-technology-online': 'vit-university-online',
  'vels-institute-of-science-technology-advanced-studies-vistas-online': 'vels-university-online',
  'vignans-foundation-for-science-technology-and-research-online': 'vignan-university-online',
  'visvesvaraya-technological-university-online': 'vtu-online',
  'yenepoya-online': 'yenepoya-university-online',
  'amity-university-rajasthan-online': 'amity-university-online',
  // Birla Institute of Technology (BIT) aliases → BIT Mesra Ranchi, not BITS
  // Pilani. Previously chained through bits-pilani-online, but as of 2026-08-20
  // that slug points at BITS Pilani WILP, so these must resolve directly.
  'birla-institute-of-technology-online': 'bit-mesra-online',
  'birla-institut-of-technolo': 'bit-mesra-online',
  'international-institute-of-information-technology-online': 'iiit-bangalore-online',
  'internat-institut-of-informat': 'iiit-bangalore-online',
  'dypatil': 'dy-patil-university-online',
  'dy-patil': 'dy-patil-university-online',
  'sathyaba-institut-of-science': 'sathyabama-university-online',
  'srm-university-online': 'srm-institute-science-technology-online',

  // 2026-05-25 GSC BrokenSlugs batch — slugs previously handled only by
  // next.config redirects. Inlining here so www→apex + old-slug collapses
  // to a single 308 hop instead of two, and so the resolver path skips
  // the fuzzy fallback on these known cases.
  'amity': 'amity-university-online',
  'assam-down-town-universi': 'assam-don-bosco-university-online',
  'chandigarh': 'chandigarh-university-online',
  'charotar-universi-of-science': 'charusat-university-online',
  'galgotia-universi': 'galgotias-university-online',
  'gujarat-universi': 'gujarat-university-online',
  'integral-universi': 'integral-university-online',
  'karunya-institut-of-technolo': 'karunya-university-online',
  'kurukshe-universi': 'kurukshetra-university-online',
  'mahatma-gandhi-universi': 'mahatma-gandhi-university-online',
  'mizoram-universi': 'mizoram-university-online',
  'mody-universi-of-science': 'mody-university-online',
  'noida-internat-universi': 'noida-international-university-online',
  'parul-universi': 'parul-university-online',
  'sgt-universi': 'sgt-university-online',
  'sharda-universi': 'sharda-university-online',
  'shoolini': 'shoolini-university-online',
  'vignans-foundati-for-science': 'vignan-university-online',
  'visveswa-technolo-universi': 'vtu-online',
}

const PROTECTED_PATHS = ['/admin', '/admin/cms', '/blog/write', '/leads']
const LOGIN_COOKIE = 'edify_admin_session'

// ── Self-healing slug resolver ──────────────────────────────────────────────
// Any unknown /universities/{slug} that isn't a canonical slug AND isn't in
// OLD_SLUG_REDIRECTS gets matched to the closest canonical slug by token
// overlap. This makes new redirects automatic — when Google or external sites
// reference a truncated or aliased slug we have not catalogued, the resolver
// finds it. Stop-words and short tokens are filtered to avoid false positives.

// Tokens shared by most university slugs — filtered before fuzzy matching so
// the resolver leans on the genuinely-distinguishing tokens. Domain-specific
// words like "institute", "academy", "educational" are NOT here because they
// often ARE the discriminator (e.g. "dr-mgr-educational-research-institute"
// vs "dr-mgr-college"). Keep this list tight.
const STOP_TOKENS = new Set([
  'university', 'universi', 'uni', 'online', 'of', 'the', 'and', 'for',
  'in', 'on', 'at', 'an', 'edu', 'be', 'to',
  'deemed', 'higher', 'research', 'studies',
])

function tokensOf(slug: string): string[] {
  return slug
    .split('-')
    .filter(t => t.length >= 3 && !STOP_TOKENS.has(t))
}

function fuzzyResolveSlug(unknown: string): string | null {
  const want = tokensOf(unknown)
  if (want.length === 0) return null
  // Tiered scoring: exact-token match outranks prefix-match outranks no
  // match. The tie-break preference for "exact" stops e.g. "shivaji-universi"
  // from picking "shiv-nadar-university-online" over "shivaji-university-online".
  let best: { slug: string; exact: number; prefix: number } | null = null
  for (const canonical of CANONICAL_SLUGS as string[]) {
    const have = tokensOf(canonical)
    if (have.length === 0) continue
    let exact = 0
    let prefix = 0
    for (const w of want) {
      if (have.includes(w)) {
        exact++
        continue
      }
      const matched = have.some(h => {
        const shorter = h.length < w.length ? h : w
        const longer = h.length < w.length ? w : h
        // Prefix overlap with ≥4 char shared and ≥0.5 length ratio. Catches
        // truncations like "internat" vs "international" or "shiv" vs
        // "shivaji" without letting tiny prefixes stand in for whole names.
        return shorter.length >= 4
          && longer.startsWith(shorter)
          && shorter.length / longer.length >= 0.5
      })
      if (matched) prefix++
    }
    if (exact + prefix === 0) continue
    const total = exact + prefix
    const bestTotal = best ? best.exact + best.prefix : -1
    // Prefer higher total coverage; tie-break by more exact matches. This
    // way "dayal-bagh-educatio-institut" picks "dayalbagh-educational-
    // institute-online" (3 prefixes) over "deen-dayal-..." (1 exact only).
    if (
      !best
      || total > bestTotal
      || (total === bestTotal && exact > best!.exact)
    ) {
      best = { slug: canonical, exact, prefix }
    }
  }
  if (!best) return null
  // Need ≥66% of distinguishing want-tokens covered (exact + prefix). Combined
  // with the ≤2-char and stop-word filtering in tokensOf() this prevents
  // stray matches but still rescues single-token truncations like "kurukshe".
  const need = Math.ceil(want.length * 0.66)
  if (best.exact + best.prefix >= Math.max(1, need)) return best.slug
  return null
}

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const { pathname } = req.nextUrl

  // ── 0. /programmes/ legacy path → canonical university page (308) ───────
  // Fires before ISR cache lookup, so a frozen revalidate:false 200 cannot
  // win. Catches /universities/:id/programmes/:uuid and any deeper variants
  // left in Google's index from the old CMS URL scheme.
  const programmesMatch = pathname.match(/^\/universities\/([^/]+)\/programmes(\/.*)?$/)
  if (programmesMatch) {
    const url = req.nextUrl.clone()
    url.pathname = `/universities/${programmesMatch[1]}`
    return NextResponse.redirect(url, 308)
  }

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

  // ── 2a0. online-X program prefix redirect (online-mcom → mcom, online-mba → mba) ───
  const onlineProgMatch = pathname.match(/^\/universities\/([^/]+)\/(online-)(mba|mca|bba|bca|bcom|mcom|ma|ba|msc|bsc)(\/.*)?$/)
  if (onlineProgMatch) {
    const url = req.nextUrl.clone()
    url.pathname = `/universities/${onlineProgMatch[1]}/${onlineProgMatch[3]}${onlineProgMatch[4] || ''}`
    return NextResponse.redirect(url, 308)
  }

  // ── 2a0b. /programs/online-X prefix redirect (online-ba → ba, online-mba → mba) ───
  const onlineProgramsMatch = pathname.match(/^\/programs\/(online-)(mba|mca|bba|bca|bcom|mcom|ma|ba|msc|bsc)(\/.*)?$/)
  if (onlineProgramsMatch) {
    const url = req.nextUrl.clone()
    url.pathname = `/programs/${onlineProgramsMatch[2]}${onlineProgramsMatch[3] || ''}`
    return NextResponse.redirect(url, 308)
  }

  // ── 2a. /programs/ spec slug redirects (Google-indexed bad slugs → correct ones) ───
  const PROGRAM_SPEC_REDIRECTS: Record<string, string> = {
    '/programs/mba/hospital-healthcare': '/programs/mba/healthcare-management',
    '/programs/mba/hospital--healthcare-management': '/programs/mba/healthcare-management',
    // hospital-health-care-management is what --  cleanup produces from hospital--health-care-management
    '/programs/mba/hospital-health-care-management': '/programs/mba/healthcare-management',
    '/programs/mba/hospital-and-health-care-management': '/programs/mba/healthcare-management',
    '/programs/mba/digital-marketing-sales': '/programs/mba/digital-marketing',
    '/programs/mba/tourism-event-management': '/programs/mba/entrepreneurship',
    // media--communication: canonical is media-management, not digital-marketing
    '/programs/mba/media--communication': '/programs/mba/media-management',
    '/programs/mba/marketing-management': '/programs/mba/marketing',
    // data-science-ai is what -- cleanup produces from data-science--ai
    '/programs/mba/data-science-ai': '/programs/mba/data-science',
    '/programs/mca/cyber-security-cyber-forensics': '/programs/mca/cyber-security',
    '/programs/bcom/gls-university-online': '/universities/gls-university-online/bcom',
    '/programs/mba/commerce--finance-focus': '/programs/mba/finance',
  }
  if (PROGRAM_SPEC_REDIRECTS[pathname]) {
    const url = req.nextUrl.clone()
    url.pathname = PROGRAM_SPEC_REDIRECTS[pathname]
    return NextResponse.redirect(url, 308)
  }

  // ── 2a1. Legacy static URL redirects (Wix/HTML-era leftovers indexed by Google) ───
  const LEGACY_STATIC_REDIRECTS: Record<string, string> = {
    '/courses.html': '/programs',
    '/thankyou.html': '/',
    '/index.html': '/',
    '/ugc-approved-online-universities': '/blog/ugc-deb-approved-online-universities-india',
  }
  if (LEGACY_STATIC_REDIRECTS[pathname]) {
    const url = req.nextUrl.clone()
    url.pathname = LEGACY_STATIC_REDIRECTS[pathname]
    return NextResponse.redirect(url, 308)
  }

  // ── 2a2. Blog/guide 308 redirects (canonicalise cannibalising pages) ───────
  // mba-course-duration: one slug only in GSC, redirect to the existing post
  // executive-mba: best-college variant never published; redirect to the stronger post
  // online-mba-vs-distance-mba: guide is canonical; blog post is the duplicate
  const BLOG_REDIRECTS: Record<string, string> = {
    '/blog/mba-course-duration-how-many-years-2026': '/blog/mba-course-duration-india-2026',
    '/blog/best-college-executive-mba-india-2026': '/blog/top-executive-mba-programs-india-2026',
    '/blog/online-mba-vs-distance-mba-difference-2026': '/guides/online-mba-vs-distance-mba',
    '/blog/online-bba-in-india-2026': '/blog/best-online-bba-colleges-india-2026',
    '/blog/online-bba-india-2026': '/blog/best-online-bba-colleges-india-2026',
  }
  if (BLOG_REDIRECTS[pathname]) {
    const url = req.nextUrl.clone()
    url.pathname = BLOG_REDIRECTS[pathname]
    return NextResponse.redirect(url, 308)
  }

  // ── 2a3. Double-dash cleanup in any URL (media--communication → media-communication) ───
  if (pathname.includes('--')) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.replace(/--+/g, '-')
    return NextResponse.redirect(url, 308)
  }

  // ── 2b. Program slug normalization (b-com → bcom, m-com → mcom, etc.) ───
  const progFixMap: Record<string, string> = {
    'b-com': 'bcom', 'm-com': 'mcom', 'b-sc': 'bsc', 'm-sc': 'msc',
    'b-ba': 'bba', 'b-ca': 'bca', 'm-ba': 'mba', 'm-ca': 'mca',
  }
  const progMatch = pathname.match(/^\/universities\/([^/]+)\/([^/]+)(\/.*)?$/)
  if (progMatch) {
    const fixedProg = progFixMap[progMatch[2]]
    if (fixedProg) {
      const url = req.nextUrl.clone()
      url.pathname = `/universities/${progMatch[1]}/${fixedProg}${progMatch[3] || ''}`
      return NextResponse.redirect(url, 308)
    }
  }

  // ── 2c. Self-healing fallback for unknown university slugs ───────────────
  // Runs only for /universities/{slug}/... paths where the slug is neither
  // a canonical match nor an explicit OLD_SLUG_REDIRECTS entry. Token-overlap
  // resolver picks the closest canonical and 308s. This way, future renames,
  // truncations and external mis-slugs do not 404 without us cataloguing them.
  if (uniMatch) {
    const oldSlug = uniMatch[1]
    const isCanonical = (CANONICAL_SLUGS as string[]).includes(oldSlug)
    if (!isCanonical && !OLD_SLUG_REDIRECTS[oldSlug]) {
      const resolved = fuzzyResolveSlug(oldSlug)
      if (resolved) {
        const rest = uniMatch[2] || ''
        const url = req.nextUrl.clone()
        url.pathname = `/universities/${resolved}${rest}`
        return NextResponse.redirect(url, 308)
      }
    }
  }

  // ── 2d. Programme hub + subtree allowlist (Task 3 generic-route slices) ──
  // Return real HTTP 404 at the edge for /universities/{slug}/{prog}(/...)?
  // paths whose (slug, prog) is absent from the pre-generated allowlist.
  // Runs before Next's App Router so the ISR pin can't seal a 200 on the
  // not-found shell (revalidate=false + dynamicParams=true).
  //
  // Slice 5 (2026-08-19): match widened from hub-only to hub + subtree.
  // Rationale: if the (slug, prog) hub is not real, nothing beneath it is
  // real either, so 404ing the whole subtree costs zero bundle (one regex
  // change, no new allowlist) and closes the 91 spec-shell 200s that slice
  // 4 pruned from the sitemap but did not stop the spec route from
  // rendering. Rejected the alternative spec-level allowlist because a
  // materialised list of ~1,992 specs would be ~10x the seven hub
  // allowlists.
  // "Valid hub, invalid spec" is a separate case, already closed by the
  // fabrication hotfix's exact-manifest-membership gate; do not re-solve
  // it here.
  //
  // Allowlist source: lib/seo/resolve-programme.ts, materialised by
  // scripts/build-programme-allowlist.js in the prebuild chain, invariance
  // enforced by scripts/check-programme-allowlist-resolver.ts on pre-commit.
  // Slice 1 (2026-08-18): MA. Slice 2 (2026-08-18): + B.Com, M.Com.
  // Slice 3a (2026-08-18): + MBA. Slice 3b (2026-08-18): + BBA, BCA, MCA.
  // Slice 5 (2026-08-19): widen match from hub-only to subtree.
  // Slice 6 (2026-08-29): + BA, MSc, BSc. Those three are real programmes in
  // lib/data.ts served by the generic [program] route, but had no allowlist,
  // so 387 hub paths (117 /ba + 128 /msc + 142 /bsc) plus their whole spec
  // subtrees rendered the not-found shell under HTTP 200.
  // Extend by adding a new allowlist import + row to PROGRAMME_HUB_ALLOWLISTS.
  const PROGRAMME_HUB_ALLOWLISTS: { slug: string; allowlist: string[] }[] = [
    { slug: 'ma', allowlist: MA_ALLOWLIST as string[] },
    { slug: 'bcom', allowlist: BCOM_ALLOWLIST as string[] },
    { slug: 'mcom', allowlist: MCOM_ALLOWLIST as string[] },
    { slug: 'mba', allowlist: MBA_ALLOWLIST as string[] },
    { slug: 'bba', allowlist: BBA_ALLOWLIST as string[] },
    { slug: 'bca', allowlist: BCA_ALLOWLIST as string[] },
    { slug: 'mca', allowlist: MCA_ALLOWLIST as string[] },
    { slug: 'ba', allowlist: BA_ALLOWLIST as string[] },
    { slug: 'msc', allowlist: MSC_ALLOWLIST as string[] },
    { slug: 'bsc', allowlist: BSC_ALLOWLIST as string[] },
  ]
  for (const { slug: progSlug, allowlist } of PROGRAMME_HUB_ALLOWLISTS) {
    // Match hub OR any subtree beneath it. The optional /.* after the
    // programme slug is what widens slice 5 from hub-only to hub + subtree.
    // The trailing (?:/.*)?$ is anchored so /uni/foo/mbatest is NOT matched
    // as the mba programme.
    const re = new RegExp(`^/universities/([^/]+)/${progSlug}(?:/.*)?$`)
    const match = pathname.match(re)
    if (match) {
      if (!allowlist.includes(match[1])) {
        return new NextResponse(null, { status: 404 })
      }
      break
    }
  }

  // ── 2e. Unknown segment under /universities/{id}/ → real 404 ─────────────
  // 2d only fires for the ten slugs that own an allowlist. Any other second
  // segment (a typo, a stale external link, a scraped slug) falls through to
  // app/universities/[id]/[program]/, whose resolver calls notFound() but
  // cannot set the status: that route has a loading.tsx, so Next flushes the
  // streaming shell with a 200 before the page component ever runs. Same
  // class of soft 404 that 2d exists to close, so close it the same way, at
  // the edge, where no streaming has started yet.
  //
  // app/universities/[id]/ has no non-programme children, so the set of
  // legitimate second segments is exactly the ten allowlisted programme slugs
  // plus the segments an earlier section or a next.config.js redirect already
  // owns. Those are exempted rather than 404'd so their 308 still fires
  // regardless of whether middleware or next.config redirects run first.
  const KNOWN_UNI_CHILD_SEGMENTS = new Set<string>([
    ...PROGRAMME_HUB_ALLOWLISTS.map(r => r.slug),
    // section 0 above
    'programmes',
    // next.config.js redirects
    'mba-wx',
    'online-mba', 'online-mca', 'online-bba', 'online-bca', 'online-bcom',
    'online-mcom', 'online-ma', 'online-ba', 'online-msc', 'online-bsc',
  ])
  const uniChildMatch = pathname.match(/^\/universities\/[^/]+\/([^/]+)(?:\/.*)?$/)
  if (uniChildMatch && !KNOWN_UNI_CHILD_SEGMENTS.has(uniChildMatch[1].toLowerCase())) {
    return new NextResponse(null, { status: 404 })
  }

  // ── 2f. Valid hub, unknown specialisation → real 404 ─────────────────────
  // The last soft-404 class under /universities. 2d and 2e stop at the hub, so
  // /universities/{allowlisted-uni}/{prog}/{anything} still reached the spec
  // route, which calls notFound() in both the page component and
  // generateMetadata and still served the not-found UI inside a 200.
  //
  // dynamicParams=false, the fix used on /blog/[slug] and /universities/[id],
  // is not available here. generateStaticParams deliberately omits two sets
  // that must keep working: 148 spec URLs that render real content via alias
  // resolution, and 2,991 alias URLs that 308 onto their canonical slug.
  // Prerendering the latter would degrade those 308s into meta-refresh HTML
  // (see getProgramSpecParams in lib/data/programs.ts). Both counts measured
  // 2026-08-29. So the status is decided here instead, before Next routes.
  //
  // Allowlist source: resolveSpec() in lib/data/programs.ts, materialised by
  // scripts/build-spec-allowlist.mts, invariance enforced by
  // scripts/check-spec-allowlist.ts on pre-commit. Alias slugs ARE in the
  // allowlist, so they pass here and the route still issues its 308.
  const SPEC_ALLOWLIST = SPEC_ALLOWLIST_RAW as unknown as { s: string[]; m: Record<string, number[]>; r: Record<string, number[]> }
  const specMatch = pathname.match(/^\/universities\/([^/]+)\/([^/]+)\/([^/]+)\/?$/)
  if (specMatch) {
    const [, specUniId, specProgSlug, specSlug] = specMatch
    // Only the ten real programme slugs. The online-* and mba-wx segments
    // exempted in 2e reach here too, and next.config.js owns their 308.
    if (PROGRAMME_HUB_ALLOWLISTS.some(r => r.slug === specProgSlug)) {
      const pairKey = `${specUniId}|${specProgSlug}`
      const accepted = SPEC_ALLOWLIST.m[pairKey]
      const wanted = specSlug.toLowerCase()
      // No entry at all means the hub is real but carries no specialisation,
      // so nothing beneath it can resolve either.
      const ok = accepted ? accepted.some(i => SPEC_ALLOWLIST.s[i] === wanted) : false
      if (!ok) return new NextResponse(null, { status: 404 })

      // Allowed, but an alias of the slug this university actually uses.
      // Redirect here rather than letting the route do it: these pages are
      // statically generated, and Next encodes a redirect() during static
      // generation as a meta-refresh 200 with a cross-canonical rather than an
      // HTTP 308. ISR renders the first request the same way, so removing the
      // aliases from generateStaticParams does not help either. 3,223 alias
      // URLs were served that way before this block, e.g.
      // /universities/amity-university-online/mba/hrm.
      const aliasPairs = SPEC_ALLOWLIST.r[pairKey]
      if (aliasPairs) {
        for (let i = 0; i < aliasPairs.length; i += 2) {
          if (SPEC_ALLOWLIST.s[aliasPairs[i]] !== wanted) continue
          const url = req.nextUrl.clone()
          url.pathname = `/universities/${specUniId}/${specProgSlug}/${SPEC_ALLOWLIST.s[aliasPairs[i + 1]]}`
          return NextResponse.redirect(url, 308)
        }
      }
    }
  }

  // ── 3. Admin auth guard ───────────────────────────────────────────────────
  // Path-boundary check, not raw startsWith. Without the "/" suffix,
  // startsWith('/admin') matches /admin-login too, which then redirects to
  // /admin-login?from=/admin-login and loops forever.
  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
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
