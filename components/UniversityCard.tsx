'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { University } from '@/lib/data'
import { formatFee } from '@/lib/data'
import EnquiryModal from './EnquiryModal'

export default function UniversityCard({ u, highlightProgram }: { u: University; highlightProgram?: string }) {
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  return (
    <>
      <div className="card flex flex-col rounded-2xl overflow-hidden" style={{ background:'#fff', cursor:'pointer' }}>
        {/* Color bar */}
        <div className="h-1 w-full shrink-0" style={{ background: u.color }} />

        <Link href={`/universities/${u.id}`} className="block p-5 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="font-semibold text-base leading-tight mb-1"
                style={{ color:'#1A2F4E', fontFamily:'"Plus Jakarta Sans",sans-serif' }}>
                {u.name}
              </h3>
              <div className="flex items-center gap-1 text-xs" style={{ color:'#6B84A0' }}>
                <MapPin className="w-3 h-3 shrink-0" />
                <span>{u.city}, {u.state}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="badge-nirf text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">NIRF #{u.nirf}</span>
              {u.nirfm && (
                <span className="badge-nirfm text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                  M #{u.nirfm}
                </span>
              )}
              <span className="badge-ugc text-[10px] font-bold px-2 py-0.5 rounded-full">UGC ✓</span>
            </div>
          </div>

          {/* Approvals */}
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="badge-naac text-[10px] font-bold px-2 py-0.5 rounded-full">NAAC {u.naac}</span>
            {u.approvals.filter(a => !a.startsWith('NAAC') && !a.startsWith('NIRF') && !a.startsWith('UGC') && !a.startsWith('NIRFM')).slice(0,2).map(a => (
              <span key={a} className="badge-approval text-[10px] font-semibold px-2 py-0.5 rounded-full">{a}</span>
            ))}
          </div>

          {/* Highlight quote */}
          <p className="text-xs leading-relaxed mb-3 italic" style={{ color:'#6B84A0', borderLeft:'2px solid #F59E0B', paddingLeft:'8px' }}>
            {u.highlight}
          </p>

          {/* Programs */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {u.programs.slice(0, 5).map(p => (
              <span key={p} className="text-xs px-2 py-0.5 rounded-md font-medium"
                style={highlightProgram === p
                  ? { background:'#F59E0B', color:'#fff', border:'1px solid #F59E0B' }
                  : { background:'#F1F4F9', color:'#3B526B', border:'1px solid #E2E8F4' }}>
                {p}
              </span>
            ))}
            {u.programs.length > 5 && (
              <span className="text-xs px-2 py-0.5 rounded-md"
                style={{ background:'#F1F4F9', color:'#6B84A0', border:'1px solid #E2E8F4' }}>
                +{u.programs.length - 5}
              </span>
            )}
          </div>

          {/* Exam mode */}
          <div className="mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background:'#F1F4F9', color:'#3B526B', border:'1px solid #E2E8F4' }}>
              {u.examMode === 'Assignment-based' ? '📝 No exams' : u.examMode === 'Online' ? '🖥️ Online exam' : '🏫 Exam centre'} · {u.examMode}
            </span>
          </div>

          {/* Fees */}
          <div className="flex items-end justify-between pt-3" style={{ borderTop:'1px solid #F1F4F9' }}>
            <div>
              <div className="text-xs mb-0.5" style={{ color:'#6B84A0' }}>Total fees</div>
              <div className="font-bold text-base" style={{ color:'#1A2F4E' }}>
                {formatFee(u.feeMin)} – {formatFee(u.feeMax)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs mb-0.5" style={{ color:'#6B84A0' }}>EMI from</div>
              <div className="font-semibold text-sm" style={{ color:'#F59E0B' }}>₹{u.emiFrom.toLocaleString()}/mo</div>
            </div>
          </div>
        </Link>

        {/* Action buttons */}
        <div className="px-5 pb-4 flex gap-2">
          <Link href={`/universities/${u.id}`}
            className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold btn-primary"
            style={{ borderRadius:'10px' }}>
            View Details →
          </Link>
          <button onClick={() => setEnquiryOpen(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold btn-outline"
            style={{ borderRadius:'10px' }}>
            Enquire
          </button>
        </div>
      </div>

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} universityName={u.name} universityId={u.id} />
    </>
  )
}
