/**
 * scripts/fix-university-slugs.js
 * Renames all university IDs to SEO-friendly slugs.
 * Run once: node scripts/fix-university-slugs.js
 */

const fs = require('fs')
const path = require('path')

// ── Complete old → new ID mapping ─────────────────────────────────────────────
const ID_MAP = {
  'jain':                           'jain-university-online',
  'amity':                          'amity-university-online',
  'lpu':                            'lovely-professional-university-online',
  'dayanand-sagar-universi':        'dayananda-sagar-university-online',
  'dypatil':                        'dy-patil-university-online',
  'universi-of-petroleu-and':       'upes-online',
  'parul-universi':                 'parul-university-online',
  'amrita-vishwa-vidyapee':         'amrita-vishwa-vidyapeetham-online',
  'mangalay-universi':              'mangalayatan-university-online',
  'shoolini':                       'shoolini-university-online',
  'manipal-jaipur':                 'manipal-university-jaipur-online',
  'galgotia-universi':              'galgotias-university-online',
  'sikkim-manipal':                 'sikkim-manipal-university-online',
  'symbiosis':                      'symbiosis-university-online',
  'chitkara-universi':              'chitkara-university-online',
  'yenepoya-universi':              'yenepoya-university-online',
  'sharda-universi':                'sharda-university-online',
  'vignans-foundati-for-science':   'vignan-university-online',
  'manonman-sundaran-universi':     'manonmaniam-sundaranar-university-online',
  'nmims':                          'nmims-online',
  'mahe-manipal':                   'manipal-academy-higher-education-online',
  'koneru-lakshmai-educatio-found': 'kl-university-online',
  'chandigarh':                     'chandigarh-university-online',
  'visveswa-technolo-universi':     'vtu-online',
  'integral-universi':              'integral-university-online',
  'manav-rachna-internat-institut': 'manav-rachna-online',
  'karnatak-state-open-universi':   'karnataka-state-open-university-online',
  'bharathidasan-uni':              'bharathidasan-university-online',
  'hindusta-institut-of-technolo':  'hindustan-institute-technology-online',
  'guru-ghasidas-vishwavi':         'guru-ghasidas-vishwavidyalaya-online',
  'dr-babasahe-ambedkar-open':      'dr-babasaheb-ambedkar-open-university-online',
  'marwadi-universi':               'marwadi-university-online',
  'pp-savani-universi':             'pp-savani-university-online',
  'universi-of-mysore':             'university-of-mysore-online',
  'aligarh-muslim-universi':        'aligarh-muslim-university-online',
  'gujarat-universi':               'gujarat-university-online',
  'charotar-universi-of-science':   'charusat-university-online',
  'gls-universi':                   'gls-university-online',
  'maharish-markande-universi':     'maharishi-markandeshwar-university-online',
  'mizoram-universi':               'mizoram-university-online',
  'vivekana-global-universi':       'vivekananda-global-university-online',
  'dr-mgr-educatio-and':            'dr-mgr-educational-research-institute-online',
  'uttaranc-universi':              'uttaranchal-university-online',
  'andhra-universi':                'andhra-university-online',
  'sgt-universi':                   'sgt-university-online',
  'universi-of-himachal-pradesh':   'central-university-himachal-pradesh-online',
  'mahatma-gandhi-universi':        'mahatma-gandhi-university-online',
  'vellore-institut-of-technolo':   'vit-university-online',
  'karunya-institut-of-technolo':   'karunya-university-online',
  'kurukshe-universi':              'kurukshetra-university-online',
  'sastra-deemed-universi':         'sastra-university-online',
  'dr-dy-patil-vidyapeeth':         'dr-dy-patil-vidyapeeth-online',
  'jamia-millia-islamia-universi':  'jamia-millia-islamia-online',
  'christ-deemed-to-be':            'christ-university-online',
  'shobhit-universi':               'shobhit-university-online',
  'bharati-vidyapee-universi':      'bharati-vidyapeeth-university-online',
  'assam-down-town-universi':       'assam-don-bosco-university-online',
  'universi-of-lucknow':            'university-of-lucknow-online',
  'jss-academy-of-higher':          'jss-university-online',
  'alliance-universi':              'alliance-university-online',
  'desh-bhagat-universi':           'desh-bhagat-university-online',
  'ganpat-universi':                'ganpat-university-online',
  'amet-universi':                  'amet-university-online',
  'guru-nanak-dev-universi':        'guru-nanak-dev-university-online',
  'jaypee-universi':                'jaypee-university-online',
  'savitrib-phule-pune-universi':   'savitribai-phule-pune-university-online',
  'srm-sikkim-universi':            'srm-university-sikkim-online',
  'sathyaba-institut-of-science':   'sathyabama-university-online',
  'vellore-vit-online':             'vit-vellore-online',
  'karunya-kcode-universi':         'karunya-kcode-online',
  'anna-universi':                  'anna-university-online',
  'vels-institut-of-science':       'vels-university-online',
  'northcap-universi':              'northcap-university-online',
  'noida-internat-universi':        'noida-international-university-online',
  'iift':                           'iift-online',
  'gujarat-technolo-universi':      'gujarat-technological-university-online',
  'birla-institut-of-technolo':     'bits-pilani-online',
  'alvas-college':                  'alvas-college-online',
  'datta-meghe-institut-of':        'datta-meghe-university-online',
  'kiit-universi':                  'kiit-university-online',
  'centurio-universi-of-technolo':  'centurion-university-online',
  'guru-kashi-universi':            'guru-kashi-university-online',
  'jaipur-national-universi':       'jaipur-national-university-online',
  'bs-abdur-rahman-institut':       'bs-abdur-rahman-university-online',
  'srm-institut-of-science':        'srm-institute-science-technology-online',
  'universi-of-madras':             'university-of-madras-online',
  'kalasali-academy-of-research':   'kalasalingam-university-online',
  'alagappa-universi':              'alagappa-university-online',
  'bharathi-universi':              'bharathiar-university-online',
  'sri-ramachandra-universi':       'sri-ramachandra-university-online',
  'icfai-foundati-for-higher':      'icfai-university-online',
  'shiv-nadar-institut-of':         'shiv-nadar-university-online',
  'gla-universi':                   'gla-university-online',
  'jagan-nath-universi':            'jagannath-university-online',
  'teerthanker-universi':           'teerthanker-mahaveer-university-online',
  'subharti-universi':              'subharti-university-online',
  'arka-jain-universi':             'arka-jain-university-online',
  'jawaharl-nehru-universi':        'jawaharlal-nehru-university-online',
  'jamia-hamdard':                  'jamia-hamdard-online',
  'kalinga-institut-of-industri':   'kalinga-institute-industrial-technology-online',
  'universi-of-kerala':             'university-of-kerala-online',
  'bits-pilani-work-integrat':      'bits-pilani-work-integrated-online',
  'graphic-era-universi':           'graphic-era-university-online',
  'devi-ahilya-vishwavi':           'devi-ahilya-vishwavidyalaya-online',
  'madurai-kamaraj-universi':       'madurai-kamaraj-university-online',
  'shanmugh-arts-science-technolo': 'shanmugha-arts-science-technology-research-online',
  'universi-of-mumbai':             'university-of-mumbai-online',
  'universi-of-jammu':              'university-of-jammu-online',
  'shivaji-universi':               'shivaji-university-online',
  'banastha-vidyapit':              'banasthali-vidyapith-online',
  'guru-gobind-singh-indrapra':     'guru-gobind-singh-indraprastha-university-online',
  'bangalor-universi':              'bangalore-university-online',
  'internat-institut-of-informat':  'iiit-bangalore-online',
  'dayal-bagh-educatio-institut':   'dayalbagh-educational-institute-online',
  'adichunc-universi':              'adichunchanagiri-university-online',
  'bharath-institut-of-higher':     'bharath-university-online',
  'chatrapa-shahuji-maharaj-unive': 'chhatrapati-shahu-ji-maharaj-university-online',
  'deen-dayal-upadhyay-gorakhpu':   'deen-dayal-upadhyay-gorakhpur-university-online',
  'guru-jambhesh-universi-of':      'guru-jambheshwar-university-online',
  'maharshi-dayanand-universi':     'maharshi-dayanand-university-online',
  'mahatma-jyotiba-phule-rohilkha': 'mahatma-jyotiba-phule-rohilkhand-university-online',
  'mats-universi':                  'mats-university-online',
  'meenaksh-academy-of-higher':     'meenakshi-academy-higher-education-online',
  'mody-universi-of-science':       'mody-university-online',
  'sage-universi':                  'sage-university-online',
  'shree-guru-gobind-singh':        'shree-guru-gobind-singh-tricentenary-university-online',
  'shri-ramasamy-memorial-univers': 'shri-ramasamy-memorial-university-online',
}

