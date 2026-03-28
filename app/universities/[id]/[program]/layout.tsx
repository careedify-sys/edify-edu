import type { Metadata } from 'next'
import { getUniversityById, formatFee } from '@/lib/data'
import type { Program } from '@/lib/data'

// Same SEO name map — shared source of truth
const SEO_NAME: Record<string, string> = {
  'andhra-universi': 'Andhra University', 'koneru-lakshmai-educatio-found': 'KL University',
  'vignans-foundati-for-science': "Vignan's University", 'assam-down-town-universi': 'Assam Don Bosco University',
  'guru-ghasidas-vishwavi': 'Guru Ghasidas University', 'mats-universi': 'Mats University',
  'jamia-hamdard': 'Jamia Hamdard', 'jamia-millia-islamia-universi': 'Jamia Millia Islamia',
  'jawaharl-nehru-universi': 'Jawaharlal Nehru University', 'iift': 'Indian Institute of Foreign Trade',
  'guru-gobind-singh-indrapra': 'Guru Gobind Singh Indraprastha University',
  'gujarat-universi': 'Gujarat University', 'charotar-universi-of-science': 'CHARUSAT',
  'dr-babasahe-ambedkar-open': 'Dr. Babasaheb Ambedkar Open University', 'parul-universi': 'Parul University',
  'marwadi-universi': 'Marwadi University', 'gujarat-technolo-universi': 'Gujarat Technological University',
  'gls-universi': 'GLS University', 'pp-savani-universi': 'PP Savani University', 'ganpat-universi': 'Ganpat University',
  'kurukshe-universi': 'Kurukshetra University', 'maharshi-dayanand-universi': 'Maharshi Dayanand University',
  'maharish-markande-universi': 'Maharishi Markandeshwar University', 'manav-rachna-internat-institut': 'Manav Rachna University',
  'northcap-universi': 'NorthCap University', 'shoolini': 'Shoolini University',
  'universi-of-himachal-pradesh': 'Central University of Himachal Pradesh', 'universi-of-jammu': 'University of Jammu',
  'birla-institut-of-technolo': 'Birla Institute of Technology Mesra', 'arka-jain-universi': 'Arka Jain University',
  'jain': 'JAIN University', 'jss-academy-of-higher': 'JSS Academy of Higher Education',
  'mahe-manipal': 'Manipal Academy of Higher Education', 'bangalor-universi': 'Bangalore University',
  'universi-of-mysore': 'University of Mysore', 'yenepoya-universi': 'Yenepoya University',
  'visveswa-technolo-universi': 'VTU Online', 'karnatak-state-open-universi': 'Karnataka State Open University',
  'christ-deemed-to-be': 'Christ University', 'dayanand-sagar-universi': 'Dayananda Sagar University',
  'alliance-universi': 'Alliance University', 'adichunc-universi': 'Adichunchanagiri University',
  'mahatma-gandhi-universi': 'Mahatma Gandhi University', 'universi-of-kerala': 'University of Kerala',
  'devi-ahilya-vishwavi': 'Devi Ahilya Vishwavidyalaya', 'sage-universi': 'SAGE University',
  'dr-dy-patil-vidyapeeth': 'DY Patil Vidyapeeth Pune', 'dypatil': 'DY Patil University Navi Mumbai',
  'symbiosis': 'Symbiosis International University', 'bharati-vidyapee-universi': 'Bharati Vidyapeeth University',
  'datta-meghe-institut-of': 'Datta Meghe Institute', 'universi-of-mumbai': 'University of Mumbai',
  'nmims': 'NMIMS', 'shivaji-universi': 'Shivaji University', 'savitrib-phule-pune-universi': 'Savitribai Phule Pune University',
  'mizoram-universi': 'Mizoram University', 'kalinga-institut-of-industri': 'KIIT University',
  'centurio-universi-of-technolo': 'Centurion University', 'kiit-universi': 'KIIT University',
  'chandigarh': 'Chandigarh University', 'chitkara-universi': 'Chitkara University',
  'lpu': 'LPU', 'guru-nanak-dev-universi': 'Guru Nanak Dev University',
  'guru-kashi-universi': 'Guru Kashi University', 'desh-bhagat-universi': 'Desh Bhagat University',
  'manipal-jaipur': 'Manipal University Jaipur', 'vivekana-global-universi': 'Vivekananda Global University',
  'banastha-vidyapit': 'Banasthali Vidyapith', 'mody-universi-of-science': 'Mody University',
  'amity': 'Amity University', 'jaipur-national-universi': 'Jaipur National University', 'jagan-nath-universi': 'Jagannath University',
  'sikkim-manipal': 'Sikkim Manipal University', 'srm-sikkim-universi': 'SRM University Sikkim',
  'bharathidasan-uni': 'Bharathidasan University', 'madurai-kamaraj-universi': 'Madurai Kamaraj University',
  'dr-mgr-educatio-and': 'Dr MGR Educational Institute', 'sastra-deemed-universi': 'SASTRA Deemed University',
  'shanmugh-arts-science-technolo': 'SASTRA Deemed University', 'sathyaba-institut-of-science': 'Sathyabama Institute',
  'srm-institut-of-science': 'SRM Institute of Science and Technology', 'universi-of-madras': 'University of Madras',
  'kalasali-academy-of-research': 'Kalasalingam Academy', 'amrita-vishwa-vidyapee': 'Amrita University',
  'alagappa-universi': 'Alagappa University', 'bharathi-universi': 'Bharathiar University',
  'vellore-institut-of-technolo': 'Vellore Institute of Technology', 'vellore-vit-online': 'VIT Online',
  'manonman-sundaran-universi': 'Manonmaniam Sundaranar University',
  'hindusta-institut-of-technolo': 'Hindustan Institute of Technology and Science',
  'hindusta-institut-of-technolo-2': 'Hindustan Institute of Technology and Science',
  'karunya-institut-of-technolo': 'Karunya Institute of Technology and Sciences',
  'karunya-kcode-universi': 'Karunya Institute of Technology and Sciences',
  'anna-universi': 'Anna University', 'vels-institut-of-science': 'VISTAS Online',
  'sri-ramachandra-universi': 'Sri Ramachandra Institute', 'amet-universi': 'AMET University',
  'icfai-foundati-for-higher': 'ICFAI Foundation for Higher Education',
  'aligarh-muslim-universi': 'Aligarh Muslim University', 'sharda-universi': 'Sharda University',
  'mangalay-universi': 'Mangalayatan University', 'shiv-nadar-institut-of': 'Shiv Nadar University',
  'integral-universi': 'Integral University', 'gla-universi': 'GLA University',
  'universi-of-lucknow': 'University of Lucknow', 'noida-internat-universi': 'Noida International University',
  'galgotia-universi': 'Galgotias University', 'shobhit-universi': 'Shobhit University',
  'teerthanker-universi': 'Teerthanker Mahaveer University', 'subharti-universi': 'Swami Vivekanand Subharti University',
  'jaypee-universi': 'Jaypee Institute of Information Technology',
  'graphic-era-universi': 'Graphic Era University', 'universi-of-petroleu-and': 'UPES',
  'uttaranc-universi': 'Uttaranchal University', 'bits-pilani-work-integrat': 'BITS Pilani',
  'sgt-universi': 'SGT University', 'bs-abdur-rahman-institut': 'BS Abdur Rahman Crescent Institute',
}

