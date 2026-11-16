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
// Every group gets the same list. Googlebot and other named bots obey only
// their own group, so a shorter list there silently dropped disallows that
// the * group had (audit T2, 2026-11-16).
const BLOCKED = ['/admin/', '/api/', '/blog/write', '/blog/new', '/admin/excel-import/', '/university-data/', '/compare?', '/dashboard/']

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
        // Google
        userAgent: 'Googlebot',
        allow: '/',
        disallow: BLOCKED,
      },
      {
        // Google Image crawler
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: BLOCKED,
      },
      {
        // Bing / Perplexity AEO
        userAgent: 'Bingbot',
        allow: '/',
        disallow: BLOCKED,
      },
      {
        // GPTBot (OpenAI / ChatGPT citations)
        userAgent: 'GPTBot',
        allow: '/',
        disallow: BLOCKED,
      },
      {
        // Claude / Anthropic
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: BLOCKED,
      },
      {
        // Perplexity AI
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: BLOCKED,
      },
      {
        // Common Crawl (used by many AI training datasets)
        userAgent: 'CCBot',
        allow: '/',
        disallow: BLOCKED,
      },
      {
        // Meta AI / Llama
        userAgent: 'FacebookBot',
        allow: '/',
        disallow: BLOCKED,
      },
    ],
    sitemap: 'https://edifyedu.in/sitemap.xml',
  }
}
