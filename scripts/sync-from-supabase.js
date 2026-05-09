// scripts/sync-from-supabase.js
//
// Pulls authoritative accreditation + ranking data from Supabase and applies
// corrections to lib/data.ts (the production data file). Then re-runs the
// content fix script so spec-page JSONs and the rest of the site reflect the
// new truth.
//
// Run: node scripts/sync-from-supabase.js [--dry]
//
// Source of truth (Supabase tables):
//   - universities: id, slug, name, ugc_deb_status, ugc_deb_valid_till
//   - accreditations: body (NAAC/NIRF/AICTE/AACSB/NBA), category, grade,
//     score, rank, total_ranked, valid_till, status

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

const DRY = process.argv.includes('--dry')
const ROOT = path.join(__dirname, '..')
const DATA_TS = path.join(ROOT, 'lib', 'data.ts')

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ── Supabase slug → site slug map (mirrors components/verify/VerifyHero.tsx) ──
const SUPA_TO_SITE_SLUG = {
  'manipal-academy-of-higher-education-online': 'manipal-academy-higher-education-online',
  'amrita-vishwa-vidyapeetham-university-online': 'amrita-vishwa-vidyapeetham-online',
  'bharati-vidyapeeth-online': 'bharati-vidyapeeth-university-online',
  'bs-abdur-rahman-institute-of-science-and-technology-online': 'bs-abdur-rahman-university-online',
  'central-university-of-himachal-pradesh-online': 'central-university-himachal-pradesh-online',
  'centurion-university-of-technology-and-management-online': 'centurion-university-online',
  'charotar-university-of-science-technology-online': 'charusat-university-online',
  'chatrapati-shahuji-maharaj-university-online': 'chhatrapati-shahu-ji-maharaj-university-online',
  'christ-deemed-to-be-university-online': 'christ-university-online',
  'datta-meghe-institute-of-higher-education-and-research-online': 'datta-meghe-university-online',
  'dayanand-sagar-university-online': 'dayananda-sagar-university-online',
  'dr-dy-patil-vidyapeeth-pune-online': 'dr-dy-patil-vidyapeeth-online',
  'dr-mgr-educational-and-research-institute-online': 'dr-mgr-educational-research-institute-online',
  'dy-patil-navi-mumbai-online': 'dy-patil-university-online',
  'graphic-era-online': 'graphic-era-university-online',
  'guru-gobind-singh-indraprastha-vishwavidyalaya-online': 'guru-gobind-singh-indraprastha-university-online',
  'guru-jambheshwar-university-of-science-and-technology-online': 'guru-jambheshwar-university-online',
  'hindustan-institute-of-technology-and-science-hits-online': 'hindustan-institute-technology-online',
  'icfai-foundation-for-higher-education-online': 'icfai-university-online',
  'indian-institute-of-foreign-trade-online': 'iift-online',
  'jain-deemed-to-be-university-online': 'jain-university-online',
  'jamia-millia-islamia-university-online': 'jamia-millia-islamia-online',
  'jaypee-institute-of-information-technology-online': 'jaypee-university-online',
  'jss-academy-of-education-and-research-online': 'jss-university-online',
  'kalasalingam-academy-of-research-and-higher-education-online': 'kalasalingam-university-online',
  'kalinga-institute-of-industrial-technology-online': 'kalinga-institute-industrial-technology-online',
  'karunya-institute-of-technology-and-sciences-online': 'karunya-university-online',
  'koneru-lakshmaiah-education-foundation-online': 'kl-university-online',
  'maharishi-markandeshwar-online': 'maharishi-markandeshwar-university-online',
  'manav-rachna-international-institute-of-research-studies-online': 'manav-rachna-online',
  'manipal-university-online': 'manipal-university-jaipur-online',
  'meenakshi-academy-of-higher-education-and-research-online': 'meenakshi-academy-higher-education-online',
  'mody-university-of-science-and-technology-online': 'mody-university-online',
  'narsee-monjee-institute-of-management-studies-nmims-online': 'nmims-online',
  'sathyabama-institute-of-science-and-technology-online': 'sathyabama-university-online',
  'shanmugha-arts-science-technology-research-academy-online': 'sastra-university-online',
  'shiv-nadar-institution-of-eminence-online': 'shiv-nadar-university-online',
  'shobhit-institute-of-engineering-technology-online': 'shobhit-university-online',
  'shoolini-university-of-biotechnology-and-management-sciences-online': 'shoolini-university-online',
  'sri-ramachandra-institute-of-higher-education-and-research-online': 'sri-ramachandra-university-online',
  'srm-institute-of-sciences-and-technology-online': 'srm-institute-science-technology-online',
  'swami-vivekanand-subharti-university-online': 'subharti-university-online',
  'symbiosis-international-online': 'symbiosis-university-online',
  'the-northcap-university-online': 'northcap-university-online',
  'university-of-petroleum-and-energy-studies-online': 'upes-online',
  'vellore-institute-of-technology-online': 'vit-university-online',
  'vels-institute-of-science-technology-advanced-studies-vistas-online': 'vels-university-online',
  'vignans-foundation-for-science-technology-and-research-online': 'vignan-university-online',
  'visvesvaraya-technological-university-online': 'vtu-online',
  'yenepoya-online': 'yenepoya-university-online',
  'amity-university-rajasthan-online': 'amity-university-online',
  'birla-institute-of-technology-online': 'bits-pilani-online',
  'international-institute-of-information-technology-online': 'iiit-bangalore-online',
  // Direct identical slugs handled by fallback
}

