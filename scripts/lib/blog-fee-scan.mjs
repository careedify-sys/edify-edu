// scripts/lib/blog-fee-scan.mjs
// Shared extractor for blog fee figures. Used by:
//   - scripts/audit-blog-fees.mjs        (CSV + summary)
//   - scripts/build-blog-fee-triage.mjs  (via that CSV)
//   - scripts/check-blog-fees.mjs        (per-slug ratchet)
//
// Keeping the currency regex, uni/programme inference, and classifier in one
// place so the ratchet and the audit can never drift apart.

import { BLOG_POSTS } from '../../lib/blog.ts'
import { UNIVERSITIES } from '../../lib/data.ts'
import { getDisplayFee } from '../../lib/fees.ts'

const UNI_BY_ID = new Map(UNIVERSITIES.map(u => [u.id, u]))

const aliasEntries = []
function addAlias(alias, uid) {
  if (!alias) return
  aliasEntries.push({ alias: alias.toLowerCase(), uid })
}
for (const u of UNIVERSITIES) {
  const base = u.name
    .replace(/\s+Online$/i, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
  addAlias(u.name, u.id)
  addAlias(base, u.id)
  addAlias(base.replace(/^University of\s+/i, ''), u.id)
  if (u.abbr) addAlias(u.abbr, u.id)
  if (u.shortName) addAlias(u.shortName, u.id)
  for (const p of [...u.name.matchAll(/\(([^)]+)\)/g)].map(m => m[1])) addAlias(p, u.id)
  addAlias(u.id.replace(/-online$/, '').replace(/-/g, ' '), u.id)
}

const MANUAL = {
  'amity': 'amity-university-online',
  'amity university': 'amity-university-online',
  'lpu': 'lovely-professional-university-online',
  'lovely professional': 'lovely-professional-university-online',
  'jain': 'jain-university-online',
  'jain university': 'jain-university-online',
  'muj': 'manipal-university-jaipur-online',
  'manipal jaipur': 'manipal-university-jaipur-online',
  'mahe': 'manipal-academy-of-higher-education-online',
  'manipal academy': 'manipal-academy-of-higher-education-online',
  'smu': 'sikkim-manipal-university-online',
  'sikkim manipal': 'sikkim-manipal-university-online',
  'galgotias': 'galgotias-university-online',
  'chandigarh university': 'chandigarh-university-online',
  'chandigarh': 'chandigarh-university-online',
  'upes': 'upes-online',
  'nmims': 'nmims-online',
  'symbiosis': 'symbiosis-university-online',
  'ssodl': 'symbiosis-university-online',
  'dy patil': 'dy-patil-university-online',
  'd.y. patil': 'dy-patil-university-online',
  'parul': 'parul-university-online',
  'shoolini': 'shoolini-university-online',
  'sharda': 'sharda-university-online',
  'chitkara': 'chitkara-university-online',
  'yenepoya': 'yenepoya-university-online',
  'dayananda sagar': 'dayananda-sagar-university-online',
  'dsu': 'dayananda-sagar-university-online',
  'amrita': 'amrita-vishwa-vidyapeetham-online',
  'mangalayatan': 'mangalayatan-university-online',
  'vignan': 'vignan-university-online',
}
for (const [alias, uid] of Object.entries(MANUAL)) {
  if (UNI_BY_ID.has(uid)) addAlias(alias, uid)
}
const seen = new Set()
const ALIASES = aliasEntries
  .filter(({ alias }) => { if (seen.has(alias)) return false; seen.add(alias); return alias.length >= 3 })
  .sort((a, b) => b.alias.length - a.alias.length)

const PROG_PATTERNS = [
  { prog: 'MBA (WX)', re: /\bMBA\s*\(?WX\)?\b/i },
  { prog: 'MBA', re: /\bMBA\b|\bmaster of business admin/i },
  { prog: 'MCA', re: /\bMCA\b|\bmaster of computer appl/i },
  { prog: 'MSc', re: /\bMSc\b|\bM\.Sc\.?\b|\bmaster of science\b/i },
  { prog: 'MA', re: /\bMA\b|\bM\.A\.?\b|\bmaster of arts\b/i },
  { prog: 'M.Com', re: /\bM\.?Com\b|\bmaster of commerce\b/i },
  { prog: 'BBA', re: /\bBBA\b|\bbachelor of business admin/i },
  { prog: 'BCA', re: /\bBCA\b|\bbachelor of computer appl/i },
  { prog: 'BSc', re: /\bBSc\b|\bB\.Sc\.?\b|\bbachelor of science\b/i },
  { prog: 'BA', re: /\bBA\b|\bB\.A\.?\b|\bbachelor of arts\b/i },
  { prog: 'B.Com', re: /\bB\.?Com\b|\bbachelor of commerce\b/i },
]

