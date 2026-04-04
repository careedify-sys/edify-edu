'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, GraduationCap, ArrowRightLeft } from 'lucide-react'

// Percentage → 10-point CGPA (Indian scale, UGC formula reverse)
function pctToCgpa(pct: number) {
  return Math.round((pct / 9.5) * 100) / 100
}

// Percentage → 4.0 GPA (WES / common US conversion bands)
function pctToGpa4(pct: number): { gpa: number; grade: string; letter: string } {
  if (pct >= 93) return { gpa: 4.0, grade: 'A',  letter: 'A' }
  if (pct >= 90) return { gpa: 3.9, grade: 'A-', letter: 'A-' }
  if (pct >= 87) return { gpa: 3.7, grade: 'A-', letter: 'A-' }
  if (pct >= 83) return { gpa: 3.3, grade: 'B+', letter: 'B+' }
  if (pct >= 80) return { gpa: 3.0, grade: 'B',  letter: 'B' }
  if (pct >= 77) return { gpa: 2.7, grade: 'B-', letter: 'B-' }
  if (pct >= 73) return { gpa: 2.3, grade: 'C+', letter: 'C+' }
  if (pct >= 70) return { gpa: 2.0, grade: 'C',  letter: 'C' }
  if (pct >= 67) return { gpa: 1.7, grade: 'C-', letter: 'C-' }
  if (pct >= 63) return { gpa: 1.3, grade: 'D+', letter: 'D+' }
  if (pct >= 60) return { gpa: 1.0, grade: 'D',  letter: 'D' }
  return { gpa: 0.0, grade: 'F', letter: 'F' }
}

// Class classification (Indian system)
function getClass(pct: number) {
  if (pct >= 75) return 'First Class with Distinction'
  if (pct >= 60) return 'First Class'
  if (pct >= 50) return 'Second Class'
  if (pct >= 40) return 'Pass Class'
  return 'Below Pass'
}

// Conversion table rows
const TABLE_ROWS = Array.from({ length: 61 }, (_, i) => {
  const pct = 40 + i
  const cgpa = pctToCgpa(pct)
  const gpa4 = pctToGpa4(pct)
  return { pct, cgpa, gpa4: gpa4.gpa, letter: gpa4.letter }
})

const FAQS = [
  {
    q: 'How to convert percentage to GPA in India?',
    a: 'For the Indian 10-point CGPA scale: divide your percentage by 9.5. So 76% ÷ 9.5 = 8.0 CGPA. For the US 4.0 scale, use the grade band table above — 80–89% typically maps to 3.0–3.7 GPA.',
  },
  {
    q: 'What is 75% in GPA?',
    a: '75% converts to 7.89 CGPA on the Indian 10-point scale (75 ÷ 9.5 = 7.89). On the US 4.0 scale, 75% falls in the B+ range — approximately 2.7 GPA.',
  },
  {
    q: 'What is 60% in GPA?',
    a: '60% is 6.32 CGPA on the Indian 10-point scale. On a 4.0 GPA scale, 60–69% is typically in the C or C+ range (1.7–2.3 GPA), though exact mapping depends on the university.',
  },
  {
    q: 'What GPA is required for US university admissions from India?',
    a: 'Most US master\'s programs require a minimum 3.0 GPA (roughly 70%+ or 7.37 CGPA). Competitive programs expect 3.5+ (roughly 80%+). Many universities also accept WES-evaluated transcripts which provide an official conversion.',
  },
  {
    q: 'Is the percentage to GPA conversion the same for all Indian universities?',
    a: 'The 10-point CGPA formula (divide by 9.5) is recommended by UGC and used by most Indian universities. However, some universities use their own grading scales — always check your university\'s official conversion policy when applying abroad.',
  },
]

