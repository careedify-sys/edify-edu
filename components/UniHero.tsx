'use client'

import Image from 'next/image'
import type { University, ProgramDetail, Program } from '@/lib/data'
import { cleanCareerOutcome, getProgramLevel } from '@/lib/format'
import { getExactFee, formatExactFeeShort, formatExactFeeDetail, FEE_COUNSELLOR_LINE } from '@/lib/fees'
import { TrendingUp } from 'lucide-react'
import LOGOS_MANIFEST from '@/lib/data/logos-manifest.json'
import RankingBadge from './RankingBadge'
import { shouldIndexUniversity } from '@/lib/seo/mode-unverified'
import { debBasis } from '@/lib/seo/deb-basis'
import { programmeEligibility } from '@/lib/seo/display-guards'
import { feeCheckedLine, debSessionLine } from '@/lib/provenance'

interface Props {
  u: University
  program: string
  pd: ProgramDetail
  cleanName: string
  spec?: string
  // URL slug of the specialisation. A fee plan that names this slug (Amity's
  // premium tracks) replaces the programme-wide fee in the Total Fees tile.
  specSlug?: string
  customH1?: string
  h1Variant?: 'admission'
  // Brand segment for the generated H1 when u.name drops the searched form
  // ("WILP" sits in brackets that getShortUniversityName strips).
  h1Name?: string
}

