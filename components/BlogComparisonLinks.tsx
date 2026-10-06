import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { ComparisonLink } from '@/lib/compare-links'

/**
 * Side-by-side comparisons offered at the end of a post that covers both
 * universities. Styled to match the existing "From Our Guides" block so it
 * reads as part of the same footer rail rather than an advert.
 */
export default function BlogComparisonLinks({ links }: { links: ComparisonLink[] }) {
  if (!links.length) return null

  return (
    <div className="mt-6 bg-white rounded-2xl border border-border p-5">
      <div
        className="text-[10px] font-black uppercase tracking-widest mb-1"
        style={{ color: '#D4922A' }}
      >
        Compare Side by Side
      </div>
      <p className="text-xs text-ink-3 mb-3">
        Fees, NAAC grade, NIRF rank and syllabus for the universities in this article.
        Public data only, no paid rankings.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50/30 transition-colors group no-underline"
          >
            <span className="text-sm font-medium text-ink-2 group-hover:text-navy">
              {link.label}
            </span>
            <ChevronRight
              size={14}
              className="text-ink-3 group-hover:text-orange-500 flex-shrink-0 transition-colors"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
