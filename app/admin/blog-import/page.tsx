// @ts-nocheck
'use client'
// Auth: Protected by middleware.ts — no client-side password check needed

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle,
         ArrowLeft, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'


function slugify(t) {
  return String(t).toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim().slice(0,80)
}
function estimateReadTime(html) {
  return Math.max(1, Math.round((String(html||'').replace(/<[^>]+>/g,'').split(/\s+/).filter(Boolean).length)/200))
}

function generateBlogTS(posts) {
  const now = new Date().toISOString().split('T')[0]
  const ts = (s,max=300) => String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ').trim().slice(0,max)
  
  return `// lib/blog.ts — Auto-generated from Excel import on ${now}
// DO NOT EDIT MANUALLY — use /admin/blog-import

export interface BlogPost {
  slug: string; title: string; metaDescription: string; category: string
  tags: string[]; publishedAt: string; readTime: number; content: string
  faqs: { q: string; a: string }[]; relatedUniversities: string[]
  targetKeyword: string; status: 'published' | 'draft'
}

export function getPublishedPosts() {
  return BLOG_POSTS.filter(p => p.status === 'published').sort((a,b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}
export function getPostBySlug(slug: string) { return BLOG_POSTS.find(p => p.slug === slug) || null }

export const BLOG_POSTS: BlogPost[] = [
${posts.map(p => `  {
    slug: '${ts(p.slug,80)}', title: '${ts(p.title,120)}',
    metaDescription: '${ts(p.metaDescription,160)}', category: '${ts(p.category,50)}',
    tags: [${(p.tags||[]).map(t=>`'${ts(t,50)}'`).join(', ')}],
    publishedAt: '${ts(p.publishedAt||now,20)}', readTime: ${p.readTime||5},
    targetKeyword: '${ts(p.targetKeyword,100)}', relatedUniversities: [],
    status: '${p.status==="draft"?"draft":"published"}',
    faqs: [\n${(p.faqs||[]).filter(f=>f.q&&f.a).map(f=>`      { q: '${ts(f.q,200)}', a: '${ts(f.a,500)}' }`).join(',\n')}\n    ],
    content: \`\n${(p.content||'<p>Coming soon.</p>').replace(/\`/g,'\\`')}\n    \`,
  }`).join(',\n')}
]
`
}

