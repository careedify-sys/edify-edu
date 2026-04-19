'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, Phone, User, Mail, MapPin, Copy, Check } from 'lucide-react'
import type { Coupon } from '@/lib/coupons'

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
  coupon: Coupon | null | undefined
  universityId: string
  program: string
  universityName: string
}

type CardState = 'locked' | 'form_open' | 'unlocked'

// CSS confetti burst — 12 divs, pure CSS
const CONFETTI_COLORS = ['#F4A024', '#10b981', '#f97316', '#ffffff', '#fbbf24', '#34d399']

function ConfettiBurst() {
  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translate(0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--tr)); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          animation: confetti-fall 1.5s ease-out forwards;
          pointer-events: none;
        }
      `}</style>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * 360
        const dist  = 40 + Math.random() * 40
        const tx    = Math.round(Math.cos((angle * Math.PI) / 180) * dist)
        const ty    = Math.round(Math.sin((angle * Math.PI) / 180) * dist - 20)
        const tr    = Math.round(Math.random() * 360)
        return (
          <div
            key={i}
            className="confetti-piece"
            style={{
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              top: '50%', left: '50%',
              marginTop: -4, marginLeft: -4,
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
              '--tr': `${tr}deg`,
              animationDelay: `${i * 60}ms`,
            } as React.CSSProperties}
          />
        )
      })}
    </>
  )
}

// Slot-machine character reveal
function SlotReveal({ code }: { code: string }) {
  return (
    <>
      <style>{`
        @keyframes slot-in {
          from { transform: translateY(-16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .slot-char {
          display: inline-block;
          animation: slot-in 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      <div className="font-mono font-black tracking-widest text-base sm:text-lg" style={{ color: '#0B1533' }}>
        {code.split('').map((char, i) => (
          <span
            key={i}
            className="slot-char"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {char}
          </span>
        ))}
      </div>
    </>
  )
}

// The unlock form modal
function UnlockModal({
  onClose,
  onSuccess,
  universityName,
  program,
  universityId,
}: {
  onClose: () => void
  onSuccess: () => void
  universityName: string
  program: string
  universityId: string
}) {
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [email,   setEmail]   = useState('')
  const [state,   setState]   = useState('')
  const [prog,    setProg]    = useState(program)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  // Lock scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n  = name.trim()
    const p  = phone.replace(/^\+91/, '').replace(/\D/g, '')
    const em = email.trim()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)

    if (!n)              { setError('Please enter your name.'); return }
    if (p.length !== 10) { setError('Please enter a valid 10-digit number.'); return }
    if (!emailOk)        { setError('Please enter a valid email.'); return }
    if (!state)          { setError('Please select your state.'); return }

    setError('')
    setLoading(true)

    fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: n, phone: p, email: em, state,
        program: prog,
        preferredUniversity: universityName,
        universityId,
        source: 'coupon_unlock',
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {})

    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    onSuccess()
  }

  const content = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

      {/* Card */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Unlock coupon"
        style={{
          position: 'relative', zIndex: 1,
          background: '#fff', borderRadius: 16,
          width: '100%', maxWidth: 420,
          padding: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          maxHeight: '90vh', overflowY: 'auto',
          animation: 'modal-in 0.25s ease-out',
        }}
      >
        <style>{`
          @keyframes modal-in {
            from { opacity: 0; transform: translateY(16px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🎁</div>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0B1533', margin: 0, lineHeight: 1.3 }}>
            Unlock your {universityName} {program} coupon
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
            Fill this and get your discount code plus a free counsellor call.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <User size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)}
              style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 10, paddingBottom: 10, fontSize: 14, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <Phone size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="tel" placeholder="10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value)} maxLength={15}
              style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 10, paddingBottom: 10, fontSize: 14, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <Mail size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 10, paddingBottom: 10, fontSize: 14, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <MapPin size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <select value={state} onChange={e => setState(e.target.value)}
              style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 10, paddingBottom: 10, fontSize: 14, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', boxSizing: 'border-box', appearance: 'none' }}>
              <option value="">Select your state</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {error && <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#F4A024', color: '#0B1533', fontWeight: 700, fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {loading ? 'Unlocking...' : 'Unlock Coupon →'}
          </button>
        </form>

        <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>
          EdifyEdu never sells your data. One call, no spam.
        </p>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export default function CouponCard({ coupon, universityId, program, universityName }: Props) {
  const code        = coupon?.code || `EDIFY-${universityId.slice(0, 4).toUpperCase()}-${program}`
  const savings     = coupon?.savings || 'Save up to ₹10,000'
  const expiry      = coupon?.expiry  || '30 Jun 2026'
  const maxDiscount = savings.match(/₹[\d,]+/)?.[0] || '₹10,000'

  const storageKey = `edify_coupon_${universityId}_${program}`

  const [cardState,  setCardState]  = useState<CardState>('locked')
  const [copied,     setCopied]     = useState(false)
  const [mounted,    setMounted]    = useState(false)
  const [showConf,   setShowConf]   = useState(false)

  // Hydrate localStorage check
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) setCardState('unlocked')
    } catch {}
  }, [storageKey])

  function handleUnlock() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ code, unlockedAt: Date.now() }))
    } catch {}
    setShowConf(true)
    setCardState('unlocked')
    setTimeout(() => setShowConf(false), 2000)
  }

  function handleCopy() {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // ── State 3: Unlocked ─────────────────────────────────────────────────────
  if (cardState === 'unlocked') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5" style={{ position: 'relative', overflow: 'hidden' }}>
        {showConf && <ConfettiBurst />}

        <div className="text-center mb-3">
          <div style={{ fontSize: 28, marginBottom: 4 }}>🎉</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#92400e' }}>You&apos;ve unlocked it!</div>
          <div style={{ fontSize: 12, color: '#78350f', marginTop: 3 }}>
            {savings} on your {program} at {universityName}
          </div>
        </div>

        {/* Revealed code */}
        <div style={{
          background: '#fff',
          border: '2px dashed #F4A024',
          borderRadius: 10,
          padding: '14px 16px',
          textAlign: 'center',
          marginBottom: 12,
        }}>
          {mounted && <SlotReveal code={code} />}
          <div style={{ fontSize: 11, color: '#78350f', marginTop: 4 }}>Expires {expiry}</div>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          style={{
            width: '100%', padding: '10px', borderRadius: 8,
            background: copied ? '#10b981' : '#0B1533',
            color: '#fff', fontWeight: 700, fontSize: 13,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'background 0.2s',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>

        <p style={{ fontSize: 11, color: '#92400e', textAlign: 'center', marginTop: 10 }}>
          Our counsellor will call you in 24 hours to apply this code.
        </p>
      </div>
    )
  }

  // ── State 1: Locked ───────────────────────────────────────────────────────
  return (
    <>
      {/* Modal in state 2 */}
      {mounted && cardState === 'form_open' && (
        <UnlockModal
          onClose={() => setCardState('locked')}
          onSuccess={handleUnlock}
          universityName={universityName}
          program={program}
          universityId={universityId}
        />
      )}

      <div className="rounded-xl border border-amber-200 bg-white p-5">
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🎁</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0B1533', lineHeight: 1.3 }}>
            Unlock Your EdifyEdu Coupon
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 5, lineHeight: 1.5 }}>
            Save up to {maxDiscount} on your {program} admission at {universityName}
          </div>
        </div>

        {/* Masked code */}
        <div style={{
          background: '#f8fafc',
          border: '2px dashed #e2e8f0',
          borderRadius: 10,
          padding: '12px 16px',
          textAlign: 'center',
          marginBottom: 14,
        }}>
          <div style={{
            fontFamily: 'monospace', fontWeight: 900,
            fontSize: 16, letterSpacing: '0.1em',
            color: '#0B1533',
            filter: 'blur(6px)',
            userSelect: 'none',
          }}>
            EDIFY-███████████
          </div>
        </div>

        <button
          onClick={() => setCardState('form_open')}
          style={{
            width: '100%', padding: '11px',
            borderRadius: 9, background: '#F4A024',
            color: '#0B1533', fontWeight: 700,
            fontSize: 14, border: 'none', cursor: 'pointer',
          }}
        >
          View Coupon →
        </button>

        <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
          Fill a short form to reveal your coupon
        </p>
      </div>
    </>
  )
}
