// @ts-nocheck
'use client'

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
  Globe, Search, AlertCircle, ArrowRight, ExternalLink
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
  '#F59E0B','#1A2F4E','#0891B2','#7C3AED','#DC2626','#059669',
  '#9333EA','#D97706','#4F46E5','#0369A1','#C2410C','#0F766E',
]
const BLOG_CATEGORIES = [
  'MBA Guides','MCA Guides','BBA Guides','BCA Guides','Validity & Recognition',
  'Career Guides','University Reviews','Fees & Finance','City Guides','Comparison'
]

type AdminTab = 'dashboard' | 'universities' | 'blog' | 'seo'
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
    <label style={{display:'block',fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase' as const,letterSpacing:'0.06em',marginBottom:5}}>
      {text}{required && <span style={{color:'#DC2626',marginLeft:2}}>*</span>}
    </label>
  ),
  input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1px solid #E2E8F4',fontSize:13,color:'#0B1D35',outline:'none',fontFamily:'inherit',boxSizing:'border-box' as const,...(props.style||{})}} />
  ),
  textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1px solid #E2E8F4',fontSize:13,color:'#0B1D35',outline:'none',fontFamily:'inherit',resize:'vertical' as const,lineHeight:1.6,boxSizing:'border-box' as const,...(props.style||{})}} />
  ),
  select: (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1px solid #E2E8F4',fontSize:13,color:'#0B1D35',outline:'none',fontFamily:'inherit',background:'#fff',boxSizing:'border-box' as const,...(props.style||{})}} />
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

  /* ── Auth ── */
  if (!authed) return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#0a1220,#0f1b2d)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#162032',border:'1px solid #1e2f45',borderRadius:20,padding:40,width:'100%',maxWidth:380,textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:12}}>🎓</div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:800,color:'#fff',marginBottom:4}}>Edify Admin</div>
        <div style={{fontSize:12,color:'#64748b',marginBottom:28}}>edifyedu.in — Content Management</div>
        <div style={{position:'relative',marginBottom:12}}>
          <input type={showPw?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'){if(pw===ADMIN_PASSWORD){setAuthed(true)}else{setPwError(true)}}}}
            placeholder="Admin password" autoFocus
            style={{width:'100%',padding:'13px 44px 13px 16px',borderRadius:12,border:`1.5px solid ${pwError?'#DC2626':'#1e2f45'}`,background:'#0f1b2d',color:'#fff',fontSize:14,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}} />
          <button onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#64748b'}}>
            {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
          </button>
        </div>
        {pwError && <div style={{fontSize:12,color:'#DC2626',marginBottom:10}}>Wrong password</div>}
        <button onClick={()=>{if(pw===ADMIN_PASSWORD){setAuthed(true);setPwError(false)}else{setPwError(true)}}}
          style={{width:'100%',padding:13,borderRadius:12,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}>
          <Lock size={14} style={{display:'inline',marginRight:6}}/>Login
        </button>
      </div>
    </div>
  )

  /* ── Copy helper ── */
  function copyJSON(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(()=>setCopied(null),2000)
  }

  /* ── Dashboard stats ── */
  const publishedPosts = posts.filter(p=>p.status==='published').length
  const draftPosts = posts.filter(p=>p.status==='draft').length
  const totalEnquiries = 0 // placeholder

  /* ─────────────────────────────────────────────────────────
     DASHBOARD TAB
  ───────────────────────────────────────────────────────── */
  function DashboardTab() {
    return (
      <div style={{display:'flex',flexDirection:'column',gap:24}}>
        <div>
          <h2 style={{fontSize:'1.3rem',fontWeight:800,color:'#fff',marginBottom:4}}>Welcome back 👋</h2>
          <p style={{fontSize:13,color:'#64748b'}}>Edify Admin Panel — manage universities, blogs, and SEO.</p>
        </div>

        {/* Stats grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12}}>
          {[
            {icon:'🎓',label:'Universities',value:unis.length,sub:'UGC DEB verified',color:'#c9922a'},
            {icon:'📝',label:'Published Posts',value:publishedPosts,sub:`${draftPosts} drafts`,color:'#4ade80'},
            {icon:'🔍',label:'Programs',value:11,sub:'MBA to BSc',color:'#60a5fa'},
            {icon:'📊',label:'Specialisations',value:'100+',sub:'across all programs',color:'#a78bfa'},
          ].map(s=>(
            <div key={s.label} style={{background:'#162032',border:'1px solid #1e2f45',borderRadius:14,padding:18}}>
              <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
              <div style={{fontSize:26,fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{fontSize:12,fontWeight:700,color:'#fff',marginTop:2}}>{s.label}</div>
              <div style={{fontSize:11,color:'#475569',marginTop:2}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{background:'#162032',border:'1px solid #1e2f45',borderRadius:16,padding:20}}>
          <div style={{fontSize:11,fontWeight:700,color:'#c9922a',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:14}}>Quick Actions</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
            {[
              {icon:'✍️',label:'Write New Blog Post',desc:'Create and publish a blog',action:()=>setTab('blog')},
              {icon:'🎓',label:'Add University',desc:'Add a new institution',action:()=>{setTab('universities');setEditUni(emptyUni());setIsNewUni(true)}},
              {icon:'🔗',label:'SEO & Meta',desc:'Keywords and structured data',action:()=>setTab('seo')},
              {icon:'📖',label:'View Blog Posts',desc:`${publishedPosts} live, ${draftPosts} drafts`,action:()=>setTab('blog')},
            ].map(a=>(
              <button key={a.label} onClick={a.action}
                style={{display:'flex',gap:12,alignItems:'flex-start',padding:'14px 16px',background:'#0f1b2d',border:'1px solid #1e2f45',borderRadius:12,cursor:'pointer',textAlign:'left',width:'100%',fontFamily:'inherit'}}>
                <span style={{fontSize:20,flexShrink:0}}>{a.icon}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>{a.label}</div>
                  <div style={{fontSize:11,color:'#475569',marginTop:2}}>{a.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Customer Journey Insights */}
        <div style={{background:'#162032',border:'1px solid #1e2f45',borderRadius:16,padding:20}}>
          <div style={{fontSize:11,fontWeight:700,color:'#c9922a',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:14}}>
            🧠 Customer Journey Strategy
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[
              {step:'1',icon:'🔍',title:'Awareness — Google Search',desc:'Student searches "best online MBA India 2025". Your blog post appears. They click in.'},
              {step:'2',icon:'📖',title:'Interest — Blog / Program Page',desc:'They read your honest guide. No hype. Specific salary data builds trust. They explore universities.'},
              {step:'3',icon:'⚖️',title:'Comparison — Compare Tool',desc:'They compare 2–3 universities. Fee tables, NIRF ranks, exam modes. Rational confidence grows.'},
              {step:'4',icon:'🎯',title:'Intent — University Page',desc:'They read "Right for you if..." and "Think twice if..." — honest framing feels trustworthy.'},
              {step:'5',icon:'💬',title:'Enquiry — CTA Trigger',desc:'Free Counselling CTA. No obligation framing. Psychological safety → form submitted.'},
              {step:'6',icon:'📞',title:'Conversion — Follow Up',desc:'You call within 24 hours. Reference their specific program + budget. Close.'},
            ].map(s=>(
              <div key={s.step} style={{display:'flex',gap:14,alignItems:'flex-start',padding:'12px 14px',background:'#0f1b2d',borderRadius:10,border:'1px solid #1e2f45'}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'#c9922a',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{fontSize:11,fontWeight:800,color:'#fff'}}>{s.step}</span>
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>{s.icon} {s.title}</div>
                  <div style={{fontSize:12,color:'#64748b',lineHeight:1.6,marginTop:2}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:14,padding:'12px 14px',background:'rgba(201,146,42,0.08)',borderRadius:10,border:'1px solid rgba(201,146,42,0.2)',fontSize:12,color:'#94a3b8',lineHeight:1.7}}>
            <strong style={{color:'#c9922a'}}>💡 Key insight:</strong> Students don&apos;t enquire because they feel pressured — they enquire because they feel <em>understood</em>. Your &quot;Think twice if&quot; section builds more trust than any sales pitch.
          </div>
        </div>

        {/* Recent posts */}
        <div style={{background:'#162032',border:'1px solid #1e2f45',borderRadius:16,padding:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'#c9922a',textTransform:'uppercase',letterSpacing:'0.08em'}}>Recent Blog Posts</div>
            <button onClick={()=>setTab('blog')} style={{fontSize:12,color:'#c9922a',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>View all →</button>
          </div>
          {posts.slice(0,5).map(p=>(
            <div key={p.slug} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid #1e2f45',fontSize:12}}>
              <div>
                <div style={{color:'#fff',fontWeight:600,marginBottom:2}}>{p.title.slice(0,60)}{p.title.length>60?'...':''}</div>
                <div style={{color:'#475569'}}>{p.category} · {p.publishedAt}</div>
              </div>
              <span style={{padding:'2px 8px',borderRadius:999,fontSize:10,fontWeight:700,background:p.status==='published'?'rgba(74,222,128,0.1)':'rgba(148,163,184,0.1)',color:p.status==='published'?'#4ade80':'#94a3b8',flexShrink:0,marginLeft:10}}>
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
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:200,position:'relative'}}>
            <Search size={14} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'#475569'}}/>
            <input value={uniSearch} onChange={e=>setUniSearch(e.target.value)} placeholder={`Search ${unis.length} universities...`}
              style={{width:'100%',paddingLeft:34,paddingRight:12,paddingTop:9,paddingBottom:9,borderRadius:10,border:'1px solid #1e2f45',background:'#0f1b2d',color:'#fff',fontSize:13,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}} />
          </div>
          <button onClick={()=>{setEditUni(emptyUni());setIsNewUni(true)}}
            style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:10,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:'pointer'}}>
            <Plus size={14}/>Add University
          </button>
        </div>
        <div style={{fontSize:11,color:'#475569'}}>Showing {filtered.length} of {unis.length} universities. All are govtRecognised:true (UGC DEB 2020 parity)</div>

        {editUni && <UniEditor uni={editUni} isNew={isNewUni} onClose={()=>{setEditUni(null);setIsNewUni(false)}} onSave={(u)=>{
          if(isNewUni) setUnis([...unis,u as University])
          else setUnis(unis.map(x=>x.id===u.id?u as University:x))
          setEditUni(null);setIsNewUni(false)
        }}/>}

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
          {filtered.map(u=>(
            <div key={u.id} style={{background:'#162032',border:'1px solid #1e2f45',borderRadius:12,overflow:'hidden'}}>
              <div style={{height:3,background:u.color}}/>
              <div style={{padding:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div style={{flex:1,minWidth:0,paddingRight:8}}>
                    <div style={{fontWeight:700,color:'#fff',fontSize:13}}>{u.name}</div>
                    <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{u.city}, {u.state} · NIRF #{u.nirf} · {u.naac}</div>
                  </div>
                  <button onClick={()=>{setEditUni({...u});setIsNewUni(false)}}
                    style={{background:'rgba(201,146,42,0.1)',border:'1px solid rgba(201,146,42,0.2)',borderRadius:8,padding:'5px 10px',color:'#c9922a',cursor:'pointer',fontSize:11,fontWeight:600,flexShrink:0}}>
                    Edit
                  </button>
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {u.programs.slice(0,4).map(p=>(
                    <span key={p} style={{fontSize:10,padding:'2px 7px',borderRadius:999,background:'rgba(255,255,255,0.05)',color:'#94a3b8',border:'1px solid #1e2f45'}}>{p}</span>
                  ))}
                  {u.programs.length>4 && <span style={{fontSize:10,color:'#475569'}}>+{u.programs.length-4}</span>}
                </div>
                <div style={{marginTop:8,display:'flex',justifyContent:'space-between',fontSize:11,color:'#475569'}}>
                  <span>Fees: {(u.feeMin/100000).toFixed(1)}L – {(u.feeMax/100000).toFixed(1)}L</span>
                  <span style={{color:'#4ade80'}}>✓ UGC DEB Valid</span>
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
      <div style={{background:'#0f1b2d',border:'2px solid #c9922a',borderRadius:16,overflow:'hidden',marginBottom:8}}>
        <div style={{padding:'14px 20px',background:'rgba(201,146,42,0.08)',borderBottom:'1px solid #1e2f45',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:700,color:'#fff',fontSize:15}}>{isNew?'Add New University':'Edit: '+data.name}</div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>copyJSON(generateCode(),'uni')}
              style={{display:'flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid #1e2f45',color:'#94a3b8',cursor:'pointer',fontSize:12,fontWeight:600}}>
              {copied==='uni'?<><CheckCircle size={12}/>Copied!</>:<><Copy size={12}/>Export JSON</>}
            </button>
            <button onClick={()=>onSave(data)}
              style={{display:'flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:8,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,border:'none'}}>
              <Save size={12}/>{isNew?'Add':'Save'}
            </button>
            <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#64748b'}}><X size={18}/></button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{display:'flex',padding:'0 20px',borderBottom:'1px solid #1e2f45',background:'#0a1220',overflowX:'auto'}}>
          {TABS_LIST.map(t=>(
            <button key={t.id} onClick={()=>setEditTab(t.id)}
              style={{padding:'10px 16px',fontSize:12,fontWeight:600,cursor:'pointer',border:'none',background:'transparent',color:editTab===t.id?'#c9922a':'#475569',borderBottom:editTab===t.id?'2px solid #c9922a':'2px solid transparent',whiteSpace:'nowrap' as const,fontFamily:'inherit'}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{padding:20,display:'flex',flexDirection:'column',gap:14}}>
          {editTab==='basic' && <>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>{F.label('University ID *',true)}{F.input({value:data.id||'',onChange:e=>up('id',e.target.value),placeholder:'manipal-university-jaipur'})}</div>
              <div>{F.label('Short Name (Abbr) *',true)}{F.input({value:data.abbr||'',onChange:e=>up('abbr',e.target.value),placeholder:'MUJ'})}</div>
            </div>
            <div>{F.label('Full University Name *',true)}{F.input({value:data.name||'',onChange:e=>up('name',e.target.value),placeholder:'Manipal University Jaipur'})}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              <div>{F.label('City *')}{F.input({value:data.city||'',onChange:e=>up('city',e.target.value)})}</div>
              <div>{F.label('State *')}{F.input({value:data.state||'',onChange:e=>up('state',e.target.value)})}</div>
              <div>{F.label('Region')}{F.select({value:data.region||'North',onChange:e=>up('region',e.target.value),children:REGIONS.map(r=><option key={r} value={r}>{r}</option>)})}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              <div>{F.label('NIRF Overall Rank')}{F.input({type:'number',value:data.nirf||'',onChange:e=>up('nirf',+e.target.value)})}</div>
              <div>{F.label('NAAC Grade')}{F.select({value:data.naac||'A+',onChange:e=>up('naac',e.target.value),children:NAAC_GRADES.map(g=><option key={g} value={g}>{g}</option>)})}</div>
              <div>{F.label('Exam Mode')}{F.select({value:data.examMode||'Online',onChange:e=>up('examMode',e.target.value),children:EXAM_MODES.map(m=><option key={m} value={m}>{m}</option>)})}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>{F.label('Eligibility')}{F.input({value:data.eligibility||'',onChange:e=>up('eligibility',e.target.value),placeholder:'50% in graduation'})}</div>
              <div>{F.label('Eligibility %')}{F.input({type:'number',value:data.eligibilityPct||50,onChange:e=>up('eligibilityPct',+e.target.value)})}</div>
            </div>
            <div style={{padding:'12px 14px',background:'rgba(74,222,128,0.05)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:10,fontSize:12,color:'#94a3b8',lineHeight:1.7}}>
              <span style={{color:'#4ade80',fontWeight:700}}>✓ Note:</span> All UGC DEB approved universities are automatically set as <code style={{background:'#0f1b2d',padding:'1px 5px',borderRadius:4,fontSize:11}}>govtRecognised: true</code> per MOE 2020 notification. Online degrees are treated on par with regular degrees.
            </div>
          </>}

          {editTab==='fees' && <>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              <div>{F.label('Min Fee (₹)')}{F.input({type:'number',value:data.feeMin||'',onChange:e=>up('feeMin',+e.target.value),placeholder:'100000'})}</div>
              <div>{F.label('Max Fee (₹)')}{F.input({type:'number',value:data.feeMax||'',onChange:e=>up('feeMax',+e.target.value),placeholder:'200000'})}</div>
              <div>{F.label('EMI From (₹/mo)')}{F.input({type:'number',value:data.emiFrom||'',onChange:e=>up('emiFrom',+e.target.value),placeholder:'5000'})}</div>
            </div>
            <div style={{padding:'12px 14px',background:'rgba(201,146,42,0.06)',border:'1px solid rgba(201,146,42,0.15)',borderRadius:10,fontSize:12,color:'#94a3b8'}}>
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
                <div key={i} style={{display:'flex',gap:8,marginBottom:6,alignItems:'center'}}>
                  <span style={{fontSize:12,color:'#4ade80',flexShrink:0}}>✓</span>
                  {F.input({value:item,onChange:e=>{const a=[...(data.forWho||[])];a[i]=e.target.value;up('forWho',a)},placeholder:`e.g. Working professionals who can't take breaks`})}
                </div>
              ))}
            </div>
            <div>
              {F.label('"Think twice if" — honest caveats (no competitor names)')}
              <div style={{fontSize:11,color:'#64748b',marginBottom:6}}>Use location, exam format, budget as reasons — never name competing universities</div>
              {(data.notFor||['','']).map((item,i)=>(
                <div key={i} style={{display:'flex',gap:8,marginBottom:6,alignItems:'center'}}>
                  <span style={{fontSize:12,color:'#DC2626',flexShrink:0}}>✗</span>
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
                    <label key={opt} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:checked?'rgba(201,146,42,0.08)':'#162032',border:`1px solid ${checked?'rgba(201,146,42,0.3)':'#1e2f45'}`,borderRadius:8,cursor:'pointer',fontSize:12,color:checked?'#c9922a':'#94a3b8'}}>
                      <input type="checkbox" checked={checked} onChange={()=>{
                        const a=[...(data.approvals||[])]
                        checked?a.splice(a.indexOf(opt),1):a.push(opt)
                        up('approvals',a)
                      }} style={{accentColor:'#c9922a'}}/>
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
                  <label key={prog} style={{display:'flex',alignItems:'center',gap:7,padding:'8px 12px',background:checked?'rgba(74,222,128,0.08)':'#162032',border:`1px solid ${checked?'rgba(74,222,128,0.2)':'#1e2f45'}`,borderRadius:8,cursor:'pointer',fontSize:12,color:checked?'#4ade80':'#94a3b8'}}>
                    <input type="checkbox" checked={checked} onChange={()=>{
                      const a=[...(data.programs||[])]
                      checked?a.splice(a.indexOf(prog),1):a.push(prog as Program)
                      up('programs',a)
                    }} style={{accentColor:'#4ade80'}}/>
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
                    style={{width:36,height:36,borderRadius:10,background:c,border:`3px solid ${data.color===c?'#fff':'transparent'}`,cursor:'pointer',boxShadow:data.color===c?'0 0 0 2px #c9922a':'none'}}/>
                ))}
                <input type="color" value={data.color||'#F59E0B'} onChange={e=>up('color',e.target.value)}
                  style={{width:36,height:36,borderRadius:10,border:'none',cursor:'pointer',padding:2}}/>
              </div>
              <div style={{marginTop:12,padding:14,background:'#162032',borderRadius:10,border:'1px solid #1e2f45',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,borderRadius:8,background:data.color||'#F59E0B'}}/>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:'#fff'}}>{data.name||'University Name'}</div>
                  <div style={{fontSize:11,color:'#64748b'}}>{data.city||'City'} · NIRF #{data.nirf||'—'}</div>
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
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <div style={{padding:'14px 18px',background:'rgba(74,222,128,0.05)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:12,fontSize:13,color:'#94a3b8',lineHeight:1.7}}>
          <strong style={{color:'#4ade80'}}>✏️ How to publish a new blog post:</strong> Click &quot;Write New Post&quot; → fill in title, content, FAQs → click &quot;Copy Code&quot; → paste into <code style={{background:'#0f1b2d',padding:'1px 6px',borderRadius:4,fontSize:11}}>lib/blog.ts</code> → save → redeploy. Your post goes live immediately.
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
          <div style={{flex:1,minWidth:200,position:'relative'}}>
            <Search size={14} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'#475569'}}/>
            <input value={postSearch} onChange={e=>setPostSearch(e.target.value)} placeholder="Search posts..."
              style={{width:'100%',paddingLeft:34,paddingRight:12,paddingTop:9,paddingBottom:9,borderRadius:10,border:'1px solid #1e2f45',background:'#0f1b2d',color:'#fff',fontSize:13,outline:'none',fontFamily:'inherit',boxSizing:'border-box' as const}} />
          </div>
          <a href="/blog/write" target="_blank"
            style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:10,background:'linear-gradient(135deg,#c9922a,#e0a93a)',color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none'}}>
            <Plus size={14}/>Write New Post
          </a>
        </div>

        {/* Blog SEO tips */}
        <div style={{background:'#162032',border:'1px solid #1e2f45',borderRadius:14,padding:16}}>
          <div style={{fontSize:11,fontWeight:700,color:'#c9922a',textTransform:'uppercase',marginBottom:10}}>📈 Blog SEO Strategy — What Gets Traffic</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:8}}>
            {[
              {type:'🔥 High Intent',example:'NMIMS vs Manipal Online MBA 2025',why:'Students actively comparing → high conversion'},
              {type:'📍 Location',example:'Best online MBA for Pune professionals',why:'Local searches + high trust for nearby students'},
              {type:'💰 Budget',example:'Online MBA under ₹1 lakh India',why:'Price-sensitive majority → huge search volume'},
              {type:'✅ Validity',example:'Is online MBA valid for PSU jobs?',why:'Anxiety-driven searches → very high intent'},
              {type:'🎯 Career',example:'Online MBA for IT professionals 2025',why:'Role-specific → ready to apply, high conversion'},
              {type:'⭐ Reviews',example:'Amity Online MBA honest review 2025',why:'Trust builders → read by comparison shoppers'},
            ].map(tip=>(
              <div key={tip.type} style={{padding:'10px 12px',background:'#0f1b2d',borderRadius:10,border:'1px solid #1e2f45'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#fff',marginBottom:4}}>{tip.type}</div>
                <div style={{fontSize:11,color:'#c9922a',marginBottom:4}}>&quot;{tip.example}&quot;</div>
                <div style={{fontSize:11,color:'#475569',lineHeight:1.5}}>{tip.why}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {filtered.map(post=>(
            <div key={post.slug} style={{background:'#162032',border:'1px solid #1e2f45',borderRadius:12,padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap' as const}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,color:'#fff',fontSize:13,marginBottom:3}}>{post.title}</div>
                <div style={{fontSize:11,color:'#475569'}}>{post.category} · {post.readTime} min · {post.publishedAt} · <span style={{color:'#64748b'}}>/blog/{post.slug}</span></div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                <span style={{padding:'3px 10px',borderRadius:999,fontSize:11,fontWeight:700,background:post.status==='published'?'rgba(74,222,128,0.1)':'rgba(148,163,184,0.1)',color:post.status==='published'?'#4ade80':'#94a3b8'}}>
                  {post.status}
                </span>
                <a href={`/blog/${post.slug}`} target="_blank"
                  style={{fontSize:11,color:'#c9922a',textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>
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
      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        <div style={{background:'#162032',border:'1px solid #1e2f45',borderRadius:16,padding:20}}>
          <div style={{fontSize:11,fontWeight:700,color:'#c9922a',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:14}}>🔍 SEO Health Overview</div>
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
              <div style={{width:18,height:18,borderRadius:'50%',background:'#15803D',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <CheckCircle size={10} color="#fff"/>
              </div>
              <span style={{color:'#94a3b8'}}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{background:'#162032',border:'1px solid #1e2f45',borderRadius:16,padding:20}}>
          <div style={{fontSize:11,fontWeight:700,color:'#c9922a',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:14}}>📋 Action Items for Better SEO</div>
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
              <span style={{padding:'2px 7px',borderRadius:999,fontSize:10,fontWeight:700,background:item.priority==='High'?'rgba(220,38,38,0.15)':item.priority==='Med'?'rgba(201,146,42,0.15)':'rgba(148,163,184,0.1)',color:item.priority==='High'?'#f87171':item.priority==='Med'?'#c9922a':'#94a3b8',flexShrink:0,whiteSpace:'nowrap' as const}}>{item.priority}</span>
              <span style={{color:'#94a3b8',lineHeight:1.5}}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{background:'#162032',border:'1px solid #1e2f45',borderRadius:16,padding:20}}>
          <div style={{fontSize:11,fontWeight:700,color:'#c9922a',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:14}}>🤖 AI SEO / GEO (Generative Engine Optimization)</div>
          <p style={{fontSize:13,color:'#94a3b8',lineHeight:1.7,marginBottom:14}}>
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
              <div style={{width:16,height:16,borderRadius:'50%',background:item.check?'#15803D':'#475569',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {item.check?<CheckCircle size={9} color="#fff"/>:<span style={{fontSize:8,color:'#fff'}}>–</span>}
              </div>
              <span style={{color:item.check?'#94a3b8':'#64748b'}}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */
  const TABS_CONFIG = [
    {id:'dashboard' as AdminTab,icon:'📊',label:'Dashboard'},
    {id:'universities' as AdminTab,icon:'🎓',label:`Universities (${unis.length})`},
    {id:'blog' as AdminTab,icon:'📝',label:`Blog (${posts.length})`},
    {id:'seo' as AdminTab,icon:'🔍',label:'SEO & GEO'},
  ]

  return (
    <div style={{minHeight:'100vh',background:'#0a1220',display:'flex'}}>

      {/* Sidebar */}
      <div style={{width:200,flexShrink:0,background:'#0f1b2d',borderRight:'1px solid #1e2f45',position:'sticky',top:0,height:'100vh',overflowY:'auto'}} className="hidden md:block">
        <div style={{padding:'20px 16px',borderBottom:'1px solid #1e2f45'}}>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:800,color:'#fff'}}>Edify</div>
          <div style={{fontSize:10,color:'#475569',marginTop:2}}>Admin Panel</div>
        </div>
        <nav style={{padding:'12px 8px',display:'flex',flexDirection:'column',gap:2}}>
          {TABS_CONFIG.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as AdminTab)}
              style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',borderRadius:10,border:'none',background:tab===t.id?'rgba(201,146,42,0.12)':'transparent',color:tab===t.id?'#c9922a':'#64748b',fontSize:13,fontWeight:tab===t.id?700:500,cursor:'pointer',textAlign:'left',fontFamily:'inherit',transition:'all 0.1s'}}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div style={{padding:'16px 12px',borderTop:'1px solid #1e2f45',marginTop:'auto'}}>
          <a href="/" target="_blank" style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'#475569',textDecoration:'none'}}>
            <ExternalLink size={11}/>View Live Site
          </a>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,minWidth:0,padding:24,overflowY:'auto'}}>
        {/* Mobile tabs */}
        <div className="md:hidden" style={{display:'flex',gap:6,marginBottom:20,overflowX:'auto',paddingBottom:4}}>
          {TABS_CONFIG.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{padding:'8px 14px',borderRadius:8,border:'none',background:tab===t.id?'rgba(201,146,42,0.12)':'#0f1b2d',color:tab===t.id?'#c9922a':'#64748b',fontSize:12,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap' as const,fontFamily:'inherit'}}>
              {t.label}
            </button>
          ))}
        </div>

        {tab==='dashboard' && <DashboardTab/>}
        {tab==='universities' && <UniversitiesTab/>}
        {tab==='blog' && <BlogTab/>}
        {tab==='seo' && <SEOTab/>}
      </div>
    </div>
  )
}
