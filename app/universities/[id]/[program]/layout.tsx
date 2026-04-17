import type { Metadata } from 'next'
import { getUniversityById, formatFee } from '@/lib/data'
import type { Program } from '@/lib/data'
import { getTitleName } from '@/lib/seo-title'

// Same SEO name map — shared source of truth
const SEO_NAME: Record<string, string> = {
  'andhra-university-online': 'Andhra University', 'kl-university-online': 'KL University',
  'vignan-university-online': "Vignan's University", 'assam-don-bosco-university-online': 'Assam Don Bosco University',
  'guru-ghasidas-vishwavidyalaya-online': 'Guru Ghasidas University', 'mats-university-online': 'Mats University',
  'jamia-hamdard-online': 'Jamia Hamdard', 'jamia-millia-islamia-online': 'Jamia Millia Islamia',
  'jawaharlal-nehru-university-online': 'Jawaharlal Nehru University', 'iift-online': 'Indian Institute of Foreign Trade',
  'guru-gobind-singh-indraprastha-university-online': 'Guru Gobind Singh Indraprastha University',
  'gujarat-university-online': 'Gujarat University', 'charusat-university-online': 'CHARUSAT',
  'dr-babasaheb-ambedkar-open-university-online': 'Dr. Babasaheb Ambedkar Open University', 'parul-university-online': 'Parul University',
  'marwadi-university-online': 'Marwadi University', 'gujarat-technological-university-online': 'Gujarat Technological University',
  'gls-university-online': 'GLS University', 'pp-savani-university-online': 'PP Savani University', 'ganpat-university-online': 'Ganpat University',
  'kurukshetra-university-online': 'Kurukshetra University', 'maharshi-dayanand-university-online': 'Maharshi Dayanand University',
  'maharishi-markandeshwar-university-online': 'Maharishi Markandeshwar University', 'manav-rachna-online': 'Manav Rachna University',
  'northcap-university-online': 'NorthCap University', 'shoolini-university-online': 'Shoolini University',
  'central-university-himachal-pradesh-online': 'Central University of Himachal Pradesh', 'university-of-jammu-online': 'University of Jammu',
  'bits-pilani-online': 'Birla Institute of Technology Mesra', 'arka-jain-university-online': 'Arka Jain University',
  'jain-university-online': 'JAIN University', 'jss-university-online': 'JSS Academy of Higher Education',
  'manipal-academy-higher-education-online': 'Manipal Academy of Higher Education', 'bangalore-university-online': 'Bangalore University',
  'university-of-mysore-online': 'University of Mysore', 'yenepoya-university-online': 'Yenepoya University',
  'vtu-online': 'VTU Online', 'karnataka-state-open-university-online': 'Karnataka State Open University',
  'christ-university-online': 'Christ University', 'dayananda-sagar-university-online': 'Dayananda Sagar University',
  'alliance-university-online': 'Alliance University', 'adichunchanagiri-university-online': 'Adichunchanagiri University',
  'mahatma-gandhi-university-online': 'Mahatma Gandhi University', 'university-of-kerala-online': 'University of Kerala',
  'devi-ahilya-vishwavidyalaya-online': 'Devi Ahilya Vishwavidyalaya', 'sage-university-online': 'SAGE University',
  'dr-dy-patil-vidyapeeth-online': 'DY Patil Vidyapeeth Pune', 'dy-patil-university-online': 'DY Patil University Navi Mumbai',
  'symbiosis-university-online': 'Symbiosis International University', 'bharati-vidyapeeth-university-online': 'Bharati Vidyapeeth University',
  'datta-meghe-university-online': 'Datta Meghe Institute', 'university-of-mumbai-online': 'University of Mumbai',
  'nmims-online': 'NMIMS', 'shivaji-university-online': 'Shivaji University', 'savitribai-phule-pune-university-online': 'Savitribai Phule Pune University',
  'mizoram-university-online': 'Mizoram University', 'kalinga-institute-industrial-technology-online': 'KIIT University',
  'centurion-university-online': 'Centurion University', 'kiit-university-online': 'KIIT University',
  'chandigarh-university-online': 'Chandigarh University', 'chitkara-university-online': 'Chitkara University',
  'lovely-professional-university-online': 'LPU', 'guru-nanak-dev-university-online': 'Guru Nanak Dev University',
  'guru-kashi-university-online': 'Guru Kashi University', 'desh-bhagat-university-online': 'Desh Bhagat University',
  'manipal-university-jaipur-online': 'Manipal University Jaipur', 'vivekananda-global-university-online': 'Vivekananda Global University',
  'banasthali-vidyapith-online': 'Banasthali Vidyapith', 'mody-university-online': 'Mody University',
  'amity-university-online': 'Amity University', 'jaipur-national-university-online': 'Jaipur National University', 'jagannath-university-online': 'Jagannath University',
  'sikkim-manipal-university-online': 'Sikkim Manipal University', 'srm-university-sikkim-online': 'SRM University Sikkim',
  'bharathidasan-university-online': 'Bharathidasan University', 'madurai-kamaraj-university-online': 'Madurai Kamaraj University',
  'dr-mgr-educational-research-institute-online': 'Dr MGR Educational Institute', 'sastra-university-online': 'SASTRA Deemed University',
  'shanmugha-arts-science-technology-research-online': 'SASTRA Deemed University', 'sathyabama-university-online': 'Sathyabama Institute',
  'srm-institute-science-technology-online': 'SRM Institute of Science and Technology', 'university-of-madras-online': 'University of Madras',
  'kalasalingam-university-online': 'Kalasalingam Academy', 'amrita-vishwa-vidyapeetham-online': 'Amrita University',
  'alagappa-university-online': 'Alagappa University', 'bharathiar-university-online': 'Bharathiar University',
  'vit-university-online': 'Vellore Institute of Technology', 'vit-vellore-online': 'VIT Online',
  'manonmaniam-sundaranar-university-online': 'Manonmaniam Sundaranar University',
  'hindustan-institute-technology-online': 'Hindustan Institute of Technology and Science',
  'hindusta-institut-of-technolo-2': 'Hindustan Institute of Technology and Science',
  'karunya-university-online': 'Karunya Institute of Technology and Sciences',
  'karunya-kcode-online': 'Karunya Institute of Technology and Sciences',
  'anna-university-online': 'Anna University', 'vels-university-online': 'VISTAS Online',
  'sri-ramachandra-university-online': 'Sri Ramachandra Institute', 'amet-university-online': 'AMET University',
  'icfai-university-online': 'ICFAI Foundation for Higher Education',
  'aligarh-muslim-university-online': 'Aligarh Muslim University', 'sharda-university-online': 'Sharda University',
  'mangalayatan-university-online': 'Mangalayatan University', 'shiv-nadar-university-online': 'Shiv Nadar University',
  'integral-university-online': 'Integral University', 'gla-university-online': 'GLA University',
  'university-of-lucknow-online': 'University of Lucknow', 'noida-international-university-online': 'Noida International University',
  'galgotias-university-online': 'Galgotias University', 'shobhit-university-online': 'Shobhit University',
  'teerthanker-mahaveer-university-online': 'Teerthanker Mahaveer University', 'subharti-university-online': 'Swami Vivekanand Subharti University',
  'jaypee-university-online': 'Jaypee Institute of Information Technology',
  'graphic-era-university-online': 'Graphic Era University', 'upes-online': 'UPES',
  'uttaranchal-university-online': 'Uttaranchal University', 'bits-pilani-work-integrated-online': 'BITS Pilani',
  'sgt-university-online': 'SGT University', 'bs-abdur-rahman-university-online': 'BS Abdur Rahman Crescent Institute',
}

const PM: Record<string, string> = {
  'mba': 'MBA', 'mca': 'MCA', 'bba': 'BBA', 'bca': 'BCA', 'ba': 'B.A',
  'bcom': 'B.Com', 'mcom': 'M.Com', 'ma': 'M.A', 'msc': 'M.Sc', 'bsc': 'B.Sc',
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


// Pre-render only university×program combinations that have programDetails
export async function generateStaticParams() {
  const { UNIVERSITIES } = await import('@/lib/data')
  return UNIVERSITIES.flatMap(u =>
    u.programs
      .filter(prog => !!u.programDetails[prog as keyof typeof u.programDetails])
      .map(prog => ({
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

  const titleName = getTitleName(u.id, u.name, u.abbr)
  const title = `${titleName} ${progTitle} — Fees & Syllabus 2026 | EdifyEdu`

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
