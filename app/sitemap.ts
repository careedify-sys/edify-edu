// app/sitemap.ts — rebuilt from Excel-sourced lib/data/valid-urls.json
// Source of truth: data/EdifyEdu_Unified_Programs_v3.xlsx (Programs sheet)
// Regenerate: npm run build:urls
//
// Priority tiers:
//   1.0  /                          (homepage)
//   0.92 /universities, /programs, /compare, /universities/{slug}/{prog}
//   0.90 /programs/{prog}           (program listing pages)
//   0.84 /universities/{slug}       (university hubs)
//   0.80 /universities/{slug}/{prog}/{spec}
//   0.78 /programs/{prog}/{spec}
//   0.75 /blog/{slug}
//   0.70 /guides/{slug}
//   0.65 everything else

import { MetadataRoute } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getPublishedPosts } from '@/lib/blog'
import { GUIDES } from '@/lib/guides'

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
    return { priority: 0.65, freq: 'weekly' }

  if (path === '/about' || path === '/contact' || path === '/privacy-policy')
    return { priority: 0.50, freq: 'yearly' }

  // /programs/{prog}  (exactly 2 segments)
  if (/^\/programs\/[^/]+$/.test(path))
    return { priority: 0.90, freq: 'weekly' }

  // /programs/{prog}/{spec}  (3 segments)
  if (/^\/programs\/[^/]+\/[^/]+$/.test(path))
    return { priority: 0.78, freq: 'monthly' }

  // /universities/{slug}  (2 segments)
  if (/^\/universities\/[^/]+$/.test(path))
    return { priority: 0.84, freq: 'monthly' }

  // /universities/{slug}/{prog}  (3 segments) — money pages
  if (/^\/universities\/[^/]+\/[^/]+$/.test(path))
    return { priority: 0.92, freq: 'monthly' }

  // /universities/{slug}/{prog}/{spec}  (4 segments)
  if (/^\/universities\/[^/]+\/[^/]+\/[^/]+$/.test(path))
    return { priority: 0.80, freq: 'monthly' }

  return { priority: 0.65, freq: 'monthly' }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // ── Registry pages from valid-urls.json ───────────────────────────────────
  const registryPages: MetadataRoute.Sitemap = loadValidUrls().map(path => {
    const { priority, freq } = urlMeta(path)
    return {
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: freq,
      priority,
    }
  })

  // ── Tool pages (not in registry — hardcoded static) ───────────────────────
  const toolPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/tools`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.80 },
    { url: `${BASE}/tools/emi-calculator`,    lastModified: now, changeFrequency: 'monthly', priority: 0.78 },
    { url: `${BASE}/tools/cgpa-calculator`,   lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/tools/percentage-to-gpa`, lastModified: now, changeFrequency: 'monthly', priority: 0.72 },
    { url: `${BASE}/best-online-mba-india`,   lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
  ]

  // ── Blog posts ────────────────────────────────────────────────────────────
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

  return [...registryPages, ...toolPages, ...blogPages, ...guidePages]
}
