// scripts/gen-hidden-hub-content.mts
// Generate factual page-content JSON for hidden programme hubs that have no
// available fee, so they pass shouldIndexProgrammeHub via hasContentJson and
// render real content. FeeBreakdown shows the counsellor CTA for the fee.
// See memory: feedback_hidden_page_content.
//
// Usage: npx tsx scripts/gen-hidden-hub-content.mts [slugFilter]
//   slugFilter (optional): only generate for universities whose id includes it.
//
// Content rules: factual only (grounded in lib/data.ts), no fabricated stats,
// NO fee numbers in the body, NO em dashes, active voice, house style.

import { UNIVERSITIES } from '../lib/data'
import { getDisplayFee } from '../lib/fees'
import { getPageContent } from '../lib/data/page-content'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join(process.cwd(), 'lib', 'data', 'page-content')
const filter = process.argv[2] || ''

function parseCsv(l: string) { const o: string[] = []; let c = '', q = false; for (let i = 0; i < l.length; i++) { const ch = l[i]; if (ch === '"') { if (q && l[i + 1] === '"') { c += '"'; i++ } else q = !q } else if (ch === ',' && !q) { o.push(c); c = '' } else c += ch } o.push(c); return o }
const lines = readFileSync('audits/noindex-hub-fee-worklist-2026-08-23.csv', 'utf8').split(/\r?\n/).filter(Boolean)
const hdr = parseCsv(lines[0])
const rows = lines.slice(1).map(parseCsv).map(r => Object.fromEntries(hdr.map((k, i) => [k, r[i]])) as any)
const bySlug = new Map(UNIVERSITIES.map(u => [u.id, u]))

// Programme profiles (level, duration words, focus, careers, eligibility base).
const PROF: Record<string, any> = {
  'BBA': { name: 'BBA', long: 'Bachelor of Business Administration', level: 'UG', years: 'three-year', base: 'a pass in 10+2 (any stream) from a recognised board',
    focus: 'the fundamentals of management, marketing, finance, human resources and operations', roles: ['management trainee', 'marketing executive', 'sales executive', 'HR coordinator', 'operations associate'], next: 'an MBA or a specialised master\'s' },
  'BCA': { name: 'BCA', long: 'Bachelor of Computer Applications', level: 'UG', years: 'three-year', base: 'a pass in 10+2 (any stream, mathematics preferred) from a recognised board',
    focus: 'programming, web and application development, databases and the foundations of computer science', roles: ['junior software developer', 'web developer', 'quality analyst', 'support engineer', 'junior data analyst'], next: 'an MCA or a master\'s in computing' },
  'B.Com': { name: 'B.Com', long: 'Bachelor of Commerce', level: 'UG', years: 'three-year', base: 'a pass in 10+2 (commerce preferred, any stream accepted) from a recognised board',
    focus: 'accounting, taxation, business law, economics and financial reporting', roles: ['accounts assistant', 'tax associate', 'audit assistant', 'banking associate', 'finance executive'], next: 'an M.Com, an MBA or a professional route such as CA or CMA' },
  'MBA': { name: 'MBA', long: 'Master of Business Administration', level: 'PG', years: 'two-year', base: 'a bachelor\'s degree in any discipline from a recognised university',
    focus: 'management strategy, finance, marketing, operations and people leadership', roles: ['management trainee', 'business analyst', 'operations executive', 'marketing executive', 'finance executive'], next: 'senior management roles or a specialised certification' },
  'MCA': { name: 'MCA', long: 'Master of Computer Applications', level: 'PG', years: 'two-year', base: 'a bachelor\'s degree with mathematics or computer science as studied at 10+2 or graduation level',
    focus: 'advanced software engineering, data structures, application development and modern computing', roles: ['software developer', 'web developer', 'system analyst', 'data analyst', 'software engineer'], next: 'senior developer and architect roles' },
  'M.Com': { name: 'M.Com', long: 'Master of Commerce', level: 'PG', years: 'two-year', base: 'a B.Com or an equivalent bachelor\'s degree from a recognised university',
    focus: 'advanced accounting, corporate finance, taxation and research methods in commerce', roles: ['accountant', 'finance executive', 'taxation associate', 'audit associate', 'commerce lecturer'], next: 'a research path, teaching, or a professional finance qualification' },
}

