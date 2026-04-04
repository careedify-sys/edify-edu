import type { Metadata } from 'next'
import { getUniversityById, formatFee } from '@/lib/data'
import type { University } from '@/lib/data'

// ─── Canonical SEO name per university ID (from keyword research doc) ───
const SEO_NAME: Record<string, string> = {
  // Andhra Pradesh
  'andhra-university-online': 'Andhra University',
  'kl-university-online': 'KL University',
  'vignan-university-online': "Vignan's University",
  // Assam
  'assam-don-bosco-university-online': 'Assam Don Bosco University',
  // Chhattisgarh
  'guru-ghasidas-vishwavidyalaya-online': 'Guru Ghasidas University',
  'mats-university-online': 'Mats University',
  // Delhi
  'jamia-hamdard-online': 'Jamia Hamdard',
  'jamia-millia-islamia-online': 'Jamia Millia Islamia',
  'jawaharlal-nehru-university-online': 'Jawaharlal Nehru University',
  'guru-gobind-singh-indraprastha-university-online': 'Guru Gobind Singh Indraprastha University',
  'iift-online': 'Indian Institute of Foreign Trade',
  // Gujarat
  'gujarat-university-online': 'Gujarat University',
  'charusat-university-online': 'Charotar University of Science and Technology',
  'dr-babasaheb-ambedkar-open-university-online': 'Dr. Babasaheb Ambedkar Open University',
  'parul-university-online': 'Parul University',
  'marwadi-university-online': 'Marwadi University',
  'gujarat-technological-university-online': 'Gujarat Technological University',
  'gls-university-online': 'GLS University',
  'pp-savani-university-online': 'PP Savani University',
  'ganpat-university-online': 'Ganpat University',
  // Haryana
  'guru-jambheshwar-university-online': 'Guru Jambheshwar University',
  'kurukshetra-university-online': 'Kurukshetra University',
  'maharshi-dayanand-university-online': 'Maharshi Dayanand University',
  'maharishi-markandeshwar-university-online': 'Maharishi Markandeshwar University',
  'manav-rachna-online': 'Manav Rachna University',
  'shree-guru-gobind-singh-tricentenary-university-online': 'Shree Guru Gobind Singh Tricentenary University',
  'northcap-university-online': 'NorthCap University',
  // Himachal Pradesh
  'shoolini-university-online': 'Shoolini University',
  'central-university-himachal-pradesh-online': 'Central University of Himachal Pradesh',
  // Jammu & Kashmir
  'university-of-jammu-online': 'University of Jammu',
  // Jharkhand
  'bits-pilani-online': 'Birla Institute of Technology Mesra',
  'arka-jain-university-online': 'Arka Jain University',
  // Karnataka
  'jain-university-online': 'JAIN University',
  'jss-university-online': 'JSS Academy of Higher Education',
  'manipal-academy-higher-education-online': 'Manipal Academy of Higher Education',
  'bangalore-university-online': 'Bangalore University',
  'university-of-mysore-online': 'University of Mysore',
  'yenepoya-university-online': 'Yenepoya University',
  'vtu-online': 'VTU Online',
  'karnataka-state-open-university-online': 'Karnataka State Open University',
  'christ-university-online': 'Christ University',
  'dayananda-sagar-university-online': 'Dayananda Sagar University',
  'alliance-university-online': 'Alliance University',
  'adichunchanagiri-university-online': 'Adichunchanagiri University',
  // Kerala
  'mahatma-gandhi-university-online': 'Mahatma Gandhi University',
  'university-of-kerala-online': 'University of Kerala',
  // Madhya Pradesh
  'devi-ahilya-vishwavidyalaya-online': 'Devi Ahilya Vishwavidyalaya',
  'sage-university-online': 'SAGE University',
  // Maharashtra
  'dr-dy-patil-vidyapeeth-online': 'DY Patil Vidyapeeth Pune',
  'dy-patil-university-online': 'DY Patil University Navi Mumbai',
  'symbiosis-university-online': 'Symbiosis International University',
  'bharati-vidyapeeth-university-online': 'Bharati Vidyapeeth University',
  'datta-meghe-university-online': 'Datta Meghe Institute of Higher Education',
  'university-of-mumbai-online': 'University of Mumbai',
  'nmims-online': 'NMIMS',
  'shivaji-university-online': 'Shivaji University',
  'savitribai-phule-pune-university-online': 'Savitribai Phule Pune University',
  // Mizoram
  'mizoram-university-online': 'Mizoram University',
  // Odisha
  'kalinga-institute-industrial-technology-online': 'KIIT University',
  'centurion-university-online': 'Centurion University',
  'kiit-university-online': 'KIIT University',
  // Punjab
  'chandigarh-university-online': 'Chandigarh University',
  'chitkara-university-online': 'Chitkara University',
  'lovely-professional-university-online': 'LPU',
  'guru-nanak-dev-university-online': 'Guru Nanak Dev University',
  'guru-kashi-university-online': 'Guru Kashi University',
  'desh-bhagat-university-online': 'Desh Bhagat University',
  // Rajasthan
  'manipal-university-jaipur-online': 'Manipal University Jaipur',
  'vivekananda-global-university-online': 'Vivekananda Global University',
  'banasthali-vidyapith-online': 'Banasthali Vidyapith',
  'mody-university-online': 'Mody University',
  'amity-university-online': 'Amity University',
  'jaipur-national-university-online': 'Jaipur National University',
  'jagannath-university-online': 'Jagannath University',
  // Sikkim
  'sikkim-manipal-university-online': 'Sikkim Manipal University',
  'srm-university-sikkim-online': 'SRM University Sikkim',
  'shri-ramasamy-memorial-university-online': 'Shri Ramasamy Memorial University',
  // Tamil Nadu
  'bharathidasan-university-online': 'Bharathidasan University',
  'bharath-university-online': 'Bharath Institute of Higher Education and Research',
  'bs-abdur-rahman-university-online': 'BS Abdur Rahman Crescent Institute',
  'madurai-kamaraj-university-online': 'Madurai Kamaraj University',
  'dr-mgr-educational-research-institute-online': 'Dr MGR Educational and Research Institute',
  'shanmugha-arts-science-technology-research-online': 'SASTRA Deemed University',
  'sastra-university-online': 'SASTRA Deemed University',
  'sathyabama-university-online': 'Sathyabama Institute of Science and Technology',
  'srm-institute-science-technology-online': 'SRM Institute of Science and Technology',
  'university-of-madras-online': 'University of Madras',
  'kalasalingam-university-online': 'Kalasalingam Academy of Research and Education',
  'amrita-vishwa-vidyapeetham-online': 'Amrita University',
  'alagappa-university-online': 'Alagappa University',
  'bharathiar-university-online': 'Bharathiar University',
  'vit-university-online': 'Vellore Institute of Technology',
  'vit-vellore-online': 'Vellore Institute of Technology',
  'manonmaniam-sundaranar-university-online': 'Manonmaniam Sundaranar University',
  'hindustan-institute-technology-online': 'Hindustan Institute of Technology and Science',
  'hindusta-institut-of-technolo-2': 'Hindustan Institute of Technology and Science',
  'karunya-university-online': 'Karunya Institute of Technology and Sciences',
  'karunya-kcode-online': 'Karunya Institute of Technology and Sciences',
  'meenakshi-academy-higher-education-online': 'Meenakshi Academy of Higher Education and Research',
  'anna-university-online': 'Anna University',
  'vels-university-online': 'Vel\'s Institute of Science Technology and Advanced Studies',
  'sri-ramachandra-university-online': 'Sri Ramachandra Institute of Higher Education and Research',
  'amet-university-online': 'Academy of Maritime Education and Training',
  // Telangana
  'icfai-university-online': 'ICFAI Foundation for Higher Education',
  'iiit-bangalore-online': 'International Institute of Information Technology',
  // Uttar Pradesh
  'aligarh-muslim-university-online': 'Aligarh Muslim University',
  'sharda-university-online': 'Sharda University',
  'mangalayatan-university-online': 'Mangalayatan University',
  'shiv-nadar-university-online': 'Shiv Nadar University',
  'integral-university-online': 'Integral University',
  'gla-university-online': 'GLA University',
  'dayalbagh-educational-institute-online': 'Dayal Bagh Educational Institute',
  'university-of-lucknow-online': 'University of Lucknow',
  'noida-international-university-online': 'Noida International University',
  'chhatrapati-shahu-ji-maharaj-university-online': 'Chhatrapati Shahu Ji Maharaj University',
  'galgotias-university-online': 'Galgotias University',
  'mahatma-jyotiba-phule-rohilkhand-university-online': 'Mahatma Jyotiba Phule Rohilkhand University',
  'deen-dayal-upadhyay-gorakhpur-university-online': 'Deen Dayal Upadhyay Gorakhpur University',
  'shobhit-university-online': 'Shobhit University',
  'teerthanker-mahaveer-university-online': 'Teerthanker Mahaveer University',
  'subharti-university-online': 'Swami Vivekanand Subharti University',
  'jaypee-university-online': 'Jaypee Institute of Information Technology',
  // Uttarakhand
  'graphic-era-university-online': 'Graphic Era University',
  'upes-online': 'UPES',
  'uttaranchal-university-online': 'Uttaranchal University',
  // Others
  'bits-pilani-work-integrated-online': 'BITS Pilani',
  'sgt-university-online': 'SGT University',
  'alvas-college-online': "Alva's College",
}

