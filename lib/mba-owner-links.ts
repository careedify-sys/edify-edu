// The two pages that own each brand's MBA queries (branded-query sprint 1,
// 2026-11-13): the review post owns "X online MBA fees", the hub owns
// "X online MBA admission and specialisations". Templates that mention one of
// these universities in prose link both, inside a sentence, with exactly these
// anchors (components/OwnerMbaSentence.tsx). Keyed by lib/data.ts id. Kept out of
// lib/internal-links.ts so the client university page can import it cheaply.
export interface MbaOwnerLinks { shortName: string; review: string; hub: string }
export const MBA_OWNER_LINKS: Record<string, MbaOwnerLinks> = {
  'nmims-online': { shortName: 'NMIMS', review: '/blog/nmims-online-mba-review-2026', hub: '/universities/nmims-online/mba' },
  'amity-university-online': { shortName: 'Amity', review: '/blog/amity-online-mba-review-2026', hub: '/universities/amity-university-online/mba' },
  'manipal-university-jaipur-online': { shortName: 'MUJ', review: '/blog/muj-online-mba-review-2026', hub: '/universities/manipal-university-jaipur-online/mba' },
  'sikkim-manipal-university-online': { shortName: 'SMU', review: '/blog/smu-online-mba-review', hub: '/universities/sikkim-manipal-university-online/mba' },
  'symbiosis-university-online': { shortName: 'Symbiosis', review: '/blog/symbiosis-online-mba-review-2026', hub: '/universities/symbiosis-university-online/mba' },
}
