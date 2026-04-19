'use client'

import { useState, useEffect } from 'react'
import { FileText, CheckCircle } from 'lucide-react'
import RequestSampleModal from './RequestSampleModal'

interface Props {
  universityName: string
  universityId: string
  program?: string
}

export default function RequestSampleCertCard({ universityName, universityId, program = '' }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [alreadyRequested, setAlreadyRequested] = useState(false)

  useEffect(() => {
    const key = `edify_cert_requested_${universityId}_${program || 'general'}`
    setAlreadyRequested(localStorage.getItem(key) === 'true')
  }, [universityId, program])

  if (alreadyRequested) {
    return (
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckCircle size={24} style={{ color: '#10b981', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#065f46', margin: 0 }}>
              You requested this sample.
            </p>
            <p style={{ fontSize: 13, color: '#047857', margin: '4px 0 0' }}>
              Our team will email the verified degree within 24 hours.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '28px 28px 24px' }}>
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
          Every UGC DEB approved online degree is legally identical to an on-campus degree. Request a sample and our counsellor will share a verified image within 24 hours.
        </p>

        <button
          onClick={() => setModalOpen(true)}
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

      {modalOpen && (
        <RequestSampleModal
          universityId={universityId}
          universityName={universityName}
          program={program}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
