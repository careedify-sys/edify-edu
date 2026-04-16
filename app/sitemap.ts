// app/sitemap.ts — Technical SEO sitemap
// Strategy:
//  • Priorities are tiered: crawl budget flows to highest-value pages first
//  • changeFrequency is realistic (not everything is 'weekly')
//  • All 125+ universities included for spec pages (no whitelist filter)
//  • University × program pages are the #1 money pages → priority 0.92
//  • Query-param compare URLs (/compare?a=x&b=y) intentionally excluded
//  • Redirect sources (/programs/{prog}/{id}) intentionally excluded

import { MetadataRoute } from 'next'
import { UNIVERSITIES, getAllPrograms, getAllSpecs } from '@/lib/data'
import type { Program } from '@/lib/data'
import { getPublishedPosts } from '@/lib/blog'
import { GUIDES } from '@/lib/guides'

const BASE = 'https://edifyedu.in'

const progSlug = (p: Program) =>
  p.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const specSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Tier priority by NIRF rank — better-ranked universities deserve more crawl budget
function uniPriority(nirf: number): number {
  if (nirf <= 50)   return 0.92
  if (nirf <= 100)  return 0.88
  if (nirf <= 200)  return 0.84
  return 0.80
}

// Program-level page priority — MBA/MCA > BBA/BCA > others
function progPriority(prog: Program): number {
  if (prog === 'MBA' || prog === 'MCA') return 0.92
  if (prog === 'BBA' || prog === 'BCA') return 0.85
  return 0.78
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // ── Static pages ──────────────────────────────────────────────────────────
  const statics: MetadataRoute.Sitemap = [
    // Homepage — crawled daily, maximum priority
    { url: BASE,                              lastModified: now, changeFrequency: 'daily',   priority: 1.0 },

    // High-intent listing pages
    { url: `${BASE}/universities`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.92 },
    { url: `${BASE}/programs`,                lastModified: now, changeFrequency: 'weekly',  priority: 0.90 },
    { url: `${BASE}/compare`,                 lastModified: now, changeFrequency: 'weekly',  priority: 0.88 },

    // Content hub
    { url: `${BASE}/blog`,                    lastModified: now, changeFrequency: 'daily',   priority: 0.82 },
    { url: `${BASE}/guides`,                  lastModified: now, changeFrequency: 'weekly',  priority: 0.75 },

    // Tools — transactional intent
    { url: `${BASE}/tools`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.80 },
    { url: `${BASE}/tools/emi-calculator`,    lastModified: now, changeFrequency: 'monthly', priority: 0.78 },
    { url: `${BASE}/tools/cgpa-calculator`,   lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/tools/percentage-to-gpa`, lastModified: now, changeFrequency: 'monthly', priority: 0.72 },

    // Brand / trust pages
    { url: `${BASE}/about`,                   lastModified: now, changeFrequency: 'yearly',  priority: 0.50 },
    { url: `${BASE}/contact`,                 lastModified: now, changeFrequency: 'yearly',  priority: 0.50 },
    { url: `${BASE}/privacy-policy`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.30 },
  ]

  // ── University hub pages (/universities/{id}) ─────────────────────────────
  // One entry per university — priority tiered by NIRF rank
  const uniHubPages: MetadataRoute.Sitemap = UNIVERSITIES.map(u => ({
    url: `${BASE}/universities/${u.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: uniPriority(u.nirf),
  }))

  // ── University × program pages — HIGHEST PRIORITY ─────────────────────────
  // e.g. /universities/amity-university-online/mba
  // These are the primary landing pages for each degree program
  // NOTE: /programs/{prog}/{u.id} redirects to these — excluded from sitemap
  const uniProgPages: MetadataRoute.Sitemap = UNIVERSITIES.flatMap(u =>
    u.programs
      .filter(prog => !!u.programDetails[prog])
      .map(prog => ({
        url: `${BASE}/universities/${u.id}/${progSlug(prog)}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: progPriority(prog),
      }))
  )

  // ── Program index pages (/programs/{prog}) ────────────────────────────────
  // e.g. /programs/mba, /programs/mca, /programs/bba, /programs/bca
  const programs = getAllPrograms()
  const programListPages: MetadataRoute.Sitemap = programs.map(prog => ({
    url: `${BASE}/programs/${progSlug(prog)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: progPriority(prog),
  }))

  // ── Global specialisation pages (/programs/{prog}/{spec}) ─────────────────
  // e.g. /programs/mba/finance, /programs/mca/data-science
  // These are the richest keyword-targeted pages on the site
  const specListPages: MetadataRoute.Sitemap = programs.flatMap(prog => {
    const specs = getAllSpecs(prog)
    const base = progPriority(prog)
    return specs.map(spec => ({
      url: `${BASE}/programs/${progSlug(prog)}/${specSlug(spec)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: base,
    }))
  })

  // ── University × program × spec pages (/universities/{id}/{prog}/{spec}) ──
  // e.g. /universities/amity-university-online/mba/finance
  // ALL universities included (not just a whitelist) — flatMap returns [] for unis
  // with no spec data so no bloat from empty entries
  const uniSpecPages: MetadataRoute.Sitemap = UNIVERSITIES.flatMap(u => {
    const nirfPri = uniPriority(u.nirf)
    return Object.entries(u.programDetails).flatMap(([prog, pd]) => {
      if (!pd?.specs?.length) return []
      const pSlug = progSlug(prog as Program)
      const basePri = Math.min(nirfPri, progPriority(prog as Program))
      return pd.specs.map(spec => ({
        url: `${BASE}/universities/${u.id}/${pSlug}/${specSlug(spec)}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: Math.round(basePri * 100 - 5) / 100, // slightly below the program page
      }))
    })
  })

  // ── Blog posts ────────────────────────────────────────────────────────────
  // lastModified uses actual publish date; changeFrequency yearly (evergreen)
  const blogPages: MetadataRoute.Sitemap = getPublishedPosts().map(post => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.75,
  }))

  // ── Guides ────────────────────────────────────────────────────────────────
  const guidePages: MetadataRoute.Sitemap = GUIDES.map(guide => ({
    url: `${BASE}/guides/${guide.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.70,
  }))

  // Return in priority order: statics → program pages → uni hubs → uni×prog →
  // prog listings → spec listings → uni×spec → blog → guides
  return [
    ...statics,
    ...uniProgPages,
    ...uniHubPages,
    ...programListPages,
    ...specListPages,
    ...uniSpecPages,
    ...blogPages,
    ...guidePages,
  ]
}
