// scripts/audit-json-faqs.mjs
// Sprint 1 FIX 6b. Scans every lib/data/page-content/*.json for a faqs
// array and pattern-matches for the same UNBACKED claim categories the
// hub FAQ was scrubbed for. Report only, no edits.
import fs from 'node:fs'
import path from 'node:path'

const DIR = 'lib/data/page-content'
const PATTERNS = [
  { cat: 'lender-names',        re: /(Fibe|GrayQuest|Techfino|Avanse|Bajaj Finserv|Propelld|Eduvanz|Auxilo|InCred)/i },
  { cat: 'weekend/attendance',  re: /(weekend session|weekend live|no mandatory (attendance|campus|classroom)|recorded (lecture|session)s? (available|24)|24\/7|self-paced)/i },
  { cat: 'placement-promise',   re: /(placement (guaranteed|assist|support|cell|team|cell provides|team provides)|100% placement|guaranteed job|mock interview|resume building|resume review|job portal|alumni network|career workshop)/i },
  { cat: 'live-classes-claim',  re: /(live (interactive|weekend|online) (session|class)|two-way live|instructor-led live)/i },
  { cat: 'exam-mode-verbose',   re: /(no mandatory (campus visit|exam centre)|open book exam|proctored (online )?exam)/i },
  { cat: 'emi-tenure-details',  re: /(no[- ]cost EMI|EMI (starting|starts) (from|at) .+ (months?|month tenure)|3\/6\/9\/12|12[/, ]24|EMI plan(s)? (across|for|of) [0-9])/i },
  { cat: 'private-sector-valid',re: /(private sector (jobs|employment)|corporate hiring)/i },
]

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'))
const findings = []

for (const file of files) {
  const raw = fs.readFileSync(path.join(DIR, file), 'utf-8')
  let j
  try { j = JSON.parse(raw) } catch { continue }
  const faqs = j?.sections?.faqs
  if (!Array.isArray(faqs) || faqs.length === 0) continue
  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i]
    const answer = String(f?.answer || '')
    if (!answer) continue
    for (const { cat, re } of PATTERNS) {
      const m = answer.match(re)
      if (m) {
        findings.push({
          file,
          faqIndex: i + 1,
          category: cat,
          match: m[0],
          question: String(f?.question || '').slice(0, 70),
        })
      }
    }
  }
}

console.log(`Scanned ${files.length} JSON files.`)
const jsonsWithFaqs = new Set(findings.map(f => f.file))
console.log(`JSON files with FAQs containing unbacked claims: ${jsonsWithFaqs.size}`)
console.log(`Total unbacked-claim hits: ${findings.length}\n`)

// group by category
const byCat = {}
for (const f of findings) {
  byCat[f.category] = byCat[f.category] || []
  byCat[f.category].push(f)
}
for (const cat of Object.keys(byCat).sort()) {
  console.log(`\n[${cat}] ${byCat[cat].length} hits`)
  for (const f of byCat[cat].slice(0, 6)) {
    console.log(`  ${f.file}  Q${f.faqIndex}  ${JSON.stringify(f.match)}`)
  }
  if (byCat[cat].length > 6) console.log(`  ... and ${byCat[cat].length - 6} more`)
}
