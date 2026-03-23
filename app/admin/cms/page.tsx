// @ts-nocheck
'use client'
// Auth: Protected by middleware.ts

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  RefreshCw, CheckCircle, XCircle, AlertCircle, Globe, ArrowLeft,
  FileSpreadsheet, Image, Database, BookOpen, Map, Settings,
  ChevronDown, ChevronRight, ExternalLink, Clock, Eye, Zap,
  Shield, List, ToggleLeft, Info
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'checking' | 'fetching' | 'validating' | 'syncing' | 'done' | 'error'
interface StatusData { connected: boolean; counts: Record<string, number>; spreadsheetTitle?: string; updatedAt?: string; error?: string }
interface ValidationResult { valid: boolean; summary: string; errors: any[]; warnings: any[]; counts: Record<string, number>; rawCounts: Record<string, number> }
interface SyncResult { ok: boolean; message: string; files?: any[]; failedFiles?: string[]; log: string[]; deployUrl?: string }

// ── Helpers ───────────────────────────────────────────────────────────────────
const SHEET_URL = process.env.NEXT_PUBLIC_CMS_SHEET_URL || ''
const IS_CONFIGURED = Boolean(SHEET_URL && SHEET_URL !== 'your-gas-web-app-url-here')

function relative(iso?: string) {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000)   return 'Just now'
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`
  return new Date(iso).toLocaleDateString('en-IN')
}

function Badge({ n, label, icon: Icon, color }: { n: number; label: string; icon: any; color: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: 'var(--r-xs)', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>{n ?? '—'}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}

function LogLine({ line }: { line: string }) {
  const isErr  = line.startsWith('❌')
  const isWarn = line.startsWith('⚠')
  const isOK   = line.startsWith('✓')
  return (
    <div style={{ fontSize: 12, fontFamily: 'monospace', color: isErr ? 'var(--red)' : isWarn ? 'var(--warning)' : isOK ? 'var(--sage)' : 'var(--ink-2)', padding: '2px 0', lineHeight: 1.6 }}>
      {line}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CMSDashboard() {
  const [phase, setPhase]           = useState<Phase>('idle')
  const [status, setStatus]         = useState<StatusData | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [logoTests, setLogoTests]   = useState<Record<string, any>>({})
  const [logLines, setLogLines]     = useState<string[]>([])
  const [registry, setRegistry]     = useState<any[]>([])
  const [activeTab, setActiveTab]   = useState<'overview' | 'validation' | 'logos' | 'registry' | 'setup'>('overview')
  const [skipValidation, setSkipValidation] = useState(false)
  const [showLog, setShowLog]       = useState(false)
  const [expandedErr, setExpandedErr] = useState<number | null>(null)

  const addLog = (msg: string) => setLogLines(prev => [...prev, msg])

  // ── Status check ─────────────────────────────────────────────────────────
  const checkStatus = useCallback(async () => {
    setPhase('checking')
    try {
      const res  = await fetch('/api/cms/status')
      const data = await res.json()
      setStatus(data)
    } catch(e: any) {
      setStatus({ connected: false, error: e.message, counts: {} })
    }
    setPhase('idle')
  }, [])

  useEffect(() => { if (IS_CONFIGURED) checkStatus() }, [checkStatus])

  // ── Validate ──────────────────────────────────────────────────────────────
  async function runValidation() {
    setPhase('validating')
    setValidation(null)
    setLogLines([])
    try {
      const res  = await fetch('/api/cms/validate', { method: 'POST' })
      const data = await res.json()
      setValidation(data)
    } catch(e: any) {
      addLog('❌ ' + e.message)
    }
    setPhase('idle')
  }

  // ── Sync ─────────────────────────────────────────────────────────────────
  async function runSync(dryRun = false) {
    setPhase(dryRun ? 'fetching' : 'syncing')
    setSyncResult(null)
    setLogLines([])
    const adminToken = document.cookie.split(';').find(c => c.trim().startsWith('edify_admin_session'))?.split('=')?.[1] ?? ''
    try {
      const res  = await fetch('/api/cms/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || adminToken,
        },
        body: JSON.stringify({ dryRun, skipValidation }),
      })
      const data = await res.json()
      setSyncResult(data)
      if (data.log) setLogLines(data.log)
      if (data.ok && !dryRun) {
        setTimeout(() => checkStatus(), 3000)
      }
    } catch(e: any) {
      setSyncResult({ ok: false, message: e.message, log: [] })
      addLog('❌ ' + e.message)
    }
    setPhase('idle')
  }

  // ── Logo test ─────────────────────────────────────────────────────────────
  async function testLogo(uniId: string, url: string) {
    setLogoTests(prev => ({ ...prev, [uniId]: { testing: true } }))
    try {
      const res  = await fetch('/api/cms/logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      setLogoTests(prev => ({ ...prev, [uniId]: data }))
    } catch(e: any) {
      setLogoTests(prev => ({ ...prev, [uniId]: { reachable: false, error: e.message } }))
    }
  }

  // ── Page registry ─────────────────────────────────────────────────────────
  async function fetchRegistry() {
    if (!IS_CONFIGURED) return
    try {
      const res = await fetch(`/api/cms/status`)
      // Fetch registry from GAS directly  
      const gasRes = await fetch(`${SHEET_URL}?action=registry`)
      if (gasRes.ok) {
        const data = await gasRes.json()
        setRegistry(data.pages ?? [])
      }
    } catch(e) { /* silent */ }
  }

  useEffect(() => {
    if (activeTab === 'registry') fetchRegistry()
  }, [activeTab])

  // ── Render ────────────────────────────────────────────────────────────────
  const isWorking = phase !== 'idle'
  const tabStyle  = (t: string) => ({
    padding: '8px 16px', borderRadius: 'var(--r-xs)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
    background: activeTab === t ? 'var(--navy)' : 'transparent',
    color: activeTab === t ? '#fff' : 'var(--ink-3)',
    transition: 'var(--t-fast)',
  } as React.CSSProperties)

  return (
    <div className="page-shell">
      {/* ── Header ── */}
      <div style={{ background: 'var(--navy)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={15} /> Admin
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>/</span>
          <FileSpreadsheet size={18} color="var(--sage-bright)" />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Google Sheets CMS</span>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {status?.connected ? (
              <span style={{ fontSize: 11, color: 'var(--sage-bright)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={12} /> Connected
              </span>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <XCircle size={12} /> {IS_CONFIGURED ? 'Not connected' : 'Not configured'}
              </span>
            )}
            <button onClick={checkStatus} disabled={isWorking}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--r-xs)', padding: '6px 12px', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={12} className={phase === 'checking' ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

        {/* ── Not configured banner ── */}
        {!IS_CONFIGURED && (
          <div style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)', borderRadius: 'var(--r-sm)', padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} color="var(--warning)" /> CMS Not Configured
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              Add <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 6px', borderRadius: 4 }}>NEXT_PUBLIC_CMS_SHEET_URL</code> to your Vercel environment variables.
              See the <button onClick={() => setActiveTab('setup')} style={{ background: 'none', border: 'none', color: 'var(--amber-text)', fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Setup Guide</button> tab for instructions.
            </p>
          </div>
        )}

        {/* ── Stats row ── */}
        {status?.connected && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
            <Badge n={status.counts?.universities ?? 0} label="Universities" icon={Database}   color="var(--navy)" />
            <Badge n={status.counts?.programs     ?? 0} label="Programs"     icon={List}       color="var(--sage)" />
            <Badge n={status.counts?.blogs        ?? 0} label="Blog Posts"   icon={BookOpen}   color="var(--amber-text)" />
            <Badge n={status.counts?.guides       ?? 0} label="Guides"       icon={Map}        color="var(--info)" />
            <Badge n={status.counts?.logos        ?? 0} label="Logos"        icon={Image}      color="var(--purple)" />
            <Badge n={status.counts?.pageRegistry ?? 0} label="Pages Logged" icon={Globe}      color="var(--teal)" />
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--surface-2)', borderRadius: 'var(--r-xs)', padding: 4 }}>
          {[
            { id: 'overview',   label: 'Overview',    icon: Settings },
            { id: 'validation', label: 'Validation',  icon: Shield },
            { id: 'logos',      label: 'Logos',       icon: Image },
            { id: 'registry',   label: 'Page Registry', icon: Globe },
            { id: 'setup',      label: 'Setup Guide', icon: Info },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)} style={tabStyle(id)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon size={13} />{label}
              </span>
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB: OVERVIEW */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Sync card */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
              <div className="section-hdr">
                <Zap size={15} color="var(--amber-text)" />
                <span className="section-title">Sync Sheet → Live Site</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-4)' }}>
                  <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                  Last check: {relative(status?.updatedAt)}
                </span>
              </div>

              <div style={{ padding: 24 }}>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                  Clicking <strong>Sync to Live</strong> will: fetch all sheet data → validate → generate TypeScript files → push to GitHub → Vercel deploys automatically in ~90 seconds.
                </p>

                {/* Steps */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 24 }}>
                  {[
                    { n: '1', label: 'Fetch', desc: 'Read all 8 sheet tabs via Apps Script API' },
                    { n: '2', label: 'Validate', desc: 'Check required fields, duplicates, formats' },
                    { n: '3', label: 'Generate', desc: 'Build data.ts, blog.ts, guides, logos' },
                    { n: '4', label: 'Deploy', desc: 'Push to GitHub → Vercel auto-deploys' },
                  ].map(s => (
                    <div key={s.n} style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-xs)', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--navy)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.n}</div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{s.label}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.5 }}>{s.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Skip validation toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 14px', background: skipValidation ? 'var(--warning-light)' : 'var(--surface-2)', borderRadius: 'var(--r-xs)', border: `1px solid ${skipValidation ? 'var(--warning)' : 'var(--border)'}` }}>
                  <input type="checkbox" id="skipVal" checked={skipValidation} onChange={e => setSkipValidation(e.target.checked)} style={{ cursor: 'pointer' }} />
                  <label htmlFor="skipVal" style={{ fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', userSelect: 'none' }}>
                    Skip validation <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(use only if validation flags false positives)</span>
                  </label>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => runSync(false)} disabled={isWorking || !IS_CONFIGURED}
                    style={{ padding: '12px 28px', borderRadius: 'var(--r-xs)', background: 'linear-gradient(135deg,var(--amber),var(--amber-bright))', color: 'var(--navy)', fontWeight: 800, fontSize: 14, border: 'none', cursor: isWorking || !IS_CONFIGURED ? 'not-allowed' : 'pointer', opacity: isWorking || !IS_CONFIGURED ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {phase === 'syncing' ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                    {phase === 'syncing' ? 'Syncing...' : 'Sync to Live'}
                  </button>

                  <button onClick={() => runSync(true)} disabled={isWorking || !IS_CONFIGURED}
                    style={{ padding: '12px 22px', borderRadius: 'var(--r-xs)', background: 'var(--surface-2)', color: 'var(--ink-2)', fontWeight: 700, fontSize: 13, border: '1px solid var(--border)', cursor: isWorking || !IS_CONFIGURED ? 'not-allowed' : 'pointer', opacity: isWorking ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Eye size={15} /> Dry Run
                  </button>

                  <button onClick={runValidation} disabled={isWorking || !IS_CONFIGURED}
                    style={{ padding: '12px 22px', borderRadius: 'var(--r-xs)', background: 'var(--surface-2)', color: 'var(--ink-2)', fontWeight: 700, fontSize: 13, border: '1px solid var(--border)', cursor: isWorking || !IS_CONFIGURED ? 'not-allowed' : 'pointer', opacity: isWorking ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={15} /> Validate Only
                  </button>

                  {SHEET_URL && (
                    <a href={SHEET_URL.replace('/exec','').replace(/\/macros\/s\/[^/]+/, '')} target="_blank" rel="noopener noreferrer"
                      style={{ padding: '12px 22px', borderRadius: 'var(--r-xs)', background: 'var(--surface-2)', color: 'var(--ink-2)', fontWeight: 700, fontSize: 13, border: '1px solid var(--border)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ExternalLink size={14} /> Open Sheet
                    </a>
                  )}
                </div>
              </div>

              {/* Result + log */}
              {(syncResult || logLines.length > 0) && (
                <div style={{ borderTop: '1px solid var(--border)', padding: 20 }}>
                  {syncResult && (
                    <div style={{ padding: '12px 16px', borderRadius: 'var(--r-xs)', background: syncResult.ok ? 'var(--sage-light)' : 'var(--red-light)', border: `1px solid ${syncResult.ok ? 'var(--sage)' : 'var(--red)'}`, marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {syncResult.ok ? <CheckCircle size={16} color="var(--sage)" style={{ flexShrink: 0, marginTop: 1 }} /> : <XCircle size={16} color="var(--red)" style={{ flexShrink: 0, marginTop: 1 }} />}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{syncResult.message}</div>
                        {syncResult.deployUrl && syncResult.ok && (
                          <a href={syncResult.deployUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--sage)', marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                            <ExternalLink size={11} /> Watch deployment on GitHub Actions
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <button onClick={() => setShowLog(l => !l)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: showLog ? 10 : 0 }}>
                    {showLog ? <ChevronDown size={13} /> : <ChevronRight size={13} />} {showLog ? 'Hide' : 'Show'} log ({logLines.length} lines)
                  </button>

                  {showLog && (
                    <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-xs)', padding: '12px 16px', maxHeight: 280, overflowY: 'auto', border: '1px solid var(--border)' }}>
                      {logLines.map((line, i) => <LogLine key={i} line={line} />)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB: VALIDATION */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'validation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={runValidation} disabled={isWorking || !IS_CONFIGURED}
                style={{ padding: '10px 24px', borderRadius: 'var(--r-xs)', background: 'var(--navy)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: isWorking || !IS_CONFIGURED ? 'not-allowed' : 'pointer', opacity: isWorking ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                {phase === 'validating' ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
                {phase === 'validating' ? 'Validating...' : 'Run Validation'}
              </button>
              <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Checks all sheets without triggering a deploy</span>
            </div>

            {validation && (
              <>
                {/* Summary */}
                <div style={{ padding: '14px 20px', borderRadius: 'var(--r-sm)', background: validation.valid ? 'var(--sage-light)' : 'var(--red-light)', border: `1px solid ${validation.valid ? 'var(--sage)' : 'var(--red)'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {validation.valid ? <CheckCircle size={18} color="var(--sage)" /> : <XCircle size={18} color="var(--red)" />}
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{validation.summary}</span>
                </div>

                {/* Counts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10 }}>
                  {Object.entries(validation.counts || {}).map(([key, count]) => (
                    <div key={key} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xs)', padding: '10px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>{count as number}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'capitalize' }}>{key}</div>
                    </div>
                  ))}
                </div>

                {/* Errors */}
                {validation.errors.length > 0 && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--red)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 20px', background: 'var(--red-light)', borderBottom: '1px solid var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <XCircle size={14} color="var(--red)" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>{validation.errors.length} Error{validation.errors.length !== 1 ? 's' : ''} — must fix before publishing</span>
                    </div>
                    {validation.errors.map((err, i) => (
                      <div key={i} onClick={() => setExpandedErr(expandedErr === i ? null : i)}
                        style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: expandedErr === i ? 'var(--surface-2)' : 'transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', background: 'var(--red-light)', padding: '2px 7px', borderRadius: 999 }}>{err.sheet}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>Row {err.row}: {err.field}</span>
                          <ChevronRight size={12} color="var(--ink-4)" style={{ marginLeft: 'auto', transform: expandedErr === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                        </div>
                        {expandedErr === i && (
                          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                            <strong>Problem:</strong> {err.message}
                            {err.value && <><br /><strong>Current value:</strong> <code style={{ fontSize: 11, background: 'var(--surface-3)', padding: '1px 5px', borderRadius: 3 }}>{err.value}</code></>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {validation.warnings.length > 0 && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--warning)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 20px', background: 'var(--warning-light)', borderBottom: '1px solid var(--warning)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={14} color="var(--warning)" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--warning)' }}>{validation.warnings.length} Warning{validation.warnings.length !== 1 ? 's' : ''} — won't block publish, but worth reviewing</span>
                    </div>
                    {validation.warnings.slice(0, 10).map((w, i) => (
                      <div key={i} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--warning)', background: 'var(--warning-light)', padding: '2px 7px', borderRadius: 999 }}>{w.sheet}</span>
                          <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>Row {w.row}: {w.message}</span>
                        </div>
                      </div>
                    ))}
                    {validation.warnings.length > 10 && (
                      <div style={{ padding: '10px 20px', fontSize: 12, color: 'var(--ink-4)' }}>...and {validation.warnings.length - 10} more</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB: LOGOS */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'logos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)', borderRadius: 'var(--r-xs)', padding: '12px 16px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>
              <strong>How to add logos:</strong> In your Google Sheet, open the <strong>🖼️ Logos</strong> tab. Add the University ID, paste the logo URL (Google Drive or any public URL), and set Status to <em>active</em>. Then click Sync to Live — logos update within 90 seconds.
              <br /><strong>Google Drive tip:</strong> Right-click file → Share → "Anyone with the link" → copy link → change <code>/view</code> to <code>/uc?id=FILE_ID</code>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={async () => {
                const res = await fetch('/api/cms/logos')
                const data = await res.json()
                setLogoTests(data.logos ? Object.fromEntries(Object.entries(data.logos).map(([k,v]) => [k, { url: v, loaded: false }])) : {})
              }} style={{ padding: '9px 18px', borderRadius: 'var(--r-xs)', background: 'var(--navy)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={13} /> Load Logo Map from Sheet
              </button>
            </div>

            {Object.keys(logoTests).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
                {Object.entries(logoTests).map(([uniId, data]: [string, any]) => (
                  <div key={uniId} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xs)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)', wordBreak: 'break-all' }}>{uniId}</div>
                    {data.url ? (
                      <>
                        <img
                          src={data.url} alt={uniId} loading="lazy"
                          style={{ maxHeight: 40, maxWidth: '100%', objectFit: 'contain', border: '1px solid var(--border)', borderRadius: 4, padding: 4, background: '#f8f9fc' }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        <div style={{ fontSize: 10, color: 'var(--ink-4)', wordBreak: 'break-all' }}>{String(data.url).slice(0, 50)}...</div>
                        <button onClick={() => testLogo(uniId, data.url)}
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: 'var(--ink-2)' }}>
                          Test URL
                        </button>
                        {data.reachable !== undefined && (
                          <div style={{ fontSize: 11, color: data.reachable ? 'var(--sage)' : 'var(--red)' }}>
                            {data.reachable ? '✓ Reachable' : '✗ Unreachable'}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>No logo URL</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB: PAGE REGISTRY */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'registry' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={fetchRegistry}
                style={{ padding: '9px 18px', borderRadius: 'var(--r-xs)', background: 'var(--navy)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={13} /> Refresh Registry
              </button>
              <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{registry.length} pages tracked</span>
            </div>

            {registry.length > 0 ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                      {['Page ID','Type','URL','Status','Last Updated'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--ink-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registry.slice(0, 50).map((page, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '9px 14px', fontFamily: 'monospace', fontSize: 11, color: 'var(--ink-2)' }}>{page['Page ID']}</td>
                        <td style={{ padding: '9px 14px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--ink-3)' }}>{page['Page Type']}</span>
                        </td>
                        <td style={{ padding: '9px 14px' }}>
                          <a href={page['URL']} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber-text)', fontSize: 11, textDecoration: 'none' }}>
                            {page['URL']}
                          </a>
                        </td>
                        <td style={{ padding: '9px 14px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: page['Status'] === 'active' ? 'var(--sage-light)' : 'var(--surface-3)', color: page['Status'] === 'active' ? 'var(--sage)' : 'var(--ink-3)' }}>{page['Status']}</span>
                        </td>
                        <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--ink-4)' }}>{page['Last Updated']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {registry.length > 50 && (
                  <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--ink-4)', borderTop: '1px solid var(--border)' }}>
                    Showing 50 of {registry.length} pages. View all in the Page Registry sheet.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
                No pages logged yet. Pages are automatically tracked when the site is synced.
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB: SETUP GUIDE */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'setup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
            {[
              {
                n: '1', title: 'Create your Google Sheet',
                body: 'Go to sheets.google.com → New blank spreadsheet → name it "Edify CMS". This sheet will be the single source of truth for all your website content.',
              },
              {
                n: '2', title: 'Add the Apps Script',
                body: 'In your Google Sheet: Extensions → Apps Script → delete all existing code → paste the entire contents of scripts/google-apps-script.js → Save (Ctrl+S).',
              },
              {
                n: '3', title: 'Build the sheet template',
                body: 'In Apps Script editor: click Run → select buildCMSTemplate() → Authorize when prompted. This creates all 9 sheet tabs with headers and sample rows automatically.',
              },
              {
                n: '4', title: 'Deploy as Web App',
                body: 'In Apps Script: Click Deploy → New Deployment → gear icon next to Type → Web App → Execute as: Me → Who has access: Anyone → Click Deploy → Authorize → copy the Web App URL.',
              },
              {
                n: '5', title: 'Set the secret (optional but recommended)',
                body: 'In Apps Script: Run → setSecret() → enter a secret string. Then in Vercel → Environment Variables: add CMS_SHEET_SECRET = same string. This protects write operations.',
              },
              {
                n: '6', title: 'Add env vars to Vercel',
                body: `Go to Vercel Dashboard → your project → Settings → Environment Variables. Add:
• NEXT_PUBLIC_CMS_SHEET_URL = <your Web App URL>
• CMS_SHEET_SECRET = <your secret>
Then redeploy.`,
              },
              {
                n: '7', title: 'Fill in your content',
                body: 'Fill the "📊 Universities" sheet with your data (one row per university). Fill "📚 Programs" (one row per university+program combination). Add blog posts to "✍️ Blog Posts" and guides to "🗺️ Guides".',
              },
              {
                n: '8', title: 'Sync to live!',
                body: 'Come back to this page, click "Validate Only" first to check for errors, then click "Sync to Live". Your site will update within 90 seconds.',
              },
            ].map(step => (
              <div key={step.n} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 20, display: 'flex', gap: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--navy)', color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step.n}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{step.title}</div>
                  <pre style={{ margin: 0, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{step.body}</pre>
                </div>
              </div>
            ))}

            <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-xs)', padding: '14px 18px', fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.7 }}>
              <strong>Required env vars summary:</strong><br />
              <code>NEXT_PUBLIC_CMS_SHEET_URL</code> — Google Apps Script Web App URL<br />
              <code>CMS_SHEET_SECRET</code> — secret for write operations (optional)<br />
              <code>GITHUB_TOKEN</code> — GitHub PAT with repo write access<br />
              <code>ADMIN_SECRET</code> — admin panel login password<br />
              <code>ADMIN_SESSION_TOKEN</code> — run: <code>openssl rand -hex 32</code>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
