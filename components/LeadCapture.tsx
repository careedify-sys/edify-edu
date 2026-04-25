'use client'

import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import EnquiryModal from './EnquiryModalDynamic'

// ── ENTRY POPUP (5s delay on first visit) ──────────────────────
export function EntryPopup() {
  const [show, setShow] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already seen this session
    if (sessionStorage.getItem('edify_entry_popup')) return
    const t = setTimeout(() => {
      setShow(true)
      sessionStorage.setItem('edify_entry_popup', '1')
    }, 5000)
    return () => clearTimeout(t)
  }, [])

  if (!show || dismissed) return null

  return (
    <>
      <div style={{ position:'fixed',inset:0,background:'rgba(11,29,53,0.55)', zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center', padding:'16px', backdropFilter:'blur(4px)' }} onClick={() => setDismissed(true)}>
        <div onClick={e => e.stopPropagation()} style={{ background:'var(--surface)',borderRadius:'var(--r-lg)',padding:'32px 28px',maxWidth:420,width:'100%', boxShadow:'0 24px 80px rgba(11,29,53,0.25)',position:'relative', border:'1px solid rgba(200,129,26,0.15)' }}>
          <button onClick={() => setDismissed(true)} style={{ position:'absolute',top:14,right:14,background:'var(--surface-3)',border:'none', borderRadius:'var(--r-pill)',width:28,height:28,cursor:'pointer',display:'flex', alignItems:'center',justifyContent:'center',color:'var(--ink-3)' }}><X size={14}/></button>

          <div className="text-center mb-5">
            <div className="text-4xl mb-2">🎓</div>
            <div className="text-[11px] font-bold text-sage uppercase tracking-widest mb-2">
              Free · No Spam · No Obligation
            </div>
            <h2 style={{fontSize:20,fontWeight:800,color:'var(--ink)',lineHeight:1.3,margin:'0 0 8px'}}>
              Not sure which university is right for you?
            </h2>
            <p style={{fontSize:13,color:'var(--ink-2)',lineHeight:1.6,margin:0}}>
              Edify evaluates 3–4 stages before recommending any university — goals, budget, eligibility & ROI. Takes 2 minutes.
            </p>
          </div>

          <button onClick={() => { setDismissed(true); setModalOpen(true) }} style={{ width:'100%',padding:'14px 20px',borderRadius:'var(--r-sm)', background:'linear-gradient(135deg,#c9922a,#e0a93a)', color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer', boxShadow:'0 4px 20px rgba(201,146,42,0.35)',marginBottom:10 }}>
            Speak with an Advisor →
          </button>
          <button onClick={() => setDismissed(true)} style={{ width:'100%',padding:10,background:'none',border:'none', color:'var(--ink-4)',fontSize:12,cursor:'pointer' }}>
            I'll explore on my own
          </button>
        </div>
      </div>
      <EnquiryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} sourcePage={typeof window!=="undefined"?window.location.pathname:"website"} />
    </>
  )
}

// ── EXIT INTENT POPUP (mouse leaves viewport top) ──────────────
export function ExitIntentPopup() {
  const [show, setShow] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 10 && !dismissed && !sessionStorage.getItem('edify_exit_popup')) {
      setShow(true)
      sessionStorage.setItem('edify_exit_popup', '1')
    }
  }, [dismissed])

  useEffect(() => {
    if ('ontouchstart' in window) return  // desktop-only
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [handleMouseLeave])

  if (!show || dismissed) return null

  return (
    <>
      <div style={{ position:'fixed',inset:0,background:'rgba(11,29,53,0.6)', zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center', padding:'16px', backdropFilter:'blur(4px)' }} onClick={() => setDismissed(true)}>
        <div onClick={e => e.stopPropagation()} style={{ background:'linear-gradient(160deg,#0B1D35 0%,#142540 100%)', borderRadius:'var(--r-lg)',padding:'32px 28px',maxWidth:420,width:'100%', boxShadow:'0 24px 80px rgba(0,0,0,0.4)',position:'relative', border:'1px solid rgba(200,129,26,0.3)' }}>
          <button onClick={() => setDismissed(true)} style={{ position:'absolute',top:14,right:14,background:'rgba(255,255,255,0.1)',border:'none', borderRadius:'var(--r-pill)',width:28,height:28,cursor:'pointer',display:'flex', alignItems:'center',justifyContent:'center',color:'var(--ink-4)' }}><X size={14}/></button>

          <div className="text-center mb-5">
            <div className="text-4xl mb-2">⚡</div>
            <div style={{fontSize:11,fontWeight:700,color:'var(--amber-vivid)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>
              Wait — Before You Leave
            </div>
            <h2 style={{fontSize:20,fontWeight:800,color:'#fff',lineHeight:1.3,margin:'0 0 8px'}}>
              Get a personalised university shortlist in 2 minutes
            </h2>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.75)',lineHeight:1.6,margin:0}}>
              Free. No spam. Edify evaluates your goals, budget & eligibility before recommending — zero paid placements.
            </p>
          </div>

          <button onClick={() => { setDismissed(true); setModalOpen(true) }} style={{ width:'100%',padding:'14px 20px',borderRadius:'var(--r-sm)', background:'linear-gradient(135deg,#c9922a,#e0a93a)', color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer', boxShadow:'0 4px 20px rgba(201,146,42,0.4)',marginBottom:10 }}>
            Yes, Connect with an Advisor →
          </button>
          <button onClick={() => setDismissed(true)} style={{ width:'100%',padding:10,background:'none',border:'none', color:'var(--ink-3)',fontSize:12,cursor:'pointer' }}>
            No thanks, I'm just browsing
          </button>
        </div>
      </div>
      <EnquiryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} sourcePage={typeof window!=="undefined"?window.location.pathname:"website"} />
    </>
  )
}

// ── MID-SCROLL TRIGGER (fires at 50% scroll depth) ─────────────
export function MidScrollPopup({ universityName }: { universityName?: string }) {
  const [show, setShow] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('edify_midscroll')) return
    function onScroll() {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      if (scrolled > 0.5) {
        setShow(true)
        sessionStorage.setItem('edify_midscroll', '1')
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show || dismissed) return null

  return (
    <>
      <div style={{ position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)', zIndex:'var(--z-modal)',width:'min(420px, calc(100vw - 32px))', background:'var(--surface)',borderRadius:'var(--r-md)',padding:'20px 20px', boxShadow:'0 8px 40px rgba(11,29,53,0.2)', border:'1px solid rgba(200,129,26,0.25)', animation:'slideUp 0.3s ease' }}>
        <button onClick={() => setDismissed(true)} style={{ position:'absolute',top:10,right:10,background:'none',border:'none', cursor:'pointer',color:'var(--ink-4)',padding:4 }}><X size={14}/></button>

        <div className="flex gap-3 items-start">
          <div className="text-[28px] shrink-0">💡</div>
          <div>
            <div className="text-[13px] font-bold text-navy mb-1">
              {universityName ? `Considering ${universityName.split(' ')[0]}?` : 'Need help choosing?'}
            </div>
            <div className="text-xs text-ink-3 leading-snug mb-3">
              Edify advisors compare fees, NIRF ranks & placement data to find your best match — free.
            </div>
            <button onClick={() => { setDismissed(true); setModalOpen(true) }} style={{ padding:'9px 16px',borderRadius:'var(--r-xs)', background:'linear-gradient(135deg,#c9922a,#e0a93a)', color:'#fff',fontWeight:700,fontSize:12,border:'none',cursor:'pointer' }}>
              Connect with an Advisor →
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
      <EnquiryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} universityName={universityName} sourcePage={typeof window!=="undefined"?window.location.pathname:"website"} />
    </>
  )
}

// ── SCHOLARSHIP POPUP (appears after 40% scroll) ─────────────
export function ScholarshipPopup({ universityName }: { universityName?: string }) {
  const [show, setShow] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('edify_scholarship')) return
    function onScroll() {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      if (scrolled > 0.4) {
        setShow(true)
        sessionStorage.setItem('edify_scholarship', '1')
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show || dismissed) return null

  return (
    <>
      <div style={{ 
        position:'fixed', bottom:100, right:20, zIndex:150,
        width:'min(320px, calc(100vw - 40px))',
        background:'linear-gradient(135deg,#0B1D35,#142540)',
        borderRadius:'var(--r-md)', padding:'18px 20px',
        boxShadow:'0 8px 40px rgba(11,29,53,0.3)',
        border:'1px solid rgba(200,129,26,0.3)',
        animation:'slideInRight 0.3s ease'
      }}>
        <button onClick={() => setDismissed(true)} style={{ 
          position:'absolute', top:10, right:10, background:'rgba(255,255,255,0.1)',
          border:'none', cursor:'pointer', color:'var(--ink-4)', padding:4, borderRadius:6
        }}><X size={14}/></button>

        <div className="flex gap-3 items-start">
          <div className="text-[28px] shrink-0">🎁</div>
          <div>
            <div className="text-[13px] font-bold text-white mb-1">
              Check Scholarship Eligibility
            </div>
            <div className="text-xs text-slate-400 leading-snug mb-3">
              {universityName 
                ? `${universityName.split(' ')[0]} offers scholarships up to ₹50,000. Check if you qualify.`
                : 'Many universities offer scholarships up to ₹50,000. Check your eligibility now.'}
            </div>
            <button onClick={() => { setDismissed(true); setModalOpen(true) }} style={{ 
              padding:'9px 16px', borderRadius:'var(--r-xs)',
              background:'linear-gradient(135deg,#c9922a,#e0a93a)',
              color:'#fff', fontWeight:700, fontSize:12, border:'none', cursor:'pointer'
            }}>
              Get Scholarship Details →
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes slideInRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <EnquiryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} universityName={universityName} sourcePage={typeof window!=="undefined"?window.location.pathname:"website"} />
    </>
  )
}

// ── STICKY BOTTOM BAR (mobile + desktop) ───────────────────────
export function StickyBottomBar({ label, universityName }: { label?: string; universityName?: string }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() { setVisible(window.scrollY > 300) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Desktop only — hidden on mobile where BottomNav already has Call Us */}
      <div className="hidden lg:block" style={{
        position: 'fixed', bottom: 24, right: 20, zIndex: 200,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(80px) scale(0.8)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 20px', borderRadius: 50,
            background: 'linear-gradient(135deg,#c9922a,#e0a93a)',
            color: '#fff', fontWeight: 700, fontSize: 14, border: 'none',
            cursor: 'pointer', whiteSpace: 'nowrap',
            boxShadow: '0 4px 24px rgba(201,146,42,0.55)',
          }}
        >
          🎓 {label || (universityName ? `Speak with an ${universityName.split(' ')[0]} Advisor` : 'Speak with an Advisor')}
        </button>
      </div>
      <EnquiryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} universityName={universityName} sourcePage={typeof window!=="undefined"?window.location.pathname:"website"} />
    </>
  )
}
