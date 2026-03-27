// app/api/cms/sync/route.ts
// The main CMS sync engine.
// Flow: Fetch all sheets → Validate → Generate TS files → Push to GitHub → Vercel deploys.
// POST body: { dryRun?: boolean, skipValidation?: boolean, sheets?: string[] }

import { NextRequest, NextResponse } from 'next/server'
import {
  validateAll, buildLogoMap, generateLogoMapTS, generateSiteConfigTS,
  esc, escArr, splitComma, splitPipe, type CMSData,
} from '@/lib/cms-schema'

// ── Auth ─────────────────────────────────────────────────────────────────────
function checkAuth(req: NextRequest): boolean {
  // Check session cookie (httpOnly — set by admin-auth route)
  const sessionToken = process.env.ADMIN_SESSION_TOKEN
  if (sessionToken && req.cookies.get('edify_admin_session')?.value === sessionToken) {
    return true
  }
  // Fallback: check X-Admin-Token header
  const secret = process.env.ADMIN_API_SECRET || process.env.ADMIN_SECRET
  if (!secret) {
    return process.env.NODE_ENV !== 'production'
  }
  return req.headers.get('X-Admin-Token') === secret
}

// ── GitHub push helper ────────────────────────────────────────────────────────
async function pushToGitHub(files: { path: string; content: string }[], message: string): Promise<{
  success: boolean
  results: { path: string; success: boolean; skipped?: boolean }[]
  failedFiles: string[]
  skippedFiles: string[]
}> {
  const token  = process.env.GITHUB_TOKEN
  const owner  = process.env.GITHUB_OWNER  || 'careedify-sys'
  const repo   = process.env.GITHUB_REPO   || 'edify-edu'
  const branch = process.env.GITHUB_BRANCH || 'main'

  if (!token) throw new Error('GITHUB_TOKEN not set in Vercel environment variables')

  // Returns existing file SHA and decoded content (one API call per file, reused for both comparison and PUT)
  async function getFileInfo(path: string): Promise<{ sha: string; content: string } | null> {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.sha) return null
    const decoded = Buffer.from((data.content as string).replace(/\n/g, ''), 'base64').toString('utf-8')
    return { sha: data.sha, content: decoded }
  }

  const results: { path: string; success: boolean; skipped?: boolean }[] = []

  for (const file of files) {
    const existing = await getFileInfo(file.path)

    // Skip push if content is identical — prevents unnecessary Vercel rebuilds
    if (existing && existing.content === file.content) {
      results.push({ path: file.path, success: true, skipped: true })
      await new Promise(r => setTimeout(r, 100)) // small pause between API calls
      continue
    }

    const encoded = Buffer.from(file.content, 'utf-8').toString('base64')
    const body: Record<string, string> = { message, content: encoded, branch }
    if (existing?.sha) body.sha = existing.sha

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept:        'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )
    results.push({ path: file.path, success: res.ok })
    await new Promise(r => setTimeout(r, 350)) // rate limit buffer
  }

  const failedFiles  = results.filter(r => !r.success && !r.skipped).map(r => r.path)
  const skippedFiles = results.filter(r => r.skipped).map(r => r.path)
  const pushedCount  = results.filter(r => !r.skipped).length
  return { success: failedFiles.length === 0, results, failedFiles, skippedFiles }
}

// ── Code generators ───────────────────────────────────────────────────────────

const PROG_TYPES = ['MBA','MCA','BBA','BCA','B.Com','M.Com','BA','MA','MSc','BSc','MBA (WX)']
const REGIONS    = ['North','South','West','East','Central']
const FALLBACK_COLORS = [
  '#1E3A5F','#2E7D32','#B71C1C','#4A1A8A','#E65100','#006064',
  '#880E4F','#827717','#1A237E','#33691E','#BF360C','#4E342E',
]

