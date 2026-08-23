import Link from 'next/link'
import { LayoutGrid } from 'lucide-react'
import type { SiblingLink } from '@/lib/seo/safe-internal-links'

interface Props {
  links: SiblingLink[]
  cleanName: string
  overviewHref: string | null
}

/**
 * Cross-links a programme hub to the university's other programme hubs.
 *
 * Every href here has already passed isLinkable() in
 * lib/seo/safe-internal-links.ts, so this component never renders a link to a
 * 404 or to a noindex page. Render it unconditionally; it returns null when
 * the university has no other linkable programme.
 */
export default function SiblingProgrammes({ links, cleanName, overviewHref }: Props) {
  if (!links.length) return null

  return (
    <nav
      aria-label={`Other online programs at ${cleanName}`}
      className="rounded-xl p-5"
      style={{
        background: 'rgba(15,23,42,0.03)',
        border: '1px solid rgba(15,23,42,0.10)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <LayoutGrid size={14} style={{ color: '#64748b' }} />
        <span
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: '#64748b' }}
        >
          More at {cleanName}
        </span>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5 list-none p-0 m-0">
        {links.map(({ href, program, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-start gap-2 text-sm font-semibold no-underline hover:underline"
              style={{ color: '#0B1D35' }}
            >
              <span style={{ color: '#f97316', flexShrink: 0 }}>→</span>
              <span>
                {label}
                <span className="sr-only"> at {cleanName}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {overviewHref && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(15,23,42,0.08)' }}>
          <Link
            href={overviewHref}
            className="text-sm font-semibold no-underline hover:underline"
            style={{ color: '#3B5068' }}
          >
            Compare all {cleanName} online programs, fees and approvals
          </Link>
        </div>
      )}
    </nav>
  )
}