const PM: Record<string, string> = {
  'mba': 'MBA', 'mca': 'MCA', 'bba': 'BBA', 'bca': 'BCA', 'ba': 'BA',
  'bcom': 'B.Com', 'mcom': 'M.Com', 'ma': 'MA', 'msc': 'MSc', 'bsc': 'BSc',
}

const PROG_TITLE: Record<string, string> = {
  MBA: 'Online MBA', MCA: 'Online MCA', BBA: 'Online BBA', BCA: 'Online BCA',
  'B.Com': 'Online B.Com', BA: 'Online BA', 'M.Com': 'Online M.Com',
  MA: 'Online MA', MSc: 'Online MSc', BSc: 'Online BSc',
}

const PROG_KW: Record<string, string> = {
  MBA: 'online mba', MCA: 'online mca', BBA: 'online bba', BCA: 'online bca',
  'B.Com': 'online bcom', BA: 'online ba', 'M.Com': 'online mcom',
  MA: 'online ma', MSc: 'online msc', BSc: 'online bsc',
}

function getSeoName(id: string, fullName: string): string {
  if (SEO_NAME[id]) return SEO_NAME[id]
  let n = fullName.split(/\s*[–—]\s*/)[0].trim()
  n = n.replace(/\s*\([^)]+\)\s*$/, '').replace(/\s+Online\s*$/i, '').trim()
  if (n.length > 40) n = n.split(' ').slice(0, 4).join(' ')
  return n
}


