'use client'

import { useState, useEffect } from 'react'
import { X, Phone, User, MessageCircle } from 'lucide-react'

const DELAY_MS = 15_000 // show after 15 seconds
const SESSION_KEY = 'edify_nudge_shown'

export default function MobileLeadNudge() {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Only on mobile-width screens
    if (window.innerWidth > 768) return
    // Only once per session
    if (sessionStorage.getItem(SESSION_KEY)) return

    const timer = setTimeout(() => {
      // Don't show if an enquiry modal is already open
      if (document.body.style.overflow === 'hidden') return
      setVisible(true)
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
          sourcePage: window.location.pathname,
          source: 'mobile_nudge',
        }),
      })
    } catch { /* show success anyway */ }

    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'generate_lead', {
        source: 'mobile_nudge',
        form_type: 'mobile_nudge',
      })
    }

    setLoading(false)
    setSubmitted(true)
    setTimeout(dismiss, 3000)
  }

  if (!visible) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[500] transition-transform duration-300 ${closing ? 'translate-y-full' : 'translate-y-0'}`}
      style={{ animation: closing ? undefined : 'slideUp 0.4s ease-out' }}
    >
      {/* Backdrop tap to close */}
      <div className="absolute inset-0 -top-[100vh] bg-black/20" onClick={dismiss} />

      <div className="relative bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] border-t border-slate-100 px-5 pb-6 pt-4">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100"
          aria-label="Close"
        >
          <X size={16} className="text-slate-400" />
        </button>

        {submitted ? (
          <div className="text-center py-3">
            <div className="text-2xl mb-2">Done!</div>
            <p className="text-sm font-bold text-slate-800">
              Our counsellor will reach you within 1 hour.
            </p>
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
                <p className="text-[13px] font-bold text-slate-800 leading-snug">
                  Have questions? Talk to a real counsellor.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Free call within 1 hour. No sales pitch. Just honest advice.
                </p>
              </div>
            </div>

            {/* Social proof line */}
            <div className="flex items-center gap-1.5 mb-3 px-1">
              <div className="flex -space-x-1.5">
                {['#f97316', '#10b981', '#6366f1'].map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{ background: c }} />
                ))}
              </div>
              <span className="text-[10px] text-slate-400">
                230+ students spoke with our counsellors this week
              </span>
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
              No spam. No commission. Your data stays with EdifyEdu only.
            </p>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
