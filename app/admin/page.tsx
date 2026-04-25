// @ts-nocheck
'use client'
// Auth: Protected by middleware.ts — no client-side password check needed

import React, { useState, useEffect } from 'react'
import { UNIVERSITIES } from '@/lib/data'
import { BLOG_POSTS } from '@/lib/blog'
import type { University, Program } from '@/lib/data'
import type { BlogPost } from '@/lib/blog'
import {
  Plus, Edit2, Save, X, Lock, Eye, EyeOff, Copy, CheckCircle,
  Palette, Info, DollarSign, BookOpen, Settings, FileText,
  BarChart2, Trash2, PenSquare, Bold, Italic, List, Link2,
  Heading2, Quote, Table, Code, Hash, Star, TrendingUp, Users,
  Globe, Search, AlertCircle, ArrowRight, ExternalLink,
  Phone, Mail, Download, RefreshCw, MessageCircle, Loader2
} from 'lucide-react'

/* ── CONSTANTS ─────────────────────────────────────────────── */
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
  '#F59E0B','var(--navy-light)','#0891B2','var(--purple)','var(--red)','#059669',
  '#9333EA','#D97706','#4F46E5','#0369A1','#C2410C','#0F766E',
]
const BLOG_CATEGORIES = [
  'MBA Guides','MCA Guides','BBA Guides','BCA Guides','Validity & Recognition',
  'Career Guides','University Reviews','Fees & Finance','City Guides','Comparison'
]

type AdminTab = 'dashboard' | 'universities' | 'blog' | 'seo' | 'leads' | 'settings'
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
    programs:[],programDetails:{} as Record<string, never>,
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

function insertHTML(id: string, before: string, after = '') {
  const el = document.getElementById(id) as HTMLTextAreaElement
  if (!el) return
  const start = el.selectionStart, end = el.selectionEnd
  const selected = el.value.slice(start, end)
  el.setRangeText(before + (selected || 'text') + after, start, end, 'select')
  el.focus()
}

