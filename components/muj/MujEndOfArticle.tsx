'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Send, MessageCircle, Clock } from 'lucide-react'

const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning (9 AM – 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (12 PM – 4 PM)' },
  { value: 'evening', label: 'Evening (4 PM – 8 PM)' },
  { value: 'anytime', label: 'Anytime' },
]

const TRUST_BULLETS = [
  "We'll tell you if MUJ is actually your best option (sometimes it isn't)",
  "We'll share current admission discounts and scholarship eligibility",
  "Zero commission. We don't take a cut from any university",
  "Zero pushy sales calls. You ask, we answer, you decide",
]

const SECONDARY_LINKS = [
  { href: '/universities/manipal-university-jaipur-online/mba', label: 'MUJ Online MBA Programmes' },
  { href: '/universities/manipal-university-jaipur-online/bba', label: 'MUJ Online BBA Programmes' },
  { href: '/universities/manipal-university-jaipur-online/bca', label: 'MUJ Online BCA Programmes' },
]

export default function MujEndOfArticle() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [bestTime, setBestTime] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !/^[6-9]\d{9}$/.test(phone)) return
    setStatus('submitting')
    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          program: 'MBA',
          preferredUniversity: 'Manipal University Jaipur Online',
          bestTimeToCall: bestTime || 'anytime',
          sourcePage: 'muj_blog_end_close',
          source: 'muj_blog_end_close',
        }),
      })
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', {
          university: 'Manipal University Jaipur Online',
          program: 'MBA',
          source: 'muj_blog_end_close',
        })
      }
    } catch { /* show success anyway */ }
    setStatus('success')
  }

  return (
    <div
      id="muj-end-close"
      className="rounded-2xl my-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0B1D35 0%, #142540 100%)',
        border: '1px solid rgba(212,146,42,0.25)',
        boxShadow: '0 8px 32px rgba(11,29,53,0.18)',
      }}
    >
      <div style={{ height: 3, background: 'linear-gradient(90deg,#c9922a,#e0a93a)' }} />
      <div className="p-6 sm:p-8">
        <h2
          className="font-display font-extrabold text-white leading-tight mb-2"
          style={{ fontSize: 'clamp(1.4rem, 3.2vw, 2rem)' }}
        >
          Ready to apply to MUJ Online?
        </h2>
        <p className="text-sm sm:text-base mb-5" style={{ color: 'rgba(255,255,255,0.72)' }}>
          Before you click 'Apply Now' on the official portal, talk to us first.
        </p>

        <ul className="space-y-2.5 mb-6">
          {TRUST_BULLETS.map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
              <span>{t}</span>
            </li>
          ))}
        </ul>

        {status === 'success' ? (
          <div
            className="rounded-xl p-5 text-center"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)' }}
          >
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full" style={{ background: 'rgba(34,197,94,0.2)' }}>
              <CheckCircle2 size={24} style={{ color: '#22c55e' }} />
            </div>
            <h3 className="text-white font-bold text-lg mb-1.5">Thanks {name.split(' ')[0] || 'there'}, got it.</h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              An Edify counsellor will call you {bestTime ? `during ${TIME_OPTIONS.find((o) => o.value === bestTime)?.label.split(' (')[0].toLowerCase()}` : 'within 1 hour'}. Zero spam, promise.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917061285806'}?text=${encodeURIComponent(`Hi! I'm ${name} and I'm considering MUJ Online MBA. Please call me.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs mt-3 no-underline hover:underline"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              <MessageCircle size={13} />
              Or chat on WhatsApp for faster reply
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3" data-cta="muj_blog_end_close_form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-amber/40"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
              <div
                className="flex rounded-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <span
                  className="px-3 py-3 text-sm font-semibold shrink-0"
                  style={{ color: 'rgba(255,255,255,0.45)', borderRight: '1px solid rgba(255,255,255,0.12)' }}
                >
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="WhatsApp number"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 px-3 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <select
                  value={bestTime}
                  onChange={(e) => setBestTime(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber/40 cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: bestTime ? '#fff' : 'rgba(255,255,255,0.4)',
                  }}
                  data-cta="muj_blog_end_close_besttime"
                >
                  <option value="">Best time to call (optional)</option>
                  {TIME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} style={{ color: '#0B1D35' }}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>▼</span>
              </div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0B1D35' }}
                data-cta="muj_blog_end_close_submit"
              >
                {status === 'submitting' ? (
                  <span className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                ) : (
                  <>
                    Talk to Counsellor
                    <Send size={14} />
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-center pt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Free · No spam · Edify earns zero commission from any university
            </p>
          </form>
        )}

        <div className="mt-7 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Or explore MUJ programmes directly
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SECONDARY_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-cta={`muj_blog_end_close_link_${l.href.split('/').pop()}`}
                className="text-center px-3 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold no-underline transition-colors hover:bg-white/[0.12]"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                {l.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
