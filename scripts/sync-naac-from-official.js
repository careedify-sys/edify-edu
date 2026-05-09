// scripts/sync-naac-from-official.js
//
// Cross-checks every NAAC accreditation row in Supabase against the official
// NAAC IIQA list (data/naac-official-2025.tsv). Updates Supabase NAAC rows
// to match the latest-cycle official data, including cycle number, CGPA,
// grade, declaration date and a derived valid_till (declaration + 7 years).
//
// Run: node scripts/sync-naac-from-official.js [--dry]

const fs = require('fs')
const path = require('path')
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
const { createClient } = require('@supabase/supabase-js')
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const DRY = process.argv.includes('--dry')
const NAAC_FILE = path.join(__dirname, '..', 'data', 'naac-official-2025.tsv')

// Supabase slug → site slug map. Used to derive disambiguating tokens
// (e.g. "jaipur" for MUJ) when the Supabase name itself is ambiguous.
const SUPA_TO_SITE_SLUG = {
  'manipal-academy-of-higher-education-online': 'manipal-academy-higher-education-online',
  'manipal-university-online': 'manipal-university-jaipur-online',
  'narsee-monjee-institute-of-management-studies-nmims-online': 'nmims-online',
  'symbiosis-international-online': 'symbiosis-university-online',
  'birla-institute-of-technology-online': 'bits-pilani-online',
  'international-institute-of-information-technology-online': 'iiit-bangalore-online',
  'visvesvaraya-technological-university-online': 'vtu-online',
  'amity-university-rajasthan-online': 'amity-university-online',
  'university-of-petroleum-and-energy-studies-online': 'upes-online',
  'vellore-institute-of-technology-online': 'vit-university-online',
  'shoolini-university-of-biotechnology-and-management-sciences-online': 'shoolini-university-online',
  'jain-deemed-to-be-university-online': 'jain-university-online',
}

// ── Parse official NAAC TSV ───────────────────────────────────────────────
function parseTSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  // Each row uses tab separators but address may contain newlines (quoted).
  // Records are separated by blank lines. Each record is the fields joined.
  // For simplicity we use a permissive line-splitter and require sl-no at start.
  const out = []
  for (const line of raw.split(/\r?\n/)) {
    const cells = line.split('\t')
    if (cells.length < 8) continue
    const slNo = parseInt(cells[0].trim(), 10)
    if (isNaN(slNo)) continue
    const name = (cells[1] || '').trim()
    const trackId = (cells[2] || '').trim()
    const aisheId = (cells[3] || '').trim()
    const addr = (cells[4] || '').trim()
    const cycle = parseInt(cells[5], 10)
    const cgpa = parseFloat(cells[6])
    const grade = (cells[7] || '').trim()
    const dateStr = (cells[8] || '').trim()  // dd-mm-yyyy
    if (!name || isNaN(cycle) || isNaN(cgpa) || !grade) continue
    let isoDate = null
    const dm = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/)
    if (dm) isoDate = `${dm[3]}-${dm[2]}-${dm[1]}`
    out.push({ slNo, name, trackId, aisheId, addr, cycle, cgpa, grade, declaredOn: isoDate })
  }
  return out
}

// Fuzzy match score: count distinct >=4-char tokens shared between two names
function nameTokens(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 4 && !['university', 'institute', 'deemed', 'online', 'higher', 'education', 'research', 'studies', 'academy', 'school', 'college', 'national', 'india'].includes(t))
}

function matchScore(naacName, supaName) {
  const a = new Set(nameTokens(naacName))
  const b = new Set(nameTokens(supaName))
  let intersection = 0
  let onlyInNaac = 0
  for (const t of a) {
    if (b.has(t)) intersection++
    else onlyInNaac++
  }
  // Penalize extra distinguishing tokens in NAAC name that aren't in
  // the Supabase name. Prevents "ARKA JAIN UNIVERSITY" from matching
  // "JAIN Deemed-to-be" (both contain "jain"). The ARKA token is
  // unmatched, so the score drops below the cleaner JAIN match.
  return intersection - onlyInNaac * 0.6
}

