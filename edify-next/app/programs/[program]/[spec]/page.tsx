'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, TrendingUp, Briefcase, ArrowRight, ChevronRight } from 'lucide-react'
import { getUniversitiesBySpec, PROGRAM_META, formatFee } from '@/lib/data'
import type { SpecRoles } from '@/lib/data'
import type { Program } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'

const PROGRAM_MAP: Record<string, Program> = {
  'mba': 'MBA', 'mca': 'MCA', 'bba': 'BBA', 'bca': 'BCA',
  'ba': 'BA', 'bcom': 'B.Com', 'mcom': 'M.Com', 'ma': 'MA',
}

// Spec-specific career data
const SPEC_CAREERS: Record<string, { roles: string[]; salary: string; skills: string[]; companies: string[]; growth: string }> = {
  'finance': {
    roles: ['Financial Analyst', 'Finance Manager', 'Investment Banker', 'CFO (career path)', 'Portfolio Manager', 'Treasury Manager', 'Credit Analyst'],
    salary: '₹6L – ₹25L per annum',
    skills: ['Financial Modelling', 'DCF Valuation', 'Risk Management', 'Excel & Power BI', 'Corporate Finance', 'Banking Operations'],
    companies: ['HDFC Bank', 'ICICI Bank', 'Kotak Mahindra', 'Goldman Sachs', 'JP Morgan', 'Deloitte', 'KPMG', 'Bajaj Finance', 'Axis Bank'],
    growth: 'Finance MBA remains the highest-demand specialisation in India. BFSI sector hires 35% of all MBA graduates.',
  },
  'marketing': {
    roles: ['Marketing Manager', 'Brand Manager', 'Digital Marketing Lead', 'Product Marketing Manager', 'CMO (career path)', 'Category Manager'],
    salary: '₹5L – ₹20L per annum',
    skills: ['Brand Strategy', 'Digital Marketing', 'SEO/SEM', 'Consumer Research', 'Social Media', 'Product Positioning', 'CRM'],
    companies: ['HUL', 'P&G', 'Nestle', 'Amazon', 'Flipkart', 'Swiggy', 'Zomato', 'Asian Paints', 'Marico'],
    growth: 'Digital Marketing specialisation demand up 28% YoY. FMCG, e-commerce, and D2C brands are top hirers.',
  },
  'human resource management': {
    roles: ['HR Business Partner', 'Talent Acquisition Manager', 'L&D Manager', 'Compensation Analyst', 'HR Director (career path)', 'CHRO (career path)'],
    salary: '₹4.5L – ₹18L per annum',
    skills: ['Talent Management', 'HRIS Systems', 'Performance Management', 'Employee Relations', 'HR Analytics', 'Labour Law'],
    companies: ['Infosys', 'TCS', 'Wipro', 'Deloitte HR', 'Aon', 'Mercer', 'ManpowerGroup', 'Randstad'],
    growth: 'HR Analytics and Talent Tech roles growing 20% annually. Remote work culture has elevated HR role importance.',
  },
  'data science': {
    roles: ['Data Scientist', 'ML Engineer', 'Data Analyst', 'Business Intelligence Analyst', 'AI Product Manager', 'Data Engineering Lead'],
    salary: '₹7L – ₹30L per annum',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow/PyTorch', 'Data Visualization', 'Statistical Analysis', 'Big Data'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Flipkart', 'Paytm', 'Ola', 'Infosys', 'TCS', 'Mu Sigma', 'Fractal Analytics'],
    growth: 'Highest growth specialisation in 2024–25. Data Science roles grew 45% YoY. AI/ML engineers most in demand.',
  },
  'digital marketing': {
    roles: ['Digital Marketing Manager', 'SEO Specialist', 'Performance Marketing Lead', 'Social Media Manager', 'Content Strategist', 'Growth Hacker'],
    salary: '₹4L – ₹18L per annum',
    skills: ['SEO/SEM', 'Meta Ads', 'Google Ads', 'Email Marketing', 'Analytics', 'Content Marketing', 'Influencer Marketing'],
    companies: ['Amazon', 'Flipkart', 'Swiggy', 'Zomato', 'OYO', 'UrbanClap', 'Dentsu', 'Wavemaker', 'GroupM'],
    growth: 'Digital marketing is now standalone specialisation. D2C brands hiring aggressively. ₹6–10L for 2 years experience.',
  },
  'healthcare management': {
    roles: ['Hospital Administrator', 'Healthcare Operations Manager', 'Medical Director (career path)', 'Health Insurance Manager', 'Pharma Sales Manager', 'Clinical Research Manager'],
    salary: '₹5L – ₹16L per annum',
    skills: ['Hospital Operations', 'Healthcare Policy', 'Medical Billing', 'Patient Care Management', 'Pharma Marketing', 'Health Insurance'],
    companies: ['Apollo Hospitals', 'Fortis', 'Manipal Hospitals', 'Cipla', 'Sun Pharma', 'Aetna', 'Star Health Insurance', 'Medanta'],
    growth: 'Healthcare MBA fastest growing specialisation post-2020. Indian healthcare sector to reach $370B by 2026.',
  },
  'operations & supply chain': {
    roles: ['Operations Manager', 'Supply Chain Analyst', 'Logistics Manager', 'Procurement Manager', 'SCM Consultant', 'Plant Manager'],
    salary: '₹5L – ₹18L per annum',
    skills: ['Supply Chain Management', 'Lean/Six Sigma', 'SAP SCM', 'Demand Forecasting', 'Vendor Management', 'Logistics Optimization'],
    companies: ['Amazon', 'Flipkart', 'Maersk', 'DHL', 'Mahindra Logistics', 'Blue Dart', 'Nestle', 'HUL'],
    growth: 'E-commerce logistics boom driving demand. Operations roles growing 15% annually. Green supply chain is emerging trend.',
  },
}

