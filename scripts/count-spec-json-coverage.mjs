// scripts/count-spec-json-coverage.mjs
// Sprint 3 companion: for every spec URL in valid-urls.json, report whether a
// page-content JSON exists. One-off audit companion to audits/spec-page-
// index-audit-2026-08-05.md.

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = new Set(
  readdirSync(join(ROOT, 'lib', 'data', 'page-content')).map(f => f.replace(/\.json$/, ''))
)
const urls = JSON.parse(readFileSync(join(ROOT, 'lib', 'data', 'valid-urls.json'), 'utf8'))

const specUrls = urls.filter(u => /^\/universities\/[^/]+\/[^/]+\/[^/]+$/.test(u))
let withJson = 0
let noJson = 0
const noJsonByProg = {}
const noJsonSamples = []
for (const url of specUrls) {
  const m = url.match(/^\/universities\/([^/]+)\/([^/]+)\/([^/]+)$/)
  if (!m) continue
  const [, uni, prog, spec] = m
  const key = `${uni}-${prog}-${spec}`
  if (CONTENT.has(key)) {
    withJson++
  } else {
    noJson++
    noJsonByProg[prog] = (noJsonByProg[prog] || 0) + 1
    if (noJsonSamples.length < 10) noJsonSamples.push(url)
  }
}

console.log(`Total spec URLs in valid-urls.json:  ${specUrls.length}`)
console.log(`  with page-content JSON             ${withJson}`)
console.log(`  without page-content JSON          ${noJson}`)
console.log('')
console.log('No-JSON specs by programme:')
for (const [p, n] of Object.entries(noJsonByProg).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${p.padEnd(6)} ${n}`)
}
console.log('')
console.log('First 10 no-JSON spec URLs (for spot-check):')
for (const u of noJsonSamples) console.log('  ' + u)
