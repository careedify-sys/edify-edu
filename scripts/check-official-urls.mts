// scripts/check-official-urls.mts
//
// officialUrl must be a university's OWN portal, and feeVerifiedOn must point
// at one.
//
// Why. Before 2026-10-06 nothing recorded where a fee came from, so every
// re-check restarted the domain hunt, and the hunt is the dangerous part.
// galgotiasuniversityonline.com ranks, reads as official, and sends every
// programme link to collegebandhu.com, a lead-generation site. A fee taken from
// there is a commission-driven number on a site whose whole proposition is that
// it takes no commission. This gate makes that specific mistake fail the commit.
//
// Run: npx tsx scripts/check-official-urls.mts

import { UNIVERSITIES } from '../lib/data'

type Uni = { id: string; name: string; officialUrl?: string; feeVerifiedOn?: string }
const unis = UNIVERSITIES as unknown as Uni[]

// The comparison sites CLAUDE.md forbids linking or citing, plus the lead-gen
// aggregators met while verifying. None of these is ever a university's portal.
const FORBIDDEN = [
  'collegevidya', 'shiksha', 'careers360', 'jaroeducation', 'jaro.in', 'padhaao',
  'admissiondiy', 'samarthedu', 'kollegeapply', 'pwmedharthi',
  'distanceeducationschool', 'distanceeducation360', 'mbadistanceeducation',
  'onlineuniversities', 'collegedekho', 'collegebandhu', 'collegedunia',
  'getmyuni', 'shikshahub', 'universitykart',
  // Lookalikes: a domain built from a university's name that is not the
  // university. galgotiasuniversityonline.com reads as official and routes
  // every programme link to collegebandhu.com. The first version of this gate
  // listed only collegebandhu and so passed this URL, which is the one mistake
  // it existed to stop.
  'galgotiasuniversityonline',
]

// A blocklist stops the lookalikes already met. It cannot recognise the next
// one, because a lookalike is built from the university's own name and a name
// heuristic would clear it while flagging honest abbreviations like onlineuu.in
// for Uttaranchal. The real defence stays human and is written on the field in
// lib/data.ts: populate officialUrl only after reading that portal's own fee
// page, or after the university's main domain links to it.

const errors: string[] = []
let withUrl = 0
let withDate = 0

const today = new Date().toISOString().slice(0, 10)

for (const u of unis) {
  const url = u.officialUrl
  const when = u.feeVerifiedOn

  if (url !== undefined) {
    withUrl++
    if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(url)) {
      errors.push(`${u.id}: officialUrl is not an https URL: ${url}`)
    }
    const host = url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase()
    const hit = FORBIDDEN.find(f => host.includes(f))
    if (hit) {
      errors.push(
        `${u.id}: officialUrl points at "${hit}", which is a comparison site or lead-generation aggregator, not a university portal: ${url}`,
      )
    }
    if (url.endsWith('/')) errors.push(`${u.id}: officialUrl has a trailing slash, drop it: ${url}`)
  }

  if (when !== undefined) {
    withDate++
    if (!/^\d{4}-\d{2}-\d{2}$/.test(when)) {
      errors.push(`${u.id}: feeVerifiedOn is not YYYY-MM-DD: ${when}`)
    } else if (when > today) {
      errors.push(`${u.id}: feeVerifiedOn is in the future: ${when}`)
    }
    if (!url) {
      errors.push(
        `${u.id}: feeVerifiedOn is set with no officialUrl. A verification date with no source is not a claim anyone can re-check.`,
      )
    }
  }
}

// A gate that can pass by finding nothing is not a gate.
if (unis.length === 0) {
  console.error('check-official-urls: read 0 universities from lib/data.ts. Refusing to pass.')
  process.exit(1)
}

if (errors.length) {
  console.error('check-official-urls: FAILED')
  for (const e of errors) console.error('  ' + e)
  process.exit(1)
}

console.log(
  `check-official-urls: OK (${unis.length} universities, ${withUrl} with a confirmed portal, ` +
  `${withDate} with a fee verified against it).`,
)
