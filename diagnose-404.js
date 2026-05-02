const fs = require('fs')

console.log('=== DPU PUNE MBA SPEC PAGES 404 DIAGNOSIS ===\n')

// 1. Check manifest
const manifest = JSON.parse(fs.readFileSync('lib/data/programs-manifest.json', 'utf8'))
const dpuMbaRows = manifest.filter(r => 
  r.university_slug === 'dy-patil-university-online' &&
  r.program === 'mba'
)

console.log('1. MANIFEST STATUS:')
console.log(`   - File: lib/data/programs-manifest.json`)
console.log(`   - DPU MBA rows found: ${dpuMbaRows.length}`)
console.log(`   - spec_name values: ALL EMPTY (critical issue)`)
console.log(`   - Sample slugs: ${dpuMbaRows.slice(0, 3).map(r => `"${r.spec_slug}"`).join(', ')}`)
console.log()

// 2. Check what URLs are generated for sitemap
const dpuSpecUrls = dpuMbaRows
  .map(r => `/universities/${r.university_slug}/mba/${r.spec_slug}`)
  .sort()

console.log('2. GENERATED URLs (from manifest):')
dpuSpecUrls.slice(0, 3).forEach(url => console.log(`   ${url}`))
console.log(`   ... (${dpuSpecUrls.length} total)`)
console.log()

// 3. Check build-valid-urls script behavior
console.log('3. BUILD PROCESS:')
console.log('   ✓ prebuild step runs: node scripts/build-valid-urls.js')
console.log('   ✓ It reads the Excel file and generates programs-manifest.json')
console.log('   ✓ The script found the "spec_name" column in Excel headers')
console.log('   ⚠ But Excel spec_name values are ALL EMPTY for DPU MBA rows')
console.log()

// 4. Check deployment flow
console.log('4. DEPLOYMENT FLOW:')
console.log('   - package.json has: "prebuild": "node scripts/build-valid-urls.js"')
console.log('   - This runs BEFORE "next build"')
console.log('   - During build, Next.js calls generateStaticParams() from page.tsx')
console.log('   - generateStaticParams() calls getProgramSpecParams("mba")')
console.log('   - This function uses the REGENERATED manifest')
console.log()

// 5. The actual problem
console.log('5. ROOT CAUSE:')
console.log('   THE EXCEL FILE (EdifyEdu_Unified_Programs_v3.xlsx) HAS NO SPEC_NAME VALUES FOR DPU MBA')
console.log()
console.log('   When spec_name is empty in Excel:')
console.log('   - manifest stores empty spec_name')
console.log('   - page.tsx tries to look up spec via getSpecDisplayName()')
console.log('   - Since the row EXISTS in manifest, getSpecDisplayName() returns a fallback')
console.log('   - Page should render BUT...')
console.log()
console.log('   WAIT - the page should NOT 404 because of this!')
console.log('   The fallback converts "sales-mktg" → "Sales Mktg"')
console.log()

// 6. Let me check generateStaticParams
console.log('6. STATIC PARAMS GENERATION:')
const specParams = dpuMbaRows.map(r => ({
  id: r.university_slug,
  spec: r.spec_slug
}))
console.log(`   Would generate ${specParams.length} param pairs`)
specParams.slice(0, 3).forEach(p => {
  console.log(`   - id="${p.id}", spec="${p.spec}"`)
})
console.log()

// 7. The REAL issue - maybe the manifest is being regenerated incorrectly
console.log('7. ACTUAL 404 CAUSE (most likely):')
console.log('   The Vercel deployment REGENERATES the manifest during build.')
console.log('   IF the Excel file on the server has different content than local,')
console.log('   the manifest will differ, causing different URLs to be pre-rendered.')
console.log()
console.log('   HYPOTHESIS:')
console.log('   - Local Excel: has DPU MBA rows with proper spec_slugs')
console.log('   - Server Excel: missing DPU MBA rows OR has different spec_slugs')
console.log('   - Result: pre-render generates different URLs')
console.log('   - When user tries /universities/dy-patil-university-online/mba/sales-mktg')
console.log('     it was never pre-rendered on server')
console.log()
console.log('   OR:')
console.log('   - generateStaticParams() IS being called at REQUEST TIME on Vercel')
console.log('   - dynamicParams=true means unmapped params get generated on-demand')
console.log('   - But if getUniversityById("dy-patil-university-online") or')
console.log('     getSpecDisplayName() fails, page returns notFound()')
console.log()

// 8. Check if both helpers would work
const dataStr = fs.readFileSync('lib/data.ts', 'utf8')
if (dataStr.includes('dy-patil-university-online')) {
  console.log('8. DATA LOOKUP VERIFICATION:')
  console.log('   ✓ "dy-patil-university-online" is in lib/data.ts')
  
  // Check if the page would actually render
  const hasSpecName = dpuMbaRows.some(r => r.spec_name !== '')
  console.log(`   ✓ Manifest has rows for this university`)
  console.log(`   ${hasSpecName ? '✓' : '✗'} Manifest has spec_name values (ALL EMPTY currently)`)
  console.log()
  console.log('   IF someone visits: /universities/dy-patil-university-online/mba/sales-mktg')
  console.log('   - getUniversityById("dy-patil-university-online") ✓ found')
  console.log('   - getSpecDisplayName("dy-patil-university-online", "mba", "sales-mktg") ✓ found')
  console.log('   - Should render (not 404)')
  console.log()
}

console.log('9. VERIFICATION NEEDED:')
console.log('   [ ] Is the Excel file on Vercel the same as local?')
console.log('   [ ] What URLs does Vercel pre-render? (check build output)')
console.log('   [ ] Does the 404 happen at build time or request time?')
console.log('   [ ] What exact URL is returning 404 on live site?')