function generateDataTS(
  unis: Record<string, any>[],
  programs: Record<string, any>[]
): string {
  // Build program lookup: uid||prog → row
  const progMap: Record<string, Record<string, any>> = {}
  for (const p of programs) {
    const key = `${p['University ID']}||${p['Program']}`
    progMap[key] = p
  }
  const uniPrograms: Record<string, string[]> = {}
  for (const p of programs) {
    const uid = p['University ID']
    if (!uniPrograms[uid]) uniPrograms[uid] = []
    uniPrograms[uid].push(p['Program'])
  }

  const now = new Date().toISOString().split('T')[0]
  const ts  = (s: unknown, max = 300) => esc(s, max)

  const uniBlocks = unis
    .filter(u => String(u['Status'] ?? 'active').toLowerCase() !== 'inactive')
    .map((u, idx) => {
      const uid       = String(u['ID'] ?? '').trim()
      const progsList = splitComma(u['Programs Offered'])
      const approvals = splitComma(u['Approvals (comma sep)'])
      const forWho    = splitPipe(u['For Who (pipe sep)'])
      const notFor    = splitPipe(u['Not For (pipe sep)'])

      const progDetailBlocks = progsList.map(prog => {
        const pd = progMap[`${uid}||${prog}`] || {}
        const specs     = splitComma(pd['Specialisations (comma sep)'])
        const roles     = splitComma(pd['Entry Roles (comma sep)'])
        const companies = splitComma(pd['Top Companies (comma sep)'])
        return `      '${prog}': {
        specs: ${escArr(specs)},
        fees: '${esc(pd['Fee Range'])}',
        duration: '${esc(pd['Duration'])}',
        roles: ${escArr(roles)},
        avgSalary: '${esc(pd['Avg Salary'])}',
        topCompanies: ${escArr(companies)},
        internshipType: '${esc(pd['Internship / Project Type'])}',
        careerOutcome: '${esc(pd['Career Outcome (1 sentence)'])}',
      }`
      })

      const nirf   = parseInt(String(u['NIRF Rank'] ?? '')) || 999
      const nirfm  = parseInt(String(u['NIRF Management Rank'] ?? '')) || undefined
      const feeMin = parseInt(String(u['Fee Min ₹'] ?? '')) || 60000
      const feeMax = parseInt(String(u['Fee Max ₹'] ?? '')) || 200000
      const emiFrom = parseInt(String(u['EMI From ₹/month'] ?? '')) || 2500
      const eligPct = parseFloat(String(u['Eligibility %'] ?? '')) || 50
      const color   = String(u['Brand Color'] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length])
      const ugc     = String(u['UGC DEB (TRUE/FALSE)'] ?? 'TRUE').toUpperCase() !== 'FALSE'
      const psu     = String(u['PSU Eligible (TRUE/FALSE)'] ?? 'TRUE').toUpperCase() !== 'FALSE'
      const govt    = String(u['Govt Recognised (TRUE/FALSE)'] ?? 'TRUE').toUpperCase() !== 'FALSE'
      const region  = REGIONS.includes(u['Region']) ? u['Region'] : 'North'

      return `  {
    id: '${uid}',
    name: '${esc(u['University Full Name'])}',
    abbr: '${esc(u['Abbreviation'])}',
    city: '${esc(u['City'])}',
    state: '${esc(u['State'])}',
    region: '${region}',
    nirf: ${nirf},${nirfm ? `\n    nirfMgt: ${nirfm},` : ''}
    nirfCategory: '${ts(u['NIRF Category'], 50)}',
    qsRank: '${ts(u['QS Rank'], 20)}',
    naac: '${ts(u['NAAC Grade'], 10)}',
    ugc: ${ugc},
    approvals: ${escArr(approvals)},
    examMode: '${esc(u['Exam Mode'] || 'Online')}',
    govtRecognised: ${govt},
    psuEligible: ${psu},
    feeMin: ${feeMin},
    feeMax: ${feeMax},
    emiFrom: ${emiFrom},
    eligibility: '${esc(u['Eligibility'])}',
    eligibilityPct: ${eligPct},
    highlight: '${esc(u['Highlight Badge'])}',
    tagline: '${esc(u['Tagline'])}',
    description: '${esc(u['Short Description'], 300)}',
    forWho: ${escArr(forWho, 5)},
    notFor: ${escArr(notFor, 4)},
    programs: [${progsList.map(p => `'${p}'`).join(', ')}],
    programDetails: {
${progDetailBlocks.join(',\n')}
    },
    color: '${esc(color)}',
  }`
    })

  return `// lib/data.ts — Auto-generated by Edify CMS sync on ${now}
// DO NOT edit manually — update via Google Sheets → /admin/cms → Sync to Live
// ─────────────────────────────────────────────────────────────────────────────

export type Program = 'MBA' | 'MCA' | 'BBA' | 'BCA' | 'BA' | 'B.Com' | 'M.Com' | 'MA' | 'MSc' | 'BSc' | 'MBA (WX)'

export interface ProgramDetail {
  specs: string[]; fees: string; duration: string; roles: string[]
  avgSalary: string; topCompanies: string[]
  internshipType: string; careerOutcome: string
}

export interface University {
  id: string; name: string; abbr: string; city: string; state: string
  region: 'North' | 'South' | 'West' | 'East' | 'Central'
  nirf: number; nirfMgt?: number; nirfCategory?: string; qsRank?: string
  naac: string; naacScore?: string; ugc: boolean; approvals: string[]
  examMode: string; govtRecognised: boolean; psuEligible: boolean
  feeMin: number; feeMax: number; emiFrom: number
  eligibility: string; eligibilityPct: number
  highlight: string; tagline: string; description: string
  forWho: string[]; notFor: string[]
  programs: Program[]; programDetails: Partial<Record<Program, ProgramDetail>>
  color: string; logo?: string; established?: string
}

export const PROGRAM_META: Record<string, { label: string; desc: string; icon?: string }> = {
  'MBA':      { label: 'Online MBA',    desc: 'Master of Business Administration', icon: '💼' },
  'MCA':      { label: 'Online MCA',    desc: 'Master of Computer Applications',   icon: '💻' },
  'BBA':      { label: 'Online BBA',    desc: 'Bachelor of Business Administration', icon: '📊' },
  'BCA':      { label: 'Online BCA',    desc: 'Bachelor of Computer Applications', icon: '🖥️' },
  'B.Com':    { label: 'Online B.Com',  desc: 'Bachelor of Commerce',              icon: '📒' },
  'M.Com':    { label: 'Online M.Com',  desc: 'Master of Commerce',                icon: '📈' },
  'BA':       { label: 'Online BA',     desc: 'Bachelor of Arts',                  icon: '🎓' },
  'MA':       { label: 'Online MA',     desc: 'Master of Arts',                    icon: '📚' },
  'MSc':      { label: 'Online M.Sc',   desc: 'Master of Science',                 icon: '🔬' },
  'BSc':      { label: 'Online B.Sc',   desc: 'Bachelor of Science',               icon: '⚗️' },
  'MBA (WX)': { label: 'Executive MBA', desc: 'Executive MBA (Work Integrated)',    icon: '🏛️' },
}

export function formatFee(n: number): string {
  if (n >= 100000) return \`₹\${(n/100000).toFixed(1)}L\`
  return \`₹\${(n/1000).toFixed(0)}K\`
}

export function getUniversityById(id: string) { return UNIVERSITIES.find(u => u.id === id) }
export function getUniversitiesByProgram(p: string) { return UNIVERSITIES.filter(u => u.programs.includes(p as Program)) }
export function getAllPrograms(): Program[] { return Array.from(new Set(UNIVERSITIES.flatMap(u => u.programs))) }
export function getAllSpecs(prog: string): string[] { return Array.from(new Set(UNIVERSITIES.flatMap(u => u.programDetails[prog as Program]?.specs ?? []))) }
export function getUniversitiesBySpec(prog: string, spec: string) { return UNIVERSITIES.filter(u => u.programDetails[prog as Program]?.specs?.includes(spec)) }
export function getPrograms(uid: string) { return UNIVERSITIES.find(u => u.id === uid)?.programs ?? [] }
export function getFees(uid: string, prog: Program) { const pd = UNIVERSITIES.find(u => u.id === uid)?.programDetails[prog]; return pd?.fees ?? '' }
export function getSpecs(uid: string, prog: Program) { return UNIVERSITIES.find(u => u.id === uid)?.programDetails[prog]?.specs ?? [] }

export const UNIVERSITIES: University[] = [
${uniBlocks.join(',\n')}
]
`
}

