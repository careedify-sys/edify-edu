'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, BarChart2, Plus, Minus, TrendingUp, Briefcase, Building2 } from 'lucide-react'
import { UNIVERSITIES, getUniversityById, formatFee } from '@/lib/data'
import type { University, Program } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'

const ALL_PROGRAMS: Program[] = ['MBA', 'MCA', 'BBA', 'BCA', 'B.Com', 'MA', 'M.Com']

const progSlug = (p: Program) => p.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

function CompareContent() {
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [program, setProgram] = useState<Program>('MBA')
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [enquiryUni, setEnquiryUni] = useState('')

  // Read ?a= and ?b= params on load
  useEffect(() => {
    const a = searchParams.get('a')
    const b = searchParams.getAll('b')
    const ids = [a, ...b].filter((id): id is string => !!id && !!getUniversityById(id))
    const unique = [...new Set(ids)]
    if (unique.length > 0) {
      setSelectedIds(unique.slice(0, 3))
    } else {
      // Default: show top 2 MBA universities
      setSelectedIds(['nmims', 'manipal'])
    }
  }, [searchParams])

  const universities = selectedIds.map(id => getUniversityById(id)).filter(Boolean) as University[]
  const available = UNIVERSITIES.filter(u => !selectedIds.includes(u.id))

  function addUni(id: string) {
    if (selectedIds.length >= 3) return
    setSelectedIds(prev => [...prev, id])
  }

  function removeUni(id: string) {
    setSelectedIds(prev => prev.filter(x => x !== id))
  }

  // Build compare URL for sharing
  const shareUrl = universities.length > 0
    ? `/compare?a=${universities[0].id}${universities.slice(1).map(u => `&b=${u.id}`).join('')}`
    : '/compare'

  // Verdict logic
  function getVerdict() {
    if (universities.length < 2) return null
    const sorted = [...universities].sort((a, b) => a.nirf - b.nirf)
    return {
      bestNirf: sorted[0],
      cheapest: [...universities].sort((a, b) => a.feeMin - b.feeMin)[0],
      bestSalary: universities.reduce((best, u) => {
        const salary = u.programDetails[program]?.avgSalary || ''
        const bestSalary = best.programDetails[program]?.avgSalary || ''
        const parse = (s: string) => parseInt(s.replace(/[^0-9]/g, '').slice(0, 2)) || 0
        return parse(salary) > parse(bestSalary) ? u : best
      }),
    }
  }

  const verdict = getVerdict()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #1e2f45' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber-bright)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                Side-by-Side Comparison
              </div>
              <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--navy)', marginBottom: '6px' }}>
                Compare Universities
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Comparing {universities.length} universit{universities.length === 1 ? 'y' : 'ies'} · up to 3 at once · sorted by NIRF rank
              </p>
            </div>

            {/* Program selector */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Program</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {ALL_PROGRAMS.map(p => (
                  <button key={p} onClick={() => setProgram(p)}
                    style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: program === p ? 'var(--amber-bright)' : 'transparent', color: program === p ? 'var(--bg)' : '#64748b', border: `1px solid ${program === p ? 'var(--amber-bright)' : 'var(--border)'}` }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add university row */}
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Add to comparison:</span>
            {available.slice(0, 6).map(u => (
              <button key={u.id} onClick={() => addUni(u.id)}
                disabled={selectedIds.length >= 3}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', cursor: selectedIds.length >= 3 ? 'not-allowed' : 'pointer', background: 'transparent', color: selectedIds.length >= 3 ? '#475569' : 'var(--ink-3)', border: `1px solid ${selectedIds.length >= 3 ? 'var(--border)' : 'var(--border)'}`, opacity: selectedIds.length >= 3 ? 0.5 : 1 }}>
                <Plus size={11} /> {u.name}
              </button>
            ))}
            {selectedIds.length >= 3 && <span style={{ fontSize: '11px', color: '#475569' }}>Max 3 universities</span>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {universities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
            <BarChart2 size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ marginBottom: '16px' }}>No universities selected. Add some above to compare.</p>
            <Link href="/universities" style={{ color: 'var(--amber-bright)', fontWeight: '700' }}>Browse Universities →</Link>
          </div>
        ) : (
          <>
            {/* Verdict banner */}
            {verdict && universities.length >= 2 && (
              <div style={{ marginBottom: '24px', padding: '18px 22px', background: '#fff', border: '1px solid #1e2f45', borderRadius: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber-bright)', textTransform: 'uppercase', marginBottom: '14px' }}>
                  🏆 Quick Verdict
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ padding: '10px 16px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '10px', fontSize: '12px' }}>
                    <div style={{ color: '#4ade80', fontWeight: '700', marginBottom: '2px' }}>Best NIRF Rank</div>
                    <div style={{ color: 'var(--navy)', fontWeight: '600' }}>{verdict.bestNirf.name} (#{verdict.bestNirf.nirf})</div>
                  </div>
                  <div style={{ padding: '10px 16px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '10px', fontSize: '12px' }}>
                    <div style={{ color: '#60a5fa', fontWeight: '700', marginBottom: '2px' }}>Most Affordable</div>
                    <div style={{ color: 'var(--navy)', fontWeight: '600' }}>{verdict.cheapest.name} ({formatFee(verdict.cheapest.feeMin)}+)</div>
                  </div>
                  <div style={{ padding: '10px 16px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '10px', fontSize: '12px' }}>
                    <div style={{ color: '#a78bfa', fontWeight: '700', marginBottom: '2px' }}>Best Salary ({program})</div>
                    <div style={{ color: 'var(--navy)', fontWeight: '600' }}>{verdict.bestSalary.name}</div>
                  </div>
                  <div style={{ padding: '10px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', fontSize: '12px' }}>
                    <div style={{ color: '#f87171', fontWeight: '700', marginBottom: '2px' }}>⚠️ Govt Jobs</div>
                    <div style={{ color: 'var(--navy)', fontWeight: '600' }}>All UGC DEB approved ✓</div>
                  </div>
                </div>
              </div>
            )}

            {/* University header cards */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${universities.length}, 1fr)`, gap: '14px', marginBottom: '6px' }}>
              {universities.map(u => (
                <div key={u.id} style={{ background: '#fff', border: '1px solid #1e2f45', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ height: '3px', background: u.color }} />
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '800', color: 'var(--navy)', fontSize: '14px', lineHeight: '1.3', marginBottom: '4px' }}>{u.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{u.city}, {u.state}</div>
                      </div>
                      <button onClick={() => removeUni(u.id)}
                        style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #1e2f45', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Minus size={12} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: 'rgba(201,146,42,0.1)', color: 'var(--amber-bright)', border: '1px solid rgba(201,146,42,0.2)' }}>NIRF #{u.nirf}</span>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>NAAC {u.naac}</span>
                      {u.approvals.includes('WES Recognised') && <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: 'rgba(96,165,250,0.08)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}>WES</span>}
                    </div>
                    <button onClick={() => { setEnquiryUni(u.name); setEnquiryOpen(true) }}
                      style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: 'var(--bg)', fontWeight: '700', fontSize: '12px', border: 'none', cursor: 'pointer' }}>
                      Enquire Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <div style={{ background: '#fff', border: '1px solid #1e2f45', borderRadius: '16px', overflow: 'hidden', marginTop: '14px' }}>

              {/* Section: Basic Info */}
              <div style={{ padding: '12px 20px', background: 'rgba(201,146,42,0.06)', borderBottom: '1px solid #1e2f45' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber-bright)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Basic Info</span>
              </div>
              {[
                { label: 'NIRF Rank', fn: (u: University) => `#${u.nirf}`, highlight: (vals: string[]) => vals.map(v => parseInt(v.replace('#', ''))).reduce((min, v, i, a) => v === Math.min(...a) ? i : min, 0) },
                { label: 'NAAC Grade', fn: (u: University) => u.naac },
                { label: 'Location', fn: (u: University) => `${u.city}, ${u.state}` },
                { label: 'Exam Mode', fn: (u: University) => u.examMode },
                { label: 'Eligibility', fn: (u: University) => u.eligibility },
                { label: 'Govt Job Valid', fn: (u: University) => u.govtRecognised ? '✓ Yes' : '✗ No' },
              ].map(row => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: `180px repeat(${universities.length}, 1fr)`, borderBottom: '1px solid #1e2f45' }}>
                  <div style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b', background: 'var(--bg)', display: 'flex', alignItems: 'center' }}>{row.label}</div>
                  {universities.map((u, i) => {
                    const val = row.fn(u)
                    const isGovt = row.label === 'Govt Job Valid'
                    return (
                      <div key={u.id} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: isGovt && val.includes('✗') ? '#f87171' : isGovt ? '#4ade80' : 'var(--navy)', borderLeft: '1px solid #1e2f45', display: 'flex', alignItems: 'center' }}>
                        {val}
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* Section: Fees */}
              <div style={{ padding: '12px 20px', background: 'rgba(201,146,42,0.06)', borderBottom: '1px solid #1e2f45', borderTop: '1px solid #1e2f45' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber-bright)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fees</span>
              </div>
              {[
                { label: `${program} Fees`, fn: (u: University) => u.programDetails[program]?.fees || `${formatFee(u.feeMin)}+` },
                { label: 'Fee Range', fn: (u: University) => `${formatFee(u.feeMin)} – ${formatFee(u.feeMax)}` },
                { label: 'EMI from', fn: (u: University) => `₹${u.emiFrom.toLocaleString()}/mo` },
              ].map(row => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: `180px repeat(${universities.length}, 1fr)`, borderBottom: '1px solid #1e2f45' }}>
                  <div style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b', background: 'var(--bg)', display: 'flex', alignItems: 'center' }}>{row.label}</div>
                  {universities.map(u => (
                    <div key={u.id} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: 'var(--navy)', borderLeft: '1px solid #1e2f45', display: 'flex', alignItems: 'center' }}>
                      {row.fn(u)}
                    </div>
                  ))}
                </div>
              ))}

              {/* Section: Career (only if program data exists) */}
              {universities.some(u => u.programDetails[program]) && (
                <>
                  <div style={{ padding: '12px 20px', background: 'rgba(74,222,128,0.04)', borderBottom: '1px solid #1e2f45', borderTop: '1px solid #1e2f45' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Career Outcomes — {program}</span>
                  </div>

                  {/* Avg Salary */}
                  <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(${universities.length}, 1fr)`, borderBottom: '1px solid #1e2f45' }}>
                    <div style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b', background: 'var(--bg)', display: 'flex', alignItems: 'center' }}>
                      <TrendingUp size={12} style={{ marginRight: '6px' }} /> Avg Salary
                    </div>
                    {universities.map(u => (
                      <div key={u.id} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#4ade80', borderLeft: '1px solid #1e2f45', display: 'flex', alignItems: 'center' }}>
                        {u.programDetails[program]?.avgSalary || '—'}
                      </div>
                    ))}
                  </div>

                  {/* Top Roles */}
                  <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(${universities.length}, 1fr)`, borderBottom: '1px solid #1e2f45' }}>
                    <div style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b', background: 'var(--bg)', display: 'flex', alignItems: 'center' }}>
                      <Briefcase size={12} style={{ marginRight: '6px' }} /> Target Roles
                    </div>
                    {universities.map(u => {
                      const pd = u.programDetails[program]
                      return (
                        <div key={u.id} style={{ padding: '12px 16px', borderLeft: '1px solid #1e2f45' }}>
                          {pd ? pd.roles.slice(0, 4).map(r => (
                            <div key={r} style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '4px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--amber-bright)', flexShrink: 0 }} />{r}
                            </div>
                          )) : <span style={{ fontSize: '12px', color: '#475569' }}>—</span>}
                        </div>
                      )
                    })}
                  </div>

                  {/* Top Companies */}
                  <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(${universities.length}, 1fr)`, borderBottom: '1px solid #1e2f45' }}>
                    <div style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b', background: 'var(--bg)', display: 'flex', alignItems: 'center' }}>
                      <Building2 size={12} style={{ marginRight: '6px' }} /> Top Companies
                    </div>
                    {universities.map(u => {
                      const pd = u.programDetails[program]
                      return (
                        <div key={u.id} style={{ padding: '12px 16px', borderLeft: '1px solid #1e2f45' }}>
                          {pd ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {pd.topCompanies.slice(0, 5).map(c => (
                                <span key={c} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(96,165,250,0.08)', color: 'var(--ink-3)', border: '1px solid rgba(96,165,250,0.15)' }}>{c}</span>
                              ))}
                            </div>
                          ) : <span style={{ fontSize: '12px', color: '#475569' }}>—</span>}
                        </div>
                      )
                    })}
                  </div>

                  {/* Specialisations */}
                  <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(${universities.length}, 1fr)`, borderBottom: '1px solid #1e2f45' }}>
                    <div style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b', background: 'var(--bg)', display: 'flex', alignItems: 'center' }}>
                      Specialisations
                    </div>
                    {universities.map(u => {
                      const pd = u.programDetails[program]
                      return (
                        <div key={u.id} style={{ padding: '12px 16px', borderLeft: '1px solid #1e2f45' }}>
                          {pd ? (
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--amber-bright)', marginBottom: '6px' }}>{pd.specs.length} options</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {pd.specs.slice(0, 4).map(s => (
                                  <span key={s} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid #1e2f45' }}>{s}</span>
                                ))}
                                {pd.specs.length > 4 && <span style={{ fontSize: '10px', color: '#475569' }}>+{pd.specs.length - 4}</span>}
                              </div>
                            </div>
                          ) : <span style={{ fontSize: '12px', color: '#475569' }}>—</span>}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Section: Approvals */}
              <div style={{ padding: '12px 20px', background: 'rgba(74,222,128,0.04)', borderBottom: '1px solid #1e2f45', borderTop: '1px solid #1e2f45' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Approvals & Rankings</span>
              </div>
              {['UGC DEB', 'WES Recognised', 'AICTE', 'NBA'].map(approval => (
                <div key={approval} style={{ display: 'grid', gridTemplateColumns: `180px repeat(${universities.length}, 1fr)`, borderBottom: '1px solid #1e2f45' }}>
                  <div style={{ padding: '10px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b', background: 'var(--bg)', display: 'flex', alignItems: 'center' }}>{approval}</div>
                  {universities.map(u => {
                    const has = u.approvals.some(a => a.includes(approval.split(' ')[0]))
                    return (
                      <div key={u.id} style={{ padding: '10px 16px', borderLeft: '1px solid #1e2f45', display: 'flex', alignItems: 'center' }}>
                        {has ? <CheckCircle size={16} color="#4ade80" /> : <XCircle size={16} color="#334155" />}
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* Section: Enquiry row */}
              <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(${universities.length}, 1fr)`, background: 'var(--bg)' }}>
                <div style={{ padding: '16px', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Ready to Apply?</div>
                {universities.map(u => (
                  <div key={u.id} style={{ padding: '12px 16px', borderLeft: '1px solid #1e2f45', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button onClick={() => { setEnquiryUni(u.name); setEnquiryOpen(true) }}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: 'var(--bg)', fontWeight: '700', fontSize: '12px', border: 'none', cursor: 'pointer' }}>
                      Enquire Now
                    </button>
                    <Link href={`/universities/${u.id}/${progSlug(program)}`}
                      style={{ display: 'block', textAlign: 'center', fontSize: '11px', color: 'var(--amber-bright)', textDecoration: 'none', fontWeight: '600' }}>
                      Full {program} Details →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div style={{ marginTop: '24px', padding: '24px', background: 'rgba(201,146,42,0.06)', border: '1px solid rgba(201,146,42,0.2)', borderRadius: '16px', textAlign: 'center' }}>
              <h3 className="font-display" style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--navy)', marginBottom: '6px' }}>
                Still not sure which one to choose?
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Tell us your profile and we'll recommend the best fit. Free. No spam. 24-hour response.
              </p>
              <button onClick={() => { setEnquiryUni(''); setEnquiryOpen(true) }}
                style={{ padding: '12px 28px', borderRadius: '12px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: 'var(--bg)', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                Get Free Recommendation →
              </button>
            </div>
          
            {/* FAQ Section */}
            <div style={{ marginTop: '24px', background: '#fff', border: '1px solid #1e2f45', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', background: 'rgba(201,146,42,0.06)', borderBottom: '1px solid #1e2f45' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber-bright)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Frequently Asked Questions</div>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { q: 'Which online university has the best NIRF rank in India?', a: 'Chandigarh University Online holds NIRF #19 — the highest among all online universities in India. NMIMS Online and Symbiosis SSDL both hold NIRF #24. These are considered the top 3 by official government ranking.' },
                  { q: 'Is online MBA from these universities valid for government jobs?', a: 'Yes — all universities listed here are UGC DEB approved, which means their online degrees are equivalent to regular degrees for government job purposes. UGC DEB approval is the only requirement mandated by the Government of India.' },
                  { q: 'Which is more affordable — NMIMS or Chandigarh University?', a: 'Chandigarh University Online (₹1.2L total) is significantly more affordable than NMIMS (₹1.1L–₹4L depending on program). However NMIMS offers IIM job portal access and NAAC A++ certification which justify the higher price for MBA.' },
                  { q: 'Can I compare more than 3 universities at once?', a: 'The comparison tool supports up to 3 universities simultaneously for a clean side-by-side view. To compare more, start a new comparison with 2–3 different universities.' },
                  { q: 'Which university is best for working professionals with less time?', a: 'Symbiosis SSDL is best for working professionals — it is 100% assignment-based (no exams ever), asynchronous learning, and designed specifically for corporate professionals. Chandigarh University and LPU are also fully online with flexible schedules.' },
                ].map((faq, i) => (
                  <div key={i} style={{ paddingBottom: '14px', borderBottom: i < 4 ? '1px solid #1e2f45' : 'none' }}>
                    <div style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '13px', marginBottom: '6px' }}>Q: {faq.q}</div>
                    <div style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.7' }}>{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} universityName={enquiryUni} />
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        Loading comparison...
      </div>
    }>
      <CompareContent />
    </Suspense>
  )
}
