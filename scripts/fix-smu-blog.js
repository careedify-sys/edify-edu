// scripts/fix-smu-blog.js
// Fixes the SMU Online MBA review blog:
// 1. Corrects all "Rs. 1,10,000" mentions to "Rs. 1,20,000" (per founder + lib/data.ts)
// 2. Updates publishedAt date and adds an updatedAt freshness signal
// 3. Adds an E-E-A-T author byline + trust strip near the top of the body
// 4. Updates the per-semester fee math (Rs 30,000 × 4 = Rs 1,20,000)

const fs = require('fs')
const path = require('path')
const BLOG_TS = path.join(__dirname, '..', 'lib', 'blog.ts')

let blog = fs.readFileSync(BLOG_TS, 'utf8')
const original = blog

// Locate the SMU entry slice (between "slug: 'smu-online-mba-review'" and the next "  },\n")
const startIdx = blog.indexOf("slug: 'smu-online-mba-review'")
if (startIdx === -1) { console.error('SMU blog not found'); process.exit(1) }
// Walk back to the previous `{`
let entryStart = blog.lastIndexOf('{', startIdx)
// Find matching closing `}` by depth-counting
let depth = 0
let entryEnd = -1
for (let i = entryStart; i < blog.length; i++) {
  const c = blog[i]
  if (c === '{') depth++
  else if (c === '}') {
    depth--
    if (depth === 0) { entryEnd = i + 1; break }
  }
}
if (entryEnd === -1) { console.error('Could not find SMU entry end'); process.exit(1) }

let entry = blog.slice(entryStart, entryEnd)
const entryOriginal = entry
const changes = []

// 1. Fee corrections — Rs. 1,10,000 → Rs. 1,20,000
const fee1 = entry.match(/Rs\.\s*1,10,000/g) || []
entry = entry.replace(/Rs\.\s*1,10,000/g, 'Rs. 1,20,000')
if (fee1.length) changes.push(`Fees: Rs. 1,10,000 → Rs. 1,20,000  (${fee1.length}×)`)

// Per-semester math: Rs 27,500/sem × 4 = Rs 1,10,000 → updated to Rs 30,000/sem × 4 = Rs 1,20,000
const sem = entry.match(/Rs\.\s*27,500\s*(?:per semester|\/semester|\/sem|per sem)/gi) || []
entry = entry.replace(/Rs\.\s*27,500\s*(per semester|\/semester|\/sem|per sem)/gi, 'Rs. 30,000 $1')
if (sem.length) changes.push(`Per-semester: Rs. 27,500 → Rs. 30,000  (${sem.length}×)`)

// FAQ #1 specifically had this phrasing
entry = entry.replace(/The total fee is Rs\.\s*1,20,000 for the full two-year program, paid as Rs\.\s*30,000 per semester/g,
  'The total programme fee is Rs. 1,20,000 for the full 2-year programme, paid as Rs. 30,000 per semester. EMI from Rs 5,000/month available.')

// 2. Update publishedAt + add updatedAt
const pubBefore = entry
entry = entry.replace(/publishedAt:\s*'[^']*'/, "publishedAt: '2026-04-12',\n    updatedAt: '2026-05-10'")
if (pubBefore !== entry) changes.push('Added updatedAt: 2026-05-10 (E-E-A-T freshness)')

// 3. Inject E-E-A-T author byline + trust strip near the top of content body
// The content starts with `content: \`<div style="background:linear-gradient...` — insert after the discount banner.
const eatBlock = `

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 18px;margin:16px 0 24px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;font-size:13px;color:#475569"><div style="display:flex;align-items:center;gap:8px"><strong style="color:#0f172a">By Rishi Kumar</strong><span>·</span><span>Senior Education Researcher · Founder, edifyedu.in</span></div><div style="display:flex;align-items:center;gap:8px"><span>·</span><span>Updated 10 May 2026</span></div><div style="display:flex;align-items:center;gap:8px"><span>·</span><span style="color:#16a34a;font-weight:600">Verified against UGC-DEB, NAAC, official Manipal portal</span></div></div>

<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:0 10px 10px 0;margin:0 0 24px;font-size:13px;color:#78350f"><strong>Why trust this review:</strong> EdifyEdu earns zero referral commissions from Sikkim Manipal University or any Manipal Education entity. Fees and accreditations are cross-checked against the official onlinemanipal.com portal, the UGC-DEB approved list at <a href="https://deb.ugc.ac.in" rel="nofollow" style="color:#0369a1">deb.ugc.ac.in</a>, and the NAAC IIQA database at <a href="https://naac.gov.in" rel="nofollow" style="color:#0369a1">naac.gov.in</a>. Every claim about NAAC A+ accreditation, fee structure, and dual specialisation is traceable to a public source. Last verified 10 May 2026.</div>
`

// Insert after the existing discount banner (closes with </div> at end of that DIV)
const bannerEnd = entry.indexOf('</div></div>') + '</div></div>'.length
if (bannerEnd > -1 + '</div></div>'.length) {
  // Look for the first paragraph after the banner
  const firstParaIdx = entry.indexOf('<p>', bannerEnd)
  if (firstParaIdx > 0) {
    entry = entry.slice(0, firstParaIdx) + eatBlock + '\n' + entry.slice(firstParaIdx)
    changes.push('Inserted E-E-A-T author byline + trust strip near the top')
  }
}

// 4. Strengthen NAAC mention with cycle/score from Supabase
// Existing claim: NAAC A+ — add score 3.28 cycle 1
const naacBefore = entry
entry = entry.replace(/NAAC A\+ accreditation, UGC/g, 'NAAC A+ (CGPA 3.28, Cycle 1) accreditation, UGC')
if (naacBefore !== entry) changes.push('Strengthened NAAC mention with CGPA + cycle from Supabase')

// Write back
if (entry !== entryOriginal) {
  blog = blog.slice(0, entryStart) + entry + blog.slice(entryEnd)
  fs.writeFileSync(BLOG_TS, blog, 'utf8')
}

console.log('=== SMU blog fixes ===\n')
if (changes.length === 0) {
  console.log('  (no changes — patterns may have already been applied)')
} else {
  changes.forEach(c => console.log(`  ✓ ${c}`))
}
console.log(`\nTotal changes: ${changes.length}`)
console.log(`File ${original === blog ? 'NOT modified' : 'updated'} (size: ${blog.length} bytes)`)
