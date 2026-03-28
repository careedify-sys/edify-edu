// @ts-nocheck
'use client'
// Auth: Protected by middleware.ts — no client-side password check needed

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, 
         ArrowLeft, RefreshCw, ChevronDown, ChevronRight, Lock } from 'lucide-react'


function parseNirf(s) {
  const m = String(s || '').match(/#?(\d+)/)
  return m ? parseInt(m[1]) : 999
}

function parseNaac(s) {
  const str = String(s || '')
  if (str.includes('A++')) return 'A++'
  if (str.includes('A+')) return 'A+'
  if (str.includes('A')) return 'A'
  if (str.includes('B++')) return 'B++'
  return 'A'
}

function parseLocation(loc) {
  if (!loc) return { city: '', state: '' }
  const parts = String(loc).replace(/\s*\([^)]*\)/g, '').split(',').map(p => p.trim())
  return { city: parts[0] || '', state: parts[parts.length - 1] || '' }
}

function getRegion(state) {
  const s = String(state).toLowerCase()
  if (['delhi','punjab','haryana','uttar pradesh','himachal','jammu','uttarakhand','rajasthan','chandigarh'].some(n => s.includes(n))) return 'North'
  if (['karnataka','tamil','kerala','andhra','telangana','pondicherry'].some(n => s.includes(n))) return 'South'
  if (['west bengal','odisha','assam','jharkhand','mizoram','sikkim','bihar'].some(n => s.includes(n))) return 'East'
  if (['maharashtra','gujarat','goa'].some(n => s.includes(n))) return 'West'
  return 'Central'
}

function parseSpecs(s) {
  if (!s || s === 'None' || s === 'nan') return []
  return String(s).split(/\s*[|,]\s*/).map(p => p.trim()).filter(p => p.length > 2 && !['No','Yes','Dual','None'].includes(p)).slice(0, 14)
}

function parseList(s, max = 8) {
  if (!s || s === 'None' || s === 'nan') return []
  return String(s).split(/\s*[|,;\n]\s*/).map(p => p.trim()).filter(p => p.length > 2).slice(0, max)
}

function parseEdifySkills(s) {
  if (!s) return []
  return String(s).split('\n')
    .map(l => l.trim().replace(/^[📚🔗🎯💡•\-\*\s]+/, '').replace(/\s*\([^)]+\)/, '').trim())
    .filter(l => l.length > 3 && !['RECOMMENDED','SKILLS','TOOLS','PROGRAM','alongside'].some(kw => l.includes(kw)))
    .slice(0, 8)
}

function parseEdifyInternships(s) {
  if (!s) return []
  return String(s).split('\n')
    .map(l => l.trim().replace(/^[📚🔗🎯💡•\-\*\s]+/, '').trim())
    .filter(l => l.length > 5 && !['INTERNSHIP','TARGET','APPLY'].some(kw => l.includes(kw)) && l.includes('Intern'))
    .slice(0, 4)
}

function ts(s, max = 150) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ').trim().slice(0, max)
}

function tsArr(items, max = 12) {
  const filtered = (items || []).filter(Boolean).slice(0, max)
  return filtered.length ? `[${filtered.map(i => `'${ts(String(i).slice(0, 80))}'`).join(', ')}]` : '[]'
}

function generateUniTS(u) {
  const progList = (u.programs || []).map(p => `'${p}'`).join(', ')
  const progDetails = Object.entries(u.programDetails || {}).map(([prog, pd]) => {
    return `      '${prog}': {
        specs: ${tsArr(pd.specs, 14)},
        fees: '${ts(pd.fees)}',
        duration: '${ts(pd.duration)}',
        roles: ${tsArr(pd.roles, 6)},
        avgSalary: '${ts(pd.avgSalary)}',
        topCompanies: ${tsArr(pd.topCompanies, 10)},
        internshipType: 'Industry project and virtual internship',
        careerOutcome: '${ts(pd.careerOutcome)}',
        edifySkills: ${tsArr(pd.edifySkills || [], 8)},
        edifyInternships: ${tsArr(pd.edifyInternships || [], 4)},
      }`
  }).join(',\n')

  return `  {
    id: '${u.id}',
    name: '${ts(u.name, 100)}',
    abbr: '${ts(u.abbr, 10)}',
    city: '${ts(u.city, 40)}',
    state: '${ts(u.state, 40)}',
    region: '${u.region || "Central"}',
    nirf: ${u.nirf || 999},
    naac: '${u.naac || "A"}',
    ugc: true,
    approvals: ${tsArr(u.approvals || ['UGC DEB'])},
    examMode: 'Online',
    govtRecognised: true,
    psuEligible: true,
    feeMin: ${u.feeMin || 60000},
    feeMax: ${u.feeMax || 200000},
    emiFrom: ${u.emiFrom || 2500},
    eligibility: '${ts(u.eligibility || '50% in graduation')}',
    eligibilityPct: ${u.eligibilityPct || 50},
    highlight: '${ts(u.highlight || `NAAC ${u.naac} · UGC DEB approved`)}',
    tagline: '${ts(u.tagline || `${u.naac} accredited university with UGC DEB approved online programs`, 120)}',
    description: '${ts(u.description || `UGC DEB approved programs from ${u.name?.slice(0,40)}.`)}',
    forWho: ${tsArr(u.forWho || ['Working professionals'])},
    notFor: ${tsArr(u.notFor || ['Students needing on-campus experience'])},
    programs: [${progList}],
    programDetails: {
${progDetails}
    },
    color: '${u.color || '#1B4FBE'}',
  }`
}

