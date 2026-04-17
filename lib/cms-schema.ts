// lib/cms-schema.ts — Edify CMS Data Schema & Validators
// Single source of truth for what valid CMS data looks like.
// Used by /api/cms/validate and the admin CMS page.

// ── Column Definitions ────────────────────────────────────────────────────────

export const UNIVERSITY_COLUMNS = {
  required: ['ID', 'University Full Name', 'Programs Offered', 'NAAC Grade', 'Region'],
  optional: [
    'Abbreviation', 'City', 'State',
    'NIRF Rank', 'NIRF Management Rank', 'NAAC Score',
    'UGC DEB (TRUE/FALSE)', 'PSU Eligible (TRUE/FALSE)', 'Govt Recognised (TRUE/FALSE)',
    'Exam Mode', 'Eligibility', 'Eligibility %',
    'Fee Min ₹', 'Fee Max ₹', 'EMI From ₹/month',
    'Approvals (comma sep)', 'Highlight Badge', 'Tagline', 'Short Description',
    'For Who (pipe sep)', 'Not For (pipe sep)', 'Brand Color', 'Status',
  ],
} as const

export const PROGRAM_COLUMNS = {
  required: ['University ID', 'Program'],
  optional: [
    'Specialisations (comma sep)', 'Fee Range', 'Duration', 'Avg Salary',
    'Entry Roles (comma sep)', 'Top Companies (comma sep)',
    'Internship / Project Type', 'Career Outcome (1 sentence)',
  ],
} as const

export const BLOG_COLUMNS = {
  required: ['Slug (URL)', 'Title', 'Status'],
  optional: [
    'Meta Description', 'Category', 'Tags (comma sep)',
    'Published Date', 'Read Time (min)', 'Target Keyword',
    'FAQs (JSON array)', 'Content (HTML)', 'CTA Title', 'CTA Description',
  ],
} as const

export const GUIDE_COLUMNS = {
  required: ['ID (URL slug)', 'Title', 'Content (HTML)'],
  optional: ['Icon (emoji)', 'Tag / Category', 'Short Description', 'Read Time'],
} as const

export const LOGO_COLUMNS = {
  required: ['University ID', 'Logo URL'],
  optional: ['Alt Text', 'Format', 'Status'],
} as const

// ── Validation Rules ───────────────────────────────────────────────────────────

export interface ValidationError {
  sheet: string
  row:   number
  field: string
  value: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  valid:    boolean
  errors:   ValidationError[]
  warnings: ValidationError[]
  counts:   Record<string, number>
  summary:  string
}

const VALID_PROGRAMS   = ['MBA','MCA','BBA','BCA','B.A','B.Com','M.Com','M.A','M.Sc','B.Sc','MBA (WX)']
const VALID_REGIONS    = ['North','South','West','East','Central']
const VALID_NAAC       = ['A++','A+','A','B++','B+','B']
const VALID_EXAM_MODES = ['Online','Assignment-based','Exam Centre','Hybrid']
const VALID_STATUSES   = ['active','inactive','draft']
const SLUG_REGEX       = /^[a-z0-9-]+$/
const URL_REGEX        = /^https?:\/\/.+/

function makeError(
  sheet: string, row: number, field: string, value: string,
  message: string, severity: 'error' | 'warning' = 'error'
): ValidationError {
  return { sheet, row, field, value: String(value).slice(0, 80), message, severity }
}

// ── University Validator ───────────────────────────────────────────────────────

