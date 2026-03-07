'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Copy, CheckCircle, AlertCircle, Globe, Sparkles } from 'lucide-react'

type Step = 'input' | 'scraping' | 'generating' | 'result' | 'error'

const EXAMPLE_URLS = [
  'https://www.collegevidya.com/online-courses/manipal-university-online-mba',
  'https://www.collegevidya.com/online-courses/nmims-online-mba',
  'https://www.collegevidya.com/online-courses/chandigarh-university-online-mba',
  'https://www.collegevidya.com/online-courses/lpu-online-mba',
]

export default function ScraperPage() {
  const [step, setStep] = useState<Step>('input')
  const [url, setUrl] = useState('')
  const [rawText, setRawText] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState('')
  const [manualMode, setManualMode] = useState(false)

  async function scrapeAndGenerate() {
    if (!url.trim() && !rawText.trim()) return
    setStep('scraping')
    setError('')

    let pageContent = rawText

    if (!manualMode && url.trim()) {
      setProgress('Fetching page content...')
      try {
        // Try to fetch via AllOrigins proxy (handles CORS)
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
        const res = await fetch(proxyUrl)
        const data = await res.json()
        if (data.contents) {
          // Strip HTML tags
          const div = document.createElement('div')
          div.innerHTML = data.contents
          pageContent = div.innerText || div.textContent || ''
          pageContent = pageContent.slice(0, 8000) // limit tokens
        }
      } catch (e) {
        // If scraping blocked, fall through to manual mode hint
        setError('Scraping blocked by the website. Please paste the page text manually below.')
        setStep('error')
        setManualMode(true)
        return
      }
    }

    setStep('generating')
    setProgress('Extracting university data with AI...')

    const systemPrompt = `You are a data extraction expert for EdifyEdu.in — India's most honest online degree platform.

Extract structured university data from the provided text/HTML content from CollegeVidya or similar platforms.

Return ONLY valid JSON with this exact structure — no markdown, no explanation:
{
  "id": "url-friendly-id",
  "name": "Full University Name Online",
  "abbr": "SHORT",
  "city": "City",
  "state": "State",
  "nirf": 0,
  "naac": "A+",
  "examMode": "Online",
  "eligibility": "50% in graduation",
  "eligibilityPct": 50,
  "feeMin": 75000,
  "feeMax": 200000,
  "emiFrom": 5000,
  "highlight": "One line highlight",
  "tagline": "Short tagline",
  "description": "2-3 sentence honest description",
  "approvals": ["UGC DEB", "NAAC X"],
  "forWho": ["Who should join 1", "Who should join 2", "Who should join 3"],
  "notFor": ["Who should avoid 1", "Who should avoid 2"],
  "programs": ["MBA", "MCA"],
  "programDetails": {
    "MBA": {
      "specs": ["Finance", "Marketing", "HR"],
      "fees": "₹1,50,000",
      "duration": "2 Years",
      "roles": ["Manager 1", "Manager 2", "Manager 3", "Manager 4"],
      "avgSalary": "₹5L – ₹15L per annum",
      "topCompanies": ["Company1", "Company2", "Company3"],
      "internshipType": "Description of internship/project model",
      "careerOutcome": "2-3 sentence career outcome",
      "specRoles": {
        "Finance": {"roles": ["Financial Analyst", "Banker"], "salary": "₹6L – ₹20L", "companies": ["HDFC Bank", "Kotak"]},
        "Marketing": {"roles": ["Brand Manager", "Marketing Lead"], "salary": "₹5L – ₹16L", "companies": ["HUL", "P&G"]}
      }
    }
  }
}`

    const userPrompt = `Extract all university data from this CollegeVidya page content and convert it to Edify's data format.

Source URL: ${url || 'Manual paste'}

Page content:
${pageContent || rawText}

Be honest — if NIRF rank is not mentioned, set it to 99. If WES is mentioned, add to approvals. Extract all specialisations you find. Return only valid JSON.`

    try {
      const res = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const raw = data.content?.map((c: any) => c.text || '').join('') || ''
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setResult(parsed)
      setStep('result')
    } catch (err: any) {
      setError('AI extraction failed. Try pasting the page content manually.')
      setStep('error')
    }
  }

  function getDataTsCode() {
    if (!result) return ''
    return `  {
    id: '${result.id}',
    name: '${result.name}',
    abbr: '${result.abbr}',
    city: '${result.city}',
    state: '${result.state}',
    region: 'North', // update as needed
    nirf: ${result.nirf},
    naac: '${result.naac}',
    ugc: true,
    approvals: ${JSON.stringify(result.approvals)},
    examMode: '${result.examMode}',
    govtRecognised: false,
    psuEligible: false,
    feeMin: ${result.feeMin},
    feeMax: ${result.feeMax},
    emiFrom: ${result.emiFrom},
    eligibility: '${result.eligibility}',
    eligibilityPct: ${result.eligibilityPct},
    highlight: '${result.highlight}',
    tagline: '${result.tagline}',
    description: '${result.description?.replace(/'/g, "\\'")}',
    forWho: ${JSON.stringify(result.forWho)},
    notFor: ${JSON.stringify(result.notFor)},
    programs: ${JSON.stringify(result.programs)},
    programDetails: ${JSON.stringify(result.programDetails, null, 4)},
    color: '#6366f1', // update color
  },`
  }

  function copyCode() {
    navigator.clipboard.writeText(getDataTsCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1b2d' }}>
      <div style={{ background: '#0a1220', borderBottom: '1px solid #1e2f45' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', textDecoration: 'none', marginBottom: '16px' }}>
            <ArrowLeft size={14} /> Back to Admin
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Globe size={20} color="#c9922a" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Data Scraper Agent</span>
          </div>
          <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
            CollegeVidya → Edify
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Paste a CollegeVidya URL or page text → AI extracts structured data → Copy code into lib/data.ts
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {(step === 'input' || step === 'error') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setManualMode(false)}
                style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: !manualMode ? '#c9922a' : 'transparent', color: !manualMode ? '#0f1b2d' : '#64748b', border: `1px solid ${!manualMode ? '#c9922a' : '#1e2f45'}` }}>
                🌐 URL Mode
              </button>
              <button onClick={() => setManualMode(true)}
                style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: manualMode ? '#c9922a' : 'transparent', color: manualMode ? '#0f1b2d' : '#64748b', border: `1px solid ${manualMode ? '#c9922a' : '#1e2f45'}` }}>
                📋 Paste Text Mode
              </button>
            </div>

            {!manualMode ? (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                  CollegeVidya URL
                </label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                  placeholder="https://www.collegevidya.com/online-courses/..."
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: `1px solid ${url ? '#c9922a' : '#1e2f45'}`, background: '#162032', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />

                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', marginBottom: '6px' }}>Example URLs:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {EXAMPLE_URLS.map(ex => (
                      <button key={ex} onClick={() => setUrl(ex)}
                        style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', background: 'transparent', color: '#64748b', border: '1px solid #1e2f45', cursor: 'pointer', textAlign: 'left' }}>
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', fontSize: '12px', color: '#94a3b8' }}>
                  ⚠️ <strong style={{ color: '#f87171' }}>If URL scraping is blocked:</strong> Open the CollegeVidya page in your browser → Ctrl+A, Ctrl+C to copy all text → switch to "Paste Text Mode" above.
                </div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                  Paste Page Content
                </label>
                <textarea value={rawText} onChange={e => setRawText(e.target.value)}
                  placeholder="Open CollegeVidya in browser → Ctrl+A → Ctrl+C → paste here..."
                  rows={12}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1px solid #1e2f45', background: '#162032', color: '#ffffff', fontSize: '13px', outline: 'none', resize: 'vertical', lineHeight: '1.6', boxSizing: 'border-box' }} />
              </div>
            )}

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', fontSize: '13px', color: '#f87171', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> {error}
              </div>
            )}

            <button onClick={scrapeAndGenerate} disabled={!url.trim() && !rawText.trim()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 28px', borderRadius: '12px', background: (url || rawText) ? 'linear-gradient(135deg,#c9922a,#e0a93a)' : '#1e2f45', color: (url || rawText) ? '#0f1b2d' : '#475569', fontWeight: '700', fontSize: '14px', border: 'none', cursor: (url || rawText) ? 'pointer' : 'not-allowed' }}>
              <Sparkles size={18} />
              Extract University Data with AI
            </button>
          </div>
        )}

        {/* Generating */}
        {(step === 'scraping' || step === 'generating') && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Loader2 size={48} color="#c9922a" style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ color: '#ffffff', fontWeight: '700', fontSize: '1.3rem', marginBottom: '10px' }}>
              {step === 'scraping' ? 'Fetching page...' : 'Extracting data with AI...'}
            </h2>
            <p style={{ color: '#c9922a', fontSize: '13px' }}>{progress}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Result */}
        {step === 'result' && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div style={{ padding: '14px 20px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#4ade80' }}>
                <CheckCircle size={18} /> Data extracted successfully!
              </div>
              <button onClick={() => { setStep('input'); setResult(null); setUrl(''); setRawText('') }}
                style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #1e2f45', color: '#64748b', background: 'transparent', fontSize: '12px', cursor: 'pointer' }}>
                New Scrape
              </button>
            </div>

            {/* Preview */}
            <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', marginBottom: '14px' }}>Extracted Data Preview</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {[
                  { label: 'Name', value: result.name },
                  { label: 'Location', value: `${result.city}, ${result.state}` },
                  { label: 'NIRF Rank', value: `#${result.nirf}` },
                  { label: 'NAAC', value: result.naac },
                  { label: 'Fee Range', value: `₹${(result.feeMin/100000).toFixed(1)}L – ₹${(result.feeMax/100000).toFixed(1)}L` },
                  { label: 'Programs', value: result.programs?.join(', ') },
                ].map(r => (
                  <div key={r.label} style={{ padding: '10px 14px', background: '#0f1b2d', borderRadius: '8px', border: '1px solid #1e2f45' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>{r.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{r.value || '—'}</div>
                  </div>
                ))}
              </div>

              {result.programDetails && Object.keys(result.programDetails).map((prog: string) => {
                const pd = result.programDetails[prog]
                return (
                  <div key={prog} style={{ marginBottom: '10px', padding: '12px', background: '#0f1b2d', borderRadius: '10px', border: '1px solid #1e2f45' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#c9922a', marginBottom: '8px' }}>{prog}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Specs: <span style={{ color: '#94a3b8' }}>{pd.specs?.join(', ')}</span></div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Fees: <span style={{ color: '#4ade80', fontWeight: '600' }}>{pd.fees}</span></div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Salary: <span style={{ color: '#ffffff' }}>{pd.avgSalary}</span></div>
                  </div>
                )
              })}
            </div>

            {/* Code output */}
            <div style={{ background: '#0a1220', border: '1px solid #1e2f45', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#162032', borderBottom: '1px solid #1e2f45', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>lib/data.ts — paste this inside UNIVERSITIES array</span>
                <button onClick={copyCode}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: copied ? 'rgba(74,222,128,0.1)' : '#c9922a', color: copied ? '#4ade80' : '#0f1b2d', fontWeight: '700', fontSize: '12px', border: copied ? '1px solid rgba(74,222,128,0.3)' : 'none', cursor: 'pointer' }}>
                  {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
                </button>
              </div>
              <pre style={{ padding: '16px', fontSize: '11px', color: '#64748b', overflow: 'auto', maxHeight: '300px', lineHeight: '1.6', margin: 0 }}>
                {getDataTsCode()}
              </pre>
            </div>

            <div style={{ padding: '16px 20px', background: 'rgba(201,146,42,0.06)', border: '1px solid rgba(201,146,42,0.2)', borderRadius: '12px', fontSize: '13px', color: '#94a3b8', lineHeight: '1.7' }}>
              <strong style={{ color: '#c9922a' }}>Next steps:</strong>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {['1. Click "Copy Code" above', '2. Open VS Code → lib/data.ts', '3. Find UNIVERSITIES array → paste before the closing ]', '4. Update the color field (pick from existing universities)', '5. Save → npm run dev → visit /universities/[id] to verify'].map((s, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#64748b' }}>{s}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
