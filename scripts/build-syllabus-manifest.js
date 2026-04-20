/**
 * build-syllabus-manifest.js
 * Parses Syallbus of Universities (3).xlsx → lib/data/syllabus-manifest.json
 *
 * Output structure:
 *   { [uniSlug]: { [program]: { _core: {semesters}, [specSlug]: {semesters, fees, websiteUrl, highlights} } } }
 *
 * Run: node scripts/build-syllabus-manifest.js
 */

const XLSX = require('xlsx')
const fs   = require('fs')
const path = require('path')

const XLSX_PATH = 'C:/Users/91706/Downloads/Syallbus of Universities  (3).xlsx'
const OUT_PATH  = path.resolve(__dirname, '../lib/data/syllabus-manifest.json')
const UNMAPPED_PATH = path.resolve(__dirname, 'unmapped-syllabus-unis.md')

// ── Name → slug mapping ───────────────────────────────────────────────────────

const UNI_NAME_TO_SLUG = {
  // MBA + shared
  'AMET University':                                                  'amet-university-online',
  'ARKA JAIN University \u2013 JGI Online':                          'arka-jain-university-online',
  'Alliance University':                                              'alliance-university-online',
  'Amity University Online':                                          'amity-university-online',
  'Amity University':                                                 'amity-university-online',
  'Amrita Vishwa Vidyapeetham':                                       'amrita-vishwa-vidyapeetham-online',
  'Assam Don Bosco University \u2013 CDOE':                           'assam-don-bosco-university-online',
  'Bharati Vidyapeeth \u2013 Online (BVP)':                          'bharati-vidyapeeth-university-online',
  'Bharati Vidyapeeth':                                               'bharati-vidyapeeth-university-online',
  'Birla Institute of Technology Mesra':                              'bits-pilani-work-integrated-online',
  'Chandigarh University \u2014 cuonlineedu.in':                      'chandigarh-university-online',
  'Chitkara University \u2013 Centre for Distance and Online Education': 'chitkara-university-online',
  'Dayananda Sagar University Online':                                'dayananda-sagar-university-online',
  'Dayananda Sagar University':                                       'dayananda-sagar-university-online',
  'Dr. D.Y. Patil Vidyapeeth, Pune \u2013 Centre for Online Learning': 'dr-dy-patil-vidyapeeth-online',
  'Dr. MGR Educational and Research Institute \u2013 Online':         'dr-mgr-educational-research-institute-online',
  'Galgotias University \u2013 Online':                               'galgotias-university-online',
  'ICFAI Foundation for Higher Education':                            'icfai-university-online',
  'Indian Institute of Foreign Trade':                                'iift-online',
  'Integral University':                                              'integral-university-online',
  'JAIN \u2013 JAIN Online':                                          'jain-university-online',
  'Jain (Deemed-to-be University)':                                   'jain-university-online',
  'Jaypee Institute of Information Technology \u2013 Online':         'jaypee-university-online',
  'Kurukshetra University \u2013 Online':                             'kurukshetra-university-online',
  'Lovely Professional University \u2014 lpuonline.com':              'lovely-professional-university-online',
  'Manipal Academy of Higher Education (MAHE)':                       'manipal-academy-higher-education-online',
  'Manipal University Jaipur':                                        'manipal-university-jaipur-online',
  'NMIMS':                                                            'nmims-online',
  'Noida International University \u2013 Online':                     'noida-international-university-online',
  'Sharda University':                                                'sharda-university-online',
  'Shoolini University \u2013 Shoolini Online':                       'shoolini-university-online',
  'Shoolini University of Biotechnology and Management Sciences':      'shoolini-university-online',
  'Sikkim Manipal University':                                        'sikkim-manipal-university-online',
  'Sikkim Manipal University ':                                       'sikkim-manipal-university-online',
  'Symbiosis School for Online and Digital Learning, Pune':           'symbiosis-university-online',
  'UPES Online':                                                      'upes-online',
  'Uttaranchal University \u2013 UU Doon Online':                     'uttaranchal-university-online',
  "Vignan's Foundation for Science, Technology & Research \u2013 Vignan Online": 'vignan-university-online',
  // MCA-specific
  'Koneru Lakshmaiah Education Foundation':                           'kl-university-online',
  'Vellore Institute of Technology':                                  'vit-vellore-online',
  'Hindustan Institute of Technology and Science (HITS)':             'hindustan-institute-technology-online',
  'S.R.M. Institute of Sciences and Technology':                      'srm-institute-science-technology-online',
  'Shanmugha Arts, Science, Technology & Research Academy':           'sastra-university-online',
  'Visveswaraya Technological University':                            'visvesvaraya-technological-university-online',
  'University of Petroleum and Energy':                               'upes-online',
  'Vivekananda Global University':                                    'vivekananda-global-university-online',
  'Shri Ramasamy Memorial University':                                'shri-ramasamy-memorial-university-online',
  'Shree Guru Gobind Singh Tricentenary University':                  'shree-guru-gobind-singh-tricentenary-university-online',
  'Mangalayatan University':                                          'mangalayatan-university-online',
  'Mody University of Science and Technology':                        'mody-university-online',
  'Marwadi University':                                               'marwadi-university-online',
  'Jaipur National University':                                       'jaipur-national-university-online',
  'Manav Rachna International Institute of Research and Studies':      'manav-rachna-online',
  'Savitribai Phule Pune University':                                 'savitribai-phule-pune-university-online',
  'Desh Bhagat University':                                           'desh-bhagat-university-online',
  'Centurion University of Technology and Management':                'centurion-university-online',
  'Charotar University of Science & Technology':                      'charusat-university-online',
  'Christ (Deemed to be University)':                                 'christ-university-online',
  'Datta Meghe Institute of Higher Education and Research':           'datta-meghe-university-online',
  'G.L.A. University':                                               'gla-university-online',
  'University of Mysore':                                             'university-of-mysore-online',
  'Guru Nanak Dev University':                                        'guru-nanak-dev-university-online',
  'B.S. Abdur Rahman Institute of Science and Technology':            'bs-abdur-rahman-university-online',
  // MCA variant names
  "Vignan's Foundation for Science, Technology and Research":         'vignan-university-online',
  'Assam Don Bosco University':                                       'assam-don-bosco-university-online',
  'Assam Down Town University':                                       'assam-down-town-university-online',
  'Parul University':                                                 'parul-university-online',
  'Manipal Academy of Higher Education':                              'manipal-academy-higher-education-online',
  'Yenepoya University':                                              'yenepoya-university-online',
  'Dr. D.Y. Patil Vidyapeeth (Pune)':                                'dr-dy-patil-vidyapeeth-online',
  'Chandigarh University':                                            'chandigarh-university-online',
  'Lovely Professional University':                                   'lovely-professional-university-online',
  'Guru Kashi University':                                            'guru-kashi-university-online',
  'Noida International University':                                   'noida-international-university-online',
  'Galgotias University':                                             'galgotias-university-online',
  'Shobhit Institute of Engineering & Technology':                    'shobhit-university-online',
  'Graphic Era University':                                           'graphic-era-university-online',
  'Uttaranchal University':                                           'uttaranchal-university-online',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseSubjects(cell) {
  if (!cell || typeof cell !== 'string') return []
  return cell.split(/[;|,]/)
    .map(s => s.replace(/^[•\-\s]+/, '').trim())
    .filter(s => s.length > 2)
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

// ── Load workbook ─────────────────────────────────────────────────────────────

const wb = XLSX.readFile(XLSX_PATH)
const manifest = {}
const unmapped = []

function processSheet(sheetName, programKey) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 })
    .slice(1)
    .filter(r => r[0] && r[2]) // must have uni name + spec

  // Group by university
  const uniGroups = {}
  rows.forEach(r => {
    const rawName = String(r[0]).trim()
    const slug    = UNI_NAME_TO_SLUG[rawName]
    if (!slug) {
      if (!unmapped.find(u => u.name === rawName)) {
        unmapped.push({ name: rawName, program: programKey })
      }
      return
    }
    if (!uniGroups[slug]) uniGroups[slug] = []
    uniGroups[slug].push({
      specRaw:    String(r[2] || '').trim().replace(/\n/g, '').trim(),
      sem1:       parseSubjects(r[3]),
      sem2:       parseSubjects(r[4]),
      sem3:       parseSubjects(r[5]),
      sem4:       parseSubjects(r[6]),
      websiteUrl: String(r[7] || '').trim(),
      fees:       String(r[8] || '').trim(),
      highlights: String(r[9] || '').trim(),
    })
  })

  // Build manifest entries
  Object.entries(uniGroups).forEach(([slug, specs]) => {
    if (!manifest[slug]) manifest[slug] = {}

    // Detect core semesters (identical across all specs)
    const coreSemesters = []
    ;[1, 2, 3, 4].forEach(sem => {
      const semKey = `sem${sem}`
      const allSubjects = specs.map(s => s[semKey])
      const allNonEmpty = allSubjects.filter(a => a.length > 0)
      if (allNonEmpty.length === 0) return
      // Check if all specs share identical subjects for this sem
      const first = allNonEmpty[0]
      const isCore = allNonEmpty.every(a => arraysEqual(a, first))
      if (isCore) {
        coreSemesters.push({ sem, subjects: first })
      }
    })

    const progEntry = {}

    // _core (only if at least sem1 is shared)
    if (coreSemesters.length > 0) {
      progEntry._core = { semesters: coreSemesters }
    }

    // Per-spec entries
    specs.forEach(spec => {
      const specSlug = toSlug(spec.specRaw)
      if (!specSlug) return
      const semesters = []
      ;[1, 2, 3, 4].forEach(sem => {
        const subjects = spec[`sem${sem}`]
        if (subjects.length > 0) semesters.push({ sem, subjects })
      })
      if (semesters.length === 0) return
      progEntry[specSlug] = {
        semesters,
        ...(spec.websiteUrl ? { websiteUrl: spec.websiteUrl } : {}),
        ...(spec.fees       ? { fees: spec.fees }             : {}),
        ...(spec.highlights ? { highlights: spec.highlights } : {}),
      }
    })

    manifest[slug][programKey] = progEntry
  })
}

