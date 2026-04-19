'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle, ChevronRight, Briefcase, TrendingUp, Award,
  BookOpen, Star, ChevronDown, ChevronUp, GraduationCap, Zap, Shield
} from 'lucide-react'
import { getUniversitiesByProgram, formatFeeSlim as formatFee } from '@/lib/data-slim'
import { PROGRAM_META } from '@/lib/data-client'
import { getSpecContent, getSpecFallback, getUniversitySyllabus, getMasterSyllabus } from '@/lib/content'
import SyllabusSection from '@/components/SyllabusSection'
import type { Program, University } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'
import EdifyRecommends from '@/components/EdifyRecommends'
import { UNIVERSITY_REVIEWS, GENERIC_REVIEWS } from '@/lib/reviews-data'

interface Props {
  university: University
  program: Program
  programSlug: string
  spec: string
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= rating ? '#D4922A' : 'none'} stroke={i <= rating ? '#D4922A' : '#CBD5E1'} />
      ))}
    </div>
  )
}

// Enrolment social proof per university (approximate)
const ENROLMENT: Record<string, string> = {
  'lovely-professional-university-online': '20,548',
  'chandigarh-university-online': '15,200',
  'amity-university-online': '12,800',
  'nmims-online': '8,400',
  'symbiosis-university-online': '9,100',
  'manipal-university-jaipur-online': '11,500',
  'manipal-academy-higher-education-online': '14,300',
  'jain-university-online': '7,600',
  'dy-patil-university-online': '5,200',
  'bits-pilani-work-integrated-online': '6,800',
  'srm-institute-science-technology-online': '8,900',
}

