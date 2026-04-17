'use client'
import { getSortRank } from '@/lib/data-slim'
import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import EdifyTrust from '@/components/EdifyTrust'
import { StickyBottomBar } from '@/components/LeadCapture'
import EnquiryModal from '@/components/EnquiryModalDynamic'

import Link from 'next/link'
import { ArrowRight, CheckCircle, XCircle, Shield, TrendingUp, Star, Award, BookOpen } from 'lucide-react'
import { UNIS_SLIM } from '@/lib/data-slim'
import UniversityCard from '@/components/UniversityCard'

const PROGRAMS_SHOWCASE = [
  { key:'MBA',   label:'MBA',   icon:'💼', desc:'2 yrs · PG' },
  { key:'MCA',   label:'MCA',   icon:'💻', desc:'2 yrs · PG' },
  { key:'BBA',   label:'BBA',   icon:'🎓', desc:'3 yrs · UG' },
  { key:'BCA',   label:'BCA',   icon:'🖥️', desc:'3 yrs · UG' },
  { key:'B.Com', label:'B.Com', icon:'📊', desc:'3 yrs · UG' },
  { key:'MA',    label:'MA',    icon:'📖', desc:'2 yrs · PG' },
  { key:'M.Com', label:'M.Com', icon:'📈', desc:'2 yrs · PG' },
  { key:'BA',    label:'BA',    icon:'📚', desc:'3 yrs · UG' },
]

const FEATURED_BRANDS = [
  { name:'JAIN Online',    color:'#1B4FBE', tag:'NIRF #62 · NAAC A++',   id:'jain-university-online' },
  { name:'Symbiosis',     color:'#D4922A', tag:'NIRF #47 · NAAC A++',   id:'symbiosis-university-online' },
  { name:'Manipal (MAHE)', color:'#C0392B', tag:'NIRF #4 · NAAC A++',   id:'manipal-academy-higher-education-online' },
  { name:'Amity',         color:'#1E6FBB', tag:'NAAC A+ · QS Ranked',   id:'amity-university-online' },
  { name:'Chandigarh U.', color:'#0E8A78', tag:'NAAC A+ · QS Ranked',   id:'chandigarh-university-online' },
  { name:'LPU',           color:'var(--warning)', tag:'NAAC A++ · THE Ranked', id:'lovely-professional-university-online' },
  { name:'Shoolini',      color:'#2563EB', tag:'NAAC A+ · QS #1 Pvt',   id:'shoolini-university-online' },
  { name:'NMIMS',         color:'var(--purple)', tag:'NAAC A++ · UGC DEB',   id:'nmims-online' },
]

