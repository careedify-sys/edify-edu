'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, XCircle, Shield, TrendingUp, Star, Award, BookOpen } from 'lucide-react'
import { UNIVERSITIES } from '@/lib/data'
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
  { name:'NMIMS',         color:'#6D28D9', tag:'NIRF #49 · NAAC A+',    id:'nmims' },
  { name:'Amity',         color:'#1E6FBB', tag:'NIRF #51 · NAAC A+',    id:'amity' },
  { name:'Manipal',       color:'#C0392B', tag:'NIRF #66 · WES Recog.', id:'manipal' },
  { name:'Symbiosis',     color:'#D4922A', tag:'NIRF #19 · NAAC A++',   id:'symbiosis' },
  { name:'Chandigarh U.', color:'#0E8A78', tag:'NIRF #28 · NAAC A+',    id:'chandigarh' },
  { name:'BITS Pilani',   color:'#0B1D35', tag:'NIRF #16 · NAAC A',     id:'bits-pilani-work-integrat' },
  { name:'LPU',           color:'#B45309', tag:'NIRF #38 · NAAC A++',   id:'lpu' },
  { name:'SRM',           color:'#2E7D64', tag:'NIRF #35 · NAAC A++',   id:'srm-institut-of-science' },
]

export default function HomePage() {
  const topUnis = [...UNIVERSITIES].sort((a, b) => a.nirf - b.nirf).slice(0, 6)
  const totalUnis = UNIVERSITIES.length

  return (
    <div style={{ background:'var(--bg)' }}>

      {/* HERO */}
      <section style={{ background:'linear-gradient(160deg,#0B1D35 0%,#142540 60%,#1C3252 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(212,146,42,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-60px', left:'-40px', width:'360px', height:'360px', borderRadius:'50%', background:'radial-gradient(circle,rgba(46,125,100,0.05) 0%,transparent 70%)', pointerEvents:'none' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-8"
              style={{ background:'rgba(212,146,42,0.12)', color:'#E8A730', border:'1px solid rgba(212,146,42,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'#E8A730' }} />
              Admissions Open · 2026 Batch · UGC DEB Verified
            </div>

            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:800, color:'#fff', lineHeight:1.12, marginBottom:'20px', letterSpacing:'-0.02em' }}>
              Find Your{' '}
              <span style={{ color:'#E8A730' }}>Online Degree.</span>
              <br />
              <span style={{ fontStyle:'italic', color:'rgba(255,255,255,0.65)', fontWeight:600 }}>Zero Paid Rankings.</span>
            </h1>

            <p style={{ fontSize:'16px', lineHeight:'1.75', color:'rgba(255,255,255,0.55)', maxWidth:'520px', margin:'0 auto 36px' }}>
              {totalUnis}+ UGC DEB approved universities. Real fee data. Honest comparisons by NIRF rank only.
            </p>

            <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'24px', marginBottom:'36px' }}>
              {[
                { n:`${totalUnis}+`, label:'UGC Universities' },
                { n:'8+',            label:'Programs' },
                { n:'100+',          label:'Specialisations' },
                { n:'₹0',            label:'Paid Rankings' },
              ].map(s => (
                <div key={s.n} style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:'26px', fontWeight:800, color:'#fff', lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', justifyContent:'center' }}>
              <Link href="/universities" className="btn-primary"
                style={{ padding:'14px 28px', borderRadius:'12px', fontSize:'15px', gap:'8px', display:'inline-flex', alignItems:'center', textDecoration:'none' }}>
                Browse {totalUnis}+ Universities <ArrowRight style={{ width:'18px', height:'18px' }} />
              </Link>
              <Link href="/compare"
                style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 28px', borderRadius:'12px', fontSize:'15px', fontWeight:'700', textDecoration:'none', background:'rgba(255,255,255,0.08)', color:'#fff', border:'1.5px solid rgba(255,255,255,0.15)' }}>
                Compare Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED BRANDS */}
      <section style={{ background:'var(--surface)', borderBottom:'1px solid var(--border-light)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
            <span style={{ fontSize:'11px', fontWeight:'700', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>Featured universities</span>
            <div style={{ flex:1, height:'1px', background:'var(--border-light)' }} />
            <Link href="/universities" style={{ fontSize:'11px', fontWeight:'700', color:'var(--amber)', textDecoration:'none', whiteSpace:'nowrap' }}>View all {totalUnis}+ →</Link>
          </div>
          <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px', scrollbarWidth:'none' as any }}>
            {FEATURED_BRANDS.map(b => (
              <Link key={b.id} href={`/universities/${b.id}`} style={{ textDecoration:'none', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 14px', borderRadius:'10px', border:'1.5px solid var(--border)', background:'var(--surface)', whiteSpace:'nowrap' }}
                  className="brand-chip">
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:b.color, flexShrink:0 }} />
                  <span style={{ fontWeight:'700', fontSize:'13px', color:'var(--ink)' }}>{b.name}</span>
                  <span style={{ fontSize:'10px', color:'var(--ink-3)', paddingLeft:'6px', borderLeft:'1px solid var(--border)' }}>{b.tag}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <style>{`.brand-chip { transition: all 0.15s; } .brand-chip:hover { border-color: var(--amber) !important; background: var(--amber-light) !important; }`}</style>
      </section>

      {/* PROGRAMS STRIP */}
      <section style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px', scrollbarWidth:'none' as any }}>
            {PROGRAMS_SHOWCASE.map((p, i) => (
              <Link key={i} href={`/programs?p=${p.key}`} className="prog-chip"
                style={{ flexShrink:0, flexDirection:'column', minWidth:'68px', padding:'10px 14px', gap:'4px' }}>
                <span style={{ fontSize:'20px' }}>{p.icon}</span>
                <span style={{ fontSize:'11px', fontWeight:'700' }}>{p.label}</span>
                <span style={{ fontSize:'9px', color:'var(--ink-3)' }}>{p.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY EDIFY */}
      <section style={{ padding:'64px 0', background:'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div style={{ textAlign:'center', marginBottom:'44px' }}>
            <div className="section-label">Why Edify?</div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.6rem,4vw,2.4rem)', fontWeight:800, color:'var(--navy)', marginTop:'8px' }}>
              Honest, by design. <span style={{ fontStyle:'italic', color:'var(--amber)' }}>Always.</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:'20px' }}>
            <div style={{ padding:'24px', borderRadius:'16px', background:'var(--surface)', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' }}>
                <span style={{ fontSize:'18px' }}>😕</span>
                <span style={{ fontWeight:'700', fontSize:'14px', color:'var(--red)' }}>Other Portals</span>
              </div>
              {['Rank universities who pay them more','Show fees that are wrong or incomplete','Claim "best" with zero criteria','Spam your number after enquiry','Never mention govt job validity'].map(item => (
                <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'10px' }}>
                  <XCircle style={{ width:'14px', height:'14px', color:'var(--red)', flexShrink:0, marginTop:'2px' }} />
                  <span style={{ fontSize:'13px', color:'var(--ink-2)', lineHeight:'1.5' }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ padding:'24px', borderRadius:'16px', background:'var(--navy)', border:'none', boxShadow:'var(--shadow-md)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' }}>
                <span style={{ fontSize:'18px' }}>✅</span>
                <span style={{ fontWeight:'700', fontSize:'14px', color:'#E8A730' }}>Edify</span>
              </div>
              {['Sorted by NIRF rank only — zero paid placement','Exact fees from official university brochures','Explain NAAC/NIRF/UGC DEB in plain language','One counsellor — you will never be spammed','Govt job validity verified for every degree'].map(item => (
                <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'10px' }}>
                  <CheckCircle style={{ width:'14px', height:'14px', color:'#3AA17F', flexShrink:0, marginTop:'2px' }} />
                  <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)', lineHeight:'1.5' }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ padding:'24px', borderRadius:'16px', background:'var(--amber-light)', border:'1px solid rgba(212,146,42,0.2)', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' }}>
                <BookOpen style={{ width:'18px', height:'18px', color:'var(--amber)' }} />
                <span style={{ fontWeight:'700', fontSize:'14px', color:'var(--navy)' }}>What We Cover</span>
              </div>
              {['Skills taught per specialisation','Job roles and real salary packages','Which companies hire from each university','Is it valid for PSU / government jobs?','Honest pros & cons, no sugar-coating'].map(item => (
                <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'10px' }}>
                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'var(--amber)', flexShrink:0, marginTop:'7px' }} />
                  <span style={{ fontSize:'13px', color:'var(--ink-2)', lineHeight:'1.5' }}>{item}</span>
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
              style={{ padding:'10px 20px', borderRadius:'10px', fontSize:'13px', display:'inline-flex', alignItems:'center', gap:'6px', textDecoration:'none' }}>
              View All {totalUnis}+ <ArrowRight style={{ width:'15px', height:'15px' }} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topUnis.map(u => <UniversityCard key={u.id} u={u} />)}
          </div>
        </div>
      </section>

      {/* TRUST STATS */}
      <section style={{ padding:'64px 0', background:'linear-gradient(135deg,var(--navy) 0%,var(--navy-light) 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.5rem,4vw,2.2rem)', fontWeight:800, color:'#fff', marginBottom:'12px' }}>
            India&apos;s Most Trusted Online Degree Guide
          </h2>
          <p style={{ color:'rgba(255,255,255,0.4)', maxWidth:'480px', margin:'0 auto 48px', fontSize:'14px', lineHeight:'1.7' }}>
            All data verified from official UGC, NAAC, and NIRF portals. Updated quarterly.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'24px' }}>
            {[
              { n:`${totalUnis}+`, label:'UGC DEB Universities', icon:<Award style={{ width:'20px', height:'20px' }} /> },
              { n:'100%',         label:'Officially verified',   icon:<Shield style={{ width:'20px', height:'20px' }} /> },
              { n:'₹0',           label:'Paid rankings',         icon:<Star style={{ width:'20px', height:'20px' }} /> },
              { n:'2025',         label:'Latest NIRF/NAAC data', icon:<TrendingUp style={{ width:'20px', height:'20px' }} /> },
            ].map(s => (
              <div key={s.n} style={{ textAlign:'center' }}>
                <div style={{ width:'46px', height:'46px', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', background:'rgba(212,146,42,0.12)', color:'#E8A730', border:'1px solid rgba(212,146,42,0.2)' }}>
                  {s.icon}
                </div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:'2rem', fontWeight:800, color:'#fff', lineHeight:1 }}>{s.n}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginTop:'6px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding:'64px 0', background:'var(--bg)' }}>
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
            <details key={i} style={{ marginBottom:'10px', borderRadius:'14px', overflow:'hidden', background:'var(--surface)', border:'1px solid var(--border)' }}>
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
          Free counselling with a human expert who has zero incentive to push any particular university.
        </p>
        <Link href="/universities"
          style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 28px', borderRadius:'12px', background:'var(--navy)', color:'#fff', fontWeight:'700', fontSize:'15px', textDecoration:'none' }}>
          Get Free Counselling <ArrowRight style={{ width:'18px', height:'18px' }} />
        </Link>
      </section>

    </div>
  )
}