function detectProgramme(text) {
  for (const { prog, re } of PROG_PATTERNS) if (re.test(text)) return prog
  return null
}
function detectUniversity(text) {
  const lower = text.toLowerCase()
  for (const { alias, uid } of ALIASES) {
    const idx = lower.indexOf(alias)
    if (idx === -1) continue
    const before = idx === 0 ? ' ' : lower[idx - 1]
    const after = idx + alias.length >= lower.length ? ' ' : lower[idx + alias.length]
    if (/[a-z0-9]/.test(before) || /[a-z0-9]/.test(after)) continue
    return uid
  }
  return null
}

const RUPEE_RE = /(?:₹|Rs\.?\s*|INR\s+)([\d]+(?:[.,]\d+)*)(\s*(?:L(?:akhs?|acs?)?|K|Cr(?:ore)?s?))?/gi
const NON_FEE_RE = /\b(LPA|salary|salaries|package|packages|CTC|stipend|per\s*month|monthly|\/\s*month|\/\s*mo|per\s*annum|p\.?a\.?|EMI|instal(l?)ment|per\s*year|payout|payouts|earn|earning|compensation|starting\s+salary)\b/i
const TOL = 0.02

function normalise(numStr, suffix) {
  const n = parseFloat(numStr.replace(/,/g, ''))
  if (!isFinite(n)) return null
  const suf = (suffix || '').trim().toLowerCase()
  if (/^cr/.test(suf)) return Math.round(n * 10_000_000)
  if (/^l/.test(suf)) return Math.round(n * 100_000)
  if (/^k/.test(suf)) return Math.round(n * 1_000)
  return Math.round(n)
}

function classify({ blogValue, universityId, programme }) {
  if (!universityId || !programme) return { klass: 'UNRESOLVED' }
  const u = UNI_BY_ID.get(universityId)
  if (!u) return { klass: 'UNRESOLVED' }
  if (!u.programs.includes(programme)) return { klass: 'ORPHAN', dataMin: null, dataMax: null, delta: null, rule: null }
  const disp = getDisplayFee(u, programme)
  if (!disp.ok) return { klass: 'SUPPRESSED', dataMin: null, dataMax: null, delta: null, rule: disp.rule || null }
  const dMin = disp.min ?? 0
  const dMax = disp.max ?? dMin
  if (blogValue >= dMin * (1 - TOL) && blogValue <= dMax * (1 + TOL)) {
    return { klass: 'MATCH', dataMin: dMin, dataMax: dMax, delta: 0, rule: disp.rule || null }
  }
  const nearest = blogValue < dMin ? dMin : dMax
  return { klass: 'MISMATCH', dataMin: dMin, dataMax: dMax, delta: nearest > 0 ? (blogValue - nearest) / nearest : null, rule: disp.rule || null }
}

export function scanAllPosts() {
  const rows = []
  for (const post of BLOG_POSTS) {
    if (post.status !== 'published') continue
    const html = post.content || ''
    const faqBlob = (post.faqs || []).map(f => `${f.q}\n${f.a}`).join('\n')
    const combined = `${html}\n${faqBlob}`
    for (const m of combined.matchAll(RUPEE_RE)) {
      const value = normalise(m[1], m[2] || '')
      if (value == null) continue
      const start = Math.max(0, m.index - 120)
      const end = Math.min(combined.length, m.index + m[0].length + 120)
      const context = combined.slice(start, end).replace(/\s+/g, ' ').trim()
      const tight = combined.slice(Math.max(0, m.index - 60), Math.min(combined.length, m.index + m[0].length + 60))
      if (NON_FEE_RE.test(tight)) {
        rows.push({ slug: post.slug, publishedAt: post.publishedAt, raw: m[0], value, klass: 'NON_FEE', universityId: '', programme: '', context })
        continue
      }
      const uid = detectUniversity(combined.slice(Math.max(0, m.index - 500), m.index + m[0].length))
        || detectUniversity(`${post.slug.replace(/-/g, ' ')} ${post.title}`)
      const prog = detectProgramme(combined.slice(Math.max(0, m.index - 200), m.index + m[0].length + 200))
        || detectProgramme(`${post.slug.replace(/-/g, ' ')} ${post.title}`)
      const cls = classify({ blogValue: value, universityId: uid, programme: prog })
      const primary = uid ? detectUniversity(post.slug.replace(/-/g, ' ')) === uid : false
      rows.push({
        slug: post.slug,
        publishedAt: post.publishedAt,
        raw: m[0],
        value,
        klass: cls.klass,
        universityId: uid || '',
        programme: prog || '',
        dataMin: cls.dataMin ?? null,
        dataMax: cls.dataMax ?? null,
        delta: cls.delta,
        rule: cls.rule ?? null,
        primary: uid ? (primary ? 'primary' : 'competitor') : '',
        context,
      })
    }
  }
  return rows
}

// Per-slug count of NON-verified fee figures. Verified = MATCH.
// NON_FEE is excluded. UNRESOLVED, MISMATCH, SUPPRESSED, ORPHAN count.
export function perSlugUnverifiedCounts(rows) {
  const counts = {}
  for (const r of rows) {
    if (r.klass === 'NON_FEE') continue
    if (r.klass === 'MATCH') continue
    counts[r.slug] = (counts[r.slug] || 0) + 1
  }
  return counts
}
