import Link from 'next/link'
import { brand } from '@/lib/brand'

interface Props {
  universityName: string
  /** lib/data.ts id, or null when the verify slug maps to no site university. */
  siteId: string | null
  /** Gated on the server: null unless the overview page is linkable. */
  profileHref: string | null
  /** Programme hubs that pass hubResolves AND isLinkable, computed on the server. */
  programmeLinks: { href: string; program: string }[]
}

// Map site universityId -> coupon page slug (only universities with dedicated coupon pages)
const COUPON_SLUGS: Record<string, string> = {
  'amity-university-online': 'amity-online-mba-discount-coupon-2026',
  'nmims-online': 'nmims-online-mba-discount-coupon-2026',
  'manipal-university-jaipur-online': 'manipal-jaipur-online-mba-discount-coupon-2026',
  'lovely-professional-university-online': 'lpu-online-mba-discount-coupon-2026',
  'chandigarh-university-online': 'chandigarh-university-online-mba-discount-coupon-2026',
  'sikkim-manipal-university-online': 'smu-online-mba-discount-coupon-2026',
  'manipal-academy-higher-education-online': 'mahe-online-mba-discount-coupon-2026',
  'jain-university-online': 'jain-online-mba-discount-coupon-2026',
  'symbiosis-university-online': 'symbiosis-ssodl-online-mba-discount-coupon-2026',
  'ignou-online': 'ignou-online-mba-discount-coupon-2026',
  'dr-dy-patil-vidyapeeth-online': 'dpu-online-mba-discount-coupon-2026',
  'amrita-vishwa-vidyapeetham-online': 'amrita-online-mba-discount-coupon-2026',
}

export function VerifyInterlinks({ universityName, siteId, profileHref, programmeLinks }: Props) {
  // Programme links used to be guessed from Supabase programme names and glued
  // onto the Supabase slug, which linked 404 hubs and redirecting old slugs.
  // The server now passes only hubs the middleware allowlist serves and the
  // sitemap indexes. See getUniversityForVerifySlug in lib/seo/safe-internal-links.ts.
  const links: { label: string; href: string; desc: string }[] = []

  if (profileHref) {
    links.push({
      label: `${universityName} Full Profile`,
      href: profileHref,
      desc: 'Fees, specialisations, reviews, and admission details',
    })
  }

  for (const { href, program } of programmeLinks.slice(0, 3)) {
    links.push({
      label: `${universityName.split(' ')[0]} Online ${program}`,
      href,
      desc: `Fees, syllabus, and specialisations for ${program}`,
    })
  }

  // Compare tool
  links.push({
    label: 'Compare with other universities',
    href: '/compare',
    desc: 'Side-by-side fee, NIRF, and NAAC comparison',
  })

  // Coupon page (if likely exists)
  links.push({
    label: `${universityName.split(' ')[0]} discount and coupons`,
    href: siteId && COUPON_SLUGS[siteId] ? `/coupons/${COUPON_SLUGS[siteId]}` : '/coupons',
    desc: siteId && COUPON_SLUGS[siteId] ? 'View verified discount code and fee breakdown' : 'Check if a fee discount is available',
  })

  // Relevant guides
  links.push({
    label: 'Is online degree valid in India?',
    href: '/guides/is-online-degree-valid-india',
    desc: 'UGC 2020 rules on validity for jobs and higher education',
  })

  links.push({
    label: 'How to check UGC-DEB approval',
    href: '/guides/how-to-check-ugc-deb-approval',
    desc: 'Step-by-step verification on ugc.ac.in',
  })

  return (
    <div style={{ padding: '22px 24px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 4, height: 16, background: brand.gold, borderRadius: 2 }} />
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: brand.textPrimary }}>
          Explore more about {universityName.split('(')[0].trim().split(' ').slice(0, 3).join(' ')}
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {links.map((link, i) => (
          <Link
            key={i}
            href={link.href}
            style={{
              display: 'block', padding: '10px 14px', borderRadius: 10,
              background: brand.cream, border: `1px solid ${brand.creamBorder}`,
              textDecoration: 'none', transition: 'border-color 0.15s',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: brand.textPrimary, marginBottom: 2 }}>
              {link.label}
            </div>
            <div style={{ fontSize: 11, color: brand.textMuted }}>
              {link.desc}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
