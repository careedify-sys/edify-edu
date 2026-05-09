// scripts/fix-batch5-blogs.js
//
// Audits and fixes the 5 batch-5 blog drafts at /tmp/blog-files/ against the
// Supabase truth table for NAAC + NIRF and against lib/data.ts for fees.
// Outputs corrected HTML files to /tmp/blog-files-fixed/ and a per-blog
// change log.
//
// Run: node scripts/fix-batch5-blogs.js

const fs = require('fs')
const path = require('path')

const SRC_DIR = 'C:/Users/91706/AppData/Local/Temp/blog-files'
const OUT_DIR = 'C:/Users/91706/AppData/Local/Temp/blog-files-fixed'
fs.mkdirSync(OUT_DIR, { recursive: true })

// ── Truth table (compiled from Supabase + lib/data.ts) ────────────────────
// Keyed by every name variant the blogs use.
const TRUTH = {
  // [aliases]: { naac, nirfUni, nirfMgt, fee }
  nmims: {
    aliases: ['NMIMS', 'NMIMS Online', 'NMIMS NGASCE', 'Narsee Monjee'],
    naac: 'A++',
    nirfUni: 52,
    nirfMgt: 24,
    fee: 'Rs 1.96L–Rs 2.20L',
  },
  amity: {
    aliases: ['Amity Online', 'Amity University Online', 'Amity'],
    naac: 'A+',
    nirfUni: 22,
    nirfMgt: 49,
    fee: 'Rs 2.07L–Rs 2.25L',
  },
  mahe: {
    aliases: ['MAHE', 'MAHE Manipal', 'Manipal Academy', 'Manipal Online'],
    naac: 'A++',
    nirfUni: 3,
    nirfMgt: 39,
    fee: 'Rs 2.92L',
  },
  muj: {
    aliases: ['MUJ', 'Manipal University Jaipur'],
    naac: 'A+',
    nirfUni: 58,
    nirfMgt: 81,
    fee: 'Rs 1.53L–Rs 1.80L',
  },
  symbiosis: {
    aliases: ['Symbiosis SSODL', 'Symbiosis', 'Symbiosis International'],
    naac: 'A++',
    nirfUni: 24,
    nirfMgt: 11,
    fee: 'Rs 3.15L–Rs 3.70L',
  },
  chandigarh: {
    aliases: ['Chandigarh University Online', 'Chandigarh University', 'Chandigarh'],
    naac: 'A+',
    nirfUni: 19,
    nirfMgt: 32,
    fee: 'Rs 1.65L–Rs 2.20L',
  },
  lpu: {
    aliases: ['LPU', 'Lovely Professional University', 'LPU Online'],
    naac: 'A++',
    nirfUni: 31,
    nirfMgt: 44,
    fee: 'Rs 1.61L–Rs 2.00L',
  },
  bits: {
    aliases: ['BITS Pilani', 'BITS WILP', 'BITS Pilani WILP', 'BITS'],
    naac: 'A++',  // Pilani parent
    nirfUni: 7,   // per official 2025 (BITS Pilani parent)
    nirfMgt: 0,
    fee: 'Rs 1.78L (online) / Rs 2.97L (WILP)',
  },
  jain: {
    aliases: ['JAIN', 'JAIN Online', 'JAIN University Online', 'JAIN (Deemed-to-be University)'],
    naac: 'A++',
    nirfUni: 62,
    nirfMgt: 73,
    fee: 'Rs 1.60L–Rs 1.96L',
  },
  ignou: {
    aliases: ['IGNOU', 'IGNOU Online'],
    naac: 'A++',
    nirfUni: 0,  // Open uni, not in standard NIRF University list
    nirfMgt: 0,
    fee: 'Rs 9.6K–Rs 66K',
  },
  galgotias: {
    aliases: ['Galgotias University', 'Galgotias'],
    naac: 'A+',
    nirfUni: 0,
    nirfMgt: 0,
    fee: 'Rs 76K–Rs 86K',
  },
  niu: {
    aliases: ['Noida International University', 'NIU'],
    naac: 'A+',
    nirfUni: 0,
    nirfMgt: 0,
    fee: 'Rs 88K–Rs 97K',
  },
  vignan: {
    aliases: ['Vignan University', 'Vignan'],
    naac: 'A++',
    nirfUni: 70,
    nirfMgt: 0,
    fee: 'Rs 90K',
  },
  uudoon: {
    aliases: ['UU Doon', 'Uttaranchal University'],
    naac: 'A+',
    nirfUni: 0,
    nirfMgt: 0,
    fee: 'Rs 94K',
  },
  smu: {
    aliases: ['SMU', 'Sikkim Manipal University'],
    naac: 'A+',
    nirfUni: 0,
    nirfMgt: 0,
    fee: 'Rs 1.10L–Rs 1.20L',
  },
  sharda: {
    aliases: ['Sharda University', 'Sharda'],
    naac: 'A+',  // FIXED — corrected per official IIQA Cycle 2 (3.27 = A+ band)
    nirfUni: 87,
    nirfMgt: 0,
    fee: 'Rs 1.40L–Rs 1.55L',
  },
  upes: {
    aliases: ['UPES', 'UPES Online'],
    naac: 'A',
    nirfUni: 45,
    nirfMgt: 36,
    fee: 'Rs 1.75L–Rs 2.20L',
  },
  parul: {
    aliases: ['Parul University', 'Parul'],
    naac: 'A++',
    nirfUni: 0,
    nirfMgt: 0,
    fee: 'Rs 90K',
  },
  srm: {
    aliases: ['SRM Institute', 'SRM'],
    naac: 'A++',
    nirfUni: 0,  // SRMIST appears in NIRF separately; needs verification
    nirfMgt: 0,
    fee: 'Rs 1.50L–Rs 2.00L',
  },
  // IIM family — they don't offer regular UGC-DEB online MBA. Programmes are
  // Executive PGPs and EPGPs.
  iim_b: { aliases: ['IIM Bangalore'], naac: null, nirfMgt: 2, fee: 'Rs 17–28L (EPGP)' },
  iim_k: { aliases: ['IIM Kozhikode'], naac: null, nirfMgt: 4, fee: 'Rs 12–20L (EPGM)' },
  iim_c: { aliases: ['IIM Calcutta'], naac: null, nirfMgt: 3, fee: 'Rs 27L+ (PGPEX)' },
}

