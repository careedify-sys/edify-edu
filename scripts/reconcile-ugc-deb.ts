/**
 * Reconcile the site's university database against a UGC-DEB recognition list.
 *
 * Inputs (produced by scripts/parse-ugc-deb-pdf.mjs):
 *   audits/ugc-deb-2026-08/main.json      : the standing recognition list
 *   audits/ugc-deb-2026-08/addendum.json  : the period-wise addendum list
 *
 * Outputs:
 *   audits/ugc-deb-2026-08/reconciliation.json
 *   audits/ugc-deb-2026-08/university-status.csv
 *   audits/ugc-deb-2026-08/programme-gaps.csv
 *
 * Run: node_modules/.bin/tsx scripts/reconcile-ugc-deb.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { UNIVERSITIES } from '../lib/data'

const DIR = path.join(process.cwd(), 'audits', 'ugc-deb-2026-08')
const main = JSON.parse(fs.readFileSync(path.join(DIR, 'main.json'), 'utf8'))
const addendum = JSON.parse(fs.readFileSync(path.join(DIR, 'addendum.json'), 'utf8'))

// ---------------------------------------------------------------- UGC universe
type UgcRow = {
  key: string
  src: 'main' | 'addendum'
  sno: string
  state: string
  type: string
  hei: string
  programmes: string[]
  periods?: { period: string; programmes: string[] }[]
}

const ugc: UgcRow[] = []
main.forEach((r: any, i: number) =>
  ugc.push({ key: 'main:' + i, src: 'main', sno: r.sno, state: r.state, type: r.type, hei: r.hei, programmes: r.programmes })
)
addendum.forEach((r: any, i: number) =>
  ugc.push({
    key: 'add:' + i, src: 'addendum', sno: r.sno, state: r.state, type: r.type, hei: r.hei,
    programmes: r.blocks.flatMap((b: any) => b.programmes),
    periods: r.blocks.map((b: any) => ({ period: b.period, programmes: b.programmes })),
  })
)
const byKey = new Map(ugc.map(r => [r.key, r]))

// ------------------------------------------------------- site -> UGC row map
// Auto-matching on names alone produces false positives whenever one
// distinctive token is shared ("MANIPAL", "BANGALORE", "JAIN"), so every
// mapping below was adjudicated by hand against the two PDFs.
const MAP: Record<string, string | string[] | null> = {
  'adichunchanagiri-university-online': 'main:45',
  'alagappa-university-online': 'main:91',
  'aligarh-muslim-university-online': 'main:104',
  'alliance-university-online': 'main:44',
  'alvas-college-online': null,
  'amet-university-online': 'add:12',
  'amity-university-online': ['main:105', 'add:14'],
  'amrita-vishwa-vidyapeetham-online': 'main:90',
  'andhra-university-online': 'main:0',
  'anna-university-online': 'main:98',
  'arka-jain-university-online': 'add:6',
  'assam-don-bosco-university-online': 'add:0',
  'assam-down-town-university-online': 'main:5',
  'banasthali-vidyapith-online': 'main:73',
  'bangalore-university-online': 'main:36',
  'bharath-university-online': 'main:80',
  'bharathiar-university-online': 'main:92',
  'bharathidasan-university-online': 'main:79',
  'bharati-vidyapeeth-university-online': 'main:56',
  'bit-mesra-online': 'main:32',
  'bits-pilani-work-integrated-online': null,
  'bs-abdur-rahman-university-online': 'main:81',
  'central-university-himachal-pradesh-online': 'main:30',
  'centurion-university-online': 'main:64',
  'chandigarh-university-online': 'main:65',
  'charusat-university-online': 'main:16',
  'chhatrapati-shahu-ji-maharaj-university-online': 'main:116',
  'chitkara-university-online': 'main:66',
  'christ-university-online': 'main:42',
  'datta-meghe-university-online': 'main:57',
  'dayalbagh-educational-institute-online': 'main:113',
  'dayananda-sagar-university-online': 'main:43',
  'deen-dayal-upadhyay-gorakhpur-university-online': 'main:119',
  'desh-bhagat-university-online': 'main:70',
  'devi-ahilya-vishwavidyalaya-online': 'main:51',
  'dr-babasaheb-ambedkar-open-university-online': 'main:17',
  'dr-dy-patil-vidyapeeth-online': 'main:53',
  'dr-mgr-educational-research-institute-online': 'main:84',
  'dy-patil-university-online': 'main:54',
  'galgotias-university-online': 'main:117',
  'ganpat-university-online': 'add:1',
  'gla-university-online': 'main:112',
  'gls-university-online': 'main:21',
  'graphic-era-university-online': 'main:120',
  'gujarat-technological-university-online': 'main:20',
  'gujarat-university-online': 'main:15',
  'guru-ghasidas-vishwavidyalaya-online': 'main:6',
  'guru-gobind-singh-indraprastha-university-online': 'main:13',
  'guru-jambheshwar-university-online': 'main:23',
  'guru-kashi-university-online': 'main:69',
  'guru-nanak-dev-university-online': 'main:68',
  'hindustan-institute-technology-online': 'main:95',
  'icfai-university-online': 'main:102',
  'ignou-online': null,
  'iift-online': 'main:14',
  'iiit-bangalore-online': 'main:103',
  'integral-university-online': 'main:111',
  'jagannath-university-online': 'add:11',
  'jain-university-online': 'main:33',
  'jaipur-national-university-online': 'main:76',
  'jamia-hamdard-online': 'main:9',
  'jamia-millia-islamia-online': 'main:10',
  'jawaharlal-nehru-university-online': 'main:11',
  'jaypee-university-online': 'add:17',
  'jss-university-online': 'main:34',
  'kalasalingam-university-online': 'main:89',
  'kalinga-institute-industrial-technology-online': 'main:63',
  'karnataka-state-open-university-online': 'main:41',
  'karunya-university-online': 'main:96',
  'kiit-university-online': 'main:63',
  'kl-university-online': 'main:1',
  'kurukshetra-university-online': 'main:24',
  'lovely-professional-university-online': 'main:67',
  'madurai-kamaraj-university-online': 'main:83',
  'maharishi-markandeshwar-university-online': 'main:26',
  'maharshi-dayanand-university-online': 'main:25',
  'mahatma-gandhi-university-online': 'main:48',
  'mahatma-jyotiba-phule-rohilkhand-university-online': 'main:118',
  'manav-rachna-online': ['main:27', 'add:5'],
  'mangalayatan-university-online': 'main:110',
  'manipal-academy-higher-education-online': 'main:35',
  'manipal-university-jaipur-online': 'main:71',
  'manonmaniam-sundaranar-university-online': 'main:94',
  'marwadi-university-online': 'main:19',
  'mats-university-online': 'main:7',
  'meenakshi-academy-higher-education-online': 'main:97',
  'mizoram-university-online': 'main:62',
  'mody-university-online': 'main:74',
  'nmims-online': 'main:59',
  'noida-international-university-online': 'main:115',
  'northcap-university-online': 'add:4',
  'op-jindal-global-university-online': null,
  'parul-university-online': 'main:18',
  'pp-savani-university-online': 'main:22',
  'sage-university-online': 'main:52',
  'sastra-university-online': 'main:85',
  'sathyabama-university-online': 'main:86',
  'savitribai-phule-pune-university-online': 'main:61',
  'sgt-university-online': 'main:28',
  'shanmugha-arts-science-technology-research-online': 'main:85',
  'sharda-university-online': 'main:109',
  'shiv-nadar-university-online': null,
  'shivaji-university-online': 'main:60',
  'shobhit-university-online': null,
  'shoolini-university-online': 'main:29',
  'shree-guru-gobind-singh-tricentenary-university-online': 'main:28',
  'sikkim-manipal-university-online': 'main:77',
  'sri-ramachandra-university-online': 'main:100',
  'srm-institute-science-technology-online': 'main:87',
  'srm-university-sikkim-online': 'main:78',
  'subharti-university-online': 'add:16',
  'symbiosis-university-online': 'main:55',
  'teerthanker-mahaveer-university-online': 'add:15',
  'university-of-jammu-online': 'main:31',
  'university-of-kerala-online': 'main:50',
  'university-of-lucknow-online': 'main:114',
  'university-of-madras-online': 'main:88',
  'university-of-mumbai-online': 'main:58',
  'university-of-mysore-online': 'main:38',
  'upes-online': 'main:122',
  'uttaranchal-university-online': 'main:123',
  'vels-university-online': 'main:99',
  'vignan-university-online': 'main:2',
  'vit-university-online': 'main:93',
  'vit-vellore-online': 'main:93',
  'vivekananda-global-university-online': 'main:72',
  'vtu-online': 'main:40',
  'yenepoya-university-online': 'main:39',
}

// ------------------------------------------------- UGC programme -> site code
const PROGRAM_RULES: [RegExp, string][] = [
  [/^MASTER OF BUSINESS ADMINISTRATION/i, 'MBA'],
  [/^MASTER OF COMPUTER APPLICATION/i, 'MCA'],
  [/^BACHELOR OF BUSINESS ADMINISTRATION/i, 'BBA'],
  [/^BACHELOR OF COMPUTER APPLICATION/i, 'BCA'],
  [/^MASTER OF COMMERCE/i, 'M.Com'],
  [/^BACHELOR OF COMMERCE/i, 'B.Com'],
  [/^MASTER OF ARTS/i, 'MA'],
  [/^BACHELOR OF ARTS/i, 'BA'],
  [/^MASTER OF SCIENCE/i, 'MSc'],
  [/^BACHELOR OF SCIENCE/i, 'BSc'],
]
const toCode = (p: string) => {
  const s = p.replace(/^\s+/, '')
  for (const [re, code] of PROGRAM_RULES) if (re.test(s)) return code
  return null
}
// The site models MBA (WX) as a delivery variant of the MBA, not a separate degree.
const siteCode = (p: string) => (p === 'MBA (WX)' ? 'MBA' : p)

// ------------------------------------------------------------------ reconcile
const rows = UNIVERSITIES.map(u => {
  const raw = MAP[u.id]
  const keys = raw == null ? [] : Array.isArray(raw) ? raw : [raw]
  const hits = keys.map(k => byKey.get(k)!).filter(Boolean)
  const entitled = new Set<string>()
  hits.forEach(h => h.programmes.forEach(p => { const c = toCode(p); if (c) entitled.add(c) }))

  const offered = [...new Set(u.programs.map(siteCode))]
  const unbacked = offered.filter(p => !entitled.has(p))
  const notOffered = [...entitled].filter(p => !offered.includes(p))

  return {
    id: u.id,
    name: u.name,
    state: u.state,
    listed: hits.length > 0,
    sources: hits.map(h => h.src + ' #' + h.sno),
    ugcName: hits.map(h => h.hei).join(' | '),
    ugcProgrammeCount: hits.reduce((a, h) => a + h.programmes.length, 0),
    entitled: [...entitled].sort(),
    offered: offered.sort(),
    unbacked: unbacked.sort(),
    notOffered: notOffered.sort(),
    siteClaimsUgcDeb: u.ugc === true || u.approvals.some(a => /UGC[\s-]?DEB/i.test(a)),
  }
})

const claimedKeys = new Set(rows.flatMap(r => (Array.isArray(MAP[r.id]) ? MAP[r.id] as string[] : MAP[r.id] ? [MAP[r.id] as string] : [])))
const notOnSite = ugc.filter(r => !claimedKeys.has(r.key))

// site records that resolve to the same UGC row = probable duplicate university records
const dupes = new Map<string, string[]>()
rows.filter(r => r.listed).forEach(r => {
  const k = r.sources.join(',')
  dupes.set(k, (dupes.get(k) || []).concat(r.id))
})

const report = {
  generated: new Date().toISOString().slice(0, 10),
  ugcRows: ugc.length,
  siteUniversities: rows.length,
  listed: rows.filter(r => r.listed).length,
  notListed: rows.filter(r => !r.listed),
  withUnbackedProgrammes: rows.filter(r => r.listed && r.unbacked.length),
  duplicateSiteRecords: [...dupes.entries()].filter(([, v]) => v.length > 1).map(([k, v]) => ({ ugcRow: k, siteIds: v })),
  onListNotOnSite: notOnSite.map(r => ({ src: r.src, sno: r.sno, state: r.state, type: r.type, hei: r.hei, programmes: r.programmes })),
  rows,
}

fs.writeFileSync(path.join(DIR, 'reconciliation.json'), JSON.stringify(report, null, 1))

const csvEsc = (s: any) => '"' + String(s ?? '').replace(/"/g, '""') + '"'
fs.writeFileSync(
  path.join(DIR, 'university-status.csv'),
  ['id,name,state,on_new_list,ugc_source,ugc_name,offered,ugc_entitled,unbacked,site_claims_ugc_deb']
    .concat(rows.map(r => [r.id, r.name, r.state, r.listed ? 'YES' : 'NO', r.sources.join(' + '), r.ugcName, r.offered.join(' '), r.entitled.join(' '), r.unbacked.join(' '), r.siteClaimsUgcDeb ? 'YES' : 'NO'].map(csvEsc).join(',')))
    .join('\n')
)
fs.writeFileSync(
  path.join(DIR, 'programme-gaps.csv'),
  ['id,name,programme,hub_url,status']
    .concat(rows.filter(r => r.listed).flatMap(r =>
      r.unbacked.map(p => [r.id, r.name, p, '/universities/' + r.id + '/' + p.toLowerCase().replace(/\./g, ''), 'NOT_IN_UGC_LIST'].map(csvEsc).join(','))
    ))
    .join('\n')
)

console.log('UGC rows            :', ugc.length)
console.log('site universities   :', rows.length)
console.log('on the new list     :', report.listed)
console.log('NOT on the new list :', report.notListed.length)
report.notListed.forEach(r => console.log('   -', r.id, '|', r.name))
console.log('duplicate site recs :', report.duplicateSiteRecords.length)
report.duplicateSiteRecords.forEach(d => console.log('   -', d.ugcRow, '->', d.siteIds.join(' , ')))
console.log('unbacked programmes :', report.withUnbackedProgrammes.reduce((a, r) => a + r.unbacked.length, 0), 'across', report.withUnbackedProgrammes.length, 'universities')
console.log('on list, not on site:', report.onListNotOnSite.length)
report.onListNotOnSite.forEach(r => console.log('   +', r.src, '#' + r.sno, '|', r.state, '|', r.hei, '(' + r.programmes.length + ' programmes)'))
