// scripts/build-programme-allowlist.js
// Emits the edge-runtime allowlist that middleware.ts uses to 404 unknown
// programme hub paths BEFORE Next's ISR pin can seal a 200 on the not-found
// shell. Task 3 slice 1 scope: MA only.
//
// Source of truth: lib/data.ts UNIVERSITIES. Definition of "in allowlist" =
// exactly the same predicate the resolver uses for `kind: 'resolved'`:
//   university has {program} in u.programs AND u.programDetails[program]
//     is present.
//
// A pre-commit gate (scripts/check-programme-allowlist-resolver.ts) verifies
// this file agrees with lib/seo/resolve-programme.ts on every (uni, MA) combo
// so the middleware cannot drift into a second independent invariant.
//
// Plain CommonJS text-parse pattern (matches prune-noindex-hub-urls.js) so the
// Vercel Node-24 prebuild does not hit the same tsx-hook loader race that
// broke feat/thin-page-gating's initial version.

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DATA_TS = path.join(ROOT, 'lib', 'data.ts')
const OUT = path.join(ROOT, 'lib', 'data', 'programme-allowlist-ma.json')

// Scope for this slice. Add more programme labels here (and update middleware
// + resolver-check + hub route wiring) when extending Task 3 to other routes.
// Slice 1 (2026-08-18): 'MA'.
// Slice 2 (2026-08-18): + 'B.Com', 'M.Com'.
// Slice 3 (2026-08-18): + 'MBA' (specialised route).
const SCOPE_PROGRAMS = ['MA', 'B.Com', 'M.Com', 'MBA']

const src = fs.readFileSync(DATA_TS, 'utf8')
// Truncate at end of UNIVERSITIES export so trailing PROGRAM_META (same 'MBA'
// key shape) does not spill into the parser and overwrite programDetails.
const universitiesEnd = src.indexOf('\nexport ', src.indexOf('export const UNIVERSITIES'))
const universitiesSrc = universitiesEnd > 0 ? src.slice(0, universitiesEnd) : src

const idRe = /^\s+id:\s+'([a-z0-9-]+)',\s*$/gm
const idHits = []
let m
while ((m = idRe.exec(universitiesSrc))) idHits.push({ id: m[1], idx: m.index })

const perProgramme = new Map()
for (const p of SCOPE_PROGRAMS) perProgramme.set(p, [])

for (let i = 0; i < idHits.length; i++) {
  const start = idHits[i].idx
  const end = i < idHits.length - 1 ? idHits[i + 1].idx : universitiesSrc.length
  const body = universitiesSrc.slice(start, end)
  const id = idHits[i].id

  // programs: ['MBA', 'BBA', ...]
  const progsMatch = body.match(/programs:\s*\[([^\]]*)\]/)
  const programs = progsMatch
    ? [...progsMatch[1].matchAll(/'([^']+)'/g)].map(x => x[1])
    : []

  // programDetails: parse each 'PROGRAM': { ... } block
  const pdKeys = new Set()
  const pdRe = /'(MBA|MCA|BBA|BCA|B\.Com|MSc|BSc|MA|BA|M\.Com)':\s*\{/g
  let pm
  while ((pm = pdRe.exec(body))) pdKeys.add(pm[1])

  for (const prog of SCOPE_PROGRAMS) {
    if (programs.includes(prog) && pdKeys.has(prog)) {
      perProgramme.get(prog).push(id)
    }
  }
}

// One JSON per programme so extending scope doesn't churn a single monster
// file. Middleware currently imports only the MA file.
for (const [prog, ids] of perProgramme.entries()) {
  ids.sort()
  const outPath = prog === 'MA'
    ? OUT
    : path.join(ROOT, 'lib', 'data', `programme-allowlist-${prog.toLowerCase().replace(/\./g, '')}.json`)
  fs.writeFileSync(outPath, JSON.stringify(ids, null, 2) + '\n', 'utf8')
  console.log(`Wrote ${path.relative(ROOT, outPath)}: ${ids.length} universities with a valid ${prog} hub`)
}
