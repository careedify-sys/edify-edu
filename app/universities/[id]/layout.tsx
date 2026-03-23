import type { Metadata } from 'next'
import { getUniversityById, formatFee } from '@/lib/data'
import type { University } from '@/lib/data'

// ─── Canonical SEO name per university ID (from keyword research doc) ───
const SEO_NAME: Record<string, string> = {
  // Andhra Pradesh
  'andhra-universi': 'Andhra University',
  'koneru-lakshmai-educatio-found': 'KL University',
  'vignans-foundati-for-science': "Vignan's University",
  // Assam
  'assam-down-town-universi': 'Assam Don Bosco University',
  // Chhattisgarh
  'guru-ghasidas-vishwavi': 'Guru Ghasidas University',
  'mats-universi': 'Mats University',
  // Delhi
  'jamia-hamdard': 'Jamia Hamdard',
  'jamia-millia-islamia-universi': 'Jamia Millia Islamia',
  'jawaharl-nehru-universi': 'Jawaharlal Nehru University',
  'guru-gobind-singh-indrapra': 'Guru Gobind Singh Indraprastha University',
  'iift': 'Indian Institute of Foreign Trade',
  // Gujarat
  'gujarat-universi': 'Gujarat University',
  'charotar-universi-of-science': 'Charotar University of Science and Technology',
  'dr-babasahe-ambedkar-open': 'Dr. Babasaheb Ambedkar Open University',
  'parul-universi': 'Parul University',
  'marwadi-universi': 'Marwadi University',
  'gujarat-technolo-universi': 'Gujarat Technological University',
  'gls-universi': 'GLS University',
  'pp-savani-universi': 'PP Savani University',
  'ganpat-universi': 'Ganpat University',
  // Haryana
  'guru-jambhesh-universi-of': 'Guru Jambheshwar University',
  'kurukshe-universi': 'Kurukshetra University',
  'maharshi-dayanand-universi': 'Maharshi Dayanand University',
  'maharish-markande-universi': 'Maharishi Markandeshwar University',
  'manav-rachna-internat-institut': 'Manav Rachna University',
  'shree-guru-gobind-singh': 'Shree Guru Gobind Singh Tricentenary University',
  'northcap-universi': 'NorthCap University',
  // Himachal Pradesh
  'shoolini': 'Shoolini University',
  'universi-of-himachal-pradesh': 'Central University of Himachal Pradesh',
  // Jammu & Kashmir
  'universi-of-jammu': 'University of Jammu',
  // Jharkhand
  'birla-institut-of-technolo': 'Birla Institute of Technology Mesra',
  'arka-jain-universi': 'Arka Jain University',
  // Karnataka
  'jain': 'JAIN University',
  'jss-academy-of-higher': 'JSS Academy of Higher Education',
  'mahe-manipal': 'Manipal Academy of Higher Education',
  'bangalor-universi': 'Bangalore University',
  'universi-of-mysore': 'University of Mysore',
  'yenepoya-universi': 'Yenepoya University',
  'visveswa-technolo-universi': 'VTU Online',
  'karnatak-state-open-universi': 'Karnataka State Open University',
  'christ-deemed-to-be': 'Christ University',
  'dayanand-sagar-universi': 'Dayananda Sagar University',
  'alliance-universi': 'Alliance University',
  'adichunc-universi': 'Adichunchanagiri University',
  // Kerala
  'mahatma-gandhi-universi': 'Mahatma Gandhi University',
  'universi-of-kerala': 'University of Kerala',
  // Madhya Pradesh
  'devi-ahilya-vishwavi': 'Devi Ahilya Vishwavidyalaya',
  'sage-universi': 'SAGE University',
  // Maharashtra
  'dr-dy-patil-vidyapeeth': 'DY Patil Vidyapeeth Pune',
  'dypatil': 'DY Patil University Navi Mumbai',
  'symbiosis': 'Symbiosis International University',
  'bharati-vidyapee-universi': 'Bharati Vidyapeeth University',
  'datta-meghe-institut-of': 'Datta Meghe Institute of Higher Education',
  'universi-of-mumbai': 'University of Mumbai',
  'nmims': 'NMIMS',
  'shivaji-universi': 'Shivaji University',
  'savitrib-phule-pune-universi': 'Savitribai Phule Pune University',
  // Mizoram
  'mizoram-universi': 'Mizoram University',
  // Odisha
  'kalinga-institut-of-industri': 'KIIT University',
  'centurio-universi-of-technolo': 'Centurion University',
  'kiit-universi': 'KIIT University',
  // Punjab
  'chandigarh': 'Chandigarh University',
  'chitkara-universi': 'Chitkara University',
  'lpu': 'LPU',
  'guru-nanak-dev-universi': 'Guru Nanak Dev University',
  'guru-kashi-universi': 'Guru Kashi University',
  'desh-bhagat-universi': 'Desh Bhagat University',
  // Rajasthan
  'manipal-jaipur': 'Manipal University Jaipur',
  'vivekana-global-universi': 'Vivekananda Global University',
  'banastha-vidyapit': 'Banasthali Vidyapith',
  'mody-universi-of-science': 'Mody University',
  'amity': 'Amity University',
  'jaipur-national-universi': 'Jaipur National University',
  'jagan-nath-universi': 'Jagannath University',
  // Sikkim
  'sikkim-manipal': 'Sikkim Manipal University',
  'srm-sikkim-universi': 'SRM University Sikkim',
  'shri-ramasamy-memorial-univers': 'Shri Ramasamy Memorial University',
  // Tamil Nadu
  'bharathidasan-uni': 'Bharathidasan University',
  'bharath-institut-of-higher': 'Bharath Institute of Higher Education and Research',
  'bs-abdur-rahman-institut': 'BS Abdur Rahman Crescent Institute',
  'madurai-kamaraj-universi': 'Madurai Kamaraj University',
  'dr-mgr-educatio-and': 'Dr MGR Educational and Research Institute',
  'shanmugh-arts-science-technolo': 'SASTRA Deemed University',
  'sastra-deemed-universi': 'SASTRA Deemed University',
  'sathyaba-institut-of-science': 'Sathyabama Institute of Science and Technology',
  'srm-institut-of-science': 'SRM Institute of Science and Technology',
  'universi-of-madras': 'University of Madras',
  'kalasali-academy-of-research': 'Kalasalingam Academy of Research and Education',
  'amrita-vishwa-vidyapee': 'Amrita University',
  'alagappa-universi': 'Alagappa University',
  'bharathi-universi': 'Bharathiar University',
  'vellore-institut-of-technolo': 'Vellore Institute of Technology',
  'vellore-vit-online': 'Vellore Institute of Technology',
  'manonman-sundaran-universi': 'Manonmaniam Sundaranar University',
  'hindusta-institut-of-technolo': 'Hindustan Institute of Technology and Science',
  'hindusta-institut-of-technolo-2': 'Hindustan Institute of Technology and Science',
  'karunya-institut-of-technolo': 'Karunya Institute of Technology and Sciences',
  'karunya-kcode-universi': 'Karunya Institute of Technology and Sciences',
  'meenaksh-academy-of-higher': 'Meenakshi Academy of Higher Education and Research',
  'anna-universi': 'Anna University',
  'vels-institut-of-science': 'Vel\'s Institute of Science Technology and Advanced Studies',
  'sri-ramachandra-universi': 'Sri Ramachandra Institute of Higher Education and Research',
  'amet-universi': 'Academy of Maritime Education and Training',
  // Telangana
  'icfai-foundati-for-higher': 'ICFAI Foundation for Higher Education',
  'internat-institut-of-informat': 'International Institute of Information Technology',
  // Uttar Pradesh
  'aligarh-muslim-universi': 'Aligarh Muslim University',
  'sharda-universi': 'Sharda University',
  'mangalay-universi': 'Mangalayatan University',
  'shiv-nadar-institut-of': 'Shiv Nadar University',
  'integral-universi': 'Integral University',
  'gla-universi': 'GLA University',
  'dayal-bagh-educatio-institut': 'Dayal Bagh Educational Institute',
  'universi-of-lucknow': 'University of Lucknow',
  'noida-internat-universi': 'Noida International University',
  'chatrapa-shahuji-maharaj-unive': 'Chhatrapati Shahu Ji Maharaj University',
  'galgotia-universi': 'Galgotias University',
  'mahatma-jyotiba-phule-rohilkha': 'Mahatma Jyotiba Phule Rohilkhand University',
  'deen-dayal-upadhyay-gorakhpu': 'Deen Dayal Upadhyay Gorakhpur University',
  'shobhit-universi': 'Shobhit University',
  'teerthanker-universi': 'Teerthanker Mahaveer University',
  'subharti-universi': 'Swami Vivekanand Subharti University',
  'jaypee-universi': 'Jaypee Institute of Information Technology',
  // Uttarakhand
  'graphic-era-universi': 'Graphic Era University',
  'universi-of-petroleu-and': 'UPES',
  'uttaranc-universi': 'Uttaranchal University',
  // Others
  'bits-pilani-work-integrat': 'BITS Pilani',
  'sgt-universi': 'SGT University',
  'alvas-college': "Alva's College",
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
