// @ts-nocheck
'use client'
// Auth: Protected by middleware.ts — no client-side password check needed

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Upload, ArrowLeft, RefreshCw, CheckCircle, AlertCircle,
         Zap, FileSpreadsheet, Globe, Download } from 'lucide-react'


// ── Code generators ──────────────────────────────────────────────────────

function esc(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ').trim()
}

function generateDataTS(unis, programs) {
  // Build program lookup: uid+prog → program row
  const progMap = {}
  for (const p of programs) {
    const key = `${p['University ID']}||${p['Program']}`
    progMap[key] = p
  }

  // Group programs by university
  const uniPrograms = {}
  for (const p of programs) {
    const uid = p['University ID']
    if (!uniPrograms[uid]) uniPrograms[uid] = []
    uniPrograms[uid].push(p['Program'])
  }

  const PROG_TYPES = ['MBA', 'MCA', 'BBA', 'BCA', 'B.Com', 'M.Com', 'BA', 'MA', 'MSc', 'BSc']
  const COLORS = ['#1E3A5F', '#2E7D32', '#B71C1C', '#4A1A8A', '#E65100', '#006064',
                  '#880E4F', '#827717', '#1A237E', '#33691E', '#BF360C', '#4E342E']

  const uniBlocks = unis.map((u, idx) => {
    const uid = u['ID']
    const progsList = (u['Programs Offered'] || '').split(',').map(p => p.trim()).filter(Boolean)
    const approvals = (u['Approvals (comma sep)'] || '').split(',').map(a => a.trim()).filter(Boolean)

    // Build programDetails
    const progDetailBlocks = progsList.map(prog => {
      const key = `${uid}||${prog}`
      const pd = progMap[key] || {}
      const specs = (pd['Specialisations (comma sep)'] || '').split(',').map(s => s.trim()).filter(Boolean)
      const roles = (pd['Entry Roles (comma sep)'] || '').split(',').map(r => r.trim()).filter(Boolean)
      const companies = (pd['Top Companies (comma sep)'] || '').split(',').map(c => c.trim()).filter(Boolean)

      return `      '${prog}': {
        specs: [${specs.map(s => `'${esc(s)}'`).join(', ')}],
        fees: '${esc(pd['Fee Range'])}',
        duration: '${esc(pd['Duration'])}',
        roles: [${roles.map(r => `'${esc(r)}'`).join(', ')}],
        avgSalary: '${esc(pd['Avg Salary'])}',
        topCompanies: [${companies.map(c => `'${esc(c)}'`).join(', ')}],
        internshipType: '${esc(pd['Internship / Project Type'])}',
        careerOutcome: '${esc(pd['Career Outcome (1 sentence)'])}',
      }`
    }).join(',\n')

    return `  {
    id: '${uid}',
    name: '${esc(u['University Full Name'])}',
    abbr: '${esc(u['Abbreviation'])}',
    city: '${esc(u['City'])}',
    state: '${esc(u['State'])}',
    region: '${esc(u['Region'])}',
    nirf: ${parseInt(u['NIRF Rank']) || 999},
    naac: '${esc(u['NAAC Grade'])}',
    ugc: ${u['UGC DEB (TRUE/FALSE)']?.toString().toUpperCase() !== 'FALSE'},
    approvals: [${approvals.map(a => `'${esc(a)}'`).join(', ')}],
    examMode: '${esc(u['Exam Mode']) || 'Online'}',
    govtRecognised: true,
    psuEligible: ${u['PSU Eligible (TRUE/FALSE)']?.toString().toUpperCase() !== 'FALSE'},
    feeMin: ${parseInt(String(u['Fee Min ₹']).replace(/[^0-9]/g, '')) || 60000},
    feeMax: ${parseInt(String(u['Fee Max ₹']).replace(/[^0-9]/g, '')) || 200000},
    emiFrom: ${parseInt(String(u['EMI From ₹/month']).replace(/[^0-9]/g, '')) || 2500},
    eligibility: '${esc(u['Eligibility'])}',
    eligibilityPct: ${parseInt(u['Eligibility %']) || 50},
    highlight: '${esc(u['Highlight Badge'])}',
    tagline: '${esc(u['Tagline'])}',
    description: '${esc(u['Description'])}',
    programs: [${progsList.map(p => `'${p}'`).join(', ')}],
    programDetails: {
${progDetailBlocks}
    },
    color: '${COLORS[idx % COLORS.length]}',
  }`
  })

  return `import type { University, Program } from './data'

export const UNIVERSITIES: University[] = [
${uniBlocks.join(',\n')}
]

export function getUniversityById(id: string): University | undefined {
  return UNIVERSITIES.find(u => u.id === id)
}

export function getUniversitiesByProgram(program: Program): University[] {
  return UNIVERSITIES.filter(u => u.programs.includes(program))
}

export function getAllPrograms(): Program[] {
  const all = new Set<Program>()
  UNIVERSITIES.forEach(u => u.programs.forEach(p => all.add(p)))
  return Array.from(all)
}

export function formatFee(n: number): string {
  if (n >= 100000) return \`₹\${(n/100000).toFixed(1)}L\`
  if (n >= 1000) return \`₹\${Math.round(n/1000)}K\`
  return \`₹\${n}\`
}

export const PROGRAM_META: Record<string, {label:string;desc:string}> = {
  'MBA':   {label:'Online MBA', desc:'Master of Business Administration'},
  'MCA':   {label:'Online MCA', desc:'Master of Computer Applications'},
  'BBA':   {label:'Online BBA', desc:'Bachelor of Business Administration'},
  'BCA':   {label:'Online BCA', desc:'Bachelor of Computer Applications'},
  'B.Com': {label:'Online B.Com', desc:'Bachelor of Commerce'},
  'M.Com': {label:'Online M.Com', desc:'Master of Commerce'},
  'BA':    {label:'Online BA', desc:'Bachelor of Arts'},
  'MA':    {label:'Online MA', desc:'Master of Arts'},
  'MSc':   {label:'Online M.Sc', desc:'Master of Science'},
  'BSc':   {label:'Online B.Sc', desc:'Bachelor of Science'},
}
`
}

