'use client'
import { useState } from 'react'
import EnquiryModal from '@/components/EnquiryModal'

interface Props {
  postTitle?: string
}

export default function BlogAlumniCard({ postTitle }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        style={{
          background: 'linear-gradient(135deg,#0B1D35,#142540)',
          border: '1px solid rgba(201,146,42,0.25)',
          borderRadius: 16,
        }}
        className="p-5"
      >
        {/* Icon */}
        <div
          style={{
            width: 42,
            height: 42,
            background: 'rgba(201,146,42,0.15)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e0a93a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>

        {/* Text */}
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
          Talk to an Alumnus
        </div>
        <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, margin: '0 0 14px' }}>
          Real graduates share their honest experience — fees, workload, placements, and whether it was worth it.
        </p>

        {/* CTA */}
        <button
          onClick={() => setOpen(true)}
          style={{
            width: '100%',
            padding: '10px 0',
            background: 'linear-gradient(135deg,#c9922a,#e0a93a)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
          }}
        >
          Connect with a Graduate →
        </button>
      </div>

      <EnquiryModal
        isOpen={open}
        onClose={() => setOpen(false)}
        sourcePage={postTitle ? `Blog: ${postTitle}` : 'blog'}
      />
    </>
  )
}
