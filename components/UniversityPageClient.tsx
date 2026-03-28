'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin, CheckCircle, BarChart2, ChevronRight, Award,
  Briefcase, TrendingUp, Building2, Plus, BookOpen
} from 'lucide-react'
import { getUniversitiesByProgram, formatFeeSlim as formatFee } from '@/lib/data-slim'
import { getProgramContent } from '@/lib/content'
import type { Program, University } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'
import ApprovalBadges from '@/components/ApprovalBadges'
import { StickyBottomBar, ScholarshipPopup } from '@/components/LeadCapture'
import EdifyTrust from '@/components/EdifyTrust'
import GatedContent from '@/components/GatedContent'

const progSlug = (p: Program) => p.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')

interface Props {
  university: University
}

export default function UniversityPageClient({ university: u }: Props) {
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [activeProgram, setActiveProgram] = useState<Program | null>(null)
  const [compareList, setCompareList] = useState<string[]>([])
  const [compareNotice, setCompareNotice] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const displayProgram: Program = activeProgram || u.programs[0]
  const pd = u.programDetails[displayProgram]
  const programContent = getProgramContent(displayProgram)
  const otherUnis = getUniversitiesByProgram(displayProgram).filter(x=>x.id!==u.id).slice(0,4)
  const compareUrl = `/compare?a=${u.id}${compareList.map(i=>`&b=${i}`).join('')}`

  function addToCompare(uniId: string) {
    if (compareList.includes(uniId)) return
    setCompareList(prev=>[...prev,uniId].slice(-2))
    setCompareNotice(true)
    setTimeout(()=>setCompareNotice(false),3000)
  }

  // Comprehensive FAQs — 10 questions matching real user searches
  const faqs = [
    {
      q:`Is ${u.name} a good university for online degrees?`,
      a:`${u.name} is ${u.nirf < 200 ? `NIRF #${u.nirf} overall` : 'a UGC DEB approved university'}${u.nirfMgt && u.nirfMgt < 200 ?` and NIRF #${u.nirfMgt} in Management`:''}. It holds NAAC ${u.naac} accreditation and is UGC DEB approved. For private sector careers and corporate hiring it is a strong choice. Always verify specific job notifications for government roles.`
    },
    {
      q:`What is the total fee for ${u.name} ${displayProgram}?`,
      a:`The total fee for ${u.name} ${displayProgram} ranges from ${formatFee(u.feeMin)} to ${formatFee(u.feeMax)} for the complete program. EMI options start from ₹${u.emiFrom.toLocaleString()} per month. Semester-wise payment is available. Scholarships and bank tie-ups may reduce the final cost — fill the form to check what you qualify for.`
    },
    {
      q:`What programs does ${u.name} offer online?`,
      a:`${u.name} offers ${u.programs.length} online programs: ${u.programs.join(', ')}. ${displayProgram} is among the most popular. Each program has multiple specialisations. Fees range from ${formatFee(u.feeMin)} to ${formatFee(u.feeMax)}.`
    },
    {
      q:`Is ${u.name} ${displayProgram} valid and UGC approved?`,
      a:`Yes. ${u.name} is UGC DEB approved and NAAC ${u.naac} accredited. The ${displayProgram} degree is fully valid for private sector employment, higher education, and banking sector jobs. ${u.govtRecognised ? 'It is also recognised for government recruitment as per UGC 2020 guidelines.' : 'Check specific government job notifications — some central PSU roles may have restrictions on online degrees.'}`
    },
    {
      q:`What is the eligibility for ${u.name} ${displayProgram}?`,
      a:`${u.eligibility}. No entrance exam is required for online admission. Admission is based on merit and online application. Mark sheets and degree certificate are required at enrolment.`
    },
    {
      q:`How are exams conducted at ${u.name}?`,
      a:`${u.name} uses ${u.examMode} mode. No travel to exam centre is required. Assessments include internal assignments, projects, and online proctored exams via webcam from home or office. Exam schedule is communicated through the university LMS.`
    },
    {
      q:`Is ${u.name} ${displayProgram} valid for government jobs?`,
      a:`${u.name} is UGC DEB approved, and the Ministry of Education confirmed parity of online and regular degrees in 2020. ${u.psuEligible ? `${u.name} degrees are accepted for PSU and government applications. Always verify the specific recruitment notification.` : 'Most central government and PSU jobs may not accept online degrees — check the specific notification before applying.'}`
    },
    {
      q:`What specialisations are available in ${u.name} ${displayProgram}?`,
      a:`${u.name} ${displayProgram} offers specialisations including ${pd?.specs?.slice(0,5).join(', ') || 'General, Finance, Marketing, HR'}. ${pd?.specs && pd.specs.length > 5 ? `A total of ${pd.specs.length} specialisations are available.` : ''} Specialisation choice typically happens at the time of application.`
    },
    {
      q:`What jobs can I get after ${u.name} ${displayProgram}?`,
      a:`After completing ${displayProgram} from ${u.name}, typical roles include ${pd?.roles?.slice(0,4).join(', ') || 'Management Trainee, Business Analyst, Operations Executive'}. Average salaries range from ${pd?.avgSalary || formatFee(u.feeMin * 4) + ' per annum'}. Top hiring companies include ${pd?.topCompanies?.slice(0,5).join(', ') || 'leading corporates across sectors'}.`
    },
    {
      q:`Should I apply through Edify for ${u.name}?`,
      a:`Edify is a free, independent guidance platform. We do a 3–4 stage evaluation covering your career goals, eligibility, budget, and ROI before recommending any university. Our rankings use only NIRF rank with zero paid placements. You can apply directly to the university — Edify is here if you want unbiased advice at no cost.`
    },
  ]

  return (
    <>
      {/* ── Lead Capture Triggers ── */}
      <StickyBottomBar universityName={u.name} label={`Apply to ${u.abbr} — Speak with an Advisor`} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context':'https://schema.org','@type':'FAQPage',
        mainEntity:faqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))
      })}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context':'https://schema.org','@type':'Course',
        name:`${u.name} ${displayProgram}`,
        description:`UGC DEB approved ${displayProgram} from ${u.name}. NAAC ${u.naac} accredited.${u.nirf < 200 ? ` NIRF #${u.nirf}.` : ''} Total fee ${formatFee(u.feeMin)}–${formatFee(u.feeMax)}.`,
        url:`https://edifyedu.in/universities/${u.id}`,
        provider:{'@type':'EducationalOrganization',name:u.name},
        educationalLevel:'Postgraduate',
        courseMode:'online',
        offers:{'@type':'Offer',priceCurrency:'INR',lowPrice:u.feeMin,highPrice:u.feeMax,availability:'https://schema.org/InStock'},
        timeRequired: displayProgram==='MBA'||displayProgram==='MCA'?'P2Y':'P3Y',
      })}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context':'https://schema.org','@type':'BreadcrumbList',
        itemListElement:[
          {'@type':'ListItem',position:1,name:'Home',item:'https://edifyedu.in'},
          {'@type':'ListItem',position:2,name:'Universities',item:'https://edifyedu.in/universities'},
          {'@type':'ListItem',position:3,name:`${u.name} ${displayProgram}`,item:`https://edifyedu.in/universities/${u.id}`},
        ]
      })}}/>

      <div className="page-shell">
        <div style={{height:3,background:u.color}}/>

        {/* Breadcrumb */}
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
              <Link href="/" className="text-ink-2 no-underline">Home</Link>
              <ChevronRight size={12}/>
              <Link href="/universities" className="text-ink-2 no-underline">Universities</Link>
              <ChevronRight size={12}/>
              <span className="text-amber font-semibold">{u.abbr}</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{background:'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)',borderBottom:'1px solid #1e2f45'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-5 mb-6">
                  {u.logo && (
                    <div className="bg-white rounded-xl flex items-center justify-center p-3 shadow-xl shrink-0 border border-white/20" style={{ width: '120px', height: '84px' }}>
                      <img src={u.logo} alt={u.abbr} style={{ maxHeight: '100%', maxWidth: '100%', objectFit:'contain' }} />
                    </div>
                  )}
                  <h1 className="font-display flex-1" style={{fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:800,color:'#fff',lineHeight:1.15,margin:0}}>
                    {u.name}
                  </h1>
                </div>
                <p className="text-slate-400 text-[15px] mb-4 flex items-center gap-1.5">
                  <MapPin size={14}/> {u.city}, {u.state}
                </p>
                <p className="text-[15px] text-slate-300 leading-[1.7] mb-5 max-w-2xl">
                  {u.description}
                </p>

                {/* Program Tabs */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {u.programs.map(prog => (
                    <button
                      key={prog}
                      onClick={() => setActiveProgram(prog)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        displayProgram === prog
                          ? 'bg-amber text-white'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {prog}
                    </button>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {[
                    { label: 'Total Fee', value: `${formatFee(u.feeMin)} – ${formatFee(u.feeMax)}` },
                    { label: 'EMI from', value: `₹${u.emiFrom.toLocaleString()}/mo` },
                    { label: 'Duration', value: pd?.duration || '2 Years' },
                    { label: 'Exam Mode', value: u.examMode },
                  ].map(stat => (
                    <div key={stat.label} style={{padding:'10px 16px',background:'rgba(255,255,255,0.06)',border:'1px solid #1e2f45',borderRadius:'var(--r-sm)'}}>
                      <div className="text-[10px] text-ink-3 uppercase tracking-wider">{stat.label}</div>
                      <div className="text-[15px] font-bold text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setEnquiryOpen(true)}
                    style={{padding:'13px 28px',borderRadius:'var(--r-sm)',background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}
                  >
                    Speak with an Advisor →
                  </button>
                  <Link
                    href={compareUrl}
                    style={{padding:'13px 20px',borderRadius:'var(--r-sm)',border:'1px solid #1e2f45',color:'var(--ink-4)',fontSize:13,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:6}}
                  >
                    <BarChart2 size={16}/> Compare
                  </Link>
                </div>
              </div>
              {/* Right Sidebar */}
              <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
                {/* Approvals Card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div style={{fontSize:11,fontWeight:800,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:14}}>
                    ✓ Approvals &amp; Rankings
                  </div>
                  <ApprovalBadges
                    approvals={u.approvals || []}
                    naac={u.naac}
                    nirf={u.nirf}
                    highlight={u.highlight}
                    layout="column"
                  />
                  <div style={{marginTop:16,paddingTop:14,borderTop:'1px solid rgba(255,255,255,0.08)'}}>
                    <div style={{fontSize:11,color:'#94A3B8',marginBottom:4}}>Govt Job Valid?</div>
                    <div style={{fontSize:13,fontWeight:700,color: u.govtRecognised ? '#4ADE80' : '#FBBF24'}}>
                      {u.govtRecognised ? '✓ Yes — UGC DEB Approved' : '⚠️ Check specific notification'}
                    </div>
                  </div>
                </div>

                {/* Scholarship Alert */}
                <div onClick={() => setEnquiryOpen(true)} className="p-5 rounded-xl cursor-pointer overflow-hidden relative group transition-all hover:scale-[1.02] hover:shadow-lg shadow-md border mt-2" style={{background:'linear-gradient(135deg, #1e3a8a, #111827)', borderColor:'rgba(59,130,246,0.3)', boxShadow: '0 10px 25px -5px rgba(59,130,246,0.1)'}}>
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20"></div>
                  <div className="flex gap-4 items-start relative z-10 w-full">
                    <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
                      <Award style={{color: '#93c5fd', width: 20, height: 20}} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[15px] mb-1 group-hover:text-white transition-colors" style={{color: '#dbeafe'}}>Scholarship Alert</h4>
                      <p className="text-[13px] font-medium leading-relaxed mb-3 pr-2" style={{color: '#bfdbfe'}}>
                        Save up to <strong style={{color: '#93c5fd'}}>₹20,000 - ₹40,000</strong> on your total fees.
                      </p>
                      <span className="text-[12px] font-bold flex items-center gap-1 uppercase tracking-wider" style={{color: '#fbbf24'}}>
                        Check Eligibility <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

          {/* Mobile ONLY Scholarship Alert */}
          <div className="block lg:hidden mb-6">
            <div onClick={() => setEnquiryOpen(true)} className="p-4 rounded-xl cursor-pointer overflow-hidden relative group transition-all hover:scale-[1.02] hover:shadow-lg shadow-[0_4px_20px_rgba(59,130,246,0.15)] border border-blue-500/30" style={{background:'linear-gradient(135deg, #1e3a8a, #111827)'}}>
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20"></div>
              <div className="flex gap-4 items-center relative z-10 w-full">
                <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0 shadow-inner">
                  <Award style={{color: '#93c5fd', width: 22, height: 22}} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[15px] mb-0.5" style={{color: '#dbeafe'}}>Scholarship Alert</h4>
                  <p className="text-[12px] font-medium leading-relaxed mb-1 pr-2" style={{color: '#bfdbfe'}}>
                    Save up to <strong style={{color: '#93c5fd'}}>₹20,000 - ₹40,000</strong>
                  </p>
                  <span className="text-[11px] font-black flex items-center gap-1 uppercase tracking-wider" style={{color: '#fbbf24'}}>
                    Check Eligibility <ChevronRight size={14}/>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Main Content */}
            <div className="flex-1 flex flex-col gap-8">

              {/* About University */}
              <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-4">
                  About {u.name}
                </h2>
                <p className="text-ink-2 text-[15px] leading-relaxed mb-4">
                  {u.description}
                </p>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-surface-2 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🏛️</div>
                    <div className="text-xs text-ink-3 uppercase tracking-wider">Established</div>
                    <div className="font-bold text-navy">{u.established || 'N/A'}</div>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📍</div>
                    <div className="text-xs text-ink-3 uppercase tracking-wider">Location</div>
                    <div className="font-bold text-navy">{u.city}, {u.state}</div>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">⭐</div>
                    <div className="text-xs text-ink-3 uppercase tracking-wider">NAAC Grade</div>
                    <div className="font-bold text-navy">{u.naac}</div>
                  </div>
                  {u.nirf < 200 && (
                    <div className="bg-surface-2 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-2">🏆</div>
                      <div className="text-xs text-ink-3 uppercase tracking-wider">NIRF Rank</div>
                      <div className="font-bold text-navy">#{u.nirf}</div>
                    </div>
                  )}
                </div>
              </section>
              
              {/* Program Details */}
              {pd && (
                <section className="card-lg p-6">
                  <h2 className="font-display text-xl font-bold text-navy mb-4">
                    {displayProgram} at {u.abbr}
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Total Fees', value: pd.fees, icon: '💰' },
                      { label: 'Duration', value: pd.duration, icon: '⏱️' },
                      { label: 'Avg Salary', value: pd.avgSalary, icon: '📈' },
                      { label: 'Specialisations', value: `${pd.specs.length}+`, icon: '🎯' },
                    ].map(item => (
                      <div key={item.label} className="bg-surface-2 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-1">{item.icon}</div>
                        <div className="text-xs text-ink-3 uppercase tracking-wider mb-1">{item.label}</div>
                        <div className="font-bold text-navy">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Specialisations */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-navy mb-3">Available Specialisations</h3>
                    <div className="flex flex-wrap gap-2">
                      {pd.specs.map(spec => {
                        const specSlug = spec.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
                        const programSlug = `online-${displayProgram.toLowerCase().replace(/\./g, '')}`
                        return (
                          <Link
                            key={spec}
                            href={`/universities/${u.id}/${programSlug}/${specSlug}`}
                            className="px-3 py-1.5 bg-surface-2 border border-border rounded-full text-sm text-ink-2 hover:border-amber hover:text-amber transition-colors"
                          >
                            {spec}
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  {/* Career Outcome */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="text-green-600 shrink-0 mt-0.5" size={20}/>
                      <div>
                        <div className="font-semibold text-green-800 mb-1">Career Outcome</div>
                        <p className="text-sm text-green-700">{pd.careerOutcome}</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Admissions Open Banner */}
              <section className="card-lg p-6" style={{ background: 'linear-gradient(135deg, #0B1D35, #142540)', border: '1px solid rgba(200,129,26,0.3)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold text-amber uppercase tracking-widest mb-1">🎓 Admissions Open</div>
                    <h2 className="font-display text-xl font-bold text-white mb-2">Admissions Open — July 2026 Batch</h2>
                    <ul className="flex flex-col gap-1.5">
                      <li className="text-sm text-slate-300">📅 Last date to apply: <strong className="text-white">October 15–30, 2026</strong></li>
                      <li className="text-sm text-slate-300">💻 Mode: <strong className="text-white">100% Online — apply from anywhere in India</strong></li>
                      <li className="text-sm text-slate-300">✅ Eligibility: <strong className="text-white">{u.eligibility}</strong></li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setEnquiryOpen(true)}
                    className="shrink-0 px-6 py-3 rounded-xl font-bold text-white whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)', fontSize: 14 }}
                  >
                    Check Eligibility &amp; Apply →
                  </button>
                </div>
              </section>

              {/* Who Should Apply */}
              <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-4">Who Should Apply?</h2>
                <div className="text-sm font-bold text-green-600 uppercase tracking-wider mb-3">✓ Best For</div>
                <ul className="space-y-2">
                  {u.forWho.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink-2">
                      <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5"/>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Edify Recommends - Skills & Projects */}
              <section className="card-lg p-6" style={{background:'linear-gradient(135deg, rgba(31,107,82,0.05), rgba(31,107,82,0.02))', border:'1px solid rgba(31,107,82,0.15)'}}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">✦</span>
                  <h2 className="font-display text-xl font-bold text-navy">Edify Recommends — Build These Alongside</h2>
                </div>
                <p className="text-sm text-ink-3 mb-6">
                  Your degree gets you the credential. These are the things that get you the job — and the raise after that.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-xs font-bold text-sage uppercase tracking-wider mb-3">📚 Skills to Learn</div>
                    <ul className="space-y-2">
                      {(programContent?.skills?.technical?.slice(0,4) || [
                        'Advanced Excel & Data Analysis',
                        'Business Communication',
                        'Financial Modelling',
                        'Project Management'
                      ]).map(skill => (
                        <li key={skill} className="flex items-start gap-2 text-sm text-ink-2">
                          <span className="text-sage shrink-0">✓</span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber uppercase tracking-wider mb-3">🛠️ Projects to Build</div>
                    <ul className="space-y-2">
                      {[
                        'Business Case Study Analysis',
                        'Market Research Report',
                        'Financial Dashboard in Excel',
                        'Strategy Presentation Deck'
                      ].map(project => (
                        <li key={project} className="flex items-start gap-2 text-sm text-ink-2">
                          <span className="text-amber shrink-0">→</span>
                          {project}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-purple uppercase tracking-wider mb-3">🎓 Certifications</div>
                    <ul className="space-y-2">
                      {(programContent?.certifications?.slice(0,4) || [
                        'Google Analytics',
                        'HubSpot Marketing',
                        'LinkedIn Learning Path',
                        'Six Sigma Yellow Belt'
                      ]).map(cert => (
                        <li key={cert} className="flex items-start gap-2 text-sm text-ink-2">
                          <span className="text-purple shrink-0">★</span>
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Edify Trust */}
              <EdifyTrust compact />

              {/* Gated Content */}
              {pd && (
                <GatedContent
                  universityName={u.name}
                  programName={displayProgram}
                  feeMin={u.feeMin}
                  feeMax={u.feeMax}
                  emiFrom={u.emiFrom}
                  hints={[
                    `🎓 Merit scholarship — up to 25% fee waiver for eligible profiles at ${u.abbr}`,
                    `🏦 No-cost EMI — 12 to 24 months, from ₹${u.emiFrom.toLocaleString()}/month`,
                    `💼 Alumni referral & early-bird discounts available this admission cycle`,
                  ]}
                />
              )}

              {/* FAQs */}
              <section>
                <h2 className="font-display text-xl font-bold text-navy mb-4">
                  Frequently Asked Questions — {u.name}
                </h2>
                <div className="flex flex-col gap-2">
                  {faqs.map((faq, i) => (
                    <div key={i} className="bg-white border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full px-5 py-4 font-semibold text-navy text-sm cursor-pointer flex justify-between items-center bg-transparent border-none text-left"
                      >
                        {faq.q}
                        <span className="text-amber text-xl shrink-0 ml-3" style={{transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s'}}>+</span>
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-4 text-sm text-ink-2 leading-relaxed border-t border-border pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Other Universities */}
              {otherUnis.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-navy mb-4">
                    Other Universities Offering {displayProgram}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {otherUnis.map(ou => (
                      <Link
                        key={ou.id}
                        href={`/universities/${ou.id}`}
                        className="block bg-white border border-border rounded-xl p-4 hover:border-amber transition-colors"
                      >
                        <div className="font-bold text-navy mb-1">{ou.name}</div>
                        <div className="text-xs text-ink-3 mb-2">
                          {ou.nirf < 100 ? `NIRF #${ou.nirf} · ` : ''}{ou.naac}
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-ink-2">Fees: <strong>{formatFee(ou.feeMin)}+</strong></span>
                          <span className="text-amber font-semibold">View →</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="sticky top-20 flex flex-col gap-4">
                <button
                  onClick={() => setEnquiryOpen(true)}
                  className="w-full py-4 rounded-xl font-bold text-white text-base"
                  style={{background:'linear-gradient(135deg,#c9922a,#e0a93a)'}}
                >
                  Speak with an Advisor
                </button>

                <div className="bg-white border border-border rounded-xl p-4">
                  <div className="font-bold text-navy text-sm mb-3">Quick Facts</div>
                  {[
                    ...(u.nirf < 100 ? [{ label: 'NIRF Overall', value: `#${u.nirf}` }] : []),
                    ...(u.nirfMgt && u.nirfMgt < 100 ? [{ label: 'NIRF Management', value: `#${u.nirfMgt}` }] : []),
                    { label: 'NAAC Grade', value: u.naacScore ? `${u.naac} (${u.naacScore})` : u.naac },
                    { label: 'Location', value: `${u.city}, ${u.state}` },
                    { label: 'Exam Mode', value: u.examMode },
                    { label: 'Eligibility', value: u.eligibility },
                    { label: 'Fees from', value: formatFee(u.feeMin) },
                    { label: 'EMI from', value: `₹${u.emiFrom.toLocaleString()}/mo` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between py-2 border-b border-border text-xs">
                      <span className="text-ink-3">{row.label}</span>
                      <span className="font-semibold text-ink text-right max-w-[120px]">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-border rounded-xl p-4">
                  <div className="font-bold text-navy text-sm mb-3">All Programs</div>
                  {u.programs.map(prog => (
                    <Link
                      key={prog}
                      href={`/universities/${u.id}/${progSlug(prog)}`}
                      className="flex justify-between items-center py-2 border-b border-border text-sm no-underline"
                    >
                      <span className="text-ink-2 font-medium">{prog}</span>
                      <span className="text-amber text-xs">{u.programDetails[prog]?.fees || formatFee(u.feeMin)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScholarshipPopup universityName={u.name} />
      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} universityName={u.name} universityId={u.id}/>
    </>
  )
}
