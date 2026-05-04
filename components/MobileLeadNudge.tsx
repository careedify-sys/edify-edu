'use client'

import { useState, useEffect } from 'react'
import { X, Phone, User, MessageCircle } from 'lucide-react'

const DELAY_MS = 12_000 // show after 12 seconds
const SESSION_KEY = 'edify_nudge_shown'

/** Parse the current URL to auto-detect university and program context */
function getPageContext(): { university: string; program: string } {
  const path = window.location.pathname
  const parts = path.split('/').filter(Boolean)

  let university = ''
  let program = ''

  // /universities/amity-university-online/mba/finance
  if (parts[0] === 'universities' && parts[1]) {
    university = parts[1]
      .replace(/-online$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
    if (parts[2]) program = parts[2].toUpperCase()
  }

  // /programs/mba or /programs/mba/finance
  if (parts[0] === 'programs' && parts[1]) {
    program = parts[1].toUpperCase()
  }

  // /blog/amity-online-mba-review-2026
  if (parts[0] === 'blog' && parts[1]) {
    const slug = parts[1]
    if (slug.includes('mba')) program = 'MBA'
    else if (slug.includes('bba')) program = 'BBA'
    else if (slug.includes('mca')) program = 'MCA'
    else if (slug.includes('bca')) program = 'BCA'

    // Try to extract university from slug
    const uniPatterns = [
      ['amity', 'Amity University'],
      ['jain', 'JAIN University'],
      ['bits-pilani', 'BITS Pilani'],
      ['imt-ghaziabad', 'IMT Ghaziabad'],
      ['upes', 'UPES'],
      ['xlri', 'XLRI'],
      ['nmims', 'NMIMS'],
      ['manipal', 'Manipal University'],
      ['symbiosis', 'Symbiosis'],
      ['lpu', 'LPU'],
      ['chandigarh', 'Chandigarh University'],
    ]
    for (const [key, name] of uniPatterns) {
      if (slug.includes(key)) { university = name; break }
    }
  }

  // /coupons/amity-university-online
  if (parts[0] === 'coupons' && parts[1]) {
    university = parts[1]
      .replace(/-online$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
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
    // Only once per session
    if (sessionStorage.getItem(SESSION_KEY)) return

    const timer = setTimeout(() => {
      // Don't show if a modal is already open
      if (document.body.style.overflow === 'hidden') return
      setVisible(true)
      setContext(getPageContext())
      sessionStorage.setItem(SESSION_KEY, '1')
    }, DELAY_MS)

    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    setClosing(true)
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
          source: 'smart_nudge',
        }),
      })
    } catch { /* show success anyway */ }

    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'generate_lead', {
        source: 'smart_nudge',
        university: context.university || 'none',
        program: context.program || 'none',
      })
    }

    setLoading(false)
    setSubmitted(true)
    setTimeout(dismiss, 3000)
  }

  if (!visible) return null

  // Build a contextual headline
  const headline = context.university && context.program
    ? `Interested in ${context.program} from ${context.university}?`
    : context.program
      ? `Exploring ${context.program} options?`
      : context.university
        ? `Interested in ${context.university}?`
        : 'Have questions? Talk to a real counsellor.'

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  return (
    <div
      className={`fixed z-[500] transition-all duration-300 ${closing ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
      style={{
        bottom: isMobile ? 0 : 24,
        right: isMobile ? 0 : 24,
        left: isMobile ? 0 : 'auto',
        width: isMobile ? '100%' : 400,
        animation: closing ? undefined : 'slideUp 0.4s ease-out',
      }}
    >
      {/* Backdrop on mobile */}
      {isMobile && (
        <div className="absolute inset-0 -top-[100vh] bg-black/20" onClick={dismiss} />
      )}

      <div
        className="relative bg-white shadow-[0_-4px_30px_rgba(0,0,0,0.15)] border-t border-slate-100"
        style={{
          borderRadius: isMobile ? '16px 16px 0 0' : 16,
          padding: isMobile ? '16px 20px 24px' : '20px 24px',
        }}
      >
        {/* Drag handle on mobile */}
        {isMobile && <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3" />}

        {/* Close */}
        <button onClick={dismiss} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100" aria-label="Close">
          <X size={16} className="text-slate-400" />
        </button>

        {submitted ? (
          <div className="text-center py-2">
            <div className="text-2xl mb-2">Done!</div>
            <p className="text-sm font-bold text-slate-800">Our counsellor will reach you within 1 hour.</p>
            <p className="text-xs text-slate-400 mt-1">Free call. No obligation. Real advice.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <MessageCircle size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-800 leading-snug">{headline}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Free call within 1 hour. No sales pitch.</p>
              </div>
            </div>

            {/* Auto-detected context badge */}
            {(context.university || context.program) && (
              <div className="flex items-center gap-1.5 mb-3 px-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-semibold border border-green-100">
                  {[context.program, context.university].filter(Boolean).join(' from ')} detected from this page
                </span>
              </div>
            )}

            {/* Social proof */}
            <div className="flex items-center gap-1.5 mb-3 px-1">
              <div className="flex -space-x-1.5">
                {['#f97316', '#10b981', '#6366f1'].map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{ background: c }} />
                ))}
              </div>
              <span className="text-[10px] text-slate-400">230+ students spoke with our counsellors this week</span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:border-orange-400 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="tel"
                    placeholder="WhatsApp number"
                    autoComplete="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:border-orange-400 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shrink-0 transition-opacity"
                  style={{ background: loading ? '#ccc' : '#f97316' }}
                >
                  {loading ? '...' : 'Call Me'}
                </button>
              </div>
            </form>

            <p className="text-[9px] text-slate-300 text-center mt-2.5">
              No spam. No commission. Your data stays with edifyedu.in only.
            </p>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
