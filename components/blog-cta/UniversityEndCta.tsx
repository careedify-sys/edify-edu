'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Send, MessageCircle } from 'lucide-react'
import type { UniversityBlogCtaConfig } from '@/lib/university-blog-cta'

export default function UniversityEndCta({ config }: { config: UniversityBlogCtaConfig }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const tagBase = config.sourceNamespace ? `${config.sourceNamespace}_end_close` : 'end_close'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !/^[6-9]\d{9}$/.test(phone)) return
    setStatus('submitting')
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          program: 'MBA',
          preferredUniversity: config.universityName,
          sourcePage: tagBase,
          source: tagBase,
        }),
      })
      if (!res.ok) { setStatus('error'); return }
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', {
          university: config.universityName,
          program: 'MBA',
          source: tagBase,
        })
      }
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div
      id={`${config.shortName.toLowerCase()}-end-close`}
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
          {config.endHeading}
        </h2>
        <p className="text-sm sm:text-base mb-5" style={{ color: 'rgba(255,255,255,0.72)' }}>
          {config.endSubheading}
        </p>

        <ul className="space-y-2.5 mb-6">
          {config.endTrustBullets.map((t) => (
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
              Details on WhatsApp within 1 hour. Zero spam, promise.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917061285806'}?text=${encodeURIComponent(`Hi! I'm ${name} and I'm considering ${config.shortName} Online MBA. Please call me.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs mt-3 no-underline hover:underline"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              <MessageCircle size={13} />
              Or chat on WhatsApp for faster reply
            </a>
          </div>
        ) : status === 'error' ? (
          <div
            className="rounded-xl p-5 text-center"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)' }}
          >
            <p className="text-sm font-semibold text-white mb-3">
              Couldn&apos;t submit right now. Message us directly on WhatsApp instead.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917061285806'}?text=${encodeURIComponent(`Hi, I tried the form on edifyedu.in but it didn't go through. I want the fee sheet for ${config.universityName} MBA.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold no-underline"
              style={{ background: '#25D366', color: '#fff' }}
            >
              <MessageCircle size={16} />
              WhatsApp Us
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3" data-cta={`${tagBase}_form`}>
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

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0B1D35' }}
              data-cta={`${tagBase}_submit`}
            >
              {status === 'submitting' ? (
                <span className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
              ) : (
                <>
                  Get My Fee Sheet + Discount Code
                  <Send size={14} />
                </>
              )}
            </button>

            <p className="text-[11px] text-center pt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Free. No spam. Edify earns zero commission from any university.
            </p>
          </form>
        )}

        <div className="mt-7 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {`Or explore ${config.shortName} programmes directly`}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {config.secondaryLinks.map((l) => (
              <Link
                key={l.program}
                href={`/universities/${config.universityId}/${l.program}`}
                data-cta={`${tagBase}_link_${l.program}`}
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
