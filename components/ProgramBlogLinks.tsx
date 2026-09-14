import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import type { ProgramLinks } from '@/lib/internal-links'
import { getCouponPage, getCouponPageSlugForUniversity } from '@/lib/coupon-pages'

interface Props {
  links: ProgramLinks
  program: string
  /** Used to link the university's own coupon page instead of the /coupons hub. */
  universityId: string
}

const PROG_LABEL: Record<string, string> = { mba: 'MBA', bba: 'BBA', bca: 'BCA', mca: 'MCA' }

export default function ProgramBlogLinks({ links, program, universityId }: Props) {
  if (!links.blogs.length) return null

  const progLabel = PROG_LABEL[program] ?? program.toUpperCase()

  // This used to read "Check available {uni} {prog} scholarships and discounts"
  // and always point at the /coupons hub. Two problems. We list coupons, not
  // university scholarships, and for a university that runs no scholarship at
  // all (Galgotias, confirmed 2026-09-14) the old wording promised something
  // that does not exist. And sending every hub to the index wasted the link:
  // where the university has its own coupon page, that is the page that carries
  // the code, the fee and the form.
  //
  // MBA hubs only. Every /coupons/* landing page is an online MBA page, so
  // linking one from a BBA or MCA hub under the text "Check the {uni} MCA
  // discount coupon" would point at a coupon for a different programme. Those
  // hubs keep the index link and generic wording.
  const couponSlug = program === 'mba' ? getCouponPageSlugForUniversity(universityId) : undefined
  // A page can exist and still carry no coupon (IGNOU publishes couponCode
  // 'N/A'). Linking it is still worth doing, that page is otherwise reachable
  // from nowhere, but the anchor must not promise a coupon that is not there.
  const hasCoupon = couponSlug ? getCouponPage(couponSlug)?.couponCode !== 'N/A' : false

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
          href={couponSlug ? `/coupons/${couponSlug}` : '/coupons'}
          className="flex items-start gap-2 text-sm font-semibold no-underline hover:underline"
          style={{ color: '#3B5068' }}
        >
          <span style={{ color: '#D4922A', flexShrink: 0 }}>→</span>
          <span>
            {couponSlug && hasCoupon
              ? `Check the ${links.shortName} ${progLabel} discount coupon`
              : couponSlug
                ? `${links.shortName} ${progLabel} fees, and why no coupon runs on it`
                : `Compare ${progLabel} discount coupons across universities`}
          </span>
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
