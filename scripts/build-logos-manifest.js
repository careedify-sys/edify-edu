#!/usr/bin/env node
/**
 * build-logos-manifest.js
 * Scans public/logos/university_logos/ and cross-references with known
 * university ID mappings to produce lib/data/logos-manifest.json
 * Run: node scripts/build-logos-manifest.js
 */

const fs   = require('fs')
const path = require('path')

const LOGOS_DIR   = path.resolve(__dirname, '../public/logos/university_logos')
const OUTPUT_FILE = path.resolve(__dirname, '../lib/data/logos-manifest.json')

// Known filename → university-id mappings (maintained manually)
// Filename (without extension) on left, full university slug on right
const FILENAME_TO_ID = {
  'amity-online-university-logo_2':           'amity-university-online',
  'amrita-online-logo':                        'amrita-vishwa-vidyapeetham-online',
  'mahe-manipal-online-logo':                  'manipal-academy-higher-education-online',
  'muj-logo':                                  'manipal-university-jaipur-online',
  'cu-online':                                 'chandigarh-university-online',
  'lpu-logo':                                  'lovely-professional-university-online',
  'nmims-online-logo':                         'nmims-online',
  'jain_university-logo':                      'jain-university-online',
  'shoolini-university-online-logo':           'shoolini-university-online',
  'kurukshetra-university-logo':               'kurukshetra-university-online',
  'jamia-hamdard-online-logo':                 'jamia-hamdard-online',
  'uttaranchal-online-university-logo_1':      'uttaranchal-university-online',
  'vivekananda-global-university-logo':        'vivekanand-global-university-online',
  'manav-rachna-university-logo':              'manav-rachna-online',
  'sikkim-manipal-university-logo':            'sikkim-manipal-university-online',
  'srm-color':                                 'srm-institute-science-technology-online',
  'srm-institue-tamil-nadu-logo':              'srm-institute-science-technology-online',
  'dayanand-sagar-logo':                       'dayananda-sagar-university-online',
  'mangalayatan-logo':                         'mangalayatan-university-online',
  'galgotias-university-logo':                 'galgotias-university-online',
  'yenepoya-university':                       'yenepoya-university-online',
  'sharda-university':                         'sharda-university-online',
  'integral-university':                       'integral-university-online',
  'dr-babasahed-ambedkar-open-university':     'dr-babasaheb-ambedkar-open-university-online',
  'university-of-mysor-logo':                  'university-of-mysore-online',
  'gujrat-university':                         'gujarat-university-online',
  'charusat':                                  'charusat-university-online',
  'maharishi-markandeshwar':                   'maharishi-markandeshwar-university-online',
  'dr-mgr-logo':                               'dr-mgr-educational-research-institute-online',
  'sgt':                                       'sgt-university-online',
  'sastra-logo':                               'sastra-university-online',
  'dr-dy-patil-vidyapeeth-pune-logo':          'dr-dy-patil-vidyapeeth-online',
  'dpu-online':                                'dypatil-university-online',
  'christ-deemed-to-be-university':            'christ-university-online',
  'shobhit-university-logo':                   'shobhit-university-online',
  'bharati-vidyapeeth':                        'bharati-vidyapeeth-university-online',
  'assam-don-bosco-university-logo':           'assam-don-bosco-university-online',
  'desh-bhagat-university':                    'desh-bhagat-university-online',
  'guru-nanak-dev-logo':                       'guru-nanak-dev-university-online',
  'gla-mathura-online-logo':                   'gla-university-online',
  'vit_logo_306x100px-01-012025':              'vit-university-online',
  'vit_logo_306x100px-01-012025':              'vit-vellore-online',
  'ignou-logo':                                'ignou-online',
  'noida-international-university':            'noida-international-university-online',
  'kl-university-online-logo':                 'kl-university-online',
  'chitkara-university-online':                'chitkara-university-online',
  'andhra-university-online-logo':             'andhra-university-online',
  'alliance-university-logo':                  'alliance-university-online',
  'geu-online':                                'graphic-era-university-online',
  'graphic-era-university':                    'graphic-era-university-online',
  'sage-university-logo':                      'sage-university-online',
  'upes-logo':                                 'upes-online',
  'upes-logo-black':                           'upes-online',
  'centurion-university':                      'centurion-university-online',
  'mats-university':                           'mats-university-online',
  'ganpat-university-logo':                    'ganpat-university-online',
  'jaipur-nataional-univesity':                'jaipur-national-university-online',
  'integral-university':                       'integral-university-online',
  'dsuonline-newlogo':                         'dayananda-sagar-university-online',
  'du_online':                                 'delhi-university-online',
}

// Read all files in the logos directory
const files = fs.readdirSync(LOGOS_DIR)

const manifest = {}

for (const file of files) {
  const ext  = path.extname(file)
  const base = path.basename(file, ext)

  // Skip non-image files and edify/badge logos
  const SKIP = ['edify', 'ugc', 'naac', 'nirf', 'aicte', 'aiu', 'wes', 'qs', 'logo-', 'logo_', 'logo.', 'site-', 'mba_', 'mca_', 'mba.', 'mca.', 'download', 'SSODL', '01-800', '24_online']
  if (SKIP.some(s => base.toLowerCase().startsWith(s.toLowerCase()))) continue
  if (!['.svg', '.png', '.webp', '.jpg'].includes(ext)) continue

  const uniId = FILENAME_TO_ID[base]
  if (uniId) {
    // Prefer SVG over other formats; only set if not already set
    if (!manifest[uniId] || ext === '.svg') {
      manifest[uniId] = `/logos/university_logos/${file}`
    }
  }
}

// Sort by key for readability
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sorted, null, 2))

console.log(`✓ Wrote ${Object.keys(sorted).length} logo entries to lib/data/logos-manifest.json`)
Object.entries(sorted).forEach(([id, path]) => console.log(`  ${id} → ${path}`))
