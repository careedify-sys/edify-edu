// scripts/build-ai-citation-appendix.mts
//
// Writes the AI-citation answer sections (lib/answers/) into existing posts in
// lib/blog.ts. ADDITIVE ONLY:
//   - HTML is appended at the very end of `content`, between
//     <!-- ai-answers:start --> and <!-- ai-answers:end --> markers. A re-run
//     replaces only what is between the markers, so it is idempotent.
//   - FAQ items are appended to the end of the post's existing `faqs` array,
//     skipping any question already present (case-insensitive).
//   - Nothing outside those two insertion points is touched.
//
// Located with the TypeScript parser, never a regex: lib/blog.ts mixes three
// quote styles and has no stable field order. All edits are computed against
// the original text and applied from the end backwards in one pass, so no
// offset shifts under a later edit.
//
// Usage: npx tsx scripts/build-ai-citation-appendix.mts [--batch A1,A2] [--dry]

import { readFileSync, writeFileSync } from 'node:fs'
import ts from 'typescript'
import { getUniversityById } from '../lib/data.ts'
import { BLOG_POSTS } from '../lib/blog.ts'
import { BLOG_PLAN, type BlogPlan } from '../lib/answers/blog-plan.ts'
import { LEGIT_BLOG_FOR } from '../lib/answers/targets.ts'
import { buildSections, displayName, searchedSpecFaqs, leadWordCount, type AnswerSection } from '../lib/answers/university-answers.ts'
import { appendixHtml, APPENDIX_START, APPENDIX_END, esc } from '../lib/answers/render-html.ts'
import { provenance } from '../lib/answers/provenance.ts'
import { GENERIC_APPENDICES } from '../lib/answers/generic-appendices.ts'

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const batchArg = args.find(a => a.startsWith('--batch'))
const batches = batchArg ? (batchArg.split('=')[1] ?? args[args.indexOf(batchArg) + 1]).split(',') : null

// ── content checks (house style) ───────────────────────────────────────────
const BANNED = /\b(delve|comprehensive|testament|pivotal|landscape|navigate|robust|holistic|seamless|synergy|unlock|showcase|journey|realm)\b|in today's rapidly evolving|it is important to note|in conclusion|^(Furthermore|Moreover|Additionally),/im
function checkText(where: string, s: string) {
  if (s.includes('—')) throw new Error(`${where}: em dash`)
  if (s.includes('EdifyEdu')) throw new Error(`${where}: write edifyedu.in, never EdifyEdu`)
  const m = s.match(BANNED)
  if (m) throw new Error(`${where}: banned word "${m[0]}"`)
}
function checkSections(slug: string, secs: AnswerSection[]) {
  for (const s of secs) {
    const n = leadWordCount(s)
    if (n < 40 || n > 60) throw new Error(`${slug} ${s.key}: lead is ${n} words (40-60)`)
    checkText(`${slug} ${s.key}`, [s.heading, s.lead, ...(s.bullets ?? []), s.notPublished ?? '', ...(s.table?.rows.flat() ?? [])].join('\n'))
  }
}