// ── Process MBA and MCA sheets ────────────────────────────────────────────────

processSheet('MBA', 'mba')
processSheet('MCA', 'mca')

// ── Inject IGNOU (fetched manually — not in xlsx) ────────────────────────────
// Source: https://www.ignou.ac.in/ — MBAOL + MCAOL flagship online programmes

manifest['ignou-online'] = {
  mba: {
    _core: {
      semesters: [
        { sem: 1, subjects: ['Management Functions and Organisational Processes','Human Resource Management','Business Environment','Accounting for Managers','Quantitative Analysis for Managerial Applications','Marketing Management','Business Communication'] },
        { sem: 2, subjects: ['Information Systems for Managers','Management of Machines and Materials','Managerial Economics','Social Processes and Behavioural Issues','Strategic Management','Business Laws','Financial Management'] },
        { sem: 3, subjects: ['Research Methodology for Management Decisions','International Business Management','Project Course'] },
        { sem: 4, subjects: ['Advanced Strategic Management','Entrepreneurship','Total Quality Management','Business Ethics and CSR'] },
      ],
    },
    general: {
      semesters: [
        { sem: 1, subjects: ['Management Functions and Organisational Processes','Human Resource Management','Business Environment','Accounting for Managers','Quantitative Analysis for Managerial Applications','Marketing Management','Business Communication'] },
        { sem: 2, subjects: ['Information Systems for Managers','Management of Machines and Materials','Managerial Economics','Social Processes and Behavioural Issues','Strategic Management','Business Laws','Financial Management'] },
        { sem: 3, subjects: ['Research Methodology for Management Decisions','International Business Management','Project Course'] },
        { sem: 4, subjects: ['Advanced Strategic Management','Entrepreneurship','Total Quality Management','Business Ethics and CSR'] },
      ],
    },
  },
  mca: {
    _core: {
      semesters: [
        { sem: 1, subjects: ['Design and Analysis of Algorithms','Discrete Mathematics','Software Engineering','Professional Skills and Ethics','Security and Cyber Laws','DAA and Web Design Lab','Software Engineering Lab'] },
        { sem: 2, subjects: ['Data Communication and Computer Networks','Object Oriented Analysis and Design','Web Technologies','Data Warehousing and Data Mining','OOAD and Web Technologies Lab','Computer Networks and Data Mining Lab'] },
        { sem: 3, subjects: ['Artificial Intelligence and Machine Learning','Accountancy and Financial Management','Data Science and Big Data','Cloud Computing and IoT','AI and Machine Learning Lab','Cloud and Data Science Lab'] },
        { sem: 4, subjects: ['Digital Image Processing and Computer Vision','Mobile Computing','Project'] },
      ],
    },
    general: {
      semesters: [
        { sem: 1, subjects: ['Design and Analysis of Algorithms','Discrete Mathematics','Software Engineering','Professional Skills and Ethics','Security and Cyber Laws','DAA and Web Design Lab','Software Engineering Lab'] },
        { sem: 2, subjects: ['Data Communication and Computer Networks','Object Oriented Analysis and Design','Web Technologies','Data Warehousing and Data Mining','OOAD and Web Technologies Lab','Computer Networks and Data Mining Lab'] },
        { sem: 3, subjects: ['Artificial Intelligence and Machine Learning','Accountancy and Financial Management','Data Science and Big Data','Cloud Computing and IoT','AI and Machine Learning Lab','Cloud and Data Science Lab'] },
        { sem: 4, subjects: ['Digital Image Processing and Computer Vision','Mobile Computing','Project'] },
      ],
    },
  },
}
console.log('Injected: ignou-online (MBA + MCA from official website)')

