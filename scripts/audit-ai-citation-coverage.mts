// scripts/audit-ai-citation-coverage.mts
//
// Step 0 of the AI-citation sprint (2026-11-04). Read-only. For every
// university with an online MBA in lib/data.ts, and for each of the ten
// autocomplete question clusters (Q1-Q10), records whether the question is
// already answered, where, which page should own a new answer, whether we hold
// the data, and whether a new answer would contradict an existing claim.
//
// Writes audits/ai-citation-coverage-2026-11-04.csv and prints a summary.
// Run: npx tsx scripts/audit-ai-citation-coverage.mts

import { readFileSync, writeFileSync } from 'node:fs'
import { UNIVERSITIES, specName } from '../lib/data.ts'
import { BLOG_POSTS } from '../lib/blog.ts'
import { getExactFee } from '../lib/fees.ts'
import { getProgramLinks } from '../lib/internal-links.ts'
import { getPageContent } from '../lib/data/page-content.ts'
import { hasSyllabusData } from '../lib/syllabus.ts'
import { PAIRS } from '../app/compare/[pair]/pairs.ts'
import { scanAllPosts } from './lib/blog-fee-scan.mjs'
import { REVIEW_BLOG_FOR, LEGIT_BLOG_FOR } from '../lib/answers/targets.ts'

const DATE = '2026-11-04'
const blogSrc = readFileSync('lib/blog.ts', 'utf8').split('\n')
const upbSrc = readFileSync('components/UniProgramBody.tsx', 'utf8').split('\n')
const lineOf = (lines: string[], needle: string, from = 0) => {
  for (let i = from; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1
  return 0
}
const slugLine = (slug: string) => {
  for (let i = 0; i < blogSrc.length; i++) {
    const l = blogSrc[i]
    if ((l.includes(`slug: '${slug}'`) || l.includes(`slug: "${slug}"`) || l.includes(`"slug": "${slug}"`) || l.includes(`slug: \`${slug}\``))) return i + 1
  }
  return 0
}

const Q = [
  { id: 'Q1', name: 'fees', re: /\bfees?\b|\bcost|\bprice/i },
  { id: 'Q2', name: 'worth it', re: /worth|good or|should you|verdict|honest take|pros and cons/i },
  { id: 'Q3', name: 'placements', re: /placement|package|salary|recruit|hiring/i },
  { id: 'Q4', name: 'degree valid', re: /\bvalid|certificate|equivalen|recogni[sz]ed/i },
  { id: 'Q5', name: 'specialisations', re: /speciali[sz]ation|electives?\b/i },
  { id: 'Q6', name: 'eligibility', re: /eligib/i },
  { id: 'Q7', name: 'exam pattern', re: /\bexam|assessment|proctor/i },
  { id: 'Q8', name: 'syllabus', re: /syllabus|curriculum|subjects|semester-wise/i },
  { id: 'Q9', name: 'approvals', re: /\bugc|aicte|\bwes\b|\bnaac|approv|accredit/i },
  { id: 'Q10', name: 'admission', re: /admission|last date|deadline|intake|how to apply/i },
] as const

// Template FAQ on every MBA hub (components/UniProgramBody.tsx). The question
// text is the needle; the cluster it answers is the key.
const HUB_TEMPLATE: Record<string, string> = {
  Q1: 'What is the total fee for',
  Q4: 'degree from ${cleanName} valid',
  Q5: 'What specialisations does',
  Q6: 'What is the eligibility for',
  Q7: 'What exam mode does',
  Q9: 'NAAC accredited?',
}

const strip = (h: string) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
function headings(html: string): string[] {
  const out: string[] = []
  const re = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) out.push(strip(m[2]))
  return out
}

