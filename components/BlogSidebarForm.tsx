'use client'
import { useState, useId } from 'react'
import { CheckCircle, Phone, User, BookOpen, MessageCircle } from 'lucide-react'

const WA_NUMBER = '917061285806'

const PROGRAMS = [
  'Online MBA', 'Online MCA', 'Online BBA', 'Online BCA',
  'Online BA', 'Online B.Com', 'Online MA', 'Online M.Com', 'Online MSc',
]

interface Props {
  postTitle?: string
  compact?: boolean   // true = smaller variant for blog post sidebar
}

export default function BlogSidebarForm({ postTitle, compact = false }: Props) {
  const uid = useId()
  const [name,      setName]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [program,   setProgram]   = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const p = phone.trim().replace(/\D/g, '')
    if (!n) { setError('Please enter your name.'); return }
    if (p.length < 10) { setError('Please enter a valid 10-digit number.'); return }
    setError('')
    setLoading(true)

    const sourcePage = typeof window !== 'undefined' ? window.location.pathname : 'blog'
    fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: n,
        phone: p,
        program: program || 'General',
        sourcePage,
        preferredUniversity: postTitle ? `Blog: ${postTitle}` : '',
      }),
    }).catch(() => {})

    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <div className="font-bold text-navy text-sm mb-1">Thank you, {name.trim()}!</div>
        <p className="text-xs text-ink-3 leading-relaxed mb-3">
          Our advisor will call you within <strong>1 hour</strong>.
        </p>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi! I'm ${name.trim()}, interested in ${program || 'online degrees'}. Please guide me.`)}`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-green-600 transition-colors no-underline"
        >
          <MessageCircle size={12} /> Or chat on WhatsApp
        </a>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-amber/30"
      style={{ background: 'linear-gradient(135deg,#0B1D35 0%,#142540 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] font-bold text-amber uppercase tracking-widest">Advisor Available Now</span>
        </div>
        <div className={`font-bold text-white leading-tight ${compact ? 'text-sm' : 'text-base'}`}>
          {compact ? 'Get Expert Guidance' : 'Find Your Perfect Online Degree'}
        </div>
        {!compact && (
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            100+ UGC verified universities · NIRF ranked · Honest advice
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-5 pb-5 flex flex-col gap-2.5">
        {/* Name */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-amber/50 transition-colors">
          <User size={13} className="text-slate-500 shrink-0" />
          <input
            id={`${uid}-name`}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-500 focus:outline-none min-w-0"
          />
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-amber/50 transition-colors">
          <span className="text-xs font-bold text-slate-400 shrink-0">+91</span>
          <span className="w-px h-4 bg-white/10 shrink-0" />
          <Phone size={13} className="text-slate-500 shrink-0" />
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="10-digit mobile"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
            maxLength={10}
            required
            className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-500 focus:outline-none min-w-0"
          />
        </div>

        {/* Program */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-amber/50 transition-colors">
          <BookOpen size={13} className="text-slate-500 shrink-0" />
          <select
            id={`${uid}-program`}
            name="program"
            value={program}
            onChange={e => setProgram(e.target.value)}
            className="flex-1 bg-transparent text-sm focus:outline-none appearance-none cursor-pointer"
            style={{ color: program ? '#fff' : '#6b7280' }}>
            <option value="" style={{ background:'#0B1D35', color:'#9ca3af' }}>I&apos;m interested in…</option>
            {PROGRAMS.map(p => (
              <option key={p} value={p} style={{ background:'#0B1D35', color:'#fff' }}>{p}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-navy text-sm flex items-center justify-center gap-2 transition-all"
          style={{ background: loading ? 'rgba(200,129,26,0.5)' : 'linear-gradient(135deg,#c9922a,#e0a93a)', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading
            ? <><span className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Sending…</>
            : <>Connect with an Advisor →</>
          }
        </button>

        <p className="text-[9px] text-slate-500 text-center leading-relaxed">
          Free · No spam · Counsellor replies within 1 hour
        </p>
      </form>

      {/* Social proof strip */}
      <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between">
        {[['12K+', 'Students helped'], ['100+', 'Universities'], ['Free', 'Advice']].map(([val, label]) => (
          <div key={label} className="text-center">
            <div className="text-xs font-bold text-amber">{val}</div>
            <div className="text-[9px] text-slate-500">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
