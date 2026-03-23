// @ts-nocheck
'use client'
// Auth: Protected by middleware.ts — no client-side password check needed

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Upload, Download, CheckCircle, AlertCircle, ArrowLeft, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'


function generateGuidesTS(guides) {
  const ts = (s, max=300) => String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ').trim().slice(0,max)
  
  return `'use client'
// Auth: Protected by middleware.ts — no client-side password check needed

import Link from 'next/link'

export const GUIDES = [
${guides.map(g => `  {
    id: '${ts(g.id,50)}',
    icon: '${ts(g.icon,10)||'📖'}',
    tag: '${ts(g.tag,50)}',
    title: '${ts(g.title,120)}',
    desc: '${ts(g.desc,300)}',
    readTime: '${ts(g.readTime,20)||'5 min read'}',
    content: \`${(g.content||'').replace(/\`/g,'\\`').replace(/\\/g,'\\\\').slice(0,5000)}\`,
  }`).join(',\n')}
]

export default function GuidesPage() {
  return (
    <div className="page-shell">
      <div className="bg-white border-b border-border py-7">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-navy mb-2 mt-0">Guides & Honest Answers</h1>
          <p className="body-sm m-0">No fluff. Just straight answers to the questions every student asks before enrolling.</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {GUIDES.map(g=>(
            <Link key={g.id} href={\`/guides/\${g.id}\`} className="no-underline">
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',padding:24,height:'100%',cursor:'pointer',transition:'box-shadow 0.15s'}}>
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

export default function GuidesImportPage() {
  const [step, setStep] = useState('upload')
  const [guides, setGuides] = useState([])
  const [error, setError] = useState(''); const [log, setLog] = useState([])
  const [expanded, setExpanded] = useState(null)
  const fileRef = useRef(null); const xlsxRef = useRef(null)

  async function loadXLSX() {
    if (xlsxRef.current) return xlsxRef.current
    if (window.XLSX) { xlsxRef.current = window.XLSX; return window.XLSX }
    return new Promise((res,rej) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
      s.onload = () => { xlsxRef.current = window.XLSX; res(window.XLSX) }
      s.onerror = () => rej(new Error('Failed to load SheetJS'))
      document.head.appendChild(s)
    })
  }

  function downloadTemplate() {
    const XLSX = xlsxRef.current || window.XLSX
    if (!XLSX) { alert('Click Choose File first to initialise, then try again.'); return }
    const ws = XLSX.utils.aoa_to_sheet([
      ['ID','Icon','Tag','Title','Description','Read Time','Content (HTML/Text)'],
      ['validity','🏛️','Validity','Is an online degree valid in India?','The honest answer to whether UGC-DEB approved degrees are accepted.','4 min read','<h2>Yes, if UGC-DEB approved</h2><p>All universities on Edify are UGC DEB approved...</p>'],
      ['govt-jobs','🏢','Government Jobs','Can I get a central govt job with an online MBA?','Which PSUs and ministries accept online degrees.','5 min read','<h2>Short answer: Yes, with conditions</h2><p>Most central government jobs...</p>'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Guides')
    XLSX.writeFile(wb, 'edify-guides-template.xlsx')
  }

  async function parseExcel(f) {
    setStep('parsing'); setError('')
    const lines = []
    try {
      const XLSX = await loadXLSX()
      lines.push('✓ SheetJS loaded')
      const buffer = await f.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes('guide')) || wb.SheetNames[0]
      lines.push(`Using: ${sheetName}`)
      const ws = wb.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      let hRow = 0
      for (let i=0;i<Math.min(5,rows.length);i++) {
        if (rows[i].some(c => String(c).toLowerCase().includes('id') || String(c).toLowerCase().includes('title'))) { hRow=i; break }
      }
      const H = rows[hRow].map(h => String(h||'').trim().toLowerCase())
      const ci = names => { const n=Array.isArray(names)?names:[names]; return H.findIndex(h=>n.some(x=>h.includes(x))) }
      const C = { id:ci('id'), icon:ci('icon'), tag:ci('tag'), title:ci('title'), desc:ci(['desc','description']), rt:ci(['read time','readtime']), content:ci('content') }
      lines.push(`Cols: id=${C.id} title=${C.title} content=${C.content}`)
      const parsed = []
      for (let i=hRow+1;i<rows.length;i++) {
        const row = rows[i]
        const title = String(row[C.title]||'').trim()
        if (!title) continue
        parsed.push({
          id: C.id>=0&&row[C.id] ? String(row[C.id]).trim().replace(/[^a-z0-9-]/g,'') : title.toLowerCase().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,'-').slice(0,40),
          icon: C.icon>=0 ? String(row[C.icon]||'📖') : '📖',
          tag: C.tag>=0 ? String(row[C.tag]||'Guide') : 'Guide',
          title, desc: C.desc>=0 ? String(row[C.desc]||'').slice(0,300) : '',
          readTime: C.rt>=0&&row[C.rt] ? String(row[C.rt]) : '5 min read',
          content: C.content>=0 ? String(row[C.content]||'') : '',
        })
      }
      lines.push(`✅ ${parsed.length} guides parsed`)
      setLog(lines); setGuides(parsed); setStep('preview')
    } catch(err) { setError(err.message); setStep('upload'); setLog([...lines,`❌ ${err.message}`]) }
  }

  function downloadGuidesPage() {
    const code = generateGuidesTS(guides)
    const blob = new Blob([code], {type:'text/plain;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='page.tsx'; a.click()
    URL.revokeObjectURL(url); setStep('done')
  }

  const S = {card:{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)'}}


  return (
    <div className="page-shell">
      <div className="bg-navy px-5 py-[14px]">
        <div className="max-w-[960px] mx-auto flex items-center gap-2.5">
          <Link href="/admin" className="text-slate-400 flex items-center gap-[5px] text-[13px] no-underline"><ArrowLeft size={13}/> Admin</Link>
          <span className="text-ink-2">/</span>
          <span className="text-amber font-bold text-sm">📚 Guides Import</span>
        </div>
      </div>
      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-[22px] font-extrabold text-navy mb-1.5 mt-0">Guides Import</h1>
            <p className="text-[13px] text-ink-3 m-0">Fill Excel → upload → download <code className="bg-slate-100 px-[5px] py-px rounded text-[11px]">app/guides/page.tsx</code> → push to GitHub</p>
          </div>
          <button onClick={downloadTemplate} style={{padding:'10px 18px',borderRadius:'var(--r-sm)',background:'rgba(31,107,82,0.08)',border:'1px solid rgba(31,107,82,0.2)',color:'var(--sage)',fontWeight:700,fontSize:13,cursor:'pointer'}}>⬇️ Download Template</button>
        </div>

        <div style={{...S.card,padding:'14px 18px',marginBottom:16}}>
          <div className="text-xs font-bold text-navy mb-2">Excel Columns</div>
          <div className="flex flex-wrap gap-[5px]">
            {['ID','Icon (emoji)','Tag','Title*','Description*','Read Time','Content (HTML)*'].map(c=>(
              <span key={c} style={{fontSize:11,padding:'3px 8px',borderRadius:5,background:c.includes('*')?'rgba(200,129,26,0.1)':'var(--surface-2)',border:`1px solid ${c.includes('*')?'rgba(200,129,26,0.3)':'var(--border)'}`,color:c.includes('*')?'var(--amber-text)':'var(--ink-2)',fontWeight:c.includes('*')?700:400}}>{c}</span>
            ))}
          </div>
        </div>

        {(step==='upload'||step==='parsing') && (
          <div style={{...S.card,padding:'48px 24px',border:'2px dashed #CBD5E1',textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:16}}>📚</div>
            <h2 className="text-lg font-bold text-navy mb-2">Upload Guides Excel</h2>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f)}}/>
            <button onClick={()=>fileRef.current?.click()} disabled={step==='parsing'}
              style={{padding:'13px 28px',borderRadius:'var(--r-sm)',background:step==='parsing'?'var(--ink-4)':'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:step==='parsing'?'wait':'pointer',display:'inline-flex',alignItems:'center',gap:8}}>
              {step==='parsing'?<><RefreshCw size={15} className="animate-spin"/> Parsing...</>:<><Upload size={15}/> Choose File</>}
            </button>
            {error&&<div style={{marginTop:14,padding:'10px 14px',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'var(--r-xs)',fontSize:13,color:'var(--red)',display:'inline-flex',gap:8}}><AlertCircle size={14}/>{error}</div>}
            {log.length>0&&<div style={{marginTop:16,textAlign:'left',background:'var(--ink)',borderRadius:'var(--r-sm)',padding:'12px 14px',maxHeight:120,overflow:'auto'}}>{log.map((l,i)=><div key={i} className="text-[11px] text-slate-400 font-mono leading-relaxed">{l}</div>)}</div>}
          </div>
        )}

        {step==='preview' && (
          <>
            <div style={{...S.card,overflow:'hidden',marginBottom:14}}>
              <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border)',fontSize:13,fontWeight:700,color:'var(--ink)'}}>{guides.length} Guides — Click to expand</div>
              <div style={{maxHeight:400,overflow:'auto'}}>
                <table className="w-full border-collapse text-xs">
                  <thead><tr className="bg-surface-2">
                    {['','ID','Title','Tag','Read Time'].map(h=><th key={h} style={{padding:'9px 12px',textAlign:'left',fontWeight:700,color:'var(--ink-3)',fontSize:10,textTransform:'uppercase',borderBottom:'1px solid var(--border)'}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {guides.map((g,i)=>(
                      <>
                        <tr key={g.id} onClick={()=>setExpanded(expanded===i?null:i)} style={{borderBottom:'1px solid #F1F5F9',cursor:'pointer',background:expanded===i?'rgba(200,129,26,0.04)':'transparent'}}>
                          <td className="px-2.5 py-2">{expanded===i?<ChevronDown size={11} color="var(--amber-text)"/>:<ChevronRight size={11} color="var(--ink-4)"/>}</td>
                          <td style={{padding:'8px 12px',fontFamily:'monospace',color:'var(--ink-4)',fontSize:10}}>{g.id}</td>
                          <td className="px-3 py-2 font-semibold text-navy max-w-[320px]">
                            <span style={{marginRight:6}}>{g.icon}</span>
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{g.title}</span>
                          </td>
                          <td style={{padding:'8px 12px',color:'var(--amber-text)',fontWeight:600,fontSize:11}}>{g.tag}</td>
                          <td className="px-3 py-2 text-ink-2">{g.readTime}</td>
                        </tr>
                        {expanded===i&&(
                          <tr key={g.id+'-e'}><td colSpan={5} className="pl-9 pr-3 pb-3 pt-0 bg-amber/[0.02]">
                            <div style={{paddingTop:10,fontSize:12,color:'var(--ink-3)',display:'flex',flexDirection:'column',gap:4}}>
                              <div><strong>Desc:</strong> {g.desc}</div>
                              <div><strong>Content preview:</strong> {(g.content||'').replace(/<[^>]+>/g,'').slice(0,200)}...</div>
                            </div>
                          </td></tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button onClick={downloadGuidesPage} style={{padding:'13px 24px',borderRadius:'var(--r-sm)',background:'linear-gradient(135deg,#0B1D35,#142540)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
                <Download size={15}/> Download app/guides/page.tsx
              </button>
              <button onClick={()=>{setStep('upload');setGuides([]);setLog([])}} style={{padding:'13px 20px',borderRadius:'var(--r-sm)',background:'var(--surface-2)',border:'1px solid var(--border)',color:'var(--ink-3)',fontWeight:600,fontSize:13,cursor:'pointer'}}>Upload Different File</button>
            </div>
          </>
        )}

        {step==='done' && (
          <div style={{...S.card,padding:'40px 24px',textAlign:'center'}}>
            <CheckCircle size={48} color="var(--sage)" className="mb-4"/>
            <h2 className="text-[18px] font-extrabold text-navy mb-2">page.tsx Downloaded!</h2>
            <p className="text-[13px] text-ink-3 max-w-[480px] mx-auto mb-5 leading-[1.7]">Move <code>page.tsx</code> to <code>edify-next/app/guides/</code> → git push → live in 2 min.</p>
            <button onClick={()=>{setStep('upload');setGuides([]);setLog([])}} style={{padding:'11px 20px',borderRadius:'var(--r-sm)',background:'var(--surface-2)',border:'1px solid var(--border)',color:'var(--ink-3)',fontWeight:600,fontSize:13,cursor:'pointer'}}>Import Another</button>
          </div>
        )}

        <div style={{marginTop:16,padding:'13px 16px',background:'rgba(200,129,26,0.06)',border:'1px solid rgba(200,129,26,0.15)',borderRadius:'var(--r-sm)',fontSize:12,color:'var(--ink-2)',lineHeight:1.7}}>
          <strong>💡 No coding needed:</strong> Fill template → upload → download page.tsx → drag to <code>app/guides/</code> → git push → live in ~2 min.
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
