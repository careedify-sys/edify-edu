'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CheckCircle, TrendingUp, Briefcase, ChevronRight } from 'lucide-react'
import { getUniversitiesByProgram, getAllSpecs, PROGRAM_META, formatFee } from '@/lib/data'
import type { Program } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'

const PROGRAM_MAP: Record<string, Program> = {
  'mba': 'MBA', 'mca': 'MCA', 'bba': 'BBA', 'bca': 'BCA',
  'ba': 'BA', 'bcom': 'B.Com', 'mcom': 'M.Com', 'ma': 'MA',
  'msc': 'MSc', 'bsc': 'BSc', 'mba-wx': 'MBA (WX)',
}

// Career data per program for SEO
const PROGRAM_CAREERS: Partial<Record<Program, { roles: string[]; salary: string; growth: string; topSectors: string[] }>> = {
  'MBA': {
    roles: ['Product Manager', 'Marketing Manager', 'Finance Manager', 'HR Business Partner', 'Operations Lead', 'Business Development Manager', 'Consultant', 'Brand Manager'],
    salary: '₹6L – ₹25L per annum',
    growth: 'MBA hiring grew 18% YoY in India in 2024. Top demand in BFSI, IT, Consulting, and FMCG.',
    topSectors: ['Banking & Financial Services', 'IT & Consulting', 'FMCG & Retail', 'Healthcare', 'E-Commerce', 'Startups'],
  },
  'MCA': {
    roles: ['Software Engineer', 'Data Scientist', 'Cloud Architect', 'Cybersecurity Analyst', 'ML Engineer', 'Full Stack Developer', 'DevOps Engineer'],
    salary: '₹4.5L – ₹20L per annum',
    growth: 'MCA graduates saw 22% salary growth in 2024. Cloud and AI roles have highest demand.',
    topSectors: ['IT Services', 'Product Companies', 'Banking Tech', 'Cloud Platforms', 'Cybersecurity'],
  },
  'BBA': {
    roles: ['Business Analyst', 'Marketing Executive', 'Sales Manager', 'Operations Executive', 'HR Trainee', 'Relationship Manager'],
    salary: '₹2.5L – ₹8L per annum',
    growth: 'Entry-level management roles growing steadily. BBA is often a stepping stone to MBA.',
    topSectors: ['Banking', 'Retail', 'E-Commerce', 'FMCG', 'Logistics'],
  },
  'BCA': {
    roles: ['Junior Developer', 'Web Designer', 'Database Admin', 'QA Tester', 'IT Support Specialist', 'Network Administrator'],
    salary: '₹2.5L – ₹8L per annum',
    growth: 'IT sector demand for BCA graduates up 15% in 2024. Most upgrade to MCA for senior roles.',
    topSectors: ['IT Services', 'Banking Tech', 'E-Commerce', 'Government IT'],
  },
}

