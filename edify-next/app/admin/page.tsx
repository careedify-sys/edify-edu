'use client'

import { useState, useEffect } from 'react'
import { UNIVERSITIES } from '@/lib/data'
import { BLOG_POSTS } from '@/lib/blog'
import type { University, Program } from '@/lib/data'
import type { BlogPost } from '@/lib/blog'
import {
  Plus, Edit2, Save, X, Lock, Eye, EyeOff, Copy, CheckCircle,
  Palette, Info, DollarSign, BookOpen, Settings, FileText,
  BarChart2, Trash2, PenSquare, Bold, Italic, List, Link2,
  Heading2, Quote, Table, Code, AlignLeft, Hash, Star
} from 'lucide-react'

/* ── CONSTANTS ─────────────────────────────────────────────── */
const ADMIN_PASSWORD = 'edify2025'
const ALL_PROGRAMS: Program[] = ['MBA','MCA','BBA','BCA','BA','B.Com','MA','M.Com','MSc','BSc','MBA (WX)']
const REGIONS = ['North','South','West','East','Central']
const EXAM_MODES = ['Online','Assignment-based','Exam Centre','Hybrid']
const NAAC_GRADES = ['A++','A+','A','B++','B+','B']
const APPROVAL_OPTIONS = [
  'UGC DEB','AICTE','NBA','WES Recognised','AIU Recognised','IAU Member',
  'QS Ranked','NIRF Ranked','NIRFM Ranked','ISO Certified',
  'NAAC A++','NAAC A+','NAAC A','NAAC B++',
]
const COLOR_PRESETS = [
  '#F59E0B','#1A2F4E','#0891B2','#7C3AED','#DC2626','#0891B2',
  '#059669','#9333EA','#D97706','#4F46E5','#0369A1','#C2410C',
]
const BLOG_CATEGORIES = [
  'MBA Guides','MCA Guides','BBA Guides','Validity & Recognition',
  'Career Guides','University Reviews','Fees & Finance','City Guides'
]
const SEO_KEYWORDS = [
  'online MBA India 2025','UGC DEB approved','online degree government jobs',
  'best online MBA NIRF ranked','NMIMS vs Manipal','online MCA India',
  'online degree working professionals','UGC approved distance education',
]

type AdminTab = 'universities' | 'blog' | 'seo'
type EditTab = 'basic'|'fees'|'content'|'approvals'|'theme'

function emptyUni(): Partial<University> {
  return {
    id:'',name:'',abbr:'',city:'',state:'',region:'North',
    nirf:50,naac:'A+',ugc:true,examMode:'Online',
    govtRecognised:true,psuEligible:true,
    feeMin:100000,feeMax:200000,emiFrom:5000,
    eligibility:'50% in graduation',eligibilityPct:50,
    highlight:'',tagline:'',description:'',
    forWho:['','',''],notFor:['',''],
    programs:[],programDetails:{} as any,
    color:'#F59E0B',approvals:['UGC DEB'],
  }
}

function emptyPost(): BlogPost {
  const now = new Date().toISOString().split('T')[0]
  return {
    slug:'',title:'',metaDescription:'',
    category:'MBA Guides',tags:[],
    publishedAt:now,readTime:5,
    content:'',faqs:[{q:'',a:''}],
    relatedUniversities:[],
    targetKeyword:'',
    status:'draft',
  }
}

