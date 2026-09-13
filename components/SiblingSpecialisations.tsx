import Link from 'next/link'
import { Layers } from 'lucide-react'
import type { SpecLink } from '@/lib/seo/safe-internal-links'

interface Props {
  links: SpecLink[]
  cleanName: string
  program: string
  hubHref: string | null
}

/**
 * Cross-links a specialisation page to the other specialisations in the same
 * programme at the same university.
 *
 * Every href has already passed isLinkable() in lib/seo/safe-internal-links.ts,
 * so this never renders a link to a 404 or to a noindex page. Render it
 * unconditionally; it returns null when there are no linkable siblings.
 */
export default function SiblingSpecialisations({ links, cleanName, program, hubHref }: Props) {
  if (!links.length) return null

  return (
    <nav
      aria-label={`Other ${program} specialisations at ${cleanName}`}
      className="rounded-xl p-5"
      style={{ background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.10)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Layers size={14} style={{ color: '#64748b' }} />
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>
          Other {program} specialisations at {cleanName}
        </span>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 list-none p-0 m-0">
        {links.map(({ href, slug, name }) => (
          <li key={slug}>
            <Link
              href={href}
              className="flex items-start gap-2 text-sm font-semibold no-underline hover:underline"
              style={{ color: '#0B1D35' }}
            >
              <span style={{ color: '#f97316', flexShrink: 0 }}>→</span>
              <span>
                {program} in {name}
                <span className="sr-only"> at {cleanName}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {hubHref && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(15,23,42,0.08)' }}>
          <Link href={hubHref} className="text-sm font-semibold no-underline hover:underline" style={{ color: '#3B5068' }}>
            See all {cleanName} online {program} specialisations, fees and eligibility
          </Link>
        </div>
      )}
    </nav>
  )
}
