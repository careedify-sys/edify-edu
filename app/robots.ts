import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/blog/write',
          '/blog/new',
          '/admin/excel-import/',
          '/university-data/',
        ],
      },
      {
        // Google gets full access for SEO + AI overview
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/admin/excel-import/'],
      },
      {
        // Bing/Perplexity for AEO
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        // GPTBot (OpenAI/ChatGPT)
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        // Claude/Anthropic
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        // Perplexity
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://edifyedu.in/sitemap.xml',
    // LLM training/citation file: https://edifyedu.in/llms.txt
    host: 'https://edifyedu.in',
  }
}
