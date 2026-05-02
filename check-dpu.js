const XLSX = require('xlsx')
const path = require('path')

const excelPath = path.join(process.cwd(), 'data', 'EdifyEdu_Unified_Programs_v3.xlsx')
const wb = XLSX.readFile(excelPath)
const ws = wb.Sheets['Programs']
const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })

// Check dy-patil-university-online MBA
const dypatilRows = rows.filter(r => 
  r['university_slug'] === 'dy-patil-university-online' &&
  String(r['program'] || '').toLowerCase() === 'mba'
)

console.log(`\nSample spec_slugs from Excel (dy-patil-university-online MBA):`)
dypatilRows.forEach((row, i) => {
  console.log(`  ${row['spec_slug']}`)
})

// Also check data.ts
const fs = require('fs')
const dataFile = fs.readFileSync('lib/data.ts', 'utf8')
const dpuMatch = dataFile.match(/id: 'dy-patil-university-online'[^}]*?specs:\s*\[(.*?)\]/s)
if (dpuMatch) {
  console.log(`\n\nSpecs in lib/data.ts (hardcoded):`)
  const specsStr = dpuMatch[1]
  const specs = specsStr.split(',').map(s => s.trim().replace(/['"]/g, ''))
  specs.forEach(s => console.log(`  ${s}`))
}