const DATA_TS_HEADER = `// lib/data.ts — Edify University Database
// Auto-generated from Excel import
// DO NOT EDIT MANUALLY — use /admin/excel-import to update

export type Program = 'MBA' | 'MCA' | 'BBA' | 'BCA' | 'BA' | 'B.Com' | 'M.Com' | 'MA' | 'MSc' | 'BSc' | 'MBA (WX)'

export interface SpecRoles {
  [spec: string]: { roles: string[]; salary: string; companies: string[] }
}

export interface ProgramDetail {
  specs: string[]
  fees: string
  roles: string[]
  avgSalary: string
  topCompanies: string[]
  internshipType: string
  careerOutcome: string
  duration: string
  specRoles?: SpecRoles
  edifySkills?: string[]
  edifyInternships?: string[]
}

export interface UniFeature { label: string; icon: string; detail: string }

export interface University {
  id: string; name: string; abbr: string; city: string; state: string
  region: 'North' | 'South' | 'West' | 'East' | 'Central'
  nirf: number; nirfm?: number; nirfCategory?: string; naac: string; naacScore?: string
  ugc: boolean; approvals: string[]
  examMode: 'Online' | 'Assignment-based' | 'Exam Centre' | 'Hybrid'
  govtRecognised: boolean; psuEligible: boolean
  feeMin: number; feeMax: number; emiFrom: number
  eligibility: string; eligibilityPct: number
  highlight: string; tagline: string; description: string
  forWho: string[]; notFor: string[]
  programs: Program[]
  programDetails: Partial<Record<Program, ProgramDetail>>
  specialFeatures?: UniFeature[]
  color: string
}

export function formatFee(n: number): string {
  if (n >= 100000) return \`₹\${(n / 100000).toFixed(1)}L\`
  return \`₹\${(n / 1000).toFixed(0)}K\`
}
export function getUniversityById(id: string) { return UNIVERSITIES.find(u => u.id === id) }
export function getUniversitiesByProgram(program: Program) {
  return UNIVERSITIES.filter(u => u.programs.includes(program)).sort((a, b) => a.nirf - b.nirf)
}
export function getAllPrograms(): Program[] {
  const all = new Set<Program>()
  UNIVERSITIES.forEach(u => u.programs.forEach(p => all.add(p)))
  return Array.from(all).sort()
}
export function getAllSpecs(program: Program): string[] {
  const all = new Set<string>()
  UNIVERSITIES.forEach(u => { u.programDetails[program]?.specs.forEach(s => all.add(s)) })
  return Array.from(all).sort()
}
export const PROGRAM_META: Record<string, { icon: string; desc: string; duration: string; level: 'UG' | 'PG' }> = {
  'MBA': { icon: '💼', desc: 'Master of Business Administration', duration: '2 Years', level: 'PG' },
  'MBA (WX)': { icon: '🏆', desc: 'MBA for Working Executives', duration: '2 Years', level: 'PG' },
  'MCA': { icon: '💻', desc: 'Master of Computer Applications', duration: '2 Years', level: 'PG' },
  'MA': { icon: '📖', desc: 'Master of Arts', duration: '2 Years', level: 'PG' },
  'M.Com': { icon: '📊', desc: 'Master of Commerce', duration: '2 Years', level: 'PG' },
  'MSc': { icon: '🔬', desc: 'Master of Science', duration: '2 Years', level: 'PG' },
  'BBA': { icon: '🎓', desc: 'Bachelor of Business Administration', duration: '3 Years', level: 'UG' },
  'BCA': { icon: '🖥️', desc: 'Bachelor of Computer Applications', duration: '3 Years', level: 'UG' },
  'BA': { icon: '📚', desc: 'Bachelor of Arts', duration: '3 Years', level: 'UG' },
  'B.Com': { icon: '💰', desc: 'Bachelor of Commerce', duration: '3 Years', level: 'UG' },
  'BSc': { icon: '⚗️', desc: 'Bachelor of Science', duration: '3 Years', level: 'UG' },
}
export function getPrograms(u: University) { return u.programs }
export function getFees(u: University, program: Program) { return u.programDetails[program]?.fees || null }
export function getSpecs(u: University, program: Program) { return u.programDetails[program]?.specs || [] }
`

