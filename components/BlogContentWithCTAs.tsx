'use client'

import { useState } from 'react'
import BlogCTACard from './BlogCTACard'

type Variant = 'compare' | 'counsel' | 'verify' | 'shortlist'

const CTA_TOKEN_RE = /<div class="blog-cta-spot" data-variant="(\w+)"><\/div>/g
const CTA_BOX_RE = /<div class="cta-box"[\s\S]*?<\/div>/g

function InlineLeadForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [program, setProgram] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setStatus('sending')
    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          program: program || 'Not specified',
          sourcePage: window.location.pathname,
          source: 'blog_inline_form',
        }),
      })
    } catch { /* show success anyway */ }
    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div className="my-8 rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
        <div className="text-3xl mb-3">Done!</div>
        <p className="text-sm font-bold text-green-800 mb-1">Our counsellor will call you within 1 hour.</p>
        <p className="text-xs text-green-600">Free call. No obligation. No spam.</p>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl overflow-hidden" style={{ background: '#0f172a' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #f97316, #B8892A)' }} />
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#10b981' }}>Free Counselling</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1 leading-tight">Talk to a real counsellor. No sales pitch.</h3>
        <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Get honest advice on fees, placements, and which program actually fits your career goal. We earn zero commission from any university.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Your name"
              autoComplete="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <div className="flex-1 flex" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}>
              <span className="px-3 py-3 text-sm font-semibold shrink-0" style={{ color: 'rgba(255,255,255,0.4)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>+91</span>
              <input
                type="tel"
                placeholder="WhatsApp number"
                autoComplete="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                required
                className="flex-1 px-3 py-3 rounded-r-xl text-sm text-white placeholder:text-white/30 focus:outline-none bg-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={program}
              onChange={e => setProgram(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: program ? '#fff' : 'rgba(255,255,255,0.3)' }}
            >
              <option value="">Select program (optional)</option>
              <option value="MBA" style={{ color: '#0f172a' }}>Online MBA</option>
              <option value="MCA" style={{ color: '#0f172a' }}>Online MCA</option>
              <option value="BBA" style={{ color: '#0f172a' }}>Online BBA</option>
              <option value="BCA" style={{ color: '#0f172a' }}>Online BCA</option>
              <option value="Other" style={{ color: '#0f172a' }}>Other</option>
            </select>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="px-8 py-3 rounded-xl text-sm font-bold text-white shrink-0 transition-opacity"
              style={{ background: status === 'sending' ? '#666' : '#f97316' }}
            >
              {status === 'sending' ? 'Sending...' : 'Get Free Advice →'}
            </button>
          </div>
        </form>
        <p className="text-[10px] mt-3 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
          edifyedu.in earns zero commissions. Your data stays with us only.
        </p>
      </div>
    </div>
  )
}

export default function BlogContentWithCTAs({ html }: { html: string }) {
  // Split HTML at CTA tokens AND cta-box divs
  type Part = { type: 'html' | 'cta' | 'inline-form'; content: string; variant?: Variant }
  const parts: Part[] = []
  let lastIndex = 0

  // Combine both patterns
  const combined = new RegExp(`${CTA_TOKEN_RE.source}|${CTA_BOX_RE.source}`, 'g')
  let match: RegExpExecArray | null

  while ((match = combined.exec(html)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'html', content: html.slice(lastIndex, match.index) })
    }
    if (match[1]) {
      // blog-cta-spot token
      parts.push({ type: 'cta', content: '', variant: match[1] as Variant })
    } else {
      // cta-box div — replace with inline form
      parts.push({ type: 'inline-form', content: '' })
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < html.length) {
    parts.push({ type: 'html', content: html.slice(lastIndex) })
  }

  // If no tokens found, render plain HTML
  if (parts.length === 0) {
    return <div className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div className="prose-article">
      {parts.map((part, i) =>
        part.type === 'html' ? (
          <div key={i} dangerouslySetInnerHTML={{ __html: part.content }} />
        ) : part.type === 'inline-form' ? (
          <InlineLeadForm key={i} />
        ) : (
          <BlogCTACard key={i} variant={part.variant || 'counsel'} />
        )
      )}
    </div>
  )
}
