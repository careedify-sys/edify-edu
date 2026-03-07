import { MetadataRoute } from 'next'
import { UNIVERSITIES, getAllPrograms, getAllSpecs } from '@/lib/data'
import type { Program } from '@/lib/data'
import { getPublishedPosts } from '@/lib/blog'

const BASE = 'https://edifyedu.in'

const progSlug = (p: Program) => p.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
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
  ]

  // University pages
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
      priority: 0.9, // High — these are the money SEO pages
    })),
  ])

  // Program index pages
  const programs = getAllPrograms()
  const programPages: MetadataRoute.Sitemap = programs.map(prog => ({
    url: `${BASE}/programs/${progSlug(prog)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // Specialisation pages — highest value SEO pages
  const specPages: MetadataRoute.Sitemap = programs.flatMap(prog => {
    const specs = getAllSpecs(prog)
    return specs.map(spec => ({
      url: `${BASE}/programs/${progSlug(prog)}/${specSlug(spec)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9, // "online MBA in finance" = very high intent
    }))
  })

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = getPublishedPosts().map(post => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  return [...statics, ...uniPages, ...programPages, ...specPages, ...blogPages]
}