export default function HomePage() {
  const topUnis = [...UNIS_SLIM].sort((a, b) => getSortRank(a) - getSortRank(b)).slice(0, 6)
  const totalUnis = UNIS_SLIM.length
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  // Listen for openEnquiry event from buttons
  useEffect(() => {
    const handler = () => setEnquiryOpen(true)
    document.addEventListener('openEnquiry', handler)
    return () => document.removeEventListener('openEnquiry', handler)
  }, [])

  return (
    <>
      <StickyBottomBar label='Speak with an Advisor — 2 min' />
      {/* ── July 2026 Admission Banner ── */}
      <div style={{ background: 'linear-gradient(135deg, #0B1D35, #1a3a5c)', borderBottom: '3px solid #C8811A', padding: '10px 0', textAlign: 'center', }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3 flex-wrap">
          <span style={{fontSize:12,fontWeight:800,color:'var(--amber-vivid)',letterSpacing:'0.05em',textTransform:'uppercase'}}>
            🎓 Admissions Open
          </span>
          <span className="text-xs text-white font-medium">
            July 2026 batch — Admissions close October 15–30, 2026.
          </span>
          <a href="#enquire" onClick={(e)=>{e.preventDefault();document.dispatchEvent(new CustomEvent('openEnquiry'))}}
            style={{fontSize:11,fontWeight:700,padding:'4px 14px',borderRadius:'var(--r-lg)',background:'var(--amber-text)',color:'#fff',textDecoration:'none',whiteSpace:'nowrap'}}>
            Check Eligibility →
          </a>
        </div>
      </div>

      <div style={{ background:'var(--bg)' }}>
      {/* ── Schema: FAQPage for homepage ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context':'https://schema.org','@type':'FAQPage',
        mainEntity:[
          {
            '@type':'Question',
            name:'Are online degrees valid for government jobs?',
            acceptedAnswer:{'@type':'Answer',text:'Yes — all UGC DEB approved degrees are valid for government recruitment. Every university on Edify is verified UGC DEB approved. The Ministry of Education confirmed parity of online and regular degrees in 2020.'}
          },
          {
            '@type':'Question',
            name:'What is UGC DEB approval and why does it matter?',
            acceptedAnswer:{'@type':'Answer',text:'UGC DEB (Distance Education Bureau) licenses universities to offer online degrees. Only UGC DEB approved degrees are accepted for government jobs, corporate hiring, and further studies. Never join without verifying at ugc.ac.in.'}
          },
          {
            '@type':'Question',
            name:'Is an online MBA worth it for working professionals?',
            acceptedAnswer:{'@type':'Answer',text:'Yes — especially from NIRF top-50 universities. Most professionals see a 30-50% salary jump within 2 years of completing an online MBA. Budget ₹1.5L–₹4L total. Pick NAAC A+ or A++ universities with placement support for best ROI.'}
          },
          {
            '@type':'Question',
            name:'What is the difference between NIRF Overall and NIRF Management rank?',
            acceptedAnswer:{'@type':'Answer',text:'NIRF Overall ranks universities across all disciplines. NIRF Management specifically ranks MBA and BBA programs. A university can rank #50 overall but #8 in management — meaning its business school is far stronger than the overall rank suggests. For MBA decisions, always check the NIRF Management rank.'}
          },
          {
            '@type':'Question',
            name:'Which is better — Finance MBA or Marketing MBA?',
            acceptedAnswer:{'@type':'Answer',text:'Finance MBA is stronger for BFSI sector careers with a higher salary ceiling of ₹8L–₹25L, and suits analytical profiles. Marketing MBA is stronger for FMCG, D2C, and tech roles with salaries of ₹7L–₹20L, and suits communication-oriented profiles. The right choice depends on your career target industry.'}
          },
        ]
      })}}/>

      {/* HERO */}
      <section style={{ background:'linear-gradient(160deg,#0B1D35 0%,#142540 60%,#1C3252 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'500px', height:'500px', borderRadius:'var(--r-pill)', background:'radial-gradient(circle,rgba(212,146,42,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-60px', left:'-40px', width:'360px', height:'360px', borderRadius:'var(--r-pill)', background:'radial-gradient(circle,rgba(46,125,100,0.05) 0%,transparent 70%)', pointerEvents:'none' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-8"
              style={{ background:'rgba(212,146,42,0.12)', color:'var(--amber-bright)', border:'1px solid rgba(212,146,42,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'var(--amber-bright)' }} />
              India's Only Unbiased Online Education Platform
            </div>

            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:800, color:'#fff', lineHeight:1.12, marginBottom:'20px', letterSpacing:'-0.02em' }}>
              Compare 125+ <span style={{ color:'var(--amber-bright)' }}>UGC Approved</span><br />
              Online Universities India 2026
            </h1>

            <p style={{ fontSize:'16px', lineHeight:'1.75', color:'rgba(255,255,255,0.75)', maxWidth:'560px', margin:'0 auto 36px' }}>
              We don't accept payments from universities. All rankings based on official NIRF data only. {totalUnis}+ UGC DEB approved universities compared honestly.
            </p>

            <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'24px', marginBottom:'36px' }}>
              {[
                { n:`${totalUnis}+`, label:'UGC Universities' },
                { n:'8+',            label:'Programs' },
                { n:'100+',          label:'Specialisations' },
                { n:'₹0',            label:'Paid Rankings' },
              ].map(s => (
                <div key={s.n} className="text-center">
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:'26px', fontWeight:800, color:'#fff', lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.65)', marginTop:'4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', justifyContent:'center' }}>
              <Link href="/universities" className="btn-primary"
                style={{ padding:'14px 28px', borderRadius:'var(--r-sm)', fontSize:'15px', gap:'8px', display:'inline-flex', alignItems:'center', textDecoration:'none' }}>
                Browse {totalUnis}+ Universities <ArrowRight style={{ width:'18px', height:'18px' }} />
              </Link>
              <button onClick={() => setEnquiryOpen(true)}
                style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 28px', borderRadius:'var(--r-sm)', fontSize:'15px', fontWeight:'700', textDecoration:'none', background:'rgba(255,255,255,0.08)', color:'#fff', border:'1.5px solid rgba(255,255,255,0.15)', cursor:'pointer' }}>
                Speak with an Advisor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED BRANDS — social proof */}
      <section style={{ background:'var(--surface)', borderBottom:'1px solid var(--border-light)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
            <span style={{ fontSize:'11px', fontWeight:'700', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>Featured universities</span>
            <div style={{ flex:1, height:'1px', background:'var(--border-light)' }} />
            <Link href="/universities" style={{ fontSize:'11px', fontWeight:'700', color:'var(--amber)', textDecoration:'none', whiteSpace:'nowrap' }}>View all {totalUnis}+ →</Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {FEATURED_BRANDS.map(b => (
              <Link key={b.id} href={`/universities/${b.id}`} className="no-underline shrink-0">
                <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 14px', borderRadius:'var(--r-sm)', border:'1.5px solid var(--border)', background:'var(--surface)', whiteSpace:'nowrap' }}
                  className="brand-chip">
                  <div style={{ width:'8px', height:'8px', borderRadius:'var(--r-pill)', background:b.color, flexShrink:0 }} />
                  <span style={{ fontWeight:'700', fontSize:'13px', color:'var(--ink)' }}>{b.name}</span>
                  <span style={{ fontSize:'10px', color:'var(--ink-3)', paddingLeft:'6px', borderLeft:'1px solid var(--border)' }}>{b.tag}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <style>{`.brand-chip { transition: var(--t-base); } .brand-chip:hover { border-color: var(--amber) !important; background: var(--amber-light) !important; }`}</style>
      </section>

      {/* PROGRAMS STRIP */}
      <section style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {PROGRAMS_SHOWCASE.map((p, i) => {
              const slug = p.key.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-')
              return (
                <Link key={i} href={`/programs/${slug}`} className="prog-chip"
                  style={{ flexShrink:0, flexDirection:'column', minWidth:'68px', padding:'10px 14px', gap:'4px' }}>
                  <span className="text-[20px]">{p.icon}</span>
                  <span style={{ fontSize:'11px', fontWeight:'700' }}>{p.label}</span>
                  <span style={{ fontSize:'9px', color:'var(--ink-3)' }}>{p.desc}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

    {/* WHY EDIFY */}
    <section className="py-20 relative overflow-hidden" style={{ background:'var(--bg)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div style={{ textAlign:'center', marginBottom:'56px' }}>
          <div className="section-label">Why Edify?</div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, color:'var(--navy)', lineHeight:1.2, marginTop:'8px', letterSpacing:'-0.02em' }}>
            Honest, by design. <span style={{ fontStyle:'italic', color:'var(--amber)' }}>Always.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          
          {/* Other Portals */}
          <div className="p-7 rounded-[var(--r-md)] relative overflow-hidden transition-transform hover:-translate-y-1" style={{ background:'var(--surface)', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
            <div className="absolute top-0 left-0 w-full h-1" style={{ background:'var(--red)' }}></div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[18px]">😕</span>
              <span className="font-bold text-[14px]" style={{ color:'var(--red)' }}>Other Portals</span>
            </div>
            {['Rank universities who pay them more','Show fees that are wrong or incomplete','Claim "best" with zero criteria','Spam your number after enquiry','Never mention govt job validity'].map(item => (
              <div key={item} className="flex items-start gap-3 mb-4">
                <XCircle style={{ width:'16px', height:'16px', color:'var(--red)', flexShrink:0, marginTop:'2px' }} />
                <span className="text-[13.5px] font-medium leading-relaxed text-ink-2">{item}</span>
              </div>
            ))}
          </div>

          {/* Edify - The Hero Card */}
          <div className="p-8 rounded-[var(--r-md)] relative overflow-hidden transform md:-translate-y-4 transition-all hover:-translate-y-6" style={{ background:'var(--navy)', border:'none', boxShadow:'var(--shadow-md)' }}>
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500 rounded-full blur-[60px] opacity-20"></div>
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <span className="text-[18px]">✅</span>
              <span className="font-extrabold text-[16px] tracking-wide" style={{ color:'var(--amber-bright)' }}>Edify</span>
            </div>
            <div className="relative z-10">
            {['Sorted by NIRF rank only — zero paid placement','Exact fees from official university brochures','Explain NAAC/NIRF/UGC DEB in plain language','One advisor — you will never be spammed','Govt job validity verified for every degree'].map(item => (
              <div key={item} className="flex items-start gap-3 mb-5">
                <CheckCircle style={{ width:'16px', height:'16px', color:'var(--sage-bright)', flexShrink:0, marginTop:'2px' }} />
                <span className="text-[13.5px] font-medium leading-relaxed" style={{ color:'rgba(255,255,255,0.7)' }}>{item}</span>
              </div>
            ))}
            </div>
          </div>

          {/* What We Cover */}
          <div className="p-7 rounded-[var(--r-md)] relative overflow-hidden transition-transform hover:-translate-y-1" style={{ background:'var(--amber-light)', border:'1px solid rgba(212,146,42,0.2)', boxShadow:'var(--shadow-sm)' }}>
            <div className="absolute top-0 left-0 w-full h-1" style={{ background:'var(--amber)' }}></div>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen style={{ width:'18px', height:'18px', color:'var(--amber)' }} />
              <span className="font-bold text-[14px]" style={{ color:'var(--navy)' }}>What We Cover</span>
            </div>
            {['Skills taught per specialisation','Job roles and real salary packages','Which companies hire from each university','Is it valid for PSU / government jobs?','Honest pros & cons, no sugar-coating'].map(item => (
              <div key={item} className="flex items-start gap-3 mb-4">
                <div style={{ width:'6px', height:'6px', borderRadius:'var(--r-pill)', background:'var(--amber)', flexShrink:0, marginTop:'7px' }} />
                <span className="text-[13.5px] font-medium leading-relaxed text-ink-2">{item}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>

      {/* TOP UNIVERSITIES */}
      <section style={{ padding:'64px 0', background:'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'40px', flexWrap:'wrap', gap:'12px' }}>
            <div>
              <div className="section-label">Sorted by NIRF Rank</div>
              <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.6rem,4vw,2.2rem)', fontWeight:800, color:'var(--navy)', marginTop:'8px' }}>
                Top Rated Universities
              </h2>
            </div>
            <Link href="/universities" className="btn-outline"
              style={{ padding:'10px 20px', borderRadius:'var(--r-sm)', fontSize:'13px', display:'inline-flex', alignItems:'center', gap:'6px', textDecoration:'none' }}>
              View All {totalUnis}+ <ArrowRight style={{ width:'15px', height:'15px' }} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topUnis.map(u => <UniversityCard key={u.id} u={u} />)}
          </div>
        </div>
      </section>

      {/* ── SEO EDITORIAL SECTION ── */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div style={{ marginBottom: '48px' }}>
            <div className="section-label" style={{ marginBottom: '12px' }}>Why Edify exists</div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.2, marginBottom: '16px' }}>
              Most online MBA guides are ads.<br />We built the one that isn't.
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--ink-2)', lineHeight: 1.8, maxWidth: '600px' }}>
              The university that pays more gets the "Best MBA" badge everywhere else. We got tired of it — so every ranking on Edify comes from <strong style={{ color: 'var(--navy)' }}>official NIRF data</strong>, not who paid us. That's literally how the code works.
            </p>
          </div>

          {/* 4 principles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {[
              {
                icon: <Shield size={20} />,
                label: 'DEB approval first, always',
                body: 'The Distance Education Bureau is the only body that can authorise an online degree in India. Without it, your degree may not count for jobs, govt exams, or PhD admission. We verify every university before listing — you can always double-check at ugc.ac.in.',
              },
              {
                icon: <Award size={20} />,
                label: 'Government rankings, not ours',
                body: 'We sort by NIRF rank — published by the Ministry of Education, not sold to us. If Amity is #62 overall but #24 in management, you see both numbers. That gap matters more than most people realise for an MBA decision.',
              },
              {
                icon: <CheckCircle size={20} />,
                label: 'Total fee. No hidden line items.',
                body: 'Other portals show the semester fee and bury exam fees and study material costs in the fine print. Every number on Edify is total programme cost — what you pay from day one to graduation day. Online MBAs run ₹60,000 to ₹3,00,000. You\'ll know exactly where each option lands.',
              },
              {
                icon: <BookOpen size={20} />,
                label: 'Online degrees and govt jobs — the real answer',
                body: 'Per the 2020 UGC notification, an online degree from a DEB-approved university is legally equivalent to a campus degree. Valid for UPSC, SSC, banking, and state recruitment. One catch: the university must have been DEB-approved during your study period. We flag this clearly on each page.',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(212,146,42,0.1)', border: '1px solid rgba(212,146,42,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber-bright)', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--navy)', lineHeight: 1.4 }}>{item.label}</div>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-2)', lineHeight: 1.75, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>

          {/* Pledge */}
          <div style={{ padding: '22px 28px', background: 'var(--navy)', borderRadius: '14px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>🤝</div>
            <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: '#fff' }}>Our promise:</strong> We don't take money to rank universities. We don't spam your phone. If you ask an advisor to compare two options, they'll tell you honestly — even if that means recommending the cheaper one.
            </p>
          </div>

        </div>
      </section>

      {/* TRUST STATS */}
      <section className="py-20 relative overflow-hidden" style={{ background:'linear-gradient(135deg,var(--navy) 0%,var(--navy-light) 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.5rem,4vw,2.2rem)', fontWeight:800, color:'#fff', marginBottom:'12px' }}>
            India&apos;s Most Trusted Online Degree Guide
          </h2>
          <p style={{ color:'rgba(255,255,255,0.7)', maxWidth:'480px', margin:'0 auto 48px', fontSize:'14px', lineHeight:'1.7' }}>
            All data verified from official UGC, NAAC, and NIRF portals. Updated quarterly.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'24px', maxWidth:'800px', margin:'0 auto' }}>
            {[
              { n:`${totalUnis}+`, label:'UGC DEB Universities', icon:<Award className="w-5 h-5" /> },
              { n:'100%',         label:'Officially verified',   icon:<Shield className="w-5 h-5" /> },
              { n:'₹0',           label:'Paid rankings',         icon:<Star className="w-5 h-5" /> },
              { n:'2026',         label:'Latest NIRF/NAAC data', icon:<TrendingUp className="w-5 h-5" /> },
            ].map((s, idx) => (
              <div key={s.n} className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 transition-transform hover:-translate-y-2 relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div style={{ width:'46px', height:'46px', borderRadius:'var(--r-sm)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', background:'rgba(212,146,42,0.12)', color:'var(--amber-bright)', border:'1px solid rgba(212,146,42,0.2)' }}>
                  {s.icon}
                </div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:'2.5rem', fontWeight:800, color:'#fff', lineHeight:1.1, marginBottom:'4px' }}>
                  {s.n}
                </div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', fontWeight:600 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Edify Trust Section ── */}
      <section style={{ padding:'0 0 64px', background:'var(--bg)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <EdifyTrust />
        </div>
      </section>

      {/* ── Popular Guides ── */}
      <section style={{ padding:'64px 0', background:'var(--surface)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <div className="section-label">Free Guides</div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:800, color:'var(--navy)', marginTop:'8px' }}>
              Honest Answers Before You Enrol
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon:'🏆', title:'Best Online MBA in India 2026', desc:'Top 10 online MBAs ranked by NIRF & NAAC with fees, specializations, and honest picks by use case.', href:'/best-online-mba-india' },
              { icon:'🏛️', title:'Is Online Degree Valid in India?', desc:'UGC 2020 notification, government job eligibility, what DEB approval means.', href:'/guides/is-online-degree-valid-india' },
              { icon:'📋', title:'Online MBA for Government Jobs', desc:'Which online MBAs count for UPSC, SSC, banking and state PSC exams.', href:'/guides/online-mba-for-government-jobs' },
              { icon:'🔍', title:'How to Check UGC DEB Approval', desc:'Step-by-step: verify any university\'s online degree approval in 2 minutes.', href:'/guides/how-to-check-ugc-deb-approval' },
              { icon:'🎓', title:'Online MBA vs Distance MBA', desc:'Key differences, validity, fee range, and which suits working professionals.', href:'/guides/online-mba-vs-distance-mba' },
              { icon:'📊', title:'NAAC & NIRF Rankings Explained', desc:'What NAAC grades and NIRF ranks actually mean for your MBA choice.', href:'/guides/naac-nirf-rankings-explained' },
            ].map(g => (
              <Link key={g.href} href={g.href} className="no-underline group">
                <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', padding:'20px', height:'100%', transition:'var(--t-base)' }}
                  className="group-hover:border-amber/40 group-hover:shadow-sm transition-all">
                  <div style={{ fontSize:'24px', marginBottom:'10px' }}>{g.icon}</div>
                  <div style={{ fontWeight:700, fontSize:'14px', color:'var(--navy)', lineHeight:1.4, marginBottom:'6px' }}>{g.title}</div>
                  <p style={{ fontSize:'12.5px', color:'var(--ink-3)', lineHeight:1.6, margin:0 }}>{g.desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:'32px' }}>
            <Link href="/guides" style={{ fontSize:'13px', fontWeight:600, color:'var(--amber-text)', textDecoration:'none' }}>
              View all guides →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <div className="section-label">Common Questions</div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.6rem,4vw,2.2rem)', fontWeight:800, color:'var(--navy)', marginTop:'8px' }}>
              What Working Professionals Ask
            </h2>
          </div>
          {[
            { q:'Are online degrees valid for government jobs?', a:'Yes — all UGC DEB approved degrees are valid for government recruitment. Every university on Edify is verified UGC DEB approved. The Ministry of Education confirmed parity in 2020.' },
            { q:'NIRF Overall vs NIRF Management rank — what is the difference?', a:'NIRF Overall ranks across all disciplines. NIRF Management specifically ranks MBA/BBA programs. A university can rank #50 overall but #8 in management — meaning its business school is far stronger than the overall rank suggests.' },
            { q:'Is an online MBA worth it for working professionals?', a:'Yes — especially from NIRF top-50 universities. Most professionals see 30–50% salary jump within 2 years. Budget ₹1.5L–₹4L total. Pick NAAC A+ or A++ with placement support for best ROI.' },
            { q:'What is UGC DEB approval and why does it matter?', a:'UGC DEB (Distance Education Bureau) licenses universities to offer online degrees. Only UGC DEB approved degrees are accepted for government jobs, corporate hiring, and further studies. Never join without verifying this — check ugc.ac.in.' },
            { q:'Finance MBA vs Marketing MBA — which is better?', a:'Finance: stronger for BFSI sector, higher salary ceiling (₹8L–₹25L), suits analytical profiles. Marketing: stronger for FMCG/D2C/tech (₹7L–₹20L), suits communicators. Check job roles on each university page for exact company names.' },
          ].map((faq, i) => (
            <details key={i} style={{ marginBottom:'10px', borderRadius:'var(--r-sm)', overflow:'hidden', background:'var(--surface)', border:'1px solid var(--border)' }}>
              <summary style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', cursor:'pointer', fontWeight:'600', fontSize:'14px', color:'var(--navy)', listStyle:'none' }}>
                <span>{faq.q}</span>
                <span style={{ marginLeft:'16px', fontSize:'18px', color:'var(--amber)', flexShrink:0, userSelect:'none' }}>+</span>
              </summary>
              <div style={{ padding:'0 20px 18px', fontSize:'13px', lineHeight:'1.75', color:'var(--ink-2)', borderTop:'1px solid var(--border-light)' }}>
                <p style={{ paddingTop:'14px' }}>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ background:'var(--amber)', padding:'56px 24px', textAlign:'center' }}>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.5rem,4vw,2.2rem)', fontWeight:800, color:'var(--navy)', marginBottom:'12px' }}>
          Still unsure which university to choose?
        </h2>
        <p style={{ fontSize:'15px', color:'rgba(11,29,53,0.6)', marginBottom:'28px', maxWidth:'480px', margin:'0 auto 28px', lineHeight:'1.7' }}>
          Speak with an advisor who has zero incentive to push any particular university.
        </p>
        <button onClick={() => setEnquiryOpen(true)}
          style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 28px', borderRadius:'var(--r-sm)', background:'var(--navy)', color:'#fff', fontWeight:'700', fontSize:'15px', textDecoration:'none', border:'none', cursor:'pointer' }}>
          Speak with an Advisor <ArrowRight style={{ width:'18px', height:'18px' }} />
        </button>
      </section>

    </div>
    <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
     </>
  )
}