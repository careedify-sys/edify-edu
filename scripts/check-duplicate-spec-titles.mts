// scripts/check-duplicate-spec-titles.mts
// Blocks any commit where two specialisation pages at the same university and
// programme would render the same <title>.
//
// Found 2026-08-30 by crawling the sitemap: 7 groups covering 15 pages shared a
// title. shortenSpec truncated to 22 characters with a hard substring cut, so
// "Finance and International Business" and "Finance and Operations Management"
// both became "Finance and". Duplicate titles across near-identical pages are
// what Google treats as a duplicate-content signal, and the truncated ones read
// badly in a SERP.
//
// The check runs on shortenSpec rather than on rendered HTML so it needs no
// server, and shortenSpec is the only part of the title that varies within a
// (university, programme) group.
//
// Run: npx tsx scripts/check-duplicate-spec-titles.mts

import { readFileSync } from 'fs'
import { UNIVERSITIES, getUniversityById } from '../lib/data'
import { resolveSpec } from '../lib/data/programs'
import { getTitleName, getShortTitleName, shortenSpec, clampTitleSpecLed, compactFee } from '../lib/seo-title'
import { naacSegment } from '../lib/seo/display-guards'

const PROG: Record<string, string> = {
  mba: 'MBA', mca: 'MCA', bba: 'BBA', bca: 'BCA',
  bcom: 'B.Com', mcom: 'M.Com', ba: 'BA', ma: 'MA', msc: 'MSc', bsc: 'BSc',
}

// Every duplicate found on 2026-08-30 is now handled as a rule in
// lib/data/spec-slug-rescue-rules.json, so the duplicate slug 308s onto the one
// the university actually uses and only one of the pair is a live page. This
// set stays empty on purpose: a genuine same-specialisation-twice pair belongs
// in the rules file, not in an exemption list.
const KNOWN_DATA_DUPLICATES = new Set<string>()

// Universe is lib/data/spec-allowlist.json, not lib/data.ts programDetails.
// A university's specialisations come from the Excel manifest as well as
// data.ts, so iterating programDetails alone missed Amity's BCA data-science
// page entirely and the gate reported clean while the collision was live.
// Only slugs that canonicalise to themselves are real pages; the rest are
// aliases that 308 away.
const specAllowlist = JSON.parse(
  readFileSync('lib/data/spec-allowlist.json', 'utf8')
) as { s: string[]; m: Record<string, number[]>; r: Record<string, number[]> }

const year = new Date().getFullYear()
const collisions: string[] = []
let groups = 0
let pages = 0

for (const u of UNIVERSITIES) {
  for (const [progSlug, label] of Object.entries(PROG)) {
    const idxs = specAllowlist.m[`${u.id}|${progSlug}`]
    if (!idxs?.length) continue
    const pd = (u.programDetails as Record<string, { fees?: string } | undefined>)[label]
    groups++

    // A slug middleware 308s away is not a live page and cannot collide.
    const redirected = new Set<string>()
    const pairs = specAllowlist.r[`${u.id}|${progSlug}`]
    if (pairs) for (let i = 0; i < pairs.length; i += 2) redirected.add(specAllowlist.s[pairs[i]])

    const byTitle = new Map<string, Set<string>>()
    for (const i of idxs) {
      const slug = specAllowlist.s[i]
      if (redirected.has(slug)) continue
      const r = resolveSpec(u.id, label, progSlug, slug)
      if (!r || r.slug !== slug) continue
      pages++
      // Compare the title the route actually renders, not just shortenSpec.
      // Checking the short label alone missed the three Kurukshetra M.Com
      // pages: their labels were distinct but a long university name pushed the
      // distinguishing word past the 60 character clamp, so all three shipped
      // the same title.
      const shortSpec = shortenSpec(r.name)
      const fee = compactFee(pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`)
      const tail = `${label} ${shortSpec} ${year}: ${fee}${naacSegment(u.naac)} | EdifyEdu`
      const title = clampTitleSpecLed(
        `${getTitleName(u.id, u.name, u.abbr)} ${tail}`,
        `${getShortTitleName(u.id, u.shortName, u.name, u.abbr)} ${tail}`,
        shortSpec,
      )
      if (!byTitle.has(title)) byTitle.set(title, new Set())
      byTitle.get(title)!.add(slug)
    }

    for (const [short, slugs] of byTitle) {
      if (slugs.size < 2) continue
      if (KNOWN_DATA_DUPLICATES.has(`${u.id}|${progSlug}|${short}`)) continue
      collisions.push(`${u.id} ${progSlug}: "${short}" <- ${[...slugs].sort().join(', ')}`)
    }
  }
}

if (collisions.length === 0) {
  console.log(`OK. ${pages} specialisation pages across ${groups} (university, programme) groups, no duplicate titles.`)
  console.log(`    ${KNOWN_DATA_DUPLICATES.size} known data duplicates skipped, see KNOWN_DATA_DUPLICATES.`)
  process.exit(0)
}

console.error(`FAIL: ${collisions.length} specialisation title collision(s).`)
console.error('      Two pages at the same university and programme would share a <title>.')
for (const c of collisions.slice(0, 25)) console.error(`    ${c}`)
if (collisions.length > 25) console.error(`    ...and ${collisions.length - 25} more`)
console.error('')
console.error('Fix: make shortenSpec in lib/seo-title.ts keep whatever distinguishes them,')
console.error('     or, if they are the same specialisation entered twice, remove the')
console.error('     duplicate from lib/data.ts and add it to KNOWN_DATA_DUPLICATES.')
process.exit(1)