// ── Files to update (all string occurrences of old IDs) ───────────────────────
const FILES_TO_UPDATE = [
  'lib/data.ts',
  'lib/data-slim.ts',
  'app/sitemap.ts',
  'app/page.tsx',
  'app/compare/page.tsx',
  'app/universities/[id]/layout.tsx',
  'app/universities/[id]/[program]/layout.tsx',
  'app/universities/[id]/[program]/page.tsx',
  'components/Footer.tsx',
  'app/admin/audit/page.tsx',
  'app/blog/write/page.tsx',
]

const ROOT = path.join(__dirname, '..')

// Sort old IDs longest-first to avoid partial replacement
// (e.g., replace 'manipal-jaipur' before 'manipal')
const sortedOldIds = Object.keys(ID_MAP).sort((a, b) => b.length - a.length)

let totalReplacements = 0

for (const relFile of FILES_TO_UPDATE) {
  const filePath = path.join(ROOT, relFile)
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP (not found): ${relFile}`)
    continue
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let fileReplacements = 0

  for (const oldId of sortedOldIds) {
    const newId = ID_MAP[oldId]
    // Replace all occurrences of the old ID as a quoted string
    // Matches: 'old-id' and "old-id"
    const singleQuote = new RegExp(`'${escapeRegex(oldId)}'`, 'g')
    const doubleQuote = new RegExp(`"${escapeRegex(oldId)}"`, 'g')

    const before = content
    content = content.replace(singleQuote, `'${newId}'`)
    content = content.replace(doubleQuote, `"${newId}"`)

    const count = countDiff(before, content, oldId, newId)
    fileReplacements += count
  }

  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`  ✓ ${relFile} — ${fileReplacements} replacement(s)`)
    totalReplacements += fileReplacements
  } else {
    console.log(`  · ${relFile} — no changes needed`)
  }
}

console.log(`\nTotal replacements: ${totalReplacements}`)

// ── Generate redirect rules ───────────────────────────────────────────────────
console.log('\n--- Redirect rules to add to next.config.js ---\n')

const redirects = []

for (const [oldId, newId] of Object.entries(ID_MAP)) {
  redirects.push(`      { source: '/universities/${oldId}',          destination: '/universities/${newId}',          permanent: true },`)
  redirects.push(`      { source: '/universities/${oldId}/:path*',   destination: '/universities/${newId}/:path*',   permanent: true },`)
}

// Also add the legacy 'manipal' redirect updated to new ID
redirects.push(`      { source: '/universities/manipal',            destination: '/universities/manipal-academy-higher-education-online', permanent: true },`)
redirects.push(`      { source: '/universities/manipal/:path*',     destination: '/universities/manipal-academy-higher-education-online/:path*', permanent: true },`)

console.log(redirects.join('\n'))

// ── Helpers ───────────────────────────────────────────────────────────────────
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function countDiff(before, after, oldId, newId) {
  const oldCount = (before.match(new RegExp(escapeRegex(oldId), 'g')) || []).length
  const newCount = (after.match(new RegExp(escapeRegex(newId), 'g')) || []).length
  // Approximate: count how many times newId appeared that weren't there before
  const prevNewCount = (before.match(new RegExp(escapeRegex(newId), 'g')) || []).length
  return newCount - prevNewCount
}
