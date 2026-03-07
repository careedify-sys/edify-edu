'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, CheckCircle, XCircle, BarChart2, ChevronRight, Briefcase, TrendingUp, Building2, Plus, Users, BookOpen } from 'lucide-react'
import { getUniversityById, getUniversitiesByProgram, formatFee } from '@/lib/data'
import type { Program } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'

const progSlug = (p: Program) => p.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

export default function UniversityPage() {
  const params = useParams()
  const id = params?.id as string
  const u = getUniversityById(id)
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [activeProgram, setActiveProgram] = useState<Program | null>(null)
  const [compareList, setCompareList] = useState<string[]>([])
  const [compareNotice, setCompareNotice] = useState(false)

  if (!u) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--ink-3)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <p style={{ marginBottom: '12px' }}>University not found.</p>
        <Link href="/universities" style={{ color: 'var(--amber-bright)' }}>Browse all →</Link>
      </div>
    </div>
  )

  const displayProgram: Program = activeProgram || u.programs[0]
  const pd = u.programDetails[displayProgram]
  const otherUnis = getUniversitiesByProgram(displayProgram).filter(x => x.id !== u.id).slice(0, 4)
  const compareUrl = `/compare?a=${u.id}${compareList.map(i => `&b=${i}`).join('')}`

  function addToCompare(uniId: string) {
    if (compareList.includes(uniId)) return
    setCompareList(prev => [...prev, uniId].slice(-2))
    setCompareNotice(true)
    setTimeout(() => setCompareNotice(false), 3000)
  }

  return (
    <>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ height: '3px', background: u.color }} />

        {/* Breadcrumb */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F4' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ink-2)', flexWrap: 'wrap' }}>
              <Link href="/" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Home</Link>
              <ChevronRight size={12} />
              <Link href="/universities" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Universities</Link>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--amber-bright)', fontWeight: '600' }}>{u.name}</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F4' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Approvals */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {u.approvals.map(a => (
                  <span key={a} style={{ fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '999px', background: 'rgba(74,222,128,0.08)', color: '#15803D', border: '1px solid rgba(74,222,128,0.2)' }}>
                    ✓ {a}
                  </span>
                ))}
              </div>

              <h1 className="font-display" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: '800', color: 'var(--navy)', lineHeight: '1.2' }}>
                {u.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-3)', flexWrap: 'wrap' }}>
                <MapPin size={14} />
                <span>{u.city}, {u.state}</span>
                <span>·</span>
                <span style={{ color: 'var(--amber-bright)', fontWeight: '700' }}>NIRF #{u.nirf}</span>
                {u.nirfm && <><span>·</span><span style={{ color: '#a78bfa', fontWeight: '700' }}>NIRF Management #{u.nirfm}</span></>}
                <span>·</span>
                <span>NAAC {u.naac}</span>
                <span>·</span>
                <span>{u.examMode}</span>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--ink-3)', lineHeight: '1.7', maxWidth: '640px' }}>{u.description}</p>

              {/* Stats */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {[
                  { label: 'Fee Range', value: `${formatFee(u.feeMin)} – ${formatFee(u.feeMax)}` },
                  { label: 'EMI from', value: `₹${u.emiFrom.toLocaleString()}/mo` },
                  { label: 'Eligibility', value: u.eligibility },
                  { label: 'Programs', value: `${u.programs.length}` },
                  { label: 'Exam Mode', value: u.examMode },
                ].map(s => (
                  <div key={s.label} style={{ padding: '10px 16px', background: '#fff', border: '1px solid #E2E8F4', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--navy)' }}>{s.value}</div>
                    <div style={{ fontSize: '10px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => setEnquiryOpen(true)}
                  style={{ padding: '12px 28px', borderRadius: '12px', background: 'linear-gradient(135deg,#F59E0B,#F5C842)', color: 'var(--navy)', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                  📩 Get Free Counselling
                </button>
                <Link href={`/compare?a=${u.id}`}
                  style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #E2E8F4', color: 'var(--ink-3)', fontSize: '13px', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BarChart2 size={15} /> Compare
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="uni-detail-layout" style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

            {/* MAIN */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Program Tabs + Details */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', background: 'rgba(201,146,42,0.06)', borderBottom: '1px solid #E2E8F4' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber-bright)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Programs Offered</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {u.programs.map(prog => (
                      <button key={prog} onClick={() => setActiveProgram(prog)}
                        style={{ padding: '7px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                          background: displayProgram === prog ? '#c9922a' : 'transparent',
                          color: displayProgram === prog ? 'var(--navy)' : '#64748b',
                          border: `1px solid ${displayProgram === prog ? '#c9922a' : 'var(--border)'}` }}>
                        {prog}
                      </button>
                    ))}
                  </div>
                </div>

                {pd ? (
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Quick stats row */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Fees', value: pd.fees },
                        { label: 'Duration', value: pd.duration },
                        { label: 'Avg Salary', value: pd.avgSalary.split('–')[0].trim() + '+' },
                        { label: 'Specialisations', value: `${pd.specs.length}` },
                      ].map(s => (
                        <div key={s.label} style={{ padding: '8px 14px', background: 'var(--bg)', border: '1px solid #E2E8F4', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy)' }}>{s.value}</div>
                          <div style={{ fontSize: '10px', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Specialisations */}
                    <div style={{ padding: '14px', background: 'var(--bg)', border: '1px solid #E2E8F4', borderRadius: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber-bright)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <BookOpen size={12} /> Specialisations ({pd.specs.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {pd.specs.map(s => (
                          <span key={s} style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '999px', background: 'rgba(201,146,42,0.06)', color: 'var(--ink-3)', border: '1px solid #E2E8F4' }}>{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* Roles + Salary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px' }}>
                      <div style={{ padding: '14px', background: 'var(--bg)', border: '1px solid #E2E8F4', borderRadius: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber-bright)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Briefcase size={12} /> Target Roles
                        </div>
                        {pd.roles.map(r => (
                          <div key={r} style={{ display: 'flex', gap: '7px', alignItems: 'center', marginBottom: '6px', fontSize: '12px', color: 'var(--ink-3)' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#c9922a', flexShrink: 0 }} />{r}
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: '14px', background: 'var(--bg)', border: '1px solid #E2E8F4', borderRadius: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803D', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <TrendingUp size={12} /> Salary Range
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--navy)', marginBottom: '6px' }}>{pd.avgSalary}</div>
                        <div style={{ fontSize: '11px', color: 'var(--ink-3)', lineHeight: '1.6' }}>Based on industry data for {displayProgram} graduates</div>
                      </div>
                    </div>

                    {/* Companies */}
                    <div style={{ padding: '14px', background: 'var(--bg)', border: '1px solid #E2E8F4', borderRadius: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#0891B2', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Building2 size={12} /> Companies to Target
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {pd.topCompanies.map(c => (
                          <span key={c} style={{ fontSize: '12px', padding: '4px 12px', background: '#F1F4F9', border: '1px solid #E2E8F4', borderRadius: '8px', color: 'var(--ink-2)' }}>{c}</span>
                        ))}
                      </div>
                    </div>

                    {/* Internship */}
                    <div style={{ padding: '14px', background: 'var(--bg)', border: '1px solid #E2E8F4', borderRadius: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#a78bfa', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Users size={12} /> Internship & Projects
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: '1.7' }}>{pd.internshipType}</p>
                    </div>

                    <Link href={`/universities/${u.id}/${progSlug(displayProgram)}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', borderRadius: '10px', background: 'rgba(201,146,42,0.08)', border: '1px solid rgba(201,146,42,0.2)', color: 'var(--amber-bright)', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>
                      View Full {displayProgram} Page — All Specs, FAQs & Career Guide →
                    </Link>
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: '13px' }}>No details yet for this program.</div>
                )}
              </div>

              {/* For Who / Not For */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px' }}>
                <div style={{ padding: '18px', background: '#F0FDF4', border: '1px solid rgba(21,128,61,0.15)', borderRadius: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>✓ Right for you if</div>
                  {u.forWho.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', fontSize: '13px', color: 'var(--ink-3)' }}>
                      <CheckCircle size={14} color="#15803D" style={{ flexShrink: 0, marginTop: '2px' }} />{item}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '18px', background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>✗ Think twice if</div>
                  {u.notFor.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', fontSize: '13px', color: 'var(--ink-3)' }}>
                      <XCircle size={14} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />{item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Inline CTA */}
              <div style={{ padding: '24px', background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎓</div>
                <h3 className="font-display" style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '15px', marginBottom: '6px' }}>
                  Want to apply to {u.name}?
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-3)', marginBottom: '16px' }}>
                  Free counselling — we'll verify your eligibility and guide you to the right specialisation.
                </p>
                <button onClick={() => setEnquiryOpen(true)}
                  style={{ padding: '12px 28px', borderRadius: '12px', background: 'linear-gradient(135deg,#F59E0B,#F5C842)', color: 'var(--navy)', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                  Get Free Counselling →
                </button>
              </div>

              {/* Compare with Others */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', background: 'rgba(201,146,42,0.06)', borderBottom: '1px solid #E2E8F4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber-bright)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Compare with Other Universities
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '2px' }}>
                      Click + to select, then compare side-by-side
                    </div>
                  </div>
                  {compareList.length > 0 && (
                    <Link href={compareUrl}
                      style={{ padding: '9px 18px', borderRadius: '10px', background: 'linear-gradient(135deg,#F59E0B,#F5C842)', color: 'var(--navy)', fontWeight: '700', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BarChart2 size={14} /> Compare {compareList.length + 1} Universities →
                    </Link>
                  )}
                </div>

                <div style={{ padding: '16px 20px' }}>
                  {compareNotice && (
                    <div style={{ marginBottom: '12px', padding: '10px 16px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '10px', fontSize: '13px', color: '#15803D', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      ✓ Added to comparison!
                      <Link href={compareUrl} style={{ color: 'var(--amber-bright)', fontWeight: '700', textDecoration: 'none' }}>
                        Open Comparison →
                      </Link>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '12px' }}>
                    {otherUnis.map(ou => {
                      const opd = ou.programDetails[displayProgram]
                      const inCompare = compareList.includes(ou.id)
                      return (
                        <div key={ou.id} style={{ background: 'var(--bg)', border: `1px solid ${inCompare ? 'var(--amber-bright)' : 'var(--border)'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.15s' }}>
                          <div style={{ height: '2px', background: ou.color }} />
                          <div style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                                <Link href={`/universities/${ou.id}`}
                                  style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '13px', textDecoration: 'none', display: 'block' }}>{ou.name}</Link>
                                <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '2px' }}>{ou.city} · NIRF #{ou.nirf}</div>
                              </div>
                              <button onClick={() => addToCompare(ou.id)}
                                style={{ width: '30px', height: '30px', borderRadius: '8px', border: `1px solid ${inCompare ? 'var(--amber-bright)' : 'var(--border)'}`, background: inCompare ? 'rgba(201,146,42,0.15)' : '#fff', color: inCompare ? '#c9922a' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '15px' }}>
                                {inCompare ? '✓' : <Plus size={14} />}
                              </button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingTop: '8px', borderTop: '1px solid #1e2f45' }}>
                              <span style={{ color: 'var(--ink-3)' }}>Fees: <strong style={{ color: 'var(--navy)' }}>{opd?.fees || `${formatFee(ou.feeMin)}+`}</strong></span>
                              <span style={{ color: '#15803D', fontWeight: '600' }}>{opd?.avgSalary?.split('–')[0].trim() || '₹4L'}+</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {compareList.length > 0 && (
                    <div style={{ marginTop: '14px', padding: '12px 16px', background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--ink-3)' }}>
                        <strong style={{ color: 'var(--navy)' }}>{u.abbr}</strong>{' vs '}
                        <strong style={{ color: 'var(--amber-bright)' }}>{compareList.map(cid => getUniversityById(cid)?.abbr).join(' vs ')}</strong>
                      </span>
                      <Link href={compareUrl}
                        style={{ padding: '9px 18px', borderRadius: '10px', background: 'linear-gradient(135deg,#F59E0B,#F5C842)', color: 'var(--navy)', fontWeight: '700', fontSize: '12px', textDecoration: 'none' }}>
                        Open Full Comparison →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div style={{ width: '240px', flexShrink: 0 }} className="hidden lg:block">
              <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <button onClick={() => setEnquiryOpen(true)}
                  style={{ width: '100%', padding: '13px', borderRadius: '12px', background: 'linear-gradient(135deg,#F59E0B,#F5C842)', color: 'var(--navy)', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                  📩 Free Counselling
                </button>

                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ height: '2px', background: u.color }} />
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '12px', marginBottom: '10px' }}>Quick Facts</div>
                    {[
                      { label: 'NIRF Overall', value: `#${u.nirf}` },
                      ...(u.nirfm ? [{ label: 'NIRF Management Rank', value: `#${u.nirfm}` }] : []),
                      { label: 'NAAC Grade', value: u.naacScore ? `${u.naac} (${u.naacScore})` : u.naac },
                      { label: 'Location', value: `${u.city}, ${u.state}` },
                      { label: 'Exam Mode', value: u.examMode },
                      { label: 'Eligibility', value: u.eligibility },
                      { label: 'Fees from', value: formatFee(u.feeMin) },
                      { label: 'EMI from', value: `₹${u.emiFrom.toLocaleString()}/mo` },
                      { label: 'Govt job valid', value: u.govtRecognised ? '✓ Yes' : '⚠️ No' },
                    ].map(r => (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #E2E8F4', fontSize: '11px' }}>
                        <span style={{ color: 'var(--ink-3)' }}>{r.label}</span>
                        <span style={{ fontWeight: '600', color: r.label === 'Govt job valid' && !u.govtRecognised ? '#DC2626' : 'var(--navy)', textAlign: 'right' }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '12px', marginBottom: '10px' }}>All Programs</div>
                  {u.programs.map(prog => (
                    <Link key={prog} href={`/universities/${u.id}/${progSlug(prog)}`}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #E2E8F4', textDecoration: 'none', fontSize: '12px' }}>
                      <span style={{ color: 'var(--ink-2)', fontWeight: '600' }}>{prog}</span>
                      <span style={{ color: 'var(--amber-bright)', fontSize: '11px' }}>{u.programDetails[prog]?.fees || formatFee(u.feeMin)}</span>
                    </Link>
                  ))}
                </div>

                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '12px', marginBottom: '10px' }}>Approvals</div>
                  {u.approvals.map(a => (
                    <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px', fontSize: '11px', color: 'var(--ink-3)' }}>
                      <CheckCircle size={11} color="#4ade80" />{a}
                    </div>
                  ))}
                </div>

                <Link href={`/compare?a=${u.id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', borderRadius: '12px', border: '1px solid #E2E8F4', color: 'var(--ink-3)', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>
                  <BarChart2 size={14} /> Compare with others
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky */}
        <div className="lg:hidden" style={{ position: 'fixed', bottom: '72px', left: '16px', right: '16px', zIndex: 90 }}>
          <button onClick={() => setEnquiryOpen(true)}
            style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'linear-gradient(135deg,#F59E0B,#F5C842)', color: 'var(--navy)', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 24px rgba(201,146,42,0.4)' }}>
            📩 Get Free Counselling
          </button>
        </div>
      </div>

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} universityName={u.name} universityId={u.id} />
    </>
  )
}
