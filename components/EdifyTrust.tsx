'use client'

import { useState } from 'react'
import EnquiryModal from './EnquiryModalDynamic'

const STAGES = [
  {
    num: '01',
    icon: '🎯',
    title: 'Career Goal Mapping',
    desc: 'We start by understanding where you want to go — sector, role, and 5-year target. This determines which program type and specialisation actually matters for you.',
  },
  {
    num: '02',
    icon: '📋',
    title: 'Eligibility & Profile Check',
    desc: 'We verify your academic background, work experience, and eligibility percentage. No point recommending a university you don\'t qualify for.',
  },
  {
    num: '03',
    icon: '💰',
    title: 'Budget & ROI Analysis',
    desc: 'We map total program cost against expected salary uplift. A ₹3L MBA that gives you a ₹5L raise beats a ₹1L MBA that gives you nothing.',
  },
  {
    num: '04',
    icon: '🏆',
    title: 'University Shortlist',
    desc: 'Only after stages 1–3 do we recommend. Your list is sorted by NIRF rank. Zero paid placements — if a university pays, they don\'t appear on Edify.',
  },
]

export default function EdifyTrust({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)

  if (compact) {
    return (
      <>
        <div style={{ background:'linear-gradient(135deg,rgba(11,29,53,0.04),rgba(200,129,26,0.04))', border:'1px solid var(--border)',borderRadius:'var(--r-md)',padding:'20px 24px', }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div style={{width:32,height:32,borderRadius:'var(--r-pill)',background:'rgba(200,129,26,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>
              🛡️
            </div>
            <div>
              <div className="text-[13px] font-bold text-navy">How Edify Works</div>
              <div className="text-[11px] text-ink-3">3–4 stage evaluation before any recommendation</div>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap mb-3.5">
            {STAGES.map((s) => (
              <div key={s.num} style={{ display:'flex',alignItems:'center',gap:5,padding:'5px 10px', background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)', fontSize:11,color:'var(--ink-2)',fontWeight:500 }}>
                <span>{s.icon}</span>{s.title}
              </div>
            ))}
          </div>
          <button onClick={() => setOpen(true)} style={{ width:'100%',padding:'10px 16px',borderRadius:'var(--r-sm)', background:'linear-gradient(135deg,#c9922a,#e0a93a)', color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:'pointer' }}>
            Start Your Free Evaluation →
          </button>
        </div>
        <EnquiryModal isOpen={open} onClose={() => setOpen(false)} />
      </>
    )
  }

  return (
    <>
      <section style={{ background:'linear-gradient(160deg,#0B1D35 0%,#142540 100%)', padding:'64px 0',borderRadius:'var(--r-lg)',overflow:'hidden',position:'relative' }}>
        {/* Background decoration */}
        <div style={{ position:'absolute',top:-60,right:-60,width:300,height:300, borderRadius:'var(--r-pill)',background:'rgba(200,129,26,0.06)',pointerEvents:'none' }}/>

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{ display:'inline-flex',alignItems:'center',gap:6, padding:'5px 14px',borderRadius:'var(--r-lg)', background:'rgba(200,129,26,0.15)',border:'1px solid rgba(200,129,26,0.3)', fontSize:11,fontWeight:700,color:'var(--amber-vivid)', textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:14 }}>
              🛡️ How Edify Works
            </div>
            <h2 style={{ fontSize:'clamp(1.4rem,3.5vw,2rem)',fontWeight:800,color:'#fff', margin:'0 0 12px',lineHeight:1.2 }}>
              We Evaluate 3–4 Stages Before Recommending Any University
            </h2>
            <p style={{fontSize:14,color:'var(--ink-4)',maxWidth:540,margin:'0 auto',lineHeight:1.6}}>
              Most platforms list whoever pays them. Edify is different — our rankings are 100% NIRF-based with zero paid placements.
            </p>
          </div>

          {/* Stages */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16,marginBottom:40 }}>
            {STAGES.map((s, i) => (
              <div key={s.num} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'var(--r-md)',padding:'20px 18px', position:'relative',overflow:'hidden' }}>
                <div style={{ position:'absolute',top:12,right:14, fontSize:28,fontWeight:900,color:'rgba(255,255,255,0.04)', fontFamily:'serif',lineHeight:1 }}>{s.num}</div>
                <div className="text-2xl mb-2.5">{s.icon}</div>
                <div className="text-[13px] font-bold text-white mb-1.5">{s.title}</div>
                <div style={{fontSize:12,color:'var(--ink-4)',lineHeight:1.65}}>{s.desc}</div>
                {i < STAGES.length - 1 && (
                  <div style={{ position:'absolute',top:'50%',right:-8, width:16,height:2,background:'rgba(200,129,26,0.4)', display:'none' }}/>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <div className="text-xs text-ink-3 mb-3.5">
              ✓ Free · No spam &nbsp;·&nbsp; ✓ Advisor responds within 1 hour &nbsp;·&nbsp; ✓ No obligation
            </div>
            <button onClick={() => setOpen(true)} style={{ padding:'14px 32px',borderRadius:'var(--r-sm)', background:'linear-gradient(135deg,#c9922a,#e0a93a)', color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer', boxShadow:'0 4px 24px rgba(201,146,42,0.4)' }}>
              Speak with an Advisor →
            </button>
          </div>
        </div>
      </section>
      <EnquiryModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
