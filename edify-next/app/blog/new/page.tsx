'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Copy, CheckCircle, Loader2, AlertCircle, Search, TrendingUp } from 'lucide-react'

type Step = 'input' | 'researching' | 'writing' | 'result' | 'error'

// Keyword research data — high-intent keywords by category
const KEYWORD_CLUSTERS = [
  {
    category: 'MBA Comparisons (High Intent)',
    keywords: [
      'NMIMS vs Manipal online MBA 2025',
      'Chandigarh University vs LPU online MBA',
      'best online MBA under 2 lakh India',
      'Symbiosis vs Amity online MBA honest review',
      'online MBA NIRF ranked universities India',
    ]
  },
  {
    category: 'Specialisation Pages (GEO+AEO)',
    keywords: [
      'online MBA in finance India 2025 complete guide',
      'online MBA in digital marketing best universities',
      'online MBA in healthcare management India',
      'online MBA in data science and analytics',
      'online MBA in HR management working professionals',
    ]
  },
  {
    category: 'City / GEO Targeting',
    keywords: [
      'best online MBA for working professionals in Lucknow 2025',
      'online MBA from Chandigarh University valid Lucknow',
      'online MBA Patna Bihar working professionals',
      'online degree Tier 2 city India recognition',
      'online MBA Jaipur Rajasthan jobs recognition',
    ]
  },
  {
    category: 'Validity / Trust Queries',
    keywords: [
      'is online MBA valid for government jobs India 2025',
      'UGC DEB approved universities complete list 2025',
      'online degree vs regular degree salary difference',
      'is Manipal online MBA recognised by companies',
      'WES recognised online universities India 2025',
    ]
  },
  {
    category: 'Career / AEO Queries',
    keywords: [
      'average salary after online MBA India 2025',
      'jobs after online MBA without work experience',
      'online MBA ROI India is it worth it',
      'online MCA career scope India 2025',
      'online BBA career options after graduation India',
    ]
  },
]

const CITIES = ['Lucknow', 'Patna', 'Jaipur', 'Indore', 'Bhopal', 'Nagpur', 'Surat', 'Visakhapatnam', 'Coimbatore', 'Chandigarh', 'Dehradun', 'Ranchi', 'Bhubaneswar', 'Kochi']
const PROGRAMS = ['MBA', 'MCA', 'BBA', 'BCA', 'B.Com', 'Any']

