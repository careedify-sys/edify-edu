'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle, XCircle, Briefcase, TrendingUp,
  Building2, BookOpen, Users, ChevronRight, Award, Star, Target
} from 'lucide-react'
import { getUniversityById, getUniversitiesByProgram, formatFee, PROGRAM_META } from '@/lib/data'
import { getProgramContent, getSpecContent, getSpecFallback } from '@/lib/content'
import type { Program } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'

const PM: Record<string, Program> = {
  'mba':'MBA','mca':'MCA','bba':'BBA','bca':'BCA','ba':'BA',
  'bcom':'B.Com','mcom':'M.Com','ma':'MA','msc':'MSc','bsc':'BSc','mba-wx':'MBA (WX)',
}

export default function UniversityProgramPage() {
  const params = useParams()
  const id = params?.id as string
  const programSlug = params?.program as string
  const u = getUniversityById(id)
  const program = PM[programSlug?.toLowerCase()]
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [activeSpec, setActiveSpec] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  if (!u || !program || !u.programs.includes(program)) {
    return (
      <div style={{minHeight:'100vh',background:'#0f1b2d',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center',color:'#64748b'}}>
          <div style={{fontSize:48,marginBottom:16}}>🔍</div>
          <p>Program not found. <Link href="/universities" style={{color:'#c9922a'}}>Browse all →</Link></p>
        </div>
      </div>
    )
  }

  const pd = u.programDetails[program]!
  const meta = PROGRAM_META[program]
  const programContent = getProgramContent(program)
  const otherUnis = getUniversitiesByProgram(program).filter(x => x.id !== u.id).slice(0, 4)

  // Spec content for active spec
  const specContent = activeSpec
    ? (getSpecContent(activeSpec) || getSpecFallback(activeSpec, program))
    : null

  // Blueprint-compliant FAQs — honest, specific, real-world
  const faqs = [
    {
      q: `Is ${program} from ${u.name} valid in India?`,
      a: `Yes. ${u.name} is UGC DEB approved${u.approvals.includes('NAAC A+') ? ' and NAAC A+ accredited' : ''}. The online ${program} degree is legally equivalent to a campus degree for private sector employment, further studies, and banking jobs. It is not valid for most central government or PSU recruitment unless specifically permitted.`
    },
    {
      q: `What is the total fee for ${program} at ${u.name}?`,
      a: `The total fee for ${program} at ${u.name} is ${pd.fees}. EMI options start from ₹${u.emiFrom.toLocaleString()} per month. Semester-wise fee payment is typically available. Check with a counsellor for current scholarship availability.`
    },
    {
      q: `What jobs can I get after ${program} from ${u.name}?`,
      a: `After ${program} from ${u.name}, you can target roles such as ${pd.roles.slice(0, 4).join(', ')}. Average salary range for ${program} graduates: ${pd.avgSalary}. Actual offers depend on your specialisation, prior experience, and interview performance.`
    },
    {
      q: `What specialisations does ${u.name} offer in ${program}?`,
      a: `${u.name} offers ${pd.specs.length} specialisations in ${program}: ${pd.specs.join(', ')}. Each specialisation shapes your career path. Finance, Marketing, and Data Science have the highest placement demand. HR and Operations are strong for working professionals.`
    },
    {
      q: `Can I study ${program} at ${u.name} while working full-time?`,
      a: `Yes — this is designed for working professionals. Live sessions are scheduled on weekday evenings and weekends. All sessions are recorded. You study at your own pace with ${u.examMode} assessments.`
    },
    {
      q: `What is the eligibility for ${program} at ${u.name}?`,
      a: `Minimum eligibility: ${u.eligibility}. No entrance exam required for most online programs. Admission is based on merit and application. Working experience is preferred but not mandatory for postgraduate programs.`
    },
    {
      q: `How do exams work for ${program} at ${u.name}?`,
      a: `${u.name} uses ${u.examMode} examination. Assessments include internal assignments, projects, and proctored online exams. You do not need to travel to a centre — exams are conducted via your webcam from home.`
    },
  ]

  return (
    <>
      {/* Schema: FAQPage + Course */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context':'https://schema.org','@type':'FAQPage',
        mainEntity:faqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))
      })}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context':'https://schema.org','@type':'Course',
        name:`Online ${program} — ${u.name}`,
        description:pd.careerOutcome,
        provider:{'@type':'Organization',name:u.name,url:'https://edifyedu.in'},
        timeRequired:meta?.duration,
        offers:{'@type':'Offer',price:pd.fees,priceCurrency:'INR'}
      })}}/>

      <div style={{minHeight:'100vh',background:'#F8F9FC'}}>
        <div style={{height:3,background:u.color}}/>

        {/* Breadcrumb */}
        <div style={{background:'#fff',borderBottom:'1px solid #E2E8F4'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#475569',flexWrap:'wrap'}}>
              <Link href="/" style={{color:'#475569',textDecoration:'none'}}>Home</Link><ChevronRight size={12}/>
              <Link href="/universities" style={{color:'#475569',textDecoration:'none'}}>Universities</Link><ChevronRight size={12}/>
              <Link href={`/universities/${u.id}`} style={{color:'#475569',textDecoration:'none'}}>{u.abbr}</Link><ChevronRight size={12}/>
              <span style={{color:'#C8811A',fontWeight:600}}>{program}</span>
            </div>
          </div>
        </div>

        {/* ── HERO ── */}
        <div style={{background:'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)',borderBottom:'1px solid #1e2f45'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div style={{maxWidth:760,display:'flex',flexDirection:'column',gap:10}}>

              {/* Approval badges */}
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:4}}>
                {u.approvals.map(a=>(
                  <span key={a} style={{fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:999,background:'rgba(201,146,42,0.1)',color:'#c9922a',border:'1px solid rgba(201,146,42,0.2)'}}>{a}</span>
                ))}
              </div>

              <h1 className="font-display" style={{fontSize:'clamp(1.6rem,3.5vw,2.2rem)',fontWeight:800,color:'#fff',lineHeight:1.2}}>
                {program} from {u.name}
              </h1>
              <p style={{fontSize:15,color:'#64748b',lineHeight:1.6}}>
                {u.city}, {u.state} · NIRF #{u.nirf} · {meta?.duration} · {pd.fees} total · {u.examMode} exams
              </p>

              {/* Stats row */}
              <div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:6}}>
                {[
                  {label:'Avg Salary',value:pd.avgSalary},
                  {label:'Specialisations',value:`${pd.specs.length}`},
                  {label:'EMI from',value:`₹${u.emiFrom.toLocaleString()}/mo`},
                  {label:'Eligibility',value:u.eligibility},
                ].map(s=>(
                  <div key={s.label} style={{padding:'8px 16px',background:'#162032',border:'1px solid #1e2f45',borderRadius:10}}>
                    <div style={{fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2}}>{s.label}</div>
                    <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{display:'flex',gap:10,marginTop:10,flexWrap:'wrap'}}>
                <button onClick={()=>setEnquiryOpen(true)}
                  style={{padding:'12px 28px',borderRadius:12,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#0f1b2d',fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}>
                  📩 Get Free Counselling for {program}
                </button>
                <Link href={`/universities/${u.id}`}
                  style={{padding:'12px 20px',borderRadius:12,border:'1px solid #1e2f45',color:'#94a3b8',fontSize:13,fontWeight:600,textDecoration:'none'}}>
                  View Full {u.abbr} Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div style={{display:'flex',gap:28,alignItems:'flex-start'}}>

            {/* ── MAIN CONTENT ── */}
            <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:24}}>

              {/* ── SECTION 1: PROGRAM OVERVIEW (Blueprint §3) ── */}
              <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                  <BookOpen size={14} color="#C8811A"/>
                  <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>
                    {program} at {u.name} — Program Overview
                  </span>
                </div>
                <div style={{padding:24,display:'flex',flexDirection:'column',gap:14}}>
                  <p style={{fontSize:14,color:'#475569',lineHeight:1.8,margin:0}}>{pd.careerOutcome}</p>

                  {programContent && (
                    <div style={{padding:'14px 16px',background:'rgba(31,107,82,0.05)',borderRadius:10,border:'1px solid rgba(31,107,82,0.12)',fontSize:13,color:'#475569'}}>
                      <span style={{fontWeight:700,color:'#1F6B52'}}>Delivery format: </span>{programContent.format}
                    </div>
                  )}

                  {/* What you learn */}
                  {programContent && (
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:10}}>Core Curriculum at {u.abbr}</div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:8}}>
                        {programContent.whatYouLearn.map((item,i)=>(
                          <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'7px 12px',background:'#F8F9FC',borderRadius:10,border:'1px solid #E2E8F4'}}>
                            <div style={{width:5,height:5,borderRadius:'50%',background:'#C8811A',marginTop:7,flexShrink:0}}/>
                            <span style={{fontSize:12,color:'#475569',lineHeight:1.5}}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ── SECTION 2: SPECIALISATIONS (Blueprint §— ) ── */}
              <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>
                    Specialisations — {pd.specs.length} Options at {u.abbr}
                  </div>
                  <div style={{fontSize:12,color:'#64748b',marginTop:3}}>Click any specialisation to see career paths, roles and salary.</div>
                </div>
                <div style={{padding:'20px 24px'}}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                    {pd.specs.map(spec=>(
                      <button key={spec}
                        onClick={()=>setActiveSpec(activeSpec===spec?null:spec)}
                        style={{padding:'8px 16px',borderRadius:999,fontSize:13,fontWeight:600,cursor:'pointer',
                          background:activeSpec===spec?'#C8811A':'transparent',
                          color:activeSpec===spec?'#fff':'#64748b',
                          border:`1px solid ${activeSpec===spec?'#C8811A':'#E2E8F4'}`}}>
                        {spec}
                      </button>
                    ))}
                  </div>

                  {/* Active spec deep-dive */}
                  {activeSpec && specContent && (
                    <div style={{marginTop:20,padding:20,background:'rgba(200,129,26,0.04)',borderRadius:14,border:'1px solid rgba(200,129,26,0.15)'}}>
                      <div style={{fontWeight:700,color:'#C8811A',fontSize:14,marginBottom:16}}>
                        {program} in {activeSpec} at {u.name}
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12,marginBottom:16}}>
                        {/* Roles */}
                        <div style={{padding:14,background:'#fff',borderRadius:10,border:'1px solid #E2E8F4'}}>
                          <div style={{fontSize:10,fontWeight:700,color:'#C8811A',textTransform:'uppercase',marginBottom:8}}>Career Roles</div>
                          {specContent.careerBeginner.slice(0,3).map((r,i)=>(
                            <div key={i} style={{fontSize:12,color:'#475569',marginBottom:5,display:'flex',gap:6,alignItems:'flex-start'}}>
                              <div style={{width:4,height:4,borderRadius:'50%',background:'#C8811A',flexShrink:0,marginTop:5}}/>
                              <span style={{fontWeight:600}}>{r.title}</span>
                            </div>
                          ))}
                        </div>
                        {/* Salary */}
                        <div style={{padding:14,background:'#fff',borderRadius:10,border:'1px solid #E2E8F4'}}>
                          <div style={{fontSize:10,fontWeight:700,color:'#1F6B52',textTransform:'uppercase',marginBottom:8}}>Salary Range</div>
                          <div style={{fontSize:20,fontWeight:800,color:'#0B1D35',marginBottom:4}}>{specContent.salaryRange}</div>
                          <div style={{fontSize:11,color:'#64748b',lineHeight:1.5}}>{specContent.salaryGrowth.slice(0,80)}...</div>
                        </div>
                        {/* Companies */}
                        <div style={{padding:14,background:'#fff',borderRadius:10,border:'1px solid #E2E8F4'}}>
                          <div style={{fontSize:10,fontWeight:700,color:'#0891B2',textTransform:'uppercase',marginBottom:8}}>Top Companies</div>
                          {specContent.topCompanies.slice(0,5).map((c,i)=>(
                            <div key={i} style={{fontSize:12,color:'#475569',marginBottom:4,display:'flex',gap:6,alignItems:'center'}}>
                              <div style={{width:4,height:4,borderRadius:'50%',background:'#0891B2',flexShrink:0}}/>
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                        <button onClick={()=>setEnquiryOpen(true)}
                          style={{padding:'9px 20px',borderRadius:8,background:'#C8811A',color:'#fff',fontWeight:700,fontSize:12,border:'none',cursor:'pointer'}}>
                          Enquire about {activeSpec} →
                        </button>
                        <Link href={`/programs/${programSlug}/${activeSpec.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}`}
                          style={{padding:'9px 16px',borderRadius:8,border:'1px solid #E2E8F4',color:'#64748b',fontSize:12,fontWeight:600,textDecoration:'none'}}>
                          View {activeSpec} Career Guide →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ── SECTION 3: SKILLS GAINED (Blueprint §4) ── */}
              {programContent && (
                <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                  <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                    <Award size={14} color="#C8811A"/>
                    <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>
                      Skills & Certifications You Gain
                    </span>
                  </div>
                  <div style={{padding:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:'#0B1D35',marginBottom:10}}>Technical Skills</div>
                      {programContent.skills.technical.map((s,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:7,fontSize:13,color:'#475569'}}>
                          <CheckCircle size={13} color="#1F6B52" style={{marginTop:2,flexShrink:0}}/>{s}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:'#0B1D35',marginBottom:10}}>Soft Skills</div>
                      {programContent.skills.soft.map((s,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:7,fontSize:13,color:'#475569'}}>
                          <CheckCircle size={13} color="#C8811A" style={{marginTop:2,flexShrink:0}}/>{s}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:'#0B1D35',marginBottom:10}}>Certifications & Badges</div>
                      {programContent.certifications.map((c,i)=>(
                        <div key={i} style={{marginBottom:8,padding:'7px 10px',background:'rgba(31,107,82,0.05)',borderRadius:8,border:'1px solid rgba(31,107,82,0.12)',fontSize:12,color:'#475569'}}>
                          🎓 {c}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* CTA #2 — after skills (Blueprint §10) */}
              <div style={{padding:'18px 24px',background:'rgba(200,129,26,0.06)',border:'1px solid rgba(200,129,26,0.2)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:'#0B1D35'}}>See if you qualify for {program} at {u.abbr}</div>
                  <div style={{fontSize:12,color:'#64748b',marginTop:3}}>Free eligibility check — takes 2 minutes</div>
                </div>
                <button onClick={()=>setEnquiryOpen(true)}
                  style={{padding:'11px 24px',borderRadius:10,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:'pointer'}}>
                  Check Eligibility →
                </button>
              </div>

              {/* ── SECTION 4: EXPERIENCE — INTERNSHIPS & PROJECTS (Blueprint §5) ── */}
              {programContent && (
                <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                  <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                    <Users size={14} color="#C8811A"/>
                    <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Internships & Live Projects During {program}</span>
                  </div>
                  <div style={{padding:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:8}}>Internship Opportunities</div>
                      <p style={{fontSize:13,color:'#475569',lineHeight:1.6,marginBottom:10}}>{programContent.internshipDesc}</p>
                      {programContent.internshipExamples.map((ex,i)=>(
                        <div key={i} style={{display:'flex',gap:8,marginBottom:6,fontSize:12,color:'#475569'}}>
                          <span style={{color:'#C8811A',flexShrink:0}}>→</span>{ex}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:8}}>Capstone Projects</div>
                      {programContent.projectExamples.map((p,i)=>(
                        <div key={i} style={{marginBottom:8,padding:'8px 12px',background:'#F8F9FC',borderRadius:8,border:'1px solid #E2E8F4',fontSize:12,color:'#475569'}}>
                          📁 {p}
                        </div>
                      ))}
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginTop:14,marginBottom:8}}>Live Industry Sessions</div>
                      {programContent.liveExposure.map((l,i)=>(
                        <div key={i} style={{display:'flex',gap:8,marginBottom:6,fontSize:12,color:'#475569'}}>
                          <span style={{color:'#C8811A',flexShrink:0}}>★</span>{l}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ── SECTION 5: RESUME & PROFILE (Blueprint §6) ── */}
              {programContent && (
                <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                  <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                    <Star size={14} color="#C8811A"/>
                    <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Resume & Profile Enhancement After {program}</span>
                  </div>
                  <div style={{padding:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:10}}>Add to Your Resume</div>
                      {programContent.resumeAdditions.map((r,i)=>(
                        <div key={i} style={{display:'flex',gap:8,marginBottom:7,fontSize:12,color:'#475569'}}>
                          <CheckCircle size={12} color="#1F6B52" style={{marginTop:2,flexShrink:0}}/>{r}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:10}}>LinkedIn Profile Tips</div>
                      {programContent.linkedinTips.map((t,i)=>(
                        <div key={i} style={{display:'flex',gap:8,marginBottom:7,fontSize:12,color:'#475569'}}>
                          <span style={{color:'#0077B5',fontWeight:700,flexShrink:0}}>in</span>{t}
                        </div>
                      ))}
                      <div style={{marginTop:14,padding:'12px 14px',background:'rgba(31,107,82,0.05)',borderRadius:10,border:'1px solid rgba(31,107,82,0.12)',fontSize:12,color:'#475569',lineHeight:1.6}}>
                        <span style={{color:'#1F6B52',fontWeight:700}}>💡 Profile Edge: </span>{programContent.profileEdge}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ── SECTION 6: CAREER PATHS (Blueprint §7) ── */}
              <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                  <Briefcase size={14} color="#C8811A"/>
                  <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Career Paths After {program} from {u.abbr}</span>
                </div>
                <div style={{padding:24,display:'flex',flexDirection:'column',gap:18}}>
                  <p style={{fontSize:13,color:'#475569',lineHeight:1.7,margin:0}}>{pd.careerOutcome}</p>

                  {programContent ? (
                    <>
                      {[
                        {level:'Beginner (0–2 years)',roles:programContent.careerBeginner,color:'#1F6B52',bg:'rgba(31,107,82,0.05)',border:'rgba(31,107,82,0.15)'},
                        {level:'Intermediate (3–6 years)',roles:programContent.careerMid,color:'#C8811A',bg:'rgba(200,129,26,0.05)',border:'rgba(200,129,26,0.15)'},
                        {level:'Senior (7+ years)',roles:programContent.careerSenior,color:'#0B1D35',bg:'rgba(11,29,53,0.04)',border:'rgba(11,29,53,0.12)'},
                      ].map(tier=>(
                        <div key={tier.level}>
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                            <div style={{width:8,height:8,borderRadius:'50%',background:tier.color}}/>
                            <span style={{fontSize:12,fontWeight:700,color:'#0B1D35'}}>{tier.level}</span>
                          </div>
                          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8}}>
                            {tier.roles.map((role,i)=>(
                              <div key={i} style={{padding:'10px 14px',background:tier.bg,borderRadius:10,border:`1px solid ${tier.border}`}}>
                                <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:4}}>{role.title}</div>
                                <div style={{fontSize:11,color:'#64748b',lineHeight:1.5}}>{role.desc}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                      {pd.roles.map((role,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',background:'#F8F9FC',borderRadius:10,border:'1px solid #E2E8F4',fontSize:13,color:'#475569'}}>
                          <div style={{width:5,height:5,borderRadius:'50%',background:'#C8811A',flexShrink:0}}/>{role}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* ── SECTION 7: COMPANIES & SALARY (Blueprint §8) ── */}
              <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                  <TrendingUp size={14} color="#C8811A"/>
                  <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Target Companies, Salary & Growth</span>
                </div>
                <div style={{padding:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:10}}>Top Hiring Companies</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
                      {pd.topCompanies.map((c,i)=>(
                        <span key={i} style={{fontSize:12,padding:'4px 10px',borderRadius:999,background:'#F8F9FC',border:'1px solid #E2E8F4',color:'#475569'}}>{c}</span>
                      ))}
                    </div>
                    <div style={{padding:'10px 12px',background:'rgba(31,107,82,0.05)',borderRadius:8,border:'1px solid rgba(31,107,82,0.12)',fontSize:12,color:'#475569',lineHeight:1.6}}>
                      💡 Most {program} graduates are hired via LinkedIn and Naukri — not campus drives. Build your profile mid-program.
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:10}}>Salary Range</div>
                    <div style={{fontSize:28,fontWeight:800,color:'#0B1D35',marginBottom:6}}>{pd.avgSalary}</div>
                    {programContent && (
                      <>
                        <p style={{fontSize:12,color:'#475569',lineHeight:1.6,marginBottom:8}}>{programContent.salaryNote}</p>
                        <div style={{padding:'10px 12px',background:'rgba(31,107,82,0.05)',borderRadius:8,border:'1px solid rgba(31,107,82,0.12)',fontSize:12,color:'#475569',lineHeight:1.6}}>
                          <span style={{color:'#1F6B52',fontWeight:700}}>📈 </span>{programContent.salaryGrowth}
                        </div>
                      </>
                    )}
                    <div style={{fontSize:10,color:'#94a3b8',marginTop:8}}>
                      Source: AmbitionBox, Glassdoor India, LinkedIn Salary Insights 2024. Ranges are indicative.
                    </div>
                  </div>
                </div>
              </section>

              {/* Right For / Not For */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:14}}>
                <div style={{padding:18,background:'#F0FDF4',border:'1px solid rgba(21,128,61,0.15)',borderRadius:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#15803D',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10}}>✓ Right for you if</div>
                  {u.forWho.map((item,i)=>(
                    <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:8,fontSize:13,color:'#475569'}}>
                      <CheckCircle size={14} color="#15803D" style={{flexShrink:0,marginTop:2}}/>{item}
                    </div>
                  ))}
                </div>
                <div style={{padding:18,background:'#FEF2F2',border:'1px solid rgba(220,38,38,0.15)',borderRadius:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#DC2626',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10}}>✗ Think twice if</div>
                  {u.notFor.map((item,i)=>(
                    <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:8,fontSize:13,color:'#475569'}}>
                      <XCircle size={14} color="#DC2626" style={{flexShrink:0,marginTop:2}}/>{item}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA #3 — Mid-page (Blueprint §10) */}
              <div style={{padding:28,background:'rgba(200,129,26,0.06)',border:'1px solid rgba(200,129,26,0.2)',borderRadius:16,textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
                <div style={{fontSize:26}}>🎓</div>
                <h3 className="font-display" style={{fontSize:'1.1rem',fontWeight:700,color:'#0B1D35'}}>
                  Interested in {program} from {u.abbr}?
                </h3>
                <p style={{fontSize:13,color:'#64748b',maxWidth:420}}>
                  Speak to a counsellor — free, no obligation. We'll match you to the right specialisation for your career goal and verify your eligibility in 24 hours.
                </p>
                <button onClick={()=>setEnquiryOpen(true)}
                  style={{padding:'13px 32px',borderRadius:12,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}>
                  Speak to a Counsellor — No Obligation →
                </button>
              </div>

              {/* ── SECTION 8: FAQ (Blueprint §9) ── */}
              <section>
                <h2 className="font-display" style={{fontSize:'1.2rem',fontWeight:700,color:'#0B1D35',marginBottom:12}}>
                  Frequently Asked Questions — {program} from {u.name}
                </h2>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {faqs.map((faq,i)=>(
                    <div key={i} style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:12,overflow:'hidden'}}>
                      <button onClick={()=>setOpenFaq(openFaq===i?null:i)}
                        style={{width:'100%',padding:'14px 20px',fontWeight:600,color:'#0B1D35',fontSize:13,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',background:'transparent',border:'none',textAlign:'left'}}>
                        {faq.q}
                        <span style={{color:'#C8811A',fontSize:20,flexShrink:0,marginLeft:12,transform:openFaq===i?'rotate(45deg)':'none',transition:'transform 0.2s',display:'inline-block'}}>+</span>
                      </button>
                      {openFaq===i && (
                        <div style={{padding:'12px 20px 14px',fontSize:13,color:'#475569',lineHeight:1.7,borderTop:'1px solid #E2E8F4'}}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Also Read — internal linking */}
              <div style={{padding:'20px 24px',background:'#fff',border:'1px solid #E2E8F4',borderRadius:14}}>
                <div style={{fontSize:12,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}}>📖 Also Read</div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {[
                    {label:`Best ${program} Specialisations in India 2025`,href:`/blog`},
                    {label:`Compare all universities offering ${program}`,href:`/programs/${programSlug}`},
                    {label:`Is ${program} from ${u.abbr} valid for govt jobs?`,href:`/guides`},
                    {label:`${program} fees comparison — all universities`,href:`/compare`},
                    {label:`${program} career guide: roles, salary and growth`,href:`/programs/${programSlug}`},
                  ].map(link=>(
                    <Link key={link.label} href={link.href}
                      style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#F8F9FC',borderRadius:10,textDecoration:'none',fontSize:13,color:'#475569',border:'1px solid #E2E8F4'}}>
                      {link.label}<span style={{color:'#C8811A'}}>→</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Other Universities */}
              {otherUnis.length > 0 && (
                <div>
                  <h2 className="font-display" style={{fontSize:'1.1rem',fontWeight:700,color:'#0B1D35',marginBottom:6}}>
                    Other Universities Offering {program}
                  </h2>
                  <p style={{fontSize:12,color:'#64748b',marginBottom:14}}>Compare before you decide — sorted by NIRF rank.</p>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12}}>
                    {otherUnis.map(ou=>{
                      const opd = ou.programDetails[program]
                      return (
                        <Link key={ou.id} href={`/universities/${ou.id}/${programSlug}`}
                          style={{display:'block',background:'#fff',border:'1px solid #E2E8F4',borderRadius:14,overflow:'hidden',textDecoration:'none'}}>
                          <div style={{height:3,background:ou.color}}/>
                          <div style={{padding:14}}>
                            <div style={{fontWeight:700,color:'#0B1D35',fontSize:14,marginBottom:2}}>{ou.name}</div>
                            <div style={{fontSize:11,color:'#64748b',marginBottom:10}}>{ou.city} · NIRF #{ou.nirf} · {ou.naac}</div>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,paddingTop:10,borderTop:'1px solid #E2E8F4'}}>
                              <span style={{color:'#475569'}}>Fees: <strong style={{color:'#0B1D35'}}>{opd?.fees||`${formatFee(ou.feeMin)}+`}</strong></span>
                              <span style={{color:'#1F6B52',fontWeight:600}}>{opd?.avgSalary?.split('–')[0].trim()||'₹4L'}+</span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── SIDEBAR ── */}
            <div style={{width:260,flexShrink:0}} className="hidden lg:block">
              <div style={{position:'sticky',top:80,display:'flex',flexDirection:'column',gap:14}}>

                {/* Quick summary card */}
                <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:14,overflow:'hidden'}}>
                  <div style={{height:3,background:u.color}}/>
                  <div style={{padding:16}}>
                    <div style={{fontWeight:700,color:'#0B1D35',fontSize:13,marginBottom:12}}>{program} — Quick Facts</div>
                    {[
                      {label:'Total Fees',value:pd.fees},
                      {label:'Duration',value:pd.duration},
                      {label:'Exam Mode',value:u.examMode},
                      {label:'Eligibility',value:u.eligibility},
                      {label:'NIRF Rank',value:`#${u.nirf}`},
                      {label:'NAAC',value:u.naac},
                      {label:'EMI from',value:`₹${u.emiFrom.toLocaleString()}/mo`},
                      {label:'Avg Salary',value:pd.avgSalary},
                      {label:'Govt job valid',value:u.govtRecognised?'✓ Yes':'⚠️ No'},
                    ].map(row=>(
                      <div key={row.label} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #E2E8F4',fontSize:12}}>
                        <span style={{color:'#64748b'}}>{row.label}</span>
                        <span style={{fontWeight:700,color:row.label==='Govt job valid'&&!u.govtRecognised?'#DC2626':'#0B1D35',textAlign:'right',maxWidth:120}}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button onClick={()=>setEnquiryOpen(true)}
                  style={{width:'100%',padding:14,borderRadius:12,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:'pointer'}}>
                  📩 Free Counselling for {program}
                </button>

                {/* Approvals */}
                <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:14,padding:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',marginBottom:10}}>Approvals & Rankings</div>
                  {u.approvals.map(a=>(
                    <div key={a} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,fontSize:12,color:'#475569'}}>
                      <CheckCircle size={12} color="#4ade80"/>{a}
                    </div>
                  ))}
                </div>

                {/* All programs at this university */}
                <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:14,padding:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',marginBottom:10}}>All Programs at {u.abbr}</div>
                  {u.programs.map(prog=>(
                    <Link key={prog} href={`/universities/${u.id}/${prog.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}`}
                      style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid #E2E8F4',textDecoration:'none',fontSize:12}}>
                      <span style={{color:prog===program?'#C8811A':'#475569',fontWeight:prog===program?700:500}}>{prog}</span>
                      <span style={{fontSize:11,color:'#64748b'}}>{u.programDetails[prog]?.fees||formatFee(u.feeMin)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky CTA — Blueprint §10 */}
        <div className="lg:hidden" style={{position:'fixed',bottom:72,left:16,right:16,zIndex:90}}>
          <button onClick={()=>setEnquiryOpen(true)}
            style={{width:'100%',padding:14,borderRadius:14,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer',boxShadow:'0 4px 24px rgba(201,146,42,0.4)'}}>
            📩 Free Counselling for {program}
          </button>
        </div>
      </div>

      <EnquiryModal isOpen={enquiryOpen} onClose={()=>setEnquiryOpen(false)} universityName={u.name} universityId={u.id} defaultProgram={program}/>
    </>
  )
}
