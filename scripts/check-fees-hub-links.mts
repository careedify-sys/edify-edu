// scripts/check-fees-hub-links.mts
//
// /fees renders one row per entry in data/fees-hub-data.json and links each row
// to /universities/{id}. Nothing verified that the id resolves, so a row whose
// id has no university page shipped four dead links per row (two desktop, two
// mobile) on the page that ranks for fee queries.
//
// That is how BIT Mesra's numbers came to sit under the id "bits-pilani-online"
// (corrected to "bit-mesra-online" on 2026-09-14). The id was not in
// lib/data.ts or valid-urls.json, so /universities/bits-pilani-online 404'd
// while /fees kept pointing at it. It went unnoticed because /fees renders
// whatever the JSON says.
//
// The rule: every fees-hub row either resolves to a real university page, or
// declares "noPage": true and is rendered unlinked by FeesTableClient. A row
// that does neither fails this check.
//
// Adding "noPage": true is the stopgap, not the fix. It is right when we hold
// verified fee data for a university we do not publish a page for. The real fix
// is to add the university to lib/data.ts with verified data, then drop the
// flag. Do not add the flag just to silence this check on a row that should
// have a page.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type FeesRow = { id: string; name: string; noPage?: boolean }

const ROOT = process.cwd()

const rows: FeesRow[] = JSON.parse(
  readFileSync(join(ROOT, 'data', 'fees-hub-data.json'), 'utf8'),
)

const validUrlsRaw: unknown = JSON.parse(
  readFileSync(join(ROOT, 'lib', 'data', 'valid-urls.json'), 'utf8'),
)
const validUrls: string[] = Array.isArray(validUrlsRaw)
  ? (validUrlsRaw as string[])
  : Object.keys(validUrlsRaw as Record<string, unknown>)

const known = new Set(validUrls.map(String))

const dead: FeesRow[] = []
const flagged: FeesRow[] = []

for (const r of rows) {
  const hasPage = known.has(`/universities/${r.id}`)
  if (r.noPage) {
    flagged.push(r)
    // A row marked noPage that DOES have a page is stale: drop the flag.
    if (hasPage) {
      console.error(
        `check-fees-hub-links: "${r.id}" is marked noPage but /universities/${r.id} exists. Remove the flag.`,
      )
      process.exit(1)
    }
    continue
  }
  if (!hasPage) dead.push(r)
}

if (dead.length > 0) {
  console.error(
    `check-fees-hub-links: FAIL. ${dead.length} fees-hub row(s) link to a university page that does not exist:\n`,
  )
  for (const r of dead) {
    console.error(`  ${r.id}  ->  /universities/${r.id}  (${r.name})`)
  }
  console.error(
    `\nEither add the university to lib/data.ts with verified data and regenerate` +
      `\nvalid-urls.json, or add "noPage": true to the row so /fees renders it` +
      `\nunlinked. See the header of this script before reaching for the flag.`,
  )
  process.exit(1)
}

const note = flagged.length > 0 ? `, ${flagged.length} intentionally page-less (${flagged.map(r => r.id).join(', ')})` : ''
console.log(`check-fees-hub-links: OK (${rows.length} fees-hub rows, all links resolve${note}).`)
