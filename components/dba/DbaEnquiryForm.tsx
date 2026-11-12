'use client'

// The DBA offer: "Free DBA Shortlist and Validity Check".
//
// Same lead pipeline as EnquiryModal: POST /api/enquiry, the same gtag
// generate_lead and form_* events, the same orange submit button. It is inline
// rather than a modal because the offer bullets have to sit next to the fields.
//
// No database migration: the two optional selects travel in `notes`, which
// /api/enquiry writes to the Supabase leads.message column, as
// "Qualification: X | Experience: Y".

import { useRef, useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { submitEnquiry } from '@/lib/submitEnquiry'

const QUALIFICATIONS = ["Bachelor's", "Master's", '2-year PGDM', 'Diploma']
const EXPERIENCE = ['0-2', '3-4', '5-7', '8+']

export const DBA_OFFER_BULLETS = [
  "Eligibility check against each programme's criteria",
  'Current fee, with and without immersion',
  'The franchise or partner route question, answered for your shortlist',
  'Refund and deferral terms explained before you pay any booking amount',
]

interface Props {
  /** "dba-pillar", "dba-vs-phd", "dba-fees", "dba-finder" or "dba-{slug}". */
  source: string
  /** Provider name on programme pages; omitted on the pillar. */
  university?: string
  /** Appended to the message, e.g. the finder's filter selections. */
  extraNote?: string
  /** DOM id for the compact CTA to scroll to. */
  id?: string
}

type Status = 'idle' | 'sending' | 'done' | 'error'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', fontSize: 14, borderRadius: 10,
  border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
  color: '#0f172a',
}

export default function DbaEnquiryForm({ source, university, extraNote, id }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [qualification, setQualification] = useState('')
  const [experience, setExperience] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const started = useRef(false)

  function onStart() {
    if (started.current) return
    started.current = true
    trackEvent('form_start', { form_component: 'DbaEnquiryForm' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const p = phone.replace(/\D/g, '').slice(-10)
    if (n.length < 2) { setError('Please enter your full name'); return }
    if (!/^[6-9]\d{9}$/.test(p)) { setError('Enter a valid 10-digit Indian mobile number'); return }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email or leave it blank'); return }
    setError('')
    setStatus('sending')

    const notes = [
      `Qualification: ${qualification || 'Not specified'}`,
      `Experience: ${experience || 'Not specified'}`,
      ...(extraNote ? [extraNote] : []),
    ].join(' | ')

    try {
      const res = await submitEnquiry({
        name: n,
        phone: p,
        email: email.trim(),
        program: 'DBA',
        university: university || '',
        sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/online-dba',
        source,
        notes,
      }, { university: university || 'Not specified' })
      if (!res.ok) {
        setStatus('error')
        trackEvent('form_error', { form_component: 'DbaEnquiryForm' })
        return
      }
      trackEvent('form_submit', { form_component: 'DbaEnquiryForm' })
      setStatus('done')
    } catch {
      setStatus('error')
      trackEvent('form_error', { form_component: 'DbaEnquiryForm' })
    }
  }

  return (
    <section id={id} className="rounded-2xl p-5 sm:p-7 my-8 scroll-mt-24" style={{ background: '#0f172a' }}>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#f97316' }}>
            Free, no commission
          </p>
          <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Free DBA Shortlist and Validity Check
          </h2>
          <ul className="space-y-2.5">
            {DBA_OFFER_BULLETS.map(b => (
              <li key={b} className="flex gap-2 text-[15px] leading-snug" style={{ color: 'rgba(255,255,255,0.88)' }}>
                <CheckCircle size={18} className="shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl p-5" style={{ background: '#ffffff' }}>
          {status === 'done' ? (
            <div className="text-center py-6">
              <CheckCircle size={36} className="mx-auto mb-3" style={{ color: '#10b981' }} />
              <p className="font-bold mb-1" style={{ color: '#0f172a' }}>Request received</p>
              <p className="text-sm" style={{ color: '#64748b' }}>
                Our counsellor will message you on WhatsApp within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} onFocus={onStart} className="flex flex-col gap-2.5" noValidate>
              <label className="sr-only" htmlFor={`${source}-name`}>Name</label>
              <input id={`${source}-name`} style={inputStyle} type="text" placeholder="Your name *" autoComplete="name"
                value={name} onChange={e => setName(e.target.value)} />
              <label className="sr-only" htmlFor={`${source}-phone`}>Mobile number</label>
              <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#f8fafc' }}>
                <span style={{ padding: '11px 10px', fontSize: 13, fontWeight: 600, color: '#94a3b8', borderRight: '1px solid #e2e8f0' }}>+91</span>
                <input id={`${source}-phone`} type="tel" placeholder="WhatsApp number *" autoComplete="tel" maxLength={10}
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={{ flex: 1, padding: '11px 12px', fontSize: 14, border: 'none', background: 'transparent', outline: 'none', color: '#0f172a' }} />
              </div>
              <label className="sr-only" htmlFor={`${source}-email`}>Email (optional)</label>
              <input id={`${source}-email`} style={inputStyle} type="email" placeholder="Email (optional)" autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)} />
              <div className="grid grid-cols-2 gap-2.5">
                <select aria-label="Highest qualification (optional)" style={inputStyle} value={qualification}
                  onChange={e => setQualification(e.target.value)}>
                  <option value="">Highest qualification</option>
                  {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <select aria-label="Years of experience (optional)" style={inputStyle} value={experience}
                  onChange={e => setExperience(e.target.value)}>
                  <option value="">Years of experience</option>
                  {EXPERIENCE.map(x => <option key={x} value={x}>{x} years</option>)}
                </select>
              </div>
              {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}
              {status === 'error' && (
                <p className="text-sm" style={{ color: '#ef4444' }}>
                  Could not submit right now. Please try again, or message us on WhatsApp.
                </p>
              )}
              <button type="submit" disabled={status === 'sending'}
                className="flex items-center justify-center gap-2 font-bold rounded-xl py-3 text-[15px]"
                style={{ background: status === 'sending' ? '#94a3b8' : '#f97316', color: '#ffffff', border: 'none', cursor: 'pointer' }}>
                {status === 'sending' && <Loader2 size={16} className="animate-spin" />}
                Get my free DBA check
              </button>
              <p className="text-xs text-center" style={{ color: '#94a3b8' }}>
                No spam. edifyedu.in earns zero commission.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