function generateMasterSyllabus(sylRows) {
  const entries = {}

  for (const row of sylRows) {
    const uid = (row['University ID'] || '').trim()
    const prog = (row['Program'] || '').trim()
    const spec = (row['Specialisation (for sem3/4)'] || '').trim()
    if (!uid || !prog) continue

    const key = `${uid}||${prog}`
    if (!entries[key]) {
      entries[key] = {
        sem1: '', sem2: '', sem3: '', sem4: '', sem5: '', sem6: '', highlight: '',
        specSyllabus: {}
      }
    }

    const e = entries[key]
    const s1 = (row['Semester 1 Subjects'] || '').trim()
    const s2 = (row['Semester 2 Subjects'] || '').trim()
    const s3 = (row['Semester 3 Subjects'] || '').trim()
    const s4 = (row['Semester 4 Subjects'] || '').trim()
    const s5 = (row['Semester 5 Subjects'] || '').trim()
    const s6 = (row['Semester 6 Subjects'] || '').trim()
    const hi = (row['Highlight / Key Differentiator'] || '').trim()

    if (!spec) {
      // Base row
      if (s1) e.sem1 = s1
      if (s2) e.sem2 = s2
      if (s3) e.sem3 = s3
      if (s4) e.sem4 = s4
      if (s5) e.sem5 = s5
      if (s6) e.sem6 = s6
      if (hi) e.highlight = hi
    } else {
      // Spec-specific sem3/4
      if (!e.specSyllabus[spec]) e.specSyllabus[spec] = {}
      if (s3) e.specSyllabus[spec].sem3 = s3
      if (s4) e.specSyllabus[spec].sem4 = s4
    }
  }

  const entryLines = Object.entries(entries).map(([key, d]) => {
    let lines = [`  '${key}': {`]
    if (d.sem1) lines.push(`    sem1: '${esc(d.sem1.slice(0,350))}',`)
    if (d.sem2) lines.push(`    sem2: '${esc(d.sem2.slice(0,350))}',`)
    if (d.sem3) lines.push(`    sem3: '${esc(d.sem3.slice(0,350))}',`)
    if (d.sem4) lines.push(`    sem4: '${esc(d.sem4.slice(0,350))}',`)
    if (d.sem5) lines.push(`    sem5: '${esc(d.sem5.slice(0,300))}',`)
    if (d.sem6) lines.push(`    sem6: '${esc(d.sem6.slice(0,300))}',`)
    if (d.highlight) lines.push(`    highlight: '${esc(d.highlight.slice(0,200))}',`)

    if (Object.keys(d.specSyllabus).length > 0) {
      lines.push('    specSyllabus: {')
      for (const [spec, sv] of Object.entries(d.specSyllabus)) {
        lines.push(`      '${esc(spec)}': {`)
        if (sv.sem3) lines.push(`        sem3: '${esc(sv.sem3.slice(0,300))}',`)
        if (sv.sem4) lines.push(`        sem4: '${esc(sv.sem4.slice(0,300))}',`)
        lines.push('      },')
      }
      lines.push('    },')
    }
    lines.push('  }')
    return lines.join('\n')
  })

  return `export interface SpecSyllabusVariant { sem3?: string; sem4?: string }
export interface UniversitySyllabus {
  sem1?: string; sem2?: string; sem3?: string; sem4?: string
  sem5?: string; sem6?: string; research?: string; capstone?: string
}
export interface MasterSyllabus extends UniversitySyllabus {
  highlight?: string
  specSyllabus?: Record<string, SpecSyllabusVariant>
}
export const MASTER_SYLLABUS: Record<string, MasterSyllabus> = {
${entryLines.join(',\n')}
}
export function getMasterSyllabus(uniId: string, degree: string): MasterSyllabus | null {
  return MASTER_SYLLABUS[\`\${uniId}||\${degree}\`] || null
}
export function getUniversityLogo(uniId: string): string | null {
  return UNIVERSITY_LOGOS[uniId] || null
}
export const UNIVERSITY_LOGOS: Record<string, string> = {}
`
}

