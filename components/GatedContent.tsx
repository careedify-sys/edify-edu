'use client'

import { useState } from 'react'
import { Lock, Unlock, Shield, Tag, ChevronRight } from 'lucide-react'

interface GatedContentProps {
  universityName: string
  programName?: string
  hints?: string[]
  feeMin?: number
  feeMax?: number
  emiFrom?: number
}

const DEFAULT_HINTS = [
  '🎓 Merit scholarship — up to 25% fee waiver for eligible profiles',
  '🏦 No-cost EMI — 12 to 24 month plans via partner banks',
  '💼 Alumni referral discount — ₹8,000 off on verified referral',
]

function formatFeeLocal(n?: number) {
  if (!n) return ''
  return n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${Math.round(n/1000)}K`
}

export default function GatedContent({
  universityName, programName = 'MBA',
  hints = DEFAULT_HINTS, feeMin, feeMax, emiFrom,
}: GatedContentProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string,string>>({})
  const uniShort = universityName.split(' ').slice(0, 2).join(' ')

  function validate() {
    const e: Record<string,string> = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Enter your full name'
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g,''))) e.phone = 'Enter valid 10-digit mobile'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter valid email'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true); setErrors({})
    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, university: universityName,
          program: programName, source: 'gated_scholarship',
        }),
      })
    } catch {}
    setSubmitting(false)
    setUnlocked(true)
  }

  return (
    <div style={{ borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid #E2E8F4', background: '#fff' }}>

      {/* ── Header bar ── */}
      <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, background: unlocked ? 'rgba(31,107,82,0.06)' : 'rgba(200,129,26,0.06)', borderBottom: '1px solid #E2E8F4', }}>
        {unlocked
          ? <Unlock size={13} color="var(--sage)" />
          : <Lock size={13} color="var(--amber-text)" />}
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: unlocked ? 'var(--sage)' : 'var(--amber-text)' }}>
          {unlocked ? 'Scholarship Details Unlocked' : 'Scholarships & Fee Discounts Available'}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 'var(--r-lg)', fontWeight: 700, background: unlocked ? 'rgba(31,107,82,0.1)' : 'rgba(200,129,26,0.1)', color: unlocked ? 'var(--sage)' : 'var(--amber-text)' }}>
          {hints.length} offers
        </span>
      </div>

      {/* ── Fee overview strip (always visible) ── */}
      {(feeMin || feeMax) && (
        <div style={{ padding: '12px 20px', display: 'flex', gap: 20, flexWrap: 'wrap', borderBottom: '1px solid #F1F5F9', background: 'var(--surface-2)', }}>
          {[
            { icon: '💰', label: 'Total Fee', value: feeMin && feeMax ? `${formatFeeLocal(feeMin)} – ${formatFeeLocal(feeMax)}` : formatFeeLocal(feeMin || feeMax) },
            emiFrom ? { icon: '🏦', label: 'EMI from', value: `₹${emiFrom.toLocaleString()}/mo` } : null,
            { icon: '🔒', label: 'Discounts', value: 'See below' },
          ].filter(Boolean).map((s: any) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span className="text-base">{s.icon}</span>
              <div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Blurred hints + unlock form ── */}
      <div style={{ position: 'relative', padding: '16px 20px' }}>
        {/* Hints list */}
        <div style={{ filter: unlocked ? 'none' : 'blur(4px)', transition: 'filter 0.4s', userSelect: unlocked ? 'auto' : 'none', pointerEvents: unlocked ? 'auto' : 'none', }}>
          {hints.map((hint, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: i < hints.length - 1 ? '1px solid #f1f5f9' : 'none', }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>{hint.split(' ')[0]}</span>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, fontWeight: 500 }}>
                {hint.split(' ').slice(1).join(' ')}
              </div>
            </div>
          ))}
        </div>

        {/* Unlock overlay — shown only when locked */}
        {!unlocked && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.97) 45%)', display: 'flex', alignItems: 'flex-end', padding: '16px', }}>
            <div style={{ width: '100%', background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #E2E8F4', boxShadow: '0 8px 32px rgba(11,29,53,0.08)', }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(200,129,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, }}>🔓</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>
                    Check your scholarship eligibility
                  </div>
                  <div className="text-[11px] text-ink-3 leading-snug">
                    An advisor will share all available discounts for {uniShort} {programName} — takes 2 minutes.
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {(['name', 'phone', 'email'] as const).map(field => (
                  <div key={field}>
                    <input
                      type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                      placeholder={field === 'name' ? 'Your full name' : field === 'phone' ? '10-digit mobile' : 'Email address'}
                      value={form[field]}
                      onChange={e => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors(ev => ({ ...ev, [field]: '' })) }}
                      style={{
                        padding: '10px 13px', borderRadius: 'var(--r-xs)', fontSize: 13, width: '100%',
                        border: `1px solid ${errors[field] ? 'var(--red-light)' : 'var(--border)'}`,
                        outline: 'none', boxSizing: 'border-box',
                        background: errors[field] ? 'var(--red-light)' : '#fff',
                      }}
                    />
                    {errors[field] && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 2 }}>{errors[field]}</div>}
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit} disabled={submitting}
                style={{ width: '100%', padding: '11px', borderRadius: 10, background: submitting ? 'var(--ink-4)' : 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, }}
              >
                {submitting ? 'Checking...' : <><Tag size={13}/> Reveal Scholarship Details →</>}
              </button>

              <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Shield size={10}/> Your details are shared only with your advisor — never sold
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Unlocked confirmation ── */}
      {unlocked && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(31,107,82,0.15)', background: 'rgba(31,107,82,0.06)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--sage)', fontWeight: 600, }}>
          <span className="text-base"><span aria-hidden="true">✓</span></span>
          An advisor will confirm your exact discount within 24 hours on {form.phone}
        </div>
      )}
    </div>
  )
}