/* ── HTML TOOLBAR INSERT ───────────────────────────────────── */
function insertHTML(id: string, before: string, after = '') {
  const el = document.getElementById(id) as HTMLTextAreaElement
  if (!el) return
  const start = el.selectionStart, end = el.selectionEnd
  const selected = el.value.slice(start, end)
  const replacement = before + (selected || 'text here') + after
  el.setRangeText(replacement, start, end, 'select')
  el.focus()
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  // ── auth
  const [authed, setAuthed]   = useState(false)
  const [pw, setPw]           = useState('')
  const [pwError, setPwError] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  // ── tabs
  const [tab, setTab]         = useState<AdminTab>('universities')

  // ── university state
  const [unis, setUnis]       = useState<University[]>([...UNIVERSITIES])
  const [editUni, setEditUni] = useState<Partial<University>|null>(null)
  const [isNewUni, setIsNewUni] = useState(false)
  const [editTab, setEditTab] = useState<EditTab>('basic')
  const [uniSearch, setUniSearch] = useState('')

  // ── blog state
  const [posts, setPosts]     = useState<BlogPost[]>([...BLOG_POSTS])
  const [editPost, setEditPost] = useState<BlogPost|null>(null)
  const [isNewPost, setIsNewPost] = useState(false)
  const [blogTab, setBlogTab] = useState<'list'|'editor'>('list')
  const [preview, setPreview] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  // ── shared
  const [savedMsg, setSavedMsg] = useState('')
  const [copied, setCopied]   = useState(false)

  /* live word count */
  useEffect(() => {
    if (editPost) {
      const text = editPost.content.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()
      setWordCount(text ? text.split(' ').length : 0)
    }
  }, [editPost?.content])

  function flash(msg: string) {
    setSavedMsg(msg)
    setTimeout(() => setSavedMsg(''), 2500)
  }

  function login() {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false) }
    else setPwError(true)
  }

  /* ── UNIVERSITY ACTIONS ── */
  function startEditUni(u: University) {
    setEditUni({...u, forWho:[...u.forWho], notFor:[...u.notFor], approvals:[...(u.approvals||[])]})
    setIsNewUni(false); setEditTab('basic')
  }
  function saveUni() {
    if (!editUni?.id) return
    if (isNewUni) setUnis(p => [...p, editUni as University])
    else setUnis(p => p.map(u => u.id === editUni.id ? {...u,...editUni} as University : u))
    setEditUni(null)
    flash('✅ University saved to session')
  }
  function toggleApproval(badge: string) {
    const cur: string[] = (editUni as any)?.approvals||[]
    setEditUni(p => ({...p, approvals: cur.includes(badge) ? cur.filter(a=>a!==badge) : [...cur, badge]}))
  }
  function toggleProgram(prog: Program) {
    const cur: Program[] = (editUni as any)?.programs||[]
    setEditUni(p => ({...p, programs: cur.includes(prog) ? cur.filter(x=>x!==prog) : [...cur, prog]}))
  }

  /* ── BLOG ACTIONS ── */
  function newPost() {
    setEditPost(emptyPost()); setIsNewPost(true); setBlogTab('editor'); setPreview(false)
  }
  function startEditPost(p: BlogPost) {
    setEditPost({...p, faqs:[...p.faqs], tags:[...p.tags]}); setIsNewPost(false); setBlogTab('editor'); setPreview(false)
  }
  function savePost() {
    if (!editPost?.title) return
    const slug = editPost.slug || editPost.title.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/ +/g,'-').slice(0,60)
    const post = {...editPost, slug}
    if (isNewPost) setPosts(p => [...p, post])
    else setPosts(p => p.map(x => x.slug === editPost.slug ? post : x))
    setEditPost(null); setBlogTab('list')
    flash('✅ Post saved to session')
  }
  function deletePost(slug: string) {
    if (!confirm('Delete this post? (session only)')) return
    setPosts(p => p.filter(x => x.slug !== slug))
    flash('🗑️ Post deleted')
  }
  function addFaq() {
    setEditPost(p => p ? ({...p, faqs:[...p.faqs, {q:'',a:''}]}) : p)
  }
  function removeFaq(i: number) {
    setEditPost(p => p ? ({...p, faqs:p.faqs.filter((_,idx)=>idx!==i)}) : p)
  }
  function exportCode() {
    const out = JSON.stringify({universities: unis, posts}, null, 2)
    navigator.clipboard.writeText(out)
    setCopied(true); setTimeout(()=>setCopied(false), 2000)
  }

  const filteredUnis = unis.filter(u =>
    u.name.toLowerCase().includes(uniSearch.toLowerCase()) ||
    u.city.toLowerCase().includes(uniSearch.toLowerCase()) ||
    String(u.nirf).includes(uniSearch)
  )

  /* ════════════════ LOGIN SCREEN ════════════════ */
  if (!authed) return (
    <div style={{minHeight:'100vh',background:'#F8F9FC',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
      <div style={{background:'#fff',borderRadius:'24px',padding:'40px 32px',width:'100%',maxWidth:'380px',boxShadow:'0 10px 40px rgba(26,47,78,0.12)',border:'1px solid #E2E8F4'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'#1A2F4E',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <Lock style={{width:'26px',height:'26px',color:'#F59E0B'}} />
          </div>
          <h1 style={{fontSize:'22px',fontWeight:'700',color:'#1A2F4E',fontFamily:'"Instrument Serif",serif',marginBottom:'6px'}}>Admin Panel</h1>
          <p style={{fontSize:'13px',color:'#6B84A0'}}>edifyedu.in · Internal Access Only</p>
        </div>
        <div style={{position:'relative',marginBottom:'12px'}}>
          <input
            type={showPw?'text':'password'}
            placeholder="Admin password"
            value={pw}
            onChange={e=>setPw(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&login()}
            style={{
              width:'100%',padding:'14px 48px 14px 16px',borderRadius:'12px',
              border:`1.5px solid ${pwError?'#DC2626':'#E2E8F4'}`,
              fontSize:'15px',outline:'none',boxSizing:'border-box',
              background:pwError?'#FEF2F2':'#F8F9FC',color:'#1A2F4E',
            }}
          />
          <button onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#6B84A0'}}>
            {showPw ? <EyeOff style={{width:'18px',height:'18px'}}/> : <Eye style={{width:'18px',height:'18px'}}/>}
          </button>
        </div>
        {pwError && <p style={{color:'#DC2626',fontSize:'12px',marginBottom:'8px'}}>Incorrect password. Try again.</p>}
        <button onClick={login} style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#1A2F4E',color:'#fff',fontWeight:'700',fontSize:'15px',border:'none',cursor:'pointer'}}>
          Access Panel
        </button>
        <p style={{textAlign:'center',fontSize:'11px',color:'#6B84A0',marginTop:'16px'}}>This page is not publicly linked on the website</p>
      </div>
    </div>
  )

  /* ════════════════ ADMIN LAYOUT ════════════════ */
  return (
    <div style={{minHeight:'100vh',background:'#F8F9FC'}}>

      {/* TOP BAR */}
      <div style={{background:'#1A2F4E',borderBottom:'1px solid rgba(255,255,255,0.07)',position:'sticky',top:'0',zIndex:50}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 16px'}}>

          {/* Row 1: brand + actions */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',gap:'12px',flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'#F59E0B',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Settings style={{width:'16px',height:'16px',color:'#1A2F4E'}}/>
              </div>
              <div>
                <div style={{fontSize:'13px',fontWeight:'700',color:'#fff'}}>Edify Admin</div>
                <div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)'}}>edifyedu.in</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
              {savedMsg && (
                <span style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',fontWeight:'600',padding:'6px 12px',borderRadius:'8px',background:'rgba(21,128,61,0.15)',color:'#4ade80'}}>
                  {savedMsg}
                </span>
              )}
              <button onClick={exportCode} style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderRadius:'8px',background:'rgba(255,255,255,0.08)',color:'#fff',border:'1px solid rgba(255,255,255,0.12)',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>
                <Copy style={{width:'13px',height:'13px'}}/> {copied?'Copied!':'Export JSON'}
              </button>
              <a href="/" target="_blank" style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderRadius:'8px',background:'#F59E0B',color:'#1A2F4E',fontSize:'12px',fontWeight:'700',textDecoration:'none'}}>
                View Site ↗
              </a>
            </div>
          </div>

          {/* Row 2: tabs */}
          <div style={{display:'flex',gap:'2px',paddingBottom:'0'}}>
            {([
              {key:'universities' as AdminTab, icon:<BarChart2 style={{width:'14px',height:'14px'}}/>, label:`Universities (${unis.length})`},
              {key:'blog' as AdminTab,         icon:<PenSquare style={{width:'14px',height:'14px'}}/>, label:`Blog Posts (${posts.length})`},
              {key:'seo' as AdminTab,          icon:<Hash style={{width:'14px',height:'14px'}}/>,      label:'SEO Checklist'},
            ]).map(t => (
              <button key={t.key} onClick={()=>{setTab(t.key);setEditUni(null);if(t.key!=='blog'){setBlogTab('list')}}}
                style={{
                  display:'flex',alignItems:'center',gap:'6px',
                  padding:'10px 16px',fontSize:'12px',fontWeight:'600',
                  border:'none',cursor:'pointer',borderRadius:'8px 8px 0 0',
                  background: tab===t.key ? '#F8F9FC' : 'transparent',
                  color:      tab===t.key ? '#1A2F4E' : 'rgba(255,255,255,0.5)',
                  transition:'all 0.15s',
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'24px 16px'}}>

        {/* ════════ UNIVERSITIES TAB ════════ */}
        {tab==='universities' && !editUni && (
          <div>
            <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:'12px',marginBottom:'20px'}}>
              <div>
                <h2 style={{fontSize:'20px',fontWeight:'700',color:'#1A2F4E',marginBottom:'4px'}}>All Universities</h2>
                <p style={{fontSize:'13px',color:'#6B84A0'}}>Tap any card to edit data, fees, content, and theme</p>
              </div>
              <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                <input
                  type="text" placeholder="Search name, city, NIRF..."
                  value={uniSearch} onChange={e=>setUniSearch(e.target.value)}
                  style={{padding:'10px 14px',borderRadius:'10px',border:'1.5px solid #E2E8F4',fontSize:'14px',outline:'none',minWidth:'200px',background:'#fff',color:'#1A2F4E'}}
                />
                <button onClick={()=>{setEditUni(emptyUni());setIsNewUni(true);setEditTab('basic')}}
                  style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 16px',borderRadius:'10px',background:'#F59E0B',color:'#1A2F4E',fontWeight:'700',fontSize:'13px',border:'none',cursor:'pointer'}}>
                  <Plus style={{width:'14px',height:'14px'}}/> Add University
                </button>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'14px'}}>
              {filteredUnis.map(u => (
                <div key={u.id} onClick={()=>startEditUni(u)} style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:'16px',overflow:'hidden',cursor:'pointer',transition:'all 0.2s',boxShadow:'0 1px 3px rgba(26,47,78,0.06)'}}
                  className="uni-admin-card">
                  <div style={{height:'3px',background:u.color}}/>
                  <div style={{padding:'16px'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'10px'}}>
                      <div>
                        <div style={{fontWeight:'600',fontSize:'14px',color:'#1A2F4E',marginBottom:'2px'}}>{u.name}</div>
                        <div style={{fontSize:'12px',color:'#6B84A0'}}>{u.city}, {u.state}</div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();startEditUni(u)}} style={{padding:'6px',borderRadius:'8px',background:'#F1F4F9',border:'none',cursor:'pointer',color:'#3B526B'}}>
                        <Edit2 style={{width:'13px',height:'13px'}}/>
                      </button>
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                      <span style={{fontSize:'10px',fontWeight:'700',padding:'3px 8px',borderRadius:'6px',background:'#1A2F4E',color:'#F59E0B'}}>NIRF #{u.nirf}</span>
                      <span style={{fontSize:'10px',fontWeight:'600',padding:'3px 8px',borderRadius:'6px',background:'#D1F5F0',color:'#0891B2'}}>NAAC {u.naac}</span>
                      <span style={{fontSize:'10px',fontWeight:'600',padding:'3px 8px',borderRadius:'6px',background:'#DCFCE7',color:'#15803D'}}>{u.programs.length} progs</span>
                      <span style={{fontSize:'10px',fontWeight:'600',padding:'3px 8px',borderRadius:'6px',background:'#FFFBEB',color:'#D97706'}}>₹{Math.round(u.feeMin/1000)}K–{Math.round(u.feeMax/1000)}K</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── UNIVERSITY EDIT FORM ── */}
        {tab==='universities' && editUni && (
          <div>
            <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:'12px',marginBottom:'20px'}}>
              <div>
                <h2 style={{fontSize:'18px',fontWeight:'700',color:'#1A2F4E',marginBottom:'4px'}}>
                  {isNewUni ? 'Add New University' : `Editing: ${editUni.name}`}
                </h2>
                <p style={{fontSize:'12px',color:'#6B84A0'}}>Session only — export JSON to save permanently</p>
              </div>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                <button onClick={()=>setEditUni(null)} style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 16px',borderRadius:'10px',background:'#fff',border:'1.5px solid #E2E8F4',color:'#3B526B',fontWeight:'600',fontSize:'13px',cursor:'pointer'}}>
                  <X style={{width:'14px',height:'14px'}}/> Cancel
                </button>
                <button onClick={saveUni} style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 16px',borderRadius:'10px',background:'#F59E0B',color:'#1A2F4E',fontWeight:'700',fontSize:'13px',border:'none',cursor:'pointer'}}>
                  <Save style={{width:'14px',height:'14px'}}/> Save
                </button>
              </div>
            </div>

            {/* Sub-tabs — scrollable on mobile */}
            <div style={{overflowX:'auto',marginBottom:'16px'}}>
              <div style={{display:'flex',gap:'4px',padding:'4px',background:'#E8EDF6',borderRadius:'12px',width:'fit-content',minWidth:'100%'}}>
                {([
                  {key:'basic' as EditTab,     icon:'📋', label:'Basic Info'},
                  {key:'fees' as EditTab,      icon:'💰', label:'Fees & EMI'},
                  {key:'content' as EditTab,   icon:'📝', label:'Content'},
                  {key:'approvals' as EditTab, icon:'✅', label:'Approvals'},
                  {key:'theme' as EditTab,     icon:'🎨', label:'Theme'},
                ]).map(t => (
                  <button key={t.key} onClick={()=>setEditTab(t.key)}
                    style={{
                      display:'flex',alignItems:'center',gap:'5px',
                      padding:'8px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:'600',
                      border:'none',cursor:'pointer',whiteSpace:'nowrap',transition:'all 0.15s',
                      background: editTab===t.key ? '#fff' : 'transparent',
                      color:      editTab===t.key ? '#1A2F4E' : '#6B84A0',
                      boxShadow:  editTab===t.key ? '0 1px 4px rgba(26,47,78,0.08)' : 'none',
                    }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:'16px',padding:'20px'}}>

              {/* BASIC */}
              {editTab==='basic' && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'16px'}}>
                  {[
                    ['University ID (slug)', 'id', 'text'],
                    ['Full Name', 'name', 'text'],
                    ['Abbreviation', 'abbr', 'text'],
                    ['City', 'city', 'text'],
                    ['State', 'state', 'text'],
                    ['NIRF Overall Rank', 'nirf', 'number'],
                    ['NIRF Management Rank', 'nirfm', 'number'],
                    ['NAAC Score (e.g. 3.59)', 'naacScore', 'text'],
                    ['Eligibility %', 'eligibilityPct', 'number'],
                  ].map(([label, key, type]) => (
                    <div key={key}>
                      <label style={{display:'block',fontSize:'11px',fontWeight:'700',color:'#3B526B',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</label>
                      <input type={type} value={String((editUni as any)?.[key]??'')}
                        onChange={e=>setEditUni(p=>({...p,[key]:type==='number'?Number(e.target.value):e.target.value}))}
                        style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'13px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',boxSizing:'border-box'}}
                      />
                    </div>
                  ))}
                  {/* Dropdowns */}
                  {[
                    {label:'Region', key:'region', opts:REGIONS},
                    {label:'Exam Mode', key:'examMode', opts:EXAM_MODES},
                    {label:'NAAC Grade', key:'naac', opts:NAAC_GRADES},
                  ].map(({label,key,opts}) => (
                    <div key={key}>
                      <label style={{display:'block',fontSize:'11px',fontWeight:'700',color:'#3B526B',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</label>
                      <select value={(editUni as any)?.[key]||''}
                        onChange={e=>setEditUni(p=>({...p,[key]:e.target.value}))}
                        style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'13px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',boxSizing:'border-box'}}>
                        {opts.map(o=><option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  {/* Checkboxes */}
                  <div style={{gridColumn:'1/-1',display:'flex',flexWrap:'wrap',gap:'16px',paddingTop:'8px'}}>
                    {[
                      {label:'UGC DEB Approved', key:'ugc'},
                      {label:'Govt Job Valid', key:'govtRecognised'},
                      {label:'PSU Eligible', key:'psuEligible'},
                    ].map(f => (
                      <label key={f.key} style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',fontSize:'13px',color:'#3B526B',fontWeight:'500'}}>
                        <input type="checkbox" checked={(editUni as any)?.[f.key]||false}
                          onChange={e=>setEditUni(p=>({...p,[f.key]:e.target.checked}))}
                          style={{width:'16px',height:'16px',accentColor:'#F59E0B',cursor:'pointer'}}/>
                        {f.label}
                      </label>
                    ))}
                  </div>
                  {/* Programs */}
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={{display:'block',fontSize:'11px',fontWeight:'700',color:'#3B526B',marginBottom:'10px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Programs Offered</label>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                      {ALL_PROGRAMS.map(prog => {
                        const active = ((editUni as any)?.programs||[]).includes(prog)
                        return (
                          <button key={prog} type="button" onClick={()=>toggleProgram(prog)}
                            style={{padding:'7px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:'600',cursor:'pointer',transition:'all 0.15s',
                              background:active?'#1A2F4E':'#F1F4F9',color:active?'#F59E0B':'#3B526B',
                              border:active?'1.5px solid #1A2F4E':'1.5px solid #E2E8F4'}}>
                            {prog}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* FEES */}
              {editTab==='fees' && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'16px'}}>
                  {[
                    ['Minimum Fee (₹)', 'feeMin'],
                    ['Maximum Fee (₹)', 'feeMax'],
                    ['EMI Starting (₹/mo)', 'emiFrom'],
                  ].map(([label,key]) => (
                    <div key={key}>
                      <label style={{display:'block',fontSize:'11px',fontWeight:'700',color:'#3B526B',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</label>
                      <input type="number" value={(editUni as any)?.[key]||0}
                        onChange={e=>setEditUni(p=>({...p,[key]:Number(e.target.value)}))}
                        style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'13px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',boxSizing:'border-box'}}/>
                    </div>
                  ))}
                  <div style={{gridColumn:'1/-1',padding:'14px',borderRadius:'12px',background:'#FFFBEB',border:'1px solid rgba(245,158,11,0.25)'}}>
                    <div style={{fontSize:'12px',fontWeight:'700',color:'#D97706',marginBottom:'4px'}}>💡 Preview</div>
                    <div style={{fontSize:'13px',color:'#3B526B'}}>
                      Fees: <strong>₹{Math.round(((editUni as any)?.feeMin||0)/1000)}K – ₹{Math.round(((editUni as any)?.feeMax||0)/1000)}K</strong>
                      {' · '}EMI from <strong>₹{((editUni as any)?.emiFrom||0).toLocaleString()}/mo</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENT */}
              {editTab==='content' && (
                <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                  {[
                    ['Highlight (1-line card text)', 'highlight', false],
                    ['Tagline', 'tagline', false],
                    ['Full Description / Introduction', 'description', true],
                  ].map(([label,key,isTA]) => (
                    <div key={key as string}>
                      <label style={{display:'block',fontSize:'11px',fontWeight:'700',color:'#3B526B',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.05em'}}>{label as string}</label>
                      {isTA ? (
                        <textarea rows={4} value={(editUni as any)?.[key as string]||''}
                          onChange={e=>setEditUni(p=>({...p,[key as string]:e.target.value}))}
                          style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'13px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',resize:'vertical',boxSizing:'border-box'}}/>
                      ) : (
                        <input type="text" value={(editUni as any)?.[key as string]||''}
                          onChange={e=>setEditUni(p=>({...p,[key as string]:e.target.value}))}
                          style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'13px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',boxSizing:'border-box'}}/>
                      )}
                    </div>
                  ))}
                  <div>
                    <label style={{display:'block',fontSize:'11px',fontWeight:'700',color:'#3B526B',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Who Is This For (3 points)</label>
                    {[0,1,2].map(i=>(
                      <input key={i} type="text" placeholder={`Point ${i+1}...`}
                        value={((editUni as any)?.forWho||[])[i]||''}
                        onChange={e=>{const a=[...(((editUni as any)?.forWho)||['','',''])];a[i]=e.target.value;setEditUni(p=>({...p,forWho:a}))}}
                        style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'13px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',marginBottom:'8px',boxSizing:'border-box'}}/>
                    ))}
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:'11px',fontWeight:'700',color:'#3B526B',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Who This Is NOT For (2 points)</label>
                    {[0,1].map(i=>(
                      <input key={i} type="text" placeholder={`Point ${i+1}...`}
                        value={((editUni as any)?.notFor||[])[i]||''}
                        onChange={e=>{const a=[...(((editUni as any)?.notFor)||['',''])];a[i]=e.target.value;setEditUni(p=>({...p,notFor:a}))}}
                        style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'13px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',marginBottom:'8px',boxSizing:'border-box'}}/>
                    ))}
                  </div>
                </div>
              )}

              {/* APPROVALS */}
              {editTab==='approvals' && (
                <div>
                  <p style={{fontSize:'13px',color:'#6B84A0',marginBottom:'16px'}}>Toggle approvals shown on this university page.</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'20px'}}>
                    {APPROVAL_OPTIONS.map(badge => {
                      const active = ((editUni as any)?.approvals||[]).includes(badge)
                      return (
                        <button key={badge} type="button" onClick={()=>toggleApproval(badge)}
                          style={{padding:'7px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:'600',cursor:'pointer',transition:'all 0.15s',
                            background:active?'#1A2F4E':'#F1F4F9',color:active?'#F59E0B':'#3B526B',
                            border:active?'1.5px solid #1A2F4E':'1.5px solid #E2E8F4'}}>
                          {active?'✓ ':''}{badge}
                        </button>
                      )
                    })}
                  </div>
                  <div style={{padding:'14px',borderRadius:'12px',background:'#F8F9FC',border:'1px solid #E2E8F4'}}>
                    <div style={{fontSize:'11px',fontWeight:'700',color:'#3B526B',marginBottom:'8px'}}>Add Custom Approval</div>
                    <div style={{display:'flex',gap:'8px'}}>
                      <input type="text" placeholder="e.g. ISO 9001:2015" id="customApproval"
                        style={{flex:1,padding:'10px 12px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'13px',outline:'none',background:'#fff',color:'#1A2F4E'}}/>
                      <button type="button" onClick={()=>{const v=(document.getElementById('customApproval') as HTMLInputElement)?.value?.trim();if(v)toggleApproval(v)}}
                        style={{padding:'10px 16px',borderRadius:'8px',background:'#F59E0B',color:'#1A2F4E',fontWeight:'700',fontSize:'13px',border:'none',cursor:'pointer'}}>Add</button>
                    </div>
                  </div>
                </div>
              )}

              {/* THEME */}
              {editTab==='theme' && (
                <div>
                  <div style={{marginBottom:'24px'}}>
                    <label style={{display:'block',fontSize:'11px',fontWeight:'700',color:'#3B526B',marginBottom:'12px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Accent Colour</label>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'10px',marginBottom:'12px'}}>
                      {COLOR_PRESETS.map(c=>(
                        <button key={c} type="button" onClick={()=>setEditUni(p=>({...p,color:c}))}
                          style={{width:'40px',height:'40px',borderRadius:'10px',background:c,border:`2px solid ${(editUni as any)?.color===c?'#1A2F4E':'transparent'}`,cursor:'pointer',transition:'all 0.15s',outline:`${(editUni as any)?.color===c?'3px solid #F59E0B':'none'}`,outlineOffset:'2px'}}/>
                      ))}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <input type="color" value={(editUni as any)?.color||'#F59E0B'}
                        onChange={e=>setEditUni(p=>({...p,color:e.target.value}))}
                        style={{width:'44px',height:'40px',borderRadius:'8px',border:'none',cursor:'pointer',padding:'2px'}}/>
                      <input type="text" value={(editUni as any)?.color||'#F59E0B'}
                        onChange={e=>setEditUni(p=>({...p,color:e.target.value}))}
                        style={{width:'120px',padding:'10px 12px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'13px',outline:'none',background:'#F8F9FC',color:'#1A2F4E'}}/>
                      <div style={{flex:1,height:'8px',borderRadius:'4px',background:(editUni as any)?.color||'#F59E0B'}}/>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════ BLOG TAB ════════ */}
        {tab==='blog' && (
          <div>
            {/* Blog: Post List */}
            {blogTab==='list' && (
              <div>
                <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:'12px',marginBottom:'20px'}}>
                  <div>
                    <h2 style={{fontSize:'20px',fontWeight:'700',color:'#1A2F4E',marginBottom:'4px'}}>Blog Posts</h2>
                    <p style={{fontSize:'13px',color:'#6B84A0'}}>Write and manage articles manually — no API needed</p>
                  </div>
                  <button onClick={newPost}
                    style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 18px',borderRadius:'10px',background:'#F59E0B',color:'#1A2F4E',fontWeight:'700',fontSize:'13px',border:'none',cursor:'pointer'}}>
                    <Plus style={{width:'14px',height:'14px'}}/> Write New Post
                  </button>
                </div>

                {/* SEO keyword suggestions */}
                <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:'14px',padding:'16px',marginBottom:'20px'}}>
                  <div style={{fontSize:'11px',fontWeight:'700',color:'#D97706',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'10px'}}>💡 High-Traffic Keywords to Target</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                    {SEO_KEYWORDS.map(kw=>(
                      <button key={kw} onClick={()=>{
                        const p=emptyPost();p.targetKeyword=kw;p.title=kw.replace(/\b\w/g,c=>c.toUpperCase())+' — Complete Guide 2025';
                        setEditPost(p);setIsNewPost(true);setBlogTab('editor')
                      }}
                        style={{padding:'6px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:'600',cursor:'pointer',background:'#FFFBEB',color:'#D97706',border:'1px solid rgba(245,158,11,0.3)'}}>
                        + {kw}
                      </button>
                    ))}
                  </div>
                </div>

                {posts.length === 0 ? (
                  <div style={{textAlign:'center',padding:'60px 20px',background:'#fff',borderRadius:'16px',border:'1px solid #E2E8F4'}}>
                    <div style={{fontSize:'48px',marginBottom:'12px'}}>✍️</div>
                    <div style={{fontWeight:'600',color:'#1A2F4E',marginBottom:'8px'}}>No blog posts yet</div>
                    <button onClick={newPost} style={{padding:'10px 20px',borderRadius:'10px',background:'#F59E0B',color:'#1A2F4E',fontWeight:'700',fontSize:'13px',border:'none',cursor:'pointer'}}>Write your first post</button>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                    {posts.map(p=>(
                      <div key={p.slug} style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:'14px',overflow:'hidden'}}>
                        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'16px',gap:'12px',flexWrap:'wrap'}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap',marginBottom:'6px'}}>
                              <span style={{fontSize:'10px',fontWeight:'700',padding:'3px 8px',borderRadius:'6px',background:p.status==='published'?'#DCFCE7':'#FFFBEB',color:p.status==='published'?'#15803D':'#D97706'}}>
                                {p.status==='published'?'● Published':'○ Draft'}
                              </span>
                              <span style={{fontSize:'10px',color:'#6B84A0',background:'#F8F9FC',padding:'3px 8px',borderRadius:'6px'}}>{p.category}</span>
                              <span style={{fontSize:'10px',color:'#6B84A0'}}>{p.readTime} min read</span>
                            </div>
                            <div style={{fontWeight:'600',fontSize:'14px',color:'#1A2F4E',marginBottom:'4px',lineHeight:'1.4'}}>{p.title}</div>
                            {p.targetKeyword && <div style={{fontSize:'12px',color:'#6B84A0'}}>🎯 Keyword: <em>{p.targetKeyword}</em></div>}
                          </div>
                          <div style={{display:'flex',gap:'6px',flexShrink:0}}>
                            <button onClick={()=>startEditPost(p)}
                              style={{display:'flex',alignItems:'center',gap:'5px',padding:'8px 12px',borderRadius:'8px',background:'#F1F4F9',border:'none',cursor:'pointer',color:'#3B526B',fontSize:'12px',fontWeight:'600'}}>
                              <Edit2 style={{width:'13px',height:'13px'}}/> Edit
                            </button>
                            <button onClick={()=>deletePost(p.slug)}
                              style={{display:'flex',alignItems:'center',gap:'5px',padding:'8px 12px',borderRadius:'8px',background:'#FEE2E2',border:'none',cursor:'pointer',color:'#DC2626',fontSize:'12px',fontWeight:'600'}}>
                              <Trash2 style={{width:'13px',height:'13px'}}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Blog: EDITOR */}
            {blogTab==='editor' && editPost && (
              <div>
                {/* Editor top bar */}
                <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:'10px',marginBottom:'16px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                    <button onClick={()=>{setEditPost(null);setBlogTab('list')}}
                      style={{display:'flex',alignItems:'center',gap:'5px',padding:'8px 12px',borderRadius:'8px',background:'#fff',border:'1.5px solid #E2E8F4',color:'#3B526B',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>
                      ← Back
                    </button>
                    <span style={{fontSize:'12px',color:'#6B84A0'}}>
                      {wordCount} words · ~{Math.ceil(wordCount/200)} min read
                    </span>
                  </div>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                    <button onClick={()=>setPreview(!preview)}
                      style={{display:'flex',alignItems:'center',gap:'5px',padding:'8px 14px',borderRadius:'8px',background:preview?'#1A2F4E':'#fff',border:'1.5px solid #E2E8F4',color:preview?'#F59E0B':'#3B526B',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>
                      <Eye style={{width:'13px',height:'13px'}}/> {preview?'Edit':'Preview'}
                    </button>
                    <button onClick={()=>setEditPost(p=>p?({...p,status:'draft'}):p)}
                      style={{padding:'8px 14px',borderRadius:'8px',background:'#FFFBEB',border:'1px solid rgba(245,158,11,0.3)',color:'#D97706',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>
                      Save Draft
                    </button>
                    <button onClick={()=>{setEditPost(p=>p?({...p,status:'published'}):p);savePost()}}
                      style={{display:'flex',alignItems:'center',gap:'5px',padding:'8px 16px',borderRadius:'8px',background:'#F59E0B',color:'#1A2F4E',fontWeight:'700',fontSize:'13px',border:'none',cursor:'pointer'}}>
                      <Star style={{width:'13px',height:'13px'}}/> Publish
                    </button>
                  </div>
                </div>

                {!preview ? (
                  <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 260px',gap:'16px',alignItems:'start'}}>

                    {/* LEFT: Main editor */}
                    <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>

                      {/* Title */}
                      <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:'14px',padding:'16px'}}>
                        <label style={{display:'block',fontSize:'10px',fontWeight:'700',color:'#3B526B',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'6px'}}>Post Title *</label>
                        <input type="text" placeholder="e.g. NMIMS vs Manipal Online MBA 2025: Honest Comparison"
                          value={editPost.title}
                          onChange={e=>setEditPost(p=>p?({...p,title:e.target.value}):p)}
                          style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'15px',fontWeight:'600',outline:'none',background:'#F8F9FC',color:'#1A2F4E',boxSizing:'border-box'}}
                        />
                      </div>

                      {/* Content editor */}
                      <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:'14px',overflow:'hidden'}}>
                        <div style={{padding:'10px 14px',background:'#F8F9FC',borderBottom:'1px solid #E2E8F4'}}>
                          <div style={{fontSize:'10px',fontWeight:'700',color:'#3B526B',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>Content (HTML) *</div>
                          {/* Toolbar */}
                          <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
                            {[
                              {label:'H2',     title:'Heading 2',      action:()=>insertHTML('blogContent','<h2>','</h2>')},
                              {label:'H3',     title:'Heading 3',      action:()=>insertHTML('blogContent','<h3>','</h3>')},
                              {label:'B',      title:'Bold',           action:()=>insertHTML('blogContent','<strong>','</strong>')},
                              {label:'I',      title:'Italic',         action:()=>insertHTML('blogContent','<em>','</em>')},
                              {label:'UL',     title:'Bullet list',    action:()=>insertHTML('blogContent','<ul>\n  <li>','</li>\n  <li>item 2</li>\n</ul>')},
                              {label:'OL',     title:'Numbered list',  action:()=>insertHTML('blogContent','<ol>\n  <li>','</li>\n  <li>item 2</li>\n</ol>')},
                              {label:'P',      title:'Paragraph',      action:()=>insertHTML('blogContent','<p>','</p>')},
                              {label:'Table',  title:'Table',          action:()=>insertHTML('blogContent','<table>\n<thead><tr><th>Col 1</th><th>Col 2</th><th>Col 3</th></tr></thead>\n<tbody>\n  <tr><td>','</td><td>data</td><td>data</td></tr>\n</tbody>\n</table>')},
                              {label:'Link',   title:'Hyperlink',      action:()=>insertHTML('blogContent','<a href="https://edifyedu.in/universities" target="_blank">','</a>')},
                              {label:'Quote',  title:'Blockquote',     action:()=>insertHTML('blogContent','<blockquote>','</blockquote>')},
                              {label:'HR',     title:'Divider',        action:()=>insertHTML('blogContent','<hr>\n','')},
                            ].map(btn=>(
                              <button key={btn.label} type="button" onClick={btn.action} title={btn.title}
                                style={{padding:'5px 10px',borderRadius:'6px',fontSize:'11px',fontWeight:'700',cursor:'pointer',background:'#fff',border:'1px solid #E2E8F4',color:'#3B526B',minWidth:'36px',transition:'all 0.1s'}}
                                className="toolbar-btn">
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          id="blogContent"
                          value={editPost.content}
                          onChange={e=>setEditPost(p=>p?({...p,content:e.target.value}):p)}
                          placeholder={`<h2>Introduction</h2>\n<p>Write your content here using HTML tags...</p>\n\n<h2>Section 2</h2>\n<p>Use the toolbar above to insert formatting.</p>`}
                          style={{width:'100%',minHeight:'500px',padding:'16px',fontSize:'13px',fontFamily:'"Plus Jakarta Sans",monospace',border:'none',outline:'none',resize:'vertical',color:'#1A2F4E',lineHeight:'1.8',boxSizing:'border-box',background:'#fff'}}
                        />
                      </div>

                      {/* FAQs */}
                      <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:'14px',padding:'16px'}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
                          <div>
                            <div style={{fontSize:'13px',fontWeight:'700',color:'#1A2F4E'}}>FAQs</div>
                            <div style={{fontSize:'11px',color:'#6B84A0'}}>Shown at end of post — helps with SEO</div>
                          </div>
                          <button type="button" onClick={addFaq}
                            style={{display:'flex',alignItems:'center',gap:'5px',padding:'7px 12px',borderRadius:'8px',background:'#F1F4F9',border:'none',cursor:'pointer',color:'#3B526B',fontSize:'12px',fontWeight:'600'}}>
                            <Plus style={{width:'12px',height:'12px'}}/> Add FAQ
                          </button>
                        </div>
                        {editPost.faqs.map((faq,i)=>(
                          <div key={i} style={{marginBottom:'14px',padding:'12px',background:'#F8F9FC',borderRadius:'10px',border:'1px solid #E2E8F4'}}>
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                              <span style={{fontSize:'11px',fontWeight:'700',color:'#D97706'}}>FAQ {i+1}</span>
                              <button type="button" onClick={()=>removeFaq(i)} style={{background:'none',border:'none',cursor:'pointer',color:'#DC2626',padding:'0'}}>
                                <X style={{width:'13px',height:'13px'}}/>
                              </button>
                            </div>
                            <input type="text" placeholder="Question" value={faq.q}
                              onChange={e=>{const f=[...editPost.faqs];f[i]={...f[i],q:e.target.value};setEditPost(p=>p?({...p,faqs:f}):p)}}
                              style={{width:'100%',padding:'8px 10px',borderRadius:'6px',border:'1px solid #E2E8F4',fontSize:'12px',outline:'none',background:'#fff',color:'#1A2F4E',marginBottom:'6px',boxSizing:'border-box'}}/>
                            <textarea rows={2} placeholder="Answer" value={faq.a}
                              onChange={e=>{const f=[...editPost.faqs];f[i]={...f[i],a:e.target.value};setEditPost(p=>p?({...p,faqs:f}):p)}}
                              style={{width:'100%',padding:'8px 10px',borderRadius:'6px',border:'1px solid #E2E8F4',fontSize:'12px',outline:'none',background:'#fff',color:'#1A2F4E',resize:'vertical',boxSizing:'border-box'}}/>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT: Meta sidebar */}
                    <div style={{display:'flex',flexDirection:'column',gap:'14px',position:'sticky',top:'80px'}}>

                      <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:'14px',padding:'16px'}}>
                        <div style={{fontSize:'12px',fontWeight:'700',color:'#1A2F4E',marginBottom:'14px'}}>Post Settings</div>

                        <div style={{marginBottom:'12px'}}>
                          <label style={{display:'block',fontSize:'10px',fontWeight:'700',color:'#3B526B',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'5px'}}>Category</label>
                          <select value={editPost.category} onChange={e=>setEditPost(p=>p?({...p,category:e.target.value}):p)}
                            style={{width:'100%',padding:'8px 10px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'12px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',boxSizing:'border-box'}}>
                            {BLOG_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                          </select>
                        </div>

                        <div style={{marginBottom:'12px'}}>
                          <label style={{display:'block',fontSize:'10px',fontWeight:'700',color:'#3B526B',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'5px'}}>Target Keyword</label>
                          <input type="text" placeholder="e.g. online MBA India 2025"
                            value={editPost.targetKeyword}
                            onChange={e=>setEditPost(p=>p?({...p,targetKeyword:e.target.value}):p)}
                            style={{width:'100%',padding:'8px 10px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'12px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',boxSizing:'border-box'}}/>
                        </div>

                        <div style={{marginBottom:'12px'}}>
                          <label style={{display:'block',fontSize:'10px',fontWeight:'700',color:'#3B526B',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'5px'}}>URL Slug</label>
                          <input type="text" placeholder="auto-generated from title"
                            value={editPost.slug}
                            onChange={e=>setEditPost(p=>p?({...p,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')}):p)}
                            style={{width:'100%',padding:'8px 10px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'12px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',fontFamily:'monospace',boxSizing:'border-box'}}/>
                        </div>

                        <div style={{marginBottom:'12px'}}>
                          <label style={{display:'block',fontSize:'10px',fontWeight:'700',color:'#3B526B',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'5px'}}>Read Time (mins)</label>
                          <input type="number" value={editPost.readTime||Math.ceil(wordCount/200)}
                            onChange={e=>setEditPost(p=>p?({...p,readTime:Number(e.target.value)}):p)}
                            style={{width:'100%',padding:'8px 10px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'12px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',boxSizing:'border-box'}}/>
                        </div>

                        <div style={{marginBottom:'12px'}}>
                          <label style={{display:'block',fontSize:'10px',fontWeight:'700',color:'#3B526B',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'5px'}}>Publish Date</label>
                          <input type="date" value={editPost.publishedAt}
                            onChange={e=>setEditPost(p=>p?({...p,publishedAt:e.target.value}):p)}
                            style={{width:'100%',padding:'8px 10px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'12px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',boxSizing:'border-box'}}/>
                        </div>

                        <div>
                          <label style={{display:'block',fontSize:'10px',fontWeight:'700',color:'#3B526B',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'5px'}}>Status</label>
                          <div style={{display:'flex',gap:'8px'}}>
                            {(['draft','published'] as const).map(s=>(
                              <button key={s} type="button" onClick={()=>setEditPost(p=>p?({...p,status:s}):p)}
                                style={{flex:1,padding:'8px',borderRadius:'8px',fontSize:'11px',fontWeight:'700',cursor:'pointer',border:'1.5px solid',
                                  background:editPost.status===s?(s==='published'?'#DCFCE7':'#FFFBEB'):'#F8F9FC',
                                  color:editPost.status===s?(s==='published'?'#15803D':'#D97706'):'#6B84A0',
                                  borderColor:editPost.status===s?(s==='published'?'rgba(21,128,61,0.3)':'rgba(245,158,11,0.3)'):'#E2E8F4'}}>
                                {s==='published'?'✓ Published':'○ Draft'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Meta Description */}
                      <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:'14px',padding:'16px'}}>
                        <label style={{display:'block',fontSize:'10px',fontWeight:'700',color:'#3B526B',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'5px'}}>
                          Meta Description ({editPost.metaDescription.length}/155)
                        </label>
                        <textarea rows={3} placeholder="Shown in Google results — max 155 characters"
                          value={editPost.metaDescription}
                          onChange={e=>setEditPost(p=>p?({...p,metaDescription:e.target.value.slice(0,155)}):p)}
                          style={{width:'100%',padding:'8px 10px',borderRadius:'8px',border:`1.5px solid ${editPost.metaDescription.length>155?'#DC2626':'#E2E8F4'}`,fontSize:'12px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',resize:'vertical',boxSizing:'border-box'}}/>
                        {/* SERP Preview */}
                        <div style={{marginTop:'10px',padding:'10px',background:'#F8F9FC',borderRadius:'8px',border:'1px solid #E8EDF6'}}>
                          <div style={{fontSize:'10px',fontWeight:'700',color:'#6B84A0',marginBottom:'6px',textTransform:'uppercase'}}>Google Preview</div>
                          <div style={{fontSize:'13px',color:'#1a0dab',fontWeight:'600',lineHeight:'1.3',marginBottom:'2px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                            {editPost.title||'Post Title Here'} | Edify
                          </div>
                          <div style={{fontSize:'11px',color:'#006621',marginBottom:'3px'}}>edifyedu.in/blog/{editPost.slug||'post-slug'}</div>
                          <div style={{fontSize:'11px',color:'#545454',lineHeight:'1.5'}}>
                            {editPost.metaDescription||'Meta description will appear here in Google search results...'}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:'14px',padding:'16px'}}>
                        <label style={{display:'block',fontSize:'10px',fontWeight:'700',color:'#3B526B',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'5px'}}>Tags (comma separated)</label>
                        <input type="text" placeholder="MBA, UGC DEB, online degree"
                          value={editPost.tags.join(', ')}
                          onChange={e=>setEditPost(p=>p?({...p,tags:e.target.value.split(',').map(t=>t.trim()).filter(Boolean)}):p)}
                          style={{width:'100%',padding:'8px 10px',borderRadius:'8px',border:'1.5px solid #E2E8F4',fontSize:'12px',outline:'none',background:'#F8F9FC',color:'#1A2F4E',boxSizing:'border-box'}}/>
                      </div>

                      <button onClick={savePost}
                        style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#1A2F4E',color:'#fff',fontWeight:'700',fontSize:'14px',border:'none',cursor:'pointer'}}>
                        💾 Save Post
                      </button>
                    </div>
                  </div>
                ) : (
                  /* PREVIEW MODE */
                  <div style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:'16px',padding:'32px',maxWidth:'760px'}}>
                    <div style={{marginBottom:'8px'}}>
                      <span style={{fontSize:'11px',fontWeight:'700',padding:'3px 10px',borderRadius:'6px',background:'#FFFBEB',color:'#D97706'}}>{editPost.category}</span>
                    </div>
                    <h1 style={{fontSize:'26px',fontWeight:'700',color:'#1A2F4E',marginBottom:'8px',fontFamily:'"Instrument Serif",serif',lineHeight:'1.3'}}>{editPost.title}</h1>
                    <p style={{fontSize:'13px',color:'#6B84A0',marginBottom:'24px'}}>{editPost.publishedAt} · {wordCount} words · {editPost.readTime} min read</p>
                    <div
                      style={{color:'#3B526B',lineHeight:'1.8',fontSize:'15px'}}
                      dangerouslySetInnerHTML={{__html: editPost.content || '<p style="color:#6B84A0">No content yet — switch to Edit mode to write your post.</p>'}}
                    />
                    {editPost.faqs.length > 0 && editPost.faqs[0].q && (
                      <div style={{marginTop:'32px',padding:'20px',background:'#F8F9FC',borderRadius:'12px',border:'1px solid #E2E8F4'}}>
                        <h2 style={{fontSize:'18px',fontWeight:'700',color:'#1A2F4E',marginBottom:'16px',fontFamily:'"Instrument Serif",serif'}}>FAQs</h2>
                        {editPost.faqs.filter(f=>f.q).map((faq,i)=>(
                          <div key={i} style={{marginBottom:'14px'}}>
                            <div style={{fontWeight:'600',color:'#1A2F4E',fontSize:'14px',marginBottom:'4px'}}>Q: {faq.q}</div>
                            <div style={{color:'#3B526B',fontSize:'13px',lineHeight:'1.6'}}>A: {faq.a}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════ SEO CHECKLIST ════════ */}
        {tab==='seo' && (
          <div style={{maxWidth:'760px'}}>
            <h2 style={{fontSize:'20px',fontWeight:'700',color:'#1A2F4E',marginBottom:'4px'}}>SEO & GEO Checklist</h2>
            <p style={{fontSize:'13px',color:'#6B84A0',marginBottom:'24px'}}>Full audit of what is done and what still needs action</p>

            {[
              {
                section:'Technical SEO',
                items:[
                  {done:true,  item:'sitemap.xml — auto-generated with all 106 university + program URLs'},
                  {done:true,  item:'robots.txt — /admin and /api blocked from indexing'},
                  {done:true,  item:'Viewport meta tag + mobile-first CSS'},
                  {done:true,  item:'HTML lang="en", canonical URLs configured'},
                  {done:true,  item:'Organization + WebSite + SearchAction JSON-LD in layout.tsx'},
                  {done:false, item:'og.png (1200×630) — create and put in /public folder'},
                  {done:false, item:'Google Search Console — verify site at search.google.com/search-console'},
                  {done:false, item:'Submit sitemap: https://edifyedu.in/sitemap.xml'},
                  {done:false, item:'Google Analytics or Vercel Analytics — install for traffic data'},
                ]
              },
              {
                section:'Mobile Optimisation (Your Priority)',
                items:[
                  {done:true,  item:'font-size: 16px on all inputs (prevents iOS zoom on focus)'},
                  {done:true,  item:'Sticky navbar + mobile menu with search'},
                  {done:true,  item:'FloatingCTA button with 44px+ tap target'},
                  {done:true,  item:'University cards responsive grid (auto-fill minmax)'},
                  {done:false, item:'University detail page — sidebar needs mobile stacking fix'},
                  {done:false, item:'Admin panel — blog editor sidebar needs mobile collapse'},
                  {done:false, item:'Test on real device: BrowserStack free tier or Android Chrome DevTools'},
                  {done:false, item:'Run Lighthouse Mobile audit after deployment (target 80+ score)'},
                ]
              },
              {
                section:'Content SEO',
                items:[
                  {done:true,  item:'Unique H1 on every page'},
                  {done:true,  item:'Title template: "%s | Edify — edifyedu.in"'},
                  {done:true,  item:'Meta descriptions on all pages'},
                  {done:true,  item:'106 university pages with structured data'},
                  {done:false, item:'Write 5 blog posts using the Blog Editor above (no API needed)'},
                  {done:false, item:'Create /about page with editorial policy (builds E-E-A-T for Google)'},
                  {done:false, item:'Add "Last updated" timestamps to university pages'},
                  {done:false, item:'Link blog posts → relevant university pages (internal linking)'},
                ]
              },
              {
                section:'GEO (Generative Engine Optimisation for AI search)',
                items:[
                  {done:true,  item:'Structured comparison data (NIRF, NAAC, fees) — AI can cite this'},
                  {done:true,  item:'Honest, factual tone — preferred by AI summarisers'},
                  {done:false, item:'FAQPage JSON-LD on homepage and university pages'},
                  {done:false, item:'Author/expert attribution on blog posts'},
                  {done:false, item:'Add source citations linking to ugc.ac.in, nirfindia.org, naac.gov.in'},
                ]
              },
            ].map(sec=>(
              <div key={sec.section} style={{background:'#fff',border:'1px solid #E2E8F4',borderRadius:'14px',overflow:'hidden',marginBottom:'14px'}}>
                <div style={{padding:'12px 16px',background:'#F8F9FC',borderBottom:'1px solid #E2E8F4',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontWeight:'700',fontSize:'13px',color:'#1A2F4E'}}>{sec.section}</span>
                  <span style={{fontSize:'11px',color:'#6B84A0'}}>
                    {sec.items.filter(i=>i.done).length}/{sec.items.length} done
                    {' · '}<span style={{color:sec.items.every(i=>i.done)?'#15803D':'#F59E0B',fontWeight:'600'}}>
                      {Math.round(sec.items.filter(i=>i.done).length/sec.items.length*100)}%
                    </span>
                  </span>
                </div>
                {sec.items.map(item=>(
                  <div key={item.item} style={{display:'flex',alignItems:'flex-start',gap:'10px',padding:'12px 16px',borderBottom:'1px solid #F8F9FC'}}>
                    <div style={{width:'20px',height:'20px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'1px',
                      background:item.done?'#DCFCE7':'#FEE2E2',color:item.done?'#15803D':'#DC2626'}}>
                      {item.done ? <CheckCircle style={{width:'13px',height:'13px'}}/> : <X style={{width:'13px',height:'13px'}}/>}
                    </div>
                    <span style={{fontSize:'13px',color:item.done?'#6B84A0':'#1A2F4E',lineHeight:'1.5'}}>{item.item}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Export note */}
            <div style={{padding:'16px',borderRadius:'12px',background:'#FFFBEB',border:'1px solid rgba(245,158,11,0.25)'}}>
              <div style={{fontWeight:'700',fontSize:'13px',color:'#D97706',marginBottom:'8px'}}>⚙️ Making Changes Permanent</div>
              <div style={{fontSize:'13px',color:'#3B526B',lineHeight:'1.6'}}>
                All admin edits are session-only (reset on page refresh).<br/>
                To save permanently: <strong>1)</strong> Click "Export JSON" in top bar → <strong>2)</strong> Update <code style={{background:'rgba(245,158,11,0.15)',padding:'1px 5px',borderRadius:'4px'}}>/lib/data.ts</code> and <code style={{background:'rgba(245,158,11,0.15)',padding:'1px 5px',borderRadius:'4px'}}>/lib/blog.ts</code> → <strong>3)</strong> Redeploy to Vercel
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
