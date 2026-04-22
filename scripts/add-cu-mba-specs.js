/**
 * Add 10 new Chandigarh University MBA spec rows to Programs sheet
 * Run: node scripts/add-cu-mba-specs.js
 */
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

const EXCEL_PATH = path.join(__dirname, '../data/EdifyEdu_Unified_Programs_v3.xlsx')

const wb = XLSX.readFile(EXCEL_PATH)
const ws = wb.Sheets['Programs']
const data = XLSX.utils.sheet_to_json(ws, { defval: '' })

console.log(`Current row count: ${data.length}`)

const newRows = [
  { university_slug: 'chandigarh-university-online', program: 'MBA', spec_slug: 'general-management', spec_name: 'General Management' },
  { university_slug: 'chandigarh-university-online', program: 'MBA', spec_slug: 'banking-and-insurance', spec_name: 'Banking and Insurance' },
  { university_slug: 'chandigarh-university-online', program: 'MBA', spec_slug: 'logistics-and-supply-chain-management', spec_name: 'Logistics and Supply Chain Management' },
  { university_slug: 'chandigarh-university-online', program: 'MBA', spec_slug: 'travel-and-tourism-management', spec_name: 'Travel and Tourism Management' },
  { university_slug: 'chandigarh-university-online', program: 'MBA', spec_slug: 'airlines-and-airport-management', spec_name: 'Airlines and Airport Management' },
  { university_slug: 'chandigarh-university-online', program: 'MBA', spec_slug: 'data-science-and-artificial-intelligence', spec_name: 'Data Science and Artificial Intelligence' },
  { university_slug: 'chandigarh-university-online', program: 'MBA', spec_slug: 'entertainment-and-media', spec_name: 'Entertainment and Media' },
  { university_slug: 'chandigarh-university-online', program: 'MBA', spec_slug: 'foreign-exchange-management', spec_name: 'Foreign Exchange Management' },
  { university_slug: 'chandigarh-university-online', program: 'MBA', spec_slug: 'family-business', spec_name: 'Family Business' },
  { university_slug: 'chandigarh-university-online', program: 'MBA', spec_slug: 'product-management', spec_name: 'Product Management' },
]

// Check for duplicates
const added = []
for (const row of newRows) {
  const exists = data.some(
    r => r.university_slug === row.university_slug && r.program === row.program && r.spec_slug === row.spec_slug
  )
  if (exists) {
    console.log(`SKIP (exists): ${row.spec_slug}`)
  } else {
    data.push(row)
    added.push(row.spec_slug)
  }
}

console.log(`Added ${added.length} rows: ${added.join(', ')}`)

const newWs = XLSX.utils.json_to_sheet(data)
wb.Sheets['Programs'] = newWs
XLSX.writeFile(wb, EXCEL_PATH)
console.log(`✅ Saved. Total rows: ${data.length}`)
