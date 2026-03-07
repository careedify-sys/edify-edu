'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CheckCircle, TrendingUp, Briefcase, ChevronRight, BookOpen, Award, Users, Star } from 'lucide-react'
import { getUniversitiesByProgram, getAllSpecs, PROGRAM_META, formatFee } from '@/lib/data'
import { getProgramContent } from '@/lib/content'
import type { Program } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'

const PM: Record<string, Program> = {
  'mba':'MBA','mca':'MCA','bba':'BBA','bca':'BCA','ba':'BA',
  'bcom':'B.Com','mcom':'M.Com','ma':'MA','msc':'MSc','bsc':'BSc','mba-wx':'MBA (WX)',
}

export default function ProgramPage() {
  const params = useParams()
  const slug = params?.program as string
  const program = PM[slug?.toLowerCase()]
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [activeSpec, setActiveSpec] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'nirf'|'fees'>('nirf')
  const [openFaq, setOpenFaq] = useState<number|null>(null)

  if (!program) return (
    <div style={{minHeight:'100vh',background:'#F8F9FC',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>
      Program not found. <Link href="/programs" style={{color:'#C8811A',marginLeft:8}}>Browse →</Link>
    </div>
  )

  const meta = PROGRAM_META[program]
  const content = getProgramContent(program)
  const universities = getUniversitiesByProgram(program)
  const allSpecs = getAllSpecs(program)
  const sorted = [...universities].sort((a,b)=> sortBy==='nirf'? a.nirf-b.nirf : a.feeMin-b.feeMin)
  const filtered = activeSpec ? sorted.filter(u=>u.programDetails[program]?.specs.includes(activeSpec)) : sorted
  const feeMin = universities.length ? Math.min(...universities.map(u=>u.feeMin)) : 0
  const feeMax = universities.length ? Math.max(...universities.map(u=>u.feeMax)) : 0

  const faqs = content?.faqs || [
    {q:`Which is the best university for online ${program} in India?`,a:`Top NIRF-ranked universities for online ${program} include ${universities.slice(0,3).map(u=>u.name).join(', ')}. The best choice depends on your budget, location and career goal.`},
    {q:`What is the fee for online ${program} in India?`,a:`Online ${program} fees range from ${formatFee(feeMin)} to ${formatFee(feeMax)} depending on the university and specialisation.`},
    {q:`Is online ${program} valid for government jobs?`,a:`Most online ${program} programs are NOT valid for central government or PSU jobs. They are valid for private sector, banking, and higher education. IGNOU is the exception.`},
    {q:`What specialisations are available in online ${program}?`,a:`Online ${program} has ${allSpecs.length}+ specialisations including ${allSpecs.slice(0,6).join(', ')} and more.`},
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))})}} />
      <div style={{minHeight:'100vh',background:'#F8F9FC'}}>

        {/* Breadcrumb */}
        <div style={{background:'#fff',borderBottom:'1px solid #E2E8F4'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#475569',flexWrap:'wrap'}}>
              <Link href="/" style={{color:'#475569',textDecoration:'none'}}>Home</Link><ChevronRight size={12}/>
              <Link href="/programs" style={{color:'#475569',textDecoration:'none'}}>Programs</Link><ChevronRight size={12}/>
              <span style={{color:'#C8811A',fontWeight:600}}>Online {program}</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div style={{background:'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)',borderBottom:'1px solid #1e2f45'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
            <div className="max-w-3xl">
              <div style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>
                {meta?.level==='PG'?'Postgraduate':'Undergraduate'} · {meta?.duration} · UGC DEB Approved
              </div>
              <h1 className="font-display" style={{fontSize:'clamp(1.8rem,4vw,2.8rem)',fontWeight:800,color:'#fff',lineHeight:1.15,marginBottom:14}}>
                {content?.heroHeadline || `Online ${program} in India — ${new Date().getFullYear()} Honest Guide`}
              </h1>
              <p style={{fontSize:15,color:'#94a3b8',lineHeight:1.7,marginBottom:20}}>
                {content?.heroSubheadline || `${meta?.desc} · ${universities.length} UGC DEB approved universities · ${allSpecs.length}+ specialisations · Fees from ${formatFee(feeMin)}`}
              </p>
              <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:24}}>
                {[{label:'Universities',value:`${universities.length}`},{label:'Specialisations',value:`${allSpecs.length}+`},{label:'Fees from',value:formatFee(feeMin)},{label:'Up to',value:formatFee(feeMax)}].map(s=>(
                  <div key={s.label} style={{padding:'10px 18px',background:'rgba(255,255,255,0.06)',border:'1px solid #1e2f45',borderRadius:10,textAlign:'center'}}>
                    <div style={{fontSize:18,fontWeight:800,color:'#C8811A'}}>{s.value}</div>
                    <div style={{fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',marginTop:2}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <button onClick={()=>setEnquiryOpen(true)} style={{padding:'13px 28px',borderRadius:12,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}>
                  Get Free {program} Counselling →
                </button>
                <Link href="/compare" style={{padding:'13px 20px',borderRadius:12,border:'1px solid #1e2f45',color:'#94a3b8',fontSize:13,fontWeight:600,textDecoration:'none'}}>
                  Compare {program} Programs ⚖️
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div style={{display:'flex',gap:28,alignItems:'flex-start'}}>
            <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:28}}>

              {/* ── SECTION 1: PROGRAM OVERVIEW ── */}
              {content && (
                <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                  <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                    <BookOpen size={14} color="#C8811A"/>
                    <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Program Overview</span>
                  </div>
                  <div style={{padding:24,display:'flex',flexDirection:'column',gap:18}}>
                    <p style={{fontSize:14,color:'#475569',lineHeight:1.8,margin:0}}>{content.overview}</p>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:12}}>What You Will Learn</div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:8}}>
                        {content.whatYouLearn.map((item,i)=>(
                          <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'8px 12px',background:'#F8F9FC',borderRadius:10,border:'1px solid #E2E8F4'}}>
                            <div style={{width:6,height:6,borderRadius:'50%',background:'#C8811A',marginTop:6,flexShrink:0}}/>
                            <span style={{fontSize:12,color:'#475569',lineHeight:1.5}}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{padding:'12px 16px',background:'rgba(31,107,82,0.05)',borderRadius:10,border:'1px solid rgba(31,107,82,0.12)',fontSize:13,color:'#475569'}}>
                      <span style={{fontWeight:700,color:'#1F6B52'}}>Format: </span>{content.format}
                    </div>
                  </div>
                </section>
              )}

              {/* ── SECTION 2: SPECIALISATIONS FILTER ── */}
              <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Browse by Specialisation</div>
                  <div style={{fontSize:13,color:'#64748b',marginTop:3}}>Click any specialisation to filter universities. Each has its own career path.</div>
                </div>
                <div style={{padding:'20px 24px'}}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:activeSpec?16:0}}>
                    <button onClick={()=>setActiveSpec(null)} style={{padding:'7px 16px',borderRadius:999,fontSize:12,fontWeight:600,cursor:'pointer',background:!activeSpec?'#C8811A':'transparent',color:!activeSpec?'#fff':'#64748b',border:`1px solid ${!activeSpec?'#C8811A':'#E2E8F4'}`}}>
                      All ({universities.length})
                    </button>
                    {allSpecs.map(spec=>{
                      const count = universities.filter(u=>u.programDetails[program]?.specs.includes(spec)).length
                      return (
                        <button key={spec} onClick={()=>setActiveSpec(activeSpec===spec?null:spec)} style={{padding:'7px 16px',borderRadius:999,fontSize:12,fontWeight:600,cursor:'pointer',background:activeSpec===spec?'#C8811A':'transparent',color:activeSpec===spec?'#fff':'#64748b',border:`1px solid ${activeSpec===spec?'#C8811A':'#E2E8F4'}`}}>
                          {spec} <span style={{opacity:0.7}}>({count})</span>
                        </button>
                      )
                    })}
                  </div>
                  {activeSpec && (
                    <div style={{padding:'14px 18px',background:'rgba(200,129,26,0.06)',borderRadius:12,border:'1px solid rgba(200,129,26,0.15)',fontSize:13,color:'#64748b',lineHeight:1.7}}>
                      <strong style={{color:'#C8811A'}}>Online {program} in {activeSpec}</strong> — {filtered.length} universit{filtered.length===1?'y':'ies'} offer this.
                      <Link href={`/programs/${slug}/${activeSpec.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}`} style={{color:'#C8811A',marginLeft:8,fontWeight:700,textDecoration:'none'}}>
                        View {activeSpec} deep-dive →
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              {/* ── SECTION 3: UNIVERSITY LIST ── */}
              <section>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
                  <div>
                    <h2 className="font-display" style={{fontSize:'1.2rem',fontWeight:700,color:'#0B1D35'}}>
                      {activeSpec?`${program} in ${activeSpec}`:`All Online ${program} Universities`} ({filtered.length})
                    </h2>
                    <p style={{fontSize:12,color:'#64748b',marginTop:2}}>Sorted by NIRF rank — not by who pays us.</p>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    {(['nirf','fees'] as const).map(s=>(
                      <button key={s} onClick={()=>setSortBy(s)} style={{padding:'6px 14px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',background:sortBy===s?'#C8811A':'transparent',color:sortBy===s?'#fff':'#64748b',border:`1px solid ${sortBy===s?'#C8811A':'#E2E8F4'}`}}>
                        {s==='nirf'?'🏆 NIRF':'💰 Fees'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {filtered.map((u,idx)=>{
                    const pd = u.programDetails[program]
                    return (
                      <div key={u.id} style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:14,overflow:'hidden'}}>
                        <div style={{height:3,background:u.color}}/>
                        <div style={{padding:'18px 20px'}}>
                          <div style={{display:'flex',gap:16,alignItems:'flex-start',flexWrap:'wrap'}}>
                            <div style={{width:36,height:36,borderRadius:10,background:idx===0?'#C8811A':'#F8F9FC',border:'1px solid #E2E8F4',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                              <span style={{fontSize:13,fontWeight:800,color:idx===0?'#fff':'#64748b'}}>#{idx+1}</span>
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10,flexWrap:'wrap'}}>
                                <div>
                                  <Link href={`/universities/${u.id}/${slug}`} style={{fontWeight:700,color:'#0B1D35',fontSize:15,textDecoration:'none',display:'block',marginBottom:2}}>
                                    {program} from {u.name}
                                  </Link>
                                  <div style={{fontSize:12,color:'#64748b'}}>{u.city}, {u.state} · NIRF #{u.nirf} · {u.naac} · {u.examMode}</div>
                                </div>
                                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                                  {u.approvals.slice(0,3).map(a=>(
                                    <span key={a} style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:999,background:'rgba(74,222,128,0.08)',color:'#15803D',border:'1px solid rgba(74,222,128,0.2)',whiteSpace:'nowrap'}}>✓ {a}</span>
                                  ))}
                                </div>
                              </div>
                              <div style={{display:'flex',gap:20,marginTop:12,flexWrap:'wrap'}}>
                                {[
                                  {label:'Fees',value:pd?.fees||`${formatFee(u.feeMin)}+`,color:'#0B1D35'},
                                  {label:'Avg Salary',value:`${pd?.avgSalary?.split('–')[0].trim()||'₹4L+'}+`,color:'#1F6B52'},
                                  {label:'Specialisations',value:String(pd?.specs.length||'—'),color:'#0B1D35'},
                                  {label:'EMI from',value:`₹${u.emiFrom.toLocaleString()}/mo`,color:'#0B1D35'},
                                ].map(d=>(
                                  <div key={d.label}>
                                    <div style={{fontSize:10,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em'}}>{d.label}</div>
                                    <div style={{fontSize:14,fontWeight:700,color:d.color}}>{d.value}</div>
                                  </div>
                                ))}
                              </div>
                              {pd && (
                                <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:10}}>
                                  {pd.specs.slice(0,5).map(s=>(
                                    <span key={s} style={{fontSize:11,padding:'3px 10px',borderRadius:999,background:activeSpec===s?'rgba(200,129,26,0.12)':'#F8F9FC',color:activeSpec===s?'#C8811A':'#64748b',border:`1px solid ${activeSpec===s?'rgba(200,129,26,0.3)':'#E2E8F4'}`}}>{s}</span>
                                  ))}
                                  {pd.specs.length>5 && <span style={{fontSize:11,color:'#475569'}}>+{pd.specs.length-5} more</span>}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{display:'flex',gap:8,marginTop:16,paddingTop:14,borderTop:'1px solid #E2E8F4'}}>
                            <Link href={`/universities/${u.id}/${slug}`} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:10,borderRadius:10,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none'}}>
                              View Full Details <ArrowRight size={14}/>
                            </Link>
                            <button onClick={()=>setEnquiryOpen(true)} style={{padding:'10px 16px',borderRadius:10,border:'1px solid #E2E8F4',color:'#475569',fontSize:13,fontWeight:600,background:'transparent',cursor:'pointer'}}>Enquire</button>
                            <Link href={`/compare?a=${u.id}`} style={{padding:'10px 16px',borderRadius:10,border:'1px solid #E2E8F4',color:'#475569',fontSize:13,fontWeight:600,textDecoration:'none'}}>Compare</Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* ── SECTION 4: SKILLS & CERTIFICATIONS ── */}
              {content && (
                <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                  <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                    <Award size={14} color="#C8811A"/>
                    <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Skills & Certifications You Gain</span>
                  </div>
                  <div style={{padding:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:'#0B1D35',marginBottom:10}}>Technical Skills</div>
                      {content.skills.technical.map((s,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:7,fontSize:13,color:'#475569'}}>
                          <CheckCircle size={13} color="#1F6B52" style={{marginTop:2,flexShrink:0}}/>{s}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:'#0B1D35',marginBottom:10}}>Soft Skills</div>
                      {content.skills.soft.map((s,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:7,fontSize:13,color:'#475569'}}>
                          <CheckCircle size={13} color="#C8811A" style={{marginTop:2,flexShrink:0}}/>{s}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:'#0B1D35',marginBottom:10}}>Certifications & Badges</div>
                      {content.certifications.map((c,i)=>(
                        <div key={i} style={{marginBottom:8,padding:'7px 10px',background:'rgba(31,107,82,0.05)',borderRadius:8,border:'1px solid rgba(31,107,82,0.12)',fontSize:12,color:'#475569'}}>
                          🎓 {c}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ── SECTION 5: EXPERIENCE — INTERNSHIPS & PROJECTS ── */}
              {content && (
                <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                  <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                    <Users size={14} color="#C8811A"/>
                    <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Experience During the Program</span>
                  </div>
                  <div style={{padding:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:8}}>Internship Opportunities</div>
                      <p style={{fontSize:13,color:'#475569',lineHeight:1.6,marginBottom:10}}>{content.internshipDesc}</p>
                      {content.internshipExamples.map((ex,i)=>(
                        <div key={i} style={{display:'flex',gap:8,marginBottom:6,fontSize:12,color:'#475569'}}>
                          <span style={{color:'#C8811A',flexShrink:0}}>→</span>{ex}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:8}}>Capstone Projects</div>
                      {content.projectExamples.map((p,i)=>(
                        <div key={i} style={{marginBottom:8,padding:'8px 12px',background:'#F8F9FC',borderRadius:8,border:'1px solid #E2E8F4',fontSize:12,color:'#475569'}}>
                          📁 {p}
                        </div>
                      ))}
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginTop:14,marginBottom:8}}>Live Industry Exposure</div>
                      {content.liveExposure.map((l,i)=>(
                        <div key={i} style={{display:'flex',gap:8,marginBottom:6,fontSize:12,color:'#475569'}}>
                          <span style={{color:'#C8811A',flexShrink:0}}>★</span>{l}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ── SECTION 6: RESUME & PROFILE ENHANCEMENT ── */}
              {content && (
                <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                  <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                    <Star size={14} color="#C8811A"/>
                    <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Resume & Profile Enhancement</span>
                  </div>
                  <div style={{padding:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:10}}>Add to Your Resume</div>
                      {content.resumeAdditions.map((r,i)=>(
                        <div key={i} style={{display:'flex',gap:8,marginBottom:7,fontSize:12,color:'#475569'}}>
                          <CheckCircle size={12} color="#1F6B52" style={{marginTop:2,flexShrink:0}}/>{r}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:10}}>LinkedIn Optimisation</div>
                      {content.linkedinTips.map((t,i)=>(
                        <div key={i} style={{display:'flex',gap:8,marginBottom:7,fontSize:12,color:'#475569'}}>
                          <span style={{color:'#0077B5',fontWeight:700,flexShrink:0}}>in</span>{t}
                        </div>
                      ))}
                      <div style={{marginTop:14,padding:'12px 14px',background:'rgba(31,107,82,0.05)',borderRadius:10,border:'1px solid rgba(31,107,82,0.12)',fontSize:12,color:'#475569',lineHeight:1.6}}>
                        <span style={{color:'#1F6B52',fontWeight:700}}>💡 Profile Edge: </span>{content.profileEdge}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ── SECTION 7: CAREER PATHS ── */}
              {content && (
                <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                  <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                    <Briefcase size={14} color="#C8811A"/>
                    <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Career Paths After Online {program}</span>
                  </div>
                  <div style={{padding:24,display:'flex',flexDirection:'column',gap:20}}>
                    {[
                      {level:'Beginner (0–2 years)',roles:content.careerBeginner,color:'#1F6B52',bg:'rgba(31,107,82,0.05)',border:'rgba(31,107,82,0.15)'},
                      {level:'Intermediate (3–6 years)',roles:content.careerMid,color:'#C8811A',bg:'rgba(200,129,26,0.05)',border:'rgba(200,129,26,0.15)'},
                      {level:'Senior (7+ years)',roles:content.careerSenior,color:'#0B1D35',bg:'rgba(11,29,53,0.04)',border:'rgba(11,29,53,0.12)'},
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
                  </div>
                </section>
              )}

              {/* ── SECTION 8: COMPANIES, SALARY & GROWTH ── */}
              {content && (
                <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                  <div style={{padding:'14px 24px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                    <TrendingUp size={14} color="#C8811A"/>
                    <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Target Companies, Salary & Growth</span>
                  </div>
                  <div style={{padding:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:10}}>Top Hiring Companies</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {content.topCompanies.map((c,i)=>(
                          <span key={i} style={{fontSize:12,padding:'4px 10px',borderRadius:999,background:'#F8F9FC',border:'1px solid #E2E8F4',color:'#475569'}}>{c}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0B1D35',marginBottom:10}}>Salary & Growth Data</div>
                      <p style={{fontSize:13,color:'#475569',lineHeight:1.6,marginBottom:10}}>{content.salaryNote}</p>
                      <div style={{padding:'12px 14px',background:'rgba(31,107,82,0.05)',borderRadius:10,border:'1px solid rgba(31,107,82,0.12)',fontSize:12,color:'#475569',lineHeight:1.6}}>
                        <span style={{color:'#1F6B52',fontWeight:700}}>📈 Growth trajectory: </span>{content.salaryGrowth}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ── MID CTA ── */}
              <div style={{padding:28,background:'rgba(200,129,26,0.06)',border:'1px solid rgba(200,129,26,0.2)',borderRadius:16,display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:12}}>
                <div style={{fontSize:28}}>🎯</div>
                <h3 className="font-display" style={{fontSize:'1.1rem',fontWeight:700,color:'#0B1D35'}}>Which {program} university is right for you?</h3>
                <p style={{fontSize:13,color:'#64748b',maxWidth:420}}>Tell us your profile — marks, work experience, budget, goal — and we'll shortlist the top 3 for you. Free. No spam.</p>
                <button onClick={()=>setEnquiryOpen(true)} style={{padding:'13px 32px',borderRadius:12,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}>
                  Get My Free {program} Match →
                </button>
              </div>

              {/* ── SECTION 9: FAQs ── */}
              <section>
                <h2 className="font-display" style={{fontSize:'1.2rem',fontWeight:700,color:'#0B1D35',marginBottom:12}}>
                  Online {program} — Frequently Asked Questions
                </h2>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {faqs.map((faq,i)=>(
                    <div key={i} style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:12,overflow:'hidden'}}>
                      <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:'100%',padding:'14px 20px',fontWeight:600,color:'#0B1D35',fontSize:13,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',background:'transparent',border:'none',textAlign:'left'}}>
                        {faq.q}
                        <span style={{color:'#C8811A',fontSize:20,flexShrink:0,marginLeft:12,transform:openFaq===i?'rotate(45deg)':'none',transition:'transform 0.2s',display:'inline-block'}}>+</span>
                      </button>
                      {openFaq===i && (
                        <div style={{padding:'12px 20px 14px',fontSize:13,color:'#475569',lineHeight:1.7,borderTop:'1px solid #E2E8F4'}}>{faq.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Also Read */}
              <div style={{padding:'20px 24px',background:'#fff',border:'1px solid #E2E8F4',borderRadius:14}}>
                <div style={{fontSize:12,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}}>📖 Also Read</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:8}}>
                  {[
                    {label:`Best ${program} Specialisations in India`,href:'/blog'},
                    {label:`Online ${program} vs Full-Time ${program}`,href:'/blog'},
                    {label:`Is Online ${program} valid for govt jobs?`,href:'/guides'},
                    {label:`Compare all ${program} universities`,href:'/compare'},
                    {label:`${program} fees comparison 2025`,href:'/compare'},
                    {label:`${program} for working professionals`,href:'/blog'},
                  ].map(link=>(
                    <Link key={link.label} href={link.href} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#F8F9FC',borderRadius:10,textDecoration:'none',fontSize:12,color:'#475569',border:'1px solid #E2E8F4'}}>
                      {link.label}<span style={{color:'#C8811A',flexShrink:0,marginLeft:8}}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div style={{width:240,flexShrink:0}} className="hidden lg:block">
              <div style={{position:'sticky',top:80,display:'flex',flexDirection:'column',gap:14}}>
                <button onClick={()=>setEnquiryOpen(true)} style={{width:'100%',padding:14,borderRadius:12,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:'pointer'}}>
                  📩 Free {program} Counselling
                </button>
                <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:14,padding:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',marginBottom:12}}>Quick Facts</div>
                  {[
                    {label:'Universities',value:`${universities.length} options`},
                    {label:'Specialisations',value:`${allSpecs.length}+`},
                    {label:'Fees range',value:`${formatFee(feeMin)} – ${formatFee(feeMax)}`},
                    {label:'Duration',value:meta?.duration||'2 Years'},
                    {label:'Exam mode',value:'Online / Assignment'},
                    {label:'Govt job valid?',value:'⚠️ Usually No'},
                  ].map(r=>(
                    <div key={r.label} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #E2E8F4',fontSize:12}}>
                      <span style={{color:'#64748b'}}>{r.label}</span>
                      <span style={{fontWeight:600,color:'#0B1D35',textAlign:'right',maxWidth:120}}>{r.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:14,padding:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',marginBottom:10}}>Top {program} Universities</div>
                  {universities.slice(0,5).map(u=>(
                    <Link key={u.id} href={`/universities/${u.id}/${slug}`} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #E2E8F4',textDecoration:'none',fontSize:12}}>
                      <span style={{color:'#475569',fontWeight:600}}>{u.abbr}</span>
                      <span style={{color:'#C8811A',fontWeight:700}}>NIRF #{u.nirf}</span>
                    </Link>
                  ))}
                  <Link href="/universities" style={{display:'block',textAlign:'center',marginTop:10,fontSize:12,color:'#C8811A',textDecoration:'none',fontWeight:600}}>View all →</Link>
                </div>
                <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:14,padding:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',marginBottom:10}}>Specialisations</div>
                  {allSpecs.slice(0,7).map(spec=>(
                    <Link key={spec} href={`/programs/${slug}/${spec.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}`} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid #E2E8F4',textDecoration:'none',fontSize:12}}>
                      <span style={{color:'#475569'}}>{spec}</span>
                      <ArrowRight size={10} color="#C8811A"/>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky CTA */}
        <div className="lg:hidden" style={{position:'fixed',bottom:72,left:16,right:16,zIndex:90}}>
          <button onClick={()=>setEnquiryOpen(true)} style={{width:'100%',padding:14,borderRadius:14,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer',boxShadow:'0 4px 24px rgba(201,146,42,0.4)'}}>
            📩 Get Free {program} Counselling
          </button>
        </div>
      </div>
      <EnquiryModal isOpen={enquiryOpen} onClose={()=>setEnquiryOpen(false)} defaultProgram={program}/>
    </>
  )
}
