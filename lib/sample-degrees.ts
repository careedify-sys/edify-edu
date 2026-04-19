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
    mba: '/logos/sample-degrees/mahe-sample-degree.svg',
    mca: '/logos/sample-degrees/mahe-manipal-online-mca-certificate.svg',
    default: '/logos/sample-degrees/mahe-sample-degree.svg',
  },
  'manipal-university-jaipur-online': {
    mba: '/logos/sample-degrees/manipal-university-jaipur-sample-degree-mba.svg',
    default: '/logos/sample-degrees/manipal-university-jaipur-sample-degree-mba.svg',
  },
  'sikkim-manipal-university-online': {
    default: '/logos/sample-degrees/sikkim-manipal-sample-certficate.svg',
  },
  'chandigarh-university-online': {
    mba: '/logos/sample-degrees/chandigarh-university-online-mba-sample-degree.svg',
    default: '/logos/sample-degrees/chandigarh-university-sample-degree.svg',
  },
  'lovely-professional-university-online': {
    mca: '/logos/sample-degrees/lovely-proffesinal-university-mca-sample-certficate.svg',
    default: '/logos/sample-degrees/lovely-proffesinal-university-mca-sample-certficate.svg',
  },
  'dayananda-sagar-university-online': {
    mba: '/logos/sample-degrees/dayanand-sagar-university-mba-sample-cerytficate.svg',
    mca: '/logos/sample-degrees/dayanand-sagar-university-sample-certficate-mca.svg',
    default: '/logos/sample-degrees/dayanand-sagar-university-mba-sample-cerytficate.svg',
  },
  'srm-institute-science-technology-online': {
    default: '/logos/sample-degrees/srm-insntiute-of-technology-tamil-nadu-sample-degree.svg',
  },
  'vit-university-online': {
    mba: '/logos/sample-degrees/vellore-instiute-of-technology-mba-sample-degree.svg',
    mca: '/logos/sample-degrees/vellore-insitute-of-technpology-mca-sample-degree.svg',
    default: '/logos/sample-degrees/vellore-instiute-of-technology-mba-sample-degree.svg',
  },
  'sastra-university-online': {
    mca: '/logos/sample-degrees/sastra-mca-sample-degree.svg',
    default: '/logos/sample-degrees/sastra-mca-certificate.svg',
  },
  'shanmugha-arts-science-technology-research-online': {
    mca: '/logos/sample-degrees/sastra-mca-sample-degree.svg',
    default: '/logos/sample-degrees/sastra-mca-certificate.svg',
  },
  'gla-university-online': {
    mba: '/logos/sample-degrees/gla-mathura-sample-degree-mba.svg',
    default: '/logos/sample-degrees/gla-mathura-sample-degree-mba.svg',
  },
  'noida-international-university-online': {
    mba: '/logos/sample-degrees/noida-international-university-sample-degree-mba.svg',
    default: '/logos/sample-degrees/noida-international-university-sample-degree-mba.svg',
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
    mba: '/logos/sample-degrees/uttranchal-university-sample-degree-mba.svg',
    default: '/logos/sample-degrees/uttranchal-university-sample-degree-mba.svg',
  },
  'mangalayatan-university-online': {
    default: '/logos/sample-degrees/magalayatan-university-online-sample-degree.svg',
  },
  'manav-rachna-online': {
    default: '/logos/sample-degrees/manav-ranchna-sample-degree.svg',
  },
  'university-of-mysore-online': {
    default: '/logos/sample-degrees/university-of-mysore-sample-degree.svg',
  },
  'jamia-hamdard-online': {
    mba: '/logos/sample-degrees/jamia-hamdard-sample-degree.svg',
    mca: '/logos/sample-degrees/jamia-hamdara-online-mca-cerificate.svg',
    default: '/logos/sample-degrees/jamia-hamdard-sample-degree.svg',
  },
  'assam-don-bosco-university-online': {
    mba: '/logos/sample-degrees/assam-don-bosco-mba-sample-degree.svg',
    default: '/logos/sample-degrees/assam-don-bosco-mba-sample-degree.svg',
  },
  'dr-dy-patil-vidyapeeth-online': {
    mca: '/logos/sample-degrees/dr-dy-patil-vidyapeeth-sample-degree-mca.svg',
    default: '/logos/sample-degrees/dr-dy-patil-vidyapeeth-sample-degree-mca.svg',
  },
}

// Generic fallbacks by program
export const GENERIC_DEGREE: Record<string, string> = {
  MBA: '/logos/sample-degrees/online-mba-certificate-image.svg',
  MCA: '/logos/sample-degrees/online-mca-certificate-image.svg',
  BBA: '/logos/sample-degrees/sample-degree.svg',
  BCA: '/logos/sample-degrees/sample-degree.svg',
  default: '/logos/sample-degrees/sample-degree.svg',
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
