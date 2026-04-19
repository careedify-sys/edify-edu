'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Phone, User } from 'lucide-react'

const PROGRAMS = ['MBA', 'MCA', 'BBA', 'BCA', 'BA', 'B.Com', 'MA', 'M.Com', 'MSc', 'Not sure yet']

interface Props {
  universityName: string
  universityId: string
  defaultProgram?: string
}

export default function StickyLeadCard({ universityName, universityId, defaultProgram }: Props) {
  const [name,      setName]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [program,   setProgram]   = useState(defaultProgram || '')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const p = phone.trim().replace(/\D/g, '')
    if (!n)           { setError('Please enter your name.'); return }
    if (p.length < 10){ setError('Please enter a valid 10-digit number.'); return }
    setError('')
    setLoading(true)

    const sourcePage = typeof window !== 'undefined' ? window.location.pathname : 'program-page'

    fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: n,
        phone: p,
        program: program || defaultProgram || 'General',
        preferredUniversity: universityName,
        universityId,
        sourcePage,
      }),
    }).catch(() => {})

    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center shadow-md">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <div className="font-bold text-green-800 text-sm mb-1">Submitted, {name.trim()}!</div>
        <p className="text-xs text-green-600 leading-relaxed">
          Our counsellor will call you within <strong>24 hours</strong>. Free call, no commission, honest advice.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-md">
      {/* Header */}
      <div className="mb-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Free Counselling</div>
        <h2 className="text-base font-bold leading-snug" style={{ color: '#0B1533' }}>
          Get an EdifyEdu counsellor call
        </h2>
        <p className="text-xs text-slate-500 mt-1">Free · No commission · Honest comparison</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
          />
        </div>

        <div className="relative">
          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="tel"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            maxLength={15}
            className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
          />
        </div>

        <select
          value={program}
          onChange={e => setProgram(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white text-slate-700"
        >
          <option value="">Select program interest</option>
          {PROGRAMS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-opacity"
          style={{ background: '#F4A024', color: '#0B1533' }}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          {loading ? 'Submitting...' : 'Book Free Counselling Call'}
        </button>
      </form>

      <p className="text-[10px] text-slate-400 mt-3 text-center">
        Edify charges no fees. We compare universities independently. No paid rankings.
      </p>
    </div>
  )
}
