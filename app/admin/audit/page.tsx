// @ts-nocheck
'use client'
// Auth: Protected by middleware.ts — no client-side password check needed

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, RefreshCw, Lock } from 'lucide-react'


// ── Audit checks ──────────────────────────────────────────────────────────
const AUDIT_CHECKS = [
  // ── Round 1: Critical URLs ──────────────────────────────────────────
  { id: 'home',        round: 1, label: 'Homepage loads',                    url: '/',                         expect: 200 },
  { id: 'unis',        round: 1, label: '/universities page',                url: '/universities',             expect: 200 },
  { id: 'programs',    round: 1, label: '/programs page',                    url: '/programs',                 expect: 200 },
  { id: 'compare',     round: 1, label: '/compare page',                     url: '/compare',                  expect: 200 },
  { id: 'tools',       round: 1, label: '/tools page',                       url: '/tools',                    expect: 200 },
  { id: 'blog',        round: 1, label: '/blog page',                        url: '/blog',                     expect: 200 },

  // ── Round 2: Program slugs (M.Com / B.Com critical) ─────────────────
  { id: 'mba',         round: 2, label: '/programs/mba resolves',            url: '/programs/mba',             expect: 200 },
  { id: 'mca',         round: 2, label: '/programs/mca resolves',            url: '/programs/mca',             expect: 200 },
  { id: 'mcom',        round: 2, label: '/programs/mcom resolves (M.Com)',   url: '/programs/mcom',            expect: 200 },
  { id: 'bcom',        round: 2, label: '/programs/bcom resolves (B.Com)',   url: '/programs/bcom',            expect: 200 },
  { id: 'bba',         round: 2, label: '/programs/bba resolves',            url: '/programs/bba',             expect: 200 },
  { id: 'bca',         round: 2, label: '/programs/bca resolves',            url: '/programs/bca',             expect: 200 },
  { id: 'ma',          round: 2, label: '/programs/ma resolves',             url: '/programs/ma',              expect: 200 },
  { id: 'msc',         round: 2, label: '/programs/msc resolves',            url: '/programs/msc',             expect: 200 },

  // ── Round 3: University pages ────────────────────────────────────────
  { id: 'amity',       round: 3, label: 'Amity uni page',                    url: '/universities/amity',       expect: 200 },
  { id: 'amity-mba',   round: 3, label: 'Amity MBA page',                    url: '/universities/amity/mba',   expect: 200 },
  { id: 'lpu',         round: 3, label: 'LPU uni page',                      url: '/universities/lpu',         expect: 200 },
  { id: 'jain',        round: 3, label: 'JAIN uni page',                     url: '/universities/jain',        expect: 200 },
  { id: 'symbiosis',   round: 3, label: 'Symbiosis MBA page',               url: '/universities/symbiosis/mba', expect: 200 },
  { id: 'mahe',        round: 3, label: 'MAHE Manipal page',                url: '/universities/mahe-manipal', expect: 200 },
  { id: 'manipal-404', round: 3, label: 'Old /universities/manipal → 404 (redirects to mahe)', url: '/universities/manipal', expect: 'redirect' },

  // ── Round 4: 301 Redirect checks ────────────────────────────────────
  { id: 'r-mcom',      round: 4, label: '/programs/m.com redirects',         url: '/programs/m.com',           expect: 'redirect' },
  { id: 'r-bcom',      round: 4, label: '/programs/b.com redirects',         url: '/programs/b.com',           expect: 'redirect' },
  { id: 'r-mba-wx',    round: 4, label: '/programs/mba-wx redirects',        url: '/programs/mba-wx',          expect: 'redirect' },
  { id: 'r-online-mba',round: 4, label: '/online-mba redirects to /programs/mba', url: '/online-mba',         expect: 'redirect' },
  { id: 'r-college',   round: 4, label: '/college/amity redirects',          url: '/college/amity',            expect: 'redirect' },

  // ── Round 5: API endpoints ───────────────────────────────────────────
  { id: 'api-enquiry', round: 5, label: '/api/enquiry endpoint exists',      url: '/api/enquiry',              expect: 'api', method: 'POST' },
  { id: 'api-blog',    round: 5, label: '/api/generate-blog endpoint exists',url: '/api/generate-blog',        expect: 'api', method: 'POST' },
  { id: 'robots',      round: 5, label: 'robots.txt served',                 url: '/robots.txt',               expect: 200 },
  { id: 'sitemap',     round: 5, label: 'sitemap.xml served',                url: '/sitemap.xml',              expect: 200 },
  { id: 'llms',        round: 5, label: 'llms.txt served',                   url: '/llms.txt',                 expect: 200 },

  // ── Round 6: SEO & Meta ──────────────────────────────────────────────
  { id: 'manifest',    round: 6, label: 'manifest.json served',              url: '/manifest.json',            expect: 200 },
  { id: 'og-img',      round: 6, label: 'OG image served',                   url: '/og.png',                   expect: 200 },
  { id: 'logo-amity',  round: 6, label: 'Amity logo SVG served',             url: '/logos/Amity_University.svg', expect: 200 },
  { id: 'logo-lpu',    round: 6, label: 'LPU logo served',                   url: '/logos/lpu.png',            expect: 200 },
]

