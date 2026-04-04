'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, GraduationCap, CheckCircle, BookOpen, ArrowRightLeft } from 'lucide-react'

// CGPA → Percentage: multiply by 9.5 (standard UGC / Anna University / most Indian universities)
// Percentage → CGPA: divide by 9.5

const COMMON_CGPA_TABLE = Array.from({ length: 41 }, (_, i) => {
  const cgpa = parseFloat((6.0 + i * 0.1).toFixed(1))
  const pct  = parseFloat((cgpa * 9.5).toFixed(2))
  return { cgpa, pct }
})

const FAQS = [
  {
    q: 'What is CGPA full form?',
    a: 'CGPA stands for Cumulative Grade Point Average. It is the overall grade point average calculated across all semesters in a degree program. SGPA (Semester Grade Point Average) refers to the GPA for a single semester.',
  },
  {
    q: 'How to convert CGPA to percentage?',
    a: 'The standard formula recommended by UGC (University Grants Commission) India is: Percentage = CGPA × 9.5. For example, a CGPA of 8.0 equals 8.0 × 9.5 = 76%. Some universities like Anna University and VTU also use this formula.',
  },
  {
    q: 'What is 8.75 CGPA in percentage?',
    a: '8.75 CGPA in percentage = 8.75 × 9.5 = 83.13%. This is considered a first-class with distinction result in most Indian universities.',
  },
  {
    q: 'What is 7.5 CGPA in percentage?',
    a: '7.5 CGPA in percentage = 7.5 × 9.5 = 71.25%. This falls in the first-class category (above 60%) in most Indian universities.',
  },
  {
    q: 'Is CGPA to percentage conversion the same for all universities?',
    a: 'No. Most universities follow the UGC formula (CGPA × 9.5). However, some universities like Mumbai University, Pune University, or those using 4.0-scale GPA may have different conversion formulas. Always check your university\'s specific conversion policy.',
  },
  {
    q: 'What is the difference between CGPA and SGPA?',
    a: 'SGPA (Semester Grade Point Average) is the GPA for a single semester, while CGPA (Cumulative Grade Point Average) is the average of all SGPAs across all semesters of your degree program. CGPA gives the overall academic performance picture.',
  },
]