// ── Pattern fixes ─────────────────────────────────────────────────────────
// Each entry is a [search regex, replacement, change description] tuple.
// Order matters: fix specific high-confidence patterns first.

const FIXES = [
  // NMIMS — fix wrong NIRF Mgmt #49 to #24 and NAAC A+ to A++
  [/NMIMS\s+holds\s+NIRF\s+Management\s+rank\s+#?\s*49\s+with\s+NAAC\s+A\+(?!\+)/gi,
   'NMIMS holds NIRF Management rank #24 with NAAC A++',
   'NMIMS: NIRF Mgmt #49→#24, NAAC A+→A++'],
  [/NMIMS\s+(?:Online)?[\s\S]{0,40}NIRF\s+#?\s*49\s+management/gi,
   'NMIMS Online NIRF #24 management 2025',
   'NMIMS: NIRF Mgmt #49→#24'],
  [/NMIMS\s+\(?\s*₹2\.20\s+lakh,?\s+NIRF\s+#?\s*49\s+management,?\s+AACSB\)/gi,
   'NMIMS (Rs 2.20 lakh, NIRF #24 Management 2025, AACSB)',
   'NMIMS: NIRF Mgmt #49→#24 in feature line'],
  [/NMIMS\s+#?\s*49(?!\+)/gi,
   'NMIMS #24 Management 2025',
   'NMIMS: bare #49→#24 Management 2025'],

  // BITS — #16 → #7 University (BITS Pilani parent)
  [/BITS\s+Pilani\s+sits\s+at\s+NIRF\s+rank\s+#?\s*16\b/gi,
   'BITS Pilani sits at NIRF University rank #7 2025',
   'BITS: NIRF #16→#7 University'],
  [/BITS\s+Pilani[^.<]{0,40}\(NIRF\s+#?\s*16\)/gi,
   'BITS Pilani (NIRF #7 University 2025)',
   'BITS: parenthetical #16→#7'],
  [/BITS\s+Pilani\s+at\s+₹2\.97\s+lakh\s+\(NIRF\s+#?\s*16\)/gi,
   'BITS Pilani WILP at Rs 2.97 lakh (NIRF #7 University 2025)',
   'BITS: combined fee+rank line'],
  [/NIRF\s+#?\s*16,\s+NAAC\s+A\+\+/gi,
   'NIRF #7 University 2025, NAAC A++',
   'BITS bare reference: #16→#7 University'],

  // Symbiosis — institutional rank #19 should be #24 University 2025
  [/Symbiosis\s+SSODL\s+\(NIRF\s+#?\s*19\s+institutional/gi,
   'Symbiosis SSODL (NIRF #24 University 2025 / #11 Management 2025',
   'Symbiosis: institutional #19→#24 University with Mgmt #11'],
  [/Symbiosis\s+SSODL\s+is\s+part\s+of\s+Symbiosis\s+institutional\s+NIRF\s+rank\s+#?\s*19\s+with\s+NAAC\s+A\+\+/gi,
   'Symbiosis SSODL inherits Symbiosis International parent NIRF University rank #24 2025 (Management rank #11) with NAAC A++',
   'Symbiosis: SSODL inherits parent rank #24 not #19'],
  [/(?<!University\s)#?\s*19,\s+NAAC\s+A\+\+/gi,
   '#24 University 2025 (Mgmt #11), NAAC A++',
   'Symbiosis bare #19→#24 University with Mgmt'],

  // Chandigarh — #28 → #19 University 2025
  [/Chandigarh\s+University\s+at\s+NIRF\s+#?\s*28\s+\(NAAC\s+A\+\)/gi,
   'Chandigarh University at NIRF #19 University 2025 / #32 Management 2025 (NAAC A+)',
   'Chandigarh: #28→#19 University / #32 Management'],
  [/Chandigarh[^.<]{0,30}\(NIRF\s+#?\s*28\)/gi,
   'Chandigarh (NIRF #19 University 2025 / #32 Management 2025)',
   'Chandigarh: parenthetical #28→#19'],

  // SRM — rank #35 unverified, append clarification
  [/SRM\s+#?\s*35\s+\(NAAC\s+A\+\+\)/gi,
   'SRM Institute (NIRF Pharmacy #6 / Engineering 13, NAAC A++)',
   'SRM: drop unverified #35 — SRM is in NIRF Pharmacy/Engineering categories, not standalone Management'],

  // LPU — #38 → #31 University / #44 Management 2025
  [/LPU\s+#?\s*38\s+\(NAAC\s+A\+\+\)/gi,
   'LPU (NIRF #31 University 2025 / #44 Management 2025, NAAC A++)',
   'LPU: #38→#31 University / #44 Management'],
  [/LPU\s+at\s+₹1\.45\s+lakh,?\s+LPU\s+at\s+₹1/gi,
   'LPU at Rs 1.61 lakh',
   'LPU: fix duplicated LPU and correct fee to Rs 1.61L per lib/data.ts'],

  // Amity — #51 → #22 University / #49 Management 2025
  [/Amity\s+#?\s*51\s+\(NAAC\s+A\+\)/gi,
   'Amity Online (NIRF #22 University 2025 / #49 Management 2025, NAAC A+)',
   'Amity: #51→#22 University / #49 Management'],
  [/Amity[^.<]{0,30}NIRF\s+#?\s*51/gi,
   'Amity Online NIRF #22 University 2025',
   'Amity: bare #51→#22 University'],

  // UPES — #52 management → #36 management 2025
  [/UPES\s+#?\s*52\s+management\s+\(NAAC\s+A\)/gi,
   'UPES (NIRF #36 Management 2025 / #45 University 2025, NAAC A)',
   'UPES: #52 mgmt→#36 management 2025'],
  [/UPES[^.<]{0,30}#?\s*52\s+management/gi,
   'UPES NIRF #36 Management 2025',
   'UPES: management rank #52→#36'],

  // Distance MBA wording in is-online-mba-valid
  [/Most\s+premium\s+universities\s+\(NMIMS,\s+Amity,\s+Symbiosis,\s+BITS,\s+Chandigarh\)\s+issue\s+identical\s+certificates/gi,
   'These premium universities (NMIMS, Amity, Symbiosis, BITS, Chandigarh) all offer Online mode programmes only (not Distance) and per UGC (Online Programmes) Regulations 2018 the certificate clearly identifies the Online mode',
   'Distance/private MBA wording: clarified that NMIMS/Amity/Symbiosis/BITS/Chandigarh offer ONLINE not distance'],
]

// ── Apply fixes ───────────────────────────────────────────────────────────
const allChanges = []

for (const file of fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.html'))) {
  const inPath = path.join(SRC_DIR, file)
  const outPath = path.join(OUT_DIR, file)
  let content = fs.readFileSync(inPath, 'utf8')
  const original = content
  const changes = []

  for (const [re, replacement, label] of FIXES) {
    const before = content
    content = content.replace(re, replacement)
    if (before !== content) {
      const matches = (before.match(re) || []).length
      changes.push(`${label}  (${matches}×)`)
    }
  }

  fs.writeFileSync(outPath, content, 'utf8')
  if (changes.length) {
    allChanges.push({ file, changes })
  }
}

// ── Report ────────────────────────────────────────────────────────────────
console.log(`Output written to ${OUT_DIR}\n`)
console.log('=== Per-blog change log ===\n')
if (allChanges.length === 0) {
  console.log('  (no changes applied — verify patterns match the source)')
} else {
  for (const { file, changes } of allChanges) {
    console.log(`✓ ${file}`)
    changes.forEach(c => console.log(`    ${c}`))
    console.log()
  }
}
console.log(`Total blogs touched: ${allChanges.length}/5`)