// Program labels for title
const PROG_TITLE: Record<string, string> = {
  MBA: 'Online MBA', MCA: 'Online MCA', BBA: 'Online BBA',
  BCA: 'Online BCA', 'B.Com': 'Online B.Com', BA: 'Online BA',
  'M.Com': 'Online M.Com', MA: 'Online MA', MSc: 'Online MSc', BSc: 'Online BSc',
}

// Program keyword suffixes matching the keyword doc exactly
const PROG_KW: Record<string, string> = {
  MBA: 'online mba', MCA: 'online mca', BBA: 'online bba',
  BCA: 'online bca', 'B.Com': 'online bcom', BA: 'online ba',
  'M.Com': 'online mcom', MA: 'online ma', MSc: 'online msc', BSc: 'online bsc',
}

function getSeoName(id: string, fullName: string): string {
  if (SEO_NAME[id]) return SEO_NAME[id]
  // Fallback: strip suffixes from full name
  let n = fullName.split(/\s*[–—]\s*/)[0].trim()
  n = n.replace(/\s*\([^)]+\)\s*$/, '').trim()
  n = n.replace(/\s+Online\s*$/i, '').trim()
  if (n.length > 40) n = n.split(' ').slice(0, 4).join(' ')
  return n
}


// ── Schema helpers for this layout ──────────────────────────────────────
function buildUniSchema(u: University, formattedFees: string) {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',         item: 'https://edifyedu.in' },
      { '@type': 'ListItem', position: 2, name: 'Universities', item: 'https://edifyedu.in/universities' },
      { '@type': 'ListItem', position: 3, name: u.name,         item: `https://edifyedu.in/universities/${u.id}` },
    ],
  }
  const org = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: u.name,
    url: `https://edifyedu.in/universities/${u.id}`,
    description: u.description,
    address: { '@type': 'PostalAddress', addressLocality: u.city, addressRegion: u.state, addressCountry: 'IN' },
    accreditation: u.naac,
  }
  return [breadcrumb, org]
}

