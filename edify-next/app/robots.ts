import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        // Let Google index everything for AEO/GEO
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        // Allow Bing/Perplexity for AEO
        userAgent: 'Bingbot',
        allow: '/',
      },
    ],
    sitemap: 'https://edifyedu.in/sitemap.xml',
    host: 'https://edifyedu.in',
  }
}
