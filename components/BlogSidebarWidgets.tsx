'use client'
import { useState } from 'react'

const SPECIALISATIONS = [
  'Marketing',
  'Finance',
  'Human Resource Management',
  'Operations Management',
  'Business Analytics',
  'Logistics & Supply Chain',
  'International Business',
  'Healthcare Management',
  'Information Technology',
  'Agri Operations Management',
]

interface QuickFact { label: string; value: string; green?: boolean }

interface Props {
  postTitle?: string
  specialisations?: string[]
  quickFacts?: QuickFact[]
}

export default function BlogSidebarWidgets({ postTitle, specialisations, quickFacts }: Props) {
  const specs = specialisations?.length ? specialisations : SPECIALISATIONS

  // ── Alumni card state ────────────────────────────────────────────────────
  const [alumniDone, setAlumniDone] = useState(false)
  const [alumniName, setAlumniName] = useState('')
  const [alumniPhone, setAlumniPhone] = useState('')
  const [alumniLoading, setAlumniLoading] = useState(false)

  // ── Program details form state ───────────────────────────────────────────
  const [formDone, setFormDone] = useState(false)
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formSpec, setFormSpec] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  // ── Alumni submit ────────────────────────────────────────────────────────
  async function handleAlumniSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = alumniName.trim()
    const p = alumniPhone.trim().replace(/\D/g, '')
    if (!n || p.length < 10) return
    setAlumniLoading(true)

    await fetch('https://formspree.io/f/mojpvgwz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_type: 'talk_to_alumnus',
        name: n,
        phone: p,
        source: postTitle || 'blog',
      }),
    }).catch(() => {})

    // Also log to internal leads API
    fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: n,
        phone: p,
        sourcePage: typeof window !== 'undefined' ? window.location.pathname : 'blog',
        preferredUniversity: postTitle ? `Talk to Alumni — ${postTitle}` : 'Talk to Alumni',
      }),
    }).catch(() => {})

    setAlumniLoading(false)
    setAlumniDone(true)
  }

  // ── Program details submit ───────────────────────────────────────────────
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = formName.trim()
    const p = formPhone.trim().replace(/\D/g, '')
    if (!n || p.length < 10) return
    setFormLoading(true)

    await fetch('https://formspree.io/f/mojpvgwz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_type: 'program_details',
        name: n,
        phone: p,
        specialisation: formSpec || 'Not specified',
        source: postTitle || 'blog',
      }),
    }).catch(() => {})

    fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: n,
        phone: p,
        program: formSpec || 'General',
        sourcePage: typeof window !== 'undefined' ? window.location.pathname : 'blog',
        preferredUniversity: postTitle ? `Program Details — ${postTitle}` : 'Program Details',
      }),
    }).catch(() => {})

    setFormLoading(false)
    setFormDone(true)
  }

  return (
    <>
      {/* ── Card 0: Quick Facts ───────────────────────────────────────── */}
      {quickFacts && quickFacts.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: '#0B1D35', padding: '12px 18px' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>📋 Quick Facts</div>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {quickFacts.map((f, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: i < quickFacts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>{f.label}</span>
                <span style={f.green
                  ? { fontSize: 12.5, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: 4 }
                  : { fontSize: 12.5, fontWeight: 700, color: '#0f172a' }
                }>{f.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Card 1: Talk to an Alumnus ─────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg,#0B1D35,#142540)',
          border: '1px solid rgba(201,146,42,0.25)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {/* Header strip */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36,
              background: 'rgba(201,146,42,0.15)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e0a93a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>Talk to an Alumnus</div>
              <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>Get real answers from a graduate</div>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.65, margin: '0 0 14px' }}>
            Get real answers from someone who completed this program — fees, workload, placements, and whether it was worth it.
          </p>
        </div>

        {alumniDone ? (
          <div style={{ padding: '12px 20px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>✓</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Request received!</div>
            <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6 }}>
              We will connect you with a graduate on WhatsApp shortly.
            </div>
          </div>
        ) : (
          <form onSubmit={handleAlumniSubmit} style={{ padding: '0 16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="text"
              placeholder="Your name"
              value={alumniName}
              onChange={e => setAlumniName(e.target.value)}
              required
              style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13,
                outline: 'none', width: '100%', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, overflow: 'hidden' }}>
              <span style={{ padding: '9px 10px', color: '#94a3b8', fontSize: 12, fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>+91</span>
              <input
                type="tel"
                placeholder="Mobile number"
                value={alumniPhone}
                onChange={e => setAlumniPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                required
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  padding: '9px 10px', color: '#fff', fontSize: 13, outline: 'none',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={alumniLoading}
              style={{
                width: '100%', padding: '10px 0',
                background: alumniLoading ? 'rgba(255,255,255,0.1)' : '#0f172a',
                color: '#fff', fontWeight: 700, fontSize: 13,
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8, cursor: alumniLoading ? 'not-allowed' : 'pointer',
                marginTop: 2,
              }}
            >
              {alumniLoading ? 'Sending…' : 'Connect with an Alumnus'}
            </button>
          </form>
        )}
      </div>

      {/* ── Card 2: Get Full Program Details ──────────────────────────────── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ background: '#0B1D35', padding: '14px 20px' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
            Get Full Program Details
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11.5 }}>
            Fee structure, syllabus and admission steps on WhatsApp.
          </div>
        </div>

        {formDone ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📲</div>
            <div style={{ color: '#0B1D35', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Details sent!</div>
            <div style={{ color: '#64748b', fontSize: 12, lineHeight: 1.6 }}>
              We will reach out on WhatsApp shortly with full fee structure and syllabus.
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            <input
              type="text"
              placeholder="Your name"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              required
              style={{
                border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '9px 12px', fontSize: 13, color: '#0f172a',
                outline: 'none', width: '100%', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
              <span style={{ padding: '9px 10px', color: '#64748b', fontSize: 12, fontWeight: 600, borderRight: '1px solid #e2e8f0', background: '#f8fafc', whiteSpace: 'nowrap' }}>+91</span>
              <input
                type="tel"
                placeholder="Mobile number"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                required
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  padding: '9px 10px', fontSize: 13, color: '#0f172a', outline: 'none',
                }}
              />
            </div>
            <select
              value={formSpec}
              onChange={e => setFormSpec(e.target.value)}
              style={{
                border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '9px 12px', fontSize: 13, color: formSpec ? '#0f172a' : '#94a3b8',
                background: '#fff', outline: 'none', width: '100%', cursor: 'pointer',
              }}
            >
              <option value="">Select specialisation</option>
              {specs.map(s => (
                <option key={s} value={s} style={{ color: '#0f172a' }}>{s}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={formLoading}
              style={{
                width: '100%', padding: '11px 0',
                background: formLoading ? 'rgba(212,146,42,0.4)' : 'linear-gradient(135deg,#c9922a,#e0a93a)',
                color: '#fff', fontWeight: 700, fontSize: 13,
                border: 'none', borderRadius: 8,
                cursor: formLoading ? 'not-allowed' : 'pointer',
                marginTop: 2,
              }}
            >
              {formLoading ? 'Sending…' : 'Send Me Details →'}
            </button>
            <p style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', margin: 0 }}>
              Free · No spam · Details arrive on WhatsApp within 1 hour
            </p>
          </form>
        )}
      </div>
    </>
  )
}
