// app/sitemap.ts — rebuilt from Excel-sourced lib/data/valid-urls.json
// Source of truth: data/EdifyEdu_Unified_Programs_v3.xlsx (Programs sheet)
// Regenerate: npm run build:urls
//
// Priority tiers (post-indexation-cleanup 2026-05-25, crawl-fix 2026-06-10):
//   1.0  /                               (homepage)
//   0.92 /universities, /programs, /compare, /best-online-mba-india
//   0.90 /programs/{prog}               (program hub pages — 100% indexed)
//   0.85 /blog/{slug}, /coupons/{slug}, /fees
//   0.80 /universities/{slug}            (uni hubs — 64.9% indexed, need enrichment)
//   0.75 /universities/{slug}/{prog}     (uni+program money pages)
//   0.75 /verify/{slug}                 (university verify pages — index,follow)
//   0.75 /programs/{prog}/{spec}        (rescued GSC ranking spec pages only)
//   0.70 /universities/{slug}/{prog}/{spec} (all ~2,123 spec pages — now index,follow)
//
// EXCLUDED from sitemap (noindexed in page metadata too):
//   /programs/{prog}/{spec}             — 598 pages, 7.9% index rate, removed entirely
//                                         EXCEPTION: RESCUED_PROGRAM_PATHS are force-added

import { MetadataRoute } from 'next'
import { readFileSync, statSync } from 'fs'
import { join } from 'path'
import { getPublishedPosts } from '@/lib/blog'
import { GUIDES } from '@/lib/guides'
import { CGPA_VALUES } from './tools/cgpa-calculator/[value]/data'
import { COUPON_PAGE_SLUGS } from '@/lib/coupon-pages'
import { RESCUED_PROGRAM_PATHS } from '@/lib/seo/rescued-pages'

// Verify slugs: static list pre-built from Supabase (run: npx tsx scripts/build-verify-slugs.ts)
// Falls back to empty array when JSON is absent — never breaks the build.
function loadVerifySlugs(): string[] {
  try {
    return JSON.parse(
      readFileSync(join(process.cwd(), 'lib', 'data', 'verify-slugs.json'), 'utf8')
    ) as string[]
  } catch {
    return []
  }
}

// Returns the file mtime of a page-content JSON, or now as fallback
function getContentLastMod(uniSlug: string, program: string): Date {
  const filePath = join(process.cwd(), 'lib', 'data', 'page-content', `${uniSlug}-${program}.json`)
  try {
    return statSync(filePath).mtime
  } catch {
    return new Date()
  }
}


const BASE = 'https://edifyedu.in'

function loadValidUrls(): string[] {
  try {
    return JSON.parse(
      readFileSync(join(process.cwd(), 'lib', 'data', 'valid-urls.json'), 'utf8')
    ) as string[]
  } catch {
    console.warn('[sitemap] lib/data/valid-urls.json not found. Run: npm run build:urls')
    return []
  }
}

type Freq = MetadataRoute.Sitemap[0]['changeFrequency']

function urlMeta(path: string): { priority: number; freq: Freq } {
  if (path === '/')
    return { priority: 1.0, freq: 'daily' }

  if (path === '/universities' || path === '/programs' || path === '/compare')
    return { priority: 0.92, freq: 'weekly' }

  if (path === '/blog' || path === '/guides')
    return { priority: 0.82, freq: 'daily' }

  if (path === '/coupons')
    return { priority: 0.85, freq: 'weekly' }

  if (path === '/about' || path === '/contact' || path === '/privacy-policy' || path === '/terms')
    return { priority: 0.50, freq: 'yearly' }

  // /programs/{prog}  (exactly 2 segments) — 100% indexed, keep high
  if (/^\/programs\/[^/]+$/.test(path))
    return { priority: 0.90, freq: 'weekly' }

  // /universities/{slug}  (2 segments)
  if (/^\/universities\/[^/]+$/.test(path))
    return { priority: 0.80, freq: 'monthly' }

  // /universities/{slug}/{prog}  (3 segments) — money pages
  if (/^\/universities\/[^/]+\/[^/]+$/.test(path))
    return { priority: 0.75, freq: 'monthly' }

  // /universities/{slug}/{prog}/{spec}  (4 segments) — only rich pages reach here
  if (/^\/universities\/[^/]+\/[^/]+\/[^/]+$/.test(path))
    return { priority: 0.70, freq: 'monthly' }

  return { priority: 0.65, freq: 'monthly' }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // ── Registry pages from valid-urls.json ───────────────────────────────────
  // Filter out thin pages before building sitemap entries:
  //   1. /programs/{prog}/{spec} — all 598 removed (noindexed, 7.9% index rate)
  //   2. /universities/{id}/{prog}/{spec} — all ~2,123 included (index,follow since 2026-06-10)
  const registryPages: MetadataRoute.Sitemap = loadValidUrls()
    .filter(path => {
      // Remove /programs/{prog}/{spec} (3-segment program paths)
      if (/^\/programs\/[^/]+\/[^/]+$/.test(path)) return false

      return true
    })
    .map(path => {
      const { priority, freq } = urlMeta(path)

      // For /universities/{slug}/mba paths, use content JSON file mtime as lastmod
      const mbaMatch = path.match(/^\/universities\/([^/]+)\/mba$/)
      const lastModified = mbaMatch ? getContentLastMod(mbaMatch[1], 'mba') : now

      return {
        url: `${BASE}${path}`,
        lastModified,
        changeFrequency: freq,
        priority,
      }
    })

  // ── Tool pages (not in registry — hardcoded static) ───────────────────────
  const toolPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/fees`,                     lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BASE}/tools`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.80 },
    { url: `${BASE}/tools/emi-calculator`,    lastModified: now, changeFrequency: 'monthly', priority: 0.78 },
    { url: `${BASE}/tools/cgpa-calculator`,   lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/tools/percentage-to-gpa`, lastModified: now, changeFrequency: 'monthly', priority: 0.72 },
    { url: `${BASE}/best-online-mba-india`,   lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
    // CGPA value pages: long-tail "X.X cgpa in percentage" search targets.
    ...CGPA_VALUES.map(entry => ({
      url: `${BASE}/tools/cgpa-calculator/${entry.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.70,
    })),
  ]

  // ── Blog posts ────────────────────────────────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = getPublishedPosts().map(post => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }))

  // ── Coupon pages ──────────────────────────────────────────────────────────
  const couponPages: MetadataRoute.Sitemap = COUPON_PAGE_SLUGS.map(slug => ({
    url: `${BASE}/coupons/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // ── Guides ────────────────────────────────────────────────────────────────
  const guidePages: MetadataRoute.Sitemap = GUIDES.map(guide => ({
    url: `${BASE}/guides/${guide.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.70,
  }))

  // ── Verify pages (static JSON built from Supabase — no dynamic import) ──────
  // Source: lib/data/verify-slugs.json (update with: npx tsx scripts/build-verify-slugs.ts)
  const verifyPages: MetadataRoute.Sitemap = loadVerifySlugs().map(slug => ({
    url: `${BASE}/verify/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  // ── Rescued program-spec pages (force-added, bypasses the registry filter) ──
  // These are /programs/{prog}/{spec} pages that were GSC-ranking before the
  // May 2026 noindex sweep. Their metadata is updated to output index,follow.
  const rescuedPages: MetadataRoute.Sitemap = RESCUED_PROGRAM_PATHS.map(path => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  return [...registryPages, ...toolPages, ...blogPages, ...couponPages, ...guidePages, ...verifyPages, ...rescuedPages]
}
