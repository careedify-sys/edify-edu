'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { UniSlim } from '@/lib/data-slim'
import { formatFeeSlim as formatFee } from '@/lib/data-slim'
import { getUniversityLogo } from '@/lib/content'
import EnquiryModal from './EnquiryModalDynamic'

function UniLogo({ src, name, abbr, color }: { src?: string | null; name: string; abbr: string; color: string }) {
  const [err, setErr] = useState(false)
  const initials = abbr ? abbr.slice(0, 2).toUpperCase() : name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  if (!src || err) {
    return (
      <div style={{ width: 40, height: 40, borderRadius: 8, background: color || '#1B4FBE', color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-0.01em', flexShrink: 0 }}>
        {initials}
      </div>
    )
  }
  return (
    <img src={src} alt={`${name} logo`} width={130} height={36} style={{ maxHeight: 36, maxWidth: 130, objectFit: 'contain' }} loading="lazy" onError={() => setErr(true)} />
  )
}

// Extended type for full university data (optional fields)
interface UniversityCardData extends Omit<UniSlim, 'city'> {
  city?: string
  state?: string
  nirfm?: number
  nirfMgt?: number
  approvals?: string[]
  qsRank?: number
}

// Approval logo icon map — show these as visual SVG logos, not text
const APPROVAL_LOGOS: Record<string, { src: string; label: string; bg: string }> = {
  'AICTE':   { src: '/logos/university_logos/Aicte.svg',            label: 'AICTE',   bg: '#fff8f0' },
  'AIU':     { src: '/logos/university_logos/aiu.svg',              label: 'AIU',     bg: '#f0f8ff' },
  'NAAC':    { src: '/logos/university_logos/NAAC.svg',             label: 'NAAC',    bg: '#f0fff4' },
  'WES':     { src: '/logos/university_logos/WES.svg',              label: 'WES',     bg: '#f8f0ff' },
  'NIRF':    { src: '/logos/university_logos/NIRF.svg',             label: 'NIRF',    bg: '#fffbf0' },
  'UGC DEB': { src: '/logos/university_logos/ugc-deb.svg',          label: 'UGC DEB', bg: '#f0f4ff' },
  'UGC':     { src: '/logos/university_logos/ugc-deb.svg',          label: 'UGC DEB', bg: '#f0f4ff' },
  'QS':      { src: '/logos/university_logos/qs-ranking.svg',        label: 'QS',      bg: '#fff0f0' },
}

// Resolve which approval key to use
function getApprovalEntry(tag: string) {
  if (tag.startsWith('AICTE'))   return APPROVAL_LOGOS['AICTE']
  if (tag.startsWith('AIU'))     return APPROVAL_LOGOS['AIU']
  if (tag.startsWith('WES'))     return APPROVAL_LOGOS['WES']
  if (tag.startsWith('NAAC'))    return APPROVAL_LOGOS['NAAC']
  if (tag.startsWith('UGC'))     return APPROVAL_LOGOS['UGC DEB']
  if (tag.startsWith('NIRF'))    return APPROVAL_LOGOS['NIRF']
  if (tag.startsWith('QS'))      return APPROVAL_LOGOS['QS']
  return null
}

export default function UniversityCard({ u, highlightProgram }: { u: UniversityCardData; highlightProgram?: string }) {
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  const location = u.city || u.region || 'India'

  // Every university always shows NAAC + UGC DEB + AICTE (all online unis are approved by these)
  // WES and AIU shown only if explicitly in approvals array (not all unis have them)
  const defaultApprovals = ['UGC DEB', 'AICTE']
  const bonusApprovals = (u.approvals || []).filter(a =>
    a.startsWith('WES') || a.startsWith('AIU') || a.startsWith('QS')
  )
  const allApprovals = [...defaultApprovals, ...bonusApprovals]

  return (
    <>
      <div className="card flex flex-col rounded-2xl overflow-hidden bg-white cursor-pointer">
        {/* Color bar */}
        <div className="h-1 w-full shrink-0" style={{ background: u.color }} />

        <Link href={`/universities/${u.id}`} aria-label={`View ${u.name} online programs`} className="block p-5 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-3">
              <div style={{ marginBottom: 12, height: 40, display: 'flex', alignItems: 'center' }}>
                <UniLogo src={u.logo || getUniversityLogo(u.id)} name={u.name} abbr={(u as any).abbr || ''} color={u.color} />
              </div>
              <h3 className="font-semibold text-base leading-tight mb-1"
                style={{ color:'var(--navy-light)', fontFamily:'"Plus Jakarta Sans",sans-serif' }}>
                {u.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-[var(--ink-3)]">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>{location}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {(() => {
                const mgtRank = u.nirfMgt || u.nirfm
                const hasMgt = mgtRank && mgtRank > 0 && mgtRank < 200
                const hasUni = u.nirf > 0 && u.nirf < 200
                return (
                  <>
                    {hasMgt && <span className="badge-nirfm text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">NIRF #{mgtRank} Management</span>}
                    {hasUni && <span className="badge-nirf text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">NIRF #{u.nirf} University</span>}
                  </>
                )
              })()}
              {u.qsRank && (
                <span style={{fontSize:9,fontWeight:700,color:'#6B21A8',background:'#F3E8FF',border:'1px solid #D8B4FE',padding:'2px 6px',borderRadius:999,whiteSpace:'nowrap'}}>QS #{u.qsRank}</span>
              )}
            </div>
          </div>

          {/* ── Approval Logos Strip ── */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12,
            padding: '8px 10px', borderRadius: 8,
            background: 'linear-gradient(135deg, #f8faff, #f0f4ff)',
            border: '1px solid rgba(37,99,235,0.08)'
          }}>
            {allApprovals.map(tag => {
              const entry = getApprovalEntry(tag)
              if (entry) {
                return (
                  <div key={tag} title={entry.label} style={{
                    background: '#fff',
                    borderRadius: 6,
                    padding: '3px 7px',
                    border: '1px solid rgba(0,0,0,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: 28, minWidth: 40,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                  }}>
                    <img
                      src={entry.src}
                      alt={entry.label}
                      style={{ maxHeight: 18, maxWidth: 52, objectFit: 'contain' }}
                      loading="lazy"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement
                        const parent = el.parentElement
                        if (parent) {
                          parent.innerHTML = `<span style="font-size:9px;font-weight:700;color:#334155">${entry.label}</span>`
                        }
                      }}
                    />
                  </div>
                )
              }
              // Fallback: text badge for unknown approvals
              return (
                <span key={tag} style={{
                  fontSize: 9, fontWeight: 700, color: '#334155',
                  background: '#fff', borderRadius: 6, padding: '3px 7px',
                  border: '1px solid rgba(0,0,0,0.07)', height: 28,
                  display: 'flex', alignItems: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                }}>{tag}</span>
              )
            })}
            {/* NAAC grade label always visible */}
            <div style={{
              background: '#fff', borderRadius: 6, padding: '3px 8px',
              border: '1px solid rgba(22,163,74,0.25)',
              display: 'flex', alignItems: 'center', height: 28,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#16a34a' }}>NAAC {u.naac}</span>
            </div>
          </div>

          {/* Highlight badge */}
          <div style={{ padding: '6px 12px', marginBottom: 10, borderRadius: 'var(--r-xs)', background: 'linear-gradient(135deg, rgba(200,129,26,0.08), rgba(200,129,26,0.04))', border: '1px solid rgba(200,129,26,0.2)', fontSize: 11, fontWeight: 700, color: 'var(--amber-text)', display: 'flex', alignItems: 'center', gap: 6, }}>
            <span className="text-sm">✦</span>
            {u.highlight}
          </div>

          {/* Programs */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {u.programs.slice(0, 5).map(p => (
              <span key={p} className="text-xs px-2 py-0.5 rounded-md font-medium"
                style={highlightProgram === p
                  ? { background:'var(--amber)', color:'#fff', border:'1px solid #F59E0B' }
                  : { background:'var(--surface-2)', color:'var(--ink-2)', border:'1px solid var(--border)' }}>
                {p}
              </span>
            ))}
            {u.programs.length > 5 && (
              <span className="text-xs px-2 py-0.5 rounded-md"
                style={{ background:'var(--surface-2)', color:'var(--ink-3)', border:'1px solid var(--border)' }}>
                +{u.programs.length - 5}
              </span>
            )}
          </div>

          {/* Fees */}
          <div className="flex items-end justify-between pt-3 border-t border-slate-100">
            <div>
              <div className="text-xs mb-0.5 text-[var(--ink-3)]">Total fees</div>
              <div className="font-bold text-base" style={{ color:'var(--navy-light)' }}>
                {formatFee(u.feeMin)} – {formatFee(u.feeMax)}
              </div>
            </div>
            {u.emiFrom > 0 && (
            <div className="text-right">
              <div className="text-xs mb-0.5 text-[var(--ink-3)]">EMI from</div>
              <div className="font-semibold text-sm" style={{ color:'var(--amber)' }}>₹{u.emiFrom.toLocaleString()}/mo</div>
            </div>
            )}
          </div>
        </Link>

        {/* Action buttons */}
        <div className="px-5 pb-4 flex gap-2">
          <Link href={`/universities/${u.id}`}
            className="flex-1 text-center py-2.5 rounded-[var(--r-sm)] text-sm font-bold btn-primary">
            View Details →
          </Link>
          <button onClick={() => setEnquiryOpen(true)}
            className="px-4 py-2.5 rounded-[var(--r-sm)] text-sm font-semibold btn-outline">
            Enquire
          </button>
        </div>
      </div>

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} universityName={u.name} universityId={u.id} />
    </>
  )
}
