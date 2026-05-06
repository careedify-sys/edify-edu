'use client'

import { useState } from 'react'

interface Props {
  universityName: string
  universitySlug: string
}

export function VerifyLeadForm({ universityName, universitySlug }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const p = phone.trim().replace(/\D/g, '').slice(-10)
    if (!n || !/^[6-9]\d{9}$/.test(p)) return
    setStatus('sending')

    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: n,
          phone: p,
          preferredUniversity: universityName,
          sourcePage: `/verify/${universitySlug}`,
          source: 'verify_page_form',
        }),
      })
    } catch { /* show success */ }

    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div style={{ padding: '24px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>Done!</div>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#059669', marginBottom: 4 }}>Our counsellor will call you within 1 hour.</p>
        <p style={{ fontSize: 12, color: '#64748b' }}>Free call about {universityName}. No obligation.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '22px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
        Free Counselling
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.3 }}>
        Have questions about {universityName}?
      </h3>
      <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.55, margin: '0 0 14px' }}>
        Get honest advice on fees, placements, and whether this university fits your career goal. We earn zero commission.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          type="text"
          placeholder="Your name"
          autoComplete="name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{
            width: '100%', padding: '10px 14px', fontSize: 13, borderRadius: 10,
            border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, display: 'flex', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#f8fafc' }}>
            <span style={{ padding: '10px 10px', fontSize: 12, fontWeight: 600, color: '#94a3b8', borderRight: '1px solid #e2e8f0' }}>+91</span>
            <input
              type="tel"
              placeholder="WhatsApp number"
              autoComplete="tel"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              required
              style={{
                flex: 1, padding: '10px 12px', fontSize: 13, border: 'none',
                background: 'transparent', outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={status === 'sending'}
            style={{
              padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              color: '#fff', background: status === 'sending' ? '#94a3b8' : '#f97316',
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {status === 'sending' ? '...' : 'Call Me'}
          </button>
        </div>
      </form>
      <p style={{ fontSize: 9, color: '#cbd5e1', textAlign: 'center', marginTop: 8 }}>
        No spam. edifyedu.in earns zero commissions.
      </p>
    </div>
  )
}
