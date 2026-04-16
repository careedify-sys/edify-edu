'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  CheckCircle, ChevronRight, Briefcase, TrendingUp, BookOpen,
  Award, Users
} from 'lucide-react'
import { getUniversitiesByProgram, formatFeeSlim as formatFee } from '@/lib/data-slim'
import { cleanCareerOutcome } from '@/lib/format'
import { PROGRAM_META } from '@/lib/data-client'
import { getProgramContent, getSpecContent, getSpecFallback, getUniversitySyllabus, getMasterSyllabus } from '@/lib/content'
import SyllabusSection from '@/components/SyllabusSection'
import type { Program, University } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'
import EdifyRecommends from '@/components/EdifyRecommends'
import { UNIVERSITY_REVIEWS, GENERIC_REVIEWS } from '@/lib/reviews-data'

const WA_NUMBER = '917061285806'

// Always show full page — no paywall gate

interface Props {
  university: University
  program: Program
  programSlug: string
}

export default function UniversityProgramClient({ university: u, program, programSlug }: Props) {
  const pd = u.programDetails[program]!
  return <FullPage u={u} program={program} programSlug={programSlug} pd={pd} />
}

// ── FULL DATA PAGE ─────────────────────────────────────────────
function FullPage({ u, program, programSlug, pd }: {
  u: University; program: Program; programSlug: string
  pd: NonNullable<University['programDetails'][Program]>
}) {
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [activeSpec, setActiveSpec]   = useState<string | null>(null)
  const [openFaq, setOpenFaq]         = useState<number | null>(null)

  const syllabus      = getMasterSyllabus(u.id, program) || getUniversitySyllabus(u.id, program)
  const meta          = PROGRAM_META[program]
  const otherUnis     = getUniversitiesByProgram(program).filter(x => x.id !== u.id).slice(0, 4)
  const specContent   = activeSpec ? (getSpecContent(activeSpec) || getSpecFallback(activeSpec, program)) : null
  const programContent = getProgramContent(program)

  const faqs = [
    { q: `Is the ${program} degree from ${u.name} valid?`, a: `Yes — 100% valid. ${u.name} is UGC DEB approved. The degree certificate is identical to a regular campus degree and is valid for private sector, government jobs where UGC DEB degrees are accepted${u.psuEligible ? ', and PSU recruitment' : ''}. ` },
    { q: `What is the total fee for ${program} at ${u.name}?`, a: `Total fee is ${pd.fees || `₹${Math.round(u.feeMin/1000)}K+`}. EMI from ₹${u.emiFrom.toLocaleString()}/month. Semester-wise payment available. Ask a counsellor for current scholarships.` },
    ...(pd.specs?.length ? [{ q: `What specialisations does ${u.name} offer in ${program}?`, a: `${pd.specs.length} specialisations: ${pd.specs.join(', ')}.` }] : []),
    { q: `Can I study while working full-time?`, a: `Yes — designed for working professionals. Live sessions + recorded videos, ${u.examMode} assessments. No mandatory daily attendance.` },
    { q: `What placement support does ${u.name} provide?`, a: `Placement assistance including job portals, resume workshops, mock interviews and campus drives. Alumni network + Naukri/LinkedIn placement support.` },
  ]

  return (
    <>
      <div className="page-shell">
        <div style={{ height: 3, background: u.color }} />

        {/* Breadcrumb */}
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
              <Link href="/" className="text-ink-2 no-underline hover:text-navy">Home</Link>
              <ChevronRight size={12} />
              <Link href="/universities" className="text-ink-2 no-underline hover:text-navy">Universities</Link>
              <ChevronRight size={12} />
              <Link href={`/universities/${u.id}`} className="text-ink-2 no-underline hover:text-navy">{u.abbr}</Link>
              <ChevronRight size={12} />
              <span className="text-amber font-semibold">{program}</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)', borderBottom: '1px solid #1e2f45' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
            <div className="max-w-3xl">
              <div className="text-[11px] font-bold text-amber uppercase tracking-widest mb-2.5">
                {meta?.level === 'PG' ? 'Postgraduate' : 'Undergraduate'} · {pd.duration} · UGC DEB Approved
              </div>
              <h1 className="font-display" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 10 }}>
                {program} from {u.name}
              </h1>
              {pd.careerOutcome && <p className="text-slate-400 text-[15px] leading-relaxed mb-5">{cleanCareerOutcome(pd.careerOutcome)}</p>}

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 mb-6">
                {[
                  { label: 'Total Fees', value: pd.fees || `₹${Math.round(u.feeMin/1000)}K+` },
                  { label: 'Duration',   value: pd.duration || '2 Years' },
                  ...(pd.avgSalary ? [{ label: 'Avg Salary', value: pd.avgSalary }] : []),
                  { label: 'NIRF Rank',  value: u.nirf < 900 ? `#${u.nirf}` : 'Recognised' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid #1e2f45', borderRadius: 'var(--r-sm)' }}>
                    <div className="text-[9px] sm:text-[10px] text-ink-3 uppercase tracking-wider">{s.label}</div>
                    <div className="text-[13px] sm:text-[15px] font-bold text-white">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => setEnquiryOpen(true)} style={{ padding: '13px 28px', borderRadius: 'var(--r-sm)', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                  Speak with an Advisor →
                </button>
                <button onClick={() => setEnquiryOpen(true)} style={{ padding: '13px 20px', borderRadius: 'var(--r-sm)', border: '2px solid rgba(201,146,42,0.5)', color: 'var(--amber-text)', background: 'transparent', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Talk to Alumni
                </button>
                <Link href={`/universities/${u.id}`} style={{ padding: '13px 20px', borderRadius: 'var(--r-sm)', border: '1px solid #1e2f45', color: 'var(--ink-4)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  ← All {u.abbr} Programs
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-24 lg:pb-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-8">

              {/* Specialisations */}
              {(pd.specs?.length ?? 0) > 0 && <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-4">{program} Specialisations at {u.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {(pd.specs ?? []).map(spec => (
                    <button key={spec} onClick={() => setActiveSpec(activeSpec === spec ? null : spec)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSpec === spec ? 'bg-amber text-white' : 'bg-surface-2 border border-border text-ink-2 hover:border-amber'}`}>
                      {spec}
                    </button>
                  ))}
                </div>
                {activeSpec && specContent && (
                  <div className="mt-6 p-4 bg-surface-2 rounded-lg border border-border">
                    <h3 className="font-bold text-navy mb-2">{activeSpec}</h3>
                    <p className="text-sm text-ink-2 mb-2">{specContent.heroSub}</p>
                    <span className="text-sm text-ink-3">Salary Range: </span>
                    <span className="text-sm font-semibold text-green-600">{specContent.salaryRange}</span>
                  </div>
                )}
              </section>}

              {/* Skills You'll Gain */}
              {(programContent?.skills?.technical?.length ?? 0) > 0 && (
                <section className="card-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest"
                      style={{ background: 'rgba(212,146,42,0.12)', color: 'var(--amber-text)', border: '1px solid rgba(212,146,42,0.3)' }}>
                      ✦ Edify Recommends
                    </span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-navy mb-1">Skills You'll Gain</h2>
                  <p className="text-sm text-ink-3 mb-4">Key competencies from an online {program} that employers look for</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(programContent?.skills?.technical?.length ?? 0) > 0 && (
                      <div>
                        <div className="text-xs font-bold text-navy uppercase tracking-wide mb-2">Technical Skills</div>
                        <div className="flex flex-wrap gap-2">
                          {(programContent?.skills?.technical ?? []).map(s => (
                            <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                              <CheckCircle size={11} className="shrink-0" /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(programContent?.skills?.soft?.length ?? 0) > 0 && (
                      <div>
                        <div className="text-xs font-bold text-navy uppercase tracking-wide mb-2">Soft Skills</div>
                        <div className="flex flex-wrap gap-2">
                          {(programContent?.skills?.soft ?? []).map(s => (
                            <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                              <CheckCircle size={11} className="shrink-0" /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Career Outcomes */}
              {((pd.roles?.length ?? 0) > 0 || (pd.topCompanies?.length ?? 0) > 0) && <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-4">Career After {program} from {u.name}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {(pd.roles?.length ?? 0) > 0 && <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-navy mb-3"><Briefcase size={16} /> Job Roles</div>
                    <div className="flex flex-wrap gap-2">
                      {(pd.roles ?? []).map(role => (
                        <span key={role} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{role}</span>
                      ))}
                    </div>
                  </div>}
                  {(pd.topCompanies?.length ?? 0) > 0 && <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-navy mb-3"><TrendingUp size={16} /> Top Hiring Companies</div>
                    <div className="flex flex-wrap gap-2">
                      {(pd.topCompanies ?? []).slice(0, 8).map(c => (
                        <span key={c} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">{c}</span>
                      ))}
                    </div>
                  </div>}
                </div>
                {pd.avgSalary && <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 font-semibold mb-1"><Award size={16} /> Average Salary</div>
                  <div className="text-2xl font-bold text-green-700">{pd.avgSalary}</div>
                </div>}
              </section>}

              {/* Syllabus */}
              {syllabus && <SyllabusSection syllabus={syllabus} program={program} universityName={u.name} />}

              {/* Examination Pattern */}
              <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-4">Examination Pattern</h2>
                <div className="overflow-x-auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-2)' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Component</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weightage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { component: 'Internal Assessment', details: 'Assignments & Projects', weightage: '30%' },
                        { component: 'External Assessment', details: 'End-term Examination', weightage: '70%' },
                      ].map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : 'var(--surface-2)' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--ink)' }}>{row.component}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--ink-2)' }}>{row.details}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--amber-text)' }}>{row.weightage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 text-sm text-ink-2">
                    <BookOpen size={14} className="text-amber-text shrink-0 mt-0.5" />
                    <span><strong>Minimum passing:</strong> 40% in each subject</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-ink-2">
                    <BookOpen size={14} className="text-amber-text shrink-0 mt-0.5" />
                    <span><strong>Medium of instruction:</strong> English</span>
                  </div>
                </div>
              </section>

              {/* Who Can Apply */}
              <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-4">Who Can Apply</h2>
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-ink-2">Completed graduation from a UGC recognised university</span>
                  </div>
                  {u.eligibilityPct > 0 && (
                    <div className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-ink-2">Minimum <strong>{u.eligibilityPct}%</strong> marks in graduation</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-ink-2">No upper age limit — working professionals welcome</span>
                  </div>
                  {u.forWho.map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-ink-2">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-surface-2 rounded-lg border border-border text-sm text-ink-2">
                  <strong>Eligibility:</strong> {u.eligibility}
                </div>
              </section>

              {/* Why Choose / Is It Worth It / How to Apply */}
              {(() => {
                const cleanName = u.name.replace(/\bOnline\b\s*$/i, '').trim()
                const avgRating = (UNIVERSITY_REVIEWS[u.id] || GENERIC_REVIEWS).reduce((s,r)=>s+r.rating,0) / (UNIVERSITY_REVIEWS[u.id] || GENERIC_REVIEWS).length
                return (
                  <>
                    <section className="card-lg p-6">
                      <h2 className="font-display text-xl font-bold text-navy mb-3">Why Choose {cleanName} for Online {program}</h2>
                      {u.highlight && <p className="text-sm font-semibold text-amber-text mb-4">{u.highlight}</p>}
                      {u.forWho && u.forWho.length > 0 && (
                        <>
                          <h3 className="text-sm font-bold text-navy mb-2">Who This Program Is For</h3>
                          <ul className="flex flex-col gap-2 mb-4">
                            {u.forWho.map(item => (
                              <li key={item} className="flex items-start gap-2 text-sm text-ink-2">
                                <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />{item}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      <p className="text-sm text-ink-2 mb-1">Recognised by: <strong>{u.approvals.slice(0,4).join(' · ')}</strong></p>
                      <p className="text-sm text-ink-2">Total fees: <strong>{formatFee(u.feeMin)} – {formatFee(u.feeMax)}</strong> with EMI starting ₹{u.emiFrom.toLocaleString()}/month</p>
                    </section>

                    <section className="card-lg p-6">
                      <h2 className="font-display text-xl font-bold text-navy mb-3">Is {cleanName} Online {program} Worth It?</h2>
                      <p className="text-[15px] text-ink-2 leading-relaxed mb-3">
                        An online {program} from {cleanName} is worth considering if you are a working professional or fresh graduate looking to earn a recognised degree without leaving your job or city. The program is UGC DEB approved which means the degree is valid for government jobs, PSU recruitment, and higher studies across India.
                      </p>
                      <p className="text-[15px] text-ink-2 leading-relaxed">
                        With NAAC {u.naac} accreditation{u.nirf < 999 ? ` and a NIRF rank of #${u.nirf}` : ''}, {cleanName} maintains strong academic standards.{u.tagline ? ` ${u.tagline}` : ''}
                      </p>
                    </section>

                    <section className="card-lg p-6">
                      <h2 className="font-display text-xl font-bold text-navy mb-4">How to Apply for Online {program} at {cleanName}</h2>
                      <ol className="flex flex-col gap-4">
                        {[
                          `Check eligibility — ${u.eligibility}`,
                          'Visit the official university website and fill the online application form',
                          'Upload required documents: graduation certificate, photo ID, and passport photo',
                          `Pay the application and program fees — total fee ${formatFee(u.feeMin)} to ${formatFee(u.feeMax)}, EMI option available from ₹${u.emiFrom.toLocaleString()} per month`,
                        ].map((step, i) => (
                          <li key={i} className="flex items-start gap-4">
                            <div className="w-7 h-7 rounded-full bg-amber/10 border border-amber/30 flex items-center justify-center shrink-0 text-[12px] font-bold text-amber-text">{i+1}</div>
                            <span className="text-sm text-ink-2 leading-relaxed pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </section>
                  </>
                )
              })()}

              {/* FAQs */}
              <section>
                <h2 className="font-display text-xl font-bold text-navy mb-4">{program} at {u.name} — FAQs</h2>
                <div className="flex flex-col gap-2">
                  {faqs.map((faq, i) => (
                    <div key={i} className="bg-white border border-border rounded-xl overflow-hidden">
                      <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full px-5 py-4 font-semibold text-navy text-sm cursor-pointer flex justify-between items-center bg-transparent border-none text-left">
                        {faq.q}
                        <span className="text-amber text-xl shrink-0 ml-3" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-4 text-sm text-ink-2 leading-relaxed border-t border-border pt-3">{faq.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Talk to Alumni Banner */}
              <div style={{ background: 'linear-gradient(135deg,#0B1D35,#142540)', border: '1px solid rgba(201,146,42,0.25)', borderRadius: 16 }} className="p-5 flex flex-col sm:flex-row items-center gap-4">
                <div style={{ width: 48, height: 48, background: 'rgba(201,146,42,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e0a93a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Not sure? Hear from our alumni</div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>Real {u.abbr} {program} graduates share their honest experience</div>
                </div>
                <button onClick={() => setEnquiryOpen(true)} style={{ padding: '11px 22px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Talk to Alumni →
                </button>
              </div>

              {/* Student Reviews */}
              {(() => {
                const reviews = UNIVERSITY_REVIEWS[u.id] || GENERIC_REVIEWS
                const avgRating = reviews.reduce((s,r) => s + r.rating, 0) / reviews.length
                const fullStars = Math.floor(avgRating)
                const emptyStars = 5 - fullStars
                return (
                  <section className="card-lg p-6">
                    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                      '@context': 'https://schema.org',
                      '@type': 'Course',
                      name: `${u.name} Online ${program}`,
                      provider: { '@type': 'CollegeOrUniversity', name: u.name },
                      aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: avgRating.toFixed(1),
                        reviewCount: String(reviews.length),
                        bestRating: '5',
                        worstRating: '1',
                      },
                    })}}/>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                      <div>
                        <h2 className="font-display text-xl font-bold text-navy mb-1">Student Reviews &amp; Ratings</h2>
                        <p className="text-sm text-ink-3">{reviews.length} students reviewed this program</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-extrabold text-navy">{avgRating.toFixed(1)}</span>
                        <div>
                          <div className="text-amber text-lg leading-none">{'★'.repeat(fullStars)}{'☆'.repeat(emptyStars)}</div>
                          <div className="text-xs text-ink-3">out of 5</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      {reviews.map((r, i) => (
                        <div key={i} className="bg-white border border-border rounded-xl p-5">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-navy text-sm">{r.name}</span>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="var(--sage)"/><path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                              <div className="text-xs text-ink-3">{r.city}, India</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="px-2 py-0.5 bg-amber/10 text-amber-text text-[10px] font-bold rounded-full">{r.program}</span>
                              <span className="text-xs text-ink-3">{r.date}</span>
                            </div>
                          </div>
                          <div className="text-amber text-sm mb-2">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                          <p className="text-sm text-ink-2 leading-relaxed">{r.review}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setEnquiryOpen(true)}
                        className="px-6 py-2.5 rounded-lg border border-amber text-amber-text text-sm font-semibold hover:bg-amber/10 transition-colors bg-transparent cursor-pointer"
                      >
                        Write a Review
                      </button>
                    </div>
                  </section>
                )
              })()}

              {/* Other Universities */}
              {otherUnis.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-navy mb-4">Other Universities Offering {program}</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {otherUnis.map(ou => {
                      const opd = ou.programDetails?.[program]
                      return (
                        <Link key={ou.id} href={`/universities/${ou.id}/${programSlug}`}
                          className="block bg-white border border-border rounded-xl overflow-hidden hover:border-amber transition-colors">
                          <div style={{ height: 3, background: ou.color }} />
                          <div className="p-4">
                            <div className="font-bold text-navy mb-1">{ou.name}</div>
                            <div className="text-xs text-ink-3 mb-2">{ou.city}{ou.nirf < 200 ? ` · NIRF #${ou.nirf}` : ''} · {ou.naac}</div>
                            <div className="flex justify-between text-sm">
                              <span className="text-ink-2">Fees: <strong>{opd?.fees || formatFee(ou.feeMin)}</strong></span>
                              <span className="text-green-600 font-medium">{opd?.avgSalary?.split('–')[0] || '₹4L'}+</span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="sticky top-20 flex flex-col gap-4">
                <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg,#0B1D35,#142540)', border: '1px solid rgba(200,129,26,0.3)' }}>
                  <div className="text-[10px] font-bold text-amber uppercase tracking-wider mb-2">🎓 Admissions Open</div>
                  <div className="text-sm text-slate-300 mb-3"><strong className="text-white">July 2026 batch</strong> — Apply now</div>
                  <button onClick={() => setEnquiryOpen(true)} className="w-full py-2.5 rounded-lg font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)' }}>
                    Check Eligibility →
                  </button>
                </div>

                <div className="bg-white border border-border rounded-xl overflow-hidden">
                  <div style={{ height: 3, background: u.color }} />
                  <div className="p-4">
                    <div className="font-bold text-navy text-sm mb-3">{program} — Quick Facts</div>
                    {[
                      { label: 'Total Fees',  value: pd.fees },
                      { label: 'Duration',    value: pd.duration },
                      { label: 'Exam Mode',   value: u.examMode },
                      { label: 'Eligibility', value: u.eligibility },
                      { label: 'NAAC',        value: u.naac },
                      { label: 'EMI from',    value: `₹${u.emiFrom.toLocaleString()}/mo` },
                      { label: 'Avg Salary',  value: pd.avgSalary },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between py-2 border-b border-border text-xs">
                        <span className="text-ink-3">{row.label}</span>
                        <span className="font-semibold text-ink text-right max-w-[120px]">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => setEnquiryOpen(true)} className="w-full py-4 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)' }}>
                  Speak with an Advisor
                </button>

                <div className="bg-white border border-border rounded-xl p-4">
                  <div className="font-bold text-navy text-sm mb-3">Approvals & Rankings</div>
                  {u.approvals.map(a => (
                    <div key={a} className="flex items-center gap-2 mb-2 text-xs text-ink-2">
                      <CheckCircle size={14} className="text-green-500" /> {a}
                    </div>
                  ))}
                </div>

                <EdifyRecommends program={program} currentId={u.id} programSlug={programSlug} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50" style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
          <button onClick={() => setEnquiryOpen(true)} className="w-full py-4 rounded-xl font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)', boxShadow: '0 4px 24px rgba(201,146,42,0.4)' }}>
            Speak with an Advisor
          </button>
        </div>
      </div>

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} universityName={u.name} universityId={u.id} defaultProgram={program} />
    </>
  )
}

// ── LOCKED PAGE (no detailed data) ────────────────────────────
function LockedPage({ u, program, programSlug, pd }: {
  u: University; program: Program; programSlug: string
  pd: NonNullable<University['programDetails'][Program]>
}) {
  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  const syllabus  = getMasterSyllabus(u.id, program) || getUniversitySyllabus(u.id, program)
  const meta      = PROGRAM_META[program]
  const otherUnis = getUniversitiesByProgram(program).filter(x => x.id !== u.id).slice(0, 4)
  const shortDesc = pd.careerOutcome
    ? cleanCareerOutcome(pd.careerOutcome).split('.').slice(0, 2).join('.').trim() + '.'
    : `Online ${program} from ${u.name}. UGC DEB approved, ${pd.duration} program.`
  const cleanName = u.name.replace(/\bOnline\b\s*$/i, '').trim()

  function buildWAMessage() {
    const spec = pd.specs?.[0] ? ` (${pd.specs[0]})` : ''
    return encodeURIComponent(`Hi Edify Team, I want details about ${u.name} ${program}${spec}. My name is ${name.trim()} and my number is ${phone.trim()}.`)
  }

  const displayPhone = phone.trim().replace(/\D/g, '').slice(0, 10)
  const maskedPhone  = displayPhone.length >= 6 ? `+91 ${displayPhone.slice(0, 5)}XXXXX` : `+91 ${displayPhone}XXXXX`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim(), p = phone.trim().replace(/\D/g, '')
    if (!n) { setError('Please enter your name.'); return }
    if (p.length < 10) { setError('Please enter a valid 10-digit phone number.'); return }
    setError('')
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => window.open(`https://wa.me/${WA_NUMBER}?text=${buildWAMessage()}`, '_blank'), 1200)
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
            <Link href="/" className="text-ink-2 no-underline hover:text-navy">Home</Link>
            <ChevronRight size={12} />
            <Link href="/universities" className="text-ink-2 no-underline hover:text-navy">Universities</Link>
            <ChevronRight size={12} />
            <Link href={`/universities/${u.id}`} className="text-ink-2 no-underline hover:text-navy">{u.abbr}</Link>
            <ChevronRight size={12} />
            <span className="text-amber font-semibold">{program}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-8">
        {/* Visible section */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden mb-6">
          <div style={{ height: 4, background: u.color }} />
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 shrink-0 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden p-1">
                {u.logo
                  ? <img src={u.logo} alt={u.name} className="max-w-full max-h-full object-contain"
                      onError={e => { const t = e.target as HTMLImageElement; t.style.display = 'none'; const p = t.parentElement; if (p) { p.style.background = u.color; p.innerHTML = `<span style="color:#fff;font-weight:800;font-size:15px">${(u.abbr || u.name).slice(0, 2).toUpperCase()}</span>` } }} />
                  : <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, background: u.color, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>{(u.abbr || u.name).slice(0, 2).toUpperCase()}</span>
                }
              </div>
              <div>
                <div className="text-[10px] font-bold text-amber uppercase tracking-widest mb-0.5">
                  {meta?.level === 'PG' ? 'Postgraduate' : 'Undergraduate'} · UGC DEB Approved
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy leading-tight">Online {program} — {u.name}</h1>
              </div>
            </div>
            <p className="text-sm text-ink-2 leading-relaxed mb-5 max-w-xl">{shortDesc}</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: 'Duration',    value: pd.duration || '2 Years' },
                { label: 'Eligibility', value: u.eligibility || 'Any Graduation' },
                { label: 'NAAC Grade',  value: u.naac },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-border bg-surface-1 px-2 sm:px-3 py-2.5 text-center">
                  <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-ink-3 mb-1">{s.label}</div>
                  <div className="text-xs sm:text-sm font-bold text-navy leading-tight">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {u.approvals.slice(0, 4).map(a => (
                <span key={a} className="flex items-center gap-1 text-[10px] font-semibold text-ink-2 bg-surface-1 border border-border px-2 py-1 rounded-full">
                  <CheckCircle size={10} className="text-green-500" /> {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ─── TOP LEAD FORM ─── */}
        {!submitted ? (
          <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden mb-6">
            <div className="px-6 pt-5 pb-4" style={{ background: 'linear-gradient(135deg,#0B1D35,#142540)' }}>
              <div className="text-[10px] font-bold text-amber uppercase tracking-widest mb-1">Free · Instant · No spam</div>
              <div className="text-base font-extrabold text-white mb-1">Get Your Personalised Fee &amp; Syllabus</div>
              <div className="text-[11px] text-slate-400">{u.name} {program} — exact details sent to WhatsApp</div>
            </div>
            <div className="grid sm:grid-cols-[200px_1fr]">
              <div className="px-5 py-4 bg-surface-2 border-b sm:border-b-0 sm:border-r border-border">
                {['Exact semester-wise fee breakdown','Complete syllabus — all 4 semesters','Scholarship & EMI options','Placement stats & average salary'].map(item => (
                  <div key={item} className="flex items-center gap-2 py-1.5">
                    <CheckCircle size={13} className="text-green-500 shrink-0" />
                    <span className="text-xs text-ink-2">{item}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-ink-2 mb-1 block">Your Name *</label>
                    <input type="text" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required
                      className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-amber transition-colors" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-ink-2 mb-1 block">WhatsApp Number *</label>
                    <div className="flex items-center border border-border rounded-lg overflow-hidden focus-within:border-amber transition-colors">
                      <span className="px-3 py-2.5 text-sm font-semibold text-ink-3 bg-surface-1 border-r border-border shrink-0">+91</span>
                      <input type="tel" placeholder="10-digit mobile" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} required
                        className="flex-1 px-3 py-2.5 text-sm focus:outline-none bg-white" />
                    </div>
                  </div>
                </div>
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-opacity"
                  style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', opacity: submitting ? 0.7 : 1 }}>
                  {submitting
                    ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Sending…</>
                    : <><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>Send Me Details on WhatsApp</>
                  }
                </button>
                <div className="flex items-center justify-center gap-3 text-[10px] text-ink-3">
                  <span>🔒 No spam</span><span>·</span><span>⚡ Instant reply</span><span>·</span><span>✓ Free</span>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-green-200 shadow-lg p-6 text-center mb-6">
            <div className="text-3xl mb-3">✅</div>
            <div className="text-base font-extrabold text-navy mb-2">Thank you, {name.trim()}!</div>
            <p className="text-sm text-ink-2 leading-relaxed">
              You will receive full details of <span className="font-semibold text-navy">{u.name} {program}</span> on your WhatsApp{' '}
              <span className="font-semibold text-green-700">({maskedPhone})</span> shortly.
            </p>
            <div className="mt-3 text-[11px] text-ink-3">Redirecting to WhatsApp…</div>
            <a href={`https://wa.me/${WA_NUMBER}?text=${buildWAMessage()}`} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}>
              Open WhatsApp
            </a>
          </div>
        )}

        {/* Talk to Alumni Banner */}
        <div style={{ background: 'linear-gradient(135deg,#0B1D35,#142540)', border: '1px solid rgba(201,146,42,0.25)', borderRadius: 16 }} className="p-5 mb-6 flex flex-col sm:flex-row items-center gap-4">
          <div style={{ width: 48, height: 48, background: 'rgba(201,146,42,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e0a93a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Not sure? Hear from our alumni</div>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>Real {u.abbr} {program} graduates share their honest experience</div>
          </div>
          <button onClick={() => setEnquiryOpen(true)} style={{ padding: '11px 22px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Talk to Alumni →
          </button>
        </div>

        {/* About the Program */}
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl font-bold text-navy mb-3">About Online {program} at {cleanName}</h2>
          {(syllabus as any)?.programOverview ? (
            <div className="text-[15px] text-ink-2 leading-relaxed mb-3 whitespace-pre-line">{(syllabus as any).programOverview}</div>
          ) : (
            <>
              <p className="text-[15px] text-ink-2 leading-relaxed mb-3">
                {cleanName} offers a UGC DEB approved online {program} program built for working professionals and fresh graduates who want a recognised postgraduate degree without putting their career on hold. The program runs fully online through recorded lectures, live sessions, and a dedicated LMS, so you can study from anywhere in India on your own schedule.
              </p>
              <p className="text-[15px] text-ink-2 leading-relaxed mb-3">
                The Government of India has formally declared that online degrees from UGC DEB approved universities hold equal academic and legal standing to regular campus degrees. The online {program} from {cleanName} is accepted by private employers, government departments, and public sector undertakings across India. With NAAC {u.naac} accreditation{u.nirf < 999 ? ` and a NIRF rank of #${u.nirf}` : ''}, the credential carries solid institutional standing.
              </p>
            </>
          )}
          {pd.specs && pd.specs.length > 0 && (
            <div>
              <div className="text-sm font-bold text-navy mb-2">{pd.specs.length} Specialisations Available</div>
              <div className="flex flex-wrap gap-2">
                {pd.specs.map(s => (
                  <span key={s} className="px-3 py-1 bg-surface-2 border border-border rounded-full text-xs font-medium text-ink-2">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Who Can Apply */}
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl font-bold text-navy mb-4">Who Can Apply for Online {program}</h2>
          <div className="flex flex-col gap-3 mb-4">
            {[
              `Completed graduation from any UGC recognised university`,
              `${u.eligibility}`,
              `No upper age limit — working professionals and freshers both eligible`,
              `No entrance exam required for admission`,
              `Students from any stream (Science, Commerce, Arts) can apply`,
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm text-ink-2">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-4 bg-amber/5 border border-amber/20 rounded-xl text-sm text-ink-2">
            <strong className="text-navy">Ideal for:</strong> Working professionals looking for a career switch or promotion, fresh graduates wanting a postgraduate degree, and entrepreneurs wanting a formal business qualification.
          </div>
        </div>

        {/* Why Choose */}
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl font-bold text-navy mb-3">Why Choose {cleanName} for Online {program}</h2>
          {u.highlight && <p className="text-sm font-semibold text-amber-text mb-4">{u.highlight}</p>}
          <div className="flex flex-col gap-3 mb-4">
            {[
              `NAAC ${u.naac} accredited — one of India's highest quality grades for higher education`,
              u.nirf < 999 ? `NIRF Rank #${u.nirf} — nationally recognised ranking by Ministry of Education` : `Nationally recognised university approved by UGC DEB for online education`,
              `UGC DEB approved — degree is valid for government jobs, PSU recruitment, and further studies`,
              `Affordable fees from ${formatFee(u.feeMin)} with EMI options from ₹${u.emiFrom.toLocaleString()}/month`,
              `Online format — study on weekends and evenings without leaving your current job`,
              ...(u.forWho?.slice(0, 2) ?? []),
            ].filter(Boolean).map(item => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm text-ink-2">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-ink-2">Recognised by: <strong>{u.approvals.slice(0,4).join(' · ')}</strong></p>
        </div>

        {/* Is It Worth It */}
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl font-bold text-navy mb-3">Is {cleanName} Online {program} Worth It?</h2>
          <p className="text-[15px] text-ink-2 leading-relaxed mb-3">
            An online {program} from {cleanName} is a strong option if you are a working professional or fresh graduate looking for a recognised postgraduate degree without relocating or taking a career break. The program is UGC DEB approved — meaning the degree is legally valid for private sector jobs, government recruitment (where UGC DEB degrees are accepted){u.psuEligible ? ', PSU recruitment' : ''}, and admission to PhD programs across India.
          </p>
          <p className="text-[15px] text-ink-2 leading-relaxed mb-3">
            With NAAC {u.naac} accreditation{u.nirf < 999 ? ` and NIRF rank #${u.nirf}` : ''}, {cleanName} maintains strong academic standards that employers recognise. The total program fee ranges from {formatFee(u.feeMin)} to {formatFee(u.feeMax)} — significantly lower than most campus {program} programs — with monthly EMI options starting at ₹{u.emiFrom.toLocaleString()}, making it financially accessible.{u.tagline ? ` ${u.tagline}` : ''}
          </p>
          <p className="text-[15px] text-ink-2 leading-relaxed">
            The online mode means you study through pre-recorded lectures, live doubt-clearing sessions, and online examinations — no daily commute, no relocation. Most students complete assignments during evenings and weekends while continuing full-time employment. If your goal is a recognised postgraduate qualification that fits around your life, {cleanName} online {program} delivers strong value for the investment.
          </p>
        </div>

        {/* How to Apply */}
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl font-bold text-navy mb-4">How to Apply for Online {program} at {cleanName}</h2>
          <ol className="flex flex-col gap-4">
            {[
              `Check eligibility — ${u.eligibility}`,
              'Visit the official university website and fill the online application form with your personal and academic details',
              'Upload required documents: graduation marksheet, degree certificate, government photo ID, and passport-size photograph',
              `Pay the program fees — total fee ${formatFee(u.feeMin)} to ${formatFee(u.feeMax)}, EMI available from ₹${u.emiFrom.toLocaleString()} per month. Semester-wise payment option available`,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-amber/10 border border-amber/30 flex items-center justify-center shrink-0 text-[12px] font-bold text-amber-text">{i+1}</div>
                <span className="text-sm text-ink-2 leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* FAQ */}
        {(() => {
          const faqs = [
            { q: `Is the ${program} degree from ${cleanName} valid for government jobs?`, a: `Yes. ${cleanName} is UGC DEB approved for online education. The ${program} degree is valid for private sector employment, government jobs where UGC DEB approved degrees are accepted${u.psuEligible ? ', and PSU recruitment' : ''}, and further studies including PhD programs.` },
            { q: `What is the total fee for online ${program} at ${cleanName}?`, a: `The total program fee ranges from ${formatFee(u.feeMin)} to ${formatFee(u.feeMax)} depending on the specialisation. EMI options are available from ₹${u.emiFrom.toLocaleString()} per month. Semester-wise payment is also available. Contact an Edify counsellor for the latest scholarship details.` },
            { q: `How are classes conducted for online ${program}?`, a: `Classes are conducted online through a learning management system (LMS). You get access to pre-recorded video lectures, live interactive sessions, digital study material, and online assignments. There is no daily attendance requirement — you study at your own pace during evenings and weekends.` },
            { q: `Can I do online ${program} while working full-time?`, a: `Yes — the program is specifically designed for working professionals. Classes are asynchronous (pre-recorded), with live sessions usually scheduled on weekends. Examinations are conducted online. Most students continue their jobs throughout the program without any disruption.` },
            { q: `What specialisations are available in ${cleanName} online ${program}?`, a: pd.specs?.length ? `${cleanName} offers ${pd.specs.length} specialisations: ${pd.specs.join(', ')}. You choose your specialisation at the time of admission.` : `Multiple specialisations are available including Finance, Marketing, Human Resources, and Operations Management. Contact our counsellors for the complete updated list.` },
          ]
          return (
            <div className="bg-white border border-border rounded-2xl p-6 mb-6">
              <h2 className="font-display text-xl font-bold text-navy mb-4">Frequently Asked Questions — {cleanName} Online {program}</h2>
              <div className="flex flex-col divide-y divide-border">
                {faqs.map((faq, i) => (
                  <div key={i} className="py-4 first:pt-0 last:pb-0">
                    <div className="font-semibold text-navy text-sm mb-2">{faq.q}</div>
                    <p className="text-sm text-ink-2 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Locked section */}
        <div className="relative rounded-2xl overflow-hidden border border-border">
          <div style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none', opacity: 0.4 }} aria-hidden>
            <div className="bg-white p-6 border-b border-border">
              <div className="text-sm font-bold text-navy mb-3">Fee Breakdown</div>
              {['Total Programme Fee', 'Semester 1 Fee', 'Semester 2 Fee', 'EMI Option'].map(l => (
                <div key={l} className="flex justify-between text-xs py-1.5 border-b border-border-light">
                  <span className="text-ink-3">{l}</span><span className="font-bold text-navy">₹██,███</span>
                </div>
              ))}
            </div>
            <div className="bg-surface-1 p-6 border-b border-border">
              <div className="text-sm font-bold text-navy mb-3">Semester-wise Syllabus</div>
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="mb-2">
                  <div className="text-xs font-semibold text-ink-2 mb-1">Semester {n}</div>
                  <div className="flex gap-1">{[1, 2, 3, 4].map(k => <span key={k} className="px-2 py-0.5 rounded bg-border text-transparent text-[10px]">████████</span>)}</div>
                </div>
              ))}
            </div>
            <div className="bg-white p-6">
              <div className="text-sm font-bold text-navy mb-3">Placement & Career Outcomes</div>
              <div className="grid grid-cols-2 gap-3">
                {['Avg Salary', 'Top Recruiters', 'Placement Rate', 'Top Roles'].map(l => (
                  <div key={l} className="p-3 rounded-lg bg-surface-1 border border-border">
                    <div className="text-[9px] text-ink-3">{l}</div>
                    <div className="text-sm font-bold text-navy mt-1">████████</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.92) 30%, rgba(255,255,255,1) 50%)' }}>
            <div className="text-center px-4 mt-16">
              {submitted ? (
                <>
                  <div className="text-4xl mb-2">🔓</div>
                  <div className="font-bold text-navy text-sm">Details sent — check WhatsApp</div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">🔒</div>
                  <div className="font-bold text-navy text-sm mb-1">Fill the form above to unlock</div>
                  <p className="text-xs text-ink-3">Fee breakdown · Syllabus · Placements</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Student Reviews */}
        {(() => {
          const reviews = UNIVERSITY_REVIEWS[u.id] ?? GENERIC_REVIEWS
          const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          const fullStars = Math.floor(avgRating)
          const emptyStars = 5 - fullStars
          return (
            <div className="bg-white border border-border rounded-2xl p-6 mt-6">
              <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Course',
                name: `${u.name} Online ${program}`,
                provider: { '@type': 'CollegeOrUniversity', name: u.name },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: avgRating.toFixed(1),
                  reviewCount: String(reviews.length),
                  bestRating: '5',
                  worstRating: '1',
                },
              })}}/>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-navy mb-1">Student Reviews &amp; Ratings</h2>
                  <p className="text-sm text-ink-3">{reviews.length} students reviewed this program</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold text-navy">{avgRating.toFixed(1)}</span>
                  <div>
                    <div className="text-amber text-lg leading-none">{'★'.repeat(fullStars)}{'☆'.repeat(emptyStars)}</div>
                    <div className="text-xs text-ink-3">out of 5</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reviews.map((r, i) => (
                  <div key={i} className="bg-surface-1 border border-border rounded-xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-bold text-navy text-sm">{r.name}</span>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="var(--sage)"/><path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="text-navy text-sm">· {r.city}, India</span>
                    </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="px-2 py-0.5 bg-amber/10 text-amber-text text-[10px] font-bold rounded-full">{r.program}</span>
                        <span className="text-xs text-ink-3">{r.date}</span>
                      </div>
                    </div>
                    <div className="text-amber text-sm mb-2">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                    <p className="text-sm text-ink-2 leading-relaxed">{r.review}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setEnquiryOpen(true)}
                  className="px-6 py-2.5 rounded-lg border border-amber text-amber-text text-sm font-semibold hover:bg-amber/10 transition-colors bg-transparent cursor-pointer"
                >
                  Write a Review
                </button>
              </div>
            </div>
          )
        })()}

        {/* Other Universities */}
        {otherUnis.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-navy mb-4">Other Universities Offering {program}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {otherUnis.map(ou => {
                const opd = ou.programDetails?.[program]
                return (
                  <Link key={ou.id} href={`/universities/${ou.id}/${programSlug}`}
                    className="block bg-white border border-border rounded-xl overflow-hidden hover:border-amber transition-colors">
                    <div style={{ height: 3, background: ou.color }} />
                    <div className="p-4">
                      <div className="font-bold text-navy text-sm mb-1">{ou.name}</div>
                      <div className="text-xs text-ink-3 mb-2">{ou.city}{ou.nirf < 200 ? ` · NIRF #${ou.nirf}` : ''} · NAAC {ou.naac}</div>
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-2">Fees: <strong>{opd?.fees || formatFee(ou.feeMin)}</strong></span>
                        <span className="text-amber font-semibold">{opd?.avgSalary?.split('–')[0] || '₹4L'}+</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} universityName={u.name} universityId={u.id} defaultProgram={program} />
    </>
  )
}
