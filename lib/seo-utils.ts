// lib/seo-utils.ts

export function toUrlSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getProgramSlug(program: string): string {
  // Map internal names like 'B.Com' to URL-friendly 'bcom'
  const mapping: Record<string, string> = {
    'MBA': 'mba',
    'MCA': 'mca',
    'BBA': 'bba',
    'BCA': 'bca',
    'B.A': 'ba',
    'B.Com': 'bcom',
    'M.Com': 'mcom',
    'M.A': 'ma',
    'M.Sc': 'msc',
    'B.Sc': 'bsc',
    'MBA (WX)': 'mba-executive'
  }
  return mapping[program] || toUrlSlug(program)
}

export function getUniversitySlug(id: string, name: string): string {
  // If id is 'amity' and name is 'Amity University Online', 
  // we want 'amity-university'
  const base = toUrlSlug(name)
  if (base.includes('university')) return base
  return `${toUrlSlug(id)}-university`
}

/**
 * Generates the canonical SEO URL for a university program
 * eg: /online-mba/amity-university
 */
export function getSeoUrl(program: string, universityId: string, universityName: string): string {
  const pSlug = getProgramSlug(program)
  const uSlug = getUniversitySlug(universityId, universityName)
  return `/online-${pSlug}/${uSlug}`
}

export function getUniversityIdFromSlug(slug: string, UNIS_SLIM: any[]): string | undefined {
  // Try direct match with id
  if (UNIS_SLIM.some(u => u.id === slug)) return slug
  // Try matching with '-university' suffix
  const base = slug.replace(/-university$/, '')
  if (UNIS_SLIM.some(u => u.id === base)) return base
  // Try fuzzy matching or finding by name-slug
  return UNIS_SLIM.find(u => toUrlSlug(u.name) === slug || toUrlSlug(u.name) === `${slug}-university`)?.id
}

const REVERSE_PM: Record<string, string> = {
  'mba': 'MBA', 'mca': 'MCA', 'bba': 'BBA', 'bca': 'BCA', 'ba': 'BA',
  'bcom': 'B.Com', 'mcom': 'M.Com', 'ma': 'MA', 'msc': 'MSc', 'bsc': 'BSc', 'mba-executive': 'MBA (WX)',
}

export function getProgramFromSlug(slug: string): string | undefined {
  return REVERSE_PM[slug.toLowerCase()]
}
