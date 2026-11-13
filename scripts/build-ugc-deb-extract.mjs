// scripts/build-ugc-deb-extract.mjs
//
// Pulls the UGC-DEB online programme rows, NAAC and NIRF columns for the
// universities that have a first-hand file (lib/data/first-hand/) out of
// UGC_DEB_Online_Programmes_AY2025-26.xlsx, sheet Master_Online, into
// lib/data/ugc-deb-extract.json. The pages cannot read the workbook at
// runtime, and typing these rows by hand is how wrong ones ship.
//
// Run: node scripts/build-ugc-deb-extract.mjs        (writes)
//      node scripts/build-ugc-deb-extract.mjs --check (fails if the file is stale)
//
// Add a university: one line in SOURCES with the exact University Name (and
// State where the name alone is ambiguous) as the workbook spells it.
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const XLSX = require('xlsx')
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const BOOK = join(root, 'UGC_DEB_Online_Programmes_AY2025-26.xlsx')
const OUT = join(root, 'lib', 'data', 'ugc-deb-extract.json')

const SOURCES = {
  // "Amity University" in Uttar Pradesh is Amity University Uttar Pradesh,
  // Noida. Amity University Rajasthan is a separate university.
  'amity-university-online': { name: 'Amity University', state: 'Uttar Pradesh' },
  'nmims-online': { name: 'Narsee Monjee Institute of Management Studies (NMIMS)' },
}

const wb = XLSX.read(readFileSync(BOOK), { type: 'buffer', cellDates: false })
const rows = XLSX.utils.sheet_to_json(wb.Sheets.Master_Online, { defval: null })

const num = v => (typeof v === 'number' ? v : v == null || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : null)
// Dates stay Excel serials (cellDates: false); converting through a JS Date
// shifted 28 June 2025 to 27 June in IST.
const pad = n => String(n).padStart(2, '0')
const iso = v => {
  if (typeof v !== 'number') return v ? String(v) : null
  const d = XLSX.SSF.parse_date_code(v)
  return `${d.y}-${pad(d.m)}-${pad(d.d)}`
}

const out = {}
for (const [id, src] of Object.entries(SOURCES)) {
  const mine = rows.filter(r => r['University Name'] === src.name && (!src.state || r.State === src.state))
  if (!mine.length) throw new Error(`${id}: no Master_Online rows for "${src.name}"`)
  const first = mine[0]
  out[id] = {
    universityName: src.name,
    state: first.State,
    programmes: mine.map(r => ({
      name: r['Programme Name'],
      category: r['Programme Category'],
      notice: r['UGC Notice'],
      period: r['Recognition Period'],
    })),
    naac: first['NAAC Grade'] ? { grade: first['NAAC Grade'], cgpa: num(first['NAAC CGPA']), declaredOn: iso(first['NAAC Declared On']) } : null,
    nirf: { overall: num(first['NIRF: Overall']), university: num(first['NIRF: University']), management: num(first['NIRF: Management']) },
  }
}

const text = JSON.stringify(out, null, 2) + '\n'
if (process.argv.includes('--check')) {
  // Compare without line endings: a CRLF checkout of the same JSON is not stale.
  if (!existsSync(OUT) || readFileSync(OUT, 'utf8').split('\r\n').join('\n') !== text) {
    console.error('ugc-deb-extract: lib/data/ugc-deb-extract.json is stale. Run node scripts/build-ugc-deb-extract.mjs')
    process.exit(1)
  }
  console.log(`ugc-deb-extract: OK (${Object.keys(out).length} universities)`)
} else {
  writeFileSync(OUT, text)
  for (const [id, v] of Object.entries(out)) console.log(id, v.programmes.length, 'programmes', JSON.stringify(v.nirf), JSON.stringify(v.naac))
}
