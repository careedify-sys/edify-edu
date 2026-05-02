const fs = require('fs')

const manifest = JSON.parse(fs.readFileSync('lib/data/programs-manifest.json', 'utf8'))

// Get DPU MBA rows
const dpuMba = manifest.filter(r => 
  r.university_slug === 'dy-patil-university-online' &&
  r.program === 'mba'
)

console.log(`DPU MBA spec_slugs in manifest (${dpuMba.length} rows):`)
dpuMba.forEach(r => {
  console.log(`  "${r.spec_slug}"`)
})

// Check if these would match a URL like /universities/dy-patil-university-online/mba/sales-and-marketing
console.log(`\nExample URL that won't be found:`)
console.log(`  /universities/dy-patil-university-online/mba/sales-and-marketing`)
console.log(`  Expected slug in manifest: "sales-and-marketing"`)
console.log(`  Actual slug in manifest: "sales-mktg"`)
console.log(`\n  MISMATCH!`)
