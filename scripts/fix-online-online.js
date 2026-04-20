/**
 * scripts/fix-online-online.js
 * Removes "Online Online" duplication from page-content JSON files.
 * Run: node scripts/fix-online-online.js [--apply]
 * Without --apply: dry-run (preview only).
 * With --apply: write changes to disk.
 */

const fs = require('fs')
const path = require('path')

const CONTENT_DIR = path.join(__dirname, '..', 'lib', 'data', 'page-content')
const DRY_RUN = !process.argv.includes('--apply')

// Fields to clean (dot-notation paths within sections object)
const FIELDS_TO_CHECK = [
  'tldr',
  'hero.body',
  'hero.headline',
  'hero.sub',
  'about.body',
]

function getField(obj, dotPath) {
  return dotPath.split('.').reduce((acc, key) => acc?.[key], obj)
}

function setField(obj, dotPath, value) {
  const keys = dotPath.split('.')
  let cur = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) return
    cur = cur[keys[i]]
  }
  cur[keys[keys.length - 1]] = value
}

function cleanText(text) {
  if (typeof text !== 'string') return { cleaned: text, count: 0 }
  let result = text
  let count = 0

  // Primary: "Online Online MBA/MCA/BBA/BCA/PGDM" → "Online MBA/..."
  result = result.replace(
    /([A-Za-z\s,().]+?)\s+Online\s+Online\s+(MBA|MCA|BBA|BCA|PGDM)/gi,
    (match, prefix, degree) => {
      count++
      return `${prefix} Online ${degree}`
    }
  )

  // Safety net: any remaining "Online Online" anywhere
  const before = result
  result = result.replace(/\bOnline\s+Online\b/g, 'Online')
  if (result !== before) {
    count += (before.match(/\bOnline\s+Online\b/g) || []).length
  }

  return { cleaned: result, count }
}

const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'))

let totalFiles = 0
let modifiedFiles = 0
let totalReplacements = 0

console.log(`Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'APPLY'}`)
console.log(`Scanning ${files.length} files in ${CONTENT_DIR}\n`)

for (const file of files) {
  const filePath = path.join(CONTENT_DIR, file)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const json = JSON.parse(raw)

  totalFiles++
  let fileReplacements = 0
  const changes = []

  // tldr is top-level in sections
  const sections = json.sections || {}

  for (const field of FIELDS_TO_CHECK) {
    // tldr is directly on sections; hero.body is sections.hero.body etc.
    const topLevel = field === 'tldr'
    const target = topLevel ? sections : sections
    const current = topLevel ? sections.tldr : getField(sections, field)

    if (typeof current !== 'string') continue

    const { cleaned, count } = cleanText(current)
    if (count > 0) {
      changes.push({ field, from: current.substring(0, 120), to: cleaned.substring(0, 120), count })
      fileReplacements += count
      if (!DRY_RUN) {
        if (topLevel) {
          sections.tldr = cleaned
        } else {
          setField(sections, field, cleaned)
        }
      }
    }
  }

  if (fileReplacements > 0) {
    modifiedFiles++
    totalReplacements += fileReplacements
    console.log(`[MODIFIED] ${file} — ${fileReplacements} replacement(s)`)
    for (const c of changes) {
      console.log(`  Field: ${c.field}`)
      console.log(`  Before: "${c.from}..."`)
      console.log(`  After:  "${c.to}..."`)
    }
    console.log()

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8')
    }
  } else {
    console.log(`[CLEAN]    ${file}`)
  }
}

console.log('\n─────────────────────────────────────────────')
console.log(`Files scanned:    ${totalFiles}`)
console.log(`Files modified:   ${modifiedFiles}`)
console.log(`Total replacements: ${totalReplacements}`)
if (DRY_RUN) {
  console.log('\nDry run complete. Run with --apply to write changes.')
}
