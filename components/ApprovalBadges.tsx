'use client'

/**
 * ApprovalBadges.tsx
 * Shared component that renders university approval logos with full names and sublabels.
 * Used across University detail page sidebar, Specialization page header, and University cards.
 */

interface ApprovalBadgesProps {
  approvals?: string[]
  naac?: string
  nirf?: number
  nirfMgt?: number
  nirfEng?: number
  highlight?: string
  layout?: 'row' | 'column'  // row = horizontal (cards/spec page), column = vertical (sidebar)
}

interface BadgeDef {
  key: string
  logo: string
  name: string
  sub: string
  accentColor: string
  bgColor: string
}

const BADGE_DEFS: BadgeDef[] = [
  {
    key: 'UGC DEB',
    logo: '/logos/university_logos/ugc-deb.svg',
    name: 'UGC DEB',
    sub: 'Govt Approved',
    accentColor: '#1B4FBE',
    bgColor: '#EFF6FF',
  },
  {
    key: 'AICTE',
    logo: '/logos/university_logos/Aicte.svg',
    name: 'AICTE',
    sub: 'Tech Council',
    accentColor: '#D97706',
    bgColor: '#FFFBEB',
  },
  {
    key: 'NAAC',
    logo: '/logos/university_logos/NAAC.svg',
    name: 'NAAC',
    sub: 'Accredited',
    accentColor: '#15803D',
    bgColor: '#F0FDF4',
  },
  {
    key: 'NIRF',
    logo: '/logos/university_logos/NIRF.svg',
    name: 'NIRF',
    sub: 'Ranked',
    accentColor: '#9333EA',
    bgColor: '#FAF5FF',
  },
  {
    key: 'WES',
    logo: '/logos/university_logos/WES.svg',
    name: 'WES',
    sub: 'Intl. Recognized',
    accentColor: '#0891B2',
    bgColor: '#ECFEFF',
  },
  {
    key: 'AIU',
    logo: '/logos/university_logos/aiu.svg',
    name: 'AIU',
    sub: 'Recognized',
    accentColor: '#1B4FBE',
    bgColor: '#EFF6FF',
  },
  {
    key: 'QS',
    logo: '/logos/university_logos/qs-ranking.svg',
    name: 'QS Ranked',
    sub: 'Global Ranking',
    accentColor: '#B91C1C',
    bgColor: '#FFF1F2',
  },
]