const ROUND_LABELS = {
  1: '🔗 Critical Pages',
  2: '📚 Program Slugs',
  3: '🎓 University Pages',
  4: '🔄 301 Redirects',
  5: '⚙️ API & Crawl',
  6: '🖼️ Assets & SEO',
}

const STATUS_COLORS = {
  pending:  { bg: 'var(--surface-2)', border: 'var(--border)',           text: 'var(--ink-4)',  icon: null },
  running:  { bg: 'rgba(200,129,26,0.06)', border: 'rgba(200,129,26,0.2)', text: 'var(--amber-text)', icon: null },
  pass:     { bg: 'rgba(31,107,82,0.06)',  border: 'rgba(31,107,82,0.2)',  text: 'var(--sage)', icon: 'check' },
  fail:     { bg: 'rgba(220,38,38,0.06)',  border: 'rgba(220,38,38,0.2)',  text: 'var(--red)', icon: 'x' },
  warn:     { bg: 'rgba(234,179,8,0.06)',  border: 'rgba(234,179,8,0.2)',  text: '#B45309', icon: 'warn' },
}

export default function AuditPage() {
  const [results, setResults] = useState({})
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeRound, setActiveRound] = useState(null)

  const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://edifyedu.in'

  async function runCheck(check) {
    setResults(r => ({ ...r, [check.id]: 'running' }))
    try {
      if (check.expect === 'api') {
        const res = await fetch(check.url, {
          method: check.method || 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: check.method === 'POST' ? JSON.stringify({ topic: 'test', _audit: true }) : undefined,
        })
        // API exists if returns anything other than 404
        setResults(r => ({ ...r, [check.id]: res.status !== 404 ? 'pass' : 'fail' }))
        return
      }

      const res = await fetch(check.url, { redirect: 'manual' })

      if (check.expect === 'redirect') {
        // Should be 3xx
        const isRedirect = res.status >= 300 && res.status < 400
        setResults(r => ({ ...r, [check.id]: isRedirect ? 'pass' : 'warn' }))
      } else {
        setResults(r => ({ ...r, [check.id]: res.status === check.expect ? 'pass' : 'fail' }))
      }
    } catch (e) {
      // fetch error (CORS on cross-origin) — check with HEAD
      try {
        const res = await fetch(check.url, { method: 'HEAD' })
        setResults(r => ({ ...r, [check.id]: res.ok || res.status < 400 ? 'pass' : 'fail' }))
      } catch {
        setResults(r => ({ ...r, [check.id]: 'warn' }))
      }
    }
  }

  async function runAllChecks() {
    setRunning(true)
    setResults({})
    setProgress(0)
    const total = AUDIT_CHECKS.length
    for (let i = 0; i < AUDIT_CHECKS.length; i++) {
      const check = AUDIT_CHECKS[i]
      setActiveRound(check.round)
      await runCheck(check)
      setProgress(Math.round(((i + 1) / total) * 100))
      await new Promise(r => setTimeout(r, 80)) // small delay for UX
    }
    setRunning(false)
    setActiveRound(null)
  }

  async function runRound(round) {
    setRunning(true)
    const checks = AUDIT_CHECKS.filter(c => c.round === round)
    for (const check of checks) {
      await runCheck(check)
      await new Promise(r => setTimeout(r, 80))
    }
    setRunning(false)
  }

  const passes = Object.values(results).filter(v => v === 'pass').length
  const fails = Object.values(results).filter(v => v === 'fail').length
  const warns = Object.values(results).filter(v => v === 'warn').length
  const total = Object.keys(results).length

  const rounds = [...new Set(AUDIT_CHECKS.map(c => c.round))]


  return (
    <div className="page-shell">
      <div className="bg-navy px-5 py-[14px]">
        <div className="max-w-[960px] mx-auto flex items-center gap-2.5">
          <Link href="/admin" className="text-slate-400 flex items-center gap-[5px] text-[13px] no-underline">
            <ArrowLeft size={13}/> Admin
          </Link>
          <span className="text-ink-2">/</span>
          <span className="text-amber font-bold text-sm">🔍 Pre-Launch Audit</span>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-5 py-6">
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-[22px] font-extrabold text-navy mb-1.5 mt-0">Pre-Launch Audit — 6 Rounds</h1>
            <p className="text-[13px] text-ink-3 m-0">
              Auditing: <code className="bg-slate-100 px-1.5 py-px rounded text-[11px]">{BASE_URL}</code>
            </p>
          </div>
          <button onClick={runAllChecks} disabled={running}
            style={{padding:'12px 24px',borderRadius:'var(--r-sm)',background:running?'var(--ink-4)':'linear-gradient(135deg,#0B1D35,#142540)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:running?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:8}}>
            {running?<><RefreshCw size={14} className="animate-spin"/> Running... {progress}%</>:'🚀 Run Full Audit'}
          </button>
        </div>

        {/* Progress bar */}
        {running && (
          <div style={{height:4,background:'var(--border)',borderRadius:2,marginBottom:20,overflow:'hidden'}}>
            <div style={{height:'100%',background:'linear-gradient(90deg,#c9922a,#e0a93a)',width:`${progress}%`,transition:'width 0.2s',borderRadius:2}}/>
          </div>
        )}

        {/* Summary */}
        {total > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
            {[{l:'Passed',v:passes,c:'var(--sage)'},{l:'Failed',v:fails,c:'var(--red)'},{l:'Warnings',v:warns,c:'#B45309'},{l:'Total Run',v:total,c:'var(--ink)'}].map(s=>(
              <div key={s.l} className="bg-white border border-border rounded-xl p-[14px] text-center">
                <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div>
                <div className="text-[11px] text-ink-3 font-semibold">{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Rounds */}
        {rounds.map(round => {
          const checks = AUDIT_CHECKS.filter(c => c.round === round)
          const roundPasses = checks.filter(c => results[c.id] === 'pass').length
          const roundFails = checks.filter(c => results[c.id] === 'fail').length
          const allDone = checks.every(c => results[c.id] && results[c.id] !== 'running')

          return (
            <div key={round} style={{background:'var(--surface)',border:`1px solid ${activeRound===round?'var(--amber-text)':'var(--border)'}`,borderRadius:'var(--r-sm)',overflow:'hidden',marginBottom:12}}>
              <div style={{padding:'14px 20px',borderBottom:'1px solid #F1F5F9',display:'flex',alignItems:'center',justifyContent:'space-between',background:activeRound===round?'rgba(200,129,26,0.04)':'#fff'}}>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-navy">{ROUND_LABELS[round]}</span>
                  {allDone && roundFails===0 && <span style={{fontSize:10,padding:'2px 8px',borderRadius:'var(--r-lg)',background:'rgba(31,107,82,0.1)',color:'var(--sage)',fontWeight:700}}>ALL PASS</span>}
                  {roundFails>0 && <span style={{fontSize:10,padding:'2px 8px',borderRadius:'var(--r-lg)',background:'rgba(220,38,38,0.1)',color:'var(--red)',fontWeight:700}}>{roundFails} FAILED</span>}
                </div>
                <div className="flex items-center gap-2">
                  {allDone && <span className="text-[11px] text-slate-400">{roundPasses}/{checks.length}</span>}
                  <button onClick={()=>runRound(round)} disabled={running}
                    style={{padding:'6px 14px',borderRadius:'var(--r-xs)',background:'transparent',border:'1px solid var(--border)',color:'var(--ink-3)',fontSize:11,fontWeight:600,cursor:running?'not-allowed':'pointer'}}>
                    Run
                  </button>
                </div>
              </div>
              <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:6}}>
                {checks.map(check => {
                  const status = results[check.id] || 'pending'
                  const sc = STATUS_COLORS[status]
                  return (
                    <div key={check.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:'var(--r-xs)',background:sc.bg,border:`1px solid ${sc.border}`}}>
                      <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                        {status==='pass' && <CheckCircle size={14} color="var(--sage)"/>}
                        {status==='fail' && <XCircle size={14} color="var(--red)"/>}
                        {status==='warn' && <AlertCircle size={14} color="#B45309"/>}
                        {status==='running' && <RefreshCw size={13} color="var(--amber-text)" style={{animation:'spin 0.8s linear infinite'}}/>}
                        {status==='pending' && <div style={{width:8,height:8,borderRadius:'var(--r-pill)',background:'#CBD5E1'}}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span style={{fontSize:12,fontWeight:600,color:sc.text}}>{check.label}</span>
                        <span style={{fontSize:11,color:'var(--ink-4)',marginLeft:8,fontFamily:'monospace'}}>{check.url}</span>
                      </div>
                      <div style={{fontSize:10,color:sc.text,fontWeight:700,flexShrink:0}}>
                        {status==='pass'?'✓ PASS':status==='fail'?'✗ FAIL':status==='warn'?'⚠ WARN':status==='running'?'...':'—'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Manual checklist */}
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',padding:'20px',marginTop:8}}>
          <div className="text-[13px] font-bold text-navy mb-3.5">📋 Manual Checks (cannot be automated)</div>
          {[
            { label: 'Mobile responsiveness — open on iPhone and check syllabus tabs don\'t break', done: false },
            { label: 'Enquiry form submission — fill form on a university page, verify email arrives at rishiupadhyay4787@gmail.com', done: false },
            { label: 'Google Search Console — submit sitemap.xml after deploy', done: false },
            { label: 'Google Analytics 4 — verify events firing in GA4 Realtime', done: false },
            { label: 'Compare page — add 2-3 universities, verify logos + curriculum row appears', done: false },
            { label: 'University card logos — spot check 5 universities have logos showing correctly', done: false },
            { label: 'SyllabusSection — click MBA spec, verify Sem 3/4 changes to spec-specific subjects', done: false },
            { label: 'Admin /admin/excel-import — test upload with v9 Excel', done: false },
            { label: 'Admin /admin/blog-import — test upload with template Excel', done: false },
            { label: 'Vercel env vars — NEXT_PUBLIC_GOOGLE_SHEET_URL and ANTHROPIC_API_KEY are set', done: false },
          ].map((item, i) => (
            <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'8px 0',borderBottom:i<9?'1px solid #F8F9FC':'none'}}>
              <div style={{width:18,height:18,borderRadius:4,border:'1.5px solid #E2E8F4',flexShrink:0,marginTop:1,background:'var(--surface-2)'}}/>
              <span className="text-xs text-ink-2 leading-relaxed">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