export function validateUniversities(rows: Record<string, any>[]): ValidationError[] {
  const errors: ValidationError[] = []
  const seenIds = new Set<string>()

  rows.forEach((row, idx) => {
    const r = idx + 2 // 1-indexed + header

    // Required fields
    for (const field of UNIVERSITY_COLUMNS.required) {
      if (!String(row[field] ?? '').trim()) {
        errors.push(makeError('Universities', r, field, '', `Required field "${field}" is empty`))
      }
    }

    // ID format validation
    const id = String(row['ID'] ?? '').trim()
    if (id) {
      if (!/^[a-z0-9-]+$/.test(id)) {
        errors.push(makeError('Universities', r, 'ID', id,
          'ID must be lowercase letters, numbers, and hyphens only (e.g. amity-university)'))
      }
      if (seenIds.has(id)) {
        errors.push(makeError('Universities', r, 'ID', id,
          `Duplicate ID "${id}" — each university must have a unique ID`))
      }
      seenIds.add(id)
    }

    // Programs validation
    const programs = String(row['Programs Offered'] ?? '').split(',').map(p => p.trim()).filter(Boolean)
    programs.forEach(prog => {
      if (!VALID_PROGRAMS.includes(prog)) {
        errors.push(makeError('Universities', r, 'Programs Offered', prog,
          `"${prog}" is not a valid program. Valid values: ${VALID_PROGRAMS.join(', ')}`, 'warning'))
      }
    })

    // NAAC
    const naac = String(row['NAAC Grade'] ?? '').trim()
    if (naac && !VALID_NAAC.includes(naac)) {
      errors.push(makeError('Universities', r, 'NAAC Grade', naac,
        `Invalid NAAC grade "${naac}". Must be one of: ${VALID_NAAC.join(', ')}`, 'warning'))
    }

    // Region
    const region = String(row['Region'] ?? '').trim()
    if (region && !VALID_REGIONS.includes(region)) {
      errors.push(makeError('Universities', r, 'Region', region,
        `Invalid region "${region}". Must be one of: ${VALID_REGIONS.join(', ')}`, 'warning'))
    }

    // NIRF
    const nirf = Number(row['NIRF Rank'])
    if (row['NIRF Rank'] !== '' && row['NIRF Rank'] !== undefined && (isNaN(nirf) || nirf < 1)) {
      errors.push(makeError('Universities', r, 'NIRF Rank', String(row['NIRF Rank']),
        'NIRF Rank must be a positive number (e.g. 51)', 'warning'))
    }

    // Fees — must be numeric and feeMin <= feeMax
    const feeMin = Number(row['Fee Min ₹'])
    const feeMax = Number(row['Fee Max ₹'])
    if (row['Fee Min ₹'] && row['Fee Max ₹'] && feeMin > feeMax) {
      errors.push(makeError('Universities', r, 'Fee Min ₹', String(row['Fee Min ₹']),
        `Fee Min (${feeMin}) cannot be greater than Fee Max (${feeMax})`))
    }

    // Status
    const status = String(row['Status'] ?? 'active').trim().toLowerCase()
    if (status && !VALID_STATUSES.includes(status)) {
      errors.push(makeError('Universities', r, 'Status', status,
        `Invalid status "${status}". Must be: ${VALID_STATUSES.join(', ')}`, 'warning'))
    }

    // Brand color
    const color = String(row['Brand Color'] ?? '').trim()
    if (color && !/^(#[0-9A-Fa-f]{6}|var\(--[\w-]+\))$/.test(color)) {
      errors.push(makeError('Universities', r, 'Brand Color', color,
        'Brand Color must be a hex code (#1C6BF4) or CSS var (var(--navy))', 'warning'))
    }
  })

  return errors
}

// ── Program Validator ──────────────────────────────────────────────────────────

export function validatePrograms(rows: Record<string, any>[], uniIds: Set<string>): ValidationError[] {
  const errors: ValidationError[] = []
  const seenKeys = new Set<string>()

  rows.forEach((row, idx) => {
    const r = idx + 2

    for (const field of PROGRAM_COLUMNS.required) {
      if (!String(row[field] ?? '').trim()) {
        errors.push(makeError('Programs', r, field, '', `Required field "${field}" is empty`))
      }
    }

    const uniId  = String(row['University ID'] ?? '').trim()
    const prog   = String(row['Program'] ?? '').trim()
    const key    = `${uniId}||${prog}`

    if (uniId && !uniIds.has(uniId)) {
      errors.push(makeError('Programs', r, 'University ID', uniId,
        `University ID "${uniId}" not found in Universities sheet`))
    }

    if (prog && !VALID_PROGRAMS.includes(prog)) {
      errors.push(makeError('Programs', r, 'Program', prog,
        `"${prog}" is not a valid program. Valid: ${VALID_PROGRAMS.join(', ')}`, 'warning'))
    }

    if (seenKeys.has(key)) {
      errors.push(makeError('Programs', r, 'University ID + Program', key,
        `Duplicate combination "${uniId} + ${prog}" — each uni+program pair must appear once`))
    }
    seenKeys.add(key)
  })

  return errors
}

// ── Blog Validator ─────────────────────────────────────────────────────────────

export function validateBlogs(rows: Record<string, any>[]): ValidationError[] {
  const errors: ValidationError[] = []
  const seenSlugs = new Set<string>()

  rows.forEach((row, idx) => {
    const r = idx + 2

    for (const field of BLOG_COLUMNS.required) {
      if (!String(row[field] ?? '').trim()) {
        errors.push(makeError('Blog Posts', r, field, '', `Required field "${field}" is empty`))
      }
    }

    const slug = String(row['Slug (URL)'] ?? '').trim()
    if (slug) {
      if (!SLUG_REGEX.test(slug)) {
        errors.push(makeError('Blog Posts', r, 'Slug (URL)', slug,
          'Slug must be lowercase letters, numbers, hyphens only (e.g. online-mba-guide-2026)'))
      }
      if (seenSlugs.has(slug)) {
        errors.push(makeError('Blog Posts', r, 'Slug (URL)', slug,
          `Duplicate slug "${slug}" — each post must have a unique URL slug`))
      }
      seenSlugs.add(slug)
    }

    const title = String(row['Title'] ?? '').trim()
    if (title.length > 70) {
      errors.push(makeError('Blog Posts', r, 'Title', title,
        `Title is ${title.length} chars — should be ≤70 chars for SEO`, 'warning'))
    }

    const metaDesc = String(row['Meta Description'] ?? '').trim()
    if (metaDesc && metaDesc.length > 160) {
      errors.push(makeError('Blog Posts', r, 'Meta Description', metaDesc,
        `Meta description is ${metaDesc.length} chars — should be ≤160 chars for SEO`, 'warning'))
    }

    const status = String(row['Status'] ?? '').trim().toLowerCase()
    if (status && !['published','draft'].includes(status)) {
      errors.push(makeError('Blog Posts', r, 'Status', status,
        'Status must be "published" or "draft"'))
    }

    // FAQs JSON validation
    const faqs = String(row['FAQs (JSON array)'] ?? '').trim()
    if (faqs) {
      try { JSON.parse(faqs) } catch {
        errors.push(makeError('Blog Posts', r, 'FAQs (JSON array)', faqs.slice(0, 50),
          'FAQs must be valid JSON array: [{"q":"Question?","a":"Answer."}]'))
      }
    }
  })

  return errors
}

// ── Guide Validator ────────────────────────────────────────────────────────────

export function validateGuides(rows: Record<string, any>[]): ValidationError[] {
  const errors: ValidationError[] = []
  const seenIds = new Set<string>()

  rows.forEach((row, idx) => {
    const r = idx + 2

    for (const field of GUIDE_COLUMNS.required) {
      if (!String(row[field] ?? '').trim()) {
        errors.push(makeError('Guides', r, field, '', `Required field "${field}" is empty`))
      }
    }

    const id = String(row['ID (URL slug)'] ?? '').trim()
    if (id) {
      if (!SLUG_REGEX.test(id)) {
        errors.push(makeError('Guides', r, 'ID (URL slug)', id,
          'ID must be lowercase letters, numbers, hyphens only (e.g. ugc-deb-guide)'))
      }
      if (seenIds.has(id)) {
        errors.push(makeError('Guides', r, 'ID (URL slug)', id,
          `Duplicate guide ID "${id}"`))
      }
      seenIds.add(id)
    }
  })

  return errors
}

// ── Logo Validator ─────────────────────────────────────────────────────────────

export function validateLogos(rows: Record<string, any>[], uniIds: Set<string>): ValidationError[] {
  const errors: ValidationError[] = []

  rows.forEach((row, idx) => {
    const r = idx + 2

    const uniId = String(row['University ID'] ?? '').trim()
    const url   = String(row['Logo URL'] ?? '').trim()

    if (!uniId) errors.push(makeError('Logos', r, 'University ID', '', 'University ID is required'))
    if (!url)   errors.push(makeError('Logos', r, 'Logo URL', '', 'Logo URL is required'))

    if (uniId && uniIds.size > 0 && !uniIds.has(uniId)) {
      errors.push(makeError('Logos', r, 'University ID', uniId,
        `University ID "${uniId}" not found in Universities sheet`, 'warning'))
    }

    if (url && !URL_REGEX.test(url)) {
      errors.push(makeError('Logos', r, 'Logo URL', url,
        'Logo URL must start with https:// (use Google Drive direct link or any public image URL)'))
    }
  })

  return errors
}

// ── Master Validator ───────────────────────────────────────────────────────────

export interface CMSData {
  universities: Record<string, any>[]
  programs:     Record<string, any>[]
  syllabus:     Record<string, any>[]
  blogs:        Record<string, any>[]
  guides:       Record<string, any>[]
  logos:        Record<string, any>[]
  siteConfig:   Record<string, any>[]
  pageRegistry: Record<string, any>[]
}

export function validateAll(data: CMSData): ValidationResult {
  const uniIds = new Set(data.universities.map(u => String(u['ID'] ?? '').trim()).filter(Boolean))

  const allErrors = [
    ...validateUniversities(data.universities),
    ...validatePrograms(data.programs, uniIds),
    ...validateBlogs(data.blogs),
    ...validateGuides(data.guides),
    ...validateLogos(data.logos, uniIds),
  ]

  const errors   = allErrors.filter(e => e.severity === 'error')
  const warnings = allErrors.filter(e => e.severity === 'warning')

  const counts = {
    universities: data.universities.filter(u => String(u['Status'] ?? 'active').toLowerCase() !== 'inactive').length,
    programs:     data.programs.length,
    blogs:        data.blogs.filter(b => String(b['Status'] ?? '').toLowerCase() === 'published').length,
    guides:       data.guides.length,
    logos:        data.logos.filter(l => String(l['Status'] ?? 'active').toLowerCase() !== 'inactive').length,
    pages:        data.pageRegistry.length,
  }

  const valid   = errors.length === 0
  const summary = valid
    ? `✅ All ${allErrors.length > 0 ? `checks passed (${warnings.length} warning${warnings.length !== 1 ? 's' : ''})` : 'checks passed'}. Ready to publish: ${counts.universities} universities, ${counts.blogs} posts, ${counts.guides} guides.`
    : `❌ ${errors.length} error${errors.length !== 1 ? 's' : ''} found. Fix before publishing.`

  return { valid, errors, warnings, counts, summary }
}

// ── Logo URL normaliser ────────────────────────────────────────────────────────
// Converts Google Drive sharing URLs to direct download URLs

export function normaliseLogo(url: string): string {
  if (!url) return ''

  // Google Drive: /file/d/FILE_ID/view → /uc?id=FILE_ID&export=download
  const driveMatch = url.match(/\/file\/d\/([^/]+)/)
  if (driveMatch) {
    return `https://drive.google.com/uc?id=${driveMatch[1]}&export=download`
  }

  // Already a direct URL — return as-is
  return url
}

export function buildLogoMap(logos: Record<string, any>[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const row of logos) {
    const id  = String(row['University ID'] ?? '').trim()
    const url = String(row['Logo URL'] ?? '').trim()
    const status = String(row['Status'] ?? 'active').toLowerCase()
    if (id && url && status !== 'inactive') {
      map[id] = normaliseLogo(url)
    }
  }
  return map
}

// ── Code generators (extracted for testability) ────────────────────────────────

export function esc(s: unknown, max = 200): string {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, max)
}