export default function ExcelImportPage() {
  const [file, setFile] = useState(null)
  const [step, setStep] = useState('upload')
  const [parsedData, setParsedData] = useState([])
  const [error, setError] = useState('')
  const [expandedRow, setExpandedRow] = useState(null)
  const [log, setLog] = useState([])
  const fileRef = useRef(null)
  const xlsxRef = useRef(null)

  async function loadXLSX() {
    if (xlsxRef.current) return xlsxRef.current
    if (window.XLSX) { xlsxRef.current = window.XLSX; return window.XLSX }
    return new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
      s.onload = () => { xlsxRef.current = window.XLSX; resolve(window.XLSX) }
      s.onerror = () => reject(new Error('Failed to load SheetJS. Check internet connection.'))
      document.head.appendChild(s)
    })
  }

  async function parseExcel(f) {
    setStep('parsing'); setError('')
    const lines = []
    try {
      const XLSX = await loadXLSX()
      lines.push('✓ SheetJS loaded')
      const buffer = await f.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      lines.push(`✓ Sheets: ${wb.SheetNames.join(', ')}`)

      const allSheet = wb.SheetNames.find(n => n.toLowerCase().includes('all program'))
      const summSheet = wb.SheetNames.find(n => n.toLowerCase().includes('summary') || n.toLowerCase().includes('university') || n.toLowerCase().includes('quick reference'))
      lines.push(`📋 All Programs: ${allSheet || 'NOT FOUND'} | Summary: ${summSheet || 'NOT FOUND'}`)

      const programsByUni = {}

      if (allSheet) {
        const ws = wb.Sheets[allSheet]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        
        // Find header row (look for row with "University" and "Degree" columns)
        let headerRow = -1
        for (let i = 0; i < Math.min(6, rows.length); i++) {
          if (rows[i].some(c => String(c).toLowerCase() === 'university' || String(c).toLowerCase() === 'degree')) {
            headerRow = i; break
          }
        }

        if (headerRow >= 0) {
          const H = rows[headerRow].map(h => String(h || '').trim().toLowerCase())
          lines.push(`✓ Header row ${headerRow}: ${H.slice(0,6).join(' | ')}`)
          
          const ci = name => {
            const variants = {
              uni: ['university'], degree: ['degree'], spec: ['specialisation','specialization'],
              fees: ['fees'], duration: ['duration'], nirf: ['nirf'], naac: ['naac'],
              location: ['location'], eligibility: ['eligibility'], salary: ['salary'],
              roles: ['entry roles'], hiring: ['hiring partners','hiring'],
              right_for: ['right for'], not_for: ['not ideal','not for'],
              key_diff: ['key diff','🔑'], edify_skills: ['skills & tools','edify recommends'],
              edify_internships: ['internships to apply','internships to target'],
            }
            const v = variants[name] || [name]
            return H.findIndex(h => v.some(vv => h.includes(vv)))
          }

          const C = { uni: ci('uni'), degree: ci('degree'), spec: ci('spec'),
            fees: ci('fees'), duration: ci('duration'), nirf: ci('nirf'), naac: ci('naac'),
            location: ci('location'), eligibility: ci('eligibility'), salary: ci('salary'),
            roles: ci('roles'), hiring: ci('hiring'), right_for: ci('right_for'),
            not_for: ci('not_for'), key_diff: ci('key_diff'),
            edify_skills: ci('edify_skills'), edify_internships: ci('edify_internships'),
          }

          const degMap = { 'MBA':'MBA','MCA':'MCA','BBA':'BBA','BCA':'BCA','B.Com':'B.Com','BCom':'B.Com','B.A':'BA','BA':'BA','M.Com':'M.Com','MCom':'M.Com','MA':'MA','MSc':'MSc','BSc':'BSc','EMBA':'MBA' }

          for (let i = headerRow + 1; i < rows.length; i++) {
            const row = rows[i]
            const uniName = String(row[C.uni] || '').trim()
            if (!uniName || uniName === 'University') continue
            const prog = degMap[String(row[C.degree] || '').trim()] || String(row[C.degree] || '').trim()
            if (!prog) continue

            if (!programsByUni[uniName]) {
              programsByUni[uniName] = {
                name: uniName,
                nirf: C.nirf >= 0 ? parseNirf(row[C.nirf]) : 999,
                naac: C.naac >= 0 ? parseNaac(row[C.naac]) : 'A',
                location: C.location >= 0 ? String(row[C.location] || '') : '',
                programs: {},
              }
            }

            const uni = programsByUni[uniName]
            if (!uni.programs[prog]) {
              uni.programs[prog] = { specs: [], fees: [], salary: '', roles: [], hiring: [],
                right_for: '', not_for: '', key_diff: '', edify_skills: '', edify_internships: '',
                duration: C.duration >= 0 ? String(row[C.duration] || '') : '',
                eligibility: C.eligibility >= 0 ? String(row[C.eligibility] || '') : '',
              }
            }

            const p = uni.programs[prog]
            if (C.spec >= 0) parseSpecs(String(row[C.spec] || '')).forEach(s => { if (!p.specs.includes(s)) p.specs.push(s) })
            const fee = C.fees >= 0 ? String(row[C.fees] || '') : ''
            if (fee && !['None','nan','Not Mentioned','Contact University'].some(x => fee.includes(x))) p.fees.push(fee)
            if (!p.salary && C.salary >= 0) p.salary = String(row[C.salary] || '')
            if (!p.roles.length && C.roles >= 0) p.roles = parseList(String(row[C.roles] || ''), 6)
            if (!p.hiring.length && C.hiring >= 0) p.hiring = parseList(String(row[C.hiring] || ''), 10)
            if (!p.right_for && C.right_for >= 0) p.right_for = String(row[C.right_for] || '')
            if (!p.not_for && C.not_for >= 0) p.not_for = String(row[C.not_for] || '')
            if (!p.key_diff && C.key_diff >= 0) p.key_diff = String(row[C.key_diff] || '')
            if (!p.edify_skills && C.edify_skills >= 0) p.edify_skills = String(row[C.edify_skills] || '')
            if (!p.edify_internships && C.edify_internships >= 0) p.edify_internships = String(row[C.edify_internships] || '')
          }
          lines.push(`✓ Parsed ${Object.keys(programsByUni).length} universities from ALL PROGRAMS`)
        } else {
          lines.push('⚠ Header row not found in ALL PROGRAMS sheet')
        }
      }

      // Override NIRF/NAAC from Summary sheet
      if (summSheet) {
        const ws = wb.Sheets[summSheet]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        let hRow = -1
        for (let i = 0; i < Math.min(5, rows.length); i++) {
          if (rows[i].some(c => String(c).toLowerCase() === 'university')) { hRow = i; break }
        }
        if (hRow >= 0) {
          const H = rows[hRow].map(h => String(h || '').trim().toLowerCase())
          const uCol = H.findIndex(h => h === 'university')
          const nrfCol = H.findIndex(h => h === 'nirf')
          const nacCol = H.findIndex(h => h === 'naac')
          const locCol = H.findIndex(h => h === 'location')
          for (let i = hRow + 1; i < rows.length; i++) {
            const row = rows[i]
            const name = String(row[uCol] || '').trim()
            if (!name || typeof row[0] !== 'number') continue
            if (programsByUni[name]) {
              if (nrfCol >= 0 && row[nrfCol]) programsByUni[name].nirf = parseNirf(row[nrfCol])
              if (nacCol >= 0 && row[nacCol]) programsByUni[name].naac = parseNaac(row[nacCol])
              if (locCol >= 0 && row[locCol] && !programsByUni[name].location) programsByUni[name].location = String(row[locCol])
            }
          }
          lines.push('✓ NIRF/NAAC updated from Summary sheet')
        }
      }

      // Build final objects
      const built = []
      for (const [uniName, uniData] of Object.entries(programsByUni)) {
        const { city, state } = parseLocation(uniData.location)
        const programs = Object.keys(uniData.programs)
        const allFees = []
        const programDetails = {}

        for (const [prog, pd] of Object.entries(uniData.programs)) {
          const feeNums = pd.fees.flatMap(f => {
            const m = String(f).replace(/₹/g,'').match(/[\d,]+/g)
            return m ? m.map(n => parseInt(n.replace(/,/g,''))).filter(v => v >= 10000 && v <= 3000000) : []
          })
          if (feeNums.length) allFees.push(...feeNums)
          const fMin = feeNums.length ? Math.min(...feeNums) : 60000
          const fMax = feeNums.length ? Math.max(...feeNums) : 200000
          const feeStr = fMin < 100000 ? `₹${Math.round(fMin/1000)}K – ₹${Math.round(fMax/1000)}K` : `₹${(fMin/100000).toFixed(1)}L – ₹${(fMax/100000).toFixed(1)}L`
          let salary = '₹4L – ₹12L per annum'
          const sm = String(pd.salary).match(/([\d.]+)\s*[–-]\s*([\d.]+)\s*LPA/i)
          if (sm) salary = `₹${sm[1]}L – ₹${sm[2]}L per annum`
          const durDef = { MBA:'2 Years',MCA:'2 Years',BBA:'3 Years',BCA:'3 Years','B.Com':'3 Years',BA:'3 Years','M.Com':'2 Years',MA:'2 Years',MSc:'2 Years',BSc:'3 Years' }
          programDetails[prog] = {
            specs: pd.specs.length ? pd.specs : ['General'],
            fees: feeStr, duration: pd.duration || durDef[prog] || '2 Years',
            roles: pd.roles.length ? pd.roles : ['Management Trainee','Business Analyst'],
            avgSalary: salary,
            topCompanies: pd.hiring.length ? pd.hiring : ['TCS','Infosys','Wipro'],
            internshipType: 'Industry project and virtual internship',
            careerOutcome: `UGC DEB approved ${prog} from ${uniName.replace(/\s+online\s*$/i, '').trim()} — recognised for corporate hiring.`,
            edifySkills: parseEdifySkills(pd.edify_skills),
            edifyInternships: parseEdifyInternships(pd.edify_internships),
          }
        }

        const feeMin = allFees.length ? Math.min(...allFees) : 60000
        const feeMax = allFees.length ? Math.max(...allFees) : 200000
        const { naac, nirf } = uniData
        const id = uniName.toLowerCase().replace(/[^a-z0-9\s]/g,'').trim().split(/\s+/).slice(0,5).map(w => w.slice(0,8)).join('-').slice(0,35)

        built.push({
          id, name: uniName,
          abbr: uniName.split(' ').map(w=>w[0]).filter(c=>c&&c===c.toUpperCase()).join('').slice(0,5)||'UNI',
          city, state, region: getRegion(state + ' ' + uniData.location),
          nirf, naac, feeMin, feeMax, emiFrom: Math.max(1000, Math.round(feeMin/24)),
          programs, programDetails,
          eligibility: 'Graduation with 50% marks from recognized university', eligibilityPct: 50,
          highlight: nirf < 300 ? `NIRF #${nirf} · NAAC ${naac} · UGC DEB approved` : `NAAC ${naac} · UGC DEB approved`,
          tagline: (uniData.programs['MBA']?.key_diff || '').slice(0,120) || `${naac} accredited · UGC DEB approved online programs`,
          description: `UGC DEB approved online programs from ${uniName.slice(0,40)}. NAAC ${naac} accredited. Valid for corporate hiring.`,
          forWho: parseList(uniData.programs['MBA']?.right_for||'', 3).length ? parseList(uniData.programs['MBA']?.right_for||'', 3) : ['Working professionals','Career changers'],
          notFor: parseList(uniData.programs['MBA']?.not_for||'', 3).length ? parseList(uniData.programs['MBA']?.not_for||'', 3) : ['Students needing on-campus experience'],
          color: naac==='A++'?'#1B4FBE':naac==='A+'?'#2563EB':'#0891B2',
          approvals: ['UGC DEB', `NAAC ${naac}`, ...(nirf < 300 ? [`NIRF #${nirf}`] : [])],
        })
      }

      lines.push(`✅ ${built.length} universities ready`)
      setLog(lines); setParsedData(built); setStep('preview')
    } catch(err) {
      setError(`Error: ${err.message}`); setStep('upload')
      setLog([...lines, `❌ ${err.message}`])
    }
  }

  function downloadDataTS() {
    const body = `export const UNIVERSITIES = [\n${parsedData.map(u => generateUniTS(u)).join(',\n')}\n]\n`
    const full = DATA_TS_HEADER + body
    const blob = new Blob([full], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'data.ts'; a.click()
    URL.revokeObjectURL(url); setStep('done')
  }

  function downloadExcel() {
    if (!file) return
    const url = URL.createObjectURL(file)
    const a = document.createElement('a'); a.href = url
    a.download = `university-data-${new Date().toISOString().split('T')[0]}.xlsx`; a.click()
    URL.revokeObjectURL(url)
  }

  function reset() { setStep('upload'); setFile(null); setParsedData([]); setLog([]) }

  const S = { card: { background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',overflow:'hidden' } }


  return (
    <div className="page-shell">
      {/* Nav */}
      <div className="bg-navy px-5 py-[14px]">
        <div className="max-w-[960px] mx-auto flex items-center gap-2.5">
          <Link href="/admin" className="text-slate-400 flex items-center gap-[5px] text-[13px] no-underline">
            <ArrowLeft size={13}/> Admin
          </Link>
          <span className="text-ink-2">/</span>
          <span className="text-amber font-bold text-sm">📊 Excel Import</span>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-5 py-6">
        <h1 className="text-[22px] font-extrabold text-navy mb-1.5 mt-0">University Data Import</h1>
        <p style={{fontSize:13,color:'var(--ink-3)',margin:'0 0 24px'}}>
          Upload Excel → Parse → Preview → Download <code className="bg-slate-100 px-1.5 py-px rounded text-[11px]">lib/data.ts</code> → Push to GitHub
        </p>

        {/* Steps indicator */}
        <div className="flex gap-[0px] mb-6 overflow-x-auto">
          {[
            {id:'upload',label:'1. Upload'},
            {id:'parsing',label:'2. Parsing'},
            {id:'preview',label:'3. Preview'},
            {id:'done',label:'4. Download'},
          ].map((s,i) => {
            const steps = ['upload','parsing','preview','done']
            const active = steps.indexOf(step) >= i
            return (
              <div key={s.id} className="flex items-center">
                <div style={{padding:'7px 16px',borderRadius:'var(--r-lg)',fontSize:11,fontWeight:700, background:active?'rgba(200,129,26,0.12)':'var(--surface-3)', color:active?'var(--amber-text)':'var(--ink-4)',whiteSpace:'nowrap'}}>
                  {s.label}
                </div>
                {i < 3 && <div style={{width:20,height:1,background:'var(--border)',margin:'0 2px'}}/>}
              </div>
            )
          })}
        </div>

        {/* UPLOAD */}
        {(step === 'upload' || step === 'parsing') && (
          <div style={{...S.card,padding:'48px 24px',textAlign:'center',border:'2px dashed #CBD5E1'}}>
            <FileSpreadsheet size={44} color="var(--amber-text)" className="mb-4"/>
            <h2 className="text-lg font-bold text-navy mb-1.5">Drop your Excel file here</h2>
            <p className="text-[13px] text-ink-3 mb-5">
              Accepts <strong>.xlsx</strong> — University_Matrix_v10.xlsx or any updated version<br/>
              <span className="text-[11px] text-slate-400">Sheet names must include "ALL PROGRAMS" and "University Summary"</span>
            </p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={e=>{const f=e.target.files?.[0];if(f){setFile(f);parseExcel(f)}}}/>
            <button onClick={()=>fileRef.current?.click()} disabled={step==='parsing'}
              style={{padding:'13px 28px',borderRadius:'var(--r-sm)',background:step==='parsing'?'var(--ink-4)':'linear-gradient(135deg,#c9922a,#e0a93a)', color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:step==='parsing'?'wait':'pointer', display:'inline-flex',alignItems:'center',gap:8}}>
              {step==='parsing'
                ? <><RefreshCw size={15} className="animate-spin"/> Parsing...</>
                : <><Upload size={15}/> Choose Excel File</>}
            </button>
            {error && <div style={{marginTop:16,padding:'12px 16px',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'var(--r-xs)',fontSize:13,color:'var(--red)',display:'inline-flex',gap:8,alignItems:'center'}}><AlertCircle size={14}/>{error}</div>}
            {log.length > 0 && (
              <div style={{marginTop:20,textAlign:'left',background:'var(--ink)',borderRadius:'var(--r-sm)',padding:'14px 16px',maxHeight:180,overflow:'auto'}}>
                {log.map((l,i)=><div key={i} style={{fontSize:11,color:'var(--ink-4)',fontFamily:'monospace',lineHeight:1.7}}>{l}</div>)}
              </div>
            )}
          </div>
        )}

        {/* PREVIEW */}
        {step === 'preview' && (
          <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginBottom:16}}>
              {[
                {l:'Universities',v:parsedData.length},
                {l:'With MBA',v:parsedData.filter(u=>u.programs.includes('MBA')).length},
                {l:'With MCA',v:parsedData.filter(u=>u.programs.includes('MCA')).length},
                {l:'NAAC A++',v:parsedData.filter(u=>u.naac==='A++').length},
                {l:'NIRF Listed',v:parsedData.filter(u=>u.nirf<999).length},
                {l:'Total Programs',v:parsedData.reduce((a,u)=>a+u.programs.length,0)},
              ].map(s=>(
                <div key={s.l} className="bg-white border border-border rounded-xl p-[14px] text-center">
                  <div style={{fontSize:22,fontWeight:800,color:'var(--amber-text)'}}>{s.v}</div>
                  <div className="text-[11px] text-ink-3 font-semibold">{s.l}</div>
                </div>
              ))}
            </div>

            {log.length > 0 && (
              <div style={{background:'var(--ink)',borderRadius:'var(--r-sm)',padding:'12px 16px',marginBottom:16,maxHeight:130,overflow:'auto'}}>
                {log.map((l,i)=><div key={i} className="text-[11px] text-slate-400 font-mono leading-relaxed">{l}</div>)}
              </div>
            )}

            <div style={{...S.card,marginBottom:16}}>
              <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div className="text-[13px] font-bold text-navy">{parsedData.length} Universities — Click any row to expand</div>
                <div className="text-[11px] text-slate-400">Scroll for more</div>
              </div>
              <div style={{maxHeight:460,overflow:'auto'}}>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr style={{background:'var(--surface-2)',position:'sticky',top:0}}>
                      {['','ID','University','NIRF','NAAC','Programs','Fees'].map(h=>(
                        <th key={h} style={{padding:'9px 12px',textAlign:'left',fontWeight:700,color:'var(--ink-3)',fontSize:10,textTransform:'uppercase',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((u,i)=>(
                      <>
                        <tr key={u.id} onClick={()=>setExpandedRow(expandedRow===i?null:i)}
                          style={{borderBottom:'1px solid #F1F5F9',cursor:'pointer',background:expandedRow===i?'rgba(200,129,26,0.04)':'transparent'}}>
                          <td style={{padding:'9px 10px'}}>{expandedRow===i?<ChevronDown size={11} color="var(--amber-text)"/>:<ChevronRight size={11} color="var(--ink-4)"/>}</td>
                          <td style={{padding:'9px 12px',fontFamily:'monospace',color:'var(--ink-4)',fontSize:10}}>{u.id.slice(0,20)}</td>
                          <td style={{padding:'9px 12px',fontWeight:600,color:'var(--ink)',maxWidth:260}}>
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.city}{u.state?`, ${u.state}`:''}</div>
                          </td>
                          <td style={{padding:'9px 12px',color:u.nirf<999?'var(--sage)':'var(--ink-4)',fontWeight:u.nirf<999?700:400}}>{u.nirf<999?`#${u.nirf}`:'—'}</td>
                          <td style={{padding:'9px 12px'}}>
                            <span style={{padding:'2px 7px',borderRadius:6,fontSize:10,fontWeight:700, background:u.naac==='A++'?'rgba(31,107,82,0.1)':'rgba(200,129,26,0.1)', color:u.naac==='A++'?'var(--sage)':'var(--amber-text)'}}>{u.naac}</span>
                          </td>
                          <td style={{padding:'9px 12px',color:'var(--ink-2)',fontSize:11}}>{u.programs.join(', ')}</td>
                          <td style={{padding:'9px 12px',fontWeight:600,color:'var(--ink)',fontSize:11,whiteSpace:'nowrap'}}>
                            {u.feeMin<100000?`₹${Math.round(u.feeMin/1000)}K`:`₹${(u.feeMin/100000).toFixed(1)}L`} – {u.feeMax<100000?`₹${Math.round(u.feeMax/1000)}K`:`₹${(u.feeMax/100000).toFixed(1)}L`}
                          </td>
                        </tr>
                        {expandedRow===i && (
                          <tr key={u.id+'-exp'}>
                            <td colSpan={7} style={{padding:'0 12px 12px 40px',background:'rgba(200,129,26,0.02)'}}>
                              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8,paddingTop:8}}>
                                {u.programs.map(prog => {
                                  const pd = u.programDetails[prog]
                                  return pd ? (
                                    <div key={prog} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-xs)',padding:'10px 12px'}}>
                                      <div style={{fontSize:11,fontWeight:700,color:'var(--amber-text)',marginBottom:5}}>{prog}</div>
                                      <div className="text-[11px] text-ink-2 mb-0.5">💰 {pd.fees}</div>
                                      <div className="text-[11px] text-ink-2 mb-0.5">📊 {pd.avgSalary}</div>
                                      <div className="text-[11px] text-ink-2 mb-0.5">📋 {pd.specs.slice(0,2).join(', ')}{pd.specs.length>2?` +${pd.specs.length-2}`:''}</div>
                                      {pd.edifySkills?.length > 0 && <div style={{fontSize:10,color:'var(--sage)'}}>✓ {pd.edifySkills.length} Edify skills</div>}
                                    </div>
                                  ) : null
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button onClick={downloadDataTS} style={{padding:'13px 24px',borderRadius:'var(--r-sm)',background:'linear-gradient(135deg,#0B1D35,#142540)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
                <Download size={15}/> Download lib/data.ts
              </button>
              <button onClick={downloadExcel} style={{padding:'13px 20px',borderRadius:'var(--r-sm)',background:'rgba(31,107,82,0.08)',border:'1px solid rgba(31,107,82,0.2)',color:'var(--sage)',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
                <Download size={15}/> Save Excel Backup
              </button>
              <button onClick={reset} style={{padding:'13px 20px',borderRadius:'var(--r-sm)',background:'var(--surface-2)',border:'1px solid var(--border)',color:'var(--ink-3)',fontWeight:600,fontSize:13,cursor:'pointer'}}>
                Upload Different File
              </button>
            </div>
          </>
        )}

        {/* DONE */}
        {step === 'done' && (
          <div style={{...S.card,padding:'44px 24px',textAlign:'center'}}>
            <CheckCircle size={48} color="var(--sage)" className="mb-4"/>
            <h2 className="text-[18px] font-extrabold text-navy mb-2">data.ts Downloaded!</h2>
            <p style={{fontSize:13,color:'var(--ink-3)',maxWidth:500,margin:'0 auto 24px',lineHeight:1.7}}>
              Move <code className="bg-slate-100 px-1.5 py-px rounded">data.ts</code> to <code className="bg-slate-100 px-1.5 py-px rounded">edify-next/lib/</code>, push to GitHub, and Vercel will deploy your <strong>{parsedData.length} universities</strong> live within 2 minutes.
            </p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,maxWidth:700,margin:'0 auto 24px',textAlign:'left'}}>
              {[
                {n:'01',cmd:'Move data.ts to your edify-next/lib/ folder'},
                {n:'02',cmd:'git add lib/data.ts'},
                {n:'03',cmd:'git commit -m "Update university data from Excel"'},
                {n:'04',cmd:'git push origin main → Vercel auto-deploys'},
              ].map(s=>(
                <div key={s.n} style={{background:'var(--ink)',borderRadius:'var(--r-sm)',padding:'12px 14px'}}>
                  <div style={{fontSize:10,fontWeight:700,color:'var(--amber-vivid)',marginBottom:4}}>STEP {s.n}</div>
                  <div style={{fontSize:11,color:'var(--ink-4)',fontFamily:'monospace',lineHeight:1.5}}>{s.cmd}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2.5 justify-center flex-wrap">
              <button onClick={downloadExcel} style={{padding:'11px 20px',borderRadius:'var(--r-sm)',background:'rgba(31,107,82,0.08)',border:'1px solid rgba(31,107,82,0.2)',color:'var(--sage)',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                <Download size={13}/> Save Excel Backup
              </button>
              <button onClick={reset} style={{padding:'11px 20px',borderRadius:'var(--r-sm)',background:'var(--surface-2)',border:'1px solid var(--border)',color:'var(--ink-3)',fontWeight:600,fontSize:13,cursor:'pointer'}}>
                Import Another File
              </button>
            </div>
          </div>
        )}

        {/* Storage note */}
        <div style={{marginTop:20,padding:'14px 18px',background:'rgba(200,129,26,0.06)',border:'1px solid rgba(200,129,26,0.15)',borderRadius:'var(--r-sm)',fontSize:12,color:'var(--ink-2)',lineHeight:1.7}}>
          <strong className="text-navy">📁 Excel file storage:</strong> Use <strong>"Save Excel Backup"</strong> to keep a dated copy locally. 
          To version-control the Excel file, commit it to your GitHub repo at <code style={{background:'var(--surface)',padding:'1px 5px',borderRadius:3,fontSize:11}}>public/university-data/University_Matrix_v10.xlsx</code> — 
          it won't be publicly served (too large) but will be version-tracked alongside your code. 
          <strong> Vercel does not provide server-side file storage</strong> — the Excel only lives in your browser during parsing.
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}