'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, Loader2, X, Phone, User, Mail } from 'lucide-react'

interface Props {
  universityId: string
  universityName: string
  program?: string
  onClose: () => void
}

export default function RequestSyllabusModal({ universityId, universityName, program = '', onClose }: Props) {
  const [mounted,   setMounted]   = useState(false)
  const [name,      setName]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (!mounted) return
    firstFieldRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mounted, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n  = name.trim()
    const p  = phone.trim().replace(/^\+91/, '').replace(/\D/g, '')
    const em = email.trim()

    if (!n)              { setError('Please enter your name.'); return }
    if (p.length !== 10) { setError('Please enter a valid 10-digit mobile number.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setError('Please enter a valid email address.'); return }

    setError('')
    setLoading(true)

    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: n,
          phone: p,
          email: em,
          universityId,
          preferredUniversity: universityName,
          program: program || 'General',
          notes: `Syllabus request for ${universityName} ${program || ''}`.trim(),
          source: 'syllabus_request',
          timestamp: new Date().toISOString(),
        }),
      })
      localStorage.setItem(`edify_syllabus_requested_${universityId}_${program || 'general'}`, 'true')
    } catch {
      // Best-effort; still show success
    }

    setLoading(false)
    setSubmitted(true)
  }

  if (!mounted) return null

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0', background: 'rgba(11,21,51,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          width: '100%',
          maxWidth: 480,
          padding: '28px 24px 32px',
          animation: 'syllabus-modal-slide-up 250ms cubic-bezier(0.4,0,0.2,1)',
          maxHeight: '90dvh',
          overflowY: 'auto',
        }}
        className="sm:rounded-2xl sm:mb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle style={{ width: 48, height: 48, color: '#10b981', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0B1533', marginBottom: 8 }}>Done!</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
              Check your email within 24 hours for the official {program} syllabus from <strong>{universityName}</strong>.
            </p>
            <button
              onClick={onClose}
              style={{ marginTop: 24, padding: '10px 28px', background: '#F4A024', color: '#0B1533', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B1533', marginBottom: 6, paddingRight: 24 }}>
              Get {universityName} {program} Official Syllabus
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>
              Our counsellor shares the verified syllabus within 24 hours. Free.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Name */}
              <div style={{ position: 'relative' }}>
                <User size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  ref={firstFieldRef}
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 10, paddingBottom: 10, fontSize: 14, border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Phone */}
              <div style={{ position: 'relative' }}>
                <Phone size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  maxLength={15}
                  style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 10, paddingBottom: 10, fontSize: 14, border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Email */}
              <div style={{ position: 'relative' }}>
                <Mail size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 10, paddingBottom: 10, fontSize: 14, border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {error && <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4,
                  padding: '12px',
                  background: '#F4A024',
                  color: '#0B1533',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading && <Loader2 size={15} style={{ animation: 'syllabus-spin 1s linear infinite' }} />}
                {loading ? 'Submitting...' : 'Request Syllabus →'}
              </button>
            </form>

            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>
              EdifyEdu verifies the syllabus with the university portal. Single email, no spam.
            </p>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes syllabus-modal-slide-up {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes syllabus-spin { to { transform: rotate(360deg); } }
        @media (min-width: 640px) {
          [role="dialog"] > div {
            border-radius: 16px !important;
            margin-bottom: 32px;
          }
          [role="dialog"] {
            align-items: center !important;
          }
        }
      ` }} />
    </div>
  )

  return createPortal(modal, document.body)
}
