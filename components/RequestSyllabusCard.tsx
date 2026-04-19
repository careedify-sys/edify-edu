'use client'

import { useState, useEffect } from 'react'
import { BookOpen, CheckCircle } from 'lucide-react'
import RequestSyllabusModal from './RequestSyllabusModal'

interface Props {
  uniId: string
  uniName: string
  program: string
}

export default function RequestSyllabusCard({ uniId, uniName, program }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [alreadyRequested, setAlreadyRequested] = useState(false)

  useEffect(() => {
    const key = `edify_syllabus_requested_${uniId}_${program || 'general'}`
    setAlreadyRequested(localStorage.getItem(key) === 'true')
  }, [uniId, program])

  if (alreadyRequested) {
    return (
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckCircle size={24} style={{ color: '#10b981', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#065f46', margin: 0 }}>
              Already Requested ✓
            </p>
            <p style={{ fontSize: 13, color: '#047857', margin: '4px 0 0' }}>
              Our team will email the {program} syllabus within 24 hours.
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
            background: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={24} style={{ color: '#6D28D9' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B1533', margin: 0, lineHeight: 1.35 }}>
              Full {program} Syllabus for {uniName}
            </h3>
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.65, marginBottom: 6 }}>
          {uniName} updates its {program} curriculum each admission cycle. For the current semester-wise subjects, exam pattern, and elective options, request the official syllabus.
        </p>

        <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 18 }}>
          Verified from university portal · Free · 24h delivery
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
          Request Official Syllabus →
        </button>
      </div>

      {modalOpen && (
        <RequestSyllabusModal
          universityId={uniId}
          universityName={uniName}
          program={program}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