const feeRows = scanAllPosts() as Array<{ slug: string; klass: string; universityId: string; raw?: string }>
const mismatchBySlug = new Map<string, number>()
for (const r of feeRows as Array<{ slug: string; klass: string; universityId: string; programme?: string }>) {
  if (r.klass !== 'MISMATCH') continue
  const k = `${r.slug}|${r.universityId}|${r.programme}`
  mismatchBySlug.set(k, (mismatchBySlug.get(k) ?? 0) + 1)
}
// Tokens that name a university in prose: its first significant word plus any
// bracketed short form ("MUJ", "SSODL"). Used to keep another university's
// grade or spec count from reading as a claim about this one.
const GENERIC = new Set(['the', 'university', 'dr.', 'shri', 'sri', 'institute', 'indian'])
function tokensFor(name: string): string[] {
  const t = new Set<string>()
  const first = name.split(/\s+/).find(w => !GENERIC.has(w.toLowerCase()))
  if (first) t.add(first.replace(/[^A-Za-z.']/g, ''))
  for (const m of name.matchAll(/\(([A-Z][A-Za-z-]{1,10})\)/g)) t.add(m[1])
  return [...t].filter(x => x.length >= 3)
}

const NAAC_RE = /NAAC\s*(?:grade\s*)?(A\+\+|A\+|A|B\+\+|B\+|B)(?![+\w])/g
const SPEC_RE = /(\d{1,2})\s+(?:MBA\s+)?speciali[sz]ations/gi

const rows: string[][] = []
const header = ['uni_id', 'question', 'already_answered', 'where', 'target_page_for_new_answer', 'data_available', 'source', 'blocked_by_conflict', 'conflict_note']
const conflictsOut: string[] = []

const mbaUnis = UNIVERSITIES.filter(u => u.programs.includes('MBA') && u.programDetails.MBA)
for (const u of mbaUnis) {
  const pd = u.programDetails.MBA!
  const reviewSlug = REVIEW_BLOG_FOR[u.id] ?? null
  const legitSlug = LEGIT_BLOG_FOR[u.id] ?? null
  const review = reviewSlug ? BLOG_POSTS.find(p => p.slug === reviewSlug && p.status === 'published') : undefined
  const legit = legitSlug ? BLOG_POSTS.find(p => p.slug === legitSlug && p.status === 'published') : undefined
  const content = getPageContent(u.id, 'mba')
  const hubFaqFromJson = !!content?.sections?.faqs?.length
  const fee = getExactFee(u, 'MBA')
  const specCount = pd.specs.length

  // Conflicts on the review page, computed once.
  const conflict: Record<string, string> = {}
  if (review) {
    const text = review.content + '\n' + review.faqs.map(f => f.q + ' ' + f.a).join('\n') + '\n' + review.title + ' ' + (review.seoTitle ?? '')
    const mm = mismatchBySlug.get(`${review.slug}|${u.id}|MBA`) ?? 0
    if (mm > 0) conflict.Q1 = `${mm} MISMATCH fee figure(s) on the post (scripts/lib/blog-fee-scan.mjs)`
    const toks = tokensFor(u.name)
    const own = text.replace(/<[^>]+>/g, ' ').split(/(?<=[.!?|])\s+|\n/)
      .filter(snt => toks.some(t => snt.includes(t)) && !/\bvs\b|compared|than|while|whereas/i.test(snt)).join('\n')
    const grades = new Set<string>()
    for (const m of own.matchAll(NAAC_RE)) grades.add(m[1])
    if (u.naac && [...grades].some(g => g !== u.naac)) conflict.Q9 = `post states NAAC ${[...grades].join('/')}, data.ts ${u.naac}`
    const counts = new Set<number>()
    for (const m of own.matchAll(SPEC_RE)) counts.add(Number(m[1]))
    if (counts.size && [...counts].some(c => c !== specCount)) conflict.Q5 = `post states ${[...counts].join('/')} specialisations, data.ts ${specCount}`
  }

  for (const q of Q) {
    let answered = 'N', where = ''
    if (review) {
      const hs = headings(review.content)
      const h = hs.find(x => q.re.test(x))
      const f = review.faqs.find(x => q.re.test(x.q))
      const sl = slugLine(review.slug)
      if (h) { answered = 'Y'; where = `lib/blog.ts:${lineOf(blogSrc, h.slice(0, 24), sl) || sl} H2/H3 "${h}"` }
      else if (f) { answered = 'Y'; where = `lib/blog.ts:${lineOf(blogSrc, f.q.slice(0, 24), sl) || sl} FAQ "${f.q}"` }
    }
    if (answered === 'N' && legit && (q.id === 'Q4' || q.id === 'Q9')) {
      const hs = headings(legit.content)
      const h = hs.find(x => q.re.test(x))
      if (h) { answered = 'Y'; where = `lib/blog.ts:${slugLine(legit.slug)} legit post ${legit.slug} "${h}"` }
    }
    if (answered === 'N' && !review && HUB_TEMPLATE[q.id]) {
      answered = 'Y'
      where = hubFaqFromJson
        ? `lib/data/page-content/${u.id}-mba-*.json FAQ (replaces hub template)`
        : `components/UniProgramBody.tsx:${lineOf(upbSrc, HUB_TEMPLATE[q.id])} hub template FAQ`
    }

    const target = (q.id === 'Q4' || q.id === 'Q9') && legit
      ? `/blog/${legit.slug} (owner; link only)`
      : review ? `/blog/${review.slug}` : `/universities/${u.id}/mba (QuickAnswers)`

    let data = 'N', source = ''
    switch (q.id) {
      case 'Q1': data = fee.kind === 'none' ? 'partial' : 'Y'; source = fee.kind === 'none' ? 'lib/fees.ts getExactFee=none (counsellor CTA)' : `lib/fees.ts getExactFee kind=${fee.kind}`; break
      case 'Q2': data = 'Y'; source = 'lib/data.ts naac/nirfMgt/ugc/specs + getExactFee'; break
      case 'Q3': data = 'N'; source = 'needs official fetch'; break
      case 'Q4': data = u.ugc ? 'Y' : 'N'; source = 'lib/data.ts ugc + provenance ugc-reg22-equivalence'; break
      case 'Q5': data = specCount ? 'Y' : 'N'; source = `lib/data.ts programDetails.MBA.specs (${specCount})`; break
      case 'Q6': data = u.eligibility ? 'Y' : 'N'; source = 'lib/data.ts eligibility'; break
      case 'Q7': data = u.examMode ? 'partial' : 'N'; source = `lib/data.ts examMode=${u.examMode}`; break
      case 'Q8': data = hasSyllabusData(u.id, 'MBA') ? 'partial' : 'N'; source = hasSyllabusData(u.id, 'MBA') ? 'lib/data/syllabus-manifest.json' : 'none held'; break
      case 'Q9': data = 'Y'; source = 'lib/data.ts ugc/naac/nirf/nirfMgt'; break
      case 'Q10': data = 'N'; source = 'no admission_cycles data in repo'; break
    }
    const blocked = conflict[q.id] ? 'Y' : 'N'
    if (blocked === 'Y') conflictsOut.push(`${u.id} ${q.id} on /blog/${review!.slug}: ${conflict[q.id]}`)
    rows.push([u.id, `${q.id} ${q.name}`, answered, where, target, data, source, blocked, conflict[q.id] ?? ''])
  }
}

const csv = [header, ...rows].map(r => r.map(c => /[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c).join(',')).join('\n') + '\n'
writeFileSync(`audits/ai-citation-coverage-${DATE}.csv`, csv)

// Summary
console.log(`MBA universities: ${mbaUnis.length}; rows: ${rows.length}`)
const withReview = mbaUnis.filter(u => REVIEW_BLOG_FOR[u.id])
console.log(`with a review blog: ${withReview.length}; hub-only: ${mbaUnis.length - withReview.length}`)
for (const q of Q) {
  const rs = rows.filter(r => r[1].startsWith(q.id + ' '))
  console.log(`${q.id} ${q.name}: answered ${rs.filter(r => r[2] === 'Y').length}, data Y ${rs.filter(r => r[5] === 'Y').length}, partial ${rs.filter(r => r[5] === 'partial').length}, blocked ${rs.filter(r => r[7] === 'Y').length}`)
}
console.log('\nConflicts:'); for (const c of conflictsOut) console.log('  ' + c)
console.log('\nPairs in pairs.ts:', Object.keys(PAIRS).join(', '))
const posts = new Set(BLOG_POSTS.map(p => p.slug))
console.log('\nBLOG_TO_UNIVERSITY gaps (review slug not registered in internal-links):')
for (const u of withReview) if (!getProgramLinks(u.id, 'mba')?.blogs.some(b => b.slug === REVIEW_BLOG_FOR[u.id])) console.log('  ' + u.id + ' -> ' + REVIEW_BLOG_FOR[u.id] + (posts.has(REVIEW_BLOG_FOR[u.id]) ? '' : ' (MISSING POST)'))
void specName
