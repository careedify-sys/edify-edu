'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import type { UniSlim } from '@/lib/data-slim'
import { formatFeeSlim as formatFee } from '@/lib/data-slim'
import { getUniversityLogo } from '@/lib/content'
import { buildHighlight, preferForProgram } from '@/lib/highlight'
import EnquiryModal from './EnquiryModalDynamic'

function UniLogo({ src, name, abbr, color }: { src?: string | null; name: string; abbr: string; color: string }) {
  const [err, setErr] = useState(false)
  const initials = abbr ? abbr.slice(0, 2).toUpperCase() : name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  if (!src || err) {
    return (
      <div className="uc-initials" style={{ background: color || '#1B4FBE' }}>
        {initials}
      </div>
    )
  }
  return (
    <Image
      src={src}
      alt={`${name} logo`}
      width={130}
      height={36}
      className="uc-logo"
      onError={() => setErr(true)}
    />
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
  'AICTE':   { src: '/logos/university_logos/Aicte.webp',           label: 'AICTE',   bg: '#fff8f0' },
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

// programFee: the governed fee for the programme the hub is about. Pass it on
// non-MBA hubs, where u.feeMin/feeMax (MBA-led) would print the wrong
// programme's fee. undefined keeps the old behaviour; null means "not known".
// href, when given, wins over the specSlug-built URL. Pass one whenever the
// card is spec-scoped: specSlug is the hub's slug, not necessarily this
// university's, and the built URL 308s or 404s when they differ.
export default function UniversityCard({ u, highlightProgram, specSlug, programFee, href }: { u: UniversityCardData; highlightProgram?: string; specSlug?: string; programFee?: string | null; href?: string }) {
  const cardHref = href ?? (specSlug ? `/universities/${u.id}/mba/${specSlug}` : `/universities/${u.id}`)
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

        <Link href={cardHref} aria-label={`View ${u.name} online programs`} className="block p-5 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-3">
              <div className="uc-logo-box">
                <UniLogo src={u.logo || getUniversityLogo(u.id)} name={u.name} abbr={(u as any).abbr || ''} color={u.color} />
              </div>
              <h3 className="uc-title font-semibold text-base leading-tight mb-1">
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
                <span className="uc-qs">QS #{u.qsRank}</span>
              )}
            </div>
          </div>

          {/* ── Approval Logos Strip ── */}
          <div className="uc-approvals">
            {allApprovals.map(tag => {
              const entry = getApprovalEntry(tag)
              if (entry) {
                return (
                  <div key={tag} title={entry.label} className="uc-chip uc-chip-logo">
                    <img
                      src={entry.src}
                      alt={entry.label}
                      className="uc-chip-img"
                      loading="lazy"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement
                        const parent = el.parentElement
                        if (parent) {
                          parent.innerHTML = `<span class="uc-chip-text">${entry.label}</span>`
                        }
                      }}
                    />
                  </div>
                )
              }
              // Fallback: text badge for unknown approvals
              return (
                <span key={tag} className="uc-chip uc-chip-text">{tag}</span>
              )
            })}
            {/* NAAC grade label always visible */}
            <div className="uc-chip uc-chip-naac">
              <span className="uc-naac">NAAC {u.naac}</span>
            </div>
          </div>

          {/* Highlight badge */}
          <div className="uc-highlight">
            <span className="text-sm">✦</span>
            {highlightProgram ? buildHighlight(u, preferForProgram(highlightProgram)) : u.highlight}
          </div>

          {/* Programs */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {u.programs.slice(0, 5).map(p => (
              <span key={p} className={`text-xs px-2 py-0.5 rounded-md font-medium ${highlightProgram === p ? 'uc-prog-on' : 'uc-prog'}`}>
                {p}
              </span>
            ))}
            {u.programs.length > 5 && (
              <span className="uc-prog-more text-xs px-2 py-0.5 rounded-md">
                +{u.programs.length - 5}
              </span>
            )}
          </div>

          {/* Fees */}
          <div className="flex items-end justify-between pt-3 border-t border-slate-100">
            <div>
              <div className="text-xs mb-0.5 text-[var(--ink-3)]">{programFee !== undefined && highlightProgram ? `${highlightProgram} total fees` : 'Total fees'}</div>
              <div className="uc-fee font-bold text-base">
                {programFee === undefined
                  ? <>{formatFee(u.feeMin)} – {formatFee(u.feeMax)}</>
                  : programFee ?? 'Contact our counsellor for current fee details'}
              </div>
            </div>
            {/* emiFrom is MBA-derived, so it is hidden when a programme fee is shown */}
            {programFee === undefined && u.emiFrom > 0 && (
            <div className="text-right">
              <div className="text-xs mb-0.5 text-[var(--ink-3)]">EMI from</div>
              <div className="uc-emi font-semibold text-sm">{u.emiFrom > 0 ? `₹${u.emiFrom.toLocaleString()}/mo` : 'On request'}</div>
            </div>
            )}
          </div>
        </Link>

        {/* Action buttons */}
        <div className="px-5 pb-4 flex gap-2">
          <Link href={cardHref}
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