export default function CgpaCalculatorClient() {
  // CGPA → Percentage
  const [cgpaInput, setCgpaInput] = useState('')
  // Percentage → CGPA
  const [pctInput, setPctInput] = useState('')
  // Active tab
  const [tab, setTab] = useState<'cgpa_to_pct' | 'pct_to_cgpa'>('cgpa_to_pct')
  // Table visible
  const [tableVisible, setTableVisible] = useState(false)

  const cgpaVal = parseFloat(cgpaInput)
  const pctVal  = parseFloat(pctInput)

  const cgpaResult = !isNaN(cgpaVal) && cgpaVal > 0 && cgpaVal <= 10
    ? (cgpaVal * 9.5).toFixed(2)
    : null

  const pctResult = !isNaN(pctVal) && pctVal > 0 && pctVal <= 100
    ? (pctVal / 9.5).toFixed(2)
    : null

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: 'Outstanding', color: '#1f6b52' }
    if (pct >= 75) return { label: 'First Class with Distinction', color: '#1f6b52' }
    if (pct >= 60) return { label: 'First Class', color: '#c9922a' }
    if (pct >= 50) return { label: 'Second Class', color: '#c9922a' }
    if (pct >= 40) return { label: 'Pass Class', color: '#888' }
    return { label: 'Below Pass', color: '#dc2626' }
  }

  const resultPct = tab === 'cgpa_to_pct' ? (cgpaResult ? parseFloat(cgpaResult) : null) : (pctVal || null)
  const grade = resultPct ? getGrade(resultPct) : null

  return (
    <div className="min-h-screen bg-surface">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
            <Link href="/" className="hover:text-amber">Home</Link>
            <ChevronRight size={12} />
            <Link href="/tools" className="hover:text-amber">Tools</Link>
            <ChevronRight size={12} />
            <span className="text-amber font-semibold">CGPA Calculator</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber/10 text-amber text-xs font-bold mb-4">
            <GraduationCap size={14} />
            Free Tool · No Login Required
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
            CGPA to Percentage Calculator 2026
          </h1>
          <p className="text-ink-2 max-w-xl mx-auto">
            Instantly convert CGPA to percentage (and back) using the standard UGC formula:
            <strong className="text-navy"> Percentage = CGPA × 9.5</strong>.
            Trusted by students at Anna University, VTU, Mumbai University, and 800+ Indian universities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Calculator Card */}
          <div className="bg-white rounded-2xl border border-border p-6">
            {/* Tab Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-border mb-6">
              <button
                onClick={() => setTab('cgpa_to_pct')}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'cgpa_to_pct'
                    ? 'bg-navy text-white'
                    : 'bg-surface-2 text-ink-2 hover:bg-surface-3'
                }`}
              >
                <GraduationCap size={14} />
                CGPA → %
              </button>
              <button
                onClick={() => setTab('pct_to_cgpa')}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'pct_to_cgpa'
                    ? 'bg-navy text-white'
                    : 'bg-surface-2 text-ink-2 hover:bg-surface-3'
                }`}
              >
                <ArrowRightLeft size={14} />
                % → CGPA
              </button>
            </div>

            {tab === 'cgpa_to_pct' ? (
              <div>
                <label className="text-sm font-semibold text-ink-2 block mb-2">
                  Enter Your CGPA (out of 10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={cgpaInput}
                  onChange={e => setCgpaInput(e.target.value)}
                  placeholder="e.g. 8.75"
                  className="w-full px-4 py-3 rounded-xl border border-border text-navy font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-amber/40"
                />
                <p className="text-xs text-ink-3 mt-1.5">Enter a value between 0.1 and 10.0</p>

                {cgpaResult && (
                  <div className="mt-6 p-5 bg-gradient-to-br from-navy to-[#142540] rounded-xl text-white">
                    <div className="text-xs text-white/60 mb-1">Your Percentage</div>
                    <div className="text-4xl font-bold mb-2">{cgpaResult}%</div>
                    <div className="text-sm text-white/70 mb-3">
                      {cgpaInput} × 9.5 = {cgpaResult}%
                    </div>
                    {grade && (
                      <div
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: grade.color + '33', color: grade.color === '#1f6b52' ? '#34d399' : grade.color === '#c9922a' ? '#fbbf24' : '#aaa' }}
                      >
                        {grade.label}
                      </div>
                    )}
                  </div>
                )}

                {cgpaInput && !cgpaResult && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    Please enter a valid CGPA between 0.1 and 10.0
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="text-sm font-semibold text-ink-2 block mb-2">
                  Enter Your Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={pctInput}
                  onChange={e => setPctInput(e.target.value)}
                  placeholder="e.g. 75.5"
                  className="w-full px-4 py-3 rounded-xl border border-border text-navy font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-amber/40"
                />
                <p className="text-xs text-ink-3 mt-1.5">Enter a value between 1 and 100</p>

                {pctResult && (
                  <div className="mt-6 p-5 bg-gradient-to-br from-navy to-[#142540] rounded-xl text-white">
                    <div className="text-xs text-white/60 mb-1">Your CGPA</div>
                    <div className="text-4xl font-bold mb-2">{pctResult} / 10</div>
                    <div className="text-sm text-white/70 mb-3">
                      {pctInput}% ÷ 9.5 = {pctResult}
                    </div>
                    {grade && (
                      <div
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: grade.color + '33', color: grade.color === '#1f6b52' ? '#34d399' : grade.color === '#c9922a' ? '#fbbf24' : '#aaa' }}
                      >
                        {grade.label}
                      </div>
                    )}
                  </div>
                )}

                {pctInput && !pctResult && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    Please enter a valid percentage between 1 and 100
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 p-4 bg-amber/5 border border-amber/20 rounded-xl">
              <p className="text-xs text-ink-2 font-semibold mb-1">Formula Used</p>
              <p className="text-xs text-ink-3">
                <strong>CGPA to %:</strong> Percentage = CGPA × 9.5<br />
                <strong>% to CGPA:</strong> CGPA = Percentage ÷ 9.5<br />
                Source: UGC (University Grants Commission) India guidelines
              </p>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-bold text-navy mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-amber" />
                Grade Classification
              </h2>
              <div className="space-y-2">
                {[
                  { range: '9.5 – 10.0', pct: '90–100%', label: 'Outstanding (O)', color: 'bg-sage/10 text-sage border-sage/20' },
                  { range: '7.9 – 9.4', pct: '75–89%', label: 'First Class (Distinction)', color: 'bg-amber/10 text-amber border-amber/20' },
                  { range: '6.3 – 7.8', pct: '60–74%', label: 'First Class (A)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { range: '5.3 – 6.2', pct: '50–59%', label: 'Second Class (B)', color: 'bg-surface-2 text-ink-2 border-border' },
                  { range: '4.2 – 5.2', pct: '40–49%', label: 'Pass Class (C)', color: 'bg-surface-2 text-ink-3 border-border' },
                  { range: 'Below 4.2', pct: 'Below 40%', label: 'Fail / Backlog', color: 'bg-red-50 text-red-600 border-red-200' },
                ].map(row => (
                  <div key={row.label} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold ${row.color}`}>
                    <span>{row.range} CGPA</span>
                    <span>{row.pct}</span>
                    <span>{row.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-bold text-navy mb-3">Quick Reference</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ['10.0 CGPA', '95.00%'],
                  ['9.5 CGPA', '90.25%'],
                  ['9.0 CGPA', '85.50%'],
                  ['8.75 CGPA', '83.13%'],
                  ['8.5 CGPA', '80.75%'],
                  ['8.0 CGPA', '76.00%'],
                  ['7.5 CGPA', '71.25%'],
                  ['7.0 CGPA', '66.50%'],
                  ['6.5 CGPA', '61.75%'],
                  ['6.0 CGPA', '57.00%'],
                ].map(([cgpa, pct]) => (
                  <div key={cgpa} className="flex justify-between bg-surface-2 rounded-lg px-3 py-1.5 text-xs">
                    <span className="font-bold text-navy">{cgpa}</span>
                    <span className="text-amber font-semibold">{pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CGPA Table */}
        <div className="mt-8 bg-white rounded-2xl border border-border overflow-hidden">
          <button
            onClick={() => setTableVisible(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-2 transition-colors"
          >
            <h2 className="font-bold text-navy">CGPA to Percentage Conversion Table (6.0 – 10.0)</h2>
            <span className="text-amber font-bold text-sm">{tableVisible ? '▲ Hide' : '▼ Show'}</span>
          </button>
          {tableVisible && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy text-white text-xs uppercase">
                    <th className="px-4 py-3 text-left">CGPA</th>
                    <th className="px-4 py-3 text-left">Percentage (%)</th>
                    <th className="px-4 py-3 text-left">Grade</th>
                    <th className="px-4 py-3 text-left">Classification</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMON_CGPA_TABLE.map((row, i) => {
                    const g = getGrade(row.pct)
                    return (
                      <tr key={row.cgpa} className={i % 2 === 0 ? 'bg-white' : 'bg-surface-2'}>
                        <td className="px-4 py-2 font-bold text-navy">{row.cgpa.toFixed(1)}</td>
                        <td className="px-4 py-2 font-semibold text-amber">{row.pct.toFixed(2)}%</td>
                        <td className="px-4 py-2 text-ink-2">
                          {row.cgpa >= 9.5 ? 'O' : row.cgpa >= 7.9 ? 'A+' : row.cgpa >= 6.3 ? 'A' : row.cgpa >= 5.3 ? 'B' : 'C'}
                        </td>
                        <td className="px-4 py-2 text-xs text-ink-3">{g.label}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SEO Content */}
        <div className="mt-10 bg-white rounded-2xl border border-border p-8">
          <h2 className="font-display text-2xl font-bold text-navy mb-6">
            What is CGPA? Full Form, Meaning & How to Convert
          </h2>
          <div className="prose prose-sm max-w-none text-ink-2 space-y-4">
            <p>
              <strong>CGPA full form</strong> is <em>Cumulative Grade Point Average</em>. It is a standardised
              grading system used by most universities and colleges in India (and worldwide) to represent a
              student's overall academic performance across all semesters of a degree program.
            </p>

            <h3 className="font-display text-lg font-bold text-navy mt-6 mb-2">
              CGPA vs SGPA — What is the Difference?
            </h3>
            <p>
              <strong>SGPA (Semester Grade Point Average)</strong> measures your performance in a single semester,
              while <strong>CGPA</strong> is the average of all your SGPAs across every completed semester.
              Most final degree certificates and mark sheets display CGPA as the overall academic score.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 my-4">
              <div className="bg-amber/5 border border-amber/20 rounded-xl p-4">
                <p className="font-bold text-navy text-sm mb-1">SGPA</p>
                <p className="text-xs text-ink-3">Semester Grade Point Average — GPA for one semester only</p>
              </div>
              <div className="bg-sage/5 border border-sage/20 rounded-xl p-4">
                <p className="font-bold text-navy text-sm mb-1">CGPA</p>
                <p className="text-xs text-ink-3">Cumulative Grade Point Average — overall average of all semesters</p>
              </div>
            </div>

            <h3 className="font-display text-lg font-bold text-navy mt-6 mb-2">
              How to Convert CGPA to Percentage — The Formula
            </h3>
            <p>
              The University Grants Commission (UGC) of India has prescribed a standard conversion formula for
              10-point CGPA scales:
            </p>
            <div className="bg-navy text-white rounded-xl px-6 py-4 my-4 text-center font-mono text-lg">
              Percentage = CGPA × 9.5
            </div>
            <p>
              This formula is used by <strong>Anna University</strong>, <strong>VTU (Visvesvaraya Technological
              University)</strong>, <strong>JNTU</strong>, <strong>Amity University</strong>, and most other Indian
              universities following UGC-DEB guidelines for online and distance education programs.
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>8.75 CGPA in percentage = 8.75 × 9.5 = <strong>83.13%</strong></li>
              <li>8.5 CGPA in percentage = 8.5 × 9.5 = <strong>80.75%</strong></li>
              <li>7.5 CGPA in percentage = 7.5 × 9.5 = <strong>71.25%</strong></li>
              <li>6.5 CGPA in percentage = 6.5 × 9.5 = <strong>61.75%</strong></li>
            </ul>

            <h3 className="font-display text-lg font-bold text-navy mt-6 mb-2">
              Why Does CGPA Matter for Admissions?
            </h3>
            <p>
              Many postgraduate programs (Online MBA, MCA, M.Com) and competitive exams require a minimum
              percentage or CGPA for eligibility. Most online MBA programs accept students with a minimum
              50% aggregate (≈ 5.26 CGPA on a 10-point scale). Some top universities like NMIMS or Manipal
              require 60% (≈ 6.32 CGPA).
            </p>

            <h3 className="font-display text-lg font-bold text-navy mt-6 mb-2">
              CGPA on a 4.0 Scale (GPA)
            </h3>
            <p>
              If your university uses a 4.0 GPA scale (common in foreign universities and some Indian private
              institutions), the conversion formula is different. A 4.0 GPA roughly corresponds to 90–100%,
              while a 3.0 GPA corresponds to approximately 70%. Our calculator above handles the 10-point CGPA
              scale used by most Indian universities.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-2xl border border-border p-8">
          <h2 className="font-display text-2xl font-bold text-navy mb-6">
            Frequently Asked Questions about CGPA
          </h2>
          <div className="space-y-5">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-border last:border-0 pb-5 last:pb-0">
                <h3 className="font-semibold text-navy mb-2 flex items-start gap-2">
                  <span className="text-amber font-bold shrink-0">Q{i + 1}.</span>
                  {faq.q}
                </h3>
                <p className="text-sm text-ink-2 leading-relaxed pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Internal Links CTA */}
        <div className="mt-8 bg-gradient-to-br from-navy to-[#142540] rounded-2xl p-8">
          <h2 className="font-display text-xl font-bold text-white mb-2">
            Check Your Eligibility with Your CGPA
          </h2>
          <p className="text-white/70 text-sm mb-6">
            Now that you know your percentage, see if you qualify for top online degree programs.
            Most programs require 50% or above (≈ 5.3 CGPA).
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/programs/mba', label: 'Online MBA', desc: 'Min. 50% (5.3 CGPA) in any bachelor\'s degree' },
              { href: '/programs/mca', label: 'Online MCA', desc: 'Min. 50% in BCA / B.Sc. (CS/IT) or equivalent' },
              { href: '/programs/bba', label: 'Online BBA', desc: 'Min. 45% in 10+2 (Class XII)' },
              { href: '/programs/bca', label: 'Online BCA', desc: 'Min. 45% in 10+2 with Mathematics' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-3 block"
              >
                <div className="font-bold text-white text-sm mb-0.5">{item.label}</div>
                <div className="text-white/60 text-xs">{item.desc}</div>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/universities"
              className="inline-flex items-center gap-1.5 bg-amber text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-amber/90 transition-colors"
            >
              Browse All Universities
              <ChevronRight size={14} />
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              More Free Tools
            </Link>
          </div>
        </div>

        {/* Tip cards */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: <CheckCircle size={18} className="text-sage" />,
              title: 'Verify with your university',
              desc: 'Always cross-check converted percentages against your official marksheet or university portal.',
            },
            {
              icon: <BookOpen size={18} className="text-amber" />,
              title: 'Conversion varies by institution',
              desc: 'Some universities (like Mumbai University on 7-point scale) have different formulas. Confirm with your registrar.',
            },
            {
              icon: <GraduationCap size={18} className="text-navy" />,
              title: 'CGPA on job applications',
              desc: 'Most Indian employers and grad school applications accept CGPA directly; conversion is for reference.',
            },
          ].map(card => (
            <div key={card.title} className="bg-white rounded-2xl border border-border p-5">
              <div className="mb-3">{card.icon}</div>
              <h3 className="font-bold text-navy text-sm mb-1.5">{card.title}</h3>
              <p className="text-xs text-ink-3 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
