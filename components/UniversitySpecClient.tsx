'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ChevronRight, Briefcase, TrendingUp, Award, BookOpen } from 'lucide-react'
import { getUniversitiesByProgram, formatFeeSlim as formatFee } from '@/lib/data-slim'
import { PROGRAM_META } from '@/lib/data-client'
import { getSpecContent, getSpecFallback, getUniversitySyllabus, getMasterSyllabus } from '@/lib/content'
import SyllabusSection from '@/components/SyllabusSection'
import type { Program, University } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'

const WA_NUMBER = '917061285806'

interface Props {
  university: University
  program: Program
  programSlug: string
  spec: string
}

export default function UniversitySpecClient({ university: u, program, programSlug, spec }: Props) {
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  const pd          = u.programDetails[program]!
  const meta        = PROGRAM_META[program]
  const syllabus    = getMasterSyllabus(u.id, program) || getUniversitySyllabus(u.id, program)
  const specContent = getSpecContent(spec) || getSpecFallback(spec, program)
  const otherUnis   = getUniversitiesByProgram(program).filter(x => x.id !== u.id).slice(0, 4)

  const isUG        = meta?.level === 'UG'
  const eligibility = isUG
    ? u.eligibility?.replace(/Graduation.*/, '10+2 / 12th Pass') || '10+2 / 12th Pass'
    : u.eligibility || 'Any Graduation'

  const duration   = pd.duration || (isUG ? '3 Years' : '2 Years')
  const fees       = pd.fees || `₹${Math.round(u.feeMin / 1000)}K+`
  const cleanName  = u.name.replace(/\bOnline\b\s*$/i, '').trim()

  return (
    <>
      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} universityName={u.name} universityId={u.id} defaultProgram={program} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
            <Link href="/" className="text-ink-2 no-underline hover:text-navy">Home</Link>
            <ChevronRight size={12}/>
            <Link href="/universities" className="text-ink-2 no-underline hover:text-navy">Universities</Link>
            <ChevronRight size={12}/>
            <Link href={`/universities/${u.id}`} className="text-ink-2 no-underline hover:text-navy">{u.abbr}</Link>
            <ChevronRight size={12}/>
            <Link href={`/universities/${u.id}/${programSlug}`} className="text-ink-2 no-underline hover:text-navy">{program}</Link>
            <ChevronRight size={12}/>
            <span className="text-amber font-semibold">{spec}</span>
          </div>
        </div>
      </div>

      <div style={{ height: 3, background: u.color }} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)', borderBottom: '1px solid #1e2f45' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
          <div className="max-w-3xl">
            <div className="text-[11px] font-bold text-amber uppercase tracking-widest mb-2.5">
              {meta?.level === 'PG' ? 'Postgraduate' : 'Undergraduate'} · {duration} · UGC DEB Approved
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(1.5rem,3.5vw,2.2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 8 }}>
              {program} in {spec}
            </h1>
            <div className="text-slate-400 text-base mb-5">{cleanName}</div>
            {specContent?.heroSub && (
              <p className="text-slate-400 text-[15px] leading-relaxed mb-5">{specContent.heroSub}</p>
            )}

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 mb-6">
              {[
                { label: 'Total Fees',  value: fees },
                { label: 'Duration',    value: duration },
                ...(pd.avgSalary ? [{ label: 'Avg Salary', value: pd.avgSalary }] : []),
                ...(specContent?.salaryRange ? [{ label: 'Salary Range', value: specContent.salaryRange }] : []),
                { label: 'NIRF Rank',   value: u.nirf < 900 ? `#${u.nirf}` : 'Recognised' },
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
              <Link href={`/universities/${u.id}/${programSlug}`} style={{ padding: '13px 20px', borderRadius: 'var(--r-sm)', border: '1px solid #1e2f45', color: 'var(--ink-4)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                ← All {u.abbr} {program} Specs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-24 lg:pb-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-8">

            {/* About the specialisation */}
            {specContent && (
              <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-3">About {spec} Specialisation</h2>
                <p className="text-sm text-ink-2 leading-relaxed mb-4">{specContent.heroSub || `Online ${program} with ${spec} specialisation from ${cleanName}.`}</p>
                {specContent.salaryRange && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award size={16} className="text-amber-text shrink-0" />
                    <span className="text-ink-2">Salary range: </span>
                    <span className="font-bold text-green-700">{specContent.salaryRange}</span>
                  </div>
                )}
              </section>
            )}

            {/* Fee breakdown */}
            <section className="card-lg p-6">
              <h2 className="font-display text-xl font-bold text-navy mb-4">Fee Structure</h2>
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <tbody>
                    {[
                      { label: 'Total Programme Fee', value: fees },
                      { label: 'EMI Option', value: `From ₹${u.emiFrom.toLocaleString()}/month` },
                      { label: 'Duration', value: duration },
                      { label: 'NAAC Grade', value: u.naac },
                    ].map((row, i) => (
                      <tr key={row.label} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : 'var(--surface-2)' }}>
                        <td style={{ padding: '10px 14px', color: 'var(--ink-2)', fontSize: 13 }}>{row.label}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--navy)', textAlign: 'right' }}>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-amber/5 border border-amber/20 rounded-lg text-xs text-ink-3">
                Fees subject to change. Verify with university before enrolling.
              </div>
            </section>

            {/* Eligibility */}
            <section className="card-lg p-6">
              <h2 className="font-display text-xl font-bold text-navy mb-4">Who Can Apply</h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-ink-2">{eligibility}</span>
                </div>
                {u.eligibilityPct > 0 && (
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-ink-2">Minimum <strong>{u.eligibilityPct}%</strong> marks in qualifying exam</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-ink-2">No upper age limit — working professionals welcome</span>
                </div>
                {(u.forWho || []).map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-ink-2">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Syllabus */}
            {syllabus && <SyllabusSection syllabus={syllabus} program={program} universityName={u.name} />}

            {/* Career outcomes */}
            {((pd.roles?.length ?? 0) > 0 || (pd.topCompanies?.length ?? 0) > 0) && (
              <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-4">Career After {program} — {spec}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {(pd.roles?.length ?? 0) > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-navy mb-3"><Briefcase size={16} /> Job Roles</div>
                      <div className="flex flex-wrap gap-2">
                        {(pd.roles ?? []).map(role => (
                          <span key={role} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{role}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(pd.topCompanies?.length ?? 0) > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-navy mb-3"><TrendingUp size={16} /> Top Hiring Companies</div>
                      <div className="flex flex-wrap gap-2">
                        {(pd.topCompanies ?? []).slice(0, 8).map(c => (
                          <span key={c} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {pd.avgSalary && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 font-semibold mb-1"><Award size={16} /> Average Salary</div>
                    <div className="text-2xl font-bold text-green-700">{pd.avgSalary}</div>
                  </div>
                )}
              </section>
            )}

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
                  <span><strong>Exam mode:</strong> {u.examMode || 'Online proctored'}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-ink-2">
                  <BookOpen size={14} className="text-amber-text shrink-0 mt-0.5" />
                  <span><strong>Medium:</strong> English</span>
                </div>
              </div>
            </section>

            {/* CTA */}
            <div className="rounded-2xl border border-amber/30 bg-amber/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="font-bold text-navy text-sm mb-1">Have questions about this program?</div>
                <p className="text-xs text-ink-3 m-0">Our advisors can help with fees, admission, and specialisation details.</p>
              </div>
              <button
                onClick={() => setEnquiryOpen(true)}
                className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg,var(--amber),var(--amber-bright))' }}
              >
                Talk to an Advisor →
              </button>
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:w-80 shrink-0 flex flex-col gap-4">

            {/* University card */}
            <div className="card-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 shrink-0 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden p-1">
                  {u.logo
                    ? <img src={u.logo} alt={u.name} className="max-w-full max-h-full object-contain"
                        onError={e => { const t = e.target as HTMLImageElement; t.style.display='none'; const p=t.parentElement; if(p){p.style.background=u.color;p.innerHTML=`<span style="color:#fff;font-weight:800;font-size:13px">${(u.abbr||u.name).slice(0,2).toUpperCase()}</span>`}}} />
                    : <span style={{ color:'#fff', fontWeight:800, fontSize:13, background:u.color, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8 }}>{(u.abbr||u.name).slice(0,2).toUpperCase()}</span>
                  }
                </div>
                <div>
                  <div className="text-sm font-bold text-navy leading-snug">{cleanName}</div>
                  <div className="text-xs text-ink-3">{u.city} · NAAC {u.naac}</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                {u.approvals.slice(0, 4).map(a => (
                  <div key={a} className="flex items-center gap-2 text-ink-2">
                    <CheckCircle size={12} className="text-green-500 shrink-0" /> {a}
                  </div>
                ))}
              </div>
              <Link href={`/universities/${u.id}`} className="mt-4 block text-center py-2 rounded-lg border border-border text-xs font-semibold text-navy hover:border-amber transition-colors no-underline">
                View All {u.abbr} Programs
              </Link>
            </div>

            {/* All specs for this program */}
            {(pd.specs?.length ?? 0) > 0 && (
              <div className="card-lg p-5">
                <div className="text-xs font-bold text-ink-3 uppercase tracking-widest mb-3">Other Specialisations</div>
                <div className="flex flex-col gap-1">
                  {(pd.specs ?? []).filter(s => s !== spec).map(s => (
                    <Link key={s} href={`/universities/${u.id}/${programSlug}/${s.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}`}
                      className="text-sm text-ink-2 hover:text-amber transition-colors py-1.5 border-b border-border last:border-0 no-underline">
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Other Universities */}
        {otherUnis.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-navy mb-4">Other Universities Offering {program}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {otherUnis.map(ou => {
                const opd = ou.programDetails?.[program]
                return (
                  <Link key={ou.id} href={`/universities/${ou.id}/${programSlug}`}
                    className="block bg-white border border-border rounded-xl overflow-hidden hover:border-amber transition-colors no-underline">
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
    </>
  )
}