export default function BlogAgentPage() {
  const [step, setStep] = useState<Step>('input')
  const [keyword, setKeyword] = useState('')
  const [city, setCity] = useState('')
  const [program, setProgram] = useState('MBA')
  const [intent, setIntent] = useState<'comparison' | 'guide' | 'career' | 'validity' | 'geo'>('guide')
  const [wordCount, setWordCount] = useState<1200 | 1800 | 2500>(1800)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  const [htmlCopied, setHtmlCopied] = useState(false)

  async function generate() {
    if (!keyword.trim()) return
    setStep('researching')
    setError('')

    const fullKeyword = city ? `${keyword} ${city}` : keyword

    const systemPrompt = `You are India's top SEO content writer specialising in education. You write for Edify (edifyedu.in) — the most honest guide to online degrees in India.

EDIFY VOICE:
- Brutally honest. Acknowledge trade-offs before benefits.
- Real data: NIRF ranks, exact fees, salary ranges, company names
- Never promotional. Help students make RIGHT decisions even if they don't enrol.
- Cite facts: "NMIMS is NIRF #24" not "NMIMS is one of the best"

UNIVERSITY DATABASE:
1. Chandigarh University Online — NIRF #19, NAAC A+, Fees ₹1.2L, 35% eligibility, Harvard Business Publishing access
2. NMIMS Online — NIRF #24, NAAC A++, Fees ₹1.1L–₹4L, IIM job portal access
3. Symbiosis SSDL — NIRF #24, NAAC A, Fees ₹1.4L–₹3.1L, zero exams, NISM certification access
4. Manipal MUJ Online — NIRF #45, NAAC A+, Fees ₹1.85L, WES recognised, Coursera access
5. DY Patil Online — NIRF #46, NAAC A, Fees ₹1.6L, edX access, best for healthcare
6. LPU Online — NIRF #47, NAAC A+, Fees ₹1.2L, 35% eligibility, 20+ specs
7. Jain University Online — NIRF #55, NAAC A+, Fees ₹1.5L, South India brand
8. Amity Online — NIRF #56, NAAC A+, Fees ₹1.7L, UP/Delhi NCR brand
9. Shoolini Online — NIRF #60, NAAC A+, Fees ₹1.2L, most affordable NAAC A+

SEO RULES:
- H1 must contain exact target keyword
- H2s should be question-format for AI Overviews (AEO)
- Include comparison table with real data
- Include "Honest Verdict" section
- FAQ section with 5 real questions people ask
- Internal links: mention /universities, /compare, /programs/mba, /blog
- If geo-targeted: mention local employers, state-specific recognition, local companies

RETURN ONLY VALID JSON — no markdown fences:
{
  "title": "H1 title with exact keyword",
  "metaDescription": "155 chars with keyword for CTR",
  "slug": "url-slug",
  "category": "MBA Guides|Guides|University Reviews|Career Advice",
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "readTime": 8,
  "targetKeyword": "${fullKeyword}",
  "secondaryKeywords": ["kw2","kw3","kw4"],
  "seoScore": "explanation of why this ranks",
  "faqs": [
    {"q": "Question?", "a": "Detailed answer with specific data"},
    {"q": "Question?", "a": "Answer"},
    {"q": "Question?", "a": "Answer"},
    {"q": "Question?", "a": "Answer"},
    {"q": "Question?", "a": "Answer"}
  ],
  "content": "FULL HTML article with h2, h3, p, ul, li, strong, table tags. Minimum ${wordCount} words. Include comparison table, honest verdict, internal links."
}`

    const intentGuide = {
      comparison: 'Deep comparison article — table-heavy, data-driven, clear winner recommendation',
      guide: 'Comprehensive honest guide — who-it-is-for, who-to-avoid, step-by-step advice',
      career: 'Career outcomes focus — salary data, job roles, company names, growth trajectory',
      validity: 'Trust-building — address govt job question directly, explain UGC DEB, be honest about limitations',
      geo: `Geo-targeted for ${city || 'Tier 2 cities'} — mention local employers, state recognition, nearby exam centres`,
    }

    const userPrompt = `Write a professional SEO blog post for Edify targeting: "${fullKeyword}"

Article type: ${intentGuide[intent]}
Program focus: ${program}
Target word count: ${wordCount} words
${city ? `Geographic target: ${city}, India — mention employers, university recognition in ${city}` : ''}

SEO requirements:
1. H1 = exact keyword naturally placed
2. H2s as questions for AI Overviews (Google SGE + Perplexity + ChatGPT)
3. Comparison table: universities side-by-side (fees, NIRF, salary, specialisations)
4. "Honest Verdict" section — don't dodge the hard questions
5. Government jobs question — answer directly and honestly
6. 5 FAQs with real data in answers
7. Internal links: mention "compare all universities at /compare", "see all ${program} programs at /programs/${program.toLowerCase()}"
8. Call to action at end: "Get free counselling — our team will shortlist the top 3 for your profile"
9. ${city ? `Mention ${city}-specific employers: companies that hire in ${city}, CU/LPU exam centres near ${city}` : 'Mention pan-India hiring data'}

Return ONLY the JSON.`

    try {
      const timeouts = [
        setTimeout(() => setProgress('Researching keyword intent...'), 500),
        setTimeout(() => setProgress('Analysing competitor content structure...'), 2000),
        setTimeout(() => setStep('writing'), 4000),
        setTimeout(() => setProgress('Writing introduction and overview...'), 4500),
        setTimeout(() => setProgress('Building comparison tables with real data...'), 8000),
        setTimeout(() => setProgress('Adding FAQ schema for AI Overviews...'), 12000),
        setTimeout(() => setProgress('Finalising SEO metadata and interlinking...'), 16000),
      ]

      const res = await fetch('/api/blog-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt }),
      })

      timeouts.forEach(clearTimeout)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const raw = data.content?.map((c: any) => c.text || '').join('') || data.text || ''
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setResult(parsed)
      setStep('result')
    } catch (err: any) {
      const msg = err?.message || ''
      if (msg.includes('ANTHROPIC_API_KEY') || msg.includes('not set')) {
        setError('⚠️ ANTHROPIC_API_KEY missing. Add it to your .env.local file: ANTHROPIC_API_KEY=sk-ant-...')
      } else {
        setError('Generation failed: ' + (msg || 'Check that ANTHROPIC_API_KEY is set in .env.local'))
      }
      setStep('error')
    }
  }

  function getBlogCode() {
    if (!result) return ''
    return `  {
    slug: '${result.slug}',
    title: '${result.title?.replace(/'/g, "\\'")}',
    metaDescription: '${result.metaDescription?.replace(/'/g, "\\'")}',
    category: '${result.category}',
    tags: ${JSON.stringify(result.tags)},
    publishedAt: '${new Date().toISOString().split('T')[0]}',
    readTime: ${result.readTime},
    targetKeyword: '${result.targetKeyword}',
    relatedUniversities: [],
    status: 'published' as const,
    faqs: ${JSON.stringify(result.faqs, null, 4)},
    content: \`${result.content?.replace(/`/g, '\\`') || ''}\`,
  },`
  }

  function reset() {
    setStep('input')
    setResult(null)
    setError('')
    setKeyword('')
    setProgress('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1b2d' }}>
      <div style={{ background: '#0a1220', borderBottom: '1px solid #1e2f45' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', textDecoration: 'none', marginBottom: '16px' }}>
            <ArrowLeft size={14} /> All Articles
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Sparkles size={20} color="#c9922a" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro SEO Blog Agent</span>
          </div>
          <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
            Generate SEO + AEO + GEO Blog Post
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
            Keyword → AI writes {wordCount}+ word professional article with comparison tables, FAQ schema (for Google AI Overviews + Perplexity), geo-targeting, and internal links.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {(step === 'input' || step === 'error') && (
          <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* SETUP NOTE */}
            <div style={{ width: '100%', padding: '14px 18px', background: 'rgba(201,146,42,0.08)', border: '1px solid rgba(201,146,42,0.25)', borderRadius: '12px', marginBottom: '4px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#c9922a', marginBottom: '4px' }}>⚙️ One-time Setup Required</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
                Add your Anthropic API key to <code style={{ background: '#1e2f45', padding: '1px 6px', borderRadius: '4px', color: '#c9922a' }}>.env.local</code>:{' '}
                <code style={{ background: '#1e2f45', padding: '1px 6px', borderRadius: '4px', color: '#a78bfa' }}>ANTHROPIC_API_KEY=sk-ant-api03-...</code>
                {' '}Get it from <a href="https://console.anthropic.com" target="_blank" rel="noopener" style={{ color: '#c9922a' }}>console.anthropic.com</a>. Then restart the dev server.
              </div>
            </div>

            {/* LEFT: Form */}
            <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Keyword */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                  Target Keyword *
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && generate()}
                    placeholder="e.g. online MBA for working professionals India 2025"
                    style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '12px', border: `1px solid ${keyword ? '#c9922a' : '#1e2f45'}`, background: '#162032', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Options grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Program</label>
                  <select value={program} onChange={e => setProgram(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #1e2f45', background: '#162032', color: '#ffffff', fontSize: '13px', outline: 'none' }}>
                    {PROGRAMS.map(p => <option key={p} style={{ background: '#162032' }}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>GEO City</label>
                  <select value={city} onChange={e => setCity(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #1e2f45', background: '#162032', color: '#ffffff', fontSize: '13px', outline: 'none' }}>
                    <option value="" style={{ background: '#162032' }}>All India</option>
                    {CITIES.map(c => <option key={c} style={{ background: '#162032' }}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Article type */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Article Type</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {([
                    { key: 'guide', label: '📖 Honest Guide' },
                    { key: 'comparison', label: '⚖️ Comparison' },
                    { key: 'career', label: '💼 Career Focus' },
                    { key: 'validity', label: '✅ Validity Guide' },
                    { key: 'geo', label: '📍 City GEO' },
                  ] as const).map(t => (
                    <button key={t.key} onClick={() => setIntent(t.key)}
                      style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: intent === t.key ? '#c9922a' : 'transparent', color: intent === t.key ? '#0f1b2d' : '#64748b', border: `1px solid ${intent === t.key ? '#c9922a' : '#1e2f45'}` }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Word count */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Target Length</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {([1200, 1800, 2500] as const).map(w => (
                    <button key={w} onClick={() => setWordCount(w)}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', background: wordCount === w ? '#c9922a' : 'transparent', color: wordCount === w ? '#0f1b2d' : '#64748b', border: `1px solid ${wordCount === w ? '#c9922a' : '#1e2f45'}` }}>
                      {w.toLocaleString()}w
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', fontSize: '13px', color: '#f87171', display: 'flex', gap: '8px' }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} /> {error}
                </div>
              )}

              <button onClick={generate} disabled={!keyword.trim()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '12px', background: keyword ? 'linear-gradient(135deg,#c9922a,#e0a93a)' : '#1e2f45', color: keyword ? '#0f1b2d' : '#475569', fontWeight: '800', fontSize: '15px', border: 'none', cursor: keyword ? 'pointer' : 'not-allowed' }}>
                <Sparkles size={18} /> Generate Professional Blog Post
              </button>
            </div>

            {/* RIGHT: Keyword research */}
            <div style={{ width: '280px', flexShrink: 0 }}>
              <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: 'rgba(201,146,42,0.06)', borderBottom: '1px solid #1e2f45', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={14} color="#c9922a" />
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Keyword Ideas</span>
                </div>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {KEYWORD_CLUSTERS.map(cluster => (
                    <div key={cluster.category} style={{ padding: '12px 16px', borderBottom: '1px solid #1e2f45' }}>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>{cluster.category}</div>
                      {cluster.keywords.map(kw => (
                        <button key={kw} onClick={() => setKeyword(kw)}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: keyword === kw ? '#c9922a' : '#64748b', borderBottom: '1px solid transparent', lineHeight: '1.4' }}>
                          {keyword === kw ? '→ ' : ''}{kw}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generating */}
        {(step === 'researching' || step === 'writing') && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Loader2 size={48} color="#c9922a" style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <h2 className="font-display" style={{ color: '#ffffff', fontWeight: '700', fontSize: '1.4rem', marginBottom: '10px' }}>
              {step === 'researching' ? 'Researching keyword...' : 'Writing your article...'}
            </h2>
            <p style={{ color: '#c9922a', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>{progress}</p>
            <p style={{ color: '#475569', fontSize: '12px' }}>"{keyword}{city ? ` ${city}` : ''}" · {wordCount}+ words · Usually 25–45 seconds</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Result */}
        {step === 'result' && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Success banner */}
            <div style={{ padding: '14px 20px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#4ade80', fontSize: '14px', marginBottom: '2px' }}>
                  <CheckCircle size={16} /> Article generated — {result.readTime} min read · {result.tags?.length} tags
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Target: "{result.targetKeyword}"</div>
              </div>
              <button onClick={reset}
                style={{ padding: '7px 16px', borderRadius: '8px', border: '1px solid #1e2f45', color: '#64748b', background: 'transparent', fontSize: '12px', cursor: 'pointer' }}>
                New Article
              </button>
            </div>

            {/* SEO score */}
            {result.seoScore && (
              <div style={{ padding: '14px 18px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '6px' }}>📊 SEO Strategy</div>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>{result.seoScore}</p>
              </div>
            )}

            {/* Meta */}
            <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', marginBottom: '14px' }}>SEO Metadata</div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '10px', color: '#475569', marginBottom: '3px' }}>TITLE ({result.title?.length} chars)</div>
                <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '15px' }}>{result.title}</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: '#475569', marginBottom: '3px' }}>META DESCRIPTION ({result.metaDescription?.length} chars)</div>
                <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>{result.metaDescription}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#475569', marginBottom: '6px' }}>SECONDARY KEYWORDS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {result.secondaryKeywords?.map((kw: string) => (
                    <span key={kw} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(201,146,42,0.08)', color: '#c9922a', border: '1px solid rgba(201,146,42,0.2)' }}>{kw}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQs */}
            {result.faqs?.length > 0 && (
              <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', marginBottom: '14px' }}>FAQ Schema — Targets AI Overviews & Perplexity</div>
                {result.faqs.map((faq: any, i: number) => (
                  <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: i < result.faqs.length - 1 ? '1px solid #1e2f45' : 'none' }}>
                    <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '13px', marginBottom: '4px' }}>Q{i+1}: {faq.q}</div>
                    <div style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.6' }}>{faq.a}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Content preview */}
            <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', marginBottom: '14px' }}>Article Preview (first 1500 chars)</div>
              <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.7', maxHeight: '280px', overflow: 'hidden', position: 'relative' }}
                dangerouslySetInnerHTML={{ __html: result.content?.slice(0, 1500) + '...' }} />
              <div style={{ height: '60px', background: 'linear-gradient(transparent,#162032)', marginTop: '-60px', position: 'relative' }} />
              <button onClick={() => { setHtmlCopied(true); navigator.clipboard?.writeText(result.content || ''); setTimeout(() => setHtmlCopied(false), 2000) }}
                style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'transparent', border: '1px solid #1e2f45', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>
                {htmlCopied ? <><CheckCircle size={13} /> Copied!</> : <><Copy size={13} /> Copy full HTML</>}
              </button>
            </div>

            {/* Add to blog instructions */}
            <div style={{ background: '#0a1220', border: '1px solid #1e2f45', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', marginBottom: '14px' }}>📋 Add this post to your site</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {[
                  '1. Click "Copy Blog Entry" → copies formatted TypeScript code',
                  '2. Open VS Code → lib/blog.ts',
                  '3. Find the BLOG_POSTS array → paste new entry inside the array',
                  `4. Save → post live at /blog/${result.slug}`,
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', color: '#94a3b8' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#c9922a', color: '#0f1b2d', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i+1}</div>
                    {s}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { navigator.clipboard?.writeText(getBlogCode()); setCodeCopied(true); setTimeout(() => setCodeCopied(false), 3000) }}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '13px', borderRadius: '12px', background: codeCopied ? 'rgba(74,222,128,0.1)' : 'linear-gradient(135deg,#c9922a,#e0a93a)', color: codeCopied ? '#4ade80' : '#0f1b2d', fontWeight: '700', fontSize: '13px', border: codeCopied ? '1px solid rgba(74,222,128,0.3)' : 'none', cursor: 'pointer' }}>
                  {codeCopied ? <><CheckCircle size={15} /> Copied to clipboard!</> : <><Copy size={15} /> Copy Blog Entry (TypeScript)</>}
                </button>
                <button onClick={() => {
                    const blob = new Blob([getBlogCode()], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = `blog-${result?.slug || 'post'}.txt`; a.click()
                  }}
                  style={{ padding: '13px 20px', borderRadius: '12px', border: '1px solid #1e2f45', color: '#64748b', background: 'transparent', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                  ⬇ Download
                </button>
                <button onClick={reset}
                  style={{ padding: '13px 20px', borderRadius: '12px', border: '1px solid #1e2f45', color: '#64748b', background: 'transparent', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                  New Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