// ── extra FAQs ─────────────────────────────────────────────────────────────
type Faq = { q: string; a: string }
function extraFaqs(plan: BlogPlan): Faq[] {
  const u = getUniversityById(plan.uni)
  const out: Faq[] = []
  for (const key of plan.extraFaqs ?? []) {
    if (key === 'searched-specs' && u) out.push(...searchedSpecFaqs(u, displayName(u)))
    if (key === 'amity-good-or-bad' && u) {
      const [s] = buildSections(u, ['Q2'], { omit: plan.omit })
      out.push({ q: 'Is Amity online MBA good or bad?', a: s.lead })
    }
    if (key === 'amity-dual') {
      provenance('amity-dual-spec')
      out.push({ q: 'Does Amity online MBA offer dual specialisation?', a: 'Amity University Online lists an "MBA With Dual Specialization" option on its MBA page. That page gives no separate fee or structure for it, and edifyedu.in holds none, so talk to our counsellor for the dual specialisation fee before you apply.' })
    }
    if (key === 'amity-wes') {
      provenance('amity-wes')
      out.push({ q: 'Is Amity online MBA WES approved?', a: 'Amity University Online states on its MBA page that its degrees are recognised by World Education Services (WES) Canada and USA. edifyedu.in has not checked this with WES, so confirm the current position with WES before you rely on it for an application abroad.' })
    }
    if (key === 'ssodl-vs-distance') {
      out.push({ q: 'Is Symbiosis online MBA the same as Symbiosis distance MBA?', a: 'No. edifyedu.in lists Symbiosis School for Online and Digital Learning (SSODL) for online programmes and does not list a Symbiosis distance (ODL) MBA. Online and distance are different modes, and the UGC-DEB register records the mode for each entitlement, so check the programme and mode at deb.ugc.ac.in.' })
    }
    if (key === 'bits-offers-mba' && u) {
      out.push({ q: 'Does BITS Pilani offer an online MBA?', a: `Yes. edifyedu.in lists an MBA as the online programme of BITS Pilani Work Integrated Learning Programmes (WILP), with ${u.programDetails.MBA?.duration ?? '2 Years'} on record. BITS Pilani WILP is listed separately from Birla Institute of Technology (BIT) Mesra, so check the full name on the admission page.` })
    }
    if (key === 'christ-mba' && u) {
      out.push({ q: 'Does Christ University have an online MBA?', a: `edifyedu.in's database lists Christ (Deemed to be University) Online for an online ${u.programs.join(', ')}, and no online MBA. Check the current UGC-DEB register at deb.ugc.ac.in before you rely on any list, including ours, and talk to our counsellor for online MBA options in Bengaluru.` })
    }
  }
  return out
}

// ── per-post payload ───────────────────────────────────────────────────────
interface Payload { slug: string; html: string; faqs: Faq[]; sections: AnswerSection[] }
function payloadFor(plan: BlogPlan): Payload {
  const post = BLOG_POSTS.find(p => p.slug === plan.slug)
  if (!post) throw new Error(`no post ${plan.slug}`)
  const u = getUniversityById(plan.uni)
  if (!u) throw new Error(`no university ${plan.uni}`)
  const secs = plan.sections.length || plan.uni.includes('manipal') || plan.uni.includes('patil')
    ? buildSections(u, plan.sections, { omit: plan.omit })
    : []
  checkSections(plan.slug, secs)
  const extra: string[] = []
  const legit = LEGIT_BLOG_FOR[plan.uni]
  const beforeAppendix = post.content.split(APPENDIX_START)[0]
  if (plan.linkLegit && legit && !beforeAppendix.includes(`/blog/${legit}`)) {
    const lp = BLOG_POSTS.find(p => p.slug === legit && p.status === 'published')
    if (lp) extra.push(`<p>For the UGC-DEB and NAAC checks on ${esc(displayName(u))}, read <a href="/blog/${legit}">${esc(lp.title)}</a>.</p>`)
  }
  const faqs = [...secs.filter(s => s.faq).map(s => s.faq!), ...extraFaqs(plan)]
  for (const f of faqs) checkText(`${plan.slug} faq`, f.q + '\n' + f.a)
  const html = secs.length || extra.length ? appendixHtml(secs, extra) : ''
  if (html) checkText(plan.slug, html)
  return { slug: plan.slug, html, faqs, sections: secs }
}