/* ── INPUT / LABEL COMPONENTS ──────────────────────────────── */
const F = {
  label: (text: string, required = false) => (
    <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--ink-3)',textTransform:'uppercase' as const,letterSpacing:'0.06em',marginBottom:5}}>
      {text}{required && <span style={{color:'var(--red)',marginLeft:2}}>*</span>}
    </label>
  ),
  input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} style={{width:'100%',padding:'9px 11px',borderRadius:'var(--r-xs)',border:'1px solid var(--border)',fontSize:13,color:'var(--ink)',outline:'none',fontFamily:'inherit',boxSizing:'border-box' as const,...(props.style||{})}} />
  ),
  textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} style={{width:'100%',padding:'9px 11px',borderRadius:'var(--r-xs)',border:'1px solid var(--border)',fontSize:13,color:'var(--ink)',outline:'none',fontFamily:'inherit',resize:'vertical' as const,lineHeight:1.6,boxSizing:'border-box' as const,...(props.style||{})}} />
  ),
  select: (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} style={{width:'100%',padding:'9px 11px',borderRadius:'var(--r-xs)',border:'1px solid var(--border)',fontSize:13,color:'var(--ink)',outline:'none',fontFamily:'inherit',background:'var(--surface)',boxSizing:'border-box' as const,...(props.style||{})}} />
  ),
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const [authed, setAuthed]   = useState(false)
  const [pw, setPw]           = useState('')
  const [pwError, setPwError] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [tab, setTab]         = useState<AdminTab>('dashboard')
  const [unis, setUnis]       = useState<University[]>([...UNIVERSITIES])
  const [editUni, setEditUni] = useState<Partial<University>|null>(null)
  const [isNewUni, setIsNewUni] = useState(false)
  const [editTab, setEditTab] = useState<EditTab>('basic')
  const [uniSearch, setUniSearch] = useState('')
  const [posts, setPosts]     = useState<BlogPost[]>([...BLOG_POSTS])
  const [editPost, setEditPost] = useState<BlogPost|null>(null)
  const [isNewPost, setIsNewPost] = useState(false)
  const [postSearch, setPostSearch] = useState('')
  const [copied, setCopied]   = useState<string|null>(null)
  const [saved, setSaved]     = useState(false)
  const [leads, setLeads]     = useState<any[]>([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [leadsError, setLeadsError]     = useState('')
  const [settings, setSettings] = useState({
    adminPhone: '',
    whatsappNumber: '',
    contactEmail: '',
    leadsWebhookUrl: '',
    testStatus: '',
  })

  /* ── Auth ── */

  /* ── Copy helper ── */
  function copyJSON(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(()=>setCopied(null),2000)
  }

  /* ── Fetch leads ── */
  async function fetchLeads() {
    setLeadsLoading(true)
    setLeadsError('')
    try {
      const res = await fetch('/api/leads')
      if (!res.ok) {
        const d = await res.json()
        setLeadsError(d.error || 'Failed to fetch leads')
        return
      }
      const d = await res.json()
      setLeads(d.leads || [])
    } catch {
      setLeadsError('Network error — check if the webhook URL is set')
    } finally {
      setLeadsLoading(false)
    }
  }

  async function updateLeadStatus(row: number, status: string) {
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row, status }),
      })
      setLeads(prev => prev.map(l => l._row === row ? { ...l, Status: status } : l))
    } catch {
      alert('Failed to update status')
    }
  }

  function exportCSV() {
    if (!leads.length) return
    const headers = ['Timestamp', 'Name', 'Phone', 'Email', 'Interested In', 'University', 'Source Page', 'Status']
    const rows = leads.map(l => headers.map(h => `"${(l[h] || '').toString().replace(/"/g, '""')}"`).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `edify-leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function testWebhook() {
    const url = settings.leadsWebhookUrl
    if (!url) { setSettings(s => ({ ...s, testStatus: '❌ Enter a URL first' })); return }
    setSettings(s => ({ ...s, testStatus: 'Testing...' }))
    try {
      const res = await fetch(`/api/leads/test?url=${encodeURIComponent(url)}`)
      const d = await res.json()
      setSettings(s => ({ ...s, testStatus: d.success ? '✅ Webhook is working!' : '❌ ' + (d.error || 'Failed') }))
    } catch {
      setSettings(s => ({ ...s, testStatus: '❌ Could not reach webhook' }))
    }
  }

  /* ── Dashboard stats ── */
  const publishedPosts = posts.filter(p=>p.status==='published').length
  const draftPosts = posts.filter(p=>p.status==='draft').length
  const totalEnquiries = leads.length

  /* ─────────────────────────────────────────────────────────
     DASHBOARD TAB
  ───────────────────────────────────────────────────────── */
  function DashboardTab() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[1.3rem] font-extrabold text-white mb-1">Welcome back 👋</h2>
          <p className="text-[13px] text-ink-3">Edify Admin Panel — manage universities, blogs, and SEO.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          {[
            {icon:'🎓',label:'Universities',value:unis.length,sub:'UGC DEB verified',color:'var(--amber-text)'},
            {icon:'📞',label:'Leads',value:totalEnquiries||'—',sub:'from counselling forms',color:'#f87171',action:()=>setTab('leads')},
            {icon:'📝',label:'Published Posts',value:publishedPosts,sub:`${draftPosts} drafts`,color:'var(--sage-bright)'},
            {icon:'🔍',label:'Programs',value:11,sub:'MBA to BSc',color:'#60a5fa'},
          ].map(s=>(
            <div key={s.label} onClick={(s as any).action} style={{background:'var(--navy)',border:'1px solid #1e2f45',borderRadius:'var(--r-sm)',padding:18,cursor:(s as any).action?'pointer':'default'}}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div style={{fontSize:26,fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{fontSize:12,fontWeight:700,color:'#fff',marginTop:2}}>{s.label}</div>
              <div className="text-[11px] text-ink-2 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="bg-[#162032] border border-border rounded-2xl p-5">
          <div className="text-[11px] font-bold text-amber uppercase tracking-wider mb-3.5">Quick Actions</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
            {[
              {icon:'✍️',label:'Write New Blog Post',desc:'Create and publish a blog',action:()=>setTab('blog')},
              {icon:'🎓',label:'Add University',desc:'Add a new institution',action:()=>{setTab('universities');setEditUni(emptyUni());setIsNewUni(true)}},
              {icon:'⚡',label:'MASTER UPDATE',desc:'Upload Excel → Live in 90 sec (use this)',action:()=>{window.location.href='/admin/master-import'},primary:true},
              {icon:'📊',label:'Excel Import',desc:'Update all universities from Excel',action:()=>{window.location.href='/admin/excel-import'}},
              {icon:'📝',label:'Blog Import',desc:'Upload blog posts from Excel',action:()=>{window.location.href='/admin/blog-import'}},
              {icon:'🔍',label:'Pre-Launch Audit',desc:'6-round site health check',action:()=>{window.location.href='/admin/audit'}},
              {icon:'📚',label:'Guides Import',desc:'Update guides page from Excel',action:()=>{window.location.href='/admin/guides-import'}},
              {icon:'🔗',label:'SEO & Meta',desc:'Keywords and structured data',action:()=>setTab('seo')},
              {icon:'📖',label:'View Blog Posts',desc:`${publishedPosts} live, ${draftPosts} drafts`,action:()=>setTab('blog')},
            ].map(a=>(
              <button key={a.label} onClick={a.action}
                style={{display:'flex',gap:12,alignItems:'flex-start',padding:'14px 16px',background:'var(--navy)',border:'1px solid #1e2f45',borderRadius:'var(--r-sm)',cursor:'pointer',textAlign:'left',width:'100%',fontFamily:'inherit'}}>
                <span className="text-xl shrink-0">{a.icon}</span>
                <div>
                  <div className="text-[13px] font-bold text-white">{a.label}</div>
                  <div className="text-[11px] text-ink-2 mt-0.5">{a.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Customer Journey Insights */}
        <div className="bg-[#162032] border border-border rounded-2xl p-5">
          <div className="text-[11px] font-bold text-amber uppercase tracking-wider mb-3.5">
            🧠 Customer Journey Strategy
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              {step:'1',icon:'🔍',title:'Awareness — Google Search',desc:'Student searches "best online MBA India 2026". Your blog post appears. They click in.'},
              {step:'2',icon:'📖',title:'Interest — Blog / Program Page',desc:'They read your honest guide. No hype. Specific salary data builds trust. They explore universities.'},
              {step:'3',icon:'⚖️',title:'Comparison — Compare Tool',desc:'They compare 2–3 universities. Fee tables, NIRF ranks, exam modes. Rational confidence grows.'},
              {step:'4',icon:'🎯',title:'Intent — University Page',desc:'They read "Right for you if..." and "Think twice if..." — honest framing feels trustworthy.'},
              {step:'5',icon:'💬',title:'Enquiry — CTA Trigger',desc:'Free Counselling CTA. No obligation framing. Psychological safety → form submitted.'},
              {step:'6',icon:'📞',title:'Conversion — Follow Up',desc:'You call within 24 hours. Reference their specific program + budget. Close.'},
            ].map(s=>(
              <div key={s.step} style={{display:'flex',gap:14,alignItems:'flex-start',padding:'12px 14px',background:'var(--navy)',borderRadius:'var(--r-sm)',border:'1px solid #1e2f45'}}>
                <div style={{width:28,height:28,borderRadius:'var(--r-pill)',background:'var(--amber)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span className="text-[11px] font-extrabold text-white">{s.step}</span>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white">{s.icon} {s.title}</div>
                  <div style={{fontSize:12,color:'var(--ink-3)',lineHeight:1.6,marginTop:2}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:14,padding:'12px 14px',background:'rgba(201,146,42,0.08)',borderRadius:'var(--r-sm)',border:'1px solid rgba(201,146,42,0.2)',fontSize:12,color:'var(--ink-4)',lineHeight:1.7}}>
            <strong className="text-amber">💡 Key insight:</strong> Students don&apos;t enquire because they feel pressured — they enquire because they feel <em>understood</em>. Your &quot;Think twice if&quot; section builds more trust than any sales pitch.
          </div>
        </div>

        {/* Recent posts */}
        <div className="bg-[#162032] border border-border rounded-2xl p-5">
          <div className="flex justify-between items-center mb-3.5">
            <div className="section-title">Recent Blog Posts</div>
            <button onClick={()=>setTab('blog')} style={{fontSize:12,color:'var(--amber-text)',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>View all →</button>
          </div>
          {posts.slice(0,5).map(p=>(
            <div key={p.slug} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid #1e2f45',fontSize:12}}>
              <div>
                <div style={{color:'#fff',fontWeight:600,marginBottom:2}}>{p.title.slice(0,60)}{p.title.length>60?'...':''}</div>
                <div className="text-ink-2">{p.category} · {p.publishedAt}</div>
              </div>
              <span style={{padding:'2px 8px',borderRadius:'var(--r-pill)',fontSize:10,fontWeight:700,background:p.status==='published'?'rgba(74,222,128,0.1)':'rgba(148,163,184,0.1)',color:p.status==='published'?'var(--sage-bright)':'var(--ink-4)',flexShrink:0,marginLeft:10}}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ─────────────────────────────────────────────────────────
     UNIVERSITIES TAB
  ───────────────────────────────────────────────────────── */
  function UniversitiesTab() {
    const filtered = unis.filter(u=>
      u.name.toLowerCase().includes(uniSearch.toLowerCase()) ||
      u.city.toLowerCase().includes(uniSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(uniSearch.toLowerCase())
    )
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2.5 items-center flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-[11px] top-1/2 -translate-y-1/2 text-ink-2"/>
            <input value={uniSearch} onChange={e=>setUniSearch(e.target.value)} placeholder={`Search ${unis.length} universities...`}
              style={{width:'100%',paddingLeft:34,paddingRight:12,paddingTop:9,paddingBottom:9,borderRadius:'var(--r-sm)',border:'1px solid #1e2f45',background:'var(--navy)',color:'#fff',fontSize:13,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}} />
          </div>
          <button onClick={()=>{setEditUni(emptyUni());setIsNewUni(true)}}
            style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:'var(--r-sm)',background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:'pointer'}}>
            <Plus size={14}/>Add University
          </button>
        </div>
        <div className="text-[11px] text-ink-2">Showing {filtered.length} of {unis.length} universities. All are govtRecognised:true (UGC DEB 2020 parity)</div>

        {editUni && <UniEditor uni={editUni} isNew={isNewUni} onClose={()=>{setEditUni(null);setIsNewUni(false)}} onSave={(u)=>{
          if(isNewUni) setUnis([...unis,u as University])
          else setUnis(unis.map(x=>x.id===u.id?u as University:x))
          setEditUni(null);setIsNewUni(false)
        }}/>}

        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2.5">
          {filtered.map(u=>(
            <div key={u.id} style={{background:'var(--navy)',border:'1px solid #1e2f45',borderRadius:'var(--r-sm)',overflow:'hidden'}}>
              <div style={{height:3,background:u.color}}/>
              <div className="p-[14px]">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-bold text-white text-[13px]">{u.name}</div>
                    <div className="text-[11px] text-ink-3 mt-0.5">{u.city}, {u.state} · {u.nirfMgt && u.nirfMgt > 0 && u.nirfMgt < 200 ? `NIRF #${u.nirfMgt} Mgmt` : u.nirf > 0 && u.nirf < 200 ? `NIRF #${u.nirf} Univ` : 'Unranked'} · {u.naac}</div>
                  </div>
                  <button onClick={()=>{setEditUni({...u});setIsNewUni(false)}}
                    style={{background:'rgba(201,146,42,0.1)',border:'1px solid rgba(201,146,42,0.2)',borderRadius:'var(--r-xs)',padding:'5px 10px',color:'var(--amber-text)',cursor:'pointer',fontSize:11,fontWeight:600,flexShrink:0}}>
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {u.programs.slice(0,4).map(p=>(
                    <span key={p} style={{fontSize:10,padding:'2px 7px',borderRadius:'var(--r-pill)',background:'rgba(255,255,255,0.05)',color:'var(--ink-4)',border:'1px solid #1e2f45'}}>{p}</span>
                  ))}
                  {u.programs.length>4 && <span style={{fontSize:10,color:'var(--ink-2)'}}>+{u.programs.length-4}</span>}
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-ink-2">
                  <span>Fees: {(u.feeMin/100000).toFixed(1)}L – {(u.feeMax/100000).toFixed(1)}L</span>
                  <span className="text-green-400">✓ UGC DEB Valid</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ─────────────────────────────────────────────────────────
     UNIVERSITY EDITOR
  ───────────────────────────────────────────────────────── */
  function UniEditor({uni, isNew, onClose, onSave}: {uni:Partial<University>;isNew:boolean;onClose:()=>void;onSave:(u:Partial<University>)=>void}) {
    const [data, setData] = useState<Partial<University>>({...uni})
    const up = (key: string, val: any) => setData(d=>({...d,[key]:val}))

    function generateCode() {
      return JSON.stringify(data, null, 2)
    }

    const TABS_LIST: {id:EditTab;label:string;icon:string}[] = [
      {id:'basic',label:'Basic',icon:'ℹ️'},
      {id:'fees',label:'Fees',icon:'💰'},
      {id:'content',label:'Content',icon:'📝'},
      {id:'approvals',label:'Approvals',icon:'✅'},
      {id:'theme',label:'Theme',icon:'🎨'},
    ]

    return (
      <div style={{background:'var(--navy)',border:'2px solid #c9922a',borderRadius:'var(--r-md)',overflow:'hidden',marginBottom:8}}>
        <div style={{padding:'14px 20px',background:'rgba(201,146,42,0.08)',borderBottom:'1px solid #1e2f45',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div className="font-bold text-white text-[15px]">{isNew?'Add New University':'Edit: '+data.name}</div>
          <div className="flex gap-2">
            <button onClick={()=>copyJSON(generateCode(),'uni')}
              style={{display:'flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:'var(--r-xs)',background:'rgba(255,255,255,0.05)',border:'1px solid #1e2f45',color:'var(--ink-4)',cursor:'pointer',fontSize:12,fontWeight:600}}>
              {copied==='uni'?<><CheckCircle size={12}/>Copied!</>:<><Copy size={12}/>Export JSON</>}
            </button>
            <button onClick={()=>onSave(data)}
              style={{display:'flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:'var(--r-xs)',background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,border:'none'}}>
              <Save size={12}/>{isNew?'Add':'Save'}
            </button>
            <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'var(--ink-3)'}}><X size={18}/></button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{display:'flex',padding:'0 20px',borderBottom:'1px solid #1e2f45',background:'var(--ink)',overflowX:'auto'}}>
          {TABS_LIST.map(t=>(
            <button key={t.id} onClick={()=>setEditTab(t.id)}
              style={{padding:'10px 16px',fontSize:12,fontWeight:600,cursor:'pointer',border:'none',background:'transparent',color:editTab===t.id?'var(--amber)':'var(--ink-2)',borderBottom:editTab===t.id?'2px solid #c9922a':'2px solid transparent',whiteSpace:'nowrap' as const,fontFamily:'inherit'}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 flex flex-col gap-3.5">
          {editTab==='basic' && <>
            <div className="grid grid-cols-2 gap-3">
              <div>{F.label('University ID *',true)}{F.input({value:data.id||'',onChange:e=>up('id',e.target.value),placeholder:'manipal-university-jaipur'})}</div>
              <div>{F.label('Short Name (Abbr) *',true)}{F.input({value:data.abbr||'',onChange:e=>up('abbr',e.target.value),placeholder:'MUJ'})}</div>
            </div>
            <div>{F.label('Full University Name *',true)}{F.input({value:data.name||'',onChange:e=>up('name',e.target.value),placeholder:'Manipal University Jaipur'})}</div>
            <div className="grid grid-cols-3 gap-3">
              <div>{F.label('City *')}{F.input({value:data.city||'',onChange:e=>up('city',e.target.value)})}</div>
              <div>{F.label('State *')}{F.input({value:data.state||'',onChange:e=>up('state',e.target.value)})}</div>
              <div>{F.label('Region')}{F.select({value:data.region||'North',onChange:e=>up('region',e.target.value),children:REGIONS.map(r=><option key={r} value={r}>{r}</option>)})}</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>{F.label('NIRF Overall Rank')}{F.input({type:'number',value:data.nirf||'',onChange:e=>up('nirf',+e.target.value)})}</div>
              <div>{F.label('NAAC Grade')}{F.select({value:data.naac||'A+',onChange:e=>up('naac',e.target.value),children:NAAC_GRADES.map(g=><option key={g} value={g}>{g}</option>)})}</div>
              <div>{F.label('Exam Mode')}{F.select({value:data.examMode||'Online',onChange:e=>up('examMode',e.target.value),children:EXAM_MODES.map(m=><option key={m} value={m}>{m}</option>)})}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>{F.label('Eligibility')}{F.input({value:data.eligibility||'',onChange:e=>up('eligibility',e.target.value),placeholder:'50% in graduation'})}</div>
              <div>{F.label('Eligibility %')}{F.input({type:'number',value:data.eligibilityPct||50,onChange:e=>up('eligibilityPct',+e.target.value)})}</div>
            </div>
            <div style={{padding:'12px 14px',background:'rgba(74,222,128,0.05)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:'var(--r-sm)',fontSize:12,color:'var(--ink-4)',lineHeight:1.7}}>
              <span className="text-green-400 font-bold">✓ Note:</span> All UGC DEB approved universities are automatically set as <code style={{background:'var(--navy)',padding:'1px 5px',borderRadius:4,fontSize:11}}>govtRecognised: true</code> per MOE 2020 notification. Online degrees are treated on par with regular degrees.
            </div>
          </>}

          {editTab==='fees' && <>
            <div className="grid grid-cols-3 gap-3">
              <div>{F.label('Min Fee (₹)')}{F.input({type:'number',value:data.feeMin||'',onChange:e=>up('feeMin',+e.target.value),placeholder:'100000'})}</div>
              <div>{F.label('Max Fee (₹)')}{F.input({type:'number',value:data.feeMax||'',onChange:e=>up('feeMax',+e.target.value),placeholder:'200000'})}</div>
              <div>{F.label('EMI From (₹/mo)')}{F.input({type:'number',value:data.emiFrom||'',onChange:e=>up('emiFrom',+e.target.value),placeholder:'5000'})}</div>
            </div>
            <div style={{padding:'12px 14px',background:'rgba(201,146,42,0.06)',border:'1px solid rgba(201,146,42,0.15)',borderRadius:'var(--r-sm)',fontSize:12,color:'var(--ink-4)'}}>
              💡 Fee ranges display as "₹1.0L – ₹2.0L" on university cards. EMI appears as "from ₹5,000/mo" in the hero.
            </div>
          </>}

          {editTab==='content' && <>
            <div>{F.label('Tagline (1 line)')}{F.input({value:data.tagline||'',onChange:e=>up('tagline',e.target.value),placeholder:'NAAC A++. Zero exams. Pure online.'})}</div>
            <div>{F.label('Highlight (USP badge)')}{F.input({value:data.highlight||'',onChange:e=>up('highlight',e.target.value),placeholder:'100% assignment-based — zero exams'})}</div>
            <div>{F.label('Description (2–3 sentences)')}{F.textarea({value:data.description||'',onChange:e=>up('description',e.target.value),rows:3,placeholder:'Write a clear, honest description...'})}</div>
            <div>
              {F.label('"Right for you if" — 3 honest bullet points')}
              {(data.forWho||['','','']).map((item,i)=>(
                <div key={i} className="flex gap-2 mb-1.5 items-center">
                  <span className="text-xs text-green-400 shrink-0">✓</span>
                  {F.input({value:item,onChange:e=>{const a=[...(data.forWho||[])];a[i]=e.target.value;up('forWho',a)},placeholder:`e.g. Working professionals who can't take breaks`})}
                </div>
              ))}
            </div>
            <div>
              {F.label('"Think twice if" — honest caveats (no competitor names)')}
              <div className="text-[11px] text-ink-3 mb-1.5">Use location, exam format, budget as reasons — never name competing universities</div>
              {(data.notFor||['','']).map((item,i)=>(
                <div key={i} className="flex gap-2 mb-1.5 items-center">
                  <span className="text-xs text-red-600 shrink-0">✗</span>
                  {F.input({value:item,onChange:e=>{const a=[...(data.notFor||[])];a[i]=e.target.value;up('notFor',a)},placeholder:`e.g. Students who prefer assignment-only evaluation`})}
                </div>
              ))}
            </div>
          </>}

          {editTab==='approvals' && <>
            <div>
              {F.label('Approvals & Badges')}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:8,marginTop:6}}>
                {APPROVAL_OPTIONS.map(opt=>{
                  const checked=(data.approvals||[]).includes(opt)
                  return (
                    <label key={opt} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:checked?'rgba(201,146,42,0.08)':'var(--navy)',border:`1px solid ${checked?'rgba(201,146,42,0.3)':'var(--border)'}`,borderRadius:'var(--r-xs)',cursor:'pointer',fontSize:12,color:checked?'var(--amber)':'var(--ink-4)'}}>
                      <input type="checkbox" checked={checked} onChange={()=>{
                        const a=[...(data.approvals||[])]
                        checked?a.splice(a.indexOf(opt),1):a.push(opt)
                        up('approvals',a)
                      }} style={{accentColor:'var(--amber)'}}/>
                      {opt}
                    </label>
                  )
                })}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:8}}>
              {ALL_PROGRAMS.map(prog=>{
                const checked=(data.programs||[]).includes(prog)
                return (
                  <label key={prog} style={{display:'flex',alignItems:'center',gap:7,padding:'8px 12px',background:checked?'rgba(74,222,128,0.08)':'var(--navy)',border:`1px solid ${checked?'rgba(74,222,128,0.2)':'var(--border)'}`,borderRadius:'var(--r-xs)',cursor:'pointer',fontSize:12,color:checked?'var(--sage-bright)':'var(--ink-4)'}}>
                    <input type="checkbox" checked={checked} onChange={()=>{
                      const a=[...(data.programs||[])]
                      checked?a.splice(a.indexOf(prog),1):a.push(prog as Program)
                      up('programs',a)
                    }} style={{accentColor:'var(--sage-bright)'}}/>
                    {prog}
                  </label>
                )
              })}
            </div>
          </>}

          {editTab==='theme' && <>
            <div>
              {F.label('Brand Color')}
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:6}}>
                {COLOR_PRESETS.map(c=>(
                  <button key={c} onClick={()=>up('color',c)}
                    style={{width:36,height:36,borderRadius:'var(--r-sm)',background:c,border:`3px solid ${data.color===c?'#fff':'transparent'}`,cursor:'pointer',boxShadow:data.color===c?'0 0 0 2px #c9922a':'none'}}/>
                ))}
                <input type="color" value={data.color||'#F59E0B'} onChange={e=>up('color',e.target.value)}
                  style={{width:36,height:36,borderRadius:'var(--r-sm)',border:'none',cursor:'pointer',padding:2}}/>
              </div>
              <div style={{marginTop:12,padding:14,background:'var(--navy)',borderRadius:'var(--r-sm)',border:'1px solid #1e2f45',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,borderRadius:'var(--r-xs)',background:data.color||'#F59E0B'}}/>
                <div>
                  <div className="text-xs font-bold text-white">{data.name||'University Name'}</div>
                  <div className="text-[11px] text-ink-3">{data.city||'City'} · NIRF #{data.nirf||'—'}</div>
                </div>
              </div>
            </div>
          </>}
        </div>
      </div>
    )
  }

  /* ─────────────────────────────────────────────────────────
     BLOG TAB
  ───────────────────────────────────────────────────────── */
  function BlogTab() {
    const filtered = posts.filter(p=>
      p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(postSearch.toLowerCase())
    )
    return (
      <div className="flex flex-col gap-4">
        <div style={{padding:'14px 18px',background:'rgba(74,222,128,0.05)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:'var(--r-sm)',fontSize:13,color:'var(--ink-4)',lineHeight:1.7}}>
          <strong className="text-green-400">✏️ Blog CMS:</strong> Click <strong>"Write New Post"</strong> to open the full blog editor. For instant publishing, configure Google Sheets CMS via the <button onClick={()=>setTab('settings')} style={{color:'var(--amber)',background:'none',border:'none',cursor:'pointer',fontWeight:600,fontSize:13,fontFamily:'inherit'}}>Settings tab</button>. Otherwise, use <a href="/admin/blog-import" className="text-amber no-underline">Blog Import</a> to upload posts from Excel.
        </div>
        <div className="flex gap-2.5 flex-wrap items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-[11px] top-1/2 -translate-y-1/2 text-ink-2"/>
            <input value={postSearch} onChange={e=>setPostSearch(e.target.value)} placeholder="Search posts..."
              style={{width:'100%',paddingLeft:34,paddingRight:12,paddingTop:9,paddingBottom:9,borderRadius:'var(--r-sm)',border:'1px solid #1e2f45',background:'var(--navy)',color:'#fff',fontSize:13,outline:'none',fontFamily:'inherit',boxSizing:'border-box' as const}} />
          </div>
          <a href="/blog/write" target="_blank"
            style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:'var(--r-sm)',background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none'}}>
            <Plus size={14}/>Write New Post
          </a>
        </div>

        {/* Blog SEO tips */}
        <div style={{background:'var(--navy)',border:'1px solid #1e2f45',borderRadius:'var(--r-sm)',padding:16}}>
          <div className="text-[11px] font-bold text-amber uppercase mb-2.5">📈 Blog SEO Strategy — What Gets Traffic</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:8}}>
            {[
              {type:'🔥 High Intent',example:'NMIMS vs Manipal Online MBA 2026',why:'Students actively comparing → high conversion'},
              {type:'📍 Location',example:'Best online MBA for Pune professionals',why:'Local searches + high trust for nearby students'},
              {type:'💰 Budget',example:'Online MBA under ₹1 lakh India',why:'Price-sensitive majority → huge search volume'},
              {type:'✅ Validity',example:'Is online MBA valid for PSU jobs?',why:'Anxiety-driven searches → very high intent'},
              {type:'🎯 Career',example:'Online MBA for IT professionals 2026',why:'Role-specific → ready to apply, high conversion'},
              {type:'⭐ Reviews',example:'Amity Online MBA honest review 2026',why:'Trust builders → read by comparison shoppers'},
            ].map(tip=>(
              <div key={tip.type} style={{padding:'10px 12px',background:'var(--navy)',borderRadius:'var(--r-sm)',border:'1px solid #1e2f45'}}>
                <div className="text-xs font-bold text-white mb-1">{tip.type}</div>
                <div className="text-[11px] text-amber mb-1">&quot;{tip.example}&quot;</div>
                <div className="text-[11px] text-ink-2 leading-snug">{tip.why}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map(post=>(
            <div key={post.slug} style={{background:'var(--navy)',border:'1px solid #1e2f45',borderRadius:'var(--r-sm)',padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap' as const}}>
              <div className="flex-1 min-w-0">
                <div style={{fontWeight:700,color:'#fff',fontSize:13,marginBottom:3}}>{post.title}</div>
                <div className="text-[11px] text-ink-2">{post.category} · {post.readTime} min · {post.publishedAt} · <span className="text-ink-3">/blog/{post.slug}</span></div>
              </div>
              <div className="flex gap-2 items-center shrink-0">
                <span style={{padding:'3px 10px',borderRadius:'var(--r-pill)',fontSize:11,fontWeight:700,background:post.status==='published'?'rgba(74,222,128,0.1)':'rgba(148,163,184,0.1)',color:post.status==='published'?'var(--sage-bright)':'var(--ink-4)'}}>
                  {post.status}
                </span>
                <a href={`/blog/${post.slug}`} target="_blank"
                  className="text-[11px] text-amber no-underline flex items-center gap-1">
                  <ExternalLink size={11}/>View
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ─────────────────────────────────────────────────────────
     SEO TAB
  ───────────────────────────────────────────────────────── */
  function SEOTab() {
    return (
      <div className="flex flex-col gap-5">
        <div className="bg-[#162032] border border-border rounded-2xl p-5">
          <div className="text-[11px] font-bold text-amber uppercase tracking-wider mb-3.5">🔍 SEO Health Overview</div>
          {[
            {check:true,label:'sitemap.xml — auto-generated at /sitemap.xml'},
            {check:true,label:'robots.txt — allows all crawlers, blocks /admin'},
            {check:true,label:'Open Graph meta tags — for social sharing'},
            {check:true,label:'Twitter card meta — summary_large_image'},
            {check:true,label:'JSON-LD structured data — Organization + WebSite + SearchAction'},
            {check:true,label:'FAQ schema on program pages — enables Google rich snippets'},
            {check:true,label:'Article schema on blog posts — enables news indexing'},
            {check:true,label:'Course schema on university+program pages'},
            {check:true,label:'canonical URLs — prevents duplicate content'},
            {check:true,label:'hreflang:en-IN — signals India audience to Google'},
            {check:true,label:'PWA manifest + apple-touch-icon — installable'},
          ].map((item,i)=>(
            <div key={i} style={{display:'flex',gap:10,alignItems:'center',padding:'8px 0',borderBottom:'1px solid #1e2f45',fontSize:12}}>
              <div style={{width:18,height:18,borderRadius:'var(--r-pill)',background:'var(--sage)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <CheckCircle size={10} color="#fff"/>
              </div>
              <span className="text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-[#162032] border border-border rounded-2xl p-5">
          <div className="text-[11px] font-bold text-amber uppercase tracking-wider mb-3.5">📋 Action Items for Better SEO</div>
          {[
            {priority:'High',label:'Verify site in Google Search Console → submit sitemap.xml'},
            {priority:'High',label:'Write 2 blog posts/week using high-intent keywords above'},
            {priority:'High',label:'Upload og.png (1200×630) to /public/ for social sharing'},
            {priority:'High',label:'Upload icon-192.png, icon-512.png for PWA install prompt'},
            {priority:'Med',label:'Add Google Analytics (GA4) tag to layout.tsx'},
            {priority:'Med',label:'Get 5 backlinks from education sites (Shiksha, CollegeDekho, etc.)'},
            {priority:'Low',label:'Add alt text to all images when you add them'},
            {priority:'Low',label:'Create city landing pages: /programs/mba/delhi, /programs/mba/mumbai'},
          ].map((item,i)=>(
            <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'8px 0',borderBottom:'1px solid #1e2f45',fontSize:12}}>
              <span style={{padding:'2px 7px',borderRadius:'var(--r-pill)',fontSize:10,fontWeight:700,background:item.priority==='High'?'rgba(220,38,38,0.15)':item.priority==='Med'?'rgba(201,146,42,0.15)':'rgba(148,163,184,0.1)',color:item.priority==='High'?'#f87171':item.priority==='Med'?'var(--amber)':'var(--ink-4)',flexShrink:0,whiteSpace:'nowrap' as const}}>{item.priority}</span>
              <span className="text-slate-400 leading-snug">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-[#162032] border border-border rounded-2xl p-5">
          <div className="text-[11px] font-bold text-amber uppercase tracking-wider mb-3.5">🤖 AI SEO / GEO (Generative Engine Optimization)</div>
          <p className="text-[13px] text-slate-400 leading-[1.7] mb-3.5">
            AI engines (ChatGPT, Perplexity, Google AI Overviews) prefer pages with: specific data, honest comparisons, FAQ schema, and E-E-A-T signals.
          </p>
          {[
            {check:true,label:'FAQ schema on every page — AI pulls these for answers'},
            {check:true,label:'Specific salary data (₹4L–₹18L) — cited by AI as factual'},
            {check:true,label:'Honest "Think twice if" — signals editorial independence'},
            {check:true,label:'"Zero paid rankings" trust signal — builds E-E-A-T'},
            {check:true,label:'Author/organization schema — tells AI who wrote this'},
            {check:false,label:'Missing: Expert author bio pages (future: /about/team)'},
            {check:false,label:'Missing: Citations to external sources (NIRF, UGC, Glassdoor)'},
          ].map((item,i)=>(
            <div key={i} style={{display:'flex',gap:10,alignItems:'center',padding:'7px 0',borderBottom:'1px solid #1e2f45',fontSize:12}}>
              <div style={{width:16,height:16,borderRadius:'var(--r-pill)',background:item.check?'var(--sage)':'var(--ink-2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {item.check?<CheckCircle size={9} color="#fff"/>:<span style={{fontSize:8,color:'#fff'}}>–</span>}
              </div>
              <span style={{color:item.check?'var(--ink-4)':'var(--ink-3)'}}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ─────────────────────────────────────────────────────────
     LEADS TAB
  ───────────────────────────────────────────────────────── */
  function LeadsTab() {
    const newCount = leads.filter(l => l.Status === 'New').length

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 style={{color:'#fff',fontWeight:800,fontSize:'1.1rem',marginBottom:4}}>Counselling Leads</h2>
            <p style={{color:'var(--ink-3)',fontSize:12}}>
              {leads.length} total · {newCount} new
              {' '}(fetched from Google Sheets)
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={fetchLeads}
              style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:'var(--r-sm)',background:'var(--navy)',border:'1px solid #1e2f45',color:'var(--ink-4)',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit'}}>
              <RefreshCw size={13} className={leadsLoading ? 'animate-spin' : ''}/>
              {leadsLoading ? 'Loading...' : 'Refresh'}
            </button>
            {leads.length > 0 && (
              <button onClick={exportCSV}
                style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:'var(--r-sm)',background:'rgba(201,146,42,0.1)',border:'1px solid rgba(201,146,42,0.3)',color:'var(--amber)',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit'}}>
                <Download size={13}/>Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Setup banner if not configured */}
        {leadsError && leadsError.includes('not configured') && (
          <div style={{padding:'16px 20px',background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:'var(--r-sm)',fontSize:13,color:'var(--ink-4)',lineHeight:1.7}}>
            <strong style={{color:'var(--amber)'}}>📋 Setup needed:</strong> Add your Google Apps Script URL to .env.local as <code style={{background:'var(--navy)',padding:'1px 6px',borderRadius:4,fontSize:11}}>NEXT_PUBLIC_LEADS_WEBHOOK_URL</code>.
            {' '}Deploy the script from <code style={{background:'var(--navy)',padding:'1px 6px',borderRadius:4,fontSize:11}}>scripts/google-apps-script-leads.js</code>.
          </div>
        )}

        {leadsError && !leadsError.includes('not configured') && (
          <div style={{padding:'12px 16px',background:'rgba(220,38,38,0.08)',border:'1px solid rgba(220,38,38,0.2)',borderRadius:'var(--r-sm)',fontSize:12,color:'#f87171'}}>
            {leadsError}
          </div>
        )}

        {!leadsLoading && leads.length === 0 && !leadsError && (
          <div style={{padding:'40px',textAlign:'center',background:'var(--navy)',borderRadius:'var(--r-sm)',border:'1px solid #1e2f45'}}>
            <div style={{fontSize:32,marginBottom:8}}>📭</div>
            <div style={{color:'#fff',fontWeight:600,marginBottom:4}}>No leads yet</div>
            <div style={{color:'var(--ink-3)',fontSize:12}}>Click Refresh to load leads, or submit a test enquiry on the homepage.</div>
          </div>
        )}

        {leads.length > 0 && (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead>
                <tr style={{background:'#0f2137'}}>
                  {['Date/Time','Name','Phone','Program','University','Source','Status','Action'].map(h => (
                    <th key={h} style={{padding:'10px 12px',textAlign:'left',color:'var(--ink-3)',fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap',borderBottom:'1px solid #1e2f45'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => {
                  const status = lead.Status || 'New'
                  const statusColor = status === 'New' ? '#fbbf24' : status === 'Called' ? '#4ade80' : '#60a5fa'
                  const statusBg = status === 'New' ? 'rgba(251,191,36,0.1)' : status === 'Called' ? 'rgba(74,222,128,0.1)' : 'rgba(96,165,250,0.1)'
                  return (
                    <tr key={i} style={{borderBottom:'1px solid #1e2f45',background:i%2===0?'var(--navy)':'rgba(255,255,255,0.01)'}}>
                      <td style={{padding:'10px 12px',color:'var(--ink-3)',whiteSpace:'nowrap',fontSize:11}}>{lead.Timestamp || '—'}</td>
                      <td style={{padding:'10px 12px',color:'#fff',fontWeight:600}}>{lead.Name || '—'}</td>
                      <td style={{padding:'10px 12px',color:'var(--amber)',fontWeight:600,whiteSpace:'nowrap'}}>
                        <a href={`tel:+91${lead.Phone}`} style={{color:'inherit',textDecoration:'none'}}>+91 {lead.Phone || '—'}</a>
                      </td>
                      <td style={{padding:'10px 12px',color:'var(--ink-4)'}}>{lead['Interested In'] || '—'}</td>
                      <td style={{padding:'10px 12px',color:'var(--ink-3)',maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lead.University || '—'}</td>
                      <td style={{padding:'10px 12px',color:'var(--ink-2)',fontSize:11}}>{lead['Source Page'] || '—'}</td>
                      <td style={{padding:'10px 12px'}}>
                        <span style={{padding:'3px 10px',borderRadius:'var(--r-pill)',fontSize:11,fontWeight:700,background:statusBg,color:statusColor}}>
                          {status}
                        </span>
                      </td>
                      <td style={{padding:'10px 12px'}}>
                        <select
                          value={status}
                          onChange={e => updateLeadStatus(lead._row, e.target.value)}
                          style={{fontSize:11,padding:'4px 8px',borderRadius:'var(--r-xs)',border:'1px solid #1e2f45',background:'var(--navy)',color:'var(--ink-4)',cursor:'pointer',fontFamily:'inherit'}}
                        >
                          <option value="New">New</option>
                          <option value="Called">Called</option>
                          <option value="Enrolled">Enrolled</option>
                          <option value="Not Interested">Not Interested</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Load leads hint */}
        {!leadsLoading && leads.length === 0 && !leadsError && (
          <button onClick={fetchLeads}
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px',borderRadius:'var(--r-sm)',background:'var(--navy)',border:'1px solid #1e2f45',color:'var(--amber)',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit'}}>
            <RefreshCw size={14}/>Load Leads from Google Sheets
          </button>
        )}
      </div>
    )
  }

  /* ─────────────────────────────────────────────────────────
     SETTINGS TAB
  ───────────────────────────────────────────────────────── */
  function SettingsTab() {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h2 style={{color:'#fff',fontWeight:800,fontSize:'1.1rem',marginBottom:4}}>Admin Settings</h2>
          <p style={{color:'var(--ink-3)',fontSize:12}}>Configure contact info, webhooks, and integrations.</p>
        </div>

        {/* Contact Info */}
        <div style={{background:'var(--navy)',border:'1px solid #1e2f45',borderRadius:'var(--r-sm)',padding:20}}>
          <div className="text-[11px] font-bold text-amber uppercase tracking-wider mb-4">📞 Contact Info (set in .env.local)</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
            {[
              {label:'Admin Phone',env:'NEXT_PUBLIC_CONTACT_EMAIL',icon:'📧',note:'Shown on contact page'},
              {label:'WhatsApp Number',env:'NEXT_PUBLIC_WHATSAPP_NUMBER',icon:'💬',note:'Format: 917061285806 (no + or spaces)'},
              {label:'Web3Forms Key',env:'NEXT_PUBLIC_WEB3FORMS_KEY',icon:'📨',note:'Email notification key'},
              {label:'GA4 Measurement ID',env:'NEXT_PUBLIC_GA4_ID',icon:'📊',note:'Google Analytics tracking'},
            ].map(item => (
              <div key={item.env} style={{padding:'14px',background:'rgba(255,255,255,0.02)',borderRadius:'var(--r-xs)',border:'1px solid #1e2f45'}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--ink-3)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.04em'}}>
                  {item.icon} {item.label}
                </div>
                <div style={{fontSize:12,fontFamily:'monospace',color:'var(--amber)',background:'var(--ink)',padding:'6px 10px',borderRadius:'var(--r-xs)',marginBottom:6,wordBreak:'break-all'}}>
                  {item.env}
                </div>
                <div style={{fontSize:11,color:'var(--ink-2)'}}>{item.note}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,padding:'12px 16px',background:'rgba(201,146,42,0.06)',borderRadius:'var(--r-xs)',border:'1px solid rgba(201,146,42,0.15)',fontSize:12,color:'var(--ink-4)',lineHeight:1.7}}>
            <strong className="text-amber">To update:</strong> Edit <code style={{background:'var(--ink)',padding:'1px 6px',borderRadius:3,fontSize:11}}>.env.local</code> locally, then set the same variables in your Vercel project settings under Settings → Environment Variables.
          </div>
        </div>

        {/* Leads Webhook */}
        <div style={{background:'var(--navy)',border:'1px solid #1e2f45',borderRadius:'var(--r-sm)',padding:20}}>
          <div className="text-[11px] font-bold text-amber uppercase tracking-wider mb-4">🔗 Leads Webhook (Google Sheets)</div>
          <div style={{marginBottom:12}}>
            {F.label('NEXT_PUBLIC_LEADS_WEBHOOK_URL')}
            <div style={{fontSize:12,color:'var(--ink-3)',marginBottom:8,lineHeight:1.6}}>
              Deploy <code style={{background:'rgba(255,255,255,0.05)',padding:'1px 5px',borderRadius:3}}>scripts/google-apps-script-leads.js</code> as a Google Apps Script Web App, then paste the URL here (in .env.local).
            </div>
            <div style={{display:'flex',gap:8}}>
              {F.input({
                value: settings.leadsWebhookUrl,
                onChange: (e: any) => setSettings(s => ({ ...s, leadsWebhookUrl: e.target.value })),
                placeholder: 'https://script.google.com/macros/s/AKfy.../exec',
              })}
              <button onClick={testWebhook}
                style={{padding:'9px 16px',borderRadius:'var(--r-xs)',background:'rgba(201,146,42,0.12)',border:'1px solid rgba(201,146,42,0.3)',color:'var(--amber)',cursor:'pointer',fontSize:12,fontWeight:600,whiteSpace:'nowrap',fontFamily:'inherit'}}>
                Test
              </button>
            </div>
            {settings.testStatus && (
              <div style={{marginTop:8,fontSize:12,color:settings.testStatus.startsWith('✅') ? 'var(--sage-bright)' : '#f87171'}}>
                {settings.testStatus}
              </div>
            )}
          </div>

          <div style={{padding:'12px 16px',background:'rgba(74,222,128,0.05)',borderRadius:'var(--r-xs)',border:'1px solid rgba(74,222,128,0.1)',fontSize:12,color:'var(--ink-4)',lineHeight:1.7}}>
            <strong className="text-green-400">Setup steps:</strong>
            <ol style={{marginTop:6,paddingLeft:16,color:'var(--ink-3)'}}>
              <li>Open <a href="https://script.google.com" target="_blank" className="text-amber">script.google.com</a> → New Project</li>
              <li>Paste the script from <code style={{background:'rgba(255,255,255,0.05)',padding:'1px 5px',borderRadius:3}}>scripts/google-apps-script-leads.js</code></li>
              <li>Run <code style={{background:'rgba(255,255,255,0.05)',padding:'1px 5px',borderRadius:3}}>setup()</code> once to create the sheet</li>
              <li>Deploy → New Deployment → Web App → Execute as Me → Access: Anyone</li>
              <li>Copy the URL → paste in .env.local as NEXT_PUBLIC_LEADS_WEBHOOK_URL</li>
            </ol>
          </div>
        </div>

        {/* Admin Auth */}
        <div style={{background:'var(--navy)',border:'1px solid #1e2f45',borderRadius:'var(--r-sm)',padding:20}}>
          <div className="text-[11px] font-bold text-amber uppercase tracking-wider mb-4">🔒 Admin Authentication</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
            {[
              {label:'ADMIN_SECRET',note:'The password you type on the login screen'},
              {label:'ADMIN_SESSION_TOKEN',note:'Opaque cookie token — regenerate with node -e "require(\'crypto\').randomBytes(32).toString(\'hex\')"'},
            ].map(item => (
              <div key={item.label} style={{padding:'14px',background:'rgba(255,255,255,0.02)',borderRadius:'var(--r-xs)',border:'1px solid #1e2f45'}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--ink-3)',marginBottom:6,textTransform:'uppercase' as const,letterSpacing:'0.04em'}}>
                  🔐 {item.label}
                </div>
                <div style={{fontSize:12,fontFamily:'monospace',color:'#f87171',background:'var(--ink)',padding:'6px 10px',borderRadius:'var(--r-xs)',marginBottom:6}}>
                  ●●●●●●●● (hidden)
                </div>
                <div style={{fontSize:11,color:'var(--ink-2)'}}>{item.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Revalidation */}
        <div style={{background:'var(--navy)',border:'1px solid #1e2f45',borderRadius:'var(--r-sm)',padding:20}}>
          <div className="text-[11px] font-bold text-amber uppercase tracking-wider mb-3">⚡ Cache Revalidation</div>
          <p style={{fontSize:12,color:'var(--ink-3)',lineHeight:1.7,marginBottom:12}}>
            After updating university or blog data, trigger a revalidation so the website picks up changes within 60 seconds.
          </p>
          <button
            onClick={async () => {
              const secret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET || ''
              try {
                const res = await fetch(`/api/revalidate?secret=${secret}&path=/`)
                const d = await res.json()
                alert(d.revalidated ? '✅ Pages revalidated!' : '❌ ' + JSON.stringify(d))
              } catch {
                alert('❌ Revalidation failed')
              }
            }}
            style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:'var(--r-sm)',background:'rgba(96,165,250,0.1)',border:'1px solid rgba(96,165,250,0.2)',color:'#60a5fa',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit'}}>
            <RefreshCw size={13}/>Trigger Cache Revalidation
          </button>
        </div>

        {/* Quick links */}
        <div style={{background:'var(--navy)',border:'1px solid #1e2f45',borderRadius:'var(--r-sm)',padding:20}}>
          <div className="text-[11px] font-bold text-amber uppercase tracking-wider mb-3">🔗 Admin Tools</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8}}>
            {[
              {label:'Google Sheets CMS Sync',href:'/admin/cms',icon:'📊'},
              {label:'Excel Bulk Import',href:'/admin/excel-import',icon:'📋'},
              {label:'Blog Import',href:'/admin/blog-import',icon:'📝'},
              {label:'Master Import',href:'/admin/master-import',icon:'⚡'},
              {label:'Pre-Launch Audit',href:'/admin/audit',icon:'🔍'},
              {label:'Write Blog Post',href:'/blog/write',icon:'✍️'},
            ].map(link => (
              <a key={link.href} href={link.href} target="_blank"
                style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'rgba(255,255,255,0.02)',border:'1px solid #1e2f45',borderRadius:'var(--r-xs)',color:'var(--ink-4)',textDecoration:'none',fontSize:12,fontWeight:600}}>
                {link.icon} {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */
  const TABS_CONFIG = [
    {id:'dashboard' as AdminTab,icon:'📊',label:'Dashboard'},
    {id:'leads' as AdminTab,icon:'📞',label:`Leads (${leads.length})`},
    {id:'universities' as AdminTab,icon:'🎓',label:`Universities (${unis.length})`},
    {id:'blog' as AdminTab,icon:'📝',label:`Blog (${posts.length})`},
    {id:'seo' as AdminTab,icon:'🔍',label:'SEO & GEO'},
    {id:'settings' as AdminTab,icon:'⚙️',label:'Settings'},
  ]

  return (
    <div style={{minHeight:'100vh',background:'var(--ink)',display:'flex'}}>

      {/* Sidebar */}
      <div style={{width:200,flexShrink:0,background:'var(--navy)',borderRight:'1px solid #1e2f45',position:'sticky',top:0,height:'100vh',overflowY:'auto'}} className="hidden md:block">
        <div style={{padding:'20px 16px',borderBottom:'1px solid #1e2f45'}}>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:800,color:'#fff'}}>Edify</div>
          <div style={{fontSize:10,color:'var(--ink-2)',marginTop:2}}>Admin Panel</div>
        </div>
        <nav style={{padding:'12px 8px',display:'flex',flexDirection:'column',gap:2}}>
          {TABS_CONFIG.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as AdminTab)}
              style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',borderRadius:'var(--r-sm)',border:'none',background:tab===t.id?'rgba(201,146,42,0.12)':'transparent',color:tab===t.id?'var(--amber)':'var(--ink-3)',fontSize:13,fontWeight:tab===t.id?700:500,cursor:'pointer',textAlign:'left',fontFamily:'inherit',transition:'all 0.1s'}}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div style={{padding:'16px 12px',borderTop:'1px solid #1e2f45',marginTop:'auto'}}>
          <a href="/" target="_blank" className="flex items-center gap-1.5 text-[11px] text-ink-2 no-underline">
            <ExternalLink size={11}/>View Live Site
          </a>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 p-6 overflow-y-auto">
        {/* Mobile tabs */}
        <div className="md:hidden" style={{display:'flex',gap:6,marginBottom:20,overflowX:'auto',paddingBottom:4}}>
          {TABS_CONFIG.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{padding:'8px 14px',borderRadius:'var(--r-xs)',border:'none',background:tab===t.id?'rgba(201,146,42,0.12)':'var(--navy)',color:tab===t.id?'var(--amber)':'var(--ink-3)',fontSize:12,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap' as const,fontFamily:'inherit'}}>
              {t.label}
            </button>
          ))}
        </div>

        {tab==='dashboard' && <DashboardTab/>}
        {tab==='leads' && <LeadsTab/>}
        {tab==='universities' && <UniversitiesTab/>}
        {tab==='blog' && <BlogTab/>}
        {tab==='seo' && <SEOTab/>}
        {tab==='settings' && <SettingsTab/>}
      </div>
    </div>
  )
}
              
