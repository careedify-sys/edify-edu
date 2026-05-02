const fs = require('fs')

console.log('╔════════════════════════════════════════════════════════════════╗')
console.log('║     DPU PUNE MBA SPEC PAGES 404 — COMPREHENSIVE DIAGNOSIS      ║')
console.log('╚════════════════════════════════════════════════════════════════╝\n')

// Load data
const manifest = JSON.parse(fs.readFileSync('lib/data/programs-manifest.json', 'utf8'))
const validUrls = JSON.parse(fs.readFileSync('lib/data/valid-urls.json', 'utf8'))

// Find DPU entries in manifest
const dpuMbaRows = manifest.filter(r => 
  r.university_slug === 'dy-patil-university-online' &&
  r.program === 'mba'
)

// Find DPU URLs in valid-urls
const dpuMbaUrls = validUrls.filter(u =>
  u.includes('dy-patil-university-online') && 
  u.includes('/mba/')
)

console.log('FINDING 1: MANIFEST vs VALID-URLS')
console.log('─' * 65)
console.log(`Manifest has ${dpuMbaRows.length} DPU MBA entries`)
console.log(`Valid-URLs has ${dpuMbaUrls.length} DPU MBA entries`)
console.log()

if (dpuMbaRows.length === dpuMbaUrls.length) {
  console.log('✓ COUNTS MATCH')
} else {
  console.log('✗ MISMATCH IN COUNTS')
}
console.log()

console.log('FINDING 2: SPEC SLUG FORMAT')
console.log('─' * 65)
const slugs = dpuMbaRows.map(r => r.spec_slug).slice(0, 5)
console.log('Sample spec_slugs from manifest:')
slugs.forEach(s => console.log(`  - "${s}"`))
console.log()

const dpuUrlExamples = dpuMbaUrls.slice(0, 5)
console.log('Sample URLs in valid-urls.json:')
dpuUrlExamples.forEach(u => console.log(`  - "${u}"`))
console.log()

console.log('FINDING 3: SPEC_NAME POPULATION')
console.log('─' * 65)
const populatedSpecNames = dpuMbaRows.filter(r => r.spec_name && r.spec_name.trim() !== '').length
console.log(`Rows with spec_name: ${populatedSpecNames}/${dpuMbaRows.length}`)
if (populatedSpecNames === 0) {
  console.log('✗ CRITICAL: ALL spec_name fields are EMPTY')
  console.log('  This means the Excel file lacks data')
  console.log('  The page.tsx fallback will convert "sales-mktg" → "Sales Mktg"')
}
console.log()

console.log('FINDING 4: BUILD-VALID-URLS SCRIPT LOGIC')
console.log('─' * 65)
console.log('The script:')
console.log('  1. Reads Excel column: "spec_name" (if exists)')
console.log('  2. Stores empty strings when cell is blank')
console.log('  3. Writes to programs-manifest.json')
console.log('  4. Also writes URLs to valid-urls.json')
console.log()
console.log('Result: URL generation works even with empty spec_name')
console.log('        because script uses spec_slug for URL generation')
console.log()

console.log('FINDING 5: THE ACTUAL PROBLEM')
console.log('─' * 65)
console.log('Current state:')
console.log('  - Local: manifest has 11 DPU MBA entries')
console.log('  - Local: valid-urls has 11 DPU MBA URLs')
console.log('  - Page has dynamicParams=true (handles unlisted params)')
console.log()
console.log('Possible failure scenarios on Vercel:')
console.log()
console.log('[Scenario A] Excel file differs on Vercel')
console.log('  - If Vercel Excel is missing DPU rows')
console.log('  - manifest regenerates with 0 DPU MBA entries')
console.log('  - valid-urls has 0 DPU MBA URLs')
console.log('  - dynamicParams=true means page IS called for ANY slug')
console.log('  - BUT getUniversityById() succeeds AND getSpecDisplayName() succeeds')
console.log('  - Page should still render (not 404)')
console.log()
console.log('[Scenario B] Redirect rule filters the requests')
console.log('  - Check next.config.js redirects')
console.log('  - No obvious DPU-specific redirects found')
console.log()
console.log('[Scenario C] The real issue')
console.log('  - Next.js might be caching the build output')
console.log('  - Pre-rendered routes might not include DPU URLs')
console.log('  - dynamicParams=true only helps IF the data lookups work')
console.log('  - If getSpecDisplayName() is failing due to missing data')
console.log('  - Then page returns notFound() → 404')
console.log()

console.log('FINDING 6: WHAT TO CHECK ON VERCEL')
console.log('─' * 65)
console.log('1. Does the prebuild step run? Check Vercel build logs for:')
console.log('   "Wrote: lib/data/programs-manifest.json"')
console.log()
console.log('2. How many DPU MBA rows are in the manifest after build?')
console.log('   Look at generated files in Vercel build output')
console.log()
console.log('3. Try accessing the page directly:')
console.log('   GET /universities/dy-patil-university-online/mba/sales-mktg')
console.log('   (Should work if dynamicParams=true and data lookups succeed)')
console.log()
console.log('4. Check if Excel file is included in deployment')
console.log('   File: data/EdifyEdu_Unified_Programs_v3.xlsx')
console.log()

console.log('\nFINDING 7: CRITICAL QUESTION')
console.log('─' * 65)
console.log('The user said: "manifest and data.ts are correct locally"')
console.log()
console.log('This means locally everything works. So the issue is:')
console.log('  ➜ Vercel environment is DIFFERENT from local')
console.log()
console.log('Most likely causes:')
console.log('  1. Excel file not deployed (missing data/EdifyEdu_Unified_Programs_v3.xlsx)')
console.log('  2. Excel file exists but has different content on server')
console.log('  3. prebuild script not running on Vercel')
console.log('  4. Environment variables affecting data loading')