function getSpecData(spec: string) {
  const key = spec.toLowerCase()
  return SPEC_CAREERS[key] || SPEC_CAREERS[Object.keys(SPEC_CAREERS).find(k => key.includes(k) || k.includes(key)) || ''] || null
}

function formatSpecTitle(spec: string) {
  return spec.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function SpecPage() {
  const params = useParams()
  const programSlug = params?.program as string
  const specSlug = params?.spec as string
  const program = PROGRAM_MAP[programSlug?.toLowerCase()]
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  if (!program) return (
    <div style={{ minHeight: '100vh', background: '#0f1b2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
      <Link href="/programs" style={{ color: '#c9922a' }}>Back to Programs →</Link>
    </div>
  )

  // Convert slug to spec name
  const specName = formatSpecTitle(specSlug.replace(/-/g, ' '))
  const universities = getUniversitiesBySpec(program, specName)
  const career = getSpecData(specSlug.replace(/-/g, ' '))
  const meta = PROGRAM_META[program]

  // SEO: Page targets "online MBA in finance", "online MBA in finance from Amity" etc
  const faqs = [
    { q: `What is online ${program} in ${specName}?`, a: `Online ${program} in ${specName} is a ${meta?.duration} postgraduate program that specialises in ${specName.toLowerCase()} domain. It is offered by UGC DEB approved universities like ${universities.slice(0, 2).map(u => u.name).join(' and ')}.` },
    { q: `Which university is best for online ${program} in ${specName}?`, a: `Top NIRF-ranked universities for ${program} in ${specName} include ${universities.slice(0, 3).map(u => u.name).join(', ')}. NMIMS and Chandigarh University are preferred for ${specName.toLowerCase()} due to industry connections.` },
    { q: `What jobs can I get after ${program} in ${specName}?`, a: career ? `After ${program} in ${specName}, target roles like ${career.roles.slice(0, 4).join(', ')}. Salary range: ${career.salary}.` : `Career in ${specName.toLowerCase()} sector.` },
    { q: `Is online ${program} in ${specName} valid?`, a: `Yes. ${program} in ${specName} from UGC DEB approved universities is legally valid for private sector employment and higher education. Not valid for central govt/PSU jobs.` },
    { q: `What are the fees for online ${program} in ${specName}?`, a: universities.length > 0 ? `Fees for ${program} in ${specName} range from ${formatFee(Math.min(...universities.map(u => u.feeMin)))} to ${formatFee(Math.max(...universities.map(u => u.feeMax)))} depending on the university.` : `Fees vary by university. Check individual university pages.` },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
        })
      }} />

      <div style={{ minHeight: '100vh', background: '#0f1b2d' }}>

        {/* Breadcrumb */}
        <div style={{ background: '#0a1220', borderBottom: '1px solid #1e2f45' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', flexWrap: 'wrap' }}>
              <Link href="/" style={{ color: '#475569', textDecoration: 'none' }}>Home</Link>
              <ChevronRight size={12} />
              <Link href="/programs" style={{ color: '#475569', textDecoration: 'none' }}>Programs</Link>
              <ChevronRight size={12} />
              <Link href={`/programs/${programSlug}`} style={{ color: '#475569', textDecoration: 'none' }}>Online {program}</Link>
              <ChevronRight size={12} />
              <span style={{ color: '#c9922a', fontWeight: '600' }}>{specName}</span>
            </div>
          </div>
        </div>

        {/* Hero — H1 targets "Online MBA in Finance India 2025" */}
        <div style={{ background: 'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)', borderBottom: '1px solid #1e2f45' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
            <div className="max-w-3xl">
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#e63946', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                🔴 Admissions Open 2025–26
              </div>
              <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: '800', color: '#ffffff', lineHeight: '1.15', marginBottom: '12px' }}>
                Online {program} in {specName} — India's Honest Guide {new Date().getFullYear()}
              </h1>
              <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.7', marginBottom: '20px' }}>
                {universities.length} UGC DEB approved universities offer {program} with {specName} specialisation. Compare fees, salaries, and career outcomes.
              </p>

              {career && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '22px' }}>
                  {[
                    { label: 'Universities', value: `${universities.length}` },
                    { label: 'Avg Salary', value: career.salary.split('–')[0].trim() + '+' },
                    { label: 'Top Roles', value: `${career.roles.length}+` },
                    { label: 'Duration', value: meta?.duration || '2 Years' },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '10px 16px', background: '#162032', border: '1px solid #1e2f45', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#c9922a' }}>{s.value}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setEnquiryOpen(true)}
                style={{ padding: '13px 30px', borderRadius: '12px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0f1b2d', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                Get Free Counselling for {program} in {specName} →
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* Career outcome */}
              {career && (
                <section style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 22px', background: 'rgba(201,146,42,0.06)', borderBottom: '1px solid #1e2f45' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Career Scope — {program} in {specName}</div>
                  </div>
                  <div style={{ padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#c9922a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={13} /> Target Roles
                      </div>
                      {career.roles.map(r => (
                        <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '7px', fontSize: '13px', color: '#94a3b8' }}>
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#c9922a', flexShrink: 0 }} />{r}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={13} /> Salary & Market
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>{career.salary}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '12px' }}>{career.growth}</div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Key Skills to Build</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {career.skills.map(s => (
                          <span key={s} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '999px', background: 'rgba(144,205,244,0.08)', color: '#90cdf4', border: '1px solid rgba(144,205,244,0.15)' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#60a5fa', marginBottom: '10px' }}>🏢 Companies to Target</div>
                      {career.companies.map(c => (
                        <div key={c} style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#60a5fa', flexShrink: 0 }} />{c}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Universities */}
              <section>
                <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
                  Universities Offering {program} in {specName} ({universities.length})
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Sorted by NIRF rank</p>

                {universities.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', background: '#162032', borderRadius: '14px', border: '1px solid #1e2f45', color: '#64748b' }}>
                    No universities found for this specialisation. <Link href={`/programs/${programSlug}`} style={{ color: '#c9922a' }}>View all {program} →</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {universities.map((u, idx) => {
                      const pd = u.programDetails[program]
                      return (
                        <div key={u.id} style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '14px', overflow: 'hidden' }}>
                          <div style={{ height: '2px', background: u.color }} />
                          <div style={{ padding: '18px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                              <div>
                                {/* THIS IS THE SEO MONEY LINE — targets "online MBA in Finance from Amity" */}
                                <Link href={`/universities/${u.id}/${programSlug}`}
                                  style={{ fontWeight: '700', color: '#ffffff', fontSize: '15px', textDecoration: 'none' }}>
                                  Online {program} in {specName} from {u.name}
                                </Link>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                                  {u.city}, {u.state} · NIRF #{u.nirf} · {u.naac} · {u.examMode}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {u.approvals.slice(0, 2).map(a => (
                                  <span key={a} style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '999px', background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>{a}</span>
                                ))}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '14px' }}>
                              <div>
                                <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Fees</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>{pd?.fees || `${formatFee(u.feeMin)}+`}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg Salary</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#4ade80' }}>{pd?.avgSalary?.split('–')[0].trim() || '₹4L+'}+</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>EMI from</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>₹{u.emiFrom.toLocaleString()}/mo</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Exam</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>{u.examMode}</div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Link href={`/universities/${u.id}/${programSlug}`}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0f1b2d', fontWeight: '700', fontSize: '12px', textDecoration: 'none' }}>
                                Full {program} Details <ArrowRight size={13} />
                              </Link>
                              <button onClick={() => setEnquiryOpen(true)}
                                style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #1e2f45', color: '#94a3b8', fontSize: '12px', fontWeight: '600', background: 'transparent', cursor: 'pointer' }}>
                                Enquire
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Mid CTA */}
              <div style={{ padding: '24px', background: 'rgba(201,146,42,0.06)', border: '1px solid rgba(201,146,42,0.2)', borderRadius: '14px', textAlign: 'center' }}>
                <h3 className="font-display" style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
                  Not sure which university suits you for {program} in {specName}?
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  Share your profile — marks, work exp, budget — and get a free shortlist in 24 hours.
                </p>
                <button onClick={() => setEnquiryOpen(true)}
                  style={{ padding: '12px 28px', borderRadius: '12px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0f1b2d', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                  Get Free Shortlist →
                </button>
              </div>

              {/* FAQs */}
              <section>
                <h2 className="font-display" style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>
                  {program} in {specName} — FAQs
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {faqs.map((faq, i) => (
                    <details key={i} style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '12px', overflow: 'hidden' }}>
                      <summary style={{ padding: '13px 18px', fontWeight: '600', color: '#ffffff', fontSize: '13px', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                        {faq.q}<span style={{ color: '#c9922a', fontSize: '16px', marginLeft: '10px', flexShrink: 0 }}>+</span>
                      </summary>
                      <div style={{ padding: '10px 18px 14px', fontSize: '13px', color: '#94a3b8', lineHeight: '1.7', borderTop: '1px solid #1e2f45' }}>{faq.a}</div>
                    </details>
                  ))}
                </div>
              </section>

              {/* Interlinking */}
              <div style={{ padding: '18px 22px', background: '#162032', border: '1px solid #1e2f45', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>📖 Also Read</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: '7px' }}>
                  {[
                    { label: `All Online ${program} Universities`, href: `/programs/${programSlug}` },
                    { label: `Compare ${program} Programs Side-by-Side`, href: `/compare` },
                    { label: `Is Online ${program} Valid for Govt Jobs?`, href: `/guides` },
                    { label: `${program} Fees Comparison 2025`, href: `/compare` },
                    { label: `Best ${program} Specialisations India`, href: `/blog` },
                    { label: `${program} for Working Professionals`, href: `/blog` },
                  ].map(link => (
                    <Link key={link.label} href={link.href}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#0f1b2d', borderRadius: '9px', textDecoration: 'none', fontSize: '12px', color: '#94a3b8', border: '1px solid #1e2f45' }}>
                      {link.label}
                      <span style={{ color: '#c9922a', marginLeft: '6px', flexShrink: 0 }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div style={{ width: '230px', flexShrink: 0 }} className="hidden lg:block">
              <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => setEnquiryOpen(true)}
                  style={{ width: '100%', padding: '13px', borderRadius: '12px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0f1b2d', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                  📩 Free Counselling
                </button>

                <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', marginBottom: '10px' }}>Quick Facts</div>
                  {[
                    { label: 'Offering this spec', value: `${universities.length} univs` },
                    { label: 'Salary range', value: career?.salary || 'Varies' },
                    { label: 'Fees from', value: universities.length > 0 ? formatFee(Math.min(...universities.map(u => u.feeMin))) : '₹75K+' },
                    { label: 'Govt job valid', value: '⚠️ Usually No' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e2f45', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>{r.label}</span>
                      <span style={{ fontWeight: '600', color: '#ffffff', textAlign: 'right', maxWidth: '100px' }}>{r.value}</span>
                    </div>
                  ))}
                </div>

                {/* Related specs */}
                <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', marginBottom: '10px' }}>Other {program} Specs</div>
                  {['finance', 'marketing', 'human-resource-management', 'data-science', 'digital-marketing']
                    .filter(s => s !== specSlug)
                    .slice(0, 4)
                    .map(s => (
                      <Link key={s} href={`/programs/${programSlug}/${s}`}
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #1e2f45', textDecoration: 'none', fontSize: '12px' }}>
                        <span style={{ color: '#94a3b8' }}>{formatSpecTitle(s.replace(/-/g, ' '))}</span>
                        <span style={{ color: '#c9922a' }}>→</span>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky */}
        <div className="lg:hidden" style={{ position: 'fixed', bottom: '72px', left: '16px', right: '16px', zIndex: 90 }}>
          <button onClick={() => setEnquiryOpen(true)}
            style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0f1b2d', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 24px rgba(201,146,42,0.4)' }}>
            📩 Free {program} in {specName} Counselling
          </button>
        </div>
      </div>

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} defaultProgram={program} />
    </>
  )
}