export default function UniversitySpecClient({ university: u, program, programSlug, spec }: Props) {
  const [enquiryOpen, setEnquiryOpen]   = useState(false)
  const [openFaq, setOpenFaq]           = useState<number | null>(null)
  const [emiFormOpen, setEmiFormOpen]   = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  const pd           = u.programDetails[program]!
  const meta         = PROGRAM_META[program]
  const syllabus     = getMasterSyllabus(u.id, program) || getUniversitySyllabus(u.id, program)
  const specContent  = getSpecContent(spec) || getSpecFallback(spec, program)
  const otherUnis    = getUniversitiesByProgram(program).filter(x => x.id !== u.id).slice(0, 4)

  const isUG      = meta?.level === 'UG'
  const duration  = pd.duration || (isUG ? '3 Years' : '2 Years')
  const fees      = pd.fees || `₹${Math.round(u.feeMin / 1000)}K+`
  const cleanName = u.name.replace(/\bOnline\b\s*$/i, '').trim()
  const year      = new Date().getFullYear()

  // Reviews — filter by current program to avoid cross-program leakage
  const allUniReviews = UNIVERSITY_REVIEWS[u.id] || GENERIC_REVIEWS
  const filteredReviews = allUniReviews.filter(r => r.program.toLowerCase().includes(program.toLowerCase()))
  const rawReviews  = filteredReviews.length > 0 ? filteredReviews : allUniReviews.filter(r => GENERIC_REVIEWS.includes(r))
  const reviews     = showAllReviews ? rawReviews : rawReviews.slice(0, 6)
  const avgRating   = rawReviews.length > 0 ? (rawReviews.reduce((s, r) => s + r.rating, 0) / rawReviews.length).toFixed(1) : '4.5'
  const totalShown  = rawReviews.length >= 8 ? '200+' : '100+'

  // Key Highlights — built from actual university data
  const highlights = [
    { icon: '🏛️', label: 'Accreditation', value: `NAAC ${u.naac}${u.naacScore ? ` (${u.naacScore})` : ''}`, good: true },
    { icon: '📊', label: 'NIRF Rank', value: u.nirf > 0 && u.nirf < 900 ? `#${u.nirf} Overall${u.nirfMgt ? ` · #${u.nirfMgt} Mgmt` : ''}` : 'UGC Recognised', good: u.nirf > 0 && u.nirf < 200 },
    { icon: '✅', label: 'Approvals', value: u.approvals.slice(0, 3).join(' · '), good: true },
    { icon: '💻', label: 'Exam Mode', value: u.examMode || 'Online Proctored', good: true },
    { icon: '💰', label: 'EMI From', value: `₹${u.emiFrom.toLocaleString()}/month`, good: true },
    { icon: u.psuEligible ? '🏆' : '📋', label: 'Govt Job Eligible', value: u.psuEligible ? 'PSU & Govt Jobs Eligible' : 'Private Sector', good: u.psuEligible },
  ]

  // FAQs — spec-specific from content + standard questions
  const standardFaqs = [
    {
      q: `Is the ${program} degree from ${cleanName} valid for jobs?`,
      a: `Yes — 100% valid. ${cleanName} is UGC DEB approved, NAAC ${u.naac} accredited. The degree certificate is identical to a regular on-campus degree and is accepted by all private sector employers and government job portals where UGC DEB degrees are recognised.`,
    },
    {
      q: `What are the fees for ${program} ${spec} at ${cleanName}?`,
      a: `The total fee is ${fees}. EMI options start from ₹${u.emiFrom.toLocaleString()}/month. Many students use 0% or low-cost EMI through our lending partners. Fill the form above to get exact fee and EMI breakdown for your eligibility.`,
    },
    {
      q: `What is the eligibility for ${program} at ${cleanName}?`,
      a: `${u.eligibility}${u.eligibilityPct > 0 ? ` with minimum ${u.eligibilityPct}% marks.` : '.'} No upper age limit. Working professionals are welcome. No entrance exam required for online ${program} admission.`,
    },
    {
      q: `Can I study ${program} ${spec} while working full time?`,
      a: `Yes — designed specifically for working professionals. Live sessions are typically on weekends, with recorded lectures available 24/7. Exam mode: ${u.examMode || 'Online proctored'} — no travel to exam centres required.`,
    },
  ]
  const allFaqs = [...(specContent?.faqs || []), ...standardFaqs]

  return (
    <>
      <EnquiryModal isOpen={enquiryOpen || emiFormOpen} onClose={() => { setEnquiryOpen(false); setEmiFormOpen(false) }} universityName={u.name} universityId={u.id} defaultProgram={program} />

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

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)', borderBottom: '1px solid #1e2f45' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
          <div className="max-w-3xl">

            {/* University identity row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 shrink-0 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden p-1">
                {u.logo
                  ? <img src={u.logo} alt={u.name} className="max-w-full max-h-full object-contain" onError={e => { const t = e.target as HTMLImageElement; t.style.display='none'; const p=t.parentElement; if(p){p.style.background=u.color;p.innerHTML=`<span style="color:#fff;font-weight:800;font-size:12px">${(u.abbr||u.name).slice(0,2).toUpperCase()}</span>`}}} />
                  : <span style={{ color:'#fff', fontWeight:800, fontSize:12, background:u.color, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8 }}>{(u.abbr||u.name).slice(0,2).toUpperCase()}</span>
                }
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">{cleanName}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={11} fill={i <= Math.round(parseFloat(avgRating)) ? '#D4922A' : 'none'} stroke={i <= Math.round(parseFloat(avgRating)) ? '#D4922A' : '#475569'} />)}
                  </div>
                  <span className="text-amber text-xs font-bold">{avgRating}</span>
                  <span className="text-slate-400 text-xs">· {totalShown} verified students</span>
                  {ENROLMENT[u.id] && <span className="text-slate-500 text-xs">· {ENROLMENT[u.id]} enrolled</span>}
                </div>
              </div>
            </div>

            <div className="text-[11px] font-bold text-amber uppercase tracking-widest mb-2">
              {meta?.level === 'PG' ? 'Postgraduate' : 'Undergraduate'} · {duration} · UGC DEB Approved
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(1.5rem,3.5vw,2.3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 8 }}>
              Online {program} — {spec}
            </h1>
            {specContent?.heroSub && (
              <p className="text-slate-400 text-[15px] leading-relaxed mb-4">{specContent.heroSub}</p>
            )}

            {/* Approval badge pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                { label: `NAAC ${u.naac}`, color: u.naac === 'A++' ? '#16a34a' : u.naac === 'A+' ? '#0891b2' : '#7c3aed' },
                { label: 'UGC DEB', color: '#1d4ed8' },
                ...(u.nirf > 0 && u.nirf < 900 ? [{ label: `NIRF #${u.nirf}`, color: '#b45309' }] : []),
                ...u.approvals.filter(a => ['AICTE', 'AIU', 'WES Recognised', 'AACSB'].includes(a)).map(a => ({ label: a, color: '#374151' })),
                ...(u.psuEligible ? [{ label: 'PSU Eligible', color: '#065f46' }] : []),
              ].map(badge => (
                <span key={badge.label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
                  style={{ background: badge.color, opacity: 0.92 }}>
                  ✓ {badge.label}
                </span>
              ))}
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 mb-6">
              {[
                { label: 'Total Fees',    value: fees },
                { label: 'Duration',      value: duration },
                ...(specContent?.salaryRange ? [{ label: 'Avg Salary', value: specContent.salaryRange }] : pd.avgSalary ? [{ label: 'Avg Salary', value: pd.avgSalary }] : []),
                { label: 'NIRF Rank',     value: u.nirf > 0 && u.nirf < 900 ? `#${u.nirf}` : 'Recognised' },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid #1e2f45', borderRadius: 'var(--r-sm)' }}>
                  <div className="text-[9px] sm:text-[10px] text-ink-3 uppercase tracking-wider">{s.label}</div>
                  <div className="text-[13px] sm:text-[15px] font-bold text-white">{s.value}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setEnquiryOpen(true)} style={{ padding: '13px 28px', borderRadius: 'var(--r-sm)', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                Apply Now — Free →
              </button>
              <button onClick={() => setEnquiryOpen(true)} style={{ padding: '13px 20px', borderRadius: 'var(--r-sm)', border: '2px solid rgba(255,255,255,0.2)', color: '#fff', background: 'rgba(255,255,255,0.07)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Download Brochure
              </button>
              <button onClick={() => setEmiFormOpen(true)} style={{ padding: '13px 20px', borderRadius: 'var(--r-sm)', border: '2px solid rgba(201,146,42,0.4)', color: 'var(--amber-text)', background: 'transparent', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Check EMI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── COMPARE STRIP ────────────────────────────────────────────── */}
      {otherUnis.length > 0 && (
        <div className="bg-white border-b border-border overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-stretch gap-0 min-w-max">
              <div className="flex items-center pr-4 py-3 text-xs font-bold text-ink-3 uppercase tracking-widest shrink-0 border-r border-border">
                Compare
              </div>
              {otherUnis.slice(0, 5).map(ou => {
                const opd = ou.programDetails?.[program]
                return (
                  <Link key={ou.id} href={`/universities/${ou.id}/${programSlug}`}
                    className="flex items-center gap-3 px-4 py-3 border-r border-border hover:bg-amber/5 transition-colors no-underline group shrink-0">
                    <div className="w-7 h-7 rounded-lg border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {ou.logo
                        ? <img src={ou.logo} alt={ou.name} className="max-w-full max-h-full object-contain p-0.5" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                        : <span style={{ fontSize:9, fontWeight:800, color:'#fff', background:ou.color, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6 }}>{ou.abbr?.slice(0,2)}</span>
                      }
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy group-hover:text-amber transition-colors leading-tight">{ou.abbr}</div>
                      <div className="text-[10px] text-ink-3">{opd?.fees || formatFee(ou.feeMin)} · NAAC {ou.naac}</div>
                    </div>
                  </Link>
                )
              })}
              <Link href={`/universities?program=${programSlug}`}
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold text-amber hover:underline no-underline shrink-0">
                View all <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-28 lg:pb-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left column */}
          <div className="flex-1 flex flex-col gap-8 min-w-0">

            {/* ── KEY HIGHLIGHTS ─────────────────────────────────── */}
            <section className="card-lg overflow-hidden">
              <div className="px-6 pt-5 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-amber-text" />
                  <h2 className="font-display text-lg font-bold text-navy">{cleanName} {program} in {spec} — Key Facts {year}</h2>
                </div>
                <p className="text-xs text-ink-3">Why {cleanName} stands out for {program} — {spec}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
                {highlights.map((h, i) => (
                  <div key={i} className="bg-white p-4">
                    <div className="text-xl mb-1.5">{h.icon}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ink-3 mb-1">{h.label}</div>
                    <div className={`text-sm font-bold leading-snug ${h.good ? 'text-navy' : 'text-ink-2'}`}>{h.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── ABOUT THE SPECIALISATION ───────────────────────── */}
            {specContent?.overview && (
              <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-3">About {spec} in {cleanName} Online {program}</h2>
                <p className="text-sm text-ink-2 leading-relaxed mb-4">{specContent.overview}</p>
                {(specContent?.whyChoose?.length ?? 0) > 0 && (
                  <div className="flex flex-col gap-2.5 mt-4">
                    <div className="text-xs font-bold text-navy uppercase tracking-wider mb-1">Why Choose This Specialisation</div>
                    {(specContent?.whyChoose ?? []).map((reason, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-ink-2 leading-snug">{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── SKILLS YOU'LL GAIN ─────────────────────────────── */}
            {(specContent?.skills?.length ?? 0) > 0 && (
              <section className="card-lg p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                    style={{ background: 'rgba(212,146,42,0.12)', color: 'var(--amber-text)', border: '1px solid rgba(212,146,42,0.3)' }}>
                    ✦ Edify Recommends
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-navy mb-1">Skills to Learn Alongside Your {program}</h2>
                <p className="text-sm text-ink-3 mb-4">EdifyEdu recommends picking up these skills during or after your {spec} specialisation. They are not part of the university syllabus.</p>
                <div className="flex flex-wrap gap-2">
                  {(specContent?.skills ?? []).map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      <CheckCircle size={11} className="shrink-0" /> {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* ── CERTIFICATIONS ─────────────────────────────────── */}
            {(specContent?.certifications?.length ?? 0) > 0 && (
              <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-1">Recommended Certifications</h2>
                <p className="text-sm text-ink-3 mb-4">Stack these certifications alongside your degree for maximum career impact</p>
                <div className="flex flex-col gap-3">
                  {(specContent?.certifications ?? []).map((cert, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-1 border border-border">
                      <Award size={16} className="text-amber-text shrink-0 mt-0.5" />
                      <span className="text-sm text-ink-2 leading-snug">{cert}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── CAREER PATHS ───────────────────────────────────── */}
            {(specContent?.careerBeginner?.length || specContent?.careerMid?.length || specContent?.careerSenior?.length) && (
              <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-1">Career Path After {spec} — {cleanName} {program} Scope</h2>
                <p className="text-sm text-ink-3 mb-5">Roles at each career stage after {program} in {spec}</p>
                <div className="flex flex-col gap-5">
                  {[
                    { label: 'Entry Level (0–2 yrs)', roles: specContent?.careerBeginner, color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
                    { label: 'Mid Level (3–6 yrs)', roles: specContent?.careerMid, color: '#0891B2', bg: '#F0F9FF', border: '#BAE6FD' },
                    { label: 'Senior Level (7+ yrs)', roles: specContent?.careerSenior, color: '#7C3AED', bg: '#FAF5FF', border: '#E9D5FF' },
                  ].filter(stage => (stage.roles?.length ?? 0) > 0).map(stage => (
                    <div key={stage.label}>
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: stage.color }}>{stage.label}</div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {(stage.roles ?? []).map(role => (
                          <div key={role.title} className="p-3 rounded-xl border" style={{ background: stage.bg, borderColor: stage.border }}>
                            <div className="text-sm font-bold text-navy leading-snug mb-1">{role.title}</div>
                            <div className="text-xs text-ink-3 leading-snug">{role.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── SALARY & GROWTH ────────────────────────────────── */}
            {(specContent?.salaryGrowth || specContent?.salaryRange) && (
              <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-4">{spec} Salary & Career Growth After {cleanName} {program}</h2>
                {specContent?.salaryRange && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 mb-4">
                    <div className="flex items-center gap-2 text-green-800 font-bold text-sm mb-0.5"><TrendingUp size={16} /> Salary Range</div>
                    <div className="text-2xl font-extrabold text-green-700">{specContent.salaryRange}</div>
                  </div>
                )}
                {specContent?.salaryGrowth && (
                  <p className="text-sm text-ink-2 leading-relaxed">{specContent.salaryGrowth}</p>
                )}
                {(specContent?.topCompanies?.length ?? 0) > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-navy mb-2">Top Hiring Companies</div>
                    <div className="flex flex-wrap gap-2">
                      {(specContent?.topCompanies ?? (pd.topCompanies ?? [])).slice(0, 10).map(c => (
                        <span key={c} className="px-3 py-1 bg-surface-2 border border-border rounded-full text-xs font-medium text-ink-2">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ── SYLLABUS ───────────────────────────────────────── */}
            {syllabus && <SyllabusSection syllabus={syllabus} program={program} universityName={u.name} />}

            {/* ── FEE STRUCTURE + EMI ────────────────────────────── */}
            <section className="card-lg p-6">
              <h2 className="font-display text-xl font-bold text-navy mb-4">{cleanName} Online {program} in {spec} Fees {year} — EMI Options</h2>
              <div className="overflow-x-auto mb-4">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <tbody>
                    {[
                      { label: 'Total Programme Fee', value: fees },
                      { label: 'Semester Fee (approx)', value: `${fees.split('–')[0]}+ per semester` },
                      { label: 'EMI Starting From', value: `₹${u.emiFrom.toLocaleString()}/month` },
                      { label: 'No-cost EMI', value: 'Available via Edify partners*' },
                      { label: 'Duration', value: duration },
                      { label: 'Exam Mode', value: u.examMode || 'Online Proctored' },
                    ].map((row, i) => (
                      <tr key={row.label} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : 'var(--surface-2)' }}>
                        <td style={{ padding: '10px 14px', color: 'var(--ink-2)', fontSize: 13 }}>{row.label}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--navy)', textAlign: 'right' }}>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* EMI CTA */}
              <div className="p-4 rounded-xl border border-amber/30 bg-amber/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-navy text-sm mb-1">Get Exact EMI Calculation</div>
                    <p className="text-xs text-ink-3">No-cost EMI options available. Exact EMI depends on tenure & bank. Our counsellors will share exact breakdown on WhatsApp.</p>
                    <p className="text-[10px] text-ink-3 mt-1">*No-cost EMI via partner lending institutions. Subject to eligibility.</p>
                  </div>
                  <button onClick={() => setEmiFormOpen(true)} className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg,var(--amber),var(--amber-bright))' }}>
                    Check My EMI →
                  </button>
                </div>
              </div>
            </section>

            {/* ── SAMPLE DEGREE ──────────────────────────────────── */}
            <section className="card-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap size={20} className="text-amber-text" />
                  <h2 className="font-display text-xl font-bold text-navy">Your Degree Certificate</h2>
                </div>
                <p className="text-sm text-ink-2 leading-relaxed mb-4">
                  Upon successful completion, {cleanName} awards you an official degree certificate that is:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  {[
                    { icon: '✅', text: 'Identical to the on-campus degree — same university, same certificate' },
                    { icon: '🏛️', text: `Accredited by NAAC ${u.naac} and approved by UGC DEB` },
                    { icon: '📋', text: 'Valid for private sector, banks, corporate hiring India-wide' },
                    { icon: u.psuEligible ? '🏆' : '📝', text: u.psuEligible ? 'Valid for PSU and government job applications' : 'Valid for all private sector and MNC hiring' },
                    { icon: '🌍', text: u.approvals.includes('WES Recognised') ? 'WES recognised — valid for immigration and jobs abroad' : 'AICTE approved — recognised across India' },
                    { icon: '📱', text: 'DigiLocker accessible — share digitally with any employer' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-1 border border-border">
                      <span className="text-lg shrink-0">{item.icon}</span>
                      <span className="text-xs text-ink-2 leading-snug">{item.text}</span>
                    </div>
                  ))}
                </div>
                {/* Degree mockup card */}
                <div className="rounded-xl border-2 border-dashed border-amber/40 bg-amber/3 p-5 text-center" style={{ background: 'linear-gradient(135deg, rgba(212,146,42,0.04), rgba(212,146,42,0.08))' }}>
                  <div className="text-3xl mb-2">🎓</div>
                  <div className="text-xs font-bold text-amber uppercase tracking-widest mb-1">Master of Business Administration</div>
                  <div className="font-display text-lg font-extrabold text-navy mb-0.5">{spec} Specialisation</div>
                  <div className="text-sm text-ink-3 mb-3">{cleanName}</div>
                  <div className="flex justify-center flex-wrap gap-2 text-[10px]">
                    {u.approvals.slice(0, 4).map(a => (
                      <span key={a} className="px-2 py-1 rounded-full bg-white border border-border font-semibold text-ink-2">{a}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-ink-3 mt-3">Sample preview — actual certificate issued by {cleanName}</p>
                </div>
              </div>
            </section>

            {/* ── ELIGIBILITY ────────────────────────────────────── */}
            <section className="card-lg p-6">
              <h2 className="font-display text-xl font-bold text-navy mb-4">{cleanName} {program} in {spec} Eligibility & Admission {year}</h2>
              <div className="flex flex-col gap-3 mb-5">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-navy">{isUG ? '10+2 / 12th Pass' : 'Any Graduation'}</div>
                    <div className="text-xs text-ink-3">{u.eligibility}</div>
                  </div>
                </div>
                {u.eligibilityPct > 0 && (
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-navy">Minimum {u.eligibilityPct}% marks</div>
                      <div className="text-xs text-ink-3">In qualifying exam (graduation or 12th)</div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-navy">No upper age limit</div>
                    <div className="text-xs text-ink-3">Working professionals of any age are welcome</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-navy">No entrance exam</div>
                    <div className="text-xs text-ink-3">Direct admission — no CAT, MAT, or GMAT required</div>
                  </div>
                </div>
                {(u.forWho || []).map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-ink-2">{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setEnquiryOpen(true)} className="w-full py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)' }}>
                Check My Eligibility — Free →
              </button>
            </section>

            {/* ── EXAMINATION PATTERN ────────────────────────────── */}
            <section className="card-lg p-6">
              <h2 className="font-display text-xl font-bold text-navy mb-4">{cleanName} {program} in {spec} — Exam Pattern & Assessment</h2>
              <div className="overflow-x-auto mb-4">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                      {['Component', 'Details', 'Weightage'].map((h, i) => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: i === 2 ? 'right' : 'left', fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--border)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { component: 'Internal Assessment', details: 'Assignments, Projects & Case Studies', weightage: '30%' },
                      { component: 'External Assessment', details: `End-term Examination (${u.examMode || 'Online Proctored'})`, weightage: '70%' },
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
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: <BookOpen size={13} />, label: 'Minimum passing', value: '40% in each subject' },
                  { icon: <BookOpen size={13} />, label: 'Medium', value: 'English' },
                  { icon: <Shield size={13} />, label: 'Exam mode', value: u.examMode || 'Online Proctored' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-2 p-3 rounded-lg bg-surface-1 border border-border text-xs text-ink-2">
                    <span className="text-amber-text mt-0.5">{item.icon}</span>
                    <div><span className="font-semibold text-navy">{item.label}:</span> {item.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── PROJECT IDEAS ──────────────────────────────────── */}
            {(specContent?.projectIdeas?.length ?? 0) > 0 && (
              <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-1">Real-World Project Ideas</h2>
                <p className="text-sm text-ink-3 mb-4">Build these projects during your program to stand out in interviews</p>
                <div className="flex flex-col gap-3">
                  {(specContent?.projectIdeas ?? []).map((idea, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-1 border border-border">
                      <span className="text-sm font-bold text-amber shrink-0">{i + 1}.</span>
                      <span className="text-sm text-ink-2 leading-snug">{idea}</span>
                    </div>
                  ))}
                </div>
                {specContent?.resumeTip && (
                  <div className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50">
                    <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Resume Tip</div>
                    <p className="text-sm text-blue-800 leading-relaxed">{specContent.resumeTip}</p>
                  </div>
                )}
              </section>
            )}

            {/* ── REVIEWS ────────────────────────────────────────── */}
            <section className="card-lg p-6">
              {/* Rating header */}
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                {/* Big rating + stars */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-amber/5 border border-amber/20 shrink-0 w-36 text-center">
                  <div className="text-4xl font-extrabold text-navy leading-none mb-1">{avgRating}</div>
                  <StarRating rating={Math.round(parseFloat(avgRating))} size={14} />
                  <div className="text-xs text-ink-3 mt-1.5">{totalShown} students</div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-green-600 font-semibold">
                    <Shield size={10} /> Verified
                  </div>
                </div>
                {/* Star breakdown bars */}
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold text-navy mb-3">{cleanName} {program} in {spec} Reviews — Student Feedback</h2>
                  <div className="flex flex-col gap-2">
                    {[5,4,3,2,1].map(r => {
                      const count = rawReviews.filter(rv => rv.rating === r).length
                      const pct = rawReviews.length ? Math.round((count / rawReviews.length) * 100) : 0
                      return (
                        <div key={r} className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-0.5 shrink-0 w-14 justify-end">
                            <Star size={10} fill="#D4922A" stroke="#D4922A" />
                            <span className="font-bold text-navy">{r} star</span>
                          </div>
                          <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: r >= 4 ? '#D4922A' : r === 3 ? '#94a3b8' : '#e2e8f0' }} />
                          </div>
                          <span className="text-ink-3 shrink-0 w-8 text-right">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Review cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {reviews.map((rv, i) => (
                  <div key={i} className="p-4 rounded-xl bg-surface-1 border border-border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: u.color }}>
                          {rv.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-navy leading-none">{rv.name}</div>
                          <div className="text-[10px] text-ink-3">{rv.city} · {rv.date}</div>
                        </div>
                      </div>
                      <StarRating rating={rv.rating} size={12} />
                    </div>
                    <div className="text-[10px] font-semibold text-amber mb-1.5">{rv.program}</div>
                    <p className="text-xs text-ink-2 leading-relaxed">{rv.review}</p>
                  </div>
                ))}
              </div>

              {rawReviews.length > 6 && (
                <button onClick={() => setShowAllReviews(!showAllReviews)} className="mt-4 w-full py-2.5 rounded-xl border border-border text-sm font-semibold text-navy hover:border-amber transition-colors flex items-center justify-center gap-1.5">
                  {showAllReviews ? <><ChevronUp size={16} />Show Less</> : <><ChevronDown size={16} />Show All {rawReviews.length} Reviews</>}
                </button>
              )}

              <div className="mt-4 p-3 rounded-lg bg-surface-1 border border-border text-xs text-ink-3 flex items-center gap-2">
                <Shield size={12} className="text-green-500 shrink-0" />
                Reviews collected from verified students via Edify counselling platform. {totalShown} reviews across all programs at {cleanName}.
              </div>
            </section>

            {/* ── FAQs ───────────────────────────────────────────── */}
            <section className="card-lg p-6">
              <h2 className="font-display text-xl font-bold text-navy mb-4">FAQs — {cleanName} {program} in {spec} {year}</h2>
              <div className="flex flex-col divide-y divide-border">
                {allFaqs.map((faq, i) => (
                  <div key={i} className="py-4">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex items-start justify-between gap-3 w-full text-left">
                      <span className="text-sm font-semibold text-navy leading-snug">{faq.q}</span>
                      {openFaq === i ? <ChevronUp size={18} className="text-amber shrink-0 mt-0.5" /> : <ChevronDown size={18} className="text-ink-3 shrink-0 mt-0.5" />}
                    </button>
                    {openFaq === i && (
                      <p className="mt-3 text-sm text-ink-2 leading-relaxed pr-6">{faq.a}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ── SIDEBAR ──────────────────────────────────────────── */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-20 flex flex-col gap-4">

              {/* Admission CTA */}
              <div className="p-5 rounded-xl" style={{ background: 'linear-gradient(135deg,#0B1D35,#142540)', border: '1px solid rgba(200,129,26,0.3)' }}>
                <div className="text-[10px] font-bold text-amber uppercase tracking-wider mb-1">🎓 Admissions Open {year}</div>
                <div className="text-sm text-slate-300 mb-1">{program} — {spec}</div>
                <div className="text-white font-bold mb-3">{cleanName}</div>
                <button onClick={() => setEnquiryOpen(true)} className="w-full py-2.5 rounded-lg font-bold text-white text-sm mb-2" style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)' }}>
                  Get Free Counselling →
                </button>
                <button onClick={() => setEmiFormOpen(true)} className="w-full py-2 rounded-lg text-xs font-semibold border border-amber/30 text-amber">
                  Check EMI Options
                </button>
              </div>

              {/* University card */}
              <div className="card-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 shrink-0 rounded-lg border border-border bg-white flex items-center justify-center overflow-hidden p-1">
                    {u.logo
                      ? <img src={u.logo} alt={u.name} className="max-w-full max-h-full object-contain" onError={e => { const t = e.target as HTMLImageElement; t.style.display='none'; const p=t.parentElement; if(p){p.style.background=u.color;p.innerHTML=`<span style="color:#fff;font-weight:800;font-size:11px">${(u.abbr||u.name).slice(0,2).toUpperCase()}</span>`}}} />
                      : <span style={{ color:'#fff', fontWeight:800, fontSize:11, background:u.color, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6 }}>{(u.abbr||u.name).slice(0,2).toUpperCase()}</span>
                    }
                  </div>
                  <div>
                    <div className="text-sm font-bold text-navy leading-snug">{cleanName}</div>
                    <div className="text-xs text-ink-3">{u.city} · NAAC {u.naac}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mb-3">
                  {u.approvals.slice(0, 5).map(a => (
                    <div key={a} className="flex items-center gap-1.5 text-xs text-ink-2">
                      <CheckCircle size={11} className="text-green-500 shrink-0" /> {a}
                    </div>
                  ))}
                </div>
                <Link href={`/universities/${u.id}`} className="block text-center py-2 rounded-lg border border-border text-xs font-semibold text-navy hover:border-amber transition-colors no-underline">
                  View All {u.abbr} Programs →
                </Link>
              </div>

              {/* Edify Recommends */}
              <EdifyRecommends program={program} currentId={u.id} programSlug={programSlug} />

              {/* Other Specialisations */}
              {(pd.specs?.length ?? 0) > 1 && (
                <div className="card-lg p-4">
                  <div className="text-xs font-bold text-ink-3 uppercase tracking-widest mb-3">Other {u.abbr} {program} Specs</div>
                  <div className="flex flex-col gap-0.5">
                    {(pd.specs ?? []).filter(s => s !== spec).slice(0, 8).map(s => {
                      const slug = s.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
                      return (
                        <Link key={s} href={`/universities/${u.id}/${programSlug}/${slug}`}
                          className="text-sm text-ink-2 hover:text-amber transition-colors py-1.5 border-b border-border last:border-0 no-underline block truncate">
                          {s}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── COMPARE UNIVERSITIES (full cards) ───────────────── */}
        {otherUnis.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy">Compare {cleanName} {program} with Similar Online Programs</h2>
              <Link href={`/universities?program=${programSlug}`} className="text-xs text-amber font-semibold hover:underline no-underline">View all →</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {otherUnis.map(ou => {
                const opd = ou.programDetails?.[program]
                return (
                  <Link key={ou.id} href={`/universities/${ou.id}/${programSlug}`}
                    className="block bg-white border border-border rounded-xl overflow-hidden hover:border-amber transition-colors no-underline">
                    <div style={{ height: 3, background: ou.color }} />
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-md border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                          {ou.logo
                            ? <img src={ou.logo} alt={ou.name} className="max-w-full max-h-full object-contain p-0.5" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                            : <span style={{ fontSize:8, fontWeight:800, color:'#fff', background:ou.color, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:4 }}>{ou.abbr?.slice(0,2)}</span>
                          }
                        </div>
                        <div className="font-bold text-navy text-sm leading-snug truncate">{ou.name.replace(/\bOnline\b\s*$/i, '')}</div>
                      </div>
                      <div className="text-xs text-ink-3 mb-2">{ou.city} · NAAC {ou.naac}{ou.nirf < 200 ? ` · NIRF #${ou.nirf}` : ''}</div>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-border">
                        <span className="text-ink-2">Fees: <strong className="text-navy">{opd?.fees || formatFee(ou.feeMin)}</strong></span>
                        <span className="text-amber font-bold">{opd?.avgSalary?.split('–')[0] || '₹4L'}+</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-white border-t border-border flex gap-2" style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}>
        <button onClick={() => setEmiFormOpen(true)} className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-amber text-amber">
          EMI Options
        </button>
        <button onClick={() => setEnquiryOpen(true)} className="flex-1 py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)' }}>
          Free Counselling →
        </button>
      </div>
    </>
  )
}