export default function ProgramPage() {
  const params = useParams()
  const programSlug = params?.program as string
  const program = PROGRAM_MAP[programSlug?.toLowerCase()]
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [activeSpec, setActiveSpec] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'nirf' | 'fees'>('nirf')

  if (!program) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        Program not found. <Link href="/programs" style={{ color: '#F59E0B', marginLeft: '8px' }}>Browse programs →</Link>
      </div>
    )
  }

  const meta = PROGRAM_META[program]
  const universities = getUniversitiesByProgram(program)
  const allSpecs = getAllSpecs(program)
  const careers = PROGRAM_CAREERS[program]

  const sorted = [...universities].sort((a, b) => {
    if (sortBy === 'nirf') return a.nirf - b.nirf
    return a.feeMin - b.feeMin
  })

  const filtered = activeSpec
    ? sorted.filter(u => u.programDetails[program]?.specs.includes(activeSpec))
    : sorted

  // FAQ Schema
  const faqs = [
    { q: `Which is the best university for online ${program} in India?`, a: `Top NIRF-ranked universities for online ${program} include ${universities.slice(0, 3).map(u => u.name).join(', ')}. The "best" depends on your budget, location, and career goal.` },
    { q: `What is the fee for online ${program} in India?`, a: `Online ${program} fees range from ${formatFee(Math.min(...universities.map(u => u.feeMin)))} to ${formatFee(Math.max(...universities.map(u => u.feeMax)))} depending on the university and specialisation.` },
    { q: `What jobs can I get after an online ${program}?`, a: `After online ${program}, you can target roles like ${careers?.roles.slice(0, 4).join(', ')}. Salary range: ${careers?.salary}.` },
    { q: `Is online ${program} valid for government jobs?`, a: `Most online ${program} programs are NOT valid for central government or PSU jobs. They are fully valid for private sector, banking, and higher education. IGNOU is the exception for government jobs.` },
    { q: `What specialisations are available in online ${program}?`, a: `Online ${program} has ${allSpecs.length}+ specialisations including ${allSpecs.slice(0, 6).join(', ')} and more.` },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
        })
      }} />

      <div style={{ minHeight: '100vh', background: '#F8F9FC' }}>

        {/* Breadcrumb */}
        <div style={{ background: '#fff', borderBottom: '1px solid #1e2f45' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', flexWrap: 'wrap' }}>
              <Link href="/" style={{ color: '#475569', textDecoration: 'none' }}>Home</Link>
              <ChevronRight size={12} />
              <Link href="/programs" style={{ color: '#475569', textDecoration: 'none' }}>Programs</Link>
              <ChevronRight size={12} />
              <span style={{ color: '#F59E0B', fontWeight: '600' }}>Online {program}</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)', borderBottom: '1px solid #1e2f45' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
            <div className="max-w-3xl">
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
                {meta?.level === 'PG' ? 'Postgraduate' : 'Undergraduate'} · {meta?.duration}
              </div>
              <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: '800', color: '#1A2F4E', lineHeight: '1.15', marginBottom: '14px' }}>
                Online {program} in India — {new Date().getFullYear()} Honest Guide
              </h1>
              <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.7', marginBottom: '20px' }}>
                {meta?.desc} · {universities.length} UGC DEB approved universities · {allSpecs.length}+ specialisations · Fees from {formatFee(Math.min(...universities.map(u => u.feeMin)))}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                {[
                  { label: 'Universities', value: `${universities.length}` },
                  { label: 'Specialisations', value: `${allSpecs.length}+` },
                  { label: 'Fees from', value: formatFee(Math.min(...universities.map(u => u.feeMin))) },
                  { label: 'Avg Salary', value: careers?.salary.split('–')[0].trim() || '₹4L+' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '10px 18px', background: '#fff', border: '1px solid #1e2f45', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#F59E0B' }}>{s.value}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => setEnquiryOpen(true)}
                  style={{ padding: '12px 28px', borderRadius: '12px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#F8F9FC', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                  Get Free {program} Counselling →
                </button>
                <Link href="/compare"
                  style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #1e2f45', color: '#6B84A0', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                  Compare {program} Programs ⚖️
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

            {/* MAIN */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* Specialisations filter — KEY SEO SECTION */}
              <section style={{ background: '#fff', border: '1px solid #1e2f45', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', background: 'rgba(201,146,42,0.06)', borderBottom: '1px solid #1e2f45' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Browse by Specialisation</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
                    Click any specialisation to filter universities. Each has its own career path.
                  </div>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: activeSpec ? '16px' : '0' }}>
                    <button onClick={() => setActiveSpec(null)}
                      style={{ padding: '7px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: !activeSpec ? '#F59E0B' : 'transparent', color: !activeSpec ? '#F8F9FC' : '#64748b', border: `1px solid ${!activeSpec ? '#F59E0B' : '#E2E8F4'}` }}>
                      All ({universities.length})
                    </button>
                    {allSpecs.map(spec => {
                      const count = universities.filter(u => u.programDetails[program]?.specs.includes(spec)).length
                      return (
                        <button key={spec} onClick={() => setActiveSpec(activeSpec === spec ? null : spec)}
                          style={{ padding: '7px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: activeSpec === spec ? '#F59E0B' : 'transparent', color: activeSpec === spec ? '#F8F9FC' : '#64748b', border: `1px solid ${activeSpec === spec ? '#F59E0B' : '#E2E8F4'}` }}>
                          {spec} <span style={{ opacity: 0.7 }}>({count})</span>
                        </button>
                      )
                    })}
                  </div>

                  {activeSpec && (
                    <div style={{ padding: '14px 18px', background: 'rgba(201,146,42,0.06)', borderRadius: '12px', border: '1px solid rgba(201,146,42,0.15)', fontSize: '13px', color: '#6B84A0', lineHeight: '1.7' }}>
                      <strong style={{ color: '#F59E0B' }}>Online {program} in {activeSpec}</strong> — {filtered.length} universit{filtered.length === 1 ? 'y' : 'ies'} offer this.
                      This specialisation leads to roles in {activeSpec.toLowerCase()}-focused careers.
                      <Link href={`/programs/${programSlug}/${activeSpec.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                        style={{ color: '#F59E0B', marginLeft: '8px', fontWeight: '700', textDecoration: 'none' }}>
                        View {activeSpec} deep-dive →
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              {/* University list */}
              <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1A2F4E' }}>
                      {activeSpec ? `${program} in ${activeSpec}` : `All Online ${program} Universities`} ({filtered.length})
                    </h2>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Sorted by NIRF rank — not by who pays us.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['nirf', 'fees'] as const).map(s => (
                      <button key={s} onClick={() => setSortBy(s)}
                        style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: sortBy === s ? '#F59E0B' : 'transparent', color: sortBy === s ? '#F8F9FC' : '#64748b', border: `1px solid ${sortBy === s ? '#F59E0B' : '#E2E8F4'}` }}>
                        {s === 'nirf' ? '🏆 NIRF' : '💰 Fees'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filtered.map((u, idx) => {
                    const pd = u.programDetails[program]
                    return (
                      <div key={u.id} style={{ background: '#fff', border: '1px solid #1e2f45', borderRadius: '14px', overflow: 'hidden' }}>
                        <div style={{ height: '2px', background: u.color }} />
                        <div style={{ padding: '18px 20px' }}>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                            {/* Rank badge */}
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: idx === 0 ? '#F59E0B' : '#F8F9FC', border: '1px solid #1e2f45', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: '13px', fontWeight: '800', color: idx === 0 ? '#F8F9FC' : '#64748b' }}>#{idx + 1}</span>
                            </div>

                            {/* Main info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                                <div>
                                  <Link href={`/universities/${u.id}/${programSlug}`}
                                    style={{ fontWeight: '700', color: '#1A2F4E', fontSize: '15px', textDecoration: 'none', display: 'block', marginBottom: '2px' }}>
                                    {program} from {u.name}
                                  </Link>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    {u.city}, {u.state} · NIRF #{u.nirf} · {u.naac} · {u.examMode}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {u.approvals.slice(0, 3).map(a => (
                                    <span key={a} style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '999px', background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)', whiteSpace: 'nowrap' }}>{a}</span>
                                  ))}
                                </div>
                              </div>

                              {/* Data row */}
                              <div style={{ display: 'flex', gap: '20px', marginTop: '12px', flexWrap: 'wrap' }}>
                                <div>
                                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fees</div>
                                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1A2F4E' }}>{pd?.fees || `${formatFee(u.feeMin)}+`}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg Salary</div>
                                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#4ade80' }}>{pd?.avgSalary?.split('–')[0].trim() || '₹4L+'}+</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Specialisations</div>
                                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1A2F4E' }}>{pd?.specs.length || '—'}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>EMI from</div>
                                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1A2F4E' }}>₹{u.emiFrom.toLocaleString()}/mo</div>
                                </div>
                              </div>

                              {/* Specs preview */}
                              {pd && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                                  {pd.specs.slice(0, 5).map(s => (
                                    <span key={s} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: activeSpec === s ? 'rgba(201,146,42,0.15)' : 'rgba(255,255,255,0.04)', color: activeSpec === s ? '#F59E0B' : '#64748b', border: `1px solid ${activeSpec === s ? 'rgba(201,146,42,0.3)' : '#E2E8F4'}` }}>
                                      {s}
                                    </span>
                                  ))}
                                  {pd.specs.length > 5 && <span style={{ fontSize: '11px', color: '#475569' }}>+{pd.specs.length - 5} more</span>}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action row */}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #1e2f45' }}>
                            <Link href={`/universities/${u.id}/${programSlug}`}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#F8F9FC', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>
                              View Full Details <ArrowRight size={14} />
                            </Link>
                            <button onClick={() => setEnquiryOpen(true)}
                              style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #1e2f45', color: '#6B84A0', fontSize: '13px', fontWeight: '600', background: 'transparent', cursor: 'pointer' }}>
                              Enquire
                            </button>
                            <Link href={`/compare?a=${u.id}`}
                              style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #1e2f45', color: '#6B84A0', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                              Compare
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* Career section */}
              {careers && (
                <section style={{ background: '#fff', border: '1px solid #1e2f45', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 24px', background: 'rgba(201,146,42,0.06)', borderBottom: '1px solid #1e2f45' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Career Scope after Online {program}</div>
                  </div>
                  <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#F59E0B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={14} /> Target Roles
                      </div>
                      {careers.roles.map(r => (
                        <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px', fontSize: '13px', color: '#6B84A0' }}>
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />{r}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={14} /> Salary & Growth
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: '#1A2F4E', marginBottom: '6px' }}>{careers.salary}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '12px' }}>{careers.growth}</div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Top Sectors</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {careers.topSectors.map(s => (
                            <span key={s} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.15)' }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Mid-page CTA */}
              <div style={{ padding: '28px', background: 'rgba(201,146,42,0.06)', border: '1px solid rgba(201,146,42,0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>🎯</div>
                <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1A2F4E' }}>
                  Which {program} university is right for you?
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px' }}>
                  Tell us your current profile — marks, work experience, budget, goal — and we'll shortlist the top 3 universities for you. Free. No spam.
                </p>
                <button onClick={() => setEnquiryOpen(true)}
                  style={{ padding: '13px 32px', borderRadius: '12px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#F8F9FC', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                  Get My Free {program} Match →
                </button>
              </div>

              {/* FAQs */}
              <section>
                <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1A2F4E', marginBottom: '12px' }}>
                  Online {program} — Frequently Asked Questions
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {faqs.map((faq, i) => (
                    <details key={i} style={{ background: '#fff', border: '1px solid #1e2f45', borderRadius: '12px', overflow: 'hidden' }}>
                      <summary style={{ padding: '14px 20px', fontWeight: '600', color: '#1A2F4E', fontSize: '13px', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                        {faq.q}
                        <span style={{ color: '#F59E0B', fontSize: '18px', flexShrink: 0, marginLeft: '12px' }}>+</span>
                      </summary>
                      <div style={{ padding: '12px 20px 14px', fontSize: '13px', color: '#6B84A0', lineHeight: '1.7', borderTop: '1px solid #1e2f45' }}>
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              {/* Also Read — interlinking */}
              <div style={{ padding: '20px 24px', background: '#fff', border: '1px solid #1e2f45', borderRadius: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>📖 Also Read</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '8px' }}>
                  {[
                    { label: `Best ${program} Specialisations in India`, href: `/blog` },
                    { label: `Online ${program} vs Full-Time ${program}`, href: `/blog` },
                    { label: `Is Online ${program} valid for govt jobs?`, href: `/guides` },
                    { label: `Compare all ${program} universities`, href: `/compare` },
                    { label: `${program} fees comparison 2025`, href: `/compare` },
                    { label: `${program} for working professionals`, href: `/blog` },
                  ].map(link => (
                    <Link key={link.label} href={link.href}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8F9FC', borderRadius: '10px', textDecoration: 'none', fontSize: '12px', color: '#6B84A0', border: '1px solid #1e2f45' }}>
                      {link.label}
                      <span style={{ color: '#F59E0B', flexShrink: 0, marginLeft: '8px' }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div style={{ width: '240px', flexShrink: 0 }} className="hidden lg:block">
              <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <button onClick={() => setEnquiryOpen(true)}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#F8F9FC', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                  📩 Free {program} Counselling
                </button>

                {/* Quick stats */}
                <div style={{ background: '#fff', border: '1px solid #1e2f45', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase', marginBottom: '12px' }}>Quick Facts</div>
                  {[
                    { label: 'Universities', value: `${universities.length} options` },
                    { label: 'Specialisations', value: `${allSpecs.length}+` },
                    { label: 'Fees range', value: `${formatFee(Math.min(...universities.map(u => u.feeMin)))} – ${formatFee(Math.max(...universities.map(u => u.feeMax)))}` },
                    { label: 'Duration', value: meta?.duration || '2 Years' },
                    { label: 'Avg Salary', value: careers?.salary || 'Varies' },
                    { label: 'Exam mode', value: 'Online/Assignment' },
                    { label: 'Govt job valid?', value: '⚠️ Usually No' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #1e2f45', fontSize: '12px' }}>
                      <span style={{ color: '#64748b' }}>{r.label}</span>
                      <span style={{ fontWeight: '600', color: '#1A2F4E', textAlign: 'right', maxWidth: '120px' }}>{r.value}</span>
                    </div>
                  ))}
                </div>

                {/* University quick links */}
                <div style={{ background: '#fff', border: '1px solid #1e2f45', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase', marginBottom: '10px' }}>Top {program} Universities</div>
                  {universities.slice(0, 5).map(u => (
                    <Link key={u.id} href={`/universities/${u.id}/${programSlug}`}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e2f45', textDecoration: 'none', fontSize: '12px' }}>
                      <span style={{ color: '#6B84A0', fontWeight: '600' }}>{u.abbr}</span>
                      <span style={{ color: '#F59E0B', fontWeight: '700' }}>NIRF #{u.nirf}</span>
                    </Link>
                  ))}
                  <Link href="/universities" style={{ display: 'block', textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#F59E0B', textDecoration: 'none', fontWeight: '600' }}>
                    View all →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky CTA */}
        <div className="lg:hidden" style={{ position: 'fixed', bottom: '72px', left: '16px', right: '16px', zIndex: 90 }}>
          <button onClick={() => setEnquiryOpen(true)}
            style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#F8F9FC', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 24px rgba(201,146,42,0.4)' }}>
            📩 Get Free {program} Counselling
          </button>
        </div>
      </div>

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} defaultProgram={program} />
    </>
  )
}
