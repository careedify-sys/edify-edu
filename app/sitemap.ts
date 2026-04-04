import { MetadataRoute } from 'next'
import { UNIVERSITIES, getAllPrograms, getAllSpecs } from '@/lib/data'
import type { Program } from '@/lib/data'
import { getPublishedPosts } from '@/lib/blog'
import { GUIDES } from '@/lib/guides'

const BASE = 'https://edifyedu.in'

const progSlug = (p: Program) => p.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
const onlineProgSlug = (p: Program) => 'online-' + progSlug(p)
const specSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Static pages
  const statics: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/universities`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/programs`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/compare`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/guides`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/tools`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // University pages — canonical /universities/ URLs only
  // NOTE: /programs/{prog}/{u.id} URLs are intentionally excluded — they redirect
  // to /universities/{id}/{prog} and redirect sources must not appear in sitemaps.
  const uniPages: MetadataRoute.Sitemap = UNIVERSITIES.flatMap(u => [
    {
      url: `${BASE}/universities/${u.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    ...u.programs.map(prog => ({
      url: `${BASE}/universities/${u.id}/${progSlug(prog)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ])

  // Program index pages — canonical slugs only (online-* variants redirect to these)
  const programs = getAllPrograms()
  const programPages: MetadataRoute.Sitemap = programs.map(prog => (
    { url: `${BASE}/programs/${progSlug(prog)}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.85 }
  ))

  // Specialisation pages — highest value SEO pages
  const specPages: MetadataRoute.Sitemap = programs.flatMap(prog => {
    const specs = getAllSpecs(prog)
    return specs.map(spec => ({
      url: `${BASE}/programs/${progSlug(prog)}/${specSlug(spec)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  })

  // University × program × spec pages — only priority universities to keep sitemap manageable
  const PRIORITY = ['amity','chandigarh','jain','lpu','manipal-jaipur','mahe-manipal','nmims','symbiosis','universi-of-petroleu-and','shoolini','bharati-vidyapee-universi','amrita-vishwa-vidyapee','galgotia-universi']
  const uniSpecPages: MetadataRoute.Sitemap = UNIVERSITIES
    .filter(u => PRIORITY.includes(u.id))
    .flatMap(u =>
      Object.entries(u.programDetails).flatMap(([prog, pd]) => {
        if (!pd?.specs?.length) return []
        const pSlug = (prog as Program).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        return pd.specs.map(spec => ({
          url: `${BASE}/universities/${u.id}/${pSlug}/${specSlug(spec)}`,
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }))
      })
    )

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = getPublishedPosts().map(post => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  // Guides
  const guidePages: MetadataRoute.Sitemap = GUIDES.map(guide => ({
    url: `${BASE}/guides/${guide.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...statics, ...uniPages, ...programPages, ...specPages, ...uniSpecPages, ...blogPages, ...guidePages]
}
