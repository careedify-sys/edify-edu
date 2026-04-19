'use client'

import { useState, useEffect, useRef } from 'react'
import { CheckCircle, Loader2, Phone, User, Mail, MapPin } from 'lucide-react'

const PROGRAMS = ['MBA', 'MCA', 'BBA', 'BCA', 'BA', 'B.Com', 'MA', 'M.Com', 'MSc', 'Not sure yet']

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]

interface Props {
  universityName: string
  universityId: string
  defaultProgram?: string
}

export default function StickyLeadCard({ universityName, universityId, defaultProgram }: Props) {
  const [name,      setName]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [email,     setEmail]     = useState('')
  const [state,     setState]     = useState('')
  const [program,   setProgram]   = useState(defaultProgram || '')
  const [notes,     setNotes]     = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  // Listen for programmatic prefill (e.g. from RequestSampleCertCard)
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<{ notes?: string }>).detail
      if (detail?.notes) {
        setNotes(detail.notes)
        setShowNotes(true)
      }
    }
    window.addEventListener('edify:prefill-lead', handler)
    return () => window.removeEventListener('edify:prefill-lead', handler)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const p = phone.trim().replace(/^\+91/, '').replace(/\D/g, '')
    const em = email.trim()
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)

    if (!n)              { setError('Please enter your name.'); return }
    if (p.length !== 10) { setError('Please enter a valid 10-digit mobile number.'); return }
    if (!emailValid)     { setError('Please enter a valid email address.'); return }
    if (!state)          { setError('Please select your state.'); return }

    setError('')
    setLoading(true)

    fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: n,
        phone: p,
        email: em,
        state,
        program: program || defaultProgram || 'General',
        preferredUniversity: universityName,
        universityId,
        notes: notes.trim() || undefined,
        source: 'sticky_card',
        timestamp: new Date().toISOString(),
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
    <div id="sticky-lead-card" className="rounded-xl border border-amber-200 bg-white p-5 shadow-md">
      <div className="mb-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Free Counselling</div>
        <h2 className="text-base font-bold leading-snug" style={{ color: '#0B1533' }}>
          Get an EdifyEdu counsellor call
        </h2>
        <p className="text-xs text-slate-500 mt-1">Free · No commission · Honest comparison</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Name */}
        <div className="relative">
          <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
          />
        </div>

        {/* Phone */}
        <div className="relative">
          <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="tel"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            maxLength={15}
            className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
          />
        </div>

        {/* State */}
        <div className="relative">
          <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={state}
            onChange={e => setState(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white text-slate-700 appearance-none"
          >
            <option value="">Select your state</option>
            {STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Program */}
        <select
          value={program}
          onChange={e => setProgram(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white text-slate-700"
        >
          <option value="">Program interest</option>
          {PROGRAMS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {showNotes && (
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            maxLength={140}
            rows={2}
            placeholder="Your request (optional)"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 resize-none"
          />
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-opacity"
          style={{ background: '#F4A024', color: '#0B1533' }}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          {loading ? 'Submitting...' : 'Get Free Counsellor Call →'}
        </button>
      </form>

      <p className="text-[10px] text-slate-400 mt-3 text-center leading-relaxed">
        By submitting, you agree to receive a counsellor call within 24 hours. EdifyEdu never sells your data.
      </p>
    </div>
  )
}
