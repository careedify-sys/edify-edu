import Link from 'next/link'
import type { KeywordLink } from '@/lib/internal-links'

// One sentence whose link text is exactly the query the review should rank
// on. See KeywordLink in lib/internal-links.ts for why it exists. The anchor
// is passed through verbatim: do not prefix the university name or append a
// year, that would stop it being an exact match.
export default function ReviewKeywordLink({ link }: { link: KeywordLink }) {
  return (
    <p className="text-sm text-slate-600 leading-relaxed">
      In-depth review:{' '}
      <Link
        href={`/blog/${link.slug}`}
        className="font-semibold underline underline-offset-2"
        style={{ color: '#0B1D35' }}
      >
        {link.anchor}
      </Link>
      , with the fee breakdown, accreditation checks and our verdict. Edify compares public UGC/NAAC/NIRF data, no paid rankings.
    </p>
  )
}
