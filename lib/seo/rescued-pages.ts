// lib/seo/rescued-pages.ts
// Program-spec pages that are force-indexed and force-added to the sitemap.
// Two categories:
//   1. Pages rescued from the May 2026 noindex sweep that were genuinely ranking in GSC.
//   2. MBA spec pages with keyword-targeted SEO overrides (June 2026) — these need
//      index,follow so the title/H1/intro optimizations actually reach Google.
//
// Redirected slugs (hospital--health-care-management, marketing-management, etc.)
// are NOT here. Only canonical target paths belong in this list.

export const RESCUED_PROGRAM_PATHS: string[] = [
  // May 2026 rescues (GSC-ranking before noindex sweep)
  '/programs/mba/healthcare-management',   // pos 6.3, 4,872 impressions
  '/programs/mba/operations-management',
  '/programs/mba/business-analytics',
  '/programs/mba/entrepreneurship',
  '/programs/ma/psychology',
  '/programs/bba/aviation',

  // June 2026: MBA spec pages with keyword-targeted SEO overrides
  '/programs/mba/finance',
  '/programs/mba/marketing',
  '/programs/mba/human-resource-management',
  '/programs/mba/it-management',
  '/programs/mba/digital-marketing',
  '/programs/mba/project-management',
  '/programs/mba/international-business',
  '/programs/mba/supply-chain-management',
  '/programs/mba/data-science',
  '/programs/mba/artificial-intelligence',
  '/programs/mba/fintech',
  '/programs/mba/pharmaceutical-management',
]
