import Link from 'next/link'
import { brand } from '@/lib/brand'

interface Props {
  universityName: string
  universitySlug: string  // Supabase slug
  siteSlug: string        // edifyedu.in slug (from SLUG_MAP)
  programmes: { name: string; category?: string }[]
  naacGrade?: string
  nirfRank?: number
}

export function VerifyInterlinks({ universityName, universitySlug, siteSlug, programmes, naacGrade, nirfRank }: Props) {
  // Derive program slugs from programmes
  const programSlugs = new Set<string>()
  for (const p of programmes) {
    const cat = (p.category || p.name || '').toLowerCase()
    if (cat.includes('mba') || cat.includes('management')) programSlugs.add('mba')
    if (cat.includes('mca') || cat.includes('computer application')) programSlugs.add('mca')
    if (cat.includes('bba')) programSlugs.add('bba')
    if (cat.includes('bca')) programSlugs.add('bca')
    if (cat.includes('b.com') || cat.includes('bcom') || cat.includes('commerce')) programSlugs.add('bcom')
    if (cat.includes('m.com') || cat.includes('mcom')) programSlugs.add('mcom')
    if (cat.includes('ma ') || cat === 'ma') programSlugs.add('ma')
    if (cat.includes('ba ') || cat === 'ba') programSlugs.add('ba')
  }

  const links: { label: string; href: string; desc: string }[] = []

  // University profile page
  links.push({
    label: `${universityName} Full Profile`,
    href: `/universities/${siteSlug}`,
    desc: 'Fees, specialisations, reviews, and admission details',
  })

  // Program pages on the university
  const programNames: Record<string, string> = { mba: 'MBA', mca: 'MCA', bba: 'BBA', bca: 'BCA', bcom: 'B.Com', mcom: 'M.Com', ma: 'MA', ba: 'BA' }
  for (const prog of Array.from(programSlugs).slice(0, 3)) {
    links.push({
      label: `${universityName.split(' ')[0]} Online ${programNames[prog] || prog.toUpperCase()}`,
      href: `/universities/${siteSlug}/${prog}`,
      desc: `Fees, syllabus, and specialisations for ${programNames[prog] || prog.toUpperCase()}`,
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
    href: `/coupons/${siteSlug}`,
    desc: 'Check if a fee discount is available',
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
