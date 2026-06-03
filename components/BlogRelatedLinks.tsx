import Link from 'next/link'
import type { ProgramLinks } from '@/lib/internal-links'

interface Props {
  links: ProgramLinks
  program: string
}

const PROG_LABEL: Record<string, string> = { mba: 'MBA', bba: 'BBA', bca: 'BCA', mca: 'MCA' }

export default function BlogRelatedLinks({ links, program }: Props) {
  const progLabel = PROG_LABEL[program] ?? program.toUpperCase()

  return (
    <div
      className="rounded-2xl my-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0B1D35 0%, #142540 100%)',
        border: '1px solid rgba(212,146,42,0.25)',
      }}
    >
      <div style={{ height: 3, background: 'linear-gradient(90deg,#c9922a,#e0a93a)' }} />
      <div className="p-5 sm:p-6">
        <div
          className="text-[10px] font-black uppercase tracking-widest mb-4"
          style={{ color: 'rgba(212,146,42,0.9)' }}
        >
          Explore {links.shortName} on edifyedu.in
        </div>
        <div className="space-y-3">
          <Link
            href={links.programPage}
            className="flex items-start gap-2 text-sm font-semibold no-underline hover:underline"
            style={{ color: '#fff' }}
          >
            <span style={{ color: '#D4922A', flexShrink: 0 }}>→</span>
            <span>
              See full {links.shortName} Online {progLabel} programme details, fees and specialisations
            </span>
          </Link>
          {links.verifyPage && (
            <Link
              href={links.verifyPage}
              className="flex items-start gap-2 text-sm font-semibold no-underline hover:underline"
              style={{ color: 'rgba(255,255,255,0.82)' }}
            >
              <span style={{ color: '#D4922A', flexShrink: 0 }}>→</span>
              <span>Verify {links.shortName} UGC-DEB approval status</span>
            </Link>
          )}
          {links.comparePage && (
            <Link
              href={links.comparePage}
              className="flex items-start gap-2 text-sm font-semibold no-underline hover:underline"
              style={{ color: 'rgba(255,255,255,0.82)' }}
            >
              <span style={{ color: '#D4922A', flexShrink: 0 }}>→</span>
              <span>Compare {links.shortName} {progLabel} with alternatives</span>
            </Link>
          )}
          <Link
            href="/contact"
            className="flex items-start gap-2 text-sm font-semibold no-underline hover:underline"
            style={{ color: 'rgba(255,255,255,0.82)' }}
          >
            <span style={{ color: '#D4922A', flexShrink: 0 }}>→</span>
            <span>Talk to our counsellor for free guidance</span>
          </Link>
        </div>
        <p
          className="text-[11px] mt-4 pt-3"
          style={{ color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          Edify compares public UGC/NAAC/NIRF data. No paid rankings, no commission.
        </p>
      </div>
    </div>
  )
}