function cleanName(u: any) { return u.name.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+Online$/i, '').replace(/\s{2,}/g, ' ').trim() }
function cleanSpecs(specs: string[]): string[] {
  const arr = (specs || []).filter((s): s is string => typeof s === 'string')
  // If any entry has an unbalanced paren, the source array was mis-split
  // (e.g. ['General (C', 'C++', 'Software Testing)']). Treat as unreliable
  // and fall back to a general programme rather than print fragments.
  const unbalanced = arr.some(s => (s.includes('(') !== s.includes(')')))
  if (unbalanced) return []
  return arr
    .map(s => s.trim())
    .filter(s => s.length > 2 && !s.includes('(') && !s.endsWith(')') && s.toLowerCase() !== 'general')
}
function placeStr(u: any) {
  const c = (u.city && u.city !== 'Online' && u.city !== '-') ? u.city : ''
  if (c && u.state && u.state !== 'Online') return `${c}, ${u.state}`
  if (u.state && u.state !== 'Online') return u.state
  return ''
}

function build(u: any, prog: string) {
  const P = PROF[prog]; if (!P) return null
  const cn = cleanName(u)
  const specs = cleanSpecs(u.programDetails?.[prog]?.specs || [])
  const place = placeStr(u)
  const naac = u.naac
  const isPG = P.level === 'PG'
  const audience = isPG
    ? (prog === 'MBA' ? 'working professionals and graduates who want a management qualification without leaving their job'
       : `graduates who want a recognised ${P.name} they can complete online`)
    : `students who have finished 10+2 and want a recognised ${P.name} they can complete online`

  const specLine = specs.length >= 2
    ? `Specialisations include ${specs.slice(0, 6).join(', ')}.`
    : `Offered as a broad ${P.name} covering the core curriculum.`

  const tldr = `TL;DR: The ${cn} online ${P.name} is a UGC-DEB approved ${P.years} ${P.long}, delivered fully online. ${cn} holds NAAC ${naac} accreditation. ${specLine} It suits ${audience}. For the current confirmed fee and EMI options, speak with our counsellor, since the fee for this programme is verified case by case rather than published as a fixed table.`

  const hero = {
    eyebrow: `Online ${P.name}`,
    headline: `${cn} Online ${P.name}`,
    sub: `A UGC-DEB approved, NAAC ${naac} ${P.long}, delivered online.`,
  }

  const ugcBody = `The UGC Distance Education Bureau regulates every online degree in India. ${cn} is UGC-DEB entitled for online delivery, which means this ${P.name} is valid for government and PSU recruitment, for private-sector employment, and for higher study at recognised Indian universities. ${cn} also holds NAAC ${naac} accreditation. Always confirm the current entitlement for your admission year at deb.ugc.ac.in before you enrol.`

  const whoBody = `You are eligible for the ${cn} online ${P.name} if you have ${P.base}. ${isPG ? 'The online format is built for people who want to study while they work.' : 'The online format lets you study from anywhere and manage your own schedule.'} It fits ${audience}. Confirm the exact cut-off and any programme-specific requirement with the university before you apply.`

  // Only these sections render in UniProgramBody: tldr, ugcDeb, abcId,
  // redFlags, faqs. Everything factual is folded into those.
  const abcBody = `Every student in a UGC-approved online programme needs an Academic Bank of Credits (ABC) ID. You create it free on the ABC portal at abc.gov.in, usually through your DigiLocker account. As you clear each semester of the ${cn} online ${P.name}, your credits are deposited against this ID, which makes it easier to carry credits forward or move to ${P.next} later. Keep the same ABC ID through the whole ${P.years} programme.`

  const flags: Array<{ sentence1: string; sentence2: string }> = [
    { sentence1: `${cn} does not publish a single fixed fee table for this online ${P.name}.`, sentence2: `Get the current fee and any EMI terms confirmed in writing before you pay, rather than relying on a figure quoted elsewhere.` },
    { sentence1: `This is a fully online programme with no on-campus classes.`, sentence2: `If you want in-person teaching or a campus experience, this is not the right format for you.` },
    { sentence1: `Online study is self-driven and career support is not guaranteed.`, sentence2: `Plan to build your own study routine, and expect to run your own job search after you graduate.` },
    { sentence1: `UGC-DEB entitlement is granted intake by intake.`, sentence2: `Confirm that ${cn} is on the current approved list at deb.ugc.ac.in for your admission year before you enrol.` },
  ]

  const faqs = [
    { question: `Is the ${cn} online ${P.name} valid?`, answer: `Yes. ${cn} is UGC-DEB entitled for online delivery and holds NAAC ${naac}. The ${P.name} is valid for employment, for government and PSU recruitment, and for higher study at recognised Indian universities. Confirm the current status at deb.ugc.ac.in.` },
    { question: `Who can apply for the ${cn} online ${P.name}?`, answer: `You need ${P.base}. ${isPG ? 'The online format is built for people who want to study while they work.' : 'The online format lets you study from anywhere on your own schedule.'} Confirm the exact cut-off with the university before applying.` },
    { question: `How long is the ${cn} online ${P.name}?`, answer: `It is a ${P.years} programme delivered fully online, which lets you study around work or other commitments.` },
    ...(specs.length >= 2 ? [{ question: `What specialisations does the ${cn} online ${P.name} offer?`, answer: `Current specialisations include ${specs.slice(0, 6).join(', ')}. The core curriculum, covering ${P.focus}, is the same across all of them, so choose the one that matches the role you want next. Confirm the live list with the university.` }] : []),
    { question: `Who should consider the ${cn} online ${P.name}?`, answer: `It suits ${audience}${place ? `, and carries local weight around ${place}` : ''}. For the ${P.name} you would study ${P.focus}, and typical early roles include ${P.roles.slice(0, 3).join(', ')}. Many graduates go on to ${P.next}.` },
    { question: `What is the fee for the ${cn} online ${P.name}?`, answer: `The current confirmed fee is verified case by case rather than published as a fixed table. Speak with our counsellor for the latest fee and EMI options, and confirm the figure with the university in writing before you pay.` },
  ]

  const sections: any = {
    tldr,
    hero,
    ugcDeb: { heading: `${cn} Online ${P.name}: UGC-DEB Approval and Validity`, body: ugcBody },
    abcId: { heading: 'Academic Bank of Credits (ABC ID)', body: abcBody },
    redFlags: { heading: 'What to Check Before You Enrol', flags },
    faqs,
  }
  void whoBody

  return {
    uniSlug: u.id,
    program: prog.toLowerCase(),
    sections,
    metadata: { generatedAt: new Date().toISOString().slice(0, 10), source: 'gen-hidden-hub-content', note: 'Factual hub content to index a no-fee hidden page; fee shown via counsellor CTA.' },
  }
}

let made = 0, skipped = 0
for (const r of rows) {
  const slug = r.url.split('/')[2]
  if (filter && !slug.includes(filter)) continue
  const u: any = bySlug.get(slug); if (!u) { console.log('SKIP missing uni', slug); continue }
  const prog = r.programme
  if (getDisplayFee(u, prog).ok) { skipped++; continue }        // has a fee, no content needed
  if (getPageContent(u.id, prog.toLowerCase()) !== null) { skipped++; continue } // already has content
  const content = build(u, prog)
  if (!content) { console.log('SKIP no profile', slug, prog); continue }
  const file = join(OUT, `${u.id}-${prog.toLowerCase()}.json`)
  if (existsSync(file)) { console.log('EXISTS, skip', file); skipped++; continue }
  writeFileSync(file, JSON.stringify(content, null, 2) + '\n', 'utf8')
  console.log('WROTE', `${u.id}-${prog.toLowerCase()}.json`)
  made++
}
console.log(`\nGenerated ${made}, skipped ${skipped}.`)