export default function UniHero({ u, program, pd, cleanName, spec, specSlug, customH1, h1Variant, h1Name }: Props) {
  const specs  = pd.specs || []
  const level  = getProgramLevel(program)
  const logoPath: string | undefined = (LOGOS_MANIFEST as Record<string, string>)[u.id]

  const year = new Date().getFullYear()
  const nameEndsOnline = cleanName.toLowerCase().endsWith('online')

  // Mode-unverified universities: the H1, eyebrow and subheading below all
  // assert online delivery and UGC DEB approval for this programme. Drop the
  // word "Online" from the H1 and the approval claim from the eyebrow.
  // See lib/seo/mode-unverified.ts.
  const modeVerified = shouldIndexUniversity(u.id)

  const onlinePrefix = modeVerified
    ? h1Name ?? (nameEndsOnline ? cleanName : cleanName + ' Online')
    : cleanName
  const generatedH1 = spec
    ? `${onlinePrefix} ${program} in ${spec}: Syllabus, Fees & Career Outcomes ${year}`
    : h1Variant === 'admission'
      // Worded apart from reviewOwnedTitle in app/universities/[id]/mba/page.tsx:
      // the same string in both made title and H1 identical wherever the short
      // name matched the H1 brand (NMIMS, flagged 28 Oct 2026).
      ? `${onlinePrefix} ${program} Admission ${year}: Specialisations and Eligibility`
      : `${onlinePrefix} ${program} ${year}: Fees, Placement, Syllabus & Reviews`
  const h1 = customH1 || generatedH1

  // A8: a university not on the UGC-DEB register shows its recorded UGC basis.
  const basis = debBasis(u.id)
  const approvalSuffix = !modeVerified ? ' · Delivery mode unconfirmed' : basis ? ` · ${basis.badge} (${basis.badgeSub})` : ' · UGC DEB Approved'
  const eyebrow = spec
    ? `${level} · ${pd.duration || '2 Years'}${approvalSuffix}`
    : `${level} · ${specs.length > 0 ? `${specs.length} Specialisations · ` : ''}${pd.duration || '2 Years'}${approvalSuffix}`

  const sub = !modeVerified
    ? `edifyedu.in cannot confirm that ${cleanName} runs this programme online. Check deb.ugc.ac.in and contact the university directly.`
    : spec
    ? `${program} with ${spec} specialisation from ${cleanName}. ${basis ? basis.metaSentence : 'UGC DEB approved.'}${u.naac ? ` NAAC ${u.naac} accredited.` : ''}`
    : (cleanCareerOutcome(pd.careerOutcome || '') || `Advance your career with an Online ${program} from ${cleanName}. Choose from ${specs.length}+ industry-relevant specialisations. Study while working.`)

  // MBA reads u.eligibility, the string the body and FAQ print, so the tile
  // cannot disagree with them (Amity said "Grad + 50%" here and 40% below).
  // The bracketed note becomes the small line under the value. A record with
  // no percentage in u.eligibility keeps the old label: this round fixes
  // disagreement, it does not re-source eligibility for every university.
  // B3 batch 4: the tile reads only the eligibility recorded for THIS
  // programme (programmeEligibility: pd.eligibility, or u.eligibility for MBA).
  // It used to type "Grad + 50%" / "10+2 + 50%" for every programme with no
  // record, 378 non-MBA heroes and 17 MBA heroes. No record, no tile.
  // B3 batch 4 QA F1: the level comes from the programme, not from whichever
  // pattern matches first. Records written for both levels ("Graduation for
  // PG, 10+2 for UG") resolved to "10+2" on 37 MBA/MCA heroes.
  const eligSource = programmeEligibility(u, program)
  const isPG = /^(M|PG)/.test(program)
  const UG_RE = /10\s*\+\s*2|12th|class 12|higher secondary|senior secondary/i
  const PG_RE = /grad|bachelor|degree/i
  const eligLevel = !eligSource ? undefined
    : isPG ? (PG_RE.test(eligSource) ? 'Grad' : undefined)
    : (UG_RE.test(eligSource) ? '10+2' : undefined)
  // A record naming both levels does not say which one a percentage belongs
  // to, so no percentage is shown for it.
  const mixedLevels = !!eligSource && UG_RE.test(eligSource) && PG_RE.test(eligSource.replace(UG_RE, ''))
    && /\b(UG|PG|undergraduate|postgraduate)\b/i.test(eligSource)
  const eligPct = mixedLevels ? undefined : eligSource?.match(/(\d{2})%/)?.[1]
  // B3 (2026-11-18): a university that publishes "Graduation pass" with no
  // percentage (Galgotias MBA) must not get the 50% default.
  const eligPass = !eligPct && /\bpass\b/i.test(eligSource ?? '')
  const eligibilityLabel = !eligLevel ? undefined
    : eligPct ? `${eligLevel} + ${eligPct}%`
    : eligPass ? `${eligLevel} (pass)`
    : eligLevel === 'Grad' ? 'Graduation' : '10+2'
  const eligibilityNote = eligPct ? eligSource?.match(/\(([^)]+)\)/)?.[1] : undefined

  // Exact rupees, discount or payment mode labelled (getExactFee). This read
  // getDisplayFee's compact form, so Uttaranchal showed "₹99.6K-₹1.48L", and
  // fell back to pd.fees or the raw MBA-led feeMin.
  // The tile shows the short token large and the label small underneath, so
  // a long labelled fee does not wrap into a column at 22px.
  const exactFee = getExactFee(u, program as Program)
  // Same plan getFeePlans picks for the page's fee table, so tile and table agree.
  const specPlan = specSlug
    ? u.feePlans?.[program.toLowerCase() as 'mba']?.find(p => p.specs?.includes(specSlug))
    : undefined
  // Only the tile reads the plan. Titles and metas keep reading feeMin/feeMax.
  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
  const specOneTime = specPlan?.rows.find(r => /one-time/i.test(r.mode))?.total
  const specSemester = specPlan?.rows.find(r => /semester/i.test(r.mode))?.total
  const feeValue = specOneTime
    ? inr(specOneTime)
    : formatExactFeeShort(exactFee) ?? FEE_COUNSELLOR_LINE
  const feeDetail = specOneTime
    ? `one-time payment, this track${specSemester ? `; ${inr(specSemester)} paid by semester` : ''}`
    : formatExactFeeDetail(exactFee)

  // B1: the date the shown MBA fee was read on the portal, hub only. A spec
  // page can print a track fee, which provenance.fee does not cover.
  const feeChecked = !spec && feeValue !== FEE_COUNSELLOR_LINE ? feeCheckedLine(u, program) : null
  // B1: DEB session beside the approval, only where the eyebrow claims it.
  const debLine = modeVerified && !basis ? debSessionLine(u) : null

  const stats = [
    { label: 'Total Fees', value: feeValue, highlight: true, sub: feeDetail, checked: feeChecked },
    { label: 'Duration',   value: pd.duration || '2 Years',       highlight: false },
    ...(eligibilityLabel ? [{ label: 'Eligibility', value: eligibilityLabel, highlight: false, sub: eligibilityNote }] : []),
    { label: 'NAAC',       value: u.naac,                         highlight: false },
    ...((u as any).nirfMgt && (u as any).nirfMgt < 200
      ? [{ label: 'NIRF Mgmt', value: `#${(u as any).nirfMgt}${u.nirfYear ? ` (${u.nirfYear})` : ''}`, highlight: false }]
      : u.nirf > 0 && u.nirf < 500
        ? [{ label: 'NIRF Univ', value: `#${u.nirf}${u.nirfYear ? ` (${u.nirfYear})` : ''}`, highlight: false }]
        : []),
  ]

  const intakeLine = (pd as any).nextIntake
    ? `Next batch: ${(pd as any).nextIntake}`
    : 'Next batch: Jan 2027'

  function scrollToLead() {
    document.getElementById('sticky-lead-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div style={{ background: 'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)', borderBottom: '1px solid #1e2f45' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">

        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={12} style={{ color: '#F4A024' }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#F4A024' }}>
            {eyebrow}
          </span>
        </div>
        {debLine && (
          <p className="deb-session text-[11px] text-slate-400 -mt-2 mb-4">{debLine}</p>
        )}

        {/* Logo (if available) + H1 block */}
        <div className="flex items-center gap-4 mb-4">
          {logoPath && (
            <Image
              src={logoPath}
              alt={`${cleanName} logo`}
              width={64}
              height={64}
              priority
              style={{
                objectFit: 'contain',
                background: '#fff', borderRadius: 14, padding: 8,
                flexShrink: 0,
              }}
            />
          )}
          <h1
            className="font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(1.35rem,3.5vw,2.1rem)', fontWeight: 800 }}
          >
            {h1}
          </h1>
        </div>

        {/* Ranking badges */}
        <RankingBadge u={u} />

        {/* Sub-headline */}
        <p className="text-slate-400 text-[15px] max-w-2xl mb-5 leading-relaxed">{sub}</p>

        {/* Stats grid */}
        <div
          className="grid gap-2 mb-5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}
        >
          {stats.map(s => (
            <div
              key={s.label}
              className="stat-tile px-4 py-2.5 rounded-lg border"
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderColor: s.highlight ? 'rgba(244,160,36,0.3)' : 'rgba(255,255,255,0.1)',
                transition: 'transform 200ms ease, box-shadow 200ms ease',
              }}
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">{s.label}</div>
              <div
                className="font-bold mt-0.5"
                style={{
                  fontSize: s.highlight ? (s.value === FEE_COUNSELLOR_LINE ? 13 : 22) : 16,
                  color: s.highlight ? '#F4A024' : '#fff',
                  lineHeight: 1.2,
                }}
              >
                {s.value}
              </div>
              {'sub' in s && s.sub && (
                <div className="text-[11px] text-slate-300 mt-0.5 leading-snug" style={{ maxWidth: 240 }}>{s.sub}</div>
              )}
              {'checked' in s && s.checked && (
                <div className="fee-checked-date text-[10px] text-slate-400 mt-1 leading-snug" style={{ maxWidth: 240 }}>{s.checked}</div>
              )}
            </div>
          ))}
        </div>

        {/* Trust line + desktop CTA */}
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-xs text-slate-500">
            500+ students guided by edifyedu.in this year · {intakeLine}
          </p>
          <button
            onClick={scrollToLead}
            className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: '#F4A024', color: '#0B1533' }}
          >
            Talk to our counsellor →
          </button>
        </div>
      </div>

      <style>{`
        .stat-tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(244,160,36,0.15);
        }
      `}</style>
    </div>
  )
}
