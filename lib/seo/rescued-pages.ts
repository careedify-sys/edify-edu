// lib/seo/rescued-pages.ts
// Program-spec pages that were noindexed in the May 2026 cleanup but were
// genuinely ranking in GSC. These are force-indexed and force-added to the
// sitemap so the filter in app/sitemap.ts does not strip them.
//
// hospital--health-care-management and marketing-management are NOT here because
// they are 301 redirects to healthcare-management and marketing respectively.
// Only canonical paths belong in this list.

export const RESCUED_PROGRAM_PATHS: string[] = [
  '/programs/mba/healthcare-management',   // pos 6.3, 4,872 impressions
  '/programs/mba/operations-management',
  '/programs/mba/business-analytics',
  '/programs/mba/entrepreneurship',
  '/programs/ma/psychology',
  '/programs/bba/aviation',
]
