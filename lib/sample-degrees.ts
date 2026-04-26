// Maps university ID + program to the sample degree SVG path
// If no program-specific cert, falls back to university generic, then to generic

export const SAMPLE_DEGREES: Record<string, { mba?: string; mca?: string; bba?: string; bca?: string; default?: string }> = {
  'amity-university-online': {
    mba: '/logos/sample-degrees/amity-univesity-online-sample-degree.svg',
    mca: '/logos/sample-degrees/amity-online-mca-sample-degree.svg',
    default: '/logos/sample-degrees/amity-univesity-online-sample-degree.svg',
  },
  'amrita-vishwa-vidyapeetham-online': {
    mba: '/logos/sample-degrees/amirita-online-mba-sample-degree.svg',
    mca: '/logos/sample-degrees/amrita-onlie-mca-sample-degree.svg',
    default: '/logos/sample-degrees/amirita-online-mba-sample-degree.svg',
  },
  'manipal-academy-higher-education-online': {
    mba: '/logos/sample-degrees/mahe-sample-degree.webp',
    mca: '/logos/sample-degrees/mahe-manipal-online-mca-certificate.webp',
    default: '/logos/sample-degrees/mahe-sample-degree.webp',
  },
  'manipal-university-jaipur-online': {
    mba: '/logos/sample-degrees/manipal-university-jaipur-sample-degree-mba.webp',
    default: '/logos/sample-degrees/manipal-university-jaipur-sample-degree-mba.webp',
  },
  'sikkim-manipal-university-online': {
    default: '/logos/sample-degrees/sikkim-manipal-sample-certficate.webp',
  },
  'chandigarh-university-online': {
    mba: '/logos/sample-degrees/chandigarh-university-online-mba-sample-degree.svg',
    default: '/logos/sample-degrees/chandigarh-university-sample-degree.svg',
  },
  'lovely-professional-university-online': {
    mca: '/logos/sample-degrees/lovely-proffesinal-university-mca-sample-certficate.webp',
    default: '/logos/sample-degrees/lovely-proffesinal-university-mca-sample-certficate.webp',
  },
  'dayananda-sagar-university-online': {
    mba: '/logos/sample-degrees/dayanand-sagar-university-mba-sample-cerytficate.svg',
    mca: '/logos/sample-degrees/dayanand-sagar-university-sample-certficate-mca.svg',
    default: '/logos/sample-degrees/dayanand-sagar-university-mba-sample-cerytficate.svg',
  },
  'srm-institute-science-technology-online': {
    default: '/logos/sample-degrees/srm-insntiute-of-technology-tamil-nadu-sample-degree.webp',
  },
  'vit-university-online': {
    mba: '/logos/sample-degrees/vellore-instiute-of-technology-mba-sample-degree.webp',
    mca: '/logos/sample-degrees/vellore-insitute-of-technpology-mca-sample-degree.webp',
    default: '/logos/sample-degrees/vellore-instiute-of-technology-mba-sample-degree.webp',
  },
  'sastra-university-online': {
    mca: '/logos/sample-degrees/sastra-mca-sample-degree.webp',
    default: '/logos/sample-degrees/sastra-mca-certificate.webp',
  },
  'shanmugha-arts-science-technology-research-online': {
    mca: '/logos/sample-degrees/sastra-mca-sample-degree.webp',
    default: '/logos/sample-degrees/sastra-mca-certificate.webp',
  },
  'gla-university-online': {
    mba: '/logos/sample-degrees/gla-mathura-sample-degree-mba.webp',
    default: '/logos/sample-degrees/gla-mathura-sample-degree-mba.webp',
  },
  'noida-international-university-online': {
    mba: '/logos/sample-degrees/noida-international-university-sample-degree-mba.webp',
    default: '/logos/sample-degrees/noida-international-university-sample-degree-mba.webp',
  },
  'sharda-university-online': {
    mba: '/logos/sample-degrees/shardha-university-online-mba-sample-degree.svg',
    default: '/logos/sample-degrees/shardha-university-online-mba-sample-degree.svg',
  },
  'shobhit-university-online': {
    mba: '/logos/sample-degrees/shobhit-university-mba-sample-degree.svg',
    default: '/logos/sample-degrees/shobhit-university-mba-sample-degree.svg',
  },
  'uttaranchal-university-online': {
    mba: '/logos/sample-degrees/uttranchal-university-sample-degree-mba.webp',
    default: '/logos/sample-degrees/uttranchal-university-sample-degree-mba.webp',
  },
  'mangalayatan-university-online': {
    default: '/logos/sample-degrees/magalayatan-university-online-sample-degree.webp',
  },
  'manav-rachna-online': {
    default: '/logos/sample-degrees/manav-ranchna-sample-degree.webp',
  },
  'university-of-mysore-online': {
    default: '/logos/sample-degrees/university-of-mysore-sample-degree.webp',
  },
  'jamia-hamdard-online': {
    mba: '/logos/sample-degrees/jamia-hamdard-sample-degree.webp',
    mca: '/logos/sample-degrees/jamia-hamdara-online-mca-cerificate.webp',
    default: '/logos/sample-degrees/jamia-hamdard-sample-degree.webp',
  },
  'assam-don-bosco-university-online': {
    mba: '/logos/sample-degrees/assam-don-bosco-mba-sample-degree.webp',
    default: '/logos/sample-degrees/assam-don-bosco-mba-sample-degree.webp',
  },
  'dr-dy-patil-vidyapeeth-online': {
    mca: '/logos/sample-degrees/dr-dy-patil-vidyapeeth-sample-degree-mca.webp',
    default: '/logos/sample-degrees/dr-dy-patil-vidyapeeth-sample-degree-mca.webp',
  },
}

// Generic fallbacks by program
export const GENERIC_DEGREE: Record<string, string> = {
  MBA: '/logos/sample-degrees/online-mba-certificate-image.svg',
  MCA: '/logos/sample-degrees/online-mca-certificate-image.svg',
  BBA: '/logos/sample-degrees/sample-degree.webp',
  BCA: '/logos/sample-degrees/sample-degree.webp',
  default: '/logos/sample-degrees/sample-degree.webp',
}

/**
 * Returns the path to a uni-specific sample degree SVG, or null if none exists.
 * NEVER falls back to generic certs — showing another uni's cert mislabeled is a trust break.
 */
export function getSampleDegree(universityId: string, program: string): string | null {
  const prog = program.toLowerCase().replace(/[^a-z]/g, '') as 'mba' | 'mca' | 'bba' | 'bca'
  const uni = SAMPLE_DEGREES[universityId]
  if (!uni) return null
  return uni[prog] || uni.default || null
}
