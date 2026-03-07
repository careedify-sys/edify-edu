'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Briefcase, TrendingUp, Building2, BookOpen, Users, ChevronRight } from 'lucide-react'
import { UNIVERSITIES, getUniversityById, getUniversitiesByProgram, formatFee, PROGRAM_META } from '@/lib/data'
import type { Program } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'

const PROGRAM_MAP: Record<string, Program> = {
  'mba': 'MBA', 'mca': 'MCA', 'bba': 'BBA', 'bca': 'BCA',
  'ba': 'BA', 'bcom': 'B.Com', 'mcom': 'M.Com', 'ma': 'MA',
  'msc': 'MSc', 'bsc': 'BSc', 'mba-wx': 'MBA (WX)',
}

export default function UniversityProgramPage() {
  const params = useParams()
  const id = params?.id as string
  const programSlug = params?.program as string
  const u = getUniversityById(id)
  const program = PROGRAM_MAP[programSlug?.toLowerCase()]
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [activeSpec, setActiveSpec] = useState<string | null>(null)

  if (!u || !program || !u.programs.includes(program)) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1b2d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p>Program not found. <Link href="/universities" style={{ color: '#c9922a' }}>Browse all universities →</Link></p>
        </div>
      </div>
    )
  }

  const pd = u.programDetails[program]!
  const meta = PROGRAM_META[program]
  const otherUnis = getUniversitiesByProgram(program).filter(x => x.id !== u.id).slice(0, 4)
  const programName = `${program} from ${u.name}`

  // FAQ schema for AEO
  const faqs = [
    { q: `Is ${program} from ${u.name} valid?`, a: `Yes. ${u.name} is UGC DEB approved. The ${program} degree is legally valid for private sector employment and higher education in India.` },
    { q: `What are the fees for ${program} at ${u.name}?`, a: `The total fee for ${program} at ${u.name} is ${pd.fees}. EMI options start from ₹${u.emiFrom.toLocaleString()} per month.` },
    { q: `What jobs can I get after ${program} from ${u.name}?`, a: `After completing ${program} from ${u.name}, you can target roles such as ${pd.roles.slice(0, 4).join(', ')}. Average salary range is ${pd.avgSalary}.` },
    { q: `What are the specialisations in ${program} at ${u.name}?`, a: `${u.name} offers ${pd.specs.length} specialisations in ${program}: ${pd.specs.join(', ')}.` },
    { q: `Is ${u.name} ${program} valid for government jobs?`, a: `No. ${u.name}'s online ${program} is not recognised for central government or PSU jobs. It is fully valid for private sector employment, banking, and higher education.` },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
        })
      }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: `${program} - ${u.name}`,
          description: pd.careerOutcome,
          provider: { '@type': 'Organization', name: u.name },
          timeRequired: meta?.duration,
          offers: { '@type': 'Offer', price: pd.fees, priceCurrency: 'INR' }
        })
      }} />

      <div style={{ minHeight: '100vh', background: '#0f1b2d' }}>
        <div style={{ height: '3px', background: u.color }} />

        {/* Breadcrumb */}
        <div style={{ background: '#0a1220', borderBottom: '1px solid #1e2f45' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', flexWrap: 'wrap' }}>
              <Link href="/" style={{ color: '#475569', textDecoration: 'none' }}>Home</Link>
              <ChevronRight size={12} />
              <Link href="/universities" style={{ color: '#475569', textDecoration: 'none' }}>Universities</Link>
              <ChevronRight size={12} />
              <Link href={`/universities/${u.id}`} style={{ color: '#475569', textDecoration: 'none' }}>{u.abbr}</Link>
              <ChevronRight size={12} />
              <span style={{ color: '#c9922a', fontWeight: '600' }}>{program}</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div style={{ background: '#0a1220', borderBottom: '1px solid #1e2f45' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '720px' }}>

              {/* Approvals row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {u.approvals.map(a => (
                  <span key={a} style={{ fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '999px', background: 'rgba(201,146,42,0.1)', color: '#c9922a', border: '1px solid rgba(201,146,42,0.2)' }}>{a}</span>
                ))}
              </div>

              <h1 className="font-display" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: '800', color: '#ffffff', lineHeight: '1.2' }}>
                {program} from {u.name}
              </h1>
              <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.6' }}>
                {u.city}, {u.state} · NIRF #{u.nirf} · {meta?.duration} · {pd.fees} total fees · {u.examMode} exam
              </p>

              {/* Quick stat pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                {[
                  { label: 'Avg Salary', value: pd.avgSalary },
                  { label: 'Specialisations', value: `${pd.specs.length}` },
                  { label: 'EMI from', value: `₹${u.emiFrom.toLocaleString()}/mo` },
                  { label: 'Eligibility', value: u.eligibility },
                ].map(s => (
                  <div key={s.label} style={{ padding: '8px 16px', background: '#162032', border: '1px solid #1e2f45', borderRadius: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{s.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => setEnquiryOpen(true)}
                  style={{ padding: '12px 28px', borderRadius: '12px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0f1b2d', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                  📩 Get Free Counselling for {program}
                </button>
                <Link href={`/universities/${u.id}`}
                  style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #1e2f45', color: '#94a3b8', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                  View Full {u.abbr} Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

            {/* MAIN */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* Specialisations */}
              <section style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', background: 'rgba(201,146,42,0.06)', borderBottom: '1px solid #1e2f45', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>All Specialisations</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{pd.specs.length} options available</div>
                  </div>
                  <BookOpen size={18} color="#c9922a" />
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {pd.specs.map(spec => (
                      <button key={spec}
                        onClick={() => setActiveSpec(activeSpec === spec ? null : spec)}
                        style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                          background: activeSpec === spec ? '#c9922a' : 'rgba(255,255,255,0.04)',
                          color: activeSpec === spec ? '#0f1b2d' : '#94a3b8',
                          border: `1px solid ${activeSpec === spec ? '#c9922a' : '#E2E8F4'}` }}>
                        {spec}
                      </button>
                    ))}
                  </div>
                  {activeSpec && (() => {
                    const sr = pd.specRoles?.[activeSpec]
                    return (
                      <div style={{ marginTop: '16px', padding: '18px', background: 'rgba(201,146,42,0.06)', borderRadius: '12px', border: '1px solid rgba(201,146,42,0.15)' }}>
                        <div style={{ fontWeight: '700', color: '#c9922a', fontSize: '14px', marginBottom: '14px' }}>
                          {program} in {activeSpec} at {u.name} — Career Breakdown
                        </div>
                        {sr ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                            <div style={{ padding: '12px', background: '#0f1b2d', borderRadius: '10px', border: '1px solid #1e2f45' }}>
                              <div style={{ fontSize: '10px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', marginBottom: '8px' }}>Target Roles</div>
                              {sr.roles.map(r => (
                                <div key={r} style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#c9922a', flexShrink: 0 }} />{r}
                                </div>
                              ))}
                            </div>
                            <div style={{ padding: '12px', background: '#0f1b2d', borderRadius: '10px', border: '1px solid #1e2f45' }}>
                              <div style={{ fontSize: '10px', fontWeight: '700', color: '#4ade80', textTransform: 'uppercase', marginBottom: '8px' }}>Salary Range</div>
                              <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>{sr.salary}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>per annum for {activeSpec} professionals</div>
                            </div>
                            <div style={{ padding: '12px', background: '#0f1b2d', borderRadius: '10px', border: '1px solid #1e2f45' }}>
                              <div style={{ fontSize: '10px', fontWeight: '700', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '8px' }}>Top Companies</div>
                              {sr.companies.map(c => (
                                <div key={c} style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#60a5fa', flexShrink: 0 }} />{c}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.7', marginBottom: '12px' }}>
                            Choosing <strong style={{ color: '#ffffff' }}>{activeSpec}</strong> positions you for domain-specific management roles.
                            Average salary: {pd.avgSalary}.
                          </p>
                        )}
                        <button onClick={() => setEnquiryOpen(true)}
                          style={{ padding: '9px 20px', borderRadius: '8px', background: '#c9922a', color: '#0f1b2d', fontWeight: '700', fontSize: '12px', border: 'none', cursor: 'pointer' }}>
                          Enquire about {program} in {activeSpec} →
                        </button>
                      </div>
                    )
                  })()}
                </div>
              </section>

              {/* Career Outcomes */}
              <section style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', background: 'rgba(201,146,42,0.06)', borderBottom: '1px solid #1e2f45', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Career Outcomes</div>
                  <TrendingUp size={18} color="#c9922a" />
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8', marginBottom: '20px' }}>{pd.careerOutcome}</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Roles */}
                    <div style={{ padding: '16px', background: '#0f1b2d', borderRadius: '12px', border: '1px solid #1e2f45' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Briefcase size={15} color="#c9922a" />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target Roles</span>
                      </div>
                      {pd.roles.map(role => (
                        <div key={role} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c9922a', flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{role}</span>
                        </div>
                      ))}
                    </div>

                    {/* Salary */}
                    <div style={{ padding: '16px', background: '#0f1b2d', borderRadius: '12px', border: '1px solid #1e2f45' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <TrendingUp size={15} color="#4ade80" />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Salary Range</span>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>{pd.avgSalary}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Based on industry hiring data for {program} graduates</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Target Companies */}
              <section style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', background: 'rgba(201,146,42,0.06)', borderBottom: '1px solid #1e2f45', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Companies to Target</div>
                  <Building2 size={18} color="#c9922a" />
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {pd.topCompanies.map(company => (
                      <div key={company} style={{ padding: '8px 16px', background: '#0f1b2d', border: '1px solid #1e2f45', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>
                        {company}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '10px', fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                    💡 <strong style={{ color: '#4ade80' }}>How to target these companies:</strong> Build your LinkedIn before you graduate. Update your degree status mid-program. Most of these companies hire through LinkedIn, Naukri, and direct referrals — not campus drives.
                  </div>
                </div>
              </section>

              {/* Internship */}
              <section style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', background: 'rgba(201,146,42,0.06)', borderBottom: '1px solid #1e2f45', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Internship & Projects</div>
                  <Users size={18} color="#c9922a" />
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8' }}>{pd.internshipType}</p>
                </div>
              </section>

              {/* For Who / Not For */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '20px', background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>✓ Right for you if</div>
                  {u.forWho.filter(Boolean).map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', fontSize: '13px', color: '#94a3b8' }}>
                      <CheckCircle size={14} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '20px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>✗ Think twice if</div>
                  {u.notFor.filter(Boolean).map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', fontSize: '13px', color: '#94a3b8' }}>
                      <XCircle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <section>
                <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>
                  Frequently Asked Questions — {program} from {u.name}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {faqs.map((faq, i) => (
                    <details key={i} style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '12px', overflow: 'hidden' }}>
                      <summary style={{ padding: '14px 20px', fontWeight: '600', color: '#ffffff', fontSize: '13px', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {faq.q}
                        <span style={{ color: '#c9922a', fontSize: '18px', flexShrink: 0, marginLeft: '12px' }}>+</span>
                      </summary>
                      <div style={{ padding: '0 20px 14px', fontSize: '13px', color: '#94a3b8', lineHeight: '1.7', borderTop: '1px solid #1e2f45', paddingTop: '12px' }}>
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              {/* Inline CTA */}
              <div style={{ padding: '28px', background: 'rgba(201,146,42,0.06)', border: '1px solid rgba(201,146,42,0.2)', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>🎓</div>
                <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
                  Interested in {program} from {u.abbr}?
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
                  Our counsellors will match you with the right specialisation based on your career goal. Free. 24-hour response.
                </p>
                <button onClick={() => setEnquiryOpen(true)}
                  style={{ padding: '14px 32px', borderRadius: '12px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0f1b2d', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                  Get Free Counselling →
                </button>
              </div>

              {/* Also read — interlinking */}
              <div style={{ padding: '20px 24px', background: '#162032', border: '1px solid #1e2f45', borderRadius: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>📖 Also Read</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: `Best ${program} Specialisations in India 2025`, href: `/blog` },
                    { label: `Compare all universities offering ${program}`, href: `/programs/${programSlug}` },
                    { label: `Is ${program} from ${u.abbr} valid for govt jobs?`, href: `/guides` },
                    { label: `${program} fees comparison: All universities`, href: `/compare?prog=${program}` },
                  ].map(link => (
                    <Link key={link.href} href={link.href}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#0f1b2d', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', color: '#94a3b8', border: '1px solid #1e2f45' }}>
                      {link.label}
                      <span style={{ color: '#c9922a' }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div style={{ width: '260px', flexShrink: 0 }} className="hidden lg:block">
              <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Quick summary */}
                <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ height: '3px', background: u.color }} />
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '13px', marginBottom: '12px' }}>{program} — Quick Facts</div>
                    {[
                      { label: 'Total Fees', value: pd.fees },
                      { label: 'Duration', value: pd.duration },
                      { label: 'Exam Mode', value: u.examMode },
                      { label: 'Eligibility', value: u.eligibility },
                      { label: 'NIRF Rank', value: `#${u.nirf}` },
                      { label: 'NAAC', value: u.naac },
                      { label: 'EMI from', value: `₹${u.emiFrom.toLocaleString()}/mo` },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e2f45', fontSize: '12px' }}>
                        <span style={{ color: '#64748b' }}>{row.label}</span>
                        <span style={{ fontWeight: '700', color: '#ffffff' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button onClick={() => setEnquiryOpen(true)}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0f1b2d', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                  📩 Free Counselling for {program}
                </button>

                {/* Approvals */}
                <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', marginBottom: '10px' }}>Approvals & Rankings</div>
                  {u.approvals.map(a => (
                    <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '12px', color: '#94a3b8' }}>
                      <CheckCircle size={12} color="#4ade80" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* OTHER UNIVERSITIES — Recommendations */}
          {otherUnis.length > 0 && (
            <div style={{ marginTop: '48px' }}>
              <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
                Other universities offering {program}
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                Compare before you decide — sorted by NIRF rank.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {otherUnis.map(ou => {
                  const opd = ou.programDetails[program]
                  return (
                    <Link key={ou.id} href={`/universities/${ou.id}/${programSlug}`}
                      style={{ display: 'block', background: '#162032', border: '1px solid #1e2f45', borderRadius: '14px', overflow: 'hidden', textDecoration: 'none', transition: 'border-color 0.15s' }}
                      className="spec-card-link">
                      <div style={{ height: '3px', background: ou.color }} />
                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '14px' }}>{ou.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{ou.city}, {ou.state}</div>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px', background: 'rgba(201,146,42,0.1)', color: '#c9922a', border: '1px solid rgba(201,146,42,0.2)', flexShrink: 0 }}>
                            NIRF #{ou.nirf}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingTop: '10px', borderTop: '1px solid #1e2f45' }}>
                          <div><span style={{ color: '#64748b' }}>Fees: </span><span style={{ color: '#ffffff', fontWeight: '600' }}>{opd?.fees || `${formatFee(ou.feeMin)}+`}</span></div>
                          <div><span style={{ color: '#64748b' }}>Salary: </span><span style={{ color: '#4ade80', fontWeight: '600' }}>{opd?.avgSalary?.split('–')[0].trim() || '₹4L+'}</span></div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} universityName={u.name} universityId={u.id} defaultProgram={program} />
    </>
  )
}
