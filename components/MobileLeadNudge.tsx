'use client'

import { useState, useEffect } from 'react'
import { X, Phone, User, MessageCircle } from 'lucide-react'

const SESSION_KEY = 'edify_nudge_shown'
const DISMISS_KEY = 'edify_nudge_dismissed'
const DISMISS_DAYS = 7
const MIN_TIME_MS = 30_000     // 30 seconds on page
const MIN_SCROLL_PCT = 60      // 60% scroll depth

/** Parse the current URL to auto-detect university and program context */
function getPageContext(): { university: string; program: string } {
  const path = window.location.pathname
  const parts = path.split('/').filter(Boolean)
  let university = ''
  let program = ''

  if (parts[0] === 'universities' && parts[1]) {
    university = parts[1].replace(/-online$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    if (parts[2]) program = parts[2].toUpperCase()
  }
  if (parts[0] === 'programs' && parts[1]) program = parts[1].toUpperCase()
  if (parts[0] === 'blog' && parts[1]) {
    const slug = parts[1]
    if (slug.includes('mba')) program = 'MBA'
    else if (slug.includes('bba')) program = 'BBA'
    else if (slug.includes('mca')) program = 'MCA'
    else if (slug.includes('bca')) program = 'BCA'
    const uniPatterns: [string, string][] = [
      ['amity', 'Amity University'], ['jain', 'JAIN University'], ['bits-pilani', 'BITS Pilani'],
      ['imt-ghaziabad', 'IMT Ghaziabad'], ['upes', 'UPES'], ['xlri', 'XLRI'],
      ['nmims', 'NMIMS'], ['manipal', 'Manipal University'], ['symbiosis', 'Symbiosis'],
      ['lpu', 'LPU'], ['chandigarh', 'Chandigarh University'],
    ]
    for (const [key, name] of uniPatterns) {
      if (slug.includes(key)) { university = name; break }
    }
  }
  if (parts[0] === 'coupons' && parts[1]) {
    university = parts[1].replace(/-online$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }
  return { university, program }
}

export default function MobileLeadNudge() {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState({ university: '', program: '' })

  useEffect(() => {
    // Mobile only
    if (window.innerWidth >= 768) return
    // Once per session
    if (sessionStorage.getItem(SESSION_KEY)) return
    // Check 7-day dismiss
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      if (Date.now() - dismissedAt < DISMISS_DAYS * 86400000) return
    }

    const startTime = Date.now()
    let scrollMet = false
    let timeMet = false
    let shown = false

    function tryShow() {
      if (shown) return
      if (document.body.style.overflow === 'hidden') return // modal open
      if (scrollMet && timeMet) {
        shown = true
        setVisible(true)
        setContext(getPageContext())
        sessionStorage.setItem(SESSION_KEY, '1')
      }
    }

    function onScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0 && (scrollTop / docHeight) * 100 >= MIN_SCROLL_PCT) {
        scrollMet = true
        tryShow()
      }
    }

    const timeTimer = setTimeout(() => {
      timeMet = true
      tryShow()
    }, MIN_TIME_MS)

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(timeTimer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  function dismiss() {
    setClosing(true)
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setTimeout(() => setVisible(false), 300)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const p = phone.trim().replace(/\D/g, '').slice(-10)
    if (!n || !/^[6-9]\d{9}$/.test(p)) return
    setLoading(true)

    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: n,
          phone: p,
          program: context.program || undefined,
          preferredUniversity: context.university || undefined,
          sourcePage: window.location.pathname,
          source: 'mobile_nudge',
        }),
      })
    } catch { /* show success */ }

    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'generate_lead', { source: 'mobile_nudge' })
    }

    setLoading(false)
    setSubmitted(true)
    setTimeout(dismiss, 3000)
  }

  if (!visible) return null

  const headline = context.university && context.program
    ? `Interested in ${context.program} from ${context.university}?`
    : context.program
      ? `Exploring ${context.program} options?`
      : context.university
        ? `Interested in ${context.university}?`
        : 'Have questions? Talk to a real counsellor.'

  return (
    <div
      className={`fixed left-0 right-0 transition-transform duration-300 ${closing ? 'translate-y-full' : 'translate-y-0'}`}
      style={{
        bottom: 68, // BottomNav height (~60px) + 8px gap
        zIndex: 250,
        animation: closing ? undefined : 'nudgeSlideUp 0.4s ease-out',
      }}
    >
      <div className="relative bg-white mx-3 rounded-2xl shadow-[0_-2px_20px_rgba(0,0,0,0.12)] border border-slate-100 px-5 pb-5 pt-4">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
          aria-label="Close"
        >
          <X size={14} className="text-slate-500" />
        </button>

        {submitted ? (
          <div className="text-center py-2">
            <div className="text-2xl mb-2">Done!</div>
            <p className="text-sm font-bold text-slate-800">Our counsellor will reach you within 1 hour.</p>
            <p className="text-xs text-slate-400 mt-1">Free call. No obligation. Real advice.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <MessageCircle size={16} className="text-orange-500" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-800 leading-snug">{headline}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Free call within 1 hour. No sales pitch.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text" placeholder="Your name" autoComplete="name"
                  value={name} onChange={e => setName(e.target.value)} required
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:border-orange-400 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="tel" placeholder="WhatsApp number" autoComplete="tel"
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10} required
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:border-orange-400 focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shrink-0"
                  style={{ background: loading ? '#ccc' : '#f97316' }}
                >
                  {loading ? '...' : 'Call Me'}
                </button>
              </div>
            </form>
            <p className="text-[9px] text-slate-300 text-center mt-2">
              No spam. edifyedu.in earns zero commissions.
            </p>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes nudgeSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