// Pre-render all university×program combinations at build time
export async function generateStaticParams() {
  const { UNIVERSITIES } = await import('@/lib/data')
  return UNIVERSITIES.flatMap(u =>
    u.programs.map(prog => ({
      id: u.id,
      program: prog.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }))
  )
}

export async function generateMetadata({ params }: { params: { id: string; program: string } }): Promise<Metadata> {
  const u = getUniversityById(params.id)
  const prog = PM[params.program?.toLowerCase()] || params.program?.toUpperCase()
  if (!u || !prog) return { title: 'Program Not Found' }

  const seoName = getSeoName(u.id, u.name)
  const progTitle = PROG_TITLE[prog] || `Online ${prog}`
  const progKw = PROG_KW[prog] || `online ${prog.toLowerCase()}`
  const pd = u.programDetails[prog as keyof typeof u.programDetails]
  const fee = pd?.fees || `${formatFee(u.feeMin)}–${formatFee(u.feeMax)}`
  const specs = pd?.specs?.slice(0, 3).join(', ') || ''
  const nirf = u.nirf < 200 ? `NIRF #${u.nirf}` : u.nirfMgt ? `NIRF #${u.nirfMgt} ${u.nirfCategory || 'Mgmt'}` : `NAAC ${u.naac}`

  // ── Title: NO Edify branding ──────────────────────────────────
  // Use top spec in title for better long-tail SEO
  const cleanName = u.name.replace(/\bOnline\b\s*$/i, '').trim()
  const topSpec = u.programDetails[prog as Program]?.specs?.[0]
  const specSuffix = topSpec && topSpec !== 'General' ? ` in ${topSpec}` : ''
  const title = `${progTitle}${specSuffix} | ${seoName} | ${nirf} | 2026`

  const description = `Admissions open Oct 15–30, 2026. Online ${progTitle} at ${seoName}: ${fee} total, NAAC ${u.naac}${u.nirf < 200 ? `, NIRF #${u.nirf}` : ''}.${specs ? ` Specs: ${specs}.` : ''} UGC DEB approved. Compare & apply!`

  const sn = seoName.toLowerCase()

  // ── Keywords: exact patterns from keyword doc ─────────────────
  const keywords = [
    // Primary — program-first (matches how users search: "online mba amity university")
    `${progKw} ${sn}`,
    `${progKw} ${sn} 2026`,
    `${progKw} ${sn} fees`,
    `${progKw} ${sn} admission`,
    `${progKw} ${sn} syllabus`,
    `${progKw} ${sn} reviews`,
    // University-first variants (also indexed)
    `${sn} ${progKw}`,
    `${sn} ${progKw} fees`,
    `${sn} ${progKw} admission 2026`,
    `${sn} ${progKw} october 2026 admission`,
    `online ${progKw} ${sn} 2026`,
    `${sn} ${progKw} july batch 2026`,
    `${sn} ${progKw} validity`,
    `${sn} ${progKw} eligibility`,
    `${sn} ${progKw} specialisation`,
    // Distance variants
    `${sn} distance ${prog.toLowerCase()}`,
    `${sn} distance learning ${prog.toLowerCase()}`,
    `${sn} correspondence ${prog.toLowerCase()}`,
    // Generic high-value
    `${sn} nirf rank`, `${sn} ugc approved`,
    ...(specs ? specs.split(', ').slice(0, 3).map(s => `${sn} ${progKw} ${s.toLowerCase()}`) : []),
    // Program-level high volume
    `best ${progKw} india 2026`,
    `ugc deb approved ${progKw}`,
    `${progKw} for working professionals`,
    ...(u.city && u.city !== 'India' ? [`${progKw} ${u.city.toLowerCase()}`] : []),
  ]

  return {
    title,
    description,
    keywords,
    openGraph: { title, description, url: `https://edifyedu.in/universities/${u.id}/${params.program}` },
    twitter: { card: 'summary_large_image', site: '@edifyedu' },
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/${params.program}` },
  }
}

export default function ProgramLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