// ── Write outputs ─────────────────────────────────────────────────────────────

fs.writeFileSync(OUT_PATH, JSON.stringify(manifest, null, 2), 'utf8')
console.log(`\nManifest written to: ${OUT_PATH}`)

// Console stats
const uniCount = Object.keys(manifest).length
let specCount  = 0, coreCount = 0
Object.values(manifest).forEach(u => {
  Object.values(u).forEach(prog => {
    if (prog._core) coreCount++
    Object.keys(prog).filter(k => k !== '_core').forEach(() => specCount++)
  })
})
console.log(`Universities: ${uniCount}`)
console.log(`Program entries with _core: ${coreCount}`)
console.log(`Total spec entries: ${specCount}`)
console.log(`Unmapped universities: ${unmapped.length}`)

// Write unmapped
let unmappedMd = `# Unmapped Syllabus Universities\n_These were skipped — add to UNI_NAME_TO_SLUG in build-syllabus-manifest.js_\n\n`
unmappedMd += `| Raw Name | Program |\n|---|---|\n`
unmapped.forEach(u => { unmappedMd += `| ${u.name} | ${u.program.toUpperCase()} |\n` })
fs.writeFileSync(UNMAPPED_PATH, unmappedMd, 'utf8')
console.log(`Unmapped written to: ${UNMAPPED_PATH}`)

// Per-uni breakdown for priority MBAs
const PRIORITY = [
  'amity-university-online','jain-university-online','chandigarh-university-online',
  'manipal-university-jaipur-online','sikkim-manipal-university-online','nmims-online',
  'lovely-professional-university-online','upes-online','shoolini-university-online',
  'galgotias-university-online','symbiosis-university-online','arka-jain-university-online',
]
console.log('\nPriority MBA coverage:')
PRIORITY.forEach(slug => {
  const prog = manifest[slug]?.mba
  if (!prog) { console.log(`  ${slug}: NOT IN MANIFEST`); return }
  const specs = Object.keys(prog).filter(k => k !== '_core')
  const core  = prog._core ? `core(${prog._core.semesters.map(s=>s.sem).join(',')})` : 'no-core'
  console.log(`  ${slug}: ${core}, ${specs.length} specs [${specs.slice(0,4).join(', ')}${specs.length>4?'...':''}]`)
})