export default function BlogImportPage() {
  const [step, setStep] = useState('upload')
  const [parsedPosts, setParsedPosts] = useState([])
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

  async function parseExcel(f) {
    setStep('parsing'); setError('')
    const lines = []
    try {
      const XLSX = await loadXLSX()
      lines.push('✓ SheetJS loaded')
      const buffer = await f.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      lines.push(`✓ Sheets: ${wb.SheetNames.join(', ')}`)
      const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes('blog') || n.toLowerCase().includes('post')) || wb.SheetNames[0]
      lines.push(`Using: ${sheetName}`)
      const ws = wb.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      let hRow = 0
      for (let i=0;i<Math.min(5,rows.length);i++) {
        if (rows[i].some(c => String(c).toLowerCase().includes('title'))) { hRow=i; break }
      }
      const H = rows[hRow].map(h => String(h||'').trim().toLowerCase())
      const ci = names => { const n=Array.isArray(names)?names:[names]; return H.findIndex(h=>n.some(x=>h.includes(x))) }
      const C = {
        title:ci('title'), slug:ci('slug'), meta:ci(['meta','description']),
        cat:ci('category'), tags:ci('tags'), kw:ci(['keyword','target']),
        rt:ci(['read time','readtime']), status:ci('status'), content:ci(['content','html','body']),
        q:[ci(['q1','faq q1','question 1']),ci(['q2','faq q2','question 2']),ci(['q3','faq q3','question 3'])],
        a:[ci(['a1','faq a1','answer 1']),ci(['a2','faq a2','answer 2']),ci(['a3','faq a3','answer 3'])],
      }
      lines.push(`Cols: title=${C.title} content=${C.content} status=${C.status}`)
      const posts = []
      for (let i=hRow+1;i<rows.length;i++) {
        const row = rows[i]
        const title = String(row[C.title]||'').trim()
        if (!title) continue
        const content = C.content>=0 ? String(row[C.content]||'') : ''
        posts.push({
          title, slug: C.slug>=0&&row[C.slug] ? String(row[C.slug]).trim() : slugify(title),
          metaDescription: C.meta>=0 ? String(row[C.meta]||'').slice(0,160) : '',
          category: C.cat>=0 ? String(row[C.cat]||'MBA Guides') : 'MBA Guides',
          tags: C.tags>=0&&row[C.tags] ? String(row[C.tags]).split(/[,|]/).map(t=>t.trim()).filter(Boolean) : [],
          targetKeyword: C.kw>=0 ? String(row[C.kw]||title) : title,
          readTime: C.rt>=0&&row[C.rt] ? parseInt(String(row[C.rt]))||estimateReadTime(content) : estimateReadTime(content),
          status: C.status>=0 ? (String(row[C.status]||'').toLowerCase().includes('draft')?'draft':'published') : 'published',
          publishedAt: new Date().toISOString().split('T')[0],
          content: content || `<h2>${title}</h2><p>Content coming soon.</p>`,
          faqs: C.q.map((qc,i)=>({q:qc>=0?String(row[qc]||'').trim():'',a:C.a[i]>=0?String(row[C.a[i]]||'').trim():''})).filter(f=>f.q&&f.a),
        })
      }
      lines.push(`✅ ${posts.length} posts parsed`)
      setLog(lines); setParsedPosts(posts); setStep('preview')
    } catch(err) { setError(err.message); setStep('upload'); setLog([...lines,`❌ ${err.message}`]) }
  }

  function downloadBlogTS() {
    const blob = new Blob([generateBlogTS(parsedPosts)], {type:'text/plain;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='blog.ts'; a.click()
    URL.revokeObjectURL(url); setStep('done')
  }

  function downloadTemplate() {
    const XLSX = xlsxRef.current || window.XLSX
    if (!XLSX) { alert('Upload a file first to initialise SheetJS, then try again.'); return }
    const ws = XLSX.utils.aoa_to_sheet([
      ['Title','Slug','Meta Description','Category','Tags','Target Keyword','Read Time','Status','Content (HTML)','FAQ Q1','FAQ A1','FAQ Q2','FAQ A2','FAQ Q3','FAQ A3'],
      ['Best Online MBA India 2026 – Honest Guide','best-online-mba-india-2026','Honest comparison of top online MBA programs in India 2026. Fees, NIRF ranks, ROI.','MBA Guides','online MBA, India 2026, UGC approved','best online MBA India 2026','7','published','<h2>Why Online MBA?</h2><p>Content here...</p>','Is online MBA valid?','Yes if UGC-DEB approved.','Which is the best online MBA?','LPU, Amity, Symbiosis — all NIRF ranked.','What is the fee?','₹60K to ₹3L total.'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Blog Posts')
    XLSX.writeFile(wb, 'edify-blog-template.xlsx')
  }

  const S = {card:{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)'}}


  return (
    <div className="page-shell">
      <div className="bg-navy px-5 py-[14px]">
        <div className="max-w-[960px] mx-auto flex items-center gap-2.5">
          <Link href="/admin" className="text-slate-400 flex items-center gap-[5px] text-[13px] no-underline">
            <ArrowLeft size={13}/> Admin
          </Link>
          <span className="text-ink-2">/</span>
          <span className="text-amber font-bold text-sm">📝 Blog Import</span>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-[22px] font-extrabold text-navy mb-1.5 mt-0">Blog Post Import</h1>
            <p className="text-[13px] text-ink-3 m-0">Fill Excel template → upload → download <code className="bg-slate-100 px-[5px] py-px rounded text-[11px]">lib/blog.ts</code> → push to GitHub</p>
          </div>
          <button onClick={downloadTemplate}
            style={{padding:'10px 18px',borderRadius:'var(--r-sm)',background:'rgba(31,107,82,0.08)',border:'1px solid rgba(31,107,82,0.2)',color:'var(--sage)',fontWeight:700,fontSize:13,cursor:'pointer'}}>
            ⬇️ Download Excel Template
          </button>
        </div>

        {/* Column guide */}
        <div style={{...S.card,padding:'14px 18px',marginBottom:16}}>
          <div className="text-xs font-bold text-navy mb-2">Excel Column Format (one row per post)</div>
          <div className="flex flex-wrap gap-[5px]">
            {['Title*','Slug','Meta Description','Category','Tags','Target Keyword','Read Time','Status','Content (HTML)*','FAQ Q1','FAQ A1','FAQ Q2','FAQ A2','FAQ Q3','FAQ A3'].map(c=>(
              <span key={c} style={{fontSize:11,padding:'3px 8px',borderRadius:5,background:c.includes('*')?'rgba(200,129,26,0.1)':'var(--surface-2)',border:`1px solid ${c.includes('*')?'rgba(200,129,26,0.3)':'var(--border)'}`,color:c.includes('*')?'var(--amber-text)':'var(--ink-2)',fontWeight:c.includes('*')?700:400}}>
                {c}
              </span>
            ))}
          </div>
          <div style={{fontSize:11,color:'var(--ink-4)',marginTop:6}}>* Required. Content accepts plain text or HTML. Slug auto-generated from title if blank.</div>
        </div>

        {(step==='upload'||step==='parsing') && (
          <div style={{...S.card,padding:'48px 24px',border:'2px dashed #CBD5E1',textAlign:'center'}}>
            <FileSpreadsheet size={44} color="var(--amber-text)" className="mb-4"/>
            <h2 className="text-lg font-bold text-navy mb-2">Upload Blog Excel</h2>
            <p className="text-[13px] text-ink-3 mb-5">Use the template above — one row per blog post</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f)}}/>
            <button onClick={()=>fileRef.current?.click()} disabled={step==='parsing'}
              style={{padding:'13px 28px',borderRadius:'var(--r-sm)',background:step==='parsing'?'var(--ink-4)':'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:step==='parsing'?'wait':'pointer',display:'inline-flex',alignItems:'center',gap:8}}>
              {step==='parsing'?<><RefreshCw size={15} className="animate-spin"/> Parsing...</>:<><Upload size={15}/> Choose File</>}
            </button>
            {error&&<div style={{marginTop:14,padding:'10px 14px',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'var(--r-xs)',fontSize:13,color:'var(--red)',display:'inline-flex',gap:8}}><AlertCircle size={14}/>{error}</div>}
            {log.length>0&&<div style={{marginTop:16,textAlign:'left',background:'var(--ink)',borderRadius:'var(--r-sm)',padding:'12px 14px',maxHeight:160,overflow:'auto'}}>{log.map((l,i)=><div key={i} className="text-[11px] text-slate-400 font-mono leading-relaxed">{l}</div>)}</div>}
          </div>
        )}

        {step==='preview' && (
          <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
              {[{l:'Posts',v:parsedPosts.length},{l:'Published',v:parsedPosts.filter(p=>p.status==='published').length},{l:'Drafts',v:parsedPosts.filter(p=>p.status==='draft').length},{l:'With FAQs',v:parsedPosts.filter(p=>p.faqs?.length>0).length}].map(s=>(
                <div key={s.l} style={{...S.card,padding:'12px',textAlign:'center'}}>
                  <div className="text-xl font-extrabold text-amber">{s.v}</div>
                  <div className="text-[11px] text-ink-3">{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{...S.card,overflow:'hidden',marginBottom:14}}>
              <div style={{maxHeight:380,overflow:'auto'}}>
                <table className="w-full border-collapse text-xs">
                  <thead><tr className="bg-surface-2">
                    {['','Title','Category','Status','FAQs'].map(h=><th key={h} style={{padding:'9px 12px',textAlign:'left',fontWeight:700,color:'var(--ink-3)',fontSize:10,textTransform:'uppercase',borderBottom:'1px solid var(--border)'}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {parsedPosts.map((p,i)=>(
                      <>
                        <tr key={p.slug} onClick={()=>setExpanded(expanded===i?null:i)}
                          style={{borderBottom:'1px solid #F1F5F9',cursor:'pointer',background:expanded===i?'rgba(200,129,26,0.04)':'transparent'}}>
                          <td className="px-2.5 py-2">{expanded===i?<ChevronDown size={11} color="var(--amber-text)"/>:<ChevronRight size={11} color="var(--ink-4)"/>}</td>
                          <td className="px-3 py-2 font-semibold text-navy max-w-[320px]">
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap">{p.title}</div>
                            <div style={{fontSize:10,color:'var(--ink-4)',fontFamily:'monospace'}}>{p.slug}</div>
                          </td>
                          <td className="px-3 py-2 text-ink-2">{p.category}</td>
                          <td style={{padding:'8px 12px'}}>
                            <span style={{padding:'2px 8px',borderRadius:'var(--r-lg)',fontSize:10,fontWeight:700,background:p.status==='published'?'rgba(31,107,82,0.1)':'rgba(148,163,184,0.1)',color:p.status==='published'?'var(--sage)':'var(--ink-3)'}}>{p.status}</span>
                          </td>
                          <td className="px-3 py-2 text-ink-2">{p.faqs?.length||0}</td>
                        </tr>
                        {expanded===i&&(
                          <tr key={p.slug+'-e'}><td colSpan={5} className="pl-9 pr-3 pb-3 pt-0 bg-amber/[0.02]">
                            <div style={{paddingTop:10,fontSize:12,color:'var(--ink-3)',display:'flex',flexDirection:'column',gap:6}}>
                              <div><strong>Meta:</strong> {p.metaDescription}</div>
                              <div><strong>Keyword:</strong> {p.targetKeyword}</div>
                              <div><strong>Tags:</strong> {p.tags?.join(', ')}</div>
                              {p.faqs?.length>0&&p.faqs.map((f,fi)=><div key={fi}><strong>Q{fi+1}:</strong> {f.q} → {f.a}</div>)}
                              <div className="text-[11px] text-slate-400">Content: {(p.content||'').replace(/<[^>]+>/g,'').slice(0,200)}...</div>
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
              <button onClick={downloadBlogTS} style={{padding:'13px 24px',borderRadius:'var(--r-sm)',background:'linear-gradient(135deg,#0B1D35,#142540)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
                <Download size={15}/> Download lib/blog.ts
              </button>
              <button onClick={()=>{setStep('upload');setParsedPosts([]);setLog([])}}
                style={{padding:'13px 20px',borderRadius:'var(--r-sm)',background:'var(--surface-2)',border:'1px solid var(--border)',color:'var(--ink-3)',fontWeight:600,fontSize:13,cursor:'pointer'}}>
                Upload Different File
              </button>
            </div>
          </>
        )}

        {step==='done' && (
          <div style={{...S.card,padding:'40px 24px',textAlign:'center'}}>
            <CheckCircle size={48} color="var(--sage)" className="mb-4"/>
            <h2 className="text-[18px] font-extrabold text-navy mb-2">blog.ts Downloaded!</h2>
            <p className="text-[13px] text-ink-3 max-w-[480px] mx-auto mb-5 leading-[1.7]">
              Move <code>blog.ts</code> to <code>edify-next/lib/</code> → git push → live in 2 mins.
            </p>
            <button onClick={()=>{setStep('upload');setParsedPosts([]);setLog([])}}
              style={{padding:'11px 20px',borderRadius:'var(--r-sm)',background:'var(--surface-2)',border:'1px solid var(--border)',color:'var(--ink-3)',fontWeight:600,fontSize:13,cursor:'pointer'}}>
              Import Another File
            </button>
          </div>
        )}

        <div style={{marginTop:16,padding:'13px 16px',background:'rgba(200,129,26,0.06)',border:'1px solid rgba(200,129,26,0.15)',borderRadius:'var(--r-sm)',fontSize:12,color:'var(--ink-2)',lineHeight:1.7}}>
          <strong>💡 No coding needed:</strong> Fill Excel template → upload here → download blog.ts → drag into project folder → git push. Live in ~2 minutes.
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