function generateBlogTS(posts) {
  const now = new Date().toISOString().split('T')[0]
  const postBlocks = posts.map(p => {
    const tags = (p['Tags (comma sep)'] || '').split(',').map(t => t.trim()).filter(Boolean)
    const faqs = [1,2,3].map(i => ({
      q: (p[`FAQ Question ${i}`] || '').trim(),
      a: (p[`FAQ Answer ${i}`] || '').trim()
    })).filter(f => f.q && f.a)
    const content = (p['Content (HTML)'] || '<p>Content coming soon.</p>').replace(/`/g, '\\`')

    return `  {
    slug: '${esc(p['Slug (URL)'])}',
    title: '${esc(p['Title'])}',
    metaDescription: '${esc(p['Meta Description']?.slice(0,160))}',
    category: '${esc(p['Category'])}',
    tags: [${tags.map(t => `'${esc(t)}'`).join(', ')}],
    publishedAt: '${p['Published Date'] || now}',
    readTime: ${parseInt(p['Read Time (min)']) || 7},
    targetKeyword: '${esc(p['Target Keyword'])}',
    relatedUniversities: [],
    status: '${p['Status'] === 'draft' ? 'draft' : 'published'}',
    faqs: [${faqs.map(f => `\n      { q: '${esc(f.q)}', a: '${esc(f.a)}' }`).join(',')}
    ],
    content: \`
${content}
    \`,
  }`
  }).join(',\n')

  return `export interface BlogPost {
  slug: string; title: string; metaDescription: string; category: string
  tags: string[]; publishedAt: string; readTime: number; content: string
  faqs: { q: string; a: string }[]; relatedUniversities: string[]
  targetKeyword: string; status: 'published' | 'draft'
}
export function getPublishedPosts() {
  return BLOG_POSTS.filter(p => p.status === 'published').sort((a,b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}
export function getPostBySlug(slug: string) { return BLOG_POSTS.find(p => p.slug === slug) || null }
export const BLOG_POSTS: BlogPost[] = [
${postBlocks}
]
`
}

function generateGuidesPage(guides) {
  const items = guides.map(g => `  {
    id: '${esc(g['ID (URL slug)'])}',
    icon: '${g['Icon (emoji)'] || '📖'}',
    tag: '${esc(g['Tag / Category'])}',
    title: '${esc(g['Title'])}',
    desc: '${esc(g['Short Description']?.slice(0,300))}',
    readTime: '${g['Read Time'] || '5 min read'}',
    content: \`${(g['Content (HTML)'] || '').replace(/`/g,'\\`')}\`,
  }`).join(',\n')

  return `'use client'
// Auth: Protected by middleware.ts — no client-side password check needed
import Link from 'next/link'
const GUIDES = [
${items}
]
export default function GuidesPage() {
  return (
    <div className="page-shell">
      <div className="bg-white border-b border-border py-7">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-navy mb-2 mt-0">Guides & Honest Answers</h1>
          <p className="body-sm m-0">No fluff. Straight answers to questions every student asks before enrolling.</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {GUIDES.map(g=>(
            <Link key={g.id} href={\`/guides/\${g.id}\`} className="no-underline">
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',padding:24,height:'100%',cursor:'pointer'}}>
                <div className="text-[28px] mb-3">{g.icon}</div>
                <div style={{fontSize:10,fontWeight:700,color:'var(--amber-text)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>{g.tag}</div>
                <h2 className="text-[15px] font-bold text-navy leading-tight mb-2">{g.title}</h2>
                <p className="text-[13px] text-ink-3 leading-relaxed mb-3 mt-0">{g.desc}</p>
                <span className="text-[11px] text-slate-400">{g.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
`
}

