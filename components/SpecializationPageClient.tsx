'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle, Briefcase, TrendingUp, BookOpen, ChevronRight, Award, GraduationCap, Clock, IndianRupee, Lock
} from 'lucide-react'
import { formatFeeSlim as formatFee } from '@/lib/data-slim'
import { getSpecContent, getSpecFallback, getMasterSyllabus, getUniversitySyllabus } from '@/lib/content'
import ApprovalBadges from '@/components/ApprovalBadges'
import type { University, Program } from '@/lib/data'
import { IMPROVED_SPECS } from '@/lib/improved-specs'
import EnquiryModal from '@/components/EnquiryModal'
import SyllabusSection from '@/components/SyllabusSection'
import LearningExperience from '@/components/LearningExperience'

const WA_NUMBER = '917061285806'

// Programs that NEVER have full syllabus — always fully lock the spec page
const ALWAYS_LOCK_PROGRAMS: Program[] = ['BBA', 'BCA', 'BA', 'B.Com', 'M.Com', 'MA', 'MSc', 'BSc']

function isFullyLocked(program: Program, syllabus: any): boolean {
  if (ALWAYS_LOCK_PROGRAMS.includes(program)) return true
  // MBA/MCA — lock if syllabus sem1 is missing
  if (!syllabus?.sem1) return true
  return false
}

interface Props {
  university: University
  program: Program
  specialization: string
  specSlug: string
}

// Program display names
const PROGRAM_DISPLAY: Record<string, { name: string; level: string; duration: string }> = {
  'MBA': { name: 'Online MBA', level: 'Postgraduate', duration: '2 Years' },
  'MCA': { name: 'Online MCA', level: 'Postgraduate', duration: '2 Years' },
  'BBA': { name: 'Online BBA', level: 'Undergraduate', duration: '3 Years' },
  'BCA': { name: 'Online BCA', level: 'Undergraduate', duration: '3 Years' },
  'M.Com': { name: 'Online M.Com', level: 'Postgraduate', duration: '2 Years' },
  'B.Com': { name: 'Online B.Com', level: 'Undergraduate', duration: '3 Years' },
  'MA': { name: 'Online MA', level: 'Postgraduate', duration: '2 Years' },
  'BA': { name: 'Online BA', level: 'Undergraduate', duration: '3 Years' },
  'MSc': { name: 'Online MSc', level: 'Postgraduate', duration: '2 Years' },
  'BSc': { name: 'Online BSc', level: 'Undergraduate', duration: '3 Years' },
}