export function escArr(items: unknown[], max = 12): string {
  const filtered = (items as string[]).filter(Boolean).slice(0, max)
  return filtered.length ? `[${filtered.map(i => `'${esc(String(i).slice(0, 80))}'`).join(', ')}]` : '[]'
}

export function splitComma(s: unknown): string[] {
  return String(s ?? '').split(',').map(p => p.trim()).filter(Boolean)
}

export function splitPipe(s: unknown): string[] {
  return String(s ?? '').split('|').map(p => p.trim()).filter(Boolean)
}

export function generateLogoMapTS(logoMap: Record<string, string>): string {
  const entries = Object.entries(logoMap)
    .map(([id, url]) => `  '${id}': '${url}'`)
    .join(',\n')

  return `// UNIVERSITY_LOGOS — auto-generated by CMS sync
// Do not edit manually — update via /admin/cms or the Logos sheet
export const UNIVERSITY_LOGOS: Record<string, string> = {
${entries}
}

export function getUniversityLogo(uniId: string): string | null {
  return UNIVERSITY_LOGOS[uniId] || null
}
`
}

export function generateSiteConfigTS(config: Record<string, any>[]): string {
  const map: Record<string, string> = {}
  for (const row of config) {
    const key = String(row['Key'] ?? '').trim()
    const val = String(row['Value'] ?? '').trim()
    if (key) map[key] = val
  }

  return `// lib/site-config.ts — auto-generated by CMS sync
// Edit values in the "🌐 Site Config" Google Sheet, then sync

export const SITE_CONFIG = ${JSON.stringify(map, null, 2)} as const

export type SiteConfigKey = keyof typeof SITE_CONFIG
export function getSiteConfig(key: SiteConfigKey): string {
  return SITE_CONFIG[key] ?? ''
}
`
}
