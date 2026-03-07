'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, CheckCircle, XCircle, BarChart2, ChevronRight,
  Briefcase, TrendingUp, Building2, Plus, Users, BookOpen, Star, Award
} from 'lucide-react'
import { getUniversityById, getUniversitiesByProgram, formatFee } from '@/lib/data'
import { getProgramContent } from '@/lib/content'
import type { Program } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'

const progSlug = (p: Program) => p.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')

export default function UniversityPage() {
  const params = useParams()
  const id = params?.id as string
  const u = getUniversityById(id)
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [activeProgram, setActiveProgram] = useState<Program | null>(null)
  const [compareList, setCompareList] = useState<string[]>([])
  const [compareNotice, setCompareNotice] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  if (!u) return (
    <div style={{minHeight:'100vh',background:'#F8F9FC',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',color:'#64748b'}}>
        <div style={{fontSize:48,marginBottom:16}}>🔍</div>
        <p style={{marginBottom:12}}>University not found.</p>
        <Link href="/universities" style={{color:'#C8811A'}}>Browse all →</Link>
      </div>
    </div>
  )

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

  // Blueprint-compliant FAQs — honest, not overselling
  const faqs = [
    {
      q:`Is ${u.name} a good university for online degrees?`,
      a:`${u.name} is NIRF #${u.nirf} overall${u.nirfm?` and NIRF #${u.nirfm} in Management`:''}. It is ${u.naac} accredited by NAAC and UGC DEB approved. For private sector careers, it is a strong choice. It is not valid for most central government or PSU recruitment.`
    },
    {
      q:`What programs does ${u.name} offer online?`,
      a:`${u.name} offers ${u.programs.length} online programs: ${u.programs.join(', ')}. ${displayProgram} is the most popular. Each program has multiple specialisations. Fees range from ${formatFee(u.feeMin)} to ${formatFee(u.feeMax)}.`
    },
    {
      q:`What are the fees at ${u.name}?`,
      a:`Fees at ${u.name} range from ${formatFee(u.feeMin)} to ${formatFee(u.feeMax)} depending on the program and specialisation. EMI options start from ₹${u.emiFrom.toLocaleString()} per month. Semester-wise payment is typically available.`
    },
    {
      q:`What is the eligibility for ${u.name} online programs?`,
      a:`Minimum eligibility: ${u.eligibility}. No entrance exam is required. Admission is based on merit and online application. A valid degree certificate and mark sheets are required at the time of enrolment.`
    },
    {
      q:`How are exams conducted at ${u.name}?`,
      a:`${u.name} uses ${u.examMode}. You do not need to travel to an exam centre. Assessments include internal assignments, projects, and online proctored exams conducted via your webcam from home or office.`
    },
    {
      q:`Is ${u.name} valid for private sector jobs?`,
      a:`Yes. A UGC DEB-approved degree from ${u.name} is fully valid for private sector employment, banking sector jobs, and further education (higher studies, PhD, etc.). ${u.govtRecognised?'It is also valid for government jobs.':'It is not valid for most central government recruitment or PSU jobs.'}`
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context':'https://schema.org','@type':'FAQPage',
        mainEntity:faqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))
      })}}/>

      <div style={{minHeight:'100vh',background:'#F8F9FC'}}>
        <div style={{height:3,background:u.color}}/>

        {/* Breadcrumb */}
        <div style={{background:'#fff',borderBottom:'1px solid #E2E8F4'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#475569',flexWrap:'wrap'}}>
              <Link href="/" style={{color:'#475569',textDecoration:'none'}}>Home</Link><ChevronRight size={12}/>
              <Link href="/universities" style={{color:'#475569',textDecoration:'none'}}>Universities</Link><ChevronRight size={12}/>
              <span style={{color:'#C8811A',fontWeight:600}}>{u.name}</span>
            </div>
          </div>
        </div>

        {/* ── HERO (Blueprint §2) ── */}
        <div style={{background:'#fff',borderBottom:'1px solid #E2E8F4'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div style={{maxWidth:800,display:'flex',flexDirection:'column',gap:14}}>

              {/* Trust badges */}
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {u.approvals.map(a=>(
                  <span key={a} style={{fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:999,background:'rgba(74,222,128,0.08)',color:'#15803D',border:'1px solid rgba(74,222,128,0.2)'}}>
                    ✓ {a}
                  </span>
                ))}
              </div>

              <h1 className="font-display" style={{fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:800,color:'#0B1D35',lineHeight:1.2}}>
                {u.name}
              </h1>

              <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#64748b',flexWrap:'wrap'}}>
                <MapPin size={14}/><span>{u.city}, {u.state}</span>
                <span>·</span><span style={{color:'#C8811A',fontWeight:700}}>NIRF #{u.nirf}</span>
                {u.nirfm && <><span>·</span><span style={{color:'#7C3AED',fontWeight:700}}>NIRF Mgmt #{u.nirfm}</span></>}
                <span>·</span><span>NAAC {u.naac}</span>
                <span>·</span><span>{u.examMode}</span>
              </div>

              <p style={{fontSize:14,color:'#64748b',lineHeight:1.7,maxWidth:640}}>{u.description}</p>

              {/* Stats */}
              <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                {[
                  {label:'Fee Range',value:`${formatFee(u.feeMin)} – ${formatFee(u.feeMax)}`},
                  {label:'EMI from',value:`₹${u.emiFrom.toLocaleString()}/mo`},
                  {label:'Eligibility',value:u.eligibility},
                  {label:'Programs',value:`${u.programs.length}`},
                  {label:'Govt job valid',value:u.govtRecognised?'✓ Yes':'⚠️ No'},
                ].map(s=>(
                  <div key={s.label} style={{padding:'10px 16px',background:'#F8F9FC',border:'1px solid #E2E8F4',borderRadius:10,textAlign:'center'}}>
                    <div style={{fontSize:14,fontWeight:800,color:'#0B1D35'}}>{s.value}</div>
                    <div style={{fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',marginTop:2}}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA #1 — hero (Blueprint §10) */}
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <button onClick={()=>setEnquiryOpen(true)}
                  style={{padding:'12px 28px',borderRadius:12,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}>
                  📩 Get Free Counselling
                </button>
                <Link href={`/compare?a=${u.id}`}
                  style={{padding:'12px 20px',borderRadius:12,border:'1px solid #E2E8F4',color:'#64748b',fontSize:13,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:6}}>
                  <BarChart2 size={15}/> Compare {u.abbr}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div style={{display:'flex',gap:28,alignItems:'flex-start'}}>

            {/* ── MAIN CONTENT ── */}
            <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:24}}>

              {/* ── SECTION 1: PROGRAMS & OVERVIEW (Blueprint §3) ── */}
              <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                <div style={{padding:'14px 20px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Programs Offered — Click to Explore</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                    {u.programs.map(prog=>(
                      <button key={prog} onClick={()=>setActiveProgram(prog)}
                        style={{padding:'7px 16px',borderRadius:999,fontSize:13,fontWeight:600,cursor:'pointer',
                          background:displayProgram===prog?'#c9922a':'transparent',
                          color:displayProgram===prog?'#fff':'#64748b',
                          border:`1px solid ${displayProgram===prog?'#c9922a':'#E2E8F4'}`}}>
                        {prog}
                      </button>
                    ))}
                  </div>
                </div>

                {pd ? (
                  <div style={{padding:20,display:'flex',flexDirection:'column',gap:16}}>

                    {/* Quick stats */}
                    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                      {[
                        {label:'Fees',value:pd.fees},
                        {label:'Duration',value:pd.duration},
                        {label:'Avg Salary',value:pd.avgSalary.split('–')[0].trim()+'+'},
                        {label:'Specialisations',value:`${pd.specs.length}`},
                      ].map(s=>(
                        <div key={s.label} style={{padding:'8px 14px',background:'#F8F9FC',border:'1px solid #E2E8F4',borderRadius:8,textAlign:'center'}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#0B1D35'}}>{s.value}</div>
                          <div style={{fontSize:10,color:'#64748b',textTransform:'uppercase',marginTop:2}}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Program overview text */}
                    {programContent && (
                      <p style={{fontSize:13,color:'#475569',lineHeight:1.75,margin:0}}>{programContent.overview}</p>
                    )}

                    {/* Specialisations */}
                    <div style={{padding:14,background:'#F8F9FC',border:'1px solid #E2E8F4',borderRadius:12}}>
                      <div style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',marginBottom:10,display:'flex',alignItems:'center',gap:5}}>
                        <BookOpen size={12}/> Specialisations ({pd.specs.length})
                      </div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {pd.specs.map(s=>(
                          <span key={s} style={{fontSize:12,padding:'5px 12px',borderRadius:999,background:'rgba(200,129,26,0.06)',color:'#64748b',border:'1px solid #E2E8F4'}}>{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* Roles + Salary */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12}}>
                      <div style={{padding:14,background:'#F8F9FC',border:'1px solid #E2E8F4',borderRadius:12}}>
                        <div style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',marginBottom:10,display:'flex',alignItems:'center',gap:5}}>
                          <Briefcase size={12}/> Target Roles
                        </div>
                        {pd.roles.map(r=>(
                          <div key={r} style={{display:'flex',gap:7,alignItems:'center',marginBottom:6,fontSize:12,color:'#475569'}}>
                            <div style={{width:4,height:4,borderRadius:'50%',background:'#c9922a',flexShrink:0}}/>{r}
                          </div>
                        ))}
                      </div>
                      <div style={{padding:14,background:'#F8F9FC',border:'1px solid #E2E8F4',borderRadius:12}}>
                        <div style={{fontSize:11,fontWeight:700,color:'#15803D',textTransform:'uppercase',marginBottom:10,display:'flex',alignItems:'center',gap:5}}>
                          <TrendingUp size={12}/> Salary Range
                        </div>
                        <div style={{fontSize:20,fontWeight:800,color:'#0B1D35',marginBottom:6}}>{pd.avgSalary}</div>
                        <div style={{fontSize:11,color:'#64748b',lineHeight:1.6}}>Indicative for {displayProgram} graduates in India</div>
                      </div>
                    </div>

                    {/* Companies */}
                    <div style={{padding:14,background:'#F8F9FC',border:'1px solid #E2E8F4',borderRadius:12}}>
                      <div style={{fontSize:11,fontWeight:700,color:'#0891B2',textTransform:'uppercase',marginBottom:10,display:'flex',alignItems:'center',gap:5}}>
                        <Building2 size={12}/> Top Hiring Companies
                      </div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {pd.topCompanies.map(c=>(
                          <span key={c} style={{fontSize:12,padding:'4px 12px',background:'#fff',border:'1px solid #E2E8F4',borderRadius:8,color:'#475569'}}>{c}</span>
                        ))}
                      </div>
                    </div>

                    {/* Internship */}
                    <div style={{padding:14,background:'#F8F9FC',border:'1px solid #E2E8F4',borderRadius:12}}>
                      <div style={{fontSize:11,fontWeight:700,color:'#7C3AED',textTransform:'uppercase',marginBottom:8,display:'flex',alignItems:'center',gap:5}}>
                        <Users size={12}/> Internship & Projects
                      </div>
                      <p style={{fontSize:13,color:'#475569',lineHeight:1.7,margin:0}}>{pd.internshipType}</p>
                    </div>

                    <Link href={`/universities/${u.id}/${progSlug(displayProgram)}`}
                      style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:12,borderRadius:10,background:'rgba(200,129,26,0.08)',border:'1px solid rgba(200,129,26,0.2)',color:'#C8811A',fontWeight:700,fontSize:13,textDecoration:'none'}}>
                      View Full {displayProgram} Page — Specs, Career Guide & FAQs →
                    </Link>
                  </div>
                ) : (
                  <div style={{padding:24,textAlign:'center',color:'#64748b',fontSize:13}}>No details yet for this program.</div>
                )}
              </section>

              {/* ── SECTION 2: SKILLS GAINED (Blueprint §4) ── */}
              {programContent && (
                <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                  <div style={{padding:'14px 20px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                    <Award size={14} color="#C8811A"/>
                    <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Skills & Certifications Gained in {displayProgram}</span>
                  </div>
                  <div style={{padding:20,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:'#0B1D35',marginBottom:8}}>Technical Skills</div>
                      {programContent.skills.technical.slice(0,5).map((s,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'flex-start',gap:7,marginBottom:6,fontSize:12,color:'#475569'}}>
                          <CheckCircle size={12} color="#1F6B52" style={{marginTop:2,flexShrink:0}}/>{s}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:'#0B1D35',marginBottom:8}}>Certifications & Badges</div>
                      {programContent.certifications.slice(0,4).map((c,i)=>(
                        <div key={i} style={{marginBottom:7,padding:'6px 10px',background:'rgba(31,107,82,0.05)',borderRadius:8,border:'1px solid rgba(31,107,82,0.12)',fontSize:12,color:'#475569'}}>
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
                  <div style={{fontSize:14,fontWeight:700,color:'#0B1D35'}}>See if you qualify for {displayProgram} at {u.abbr}</div>
                  <div style={{fontSize:12,color:'#64748b',marginTop:3}}>Free eligibility check — 2 minutes, no spam</div>
                </div>
                <button onClick={()=>setEnquiryOpen(true)}
                  style={{padding:'11px 22px',borderRadius:10,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:'pointer'}}>
                  Check Eligibility →
                </button>
              </div>

              {/* ── SECTION 3: CAREER PATHS (Blueprint §7) ── */}
              {programContent && (
                <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                  <div style={{padding:'14px 20px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',alignItems:'center',gap:8}}>
                    <Briefcase size={14} color="#C8811A"/>
                    <span style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Career Paths After {displayProgram}</span>
                  </div>
                  <div style={{padding:20,display:'flex',flexDirection:'column',gap:16}}>
                    {[
                      {level:'Beginner (0–2 yrs)',roles:programContent.careerBeginner,color:'#1F6B52',bg:'rgba(31,107,82,0.05)',border:'rgba(31,107,82,0.15)'},
                      {level:'Intermediate (3–6 yrs)',roles:programContent.careerMid,color:'#C8811A',bg:'rgba(200,129,26,0.05)',border:'rgba(200,129,26,0.15)'},
                      {level:'Senior (7+ yrs)',roles:programContent.careerSenior,color:'#0B1D35',bg:'rgba(11,29,53,0.04)',border:'rgba(11,29,53,0.12)'},
                    ].map(tier=>(
                      <div key={tier.level}>
                        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:8}}>
                          <div style={{width:7,height:7,borderRadius:'50%',background:tier.color}}/>
                          <span style={{fontSize:11,fontWeight:700,color:'#0B1D35'}}>{tier.level}</span>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(185px,1fr))',gap:7}}>
                          {tier.roles.slice(0,4).map((role,i)=>(
                            <div key={i} style={{padding:'9px 12px',background:tier.bg,borderRadius:9,border:`1px solid ${tier.border}`}}>
                              <div style={{fontSize:12,fontWeight:700,color:'#0B1D35',marginBottom:3}}>{role.title}</div>
                              <div style={{fontSize:11,color:'#64748b',lineHeight:1.5}}>{role.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── SECTION 4: RIGHT FOR / NOT FOR ── */}
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

              {/* CTA #3 — mid-page (Blueprint §10) */}
              <div style={{padding:24,background:'#FFFBEB',border:'1px solid rgba(245,158,11,0.25)',borderRadius:16,textAlign:'center'}}>
                <div style={{fontSize:20,marginBottom:8}}>🎓</div>
                <h3 className="font-display" style={{fontWeight:700,color:'#0B1D35',fontSize:15,marginBottom:6}}>
                  Want to apply to {u.name}?
                </h3>
                <p style={{fontSize:13,color:'#64748b',marginBottom:16}}>
                  Free counselling — we'll verify your eligibility and match you to the right specialisation.
                </p>
                <button onClick={()=>setEnquiryOpen(true)}
                  style={{padding:'12px 28px',borderRadius:12,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}>
                  Get Free Counselling →
                </button>
              </div>

              {/* ── SECTION 5: COMPARE WITH OTHERS ── */}
              <section style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:16,overflow:'hidden'}}>
                <div style={{padding:'14px 20px',background:'rgba(200,129,26,0.06)',borderBottom:'1px solid #E2E8F4',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:'#C8811A',textTransform:'uppercase',letterSpacing:'0.08em'}}>Compare with Other Universities</div>
                    <div style={{fontSize:12,color:'#64748b',marginTop:2}}>Click + to select, then compare side-by-side</div>
                  </div>
                  {compareList.length>0 && (
                    <Link href={compareUrl}
                      style={{padding:'9px 18px',borderRadius:10,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:12,textDecoration:'none',display:'flex',alignItems:'center',gap:6}}>
                      <BarChart2 size={14}/> Compare {compareList.length+1} Universities →
                    </Link>
                  )}
                </div>
                <div style={{padding:'16px 20px'}}>
                  {compareNotice && (
                    <div style={{marginBottom:12,padding:'10px 16px',background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.2)',borderRadius:10,fontSize:13,color:'#15803D',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      ✓ Added to comparison!
                      <Link href={compareUrl} style={{color:'#C8811A',fontWeight:700,textDecoration:'none'}}>Open →</Link>
                    </div>
                  )}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
                    {otherUnis.map(ou=>{
                      const opd = ou.programDetails[displayProgram]
                      const inCompare = compareList.includes(ou.id)
                      return (
                        <div key={ou.id} style={{background:'#F8F9FC',border:`1px solid ${inCompare?'#C8811A':'#E2E8F4'}`,borderRadius:12,overflow:'hidden'}}>
                          <div style={{height:2,background:ou.color}}/>
                          <div style={{padding:'12px 14px'}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                              <div style={{flex:1,minWidth:0,paddingRight:8}}>
                                <Link href={`/universities/${ou.id}`} style={{fontWeight:700,color:'#0B1D35',fontSize:13,textDecoration:'none',display:'block'}}>{ou.name}</Link>
                                <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{ou.city} · NIRF #{ou.nirf}</div>
                              </div>
                              <button onClick={()=>addToCompare(ou.id)}
                                style={{width:30,height:30,borderRadius:8,border:`1px solid ${inCompare?'#C8811A':'#E2E8F4'}`,background:inCompare?'rgba(200,129,26,0.15)':'#fff',color:inCompare?'#c9922a':'#64748b',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:15}}>
                                {inCompare?'✓':<Plus size={14}/>}
                              </button>
                            </div>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,paddingTop:8,borderTop:'1px solid #E2E8F4'}}>
                              <span style={{color:'#64748b'}}>Fees: <strong style={{color:'#0B1D35'}}>{opd?.fees||`${formatFee(ou.feeMin)}+`}</strong></span>
                              <span style={{color:'#15803D',fontWeight:600}}>{opd?.avgSalary?.split('–')[0].trim()||'₹4L'}+</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>

              {/* ── SECTION 6: FAQ (Blueprint §9) ── */}
              <section>
                <h2 className="font-display" style={{fontSize:'1.2rem',fontWeight:700,color:'#0B1D35',marginBottom:12}}>
                  Frequently Asked Questions — {u.name}
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
                    {label:`${displayProgram} from ${u.abbr} — Full Career Guide`,href:`/universities/${u.id}/${progSlug(displayProgram)}`},
                    {label:`Compare ${u.abbr} with other universities`,href:`/compare?a=${u.id}`},
                    {label:`Is online ${displayProgram} valid for govt jobs?`,href:'/guides'},
                    {label:`Best ${displayProgram} specialisations in India`,href:'/blog'},
                    {label:`All universities offering ${displayProgram}`,href:`/programs/${progSlug(displayProgram)}`},
                    {label:`${displayProgram} fees comparison 2025`,href:'/compare'},
                  ].map(link=>(
                    <Link key={link.label} href={link.href}
                      style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#F8F9FC',borderRadius:10,textDecoration:'none',fontSize:12,color:'#475569',border:'1px solid #E2E8F4'}}>
                      {link.label}<span style={{color:'#C8811A',flexShrink:0,marginLeft:8}}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div style={{width:240,flexShrink:0}} className="hidden lg:block">
              <div style={{position:'sticky',top:80,display:'flex',flexDirection:'column',gap:14}}>
                <button onClick={()=>setEnquiryOpen(true)}
                  style={{width:'100%',padding:13,borderRadius:12,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:'pointer'}}>
                  📩 Free Counselling
                </button>

                <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:14,overflow:'hidden'}}>
                  <div style={{height:2,background:u.color}}/>
                  <div style={{padding:14}}>
                    <div style={{fontWeight:700,color:'#0B1D35',fontSize:12,marginBottom:10}}>Quick Facts</div>
                    {[
                      {label:'NIRF Overall',value:`#${u.nirf}`},
                      ...(u.nirfm?[{label:'NIRF Management',value:`#${u.nirfm}`}]:[]),
                      {label:'NAAC Grade',value:u.naacScore?`${u.naac} (${u.naacScore})`:u.naac},
                      {label:'Location',value:`${u.city}, ${u.state}`},
                      {label:'Exam Mode',value:u.examMode},
                      {label:'Eligibility',value:u.eligibility},
                      {label:'Fees from',value:formatFee(u.feeMin)},
                      {label:'EMI from',value:`₹${u.emiFrom.toLocaleString()}/mo`},
                      {label:'Govt job valid',value:u.govtRecognised?'✓ Yes':'⚠️ No'},
                    ].map(r=>(
                      <div key={r.label} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #E2E8F4',fontSize:11}}>
                        <span style={{color:'#64748b'}}>{r.label}</span>
                        <span style={{fontWeight:600,color:r.label==='Govt job valid'&&!u.govtRecognised?'#DC2626':'#0B1D35',textAlign:'right',maxWidth:110}}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:14,padding:14}}>
                  <div style={{fontWeight:700,color:'#0B1D35',fontSize:12,marginBottom:10}}>All Programs</div>
                  {u.programs.map(prog=>(
                    <Link key={prog} href={`/universities/${u.id}/${progSlug(prog)}`}
                      style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid #E2E8F4',textDecoration:'none',fontSize:12}}>
                      <span style={{color:'#475569',fontWeight:600}}>{prog}</span>
                      <span style={{color:'#C8811A',fontSize:11}}>{u.programDetails[prog]?.fees||formatFee(u.feeMin)}</span>
                    </Link>
                  ))}
                </div>

                <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:14,padding:14}}>
                  <div style={{fontWeight:700,color:'#0B1D35',fontSize:12,marginBottom:10}}>Approvals</div>
                  {u.approvals.map(a=>(
                    <div key={a} style={{display:'flex',alignItems:'center',gap:7,marginBottom:6,fontSize:11,color:'#475569'}}>
                      <CheckCircle size={11} color="#4ade80"/>{a}
                    </div>
                  ))}
                </div>

                <Link href={`/compare?a=${u.id}`}
                  style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:11,borderRadius:12,border:'1px solid #E2E8F4',color:'#64748b',fontSize:12,fontWeight:600,textDecoration:'none'}}>
                  <BarChart2 size={14}/> Compare with others
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky CTA — Blueprint §10 */}
        <div className="lg:hidden" style={{position:'fixed',bottom:72,left:16,right:16,zIndex:90}}>
          <button onClick={()=>setEnquiryOpen(true)}
            style={{width:'100%',padding:14,borderRadius:14,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer',boxShadow:'0 4px 24px rgba(201,146,42,0.4)'}}>
            📩 Get Free Counselling
          </button>
        </div>
      </div>

      <EnquiryModal isOpen={enquiryOpen} onClose={()=>setEnquiryOpen(false)} universityName={u.name} universityId={u.id}/>
    </>
  )
}
