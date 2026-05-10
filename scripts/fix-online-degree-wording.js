// scripts/fix-online-degree-wording.js
//
// User direction (2026-05-11): "ONLINE IS MENTIONED IN ONLINE DEGREE".
// Per UGC (Online Programmes) Regulations 2018, the degree certificate
// clearly identifies the programme as Online mode. Any content claiming
// the certificate does NOT mention online/distance is factually wrong.
//
// This script sweeps lib/blog.ts, lib/content.ts, lib/guides.ts, and all
// lib/data/page-content/*.json for the wrong-wording patterns and replaces
// them with the correct UGC-2018-compliant phrasing.
//
// Run: node scripts/fix-online-degree-wording.js

const fs = require('fs')
const path = require('path')
const ROOT = path.join(__dirname, '..')

const SOURCES = []
function addFile(p) { if (fs.existsSync(p)) SOURCES.push(p) }
addFile(path.join(ROOT, 'lib', 'blog.ts'))
addFile(path.join(ROOT, 'lib', 'content.ts'))
addFile(path.join(ROOT, 'lib', 'guides.ts'))
addFile(path.join(ROOT, 'lib', 'coupon-pages.ts'))
const jsonDir = path.join(ROOT, 'lib', 'data', 'page-content')
if (fs.existsSync(jsonDir)) {
  fs.readdirSync(jsonDir).filter(f => f.endsWith('.json')).forEach(f => addFile(path.join(jsonDir, f)))
}

// Replacement patterns — order matters, longer/specific first
const REPLACEMENTS = [
  // Variant 1: does not contain online or distance wording
  [/does not contain ['"]?[oO]nline['"]? or ['"]?[dD]istance['"]? (?:wording|anywhere|mode|on)/g,
   'clearly identifies the programme as Online mode (per UGC Online Programmes Regulations 2018)'],

  // Variant 2: does not say online or distance
  [/does(?:n['']t| not) say ['"]?[oO]nline['"]?(?: or ['"]?[dD]istance['"]?)?/g,
   'clearly identifies the programme as Online mode (per UGC 2018 Regulations)'],

  // Variant 3: does not mention online or distance (mode)
  [/does(?:n['']t| not) mention ['"]?[oO]nline['"]?(?: or ['"]?[dD]istance['"]?)?(?: mode)?/g,
   'clearly identifies the programme as Online mode (per UGC 2018 Regulations)'],

  // Variant 4: the certificate carries no mention of online or distance
  [/carries no mention of ['"]?[oO]nline['"]?(?: or ['"]?[dD]istance['"]?)?(?: mode)?/g,
   'clearly identifies the programme as Online mode (per UGC 2018 Regulations)'],

  // Variant 5: certificate itself does not [carry/contain] online/distance wording
  [/(?:certificate itself )?does not carry [dD]istance or [oO]nline wording/g,
   'clearly identifies the programme as Online mode per UGC 2018 Regulations'],

  // Variant 6: no "online" or "distance" mentioned (parenthetical)
  [/\(\s*no ['"]?[oO]nline['"]? or ['"]?[dD]istance['"]? mentioned\s*\)/g,
   '(clearly identified as Online mode per UGC 2018 Regulations)'],

  // Variant 7: degree certificate is identical to on-campus
  // Keep "identical legal validity" claim but soften "identical certificate"
  // wording to remove the implicit no-online-mention claim
  [/degree certificate is identical to (?:an? )?on-campus (?:MBA|BBA|degree)(?: from the same university)?[;,:]?\s*it does not say ['"]?[oO]nline['"]? or ['"]?[dD]istance['"]?(?: on it)?/g,
   'degree certificate is legally equivalent to an on-campus version. Per UGC 2018 Regulations the certificate clearly identifies the programme as Online mode, but legal validity is identical to the on-campus degree from the same university'],

  // Variant 8: existing Indian-author phrasings
  [/the degree certificate (?:from .{0,50}|of .{0,50})?does not mention (?:the )?mode of (?:study|delivery)/g,
   'per UGC 2018 Regulations, the degree certificate clearly identifies the programme as Online mode (legal validity remains identical to on-campus)'],

  // Variant 9: ' without "Online" or "Distance" designation' (when the implication is "Online" is not on certificate)
  [/(?:certificate (?:will )?include|will include) ['"]?[oO]nline['"]? or ['"]?[dD]istance['"]? designation\.\s*Most premium universities[^.]+issue identical certificates/g,
   'certificate will include the Online mode designation per UGC 2018 Regulations. Premium universities (NMIMS, Amity, Symbiosis, BITS, Chandigarh) follow this rule consistently — Online is clearly stated, not hidden'],
]

// Scan + apply
let totalChanges = 0
const reportByFile = []

for (const file of SOURCES) {
  let content = fs.readFileSync(file, 'utf8')
  const original = content
  let perFileChanges = 0
  const matches = []
  for (const [re, replacement] of REPLACEMENTS) {
    const before = content
    const found = (content.match(re) || []).length
    content = content.replace(re, replacement)
    if (found > 0) {
      perFileChanges += found
      matches.push(`${re.source.slice(0, 50)}... (${found}×)`)
    }
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8')
    totalChanges += perFileChanges
    reportByFile.push({ file: path.relative(ROOT, file), count: perFileChanges, matches })
  }
}

console.log('=== Online-degree wording sweep ===\n')
if (reportByFile.length === 0) {
  console.log('  (no remaining wrong-wording patterns found — all clean)')
} else {
  for (const r of reportByFile) {
    console.log(`  ✓ ${r.file}  (${r.count} fixes)`)
  }
}
console.log(`\nTotal replacements: ${totalChanges} across ${reportByFile.length} files`)
