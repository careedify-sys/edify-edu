'use client'

import { FileText } from 'lucide-react'

interface Props {
  universityName: string
}

export default function RequestSampleCertCard({ universityName }: Props) {
  function handleRequest() {
    const notes = `I want to see a sample degree from ${universityName}`
    // Prefill the sticky lead card via event
    window.dispatchEvent(new CustomEvent('edify:prefill-lead', { detail: { notes } }))
    // Scroll to the sidebar lead card
    document.getElementById('sticky-lead-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div
      style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: '28px 28px 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileText size={24} style={{ color: '#B45309' }} />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B1533', margin: 0, lineHeight: 1.35 }}>
            Sample degree not yet available for {universityName}
          </h3>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.65, marginBottom: 18 }}>
        Every UGC DEB approved online degree is legally identical to an on-campus degree. Request a sample and our counsellor will share a verified image during your call.
      </p>

      <button
        onClick={handleRequest}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 20px',
          borderRadius: 9,
          background: '#F4A024',
          color: '#0B1533',
          fontWeight: 700,
          fontSize: 13,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Request Sample Certificate →
      </button>
    </div>
  )
}