export default function SpecializationPageClient({ university: u, program, specialization, specSlug }: Props) {
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const pd = u.programDetails[program]
  const progInfo = PROGRAM_DISPLAY[program] || { name: `Online ${program}`, level: 'Postgraduate', duration: '2 Years' }
  const specContentRaw = getSpecContent(specialization) || getSpecFallback(specialization, program)
  const specContent = { ...(specContentRaw || {}), ...(IMPROVED_SPECS[specialization.toLowerCase()] || {}) }
  const syllabus = getMasterSyllabus(u.id, program) || getUniversitySyllabus(u.id, program)
  const programSlug = `online-${program.toLowerCase().replace(/\./g, '')}`

  // Check if this spec page should be fully locked
  if (isFullyLocked(program, syllabus)) {
    return (
      <LockedSpecPage
        u={u}
        program={program}
        specialization={specialization}
        specSlug={specSlug}
        pd={pd}
        progInfo={progInfo}
        programSlug={programSlug}
      />
    )
  }
  
  // Get other specializations from this university
  const otherSpecs = pd?.specs?.filter(s => s !== specialization).slice(0, 6) || []

  // FAQs specific to this specialization
  const faqs = [
    {
      q: `What is the fee for ${progInfo.name} in ${specialization} at ${u.name}?`,
      a: `The total fee for ${progInfo.name} in ${specialization} at ${u.name} is ${pd?.fees || `₹${Math.round(u.feeMin/1000)}K - ₹${Math.round(u.feeMax/1000)}K`}. EMI options are available starting from ₹${u.emiFrom.toLocaleString()}/month. Scholarships may be available for eligible candidates.`
    },
    {
      q: `Is ${u.name} ${progInfo.name} in ${specialization} valid?`,
      a: `Yes, ${u.name} ${progInfo.name} in ${specialization} is 100% valid. The university is UGC DEB approved and NAAC ${u.naac} accredited.${u.nirf < 200 ? ` It is NIRF #${u.nirf} ranked.` : ''} The degree is equivalent to a regular ${program} and is valid for private sector jobs, bank jobs, and higher education.`
    },
    {
      q: `What is the eligibility for ${progInfo.name} in ${specialization} at ${u.name}?`,
      a: `${u.eligibility}. No entrance exam is required. Admission is based on merit and online application. Working professionals with relevant experience may get additional weightage.`
    },
    {
      q: `What are the career options after ${progInfo.name} in ${specialization}?`,
      a: `After completing ${progInfo.name} in ${specialization} from ${u.name}, you can work as ${pd?.roles?.slice(0, 4).join(', ') || 'Manager, Analyst, Consultant, Executive'}. Average salary ranges from ${pd?.avgSalary || '₹6-15 LPA'}. Top companies hiring include ${pd?.topCompanies?.slice(0, 5).join(', ') || 'leading MNCs and corporates'}.`
    },
    {
      q: `How are exams conducted for ${progInfo.name} in ${specialization}?`,
      a: `${u.name} uses ${u.examMode} examination mode. Exams are conducted online from home through proctored assessments. No travel to exam centre is required. Internal assessments, assignments, and projects are also part of the evaluation.`
    },
  ]

  return (
    <>
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context':'https://schema.org','@type':'Course',
        name:`${progInfo.name} in ${specialization} - ${u.name}`,
        description:`UGC DEB approved ${progInfo.name} in ${specialization} from ${u.name}. NAAC ${u.naac} accredited.`,
        provider:{'@type':'Organization',name:u.name},
        offers:{'@type':'Offer',price:u.feeMin,priceCurrency:'INR'},
        educationalLevel:progInfo.level,
        courseMode:'online',
      })}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context':'https://schema.org','@type':'BreadcrumbList',
        itemListElement:[
          {'@type':'ListItem',position:1,name:'Home',item:'https://edifyedu.in'},
          {'@type':'ListItem',position:2,name:'Universities',item:'https://edifyedu.in/universities'},
          {'@type':'ListItem',position:3,name:u.name,item:`https://edifyedu.in/universities/${u.id}`},
          {'@type':'ListItem',position:4,name:progInfo.name,item:`https://edifyedu.in/universities/${u.id}/${programSlug}`},
          {'@type':'ListItem',position:5,name:specialization,item:`https://edifyedu.in/universities/${u.id}/${programSlug}/${specSlug}`},
        ],
      })}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context':'https://schema.org','@type':'FAQPage',
        mainEntity:faqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))
      })}}/>

      <div className="page-shell">
        <div style={{height:3,background:u.color}}/>

        {/* Breadcrumb */}
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
              <Link href="/" className="text-ink-2 no-underline hover:text-amber">Home</Link>
              <ChevronRight size={12}/>
              <Link href="/universities" className="text-ink-2 no-underline hover:text-amber">Universities</Link>
              <ChevronRight size={12}/>
              <Link href={`/universities/${u.id}`} className="text-ink-2 no-underline hover:text-amber">{u.abbr}</Link>
              <ChevronRight size={12}/>
              <Link href={`/universities/${u.id}/${programSlug}`} className="text-ink-2 no-underline hover:text-amber">{progInfo.name}</Link>
              <ChevronRight size={12}/>
              <span className="text-amber font-semibold">{specialization}</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div style={{background:'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)',borderBottom:'1px solid #1e2f45'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
            <div className="max-w-3xl">
              <div className="text-[11px] font-bold text-amber uppercase tracking-widest mb-2.5">
                {progInfo.name} Specialization · UGC DEB Approved · {pd?.duration || progInfo.duration}
              </div>
              <div className="flex items-center gap-5 mb-6">
                {u.logo && (
                  <div className="bg-white rounded-xl flex items-center justify-center p-3 shadow-xl shrink-0 border border-white/20" style={{ width: '120px', height: '84px' }}>
                    <img src={u.logo} alt={u.abbr} style={{ maxHeight: '100%', maxWidth: '100%', objectFit:'contain' }} />
                  </div>
                )}
                <h1 className="font-display flex-1" style={{fontSize:'clamp(1.5rem,4vw,2.2rem)',fontWeight:800,color:'#fff',lineHeight:1.15,margin:0}}>
                  {u.name} {progInfo.name.replace('Online ', '')} in {specialization}
                </h1>
              </div>
              <p className="text-slate-400 text-[15px] leading-relaxed mb-5">
                {specContent?.heroSub || `Advance your career with ${progInfo.name} in ${specialization} from ${u.name}. Industry-relevant curriculum, flexible learning, and strong placement support.`}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { icon: <IndianRupee size={14}/>, label: 'Total Fees', value: pd?.fees || formatFee(u.feeMin) + '+' },
                  { icon: <Clock size={14}/>, label: 'Duration', value: pd?.duration || progInfo.duration },
                  { icon: <TrendingUp size={14}/>, label: 'Avg Salary', value: specContent?.salaryRange || pd?.avgSalary || '₹8-15 LPA' },
                ].map(stat => (
                  <div key={stat.label} style={{padding:'10px 16px',background:'rgba(255,255,255,0.06)',border:'1px solid #1e2f45',borderRadius:'var(--r-sm)',display:'flex',alignItems:'center',gap:10}}>
                    <span className="text-amber">{stat.icon}</span>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</div>
                      <div className="text-[14px] font-bold text-white">{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Approvals Row — professional badges with logo + name + sublabel */}
              <div style={{marginBottom:32}}>
                <div style={{fontSize:10,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Approvals &amp; Recognitions</div>
                <ApprovalBadges
                  approvals={u.approvals || []}
                  naac={u.naac}
                  nirf={u.nirf}
                  highlight={u.highlight}
                  layout="row"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setEnquiryOpen(true)}
                  style={{padding:'13px 28px',borderRadius:'var(--r-sm)',background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}
                >
                  Apply Now →
                </button>
                <Link
                  href={`/universities/${u.id}`}
                  style={{padding:'13px 20px',borderRadius:'var(--r-sm)',border:'1px solid #1e2f45',color:'var(--ink-4)',fontSize:13,fontWeight:600,textDecoration:'none'}}
                >
                  ← All {u.abbr} Programs
                </Link>
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
            {/* Left Column */}
            <div className="flex-1 flex flex-col gap-8">
              
              {/* About Specialization */}
              <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-4">
                  About {progInfo.name} in {specialization}
                </h2>
                <p className="text-ink-2 text-[15px] leading-relaxed mb-4">
                  {specContent?.overview || `If you're looking to go deep into ${specialization.toLowerCase()} — not just learn the theory but actually use it at work — this is the specialisation for that. The ${progInfo.name} in ${specialization} from ${u.name} covers the practical side: real frameworks, tools people actually use on the job, and enough depth that your employer will notice the difference.`}
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-surface-2 rounded-lg p-4 text-center">
                    <GraduationCap className="w-8 h-8 text-amber mx-auto mb-2"/>
                    <div className="text-sm font-bold text-navy">UGC DEB Approved</div>
                    <div className="text-xs text-ink-3">Valid Degree</div>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-4 text-center">
                    <Briefcase className="w-8 h-8 text-amber mx-auto mb-2"/>
                    <div className="text-sm font-bold text-navy">Industry Relevant</div>
                    <div className="text-xs text-ink-3">Updated Curriculum</div>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-amber mx-auto mb-2"/>
                    <div className="text-sm font-bold text-navy">Career Growth</div>
                    <div className="text-xs text-ink-3">Placement Support</div>
                  </div>
                </div>
              </section>

              {/* Syllabus */}
              {syllabus ? (
                <SyllabusSection syllabus={syllabus} program={program} universityName={u.name} />
              ) : (
                <section id="syllabus" className="scroll-mt-24 mb-16 card-lg relative overflow-hidden">
                  <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2 px-6 pt-6">
                    <BookOpen className="text-amber" size={24} />
                    Syllabus
                  </h2>
                  <div className="relative border-t border-border p-8 text-center bg-slate-50 flex flex-col items-center justify-center min-h-[280px]">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/90 z-10 blur-[1px]"></div>
                    {/* Dummy blurred syllabus lines behind */}
                    <div className="absolute inset-0 p-8 flex flex-col gap-4 opacity-30 select-none overflow-hidden">
                      <div className="h-4 bg-slate-300 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-300 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-300 rounded w-5/6"></div>
                      <div className="h-4 bg-slate-300 rounded w-2/3 mt-6"></div>
                      <div className="h-4 bg-slate-300 rounded w-4/5"></div>
                    </div>
                    
                    <div className="relative z-20 flex flex-col items-center max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 border border-slate-100">
                        <Lock className="text-navy w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-navy mb-2">Detailed Syllabus Protected</h3>
                      <p className="text-sm text-ink-2 mb-6">
                        Unlock the complete semester-by-semester curriculum, subject details, and credit structure for this program.
                      </p>
                      <button
                        onClick={() => setEnquiryOpen(true)}
                        className="btn-primary w-full py-3.5 text-[15px] shadow-lg shadow-amber/20"
                      >
                        Unlock Full Syllabus
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Learning Experience */}
              <LearningExperience program={program} />

              {/* Edify Recommends */}
              {((specContent as any)?.skills?.length > 0 || (specContent as any)?.projectIdeas?.length > 0 || (specContent as any)?.internships?.length > 0) && (
                <section className="card-lg p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div style={{ padding: '6px 12px', background: 'var(--amber-light)', color: 'var(--amber-text)', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(200,129,26,0.2)' }}>
                      Edify Recommends
                    </div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-navy m-0">
                      For Better Opportunities
                    </h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Skills to Learn */}
                    {(specContent as any)?.skills?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-navy mb-3">
                          <CheckCircle size={16} className="text-amber" /> Skills to Learn
                        </div>
                        <ul className="space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
                          {(specContent as any).skills.map((skill: string, i: number) => (
                            <li key={i} className="flex gap-2 text-sm text-ink-2">
                              <span className="text-amber flex-shrink-0 mt-0.5">•</span>
                              <span style={{ lineHeight: 1.5 }}>{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Projects & Internships */}
                    {(((specContent as any)?.projectIdeas?.length > 0) || ((specContent as any)?.internships?.length > 0)) && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-navy mb-3">
                          <Briefcase size={16} className="text-amber" /> Projects & Internships to Do
                        </div>
                        <ul className="space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
                          {((specContent as any)?.projectIdeas || (specContent as any)?.internships || []).map((project: string, i: number) => (
                            <li key={i} className="flex gap-2 text-sm text-ink-2">
                              <span className="text-amber flex-shrink-0 mt-0.5">•</span>
                              <span style={{ lineHeight: 1.5 }}>{project}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Career Outcomes */}
              <section className="card-lg p-6">
                <h2 className="font-display text-xl font-bold text-navy mb-4">
                  Career After {progInfo.name} in {specialization}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-navy mb-3">
                      <Briefcase size={16}/> Job Roles
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {((specContent as any)?.roles || pd?.roles || ['Manager', 'Analyst', 'Consultant', 'Executive', 'Team Lead']).slice(0, 6).map((role: string) => (
                        <span key={role} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-navy mb-3">
                      <TrendingUp size={16}/> Salary Range
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {specContent?.salaryRange || pd?.avgSalary || '₹8-15 LPA'}
                    </div>
                    <div className="text-xs text-ink-3 mt-1">Based on experience and company</div>
                  </div>
                </div>
                {pd?.topCompanies && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="text-sm font-bold text-navy mb-3">Top Hiring Companies</div>
                    <div className="flex flex-wrap gap-2">
                      {pd.topCompanies.slice(0, 8).map(company => (
                        <span key={company} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Other Specializations */}
              {otherSpecs.length > 0 && (
                <section className="card-lg p-6">
                  <h2 className="font-display text-xl font-bold text-navy mb-4">
                    Other {program} Specializations at {u.abbr}
                  </h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {otherSpecs.map(spec => {
                      const slug = spec.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
                      return (
                        <Link
                          key={spec}
                          href={`/universities/${u.id}/${programSlug}/${slug}`}
                          className="flex items-center justify-between p-3 bg-surface-2 border border-border rounded-lg hover:border-amber transition-colors no-underline"
                        >
                          <span className="text-sm font-medium text-navy">{spec}</span>
                          <ChevronRight size={16} className="text-ink-3"/>
                        </Link>
                      )
                    })}
                  </div>
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
                    <BookOpen size={14} className="text-amber shrink-0 mt-0.5" />
                    <span><strong>Minimum passing:</strong> 40% in each subject</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-ink-2">
                    <BookOpen size={14} className="text-amber shrink-0 mt-0.5" />
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

              {/* FAQs */}
              <section>
                <h2 className="font-display text-xl font-bold text-navy mb-4">
                  FAQs — {u.name.replace(/\s+online\s*$/i, '')} {progInfo.name} in {specialization}
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
              {/* Related Programs — internal linking for SEO */}
              {program === 'MBA' && (
                <section className="card-lg p-6">
                  <h2 className="font-display text-lg font-bold text-navy mb-4">Related Programs You May Consider</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { href: '/programs/mba', label: 'Best Online MBA India 2026' },
                      { href: '/programs/mba/finance', label: 'MBA Finance' },
                      { href: '/programs/mba/marketing', label: 'MBA Marketing' },
                      { href: '/programs/mba/hr', label: 'MBA Human Resources' },
                      { href: '/programs/mba/data-science', label: 'MBA Data Science' },
                      { href: '/compare', label: 'Compare Universities' },
                    ].map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-2 px-4 py-3 bg-white border border-border rounded-lg text-sm font-medium text-navy hover:border-amber hover:text-amber transition-colors no-underline"
                      >
                        <ChevronRight size={14} className="text-amber shrink-0" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="sticky top-20 flex flex-col gap-4">

                {/* Admission CTA */}
                <div className="p-4 rounded-xl" style={{background:'linear-gradient(135deg,#0B1D35,#142540)',border:'1px solid rgba(200,129,26,0.3)'}}>
                  <div className="text-[10px] font-bold text-amber uppercase tracking-wider mb-2">🎓 Admissions Open</div>
                  <div className="text-lg font-bold text-white mb-1">
                    {progInfo.name} in {specialization}
                  </div>
                  <div className="text-sm text-slate-300 mb-3">
                    {u.name}
                  </div>
                  <button
                    onClick={() => setEnquiryOpen(true)}
                    className="w-full py-3 rounded-lg font-bold text-white text-sm"
                    style={{background:'linear-gradient(135deg,#c9922a,#e0a93a)'}}
                  >
                    Apply Now →
                  </button>
                </div>

                {/* Scholarship Alert */}
                <div onClick={() => setEnquiryOpen(true)} className="hidden lg:block p-5 rounded-xl cursor-pointer overflow-hidden relative group transition-all hover:scale-[1.02] hover:shadow-lg shadow-md border mt-2" style={{background:'linear-gradient(135deg, #1e3a8a, #111827)', borderColor:'rgba(59,130,246,0.3)', boxShadow: '0 10px 25px -5px rgba(59,130,246,0.1)'}}>
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

                {/* Quick Facts */}
                <div className="bg-white border border-border rounded-xl overflow-hidden">
                  <div style={{height:3,background:u.color}}/>
                  <div className="p-4">
                    <div className="font-bold text-navy text-sm mb-3">Program Details</div>
                    {[
                      { label: 'University', value: u.abbr },
                      { label: 'Program', value: `${progInfo.name} in ${specialization}` },
                      { label: 'Duration', value: pd?.duration || progInfo.duration },
                      { label: 'Total Fees', value: pd?.fees || formatFee(u.feeMin) + '+' },
                      { label: 'EMI from', value: `₹${u.emiFrom.toLocaleString()}/mo` },
                      { label: 'Exam Mode', value: u.examMode },
                      { label: 'NAAC', value: u.naac },
                      { label: 'NIRF', value: u.nirf < 200 ? `#${u.nirf}` : 'N/A' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between py-2 border-b border-border text-xs">
                        <span className="text-ink-3">{row.label}</span>
                        <span className="font-semibold text-ink text-right max-w-[140px]">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approvals */}
                <div className="bg-white border border-border rounded-xl p-4">
                  <div className="font-bold text-navy text-sm mb-3">Approvals</div>
                  {u.approvals.map(a => (
                    <div key={a} className="flex items-center gap-2 mb-2 text-xs text-ink-2">
                      <CheckCircle size={14} className="text-green-500"/> {a}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="lg:hidden fixed bottom-[72px] left-4 right-4 z-50">
          <button
            onClick={() => setEnquiryOpen(true)}
            className="w-full py-4 rounded-xl font-bold text-white shadow-lg"
            style={{background:'linear-gradient(135deg,#c9922a,#e0a93a)',boxShadow:'0 4px 24px rgba(201,146,42,0.4)'}}
          >
            Apply for {progInfo.name} in {specialization}
          </button>
        </div>
      </div>

      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        universityName={u.name}
        universityId={u.id}
        defaultProgram={program}
      />
    </>
  )
}

// ── FULLY LOCKED SPEC PAGE ──────────────────────────────────────────────────
interface LockedSpecPageProps {
  u: University
  program: Program
  specialization: string
  specSlug: string
  pd: University['programDetails'][Program]
  progInfo: { name: string; level: string; duration: string }
  programSlug: string
}

function LockedSpecPage({ u, program, specialization, specSlug, pd, progInfo, programSlug }: LockedSpecPageProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function buildWAMessage() {
    return encodeURIComponent(
      `Hi Edify Team, I want complete details about ${u.name} ${program} in ${specialization}. My name is ${name.trim()} and my number is ${phone.trim()}.`
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim(), p = phone.trim().replace(/\D/g, '')
    if (!n) { setError('Please enter your name.'); return }
    if (p.length < 10) { setError('Please enter a valid 10-digit phone number.'); return }
    setError('')
    setSubmitting(true)

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_LEADS_WEBHOOK_URL
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: n,
            phone: p,
            program,
            university: u.name,
            sourcePage: typeof window !== 'undefined' ? window.location.pathname : `/${u.id}/${programSlug}/${specSlug}`,
          }),
        })
      }
    } catch {
      // Silent fail — proceed to success
    }

    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => window.open(`https://wa.me/${WA_NUMBER}?text=${buildWAMessage()}`, '_blank'), 1200)
  }

  const shortDesc = pd?.careerOutcome
    ? pd.careerOutcome.split('.').slice(0, 2).join('.').trim() + '.'
    : `${progInfo.name} in ${specialization} from ${u.name}. UGC DEB approved, ${pd?.duration || progInfo.duration} program.`

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
            <Link href="/" className="text-ink-2 no-underline hover:text-navy">Home</Link>
            <ChevronRight size={12}/>
            <Link href="/universities" className="text-ink-2 no-underline hover:text-navy">Universities</Link>
            <ChevronRight size={12}/>
            <Link href={`/universities/${u.id}`} className="text-ink-2 no-underline hover:text-navy">{u.abbr}</Link>
            <ChevronRight size={12}/>
            <Link href={`/universities/${u.id}/${programSlug}`} className="text-ink-2 no-underline hover:text-navy">{progInfo.name}</Link>
            <ChevronRight size={12}/>
            <span className="text-amber font-semibold">{specialization}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
        {/* Visible header section */}
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
                  {progInfo.level} · UGC DEB Approved
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy leading-tight">
                  {u.name} {progInfo.name} in {specialization}
                </h1>
              </div>
            </div>

            <p className="text-sm text-ink-2 leading-relaxed mb-5 max-w-xl">{shortDesc}</p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: 'Duration',    value: pd?.duration || progInfo.duration },
                { label: 'Eligibility', value: u.eligibility || 'Any Graduation' },
                { label: 'NAAC Grade',  value: u.naac },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-border bg-surface-1 px-2 sm:px-3 py-2.5 text-center">
                  <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-ink-3 mb-1">{s.label}</div>
                  <div className="text-xs sm:text-sm font-bold text-navy leading-tight">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Examination Pattern */}
        <section className="card-lg p-6 mb-6">
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
              <BookOpen size={14} className="text-amber shrink-0 mt-0.5" />
              <span><strong>Minimum passing:</strong> 40% in each subject</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-ink-2">
              <BookOpen size={14} className="text-amber shrink-0 mt-0.5" />
              <span><strong>Medium of instruction:</strong> English</span>
            </div>
          </div>
        </section>

        {/* Who Can Apply */}
        <section className="card-lg p-6 mb-6">
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

        {/* Related Programs */}
        {program === 'MBA' && (
          <section className="card-lg p-6 mb-6">
            <h2 className="font-display text-lg font-bold text-navy mb-4">Related Programs You May Consider</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { href: '/programs/mba', label: 'Best Online MBA India 2026' },
                { href: '/programs/mba/finance', label: 'MBA Finance' },
                { href: '/programs/mba/marketing', label: 'MBA Marketing' },
                { href: '/programs/mba/hr', label: 'MBA Human Resources' },
                { href: '/programs/mba/data-science', label: 'MBA Data Science' },
                { href: '/compare', label: 'Compare Universities' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-border rounded-lg text-sm font-medium text-navy hover:border-amber hover:text-amber transition-colors no-underline"
                >
                  <ChevronRight size={14} className="text-amber shrink-0" />
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Locked content section with form */}
        <div className="relative rounded-2xl overflow-hidden border border-border">
          {/* Blurred background content */}
          <div style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none', opacity: 0.4 }} aria-hidden>
            <div className="bg-white p-6 border-b border-border">
              <div className="text-sm font-bold text-navy mb-3">Fee Breakdown</div>
              {['Total Programme Fee', 'Semester 1 Fee', 'Semester 2 Fee', 'EMI Option'].map(l => (
                <div key={l} className="flex justify-between text-xs py-1.5 border-b border-border-light">
                  <span className="text-ink-3">{l}</span>
                  <span className="font-bold text-navy">₹██,███</span>
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

          {/* Overlay with form */}
          <div className="absolute inset-0 flex items-start justify-center pt-8 px-4"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.97) 18%, rgba(255,255,255,1) 40%)' }}>
            <div className="w-full max-w-sm">
              {!submitted ? (
                <div className="bg-white rounded-2xl border border-border shadow-xl p-6">
                  <div className="text-center mb-5">
                    <div className="text-2xl mb-2">🔒</div>
                    <div className="text-base font-extrabold text-navy">Get Full Details</div>
                    <div className="text-[11px] text-ink-3 mt-1">
                      Fees · Syllabus · Placements · Specialization Guide
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-ink-2 mb-1 block">Full Name *</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-amber transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-ink-2 mb-1 block">Phone Number *</label>
                      <div className="flex items-center border border-border rounded-lg overflow-hidden focus-within:border-amber transition-colors">
                        <span className="px-3 py-2.5 text-sm font-semibold text-ink-3 bg-surface-1 border-r border-border shrink-0">+91</span>
                        <input
                          type="tel"
                          placeholder="10-digit mobile"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          maxLength={10}
                          required
                          className="flex-1 px-3 py-2.5 text-sm focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-opacity"
                      style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', opacity: submitting ? 0.7 : 1 }}
                    >
                      {submitting
                        ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Sending…</>
                        : <><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>Get Details on WhatsApp & Email</>
                      }
                    </button>
                    <p className="text-[10px] text-ink-3 text-center">
                      Details for <span className="font-semibold text-navy">{u.name} {program} — {specialization}</span> sent to WhatsApp.
                    </p>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-green-200 shadow-xl p-6 text-center">
                  <div className="text-3xl mb-3">✅</div>
                  <div className="text-base font-extrabold text-navy mb-2">Thank you {name.trim()}!</div>
                  <p className="text-sm text-ink-2 leading-relaxed">
                    Our advisor will share complete details of{' '}
                    <span className="font-semibold text-navy">{u.name} {program} {specialization}</span>{' '}
                    on your WhatsApp shortly.
                  </p>
                  <div className="mt-4 text-[11px] text-ink-3">Redirecting to WhatsApp…</div>
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${buildWAMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}
                  >
                    Open WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