;(async () => {
  if (!fs.existsSync(NAAC_FILE)) {
    console.error(`Official NAAC TSV not found at ${NAAC_FILE}`)
    process.exit(1)
  }
  const naac = parseTSV(NAAC_FILE)
  console.log(`Loaded ${naac.length} official NAAC rows`)

  // Pull all Supabase universities + current NAAC rows
  const { data: unis } = await supa.from('universities').select('id, slug, name')
  const { data: accreds } = await supa.from('accreditations').select('*').eq('body', 'NAAC')

  // Build naac-name index for fuzzy match
  const updates = []
  let matched = 0
  let unmatched = []

  for (const u of unis) {
    // Strip "Online" suffix from supabase name for matching
    const cleanName = (u.name || '').replace(/\s*-?\s*Online$/i, '').trim()
    // Combine name AND slug to give the matcher more disambiguation tokens.
    // Critical for cases like supabase slug "manipal-university-online" with
    // name "Manipal University" (MUJ) vs slug "manipal-academy-of-higher-
    // education-online" with name "Manipal Academy" (MAHE). Both start with
    // "Manipal University" alone is ambiguous; the slug includes "jaipur"
    // for MUJ and disambiguates.
    const siteSlug = SUPA_TO_SITE_SLUG[u.slug] || u.slug
    const slugAsName = siteSlug.replace(/-online$/, '').replace(/-/g, ' ')
    const matchSrc = `${cleanName} ${slugAsName}`
    let bestScore = 0
    let bestRow = null
    for (const row of naac) {
      const score = matchScore(row.name, matchSrc)
      if (score > bestScore) { bestScore = score; bestRow = row }
    }
    if (bestRow && bestScore >= 1) {
      matched++
      const curRow = accreds.find(a => a.university_id === u.id)
      const isoValidTill = bestRow.declaredOn
        ? new Date(new Date(bestRow.declaredOn).setFullYear(new Date(bestRow.declaredOn).getFullYear() + 7)).toISOString().slice(0, 10)
        : null
      const desired = {
        grade: bestRow.grade,
        score: bestRow.cgpa,
        cycle: String(bestRow.cycle),
        valid_till: isoValidTill,
        notes: `Cycle ${bestRow.cycle} (${bestRow.declaredOn}). CGPA ${bestRow.cgpa}. Synced from official NAAC IIQA list 2026-05-10.`,
      }
      // Compare to current
      const curState = {
        grade: curRow?.grade ?? null,
        score: curRow?.score ?? null,
        cycle: curRow?.cycle ?? null,
      }
      const needsUpdate = !curRow ||
        curRow.grade !== desired.grade ||
        Math.abs((curRow.score || 0) - desired.score) > 0.01 ||
        String(curRow.cycle || '') !== desired.cycle
      if (needsUpdate) {
        updates.push({ uniId: u.id, slug: u.slug, supaName: u.name, naacName: bestRow.name, desired, curState })
      }
    } else {
      unmatched.push({ slug: u.slug, name: u.name })
    }
  }

  console.log(`\nMatched: ${matched} of ${unis.length}`)
  console.log(`Unmatched: ${unmatched.length}`)
  console.log(`Need update: ${updates.length}\n`)

  if (updates.length) {
    console.log('=== Updates ===')
    for (const u of updates) {
      console.log(`  ${u.slug}`)
      console.log(`    matched naac: "${u.naacName}"`)
      console.log(`    before: grade=${u.curState.grade} score=${u.curState.score} cycle=${u.curState.cycle || '—'}`)
      console.log(`    after : grade=${u.desired.grade} score=${u.desired.score} cycle=${u.desired.cycle} valid_till=${u.desired.valid_till}`)
    }
  }

  if (unmatched.length) {
    console.log('\n=== Unmatched (no NAAC row found) ===')
    unmatched.slice(0, 10).forEach(u => console.log(`  ${u.slug}  (${u.name})`))
    if (unmatched.length > 10) console.log(`  ...and ${unmatched.length - 10} more`)
  }

  if (DRY) {
    console.log('\n[DRY RUN] No writes made. Re-run without --dry to apply.')
    return
  }

  if (!updates.length) {
    console.log('\nNo writes needed.')
    return
  }

  console.log('\nApplying updates...')
  let okCount = 0
  for (const u of updates) {
    const { error } = await supa
      .from('accreditations')
      .update({
        grade: u.desired.grade,
        score: u.desired.score,
        cycle: u.desired.cycle,
        valid_till: u.desired.valid_till,
        notes: u.desired.notes,
        data_updated_at: new Date().toISOString(),
      })
      .eq('university_id', u.uniId)
      .eq('body', 'NAAC')
    if (error) console.error(`  FAIL ${u.slug}: ${error.message}`)
    else { okCount++; console.log(`  OK ${u.slug}`) }
  }
  console.log(`\nApplied: ${okCount} of ${updates.length}`)
})().catch(e => { console.error(e); process.exit(1) })
