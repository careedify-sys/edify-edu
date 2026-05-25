import Link from 'next/link'

interface Props {
  percentage: string | number
}

export default function CgpaEligibilityBanner({ percentage }: Props) {
  return (
    <div
      className="rounded-xl mt-4 p-4 sm:p-5"
      style={{
        background: '#0F2A4F',
        border: '1px solid rgba(245,158,11,0.35)',
      }}
    >
      <p className="text-sm font-semibold leading-snug mb-3" style={{ color: 'rgba(255,255,255,0.93)' }}>
        Your CGPA converts to{' '}
        <span style={{ color: '#F59E0B' }} className="font-bold">
          {percentage}%
        </span>
        . See which online MBA/BBA programs you qualify for.
      </p>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/contact"
          data-cta="cgpa_eligibility_bridge_contact"
          className="inline-block px-4 py-2 rounded-lg text-xs font-bold no-underline transition-opacity hover:opacity-90"
          style={{ background: '#F59E0B', color: '#0F2A4F' }}
        >
          Check Eligibility
        </Link>
        <Link
          href="/universities"
          data-cta="cgpa_eligibility_bridge_universities"
          className="inline-block px-4 py-2 rounded-lg text-xs font-semibold no-underline transition-colors hover:bg-white/10"
          style={{
            color: 'rgba(255,255,255,0.82)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          Compare Universities
        </Link>
      </div>

      <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Free counselling. Zero commission. 125+ UGC-approved universities.
      </p>
    </div>
  )
}