// ── Main component ────────────────────────────────────────────────────────

const STATUS_STEPS = [
  { id: 'parse',   label: 'Reading Excel',          icon: '📊' },
  { id: 'build',   label: 'Building code files',    icon: '⚙️' },
  { id: 'github',  label: 'Pushing to GitHub',      icon: '🚀' },
  { id: 'deploy',  label: 'Vercel deploying…',      icon: '🌐' },
]

export default function MasterImportPage() {
  const [phase, setPhase] = useState('idle') // idle | uploading | publishing | done | error
  const [stepIdx, setStepIdx] = useState(-1)
  const [log, setLog] = useState([])
  const [stats, setStats] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [deployUrl, setDeployUrl] = useState('')
  const fileRef = useRef(null)
  const xlsxRef = useRef(null)

  const addLog = (msg) => setLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }])

  async function loadXLSX() {
    if (xlsxRef.current) return xlsxRef.current
    if (window.XLSX) { xlsxRef.current = window.XLSX; return window.XLSX }
    return new Promise((res, rej) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
      s.onload = () => { xlsxRef.current = window.XLSX; res(window.XLSX) }
      s.onerror = () => rej(new Error('Failed to load SheetJS'))
      document.head.appendChild(s)
    })
  }

  function readSheet(wb, XLSX, name) {
    const sheet = wb.Sheets[name]
    if (!sheet) return []
    return XLSX.utils.sheet_to_json(sheet, { defval: '' })
  }

  async function handleFile(file) {
    setPhase('uploading'); setLog([]); setStats(null); setErrorMsg('')
    setStepIdx(0); addLog('Loading SheetJS...')

    try {
      const XLSX = await loadXLSX()
      addLog('✓ SheetJS loaded')

      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      addLog(`✓ Sheets found: ${wb.SheetNames.join(', ')}`)

      // Parse each sheet
      const unis      = readSheet(wb, XLSX, '📊 Universities')
      const programs  = readSheet(wb, XLSX, '📚 Programs')
      const syllabus  = readSheet(wb, XLSX, '📖 Syllabus')
      const blogPosts = readSheet(wb, XLSX, '✍️ Blog Posts')
      const guides    = readSheet(wb, XLSX, '🗺️ Guides')

      // Filter empty rows
      const uniRows  = unis.filter(r => r['ID'] && r['University Full Name'])
      const progRows = programs.filter(r => r['University ID'] && r['Program'])
      const sylRows  = syllabus.filter(r => r['University ID'] && r['Program'])
      const blogRows = blogPosts.filter(r => r['Slug (URL)'] && r['Title'])
      const guideRows = guides.filter(r => r['ID (URL slug)'] && r['Title'])

      addLog(`✓ Parsed: ${uniRows.length} unis, ${progRows.length} programs, ${sylRows.length} syllabus rows, ${blogRows.length} posts, ${guideRows.length} guides`)

      setStats({ unis: uniRows.length, programs: progRows.length, syllabus: sylRows.length, blog: blogRows.length, guides: guideRows.length })

      if (uniRows.length === 0) throw new Error('No university data found. Check the 📊 Universities sheet.')

      setStepIdx(1); addLog('Building code files...')

      // Generate all files
      const dataTS    = generateDataTS(uniRows, progRows)
      const contentTS = generateMasterSyllabus(sylRows)
      const blogTS    = blogRows.length > 0 ? generateBlogTS(blogRows) : null
      const guidesPage = guideRows.length > 0 ? generateGuidesPage(guideRows) : null

      addLog(`✓ data.ts: ${(dataTS.length/1024).toFixed(1)}KB`)
      addLog(`✓ content.ts syllabus: ${(contentTS.length/1024).toFixed(1)}KB`)
      if (blogTS) addLog(`✓ blog.ts: ${blogRows.length} posts`)
      if (guidesPage) addLog(`✓ guides/page.tsx: ${guideRows.length} guides`)

      setStepIdx(2); addLog('Pushing to GitHub...')

      const filesToPush = [
        { path: 'edify-next/lib/data.ts', content: dataTS },
        { path: 'edify-next/lib/content.ts', content: contentTS },
      ]
      if (blogTS) filesToPush.push({ path: 'edify-next/lib/blog.ts', content: blogTS })
      if (guidesPage) filesToPush.push({ path: 'edify-next/app/guides/page.tsx', content: guidesPage })

      const pushRes = await fetch('/api/publish-to-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filesToPush,
          commitMessage: `📊 Edify Master Update — ${new Date().toLocaleDateString('en-IN')} — ${uniRows.length} unis, ${blogRows.length} posts`,
        }),
      })

      const pushData = await pushRes.json()

      if (!pushRes.ok || !pushData.success) {
        throw new Error(pushData.error || pushData.message || 'GitHub push failed')
      }

      addLog(`✓ ${filesToPush.length} files pushed to GitHub`)
      setDeployUrl(pushData.deployUrl || '')

      setStepIdx(3); addLog('Vercel is deploying. Live in ~90 seconds...')
      setPhase('done')

    } catch (err) {
      setErrorMsg(err.message || 'Unknown error')
      setPhase('error')
      addLog(`❌ ${err.message}`)
    }
  }


  return (
    <div className="page-shell">
      <div className="bg-navy px-5 py-[14px]">
        <div style={{maxWidth:900,margin:'0 auto',display:'flex',alignItems:'center',gap:10}}>
          <Link href="/admin" className="text-slate-400 flex items-center gap-[5px] text-[13px] no-underline">
            <ArrowLeft size={13}/> Admin
          </Link>
          <span className="text-ink-2">/</span>
          <span className="text-amber font-bold text-sm">⚡ Master Import — Upload → Live</span>
        </div>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 20px'}}>

        {/* How it works */}
        <div style={{background:'linear-gradient(135deg,#0B1D35,#142540)',borderRadius:'var(--r-md)',padding:'20px 24px',marginBottom:20,color:'#fff'}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--amber-vivid)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>How it works</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12}}>
            {[
              {n:'1',t:'Download Template',d:'Get the pre-filled Excel below', icon:'⬇️'},
              {n:'2',t:'Edit in Excel',d:'Update any cell — universities, programs, syllabus, blogs, guides', icon:'✏️'},
              {n:'3',t:'Upload here',d:'Drop your file below', icon:'📤'},
              {n:'4',t:'Live in 90 sec',d:'GitHub → Vercel → Done. Nothing else needed.', icon:'🚀'},
            ].map(s=>(
              <div key={s.n} style={{background:'rgba(255,255,255,0.06)',borderRadius:'var(--r-sm)',padding:'12px'}}>
                <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
                <div style={{fontSize:12,fontWeight:700,color:'#fff',marginBottom:3}}>{s.t}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',lineHeight:1.5}}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Download Template */}
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',padding:'16px 20px',marginBottom:16,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <FileSpreadsheet size={20} color="var(--sage)"/>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-navy">Edify Master Update Sheet</div>
            <div className="text-[11px] text-ink-3">127 universities, 516 programs, syllabus, blogs, guides — all pre-filled</div>
          </div>
          <a href="/university-data/Edify_Master_Update.xlsx" download
            style={{padding:'10px 20px',borderRadius:'var(--r-sm)',background:'linear-gradient(135deg,#1F6B52,#2e8b6e)',color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none',display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}>
            <Download size={14}/> Download Excel Template
          </a>
        </div>

        {/* Upload Zone */}
        {(phase === 'idle' || phase === 'error') && (
          <div style={{background:'var(--surface)',border:`2px dashed ${phase==='error'?'var(--red)':'#CBD5E1'}`,borderRadius:'var(--r-md)',padding:'48px 24px',textAlign:'center',marginBottom:16}}>
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-navy mb-2">
              Upload your filled Excel
            </h2>
            <p className="text-[13px] text-ink-3 mb-6 leading-[1.7]">
              Edit the downloaded template → upload here → site goes live automatically.<br/>
              <strong>No git, no coding, no file replacement needed.</strong>
            </p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}/>
            <button onClick={() => fileRef.current?.click()}
              style={{padding:'14px 36px',borderRadius:'var(--r-sm)',background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:800,fontSize:15,border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,boxShadow:'0 4px 16px rgba(200,129,26,0.35)'}}>
              <Upload size={18}/> Upload & Publish to Website
            </button>
            {phase === 'error' && (
              <div style={{marginTop:20,padding:'12px 18px',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'var(--r-sm)',fontSize:13,color:'var(--red)',display:'inline-flex',gap:8,alignItems:'flex-start',textAlign:'left',maxWidth:500}}>
                <AlertCircle size={16} style={{flexShrink:0,marginTop:1}}/>
                <div>
                  <strong>Error:</strong> {errorMsg}
                  {errorMsg.includes('GITHUB_TOKEN') && (
                    <div style={{marginTop:8,fontSize:12,color:'#7f1d1d'}}>
                      Fix: Go to <strong>Vercel Dashboard → Settings → Environment Variables</strong> → Add <code>GITHUB_TOKEN</code> with your GitHub Personal Access Token (needs repo write permission).
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        {(phase === 'uploading' || phase === 'publishing') && (
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',padding:'32px 24px',marginBottom:16}}>
            <div className="flex flex-col gap-3 mb-5">
              {STATUS_STEPS.map((step, i) => {
                const done = i < stepIdx
                const active = i === stepIdx
                const pending = i > stepIdx
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div style={{ width:32,height:32,borderRadius:'var(--r-pill)',flexShrink:0, display:'flex',alignItems:'center',justifyContent:'center',fontSize:16, background: done ? 'var(--sage)' : active ? 'var(--amber-text)' : 'var(--surface-3)', }}>
                      {done ? '✓' : active ? <RefreshCw size={14} color="#fff" className="animate-spin"/> : <span style={{opacity:0.4}}>{step.icon}</span>}
                    </div>
                    <span style={{fontSize:14,fontWeight: active ? 700 : 400, color: done ? 'var(--sage)' : active ? 'var(--amber-text)' : 'var(--ink-4)'}}>
                      {step.label}
                    </span>
                    {done && <span style={{marginLeft:'auto',fontSize:12,color:'var(--sage)',fontWeight:600}}>Done</span>}
                    {active && <span style={{marginLeft:'auto',fontSize:12,color:'var(--amber-text)',fontWeight:600}}>In progress...</span>}
                  </div>
                )
              })}
            </div>

            {/* Stats */}
            {stats && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(90px,1fr))',gap:8,marginBottom:16}}>
                {[
                  {l:'Universities',v:stats.unis},
                  {l:'Programs',v:stats.programs},
                  {l:'Syllabus',v:stats.syllabus},
                  {l:'Blog Posts',v:stats.blog},
                  {l:'Guides',v:stats.guides},
                ].map(s=>(
                  <div key={s.l} style={{background:'var(--surface-2)',borderRadius:'var(--r-sm)',padding:'10px',textAlign:'center'}}>
                    <div className="text-[18px] font-extrabold text-amber">{s.v}</div>
                    <div className="text-[10px] text-ink-3 font-semibold">{s.l}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Log */}
            <div style={{background:'var(--ink)',borderRadius:'var(--r-sm)',padding:'12px 14px',maxHeight:200,overflow:'auto'}}>
              {log.map((l,i)=>(
                <div key={i} style={{fontSize:11,color: l.msg.startsWith('✓') ? 'var(--sage-bright)' : l.msg.startsWith('❌') ? '#f87171' : 'var(--ink-4)',fontFamily:'monospace',lineHeight:1.7}}>
                  <span className="text-ink-2 mr-2">{l.time}</span>{l.msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done */}
        {phase === 'done' && (
          <div style={{background:'var(--surface)',border:'1px solid rgba(31,107,82,0.2)',borderRadius:'var(--r-md)',padding:'40px 24px',textAlign:'center',marginBottom:16}}>
            <CheckCircle size={52} color="var(--sage)" className="mb-4"/>
            <h2 style={{fontSize:22,fontWeight:800,color:'var(--ink)',marginBottom:8}}>Published! 🎉</h2>
            <p className="text-sm text-ink-2 mb-1">
              Your changes are being deployed. <strong>Live in ~90 seconds.</strong>
            </p>
            {stats && (
              <p className="text-[13px] text-ink-3 mb-5">
                Updated: {stats.unis} universities · {stats.programs} programs · {stats.syllabus} syllabus entries · {stats.blog} blog posts · {stats.guides} guides
              </p>
            )}
            <div className="flex gap-2.5 justify-center flex-wrap mb-5">
              <a href="https://edifyedu.in" target="_blank"
                style={{padding:'11px 22px',borderRadius:'var(--r-sm)',background:'linear-gradient(135deg,#1F6B52,#2e8b6e)',color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none',display:'flex',alignItems:'center',gap:6}}>
                <Globe size={14}/> View Live Site
              </a>
              {deployUrl && (
                <a href={deployUrl} target="_blank"
                  style={{padding:'11px 22px',borderRadius:'var(--r-sm)',background:'var(--surface-2)',border:'1px solid var(--border)',color:'var(--ink-2)',fontWeight:600,fontSize:13,textDecoration:'none'}}>
                  View Deploy →
                </a>
              )}
              <button onClick={()=>{setPhase('idle');setLog([]);setStats(null)}}
                style={{padding:'11px 22px',borderRadius:'var(--r-sm)',background:'rgba(200,129,26,0.08)',border:'1px solid rgba(200,129,26,0.2)',color:'var(--amber-text)',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                Upload Another Update
              </button>
            </div>

            {/* Log */}
            <div style={{background:'var(--ink)',borderRadius:'var(--r-sm)',padding:'12px 14px',maxHeight:150,overflow:'auto',textAlign:'left'}}>
              {log.map((l,i)=>(
                <div key={i} style={{fontSize:11,color:l.msg.startsWith('✓')?'var(--sage-bright)':l.msg.startsWith('❌')?'#f87171':'var(--ink-4)',fontFamily:'monospace',lineHeight:1.7}}>
                  {l.msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* One-time setup note */}
        <div style={{background:'rgba(200,129,26,0.06)',border:'1px solid rgba(200,129,26,0.15)',borderRadius:'var(--r-sm)',padding:'16px 20px'}}>
          <div className="text-xs font-bold text-amber mb-2">⚙️ One-time developer setup required</div>
          <div className="text-xs text-ink-2 leading-[1.8]">
            Ask your developer to add these to <strong>Vercel Environment Variables</strong> once:<br/>
            <code className="bg-slate-100 px-1.5 py-px rounded text-[11px]">GITHUB_TOKEN</code> — GitHub Personal Access Token with repo write permission<br/>
            <code className="bg-slate-100 px-1.5 py-px rounded text-[11px]">GITHUB_OWNER</code> — your GitHub username (e.g. careedify-sys)<br/>
            <code className="bg-slate-100 px-1.5 py-px rounded text-[11px]">GITHUB_REPO</code> — repository name (e.g. edify-edu)<br/>
            After that, this page is <strong>fully self-service</strong> — no developer needed for content updates.
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