export default function PercentageToGpaClient() {
  const [pct, setPct] = useState('')
  const [error, setError] = useState('')

  const num = parseFloat(pct)
  const valid = !isNaN(num) && num >= 0 && num <= 100
  const cgpa = valid ? pctToCgpa(num) : null
  const gpa4data = valid ? pctToGpa4(num) : null
  const cls = valid ? getClass(num) : null

  function handleChange(v: string) {
    setPct(v)
    const n = parseFloat(v)
    if (v && (isNaN(n) || n < 0 || n > 100)) {
      setError('Enter a number between 0 and 100')
    } else {
      setError('')
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(160deg,#1A2F4E,#264573)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <nav className="flex items-center gap-1.5 text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: 'rgba(255,255,255,0.8)' }}>Percentage to GPA</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212,146,42,0.2)', border: '1px solid rgba(212,146,42,0.3)' }}>
              <GraduationCap className="w-5 h-5" style={{ color: '#D4922A' }} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(212,146,42,0.9)' }}>Free Calculator</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Fraunces',serif" }}>
            Percentage to GPA Calculator 2026
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.7' }}>
            Convert Indian percentage to 10-point CGPA (Indian scale) or 4.0 GPA scale (US/international). Instant, no login required.
          </p>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Calculator card */}
        <div className="card bg-white p-6 sm:p-8">
          <label className="block text-sm font-bold mb-2" style={{ color: 'var(--navy)' }}>
            Enter Your Percentage (0–100)
          </label>
          <div className="flex gap-3 items-start flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={pct}
                onChange={e => handleChange(e.target.value)}
                placeholder="e.g. 76.5"
                className="form-input w-full px-4 py-3 rounded-xl text-lg font-semibold"
                style={{ border: error ? '1.5px solid #dc2626' : '1.5px solid #e2e8f0' }}
              />
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>
          </div>

          {valid && cgpa !== null && gpa4data !== null && cls !== null && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl p-4 text-center" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#16a34a' }}>10-pt CGPA</div>
                <div className="text-2xl font-black" style={{ color: '#15803d' }}>{cgpa.toFixed(2)}</div>
                <div className="text-xs mt-1" style={{ color: '#166534' }}>Indian scale</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#1d4ed8' }}>4.0 GPA</div>
                <div className="text-2xl font-black" style={{ color: '#1e40af' }}>{gpa4data.gpa.toFixed(1)}</div>
                <div className="text-xs mt-1" style={{ color: '#1e3a8a' }}>US / intl scale</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: '#fefce8', border: '1px solid #fde68a' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#d97706' }}>Letter Grade</div>
                <div className="text-2xl font-black" style={{ color: '#b45309' }}>{gpa4data.letter}</div>
                <div className="text-xs mt-1" style={{ color: '#92400e' }}>Grade band</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: '#fdf4ff', border: '1px solid #e9d5ff' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#7c3aed' }}>Class</div>
                <div className="text-sm font-black leading-tight" style={{ color: '#6d28d9' }}>{cls}</div>
              </div>
            </div>
          )}

          {!pct && (
            <div className="mt-4 p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p className="text-xs" style={{ color: '#64748b' }}>
                <strong>Formula used:</strong> Indian CGPA = Percentage ÷ 9.5 (UGC standard). US 4.0 GPA uses standard grade band mapping.
              </p>
            </div>
          )}
        </div>

        {/* Quick reference chips */}
        <div className="card bg-white p-5">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--navy)' }}>Common Conversions</h2>
          <div className="flex flex-wrap gap-2">
            {[50, 55, 60, 65, 70, 75, 80, 85, 90, 95].map(p => {
              const c = pctToCgpa(p)
              const g = pctToGpa4(p)
              return (
                <button key={p} onClick={() => handleChange(String(p))}
                  className="px-3 py-2 rounded-lg text-xs font-semibold border transition-all hover:border-amber-400"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>
                  <span className="font-bold">{p}%</span> → {c.toFixed(2)} CGPA / {g.gpa} GPA
                </button>
              )
            })}
          </div>
        </div>

        {/* Conversion scale info */}
        <div className="card bg-white p-5">
          <h2 className="text-sm font-bold mb-1" style={{ color: 'var(--navy)' }}>
            <ArrowRightLeft className="w-4 h-4 inline mr-1.5" />
            Two Scales Explained
          </h2>
          <p className="text-xs mb-4" style={{ color: '#64748b' }}>
            India uses a 10-point CGPA scale. The US and most international universities use a 4.0 scale. Both are valid — different contexts use different systems.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div className="text-xs font-bold mb-2" style={{ color: '#15803d' }}>Indian 10-Point CGPA Scale</div>
              <div className="text-xs space-y-1" style={{ color: '#166534' }}>
                <div>Formula: <strong>Percentage ÷ 9.5</strong></div>
                <div>Set by UGC (University Grants Commission)</div>
                <div>Used by Anna University, VTU, most Indian universities</div>
                <div>Example: 76% ÷ 9.5 = <strong>8.0 CGPA</strong></div>
              </div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div className="text-xs font-bold mb-2" style={{ color: '#1d4ed8' }}>US 4.0 GPA Scale</div>
              <div className="text-xs space-y-1" style={{ color: '#1e3a8a' }}>
                <div>Formula: <strong>Grade band mapping</strong></div>
                <div>Used by US, Canadian universities</div>
                <div>WES provides official conversion for Indian transcripts</div>
                <div>Example: 76% → <strong>B+ → 2.7 GPA</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Full conversion table */}
        <div className="card bg-white p-5">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--navy)' }}>Full Percentage to GPA Conversion Table (40%–100%)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: '#1A2F4E', color: 'white' }}>
                  <th className="px-3 py-2 text-left font-semibold">Percentage</th>
                  <th className="px-3 py-2 text-left font-semibold">CGPA (10-pt)</th>
                  <th className="px-3 py-2 text-left font-semibold">GPA (4.0)</th>
                  <th className="px-3 py-2 text-left font-semibold">Letter</th>
                  <th className="px-3 py-2 text-left font-semibold">Class</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr key={row.pct}
                    style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                    <td className="px-3 py-1.5 font-semibold" style={{ color: '#0f172a' }}>{row.pct}%</td>
                    <td className="px-3 py-1.5 font-bold" style={{ color: '#15803d' }}>{row.cgpa.toFixed(2)}</td>
                    <td className="px-3 py-1.5 font-bold" style={{ color: '#1d4ed8' }}>{row.gpa4.toFixed(1)}</td>
                    <td className="px-3 py-1.5">{row.letter}</td>
                    <td className="px-3 py-1.5" style={{ color: '#475569' }}>{getClass(row.pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="card bg-white p-5">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--navy)' }}>Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <p className="text-sm font-semibold mb-1" style={{ color: '#0f172a' }}>{faq.q}</p>
                <p className="text-sm" style={{ color: '#475569', lineHeight: '1.6' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related tools */}
        <div className="card bg-white p-5">
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--navy)' }}>Related Calculators</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link href="/tools/cgpa-calculator" className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition-colors">
              <div className="text-xs font-bold mb-1" style={{ color: '#D4922A' }}>CGPA CALCULATOR</div>
              <div className="text-sm font-semibold" style={{ color: '#0B1D35' }}>CGPA to Percentage</div>
              <div className="text-xs mt-1" style={{ color: '#64748b' }}>Convert CGPA → % using UGC formula</div>
            </Link>
            <Link href="/tools/emi-calculator" className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition-colors">
              <div className="text-xs font-bold mb-1" style={{ color: '#D4922A' }}>EMI CALCULATOR</div>
              <div className="text-sm font-semibold" style={{ color: '#0B1D35' }}>MBA EMI Calculator</div>
              <div className="text-xs mt-1" style={{ color: '#64748b' }}>Monthly payments on education loan</div>
            </Link>
            <Link href="/compare" className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition-colors">
              <div className="text-xs font-bold mb-1" style={{ color: '#D4922A' }}>COMPARE</div>
              <div className="text-sm font-semibold" style={{ color: '#0B1D35' }}>Compare Universities</div>
              <div className="text-xs mt-1" style={{ color: '#64748b' }}>Fees, ranks, programs side by side</div>
            </Link>
          </div>
        </div>

      </section>
    </main>
  )
}