// ── Existing publish-date extractor ───────────────────────────────────────────
// Parses the currently-deployed lib/blog.ts and returns a map of slug → publishedAt.
// Used to preserve original dates across resyncs — only a date explicitly set in the
// Google Sheet (non-empty "Published Date" column) overrides the stored date.
function extractExistingDates(blogTS: string): Record<string, string> {
  const dates: Record<string, string> = {}
  const re = /slug:\s*'([^']+)'[\s\S]*?publishedAt:\s*'([^']+)'/g
  let m: RegExpExecArray | null
  while ((m = re.exec(blogTS)) !== null) {
    dates[m[1]] = m[2]
  }
  return dates
}

// ── Blog content sanitizer ────────────────────────────────────────────────────
// Strips full-page HTML shell, inline styles, duplicate title/meta, and FAQ
// blocks that the site template already renders. Converts custom div classes
// to the site's native callout classes. Safe to run on every sync.
function sanitizeBlogContent(raw: string): string {
  return raw
    .replace(/<!DOCTYPE[^>]*>\s*/gi, '')
    .replace(/<html[^>]*>\s*/gi, '').replace(/\s*<\/html>/gi, '')
    .replace(/<head[\s\S]*?<\/head>\s*/gi, '')
    .replace(/<body[^>]*>\s*/gi, '').replace(/\s*<\/body>/gi, '')
    .replace(/<style[\s\S]*?<\/style>\s*/gi, '')
    .replace(/<h1[^>]*>[\s\S]*?<\/h1>\s*/gi, '')
    .replace(/<p[^>]*class=["'][^"']*\bmeta\b[^"']*["'][^>]*>[\s\S]*?<\/p>\s*/gi, '')
    .replace(/<div[^>]*class=["'][^"']*\bfaq\b[^"']*["'][^>]*>[\s\S]*/gi, '')
    .replace(/class="callout"/g,      'class="callout-info"')
    .replace(/class="verdict-box"/g,  'class="callout-key"')
    .replace(/class="checklist"/g,    'class="callout-key"')
    .replace(/class="internal-link"/g,'class="callout-info"')
    .replace(/class="warning"/g,      'class="callout-warning"')
    .replace(/https?:\/\/(?:www\.)?edifyedu\.in\//g, '/')
    .trim()
}

function generateBlogTS(posts: Record<string, any>[], existingDates: Record<string, string> = {}): string {
  const now = new Date().toISOString().split('T')[0]
  const ts  = (s: unknown, max = 300) => esc(s, max)

  const postBlocks = posts.map(p => {
    const faqs: { q: string; a: string }[] = []
    try {
      const raw = p['FAQs (JSON array)']
      if (raw) faqs.push(...JSON.parse(String(raw)))
    } catch { /* ignore bad JSON */ }

    const tags = splitComma(p['Tags (comma sep)'])
    const readTime = parseInt(String(p['Read Time (min)'] ?? '5')) || 5
    const content = sanitizeBlogContent(String(p['Content (HTML)'] ?? '<p>Content coming soon.</p>'))
      .replace(/`/g, '\\`').replace(/\\/g, '\\\\').slice(0, 20000)

    const slug = String(p['Slug (URL)'] ?? '').trim().replace(/^\/+/, '').replace(/^blog\//, '')
    // Preserve original publish date: sheet value wins if set, otherwise keep existing date, else use today
    const sheetDate = String(p['Published Date'] ?? '').trim()
    const publishedAt = sheetDate || existingDates[slug] || now
    return `  {
    slug: '${ts(slug, 80)}',
    title: '${ts(p['Title'], 120)}',
    metaDescription: '${ts(p['Meta Description'], 160)}',
    category: '${ts(p['Category'], 50)}',
    tags: [${tags.map(t => `'${ts(t, 50)}'`).join(', ')}],
    publishedAt: '${ts(publishedAt, 20)}',
    readTime: ${readTime},
    targetKeyword: '${ts(p['Target Keyword'], 100)}',
    relatedUniversities: [],
    status: '${String(p['Status'] ?? '').toLowerCase() === 'draft' ? 'draft' : 'published'}',
    faqs: [
${faqs.filter(f => f.q && f.a).map(f => `      { q: '${ts(f.q, 200)}', a: '${ts(f.a, 500)}' }`).join(',\n')}
    ],
    ctaTitle: '${ts(p['CTA Title'], 100)}',
    ctaDesc: '${ts(p['CTA Description'], 200)}',
    content: \`\n${content}\n    \`,
  }`
  })

  return `// lib/blog.ts — Auto-generated by Edify CMS sync on ${now}
// DO NOT edit manually — update via the "✍️ Blog Posts" Google Sheet

export interface BlogPost {
  slug: string; title: string; metaDescription: string; category: string
  tags: string[]; publishedAt: string; readTime: number; content: string
  faqs: { q: string; a: string }[]; relatedUniversities: string[]
  targetKeyword: string; status: 'published' | 'draft'
  ctaTitle?: string; ctaDesc?: string
}

export function getPublishedPosts() {
  return BLOG_POSTS
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}
export function getPostBySlug(slug: string) { return BLOG_POSTS.find(p => p.slug === slug) || null }
export const getBlogPost = getPostBySlug

export const BLOG_POSTS: BlogPost[] = [
${postBlocks.join(',\n')}
]

export const BLOG_CATEGORIES: string[] = Array.from(new Set(BLOG_POSTS.map(p => p.category).filter(Boolean)))
`
}

function generateGuidesPage(guides: Record<string, any>[]): string {
  const now = new Date().toISOString().split('T')[0]
  const ts  = (s: unknown, max = 300) => esc(s, max)

  const items = guides.map(g => {
    const content = String(g['Content (HTML)'] ?? '<p>Content coming soon.</p>')
      .replace(/`/g, '\\`').replace(/\\/g, '\\\\').slice(0, 10000)
    return `  {
    id: '${ts(g['ID (URL slug)'], 80)}',
    icon: '${ts(g['Icon (emoji)'], 10) || '📖'}',
    tag: '${ts(g['Tag / Category'], 60)}',
    title: '${ts(g['Title'], 120)}',
    desc: '${ts(g['Short Description'], 300)}',
    readTime: '${ts(g['Read Time'] || '5 min read', 30)}',
    content: \`\n${content}\n    \`,
  }`
  })

  return `'use client'
// app/guides/page.tsx — Auto-generated by Edify CMS sync on ${now}
// DO NOT edit manually — update via the "🗺️ Guides" Google Sheet

import Link from 'next/link'

const GUIDES: { id: string; icon: string; tag: string; title: string; desc: string; readTime: string; content: string }[] = [
${items.join(',\n')}
]

export default function GuidesPage() {
  return (
    <div className="page-shell">
      <div className="bg-white border-b border-border py-7">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-navy mb-2 mt-0">Guides & Honest Answers</h1>
          <p className="body-sm m-0">No fluff. Straight answers to every question students ask before enrolling.</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDES.map(g=>(
            <Link key={g.id} href={\`/guides/\${g.id}\`} className="no-underline">
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',padding:24,height:'100%',cursor:'pointer',transition:'var(--t-base)'}}>
                <div className="text-[28px] mb-3">{g.icon}</div>
                <div style={{fontSize:10,fontWeight:700,color:'var(--amber-text)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>{g.tag}</div>
                <h2 className="text-[15px] font-bold text-navy leading-tight mb-2">{g.title}</h2>
                <p className="text-[13px] text-ink-3 leading-relaxed mb-3 mt-0">{g.desc}</p>
                <span className="text-[11px] text-[var(--ink-4)]">{g.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
`
}

// ── Main sync handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sheetUrl = process.env.NEXT_PUBLIC_CMS_SHEET_URL
  if (!sheetUrl) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_CMS_SHEET_URL not configured' }, { status: 503 })
  }

  const { dryRun = false, skipValidation = false } = await req.json().catch(() => ({}))

  const log: string[] = []
  const addLog = (msg: string) => { log.push(msg); console.log('[CMS Sync]', msg) }

  try {
    // ── Step 1: Fetch all sheets ───────────────────────────────────────────
    addLog('Fetching all sheets from Google Sheets...')
    const fetchRes = await fetch(`${sheetUrl}?action=readAll`, {
      signal: AbortSignal.timeout(45000),
    })

    if (!fetchRes.ok) throw new Error(`Sheets API returned ${fetchRes.status}`)

    const raw = await fetchRes.json()
    if (raw.error) throw new Error(`Sheets error: ${raw.error}`)

    const cmsData: CMSData = {
      universities: raw.universities?.rows ?? [],
      programs:     raw.programs?.rows     ?? [],
      syllabus:     raw.syllabus?.rows     ?? [],
      blogs:        raw.blogs?.rows        ?? [],
      guides:       raw.guides?.rows       ?? [],
      logos:        raw.logos?.rows        ?? [],
      siteConfig:   raw.siteConfig?.rows   ?? [],
      pageRegistry: raw.pageRegistry?.rows ?? [],
    }

    addLog(`✓ Fetched: ${cmsData.universities.length} universities, ${cmsData.blogs.length} posts, ${cmsData.guides.length} guides, ${cmsData.logos.length} logos`)

    const hasUnis   = cmsData.universities.length > 0
    const hasBlogs  = cmsData.blogs.length > 0
    const hasGuides = cmsData.guides.length > 0

    if (!hasUnis && !hasBlogs && !hasGuides) {
      return NextResponse.json({
        ok: false,
        error: 'Nothing to sync — all sheets (Universities, Blog Posts, Guides) are empty.',
        log,
      }, { status: 422 })
    }

    if (!hasUnis) {
      addLog('⚠ Universities sheet is empty — skipping data.ts, syncing blogs/guides only')
    }

    // ── Step 2: Validate ───────────────────────────────────────────────────
    if (!skipValidation && hasUnis) {
      addLog('Running validation checks...')
      const validation = validateAll(cmsData)

      if (!validation.valid) {
        addLog(`❌ Validation failed: ${validation.errors.length} error(s)`)
        return NextResponse.json({
          ok: false,
          error: 'Validation failed. Fix errors before syncing.',
          errors: validation.errors,
          warnings: validation.warnings,
          log,
        }, { status: 422 })
      }
      addLog(`✓ Validation passed (${validation.warnings.length} warnings)`)
    } else if (!skipValidation) {
      addLog('⚠ Validation skipped (no university data)')
    } else {
      addLog('⚠ Validation skipped — use with caution')
    }

    // ── Step 3: Generate code files ────────────────────────────────────────
    addLog('Generating code files...')

    // Fetch existing blog.ts from GitHub to preserve original publish dates
    const existingBlogTS = await (async () => {
      const token  = process.env.GITHUB_TOKEN
      const owner  = process.env.GITHUB_OWNER  || 'careedify-sys'
      const repo   = process.env.GITHUB_REPO   || 'edify-edu'
      const branch = process.env.GITHUB_BRANCH || 'main'
      if (!token) return ''
      try {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/lib/blog.ts?ref=${branch}`,
          { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
        )
        if (!res.ok) return ''
        const data = await res.json()
        return Buffer.from((data.content as string).replace(/\n/g, ''), 'base64').toString('utf-8')
      } catch { return '' }
    })()
    const existingDates = extractExistingDates(existingBlogTS)
    if (Object.keys(existingDates).length > 0) {
      addLog(`✓ Preserved publish dates for ${Object.keys(existingDates).length} existing post(s)`)
    }

    const filesToPush: { path: string; content: string }[] = []

    if (hasUnis) {
      const dataTS = generateDataTS(cmsData.universities, cmsData.programs)
      addLog(`✓ data.ts: ${(dataTS.length / 1024).toFixed(1)}KB (${cmsData.universities.filter(u => String(u['Status']||'active').toLowerCase() !== 'inactive').length} universities)`)
      filesToPush.push({ path: 'lib/data.ts', content: dataTS })
    }

    const blogTS = generateBlogTS(cmsData.blogs, existingDates)
    addLog(`✓ blog.ts: ${cmsData.blogs.length} posts`)
    filesToPush.push({ path: 'lib/blog.ts', content: blogTS })

    const guidesPage = generateGuidesPage(cmsData.guides)
    addLog(`✓ guides/page.tsx: ${cmsData.guides.length} guides`)
    filesToPush.push({ path: 'app/guides/page.tsx', content: guidesPage })

    if (hasUnis) {
      const logoMap = buildLogoMap(cmsData.logos)
      addLog(`✓ Logo map: ${Object.keys(logoMap).length} logos`)
      const logoTS = `// UNIVERSITY_LOGOS — auto-generated by CMS sync on ${new Date().toISOString().split('T')[0]}
export const UNIVERSITY_LOGOS: Record<string, string> = ${JSON.stringify(logoMap, null, 2)}

export function getUniversityLogo(uniId: string): string | null {
  return UNIVERSITY_LOGOS[uniId] || null
}
`
      filesToPush.push({ path: 'lib/university-logos.ts', content: logoTS })

      const siteConfigTS = generateSiteConfigTS(cmsData.siteConfig)
      addLog('✓ site-config.ts generated')
      filesToPush.push({ path: 'lib/site-config.ts', content: siteConfigTS })
    }

    if (dryRun) {
      addLog('🔵 DRY RUN — no files pushed to GitHub')
      return NextResponse.json({
        ok: true,
        dryRun: true,
        files: filesToPush.map(f => ({ path: f.path, size: `${(f.content.length / 1024).toFixed(1)}KB` })),
        log,
        message: 'Dry run complete. All files generated successfully. Remove dryRun to deploy.',
      })
    }

    // ── Step 5: Push to GitHub (changed files only) ────────────────────────
    addLog(`Comparing ${filesToPush.length} files against GitHub (skipping unchanged)...`)

    const timestamp  = new Date().toISOString()
    const uniCount   = hasUnis ? cmsData.universities.filter(u => String(u['Status']||'active').toLowerCase() !== 'inactive').length : 0
    const commitMsg  = `🔄 CMS Sync — ${uniCount} unis, ${cmsData.blogs.length} posts — ${timestamp}`

    const pushResult = await pushToGitHub(filesToPush, commitMsg)

    const pushedFiles  = pushResult.results.filter(r => !r.skipped)
    const skippedCount = pushResult.skippedFiles.length
    const pushedCount  = pushedFiles.length

    if (skippedCount > 0) {
      addLog(`⏭ Skipped ${skippedCount} unchanged file(s): ${pushResult.skippedFiles.join(', ')}`)
    }

    if (pushedCount === 0) {
      addLog('✅ Nothing changed — no rebuild triggered')
      return NextResponse.json({
        ok: true,
        files:        pushResult.results,
        failedFiles:  [],
        skippedFiles: pushResult.skippedFiles,
        log,
        message: '✅ Sync complete — all content identical, no rebuild needed.',
        counts: {
          universities: cmsData.universities.length,
          blogs: cmsData.blogs.length,
          guides: cmsData.guides.length,
          logos: cmsData.logos.length,
        },
      })
    }

    if (!pushResult.success) {
      addLog(`⚠ Partial push: ${pushedFiles.filter(r => r.success).length}/${pushedCount} succeeded`)
      addLog(`Failed: ${pushResult.failedFiles.join(', ')}`)
    } else {
      addLog(`✓ ${pushedCount} file(s) pushed to GitHub`)
      addLog('⏳ Vercel deploying — live in ~90 seconds')
    }

    return NextResponse.json({
      ok: pushResult.success,
      files:        pushResult.results,
      failedFiles:  pushResult.failedFiles,
      skippedFiles: pushResult.skippedFiles,
      log,
      message: pushResult.success
        ? `✅ Sync complete. ${pushedCount} file(s) changed and pushed. Site live in ~90 seconds.`
        : `⚠ Partial sync. ${pushResult.failedFiles.length} file(s) failed.`,
      counts: {
        universities: cmsData.universities.length,
        blogs: cmsData.blogs.length,
        guides: cmsData.guides.length,
        logos: cmsData.logos.length,
      },
      deployUrl: `https://github.com/${process.env.GITHUB_OWNER || 'careedify-sys'}/${process.env.GITHUB_REPO || 'edify-edu'}/actions`,
    })

  } catch (err: any) {
    const msg = err?.message || 'Unknown error'
    addLog(`❌ ${msg}`)
    return NextResponse.json({ ok: false, error: msg, log }, { status: 500 })
  }
}
