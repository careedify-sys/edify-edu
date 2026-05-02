// app/robots.ts — Crawl budget directives
// Strategy:
//  • All real bots get full site access, blocked only from admin/API paths
//  • AI bots (GPTBot, ClaudeBot, PerplexityBot, CCBot) explicitly allowed
//    for citation / Answer Engine Optimisation (AEO)
//  • Internal search result pages (?q= queries) blocked — thin duplicate content
//  • Sitemap declaration points crawlers directly to URL inventory

import { MetadataRoute } from 'next'

// /compare? blocks all /compare?a=X&b=Y query-param variants from crawling.
// The canonical for /compare is always https://edifyedu.in/compare (no params).
const BLOCKED = ['/admin/', '/api/', '/blog/write', '/blog/new', '/admin/excel-import/', '/university-data/', '/compare?', '/dashboard/']
const ADMIN_BLOCKED = ['/admin/', '/api/', '/admin/excel-import/', '/compare?']
const API_BLOCKED = ['/admin/', '/api/', '/compare?']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Default rule for all bots
        userAgent: '*',
        allow: '/',
        disallow: BLOCKED,
      },
      {
        // Google — full access, tightest admin block
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ADMIN_BLOCKED,
      },
      {
        // Google Image crawler
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: ADMIN_BLOCKED,
      },
      {
        // Bing / Perplexity AEO
        userAgent: 'Bingbot',
        allow: '/',
        disallow: API_BLOCKED,
      },
      {
        // GPTBot (OpenAI / ChatGPT citations)
        userAgent: 'GPTBot',
        allow: '/',
        disallow: API_BLOCKED,
      },
      {
        // Claude / Anthropic
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: API_BLOCKED,
      },
      {
        // Perplexity AI
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: API_BLOCKED,
      },
      {
        // Common Crawl (used by many AI training datasets)
        userAgent: 'CCBot',
        allow: '/',
        disallow: API_BLOCKED,
      },
      {
        // Meta AI / Llama
        userAgent: 'FacebookBot',
        allow: '/',
        disallow: API_BLOCKED,
      },
    ],
    sitemap: 'https://edifyedu.in/sitemap.xml',
  }
}
