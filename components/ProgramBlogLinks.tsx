import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import type { ProgramLinks } from '@/lib/internal-links'

interface Props {
  links: ProgramLinks
  program: string
}

const PROG_LABEL: Record<string, string> = { mba: 'MBA', bba: 'BBA', bca: 'BCA', mca: 'MCA' }

export default function ProgramBlogLinks({ links, program }: Props) {
  if (!links.blogs.length) return null

  const progLabel = PROG_LABEL[program] ?? program.toUpperCase()

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'rgba(212,146,42,0.05)',
        border: '1px solid rgba(212,146,42,0.2)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={14} style={{ color: '#D4922A' }} />
        <span
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: '#D4922A' }}
        >
          In-Depth Reviews
        </span>
      </div>
      <div className="space-y-2.5">
        {links.blogs.map(({ slug, label }) => (
          <Link
            key={slug}
            href={`/blog/${slug}`}
            className="flex items-start gap-2 text-sm font-semibold no-underline hover:underline"
            style={{ color: '#0B1D35' }}
          >
            <span style={{ color: '#D4922A', flexShrink: 0 }}>→</span>
            <span>{label}</span>
          </Link>
        ))}
        <Link
          href="/coupons"
          className="flex items-start gap-2 text-sm font-semibold no-underline hover:underline"
          style={{ color: '#3B5068' }}
        >
          <span style={{ color: '#D4922A', flexShrink: 0 }}>→</span>
          <span>Check available {links.shortName} {progLabel} scholarships and discounts</span>
        </Link>
        <Link
          href="/contact"
          className="flex items-start gap-2 text-sm font-semibold no-underline hover:underline"
          style={{ color: '#3B5068' }}
        >
          <span style={{ color: '#D4922A', flexShrink: 0 }}>→</span>
          <span>Get free counselling from edifyedu.in</span>
        </Link>
      </div>
    </div>
  )
}