// Pre-render all university pages at build time (ISR-compatible)
// This eliminates per-request cold starts for the 127 most important pages
export async function generateStaticParams() {
  const { UNIVERSITIES } = await import('@/lib/data')
  return UNIVERSITIES.map(u => ({ id: u.id }))
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const u = getUniversityById(params.id)
  if (!u) return { title: 'University Not Found' }

  const seoName = getSeoName(u.id, u.name)
  const mainProg = u.programs[0] || 'MBA'
  const progTitle = PROG_TITLE[mainProg] || `Online ${mainProg}`
  const feeStr = `${formatFee(u.feeMin)}–${formatFee(u.feeMax)}`
  const nirf = u.nirf < 200 ? `NIRF #${u.nirf}` : u.nirfMgt ? `NIRF #${u.nirfMgt} ${u.nirfCategory || 'Mgmt'}` : `NAAC ${u.naac}`

  // ── Title: focus on Review + Placement + Fees (High Intent) ─────
  const cleanName = u.name.replace(/\bOnline\b\s*$/i, '').trim()
  const title = `${seoName} Online Admissions 2026 - Fees, Placements & Honest Review`

  // ── Description: keyword-rich, direct ────────────────────────
  const description = `Direct Admission 2026 at ${seoName} Online. Get honest faculty reviews, actual package/placement stats, and total fees (${feeStr}). ${nirf}, NAAC ${u.naac}. UGC DEB approved. Compare syllabus and apply today!`

  const sn = seoName.toLowerCase()

  // ── Keywords: all program variants from keyword doc ──────────
  const allProgKw = u.programs.flatMap(p => {
    const kw = PROG_KW[p]
    return kw ? [`${sn} ${kw}`, `${sn} ${kw} fees`, `${sn} ${kw} admission`] : []
  })

  const keywords = [
    ...allProgKw,
    // Distance variants (matching keyword doc)
    `${sn} distance mba`,
    `${sn} distance learning mba`,
    `${sn} correspondence mba`,
    // Location
    ...(u.city && u.city !== 'India' ? [`online mba ${u.city.toLowerCase()}`, `${sn} ${u.city.toLowerCase()}`] : []),
    // Generic high-volume terms
    `${sn} nirf rank`,
    `${sn} ugc approved online degree`,
    `${sn} admission 2026`,
    `${sn} october 2026 admission`,
    `${sn} july 2026 batch`,
    `${sn} naac grade`,
    `${sn} ugc approved online`,
    `best online mba india 2026`,
    `ugc deb approved online mba`,
    `online mba for working professionals`,
  ]

  return {
    title,
    description,
    keywords,
    openGraph: {
      images: [{ url: 'https://edifyedu.in/og.png', width: 1200, height: 630 }],
      title,
      description,
      url: `https://edifyedu.in/universities/${u.id}`,
      type: 'website',
    },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}` },
  }
}

export default function UniversityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
