// scripts/check-fee-wording.mts
//
// WARNS (never fails) when fee copy says a fee is "indicative", sends the
// reader to an "official portal", or names a university's own domain.
//
// Why. Round 1 of the AI-visibility fixes (2026-11-13) replaced that wording
// on the NMIMS, Amity, Symbiosis, Manipal and Bharati Vidyapeeth pages with
// one dated "Fees checked on {date}" line and "Talk to our counsellor for
// your intake's fee." An AI answer that reads "indicative, confirm on the
// portal" learns that our number is not the number. The rest of the site still
// carries the old wording, so this gate warns instead of failing: it lists
// what is left without blocking unrelated commits.
//
// Scope: a sentence is fee copy when it contains a rupee figure or the word
// "fee". Sources: lib/blog.ts post bodies and FAQs, lib/data/page-content/*.json,
// lib/mba-seo-overrides.ts and lib/coupon-pages.ts.
//
// Run: npx tsx scripts/check-fee-wording.mts [--verbose]
// Wired into: .husky/pre-commit (warn-only; always exits 0)

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { UNIVERSITIES } from '../lib/data'
import { getPublishedPosts } from '../lib/blog'

const verbose = process.argv.includes('--verbose')

// University domains: every officialUrl host in lib/data.ts plus the shared
// portals a few universities enrol through.
const hosts = new Set<string>(['onlinemanipal.com', 'amityonline.com', 'online.amity.edu', 'nmims.edu', 'ssodl.edu.in', 'smude.edu.in', 'bharatividyapeethonline.com', 'symbiosisonline.org'])
for (const u of UNIVERSITIES) {
  const raw = (u as { officialUrl?: string }).officialUrl
  if (!raw) continue
  try { hosts.add(new URL(raw.startsWith('http') ? raw : `https://${raw}`).hostname.replace(/^www\./, '')) } catch { /* ignore bad url */ }
}
const ALLOWED = new Set(['edifyedu.in', 'deb.ugc.ac.in', 'naac.gov.in', 'nirfindia.org', 'ugc.gov.in'])
for (const h of ALLOWED) hosts.delete(h)

const FEE = /₹\s?\d|\bRs\.?\s?\d|\bfees?\b/i
const WORDING = /\bindicative\b|official (?:\w+ )?portal/i
const hostList = Array.from(hosts)

type Hit = { where: string; reason: string; text: string }
const hits: Hit[] = []

function scan(where: string, text: string) {
  const plain = text.replace(/<[^>]+>/g, ' ')
  for (const sentence of plain.split(/(?<=[.!?])\s+/)) {
    if (!FEE.test(sentence)) continue
    const w = sentence.match(WORDING)
    const d = hostList.find(h => sentence.toLowerCase().includes(h))
    if (w || d) hits.push({ where, reason: w ? `"${w[0]}"` : `domain ${d}`, text: sentence.trim().slice(0, 160) })
  }
}

for (const p of getPublishedPosts()) {
  scan(`blog/${p.slug}`, p.content || '')
  for (const f of p.faqs ?? []) scan(`blog/${p.slug} (faq)`, `${f.q} ${f.a}`)
}

const dir = join('lib', 'data', 'page-content')
for (const f of readdirSync(dir).filter(n => n.endsWith('.json'))) {
  const walk = (o: unknown): void => {
    if (typeof o === 'string') scan(`page-content/${f}`, o)
    else if (o && typeof o === 'object') for (const v of Object.values(o)) walk(v)
  }
  walk(JSON.parse(readFileSync(join(dir, f), 'utf8')))
}

for (const f of ['lib/mba-seo-overrides.ts', 'lib/coupon-pages.ts']) scan(f, readFileSync(f, 'utf8'))

const byWhere = new Map<string, number>()
for (const h of hits) byWhere.set(h.where.replace(/ \(faq\)$/, ''), (byWhere.get(h.where.replace(/ \(faq\)$/, '')) ?? 0) + 1)

if (hits.length === 0) {
  console.log('check-fee-wording: OK, no "indicative", "official portal" or university domain in fee copy.')
} else {
  console.log(`check-fee-wording: WARN ${hits.length} fee sentence(s) on ${byWhere.size} page source(s) say "indicative", point to an official portal, or name a university domain.`)
  console.log('  Replace with the dated fee line and "Talk to our counsellor for your intake’s fee." (warn-only, not blocking)')
  const shown = verbose ? hits : hits.slice(0, 8)
  for (const h of shown) console.log(`  - ${h.where}: ${h.reason}: ${h.text}`)
  if (!verbose && hits.length > shown.length) console.log(`  ... ${hits.length - shown.length} more (run with --verbose)`)
}
process.exit(0)