// ── locate and edit ────────────────────────────────────────────────────────
const SRC_PATH = 'lib/blog.ts'
const src = readFileSync(SRC_PATH, 'utf8')
const sf = ts.createSourceFile(SRC_PATH, src, ts.ScriptTarget.Latest, true)
let arr: ts.ArrayLiteralExpression | null = null
sf.forEachChild(function visit(n) {
  if (ts.isVariableDeclaration(n) && n.name.getText(sf) === 'BLOG_POSTS' && n.initializer && ts.isArrayLiteralExpression(n.initializer)) arr = n.initializer
  else n.forEachChild(visit)
})
if (!arr) throw new Error('BLOG_POSTS array not found')
const propName = (p: ts.ObjectLiteralElementLike) => p.name ? p.name.getText(sf).replace(/^["'`]|["'`]$/g, '') : ''
const nodes = new Map<string, ts.ObjectLiteralExpression[]>()
for (const el of (arr as ts.ArrayLiteralExpression).elements) {
  if (!ts.isObjectLiteralExpression(el)) continue
  const sp = el.properties.find(p => propName(p) === 'slug') as ts.PropertyAssignment | undefined
  if (!sp) continue
  const slug = (sp.initializer as ts.StringLiteralLike).text
  nodes.set(slug, [...(nodes.get(slug) ?? []), el])
}

function encodeFor(lit: ts.Node, html: string): string {
  const raw = lit.getText(sf)
  const q = raw[0]
  if (q === '`') return html.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
  if (q === '"') return JSON.stringify(html).slice(1, -1)
  if (q === "'") return html.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')
  throw new Error('unknown literal style')
}

type Edit = { start: number; end: number; text: string }
const edits: Edit[] = []
const report: string[] = []

const plans = [...BLOG_PLAN, ...GENERIC_APPENDICES.map(g => g.plan)].filter(p => !batches || batches.includes(p.batch))
for (const plan of plans) {
  const gen = GENERIC_APPENDICES.find(g => g.plan.slug === plan.slug)
  const pl = gen ? gen.build() : payloadFor(plan)
  const targets = nodes.get(plan.slug) ?? []
  if (!targets.length) throw new Error(`slug not in BLOG_POSTS: ${plan.slug}`)
  if (targets.length > 1) report.push(`  ${plan.slug}: DUPLICATE slug, appending to all ${targets.length} entries`)
  for (const obj of targets) {
    const cp = obj.properties.find(p => propName(p) === 'content') as ts.PropertyAssignment
    const lit = cp.initializer
    if (!(ts.isStringLiteral(lit) || ts.isNoSubstitutionTemplateLiteral(lit))) throw new Error(`${plan.slug}: content is not a plain literal`)
    const litStart = lit.getStart(sf), litEnd = lit.getEnd()
    const rawInner = src.slice(litStart + 1, litEnd - 1)
    const encStart = encodeFor(lit, APPENDIX_START)
    const encEndMarker = encodeFor(lit, APPENDIX_END)
    const enc = pl.html ? encodeFor(lit, pl.html) : ''
    const i = rawInner.indexOf(encStart)
    if (i >= 0) {
      const j = rawInner.indexOf(encEndMarker, i)
      // Replace from the newline before the start marker through the newline after the end marker.
      const nlBefore = encodeFor(lit, '\n')
      const from = rawInner.slice(0, i).endsWith(nlBefore) ? i - nlBefore.length : i
      let to = j + encEndMarker.length
      if (rawInner.slice(to).startsWith(nlBefore)) to += nlBefore.length
      edits.push({ start: litStart + 1 + from, end: litStart + 1 + to, text: enc })
    } else if (enc) {
      edits.push({ start: litEnd - 1, end: litEnd - 1, text: enc })
    }

    const fp = obj.properties.find(p => propName(p) === 'faqs') as ts.PropertyAssignment
    const fa = fp.initializer as ts.ArrayLiteralExpression
    const have = new Set(fa.elements.filter(ts.isObjectLiteralExpression).map(e => {
      const qp = (e as ts.ObjectLiteralExpression).properties.find(p => propName(p) === 'q') as ts.PropertyAssignment
      return (qp.initializer as ts.StringLiteralLike).text.trim().toLowerCase()
    }))
    const add = pl.faqs.filter(f => !have.has(f.q.trim().toLowerCase()))
    if (add.length) {
      const closeBracket = fa.getEnd() - 1
      const before = src.slice(fa.getStart(sf) + 1, closeBracket).trimEnd()
      const sep = fa.elements.length && !before.endsWith(',') ? ',' : ''
      edits.push({ start: closeBracket, end: closeBracket, text: sep + add.map(f => JSON.stringify({ q: f.q, a: f.a })).join(',') })
    }
    report.push(`  ${plan.batch} ${plan.slug}: ${pl.sections.map(s => s.key).join(', ') || '(no sections)'}; +${add.length} FAQ`)
  }
}

edits.sort((a, b) => b.start - a.start)
for (let k = 1; k < edits.length; k++) if (edits[k].end > edits[k - 1].start) throw new Error('overlapping edits')
let out = src
for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end)
console.log(`build-ai-citation-appendix: ${edits.length} edits across ${plans.length} posts${dry ? ' (dry run)' : ''}`)
console.log(report.join('\n'))
if (!dry) writeFileSync(SRC_PATH, out)