function ApprovalPill({
  def,
  extraText,
  column,
}: {
  def: BadgeDef
  extraText?: string
  column?: boolean
}) {
  if (column) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        background: '#ffffff',
        borderRadius: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        marginBottom: 8,
        border: `1px solid ${def.bgColor}`,
      }}>
        {/* Logo box */}
        <div style={{
          width: 44, height: 44, borderRadius: 8,
          background: def.bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <img
            src={def.logo}
            alt={def.name}
            style={{ maxWidth: 32, maxHeight: 32, objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
        {/* Text */}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 800, color: '#0B1D35',
            lineHeight: 1.2, letterSpacing: '0.01em',
          }}>
            {def.name}{extraText ? ` ${extraText}` : ''}
          </div>
          <div style={{ fontSize: 11, color: def.accentColor, fontWeight: 600, marginTop: 1 }}>
            {def.sub}
          </div>
        </div>
        {/* Checkmark */}
        <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill={def.accentColor + '18'} />
          <path d="M6 10.5l2.5 2.5L14 8" stroke={def.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  // Horizontal pill (row mode)
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '6px 12px 6px 8px',
      background: '#ffffff',
      borderRadius: 8,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.07)',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 6,
        background: def.bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <img
          src={def.logo}
          alt={def.name}
          style={{ maxWidth: 22, maxHeight: 22, objectFit: 'contain' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#0B1D35', lineHeight: 1.1 }}>
          {def.name}{extraText ? ` ${extraText}` : ''}
        </div>
        <div style={{ fontSize: 9.5, color: def.accentColor, fontWeight: 600 }}>
          {def.sub}
        </div>
      </div>
    </div>
  )
}

export default function ApprovalBadges({
  approvals = [],
  naac,
  nirf,
  nirfMgt,
  nirfEng,
  highlight,
  layout = 'row',
}: ApprovalBadgesProps) {
  const isColumn = layout === 'column'

  // Determine which badges to show
  const hasAICTE = approvals.some(a => a.startsWith('AICTE')) || true // always show for UGC unis
  const hasWES   = approvals.some(a => a.startsWith('WES')) || (highlight?.includes('WES') ?? false)
  const hasAIU   = approvals.some(a => a.startsWith('AIU'))
  const hasQS    = approvals.some(a => a === 'QS')
  const hasNIRF  = nirf !== undefined && nirf > 0 && nirf < 200
  const hasNIRFM = nirfMgt !== undefined && nirfMgt > 0 && nirfMgt < 200
  const hasNIRFE = nirfEng !== undefined && nirfEng > 0 && nirfEng < 200
  const hasNAAC  = naac && naac !== 'NA' && naac !== ''

  const container: React.CSSProperties = isColumn
    ? {}
    : { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }

  const ugcDef = BADGE_DEFS.find(d => d.key === 'UGC DEB')!
  const aicteDef = BADGE_DEFS.find(d => d.key === 'AICTE')!
  const naacDef = BADGE_DEFS.find(d => d.key === 'NAAC')!
  const nirfDef = BADGE_DEFS.find(d => d.key === 'NIRF')!
  const wesDef = BADGE_DEFS.find(d => d.key === 'WES')!
  const aiuDef = BADGE_DEFS.find(d => d.key === 'AIU')!
  const qsDef = BADGE_DEFS.find(d => d.key === 'QS')!

  return (
    <div style={container}>
      {/* Always: UGC DEB */}
      <ApprovalPill def={ugcDef} column={isColumn} />

      {/* Always: AICTE */}
      {hasAICTE && <ApprovalPill def={aicteDef} column={isColumn} />}

      {/* NAAC with grade */}
      {hasNAAC && <ApprovalPill def={naacDef} extraText={naac} column={isColumn} />}

      {/* NIRF with rank */}
      {hasNIRF && <ApprovalPill def={nirfDef} extraText={`(Uni) #${nirf}`} column={isColumn} />}
      {hasNIRFM && <ApprovalPill def={nirfDef} extraText={`(Mgt) #${nirfMgt}`} column={isColumn} />}
      {hasNIRFE && <ApprovalPill def={nirfDef} extraText={`(Eng) #${nirfEng}`} column={isColumn} />}

      {/* WES */}
      {hasWES && <ApprovalPill def={wesDef} column={isColumn} />}

      {/* AIU */}
      {hasAIU && <ApprovalPill def={aiuDef} column={isColumn} />}

      {/* QS */}
      {hasQS && <ApprovalPill def={qsDef} column={isColumn} />}

      {/* Any additional approvals not covered by the known badge definitions */}
      {approvals.filter(a => {
        const au = a.toUpperCase()
        return !au.startsWith('UGC') && !au.startsWith('AICTE') && !au.startsWith('NAAC') &&
               !au.startsWith('NIRF') && !au.startsWith('WES') && !au.startsWith('AIU') &&
               au !== 'QS'
      }).map(a => isColumn ? (
        <div key={a} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', background: '#ffffff', borderRadius: 10,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 8,
          border: '1px solid #F1F5F9',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>✓</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0B1D35' }}>{a}</div>
          <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#15803D18" />
            <path d="M6 10.5l2.5 2.5L14 8" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <div key={a} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', background: '#ffffff', borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.07)',
          fontSize: 11, fontWeight: 800, color: '#0B1D35',
        }}>
          <span style={{ color: '#15803D' }}>✓</span> {a}
        </div>
      ))}
    </div>
  )
}