function toSiteSlug(supabaseSlug) {
  return SUPA_TO_SITE_SLUG[supabaseSlug] || supabaseSlug
}

;(async () => {
  // 1. Pull Supabase data
  const { data: unis, error: e1 } = await supa.from('universities').select('id, slug, name')
  if (e1) { console.error('uni read failed:', e1); process.exit(1) }
  const { data: accreds, error: e2 } = await supa.from('accreditations').select('*')
  if (e2) { console.error('accred read failed:', e2); process.exit(1) }

  // 2. Build per-uni truth from Supabase
  const TRUTH = {}  // siteSlug → {naac, nirfUni, nirfMgt, nirfOverall, aicte, aacsb, nba}
  for (const u of unis) {
    const myAccreds = accreds.filter(a => a.university_id === u.id && a.status === 'active')
    const naac = myAccreds.find(a => a.body === 'NAAC')
    const nirfUni = myAccreds.find(a => a.body === 'NIRF' && a.category === 'University')
    const nirfMgt = myAccreds.find(a => a.body === 'NIRF' && a.category === 'Management')
    const nirfOverall = myAccreds.find(a => a.body === 'NIRF' && a.category === 'Overall')
    const aicte = myAccreds.find(a => a.body === 'AICTE')
    const aacsb = myAccreds.find(a => a.body === 'AACSB')
    const nba = myAccreds.find(a => a.body === 'NBA')

    TRUTH[toSiteSlug(u.slug)] = {
      supaSlug: u.slug,
      name: u.name,
      naac: naac ? naac.grade : null,
      naacScore: naac ? naac.score : null,
      nirfUni: nirfUni ? nirfUni.rank : null,
      nirfMgt: nirfMgt ? nirfMgt.rank : null,
      nirfOverall: nirfOverall ? nirfOverall.rank : null,
      aicte: !!aicte,
      aacsb: !!aacsb,
      nba: !!nba,
    }
  }

  console.log(`Pulled ${Object.keys(TRUTH).length} universities from Supabase`)

  // 3. Read lib/data.ts and apply per-uni updates in-place
  let dataSrc = fs.readFileSync(DATA_TS, 'utf8')
  const original = dataSrc
  const changes = []

  const idRe = /id:\s*'([a-z0-9-]+)'/g
  let m
  while ((m = idRe.exec(original)) !== null) {
    const siteSlug = m[1]
    const truth = TRUTH[siteSlug]
    if (!truth) continue

    // Find this university's block end (next id: or end of array)
    const blockStart = m.index
    idRe.lastIndex = m.index + m[0].length
    const next = idRe.exec(original)
    const blockEnd = next ? next.index : original.length
    idRe.lastIndex = blockStart + 1  // reset for outer loop

    const blk = dataSrc.slice(blockStart, blockEnd)
    let newBlk = blk
    const blkChanges = []

    // 3a. Fix NAAC
    if (truth.naac) {
      newBlk = newBlk.replace(/(naac:\s*')([^']*)(')/g, (full, pre, val, post) => {
        if (val !== truth.naac) {
          blkChanges.push(`NAAC: '${val}' → '${truth.naac}'`)
          return pre + truth.naac + post
        }
        return full
      })
    }

    // 3b. Fix NIRF University rank (the `nirf:` field is the University rank in lib/data.ts)
    if (truth.nirfUni !== null && truth.nirfUni > 0) {
      newBlk = newBlk.replace(/(nirf:\s*)(\d+)(?!\w)/, (full, pre, val) => {
        const cur = parseInt(val, 10)
        if (cur !== truth.nirfUni) {
          blkChanges.push(`nirf (Uni): ${cur} → ${truth.nirfUni}`)
          return pre + truth.nirfUni
        }
        return full
      })
    } else if (truth.nirfUni === null) {
      // Set to 999 (sentinel for "not ranked") if Supabase has no rank
      newBlk = newBlk.replace(/(nirf:\s*)(\d+)(?!\w)/, (full, pre, val) => {
        const cur = parseInt(val, 10)
        if (cur > 0 && cur < 200) {
          blkChanges.push(`nirf (Uni): ${cur} → 999 (not ranked per Supabase)`)
          return pre + '999'
        }
        return full
      })
    }

    // 3c. Fix NIRF Management rank
    if (truth.nirfMgt !== null && truth.nirfMgt > 0) {
      newBlk = newBlk.replace(/(nirfMgt:\s*)(\d+)(?!\w)/, (full, pre, val) => {
        const cur = parseInt(val, 10)
        if (cur !== truth.nirfMgt) {
          blkChanges.push(`nirfMgt: ${cur} → ${truth.nirfMgt}`)
          return pre + truth.nirfMgt
        }
        return full
      })
    } else if (truth.nirfMgt === null) {
      newBlk = newBlk.replace(/(nirfMgt:\s*)(\d+)(?!\w)/, (full, pre, val) => {
        const cur = parseInt(val, 10)
        if (cur > 0 && cur < 200) {
          blkChanges.push(`nirfMgt: ${cur} → 999 (not ranked per Supabase)`)
          return pre + '999'
        }
        return full
      })
    }

    if (blkChanges.length) {
      dataSrc = dataSrc.replace(blk, newBlk)
      changes.push({ slug: siteSlug, blkChanges })
    }
  }

  // 4. Report + write
  console.log(`\n=== Diff vs lib/data.ts ===`)
  console.log(`Universities with at least one correction: ${changes.length}\n`)
  for (const c of changes) {
    console.log(`• ${c.slug}`)
    c.blkChanges.forEach(x => console.log(`    ${x}`))
  }

  if (!DRY && dataSrc !== original) {
    fs.writeFileSync(DATA_TS, dataSrc, 'utf8')
    console.log(`\nWrote lib/data.ts`)
  } else if (DRY) {
    console.log(`\n[DRY RUN] No file written. Re-run without --dry to apply.`)
  }

  // 5. Universities in Supabase but not matched (slug mismatch)
  const dataIds = new Set([...original.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map(x => x[1]))
  const unmatched = Object.entries(TRUTH).filter(([slug]) => !dataIds.has(slug))
  if (unmatched.length) {
    console.log(`\n=== Supabase universities NOT found in lib/data.ts (${unmatched.length}) ===`)
    console.log('These need entries in SUPA_TO_SITE_SLUG or new lib/data.ts records:')
    unmatched.slice(0, 20).forEach(([slug, t]) => console.log(`  - ${slug}  (Supabase: ${t.supaSlug})`))
    if (unmatched.length > 20) console.log(`  ...and ${unmatched.length - 20} more`)
  }
})().catch(e => { console.error(e); process.exit(1) })
