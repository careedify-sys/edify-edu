'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, CheckCircle, FileText, ExternalLink } from 'lucide-react'

// ─── BLOG TEMPLATES ──────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'comparison',
    emoji: '⚖️',
    title: 'University Comparison',
    desc: 'Compare 2 universities — most-searched type of post',
    fields: [
      { key: 'uni1', label: 'University 1', placeholder: 'NMIMS' },
      { key: 'uni2', label: 'University 2', placeholder: 'Manipal' },
      { key: 'program', label: 'Program', placeholder: 'MBA' },
    ],
    buildPrompt: (v: Record<string, string>) =>
      `You are a senior education journalist in India. Write a 1600-word honest, SEO-optimised blog post for EdifyEdu.in comparing ${v.uni1 || 'NMIMS'} vs ${v.uni2 || 'Manipal'} Online ${v.program || 'MBA'} in 2025.

TARGET KEYWORD: "${v.uni1 || 'NMIMS'} vs ${v.uni2 || 'Manipal'} online ${v.program || 'MBA'} 2025"

REQUIRED STRUCTURE (use these exact headings):
1. Title: "${v.uni1 || 'NMIMS'} vs ${v.uni2 || 'Manipal'} Online ${v.program || 'MBA'} 2025: Honest Comparison"
2. Meta Description: (write one, max 155 characters)
3. <h2>Quick Verdict</h2> — 3-line summary, who should pick which
4. <h2>At a Glance: ${v.uni1 || 'NMIMS'} vs ${v.uni2 || 'Manipal'}</h2> — Comparison table with: NIRF Rank, NAAC Grade, Fees (total), Specialisations, Eligibility, Exam Mode, EMI Option
5. <h2>${v.uni1 || 'NMIMS'} Online ${v.program || 'MBA'} — Full Review</h2> — NIRF rank, fees breakdown, specialisations, pros (3), cons (2), who it is for
6. <h2>${v.uni2 || 'Manipal'} Online ${v.program || 'MBA'} — Full Review</h2> — same structure
7. <h2>Final Decision: Which One Should You Pick?</h2> — 3 clear profiles (budget student / career switcher / working professional)
8. <h2>Frequently Asked Questions</h2> — 5 FAQs with specific answers (not vague)

RULES:
- Output ONLY valid HTML (h2, h3, p, ul, li, table, thead, tbody, tr, th, td, strong, em)
- NO markdown, NO backticks, NO preamble, NO "Here is your blog post"
- Tone: Honest like a senior friend, not a sales pitch
- Include real fee numbers in INR
- Mention UGC DEB approval and why it matters for govt jobs`,
  },
  {
    id: 'program-guide',
    emoji: '📚',
    title: 'Program Complete Guide',
    desc: 'Deep dive into MBA / MCA / BBA / BCA — ranks for informational searches',
    fields: [
      { key: 'program', label: 'Program', placeholder: 'MBA' },
      { key: 'spec', label: 'Specialisation (optional)', placeholder: 'Finance' },
    ],
    buildPrompt: (v: Record<string, string>) =>
      `You are a senior education journalist in India. Write a 1800-word SEO guide for EdifyEdu.in.

TOPIC: Online ${v.program || 'MBA'}${v.spec ? ' in ' + v.spec : ''} in India 2025
TARGET KEYWORD: "online ${v.program || 'MBA'}${v.spec ? ' in ' + v.spec : ''} India 2025"

REQUIRED STRUCTURE:
1. Title: "Online ${v.program || 'MBA'}${v.spec ? ' in ' + v.spec : ''} India 2025: Complete Guide (UGC Approved)"
2. Meta Description (max 155 chars)
3. <h2>What Is Online ${v.program || 'MBA'}${v.spec ? ' in ' + v.spec : ''}?</h2>
4. <h2>Is It Valid? UGC DEB Explained</h2> — explain UGC DEB, why it matters, PSU eligibility, govt jobs
5. <h2>Top Universities for Online ${v.program || 'MBA'}${v.spec ? ' in ' + v.spec : ''}</h2> — table: University, NIRF Rank, NAAC, Fees, Eligibility
6. <h2>Curriculum: What Will You Study?</h2> — semester-wise breakdown (Sem 1–4 for PG, Sem 1–6 for UG)
7. <h2>Career Outcomes: Jobs, Roles & Salary</h2> — 6 roles with: Job Title | Avg Salary (INR LPA) | Top Employers
8. <h2>Is It Worth It? Honest ROI Analysis</h2>
9. <h2>Eligibility & How to Apply</h2>
10. <h2>Frequently Asked Questions</h2> — 5 FAQs

OUTPUT: Valid HTML only. No markdown. No preamble. Start directly with the title.`,
  },
  {
    id: 'university-review',
    emoji: '🏛️',
    title: 'University Review',
    desc: 'Honest single-university review — high commercial intent',
    fields: [
      { key: 'university', label: 'University Name', placeholder: 'LPU' },
      { key: 'program', label: 'Program', placeholder: 'MBA' },
      { key: 'nirf', label: 'NIRF Rank', placeholder: '27' },
      { key: 'naac', label: 'NAAC Grade', placeholder: 'A++' },
    ],
    buildPrompt: (v: Record<string, string>) =>
      `You are a senior education journalist in India. Write a 1700-word honest review for EdifyEdu.in.

TOPIC: ${v.university || 'LPU'} Online ${v.program || 'MBA'} Review 2025
TARGET KEYWORD: "${v.university || 'LPU'} online ${v.program || 'MBA'} review 2025"
NIRF Rank: ${v.nirf || '27'} | NAAC: ${v.naac || 'A++'}

REQUIRED STRUCTURE:
1. Title: "${v.university || 'LPU'} Online ${v.program || 'MBA'} Review 2025: Fees, Placements & Honest Verdict"
2. Meta Description (max 155 chars)
3. <h2>Quick Verdict (3 Lines)</h2> — who this is PERFECT for and who should AVOID it
4. <h2>About ${v.university || 'LPU'} Online</h2> — NIRF ${v.nirf || '27'}, NAAC ${v.naac || 'A++'}, UGC DEB, history, recognition
5. <h2>Fees & What You Actually Pay</h2> — total fees, semester-wise, hidden costs, EMI options
6. <h2>Programs & Specialisations</h2> — list all available online programs with fees
7. <h2>Curriculum & Learning Experience</h2> — exam mode, assignments, live classes, LMS platform
8. <h2>Placement & Career Support</h2> — honest assessment, what the university provides, alumni
9. <h2>Pros & Cons</h2> — 5 pros bullet list, 4 cons bullet list (be honest, not promotional)
10. <h2>Who Should Apply?</h2> — 3 specific student profiles that are ideal
11. <h2>Who Should NOT Apply?</h2> — 2 honest disqualifiers
12. <h2>Frequently Asked Questions</h2> — 5 specific FAQs

OUTPUT: Valid HTML only. No markdown. No preamble. Honest tone like a Reddit review.`,
  },
  {
    id: 'career-guide',
    emoji: '💼',
    title: 'Career After Degree',
    desc: 'Jobs, salary, companies — targets "jobs after online MBA" searches',
    fields: [
      { key: 'program', label: 'Program', placeholder: 'MBA' },
      { key: 'spec', label: 'Specialisation (optional)', placeholder: 'Finance' },
    ],
    buildPrompt: (v: Record<string, string>) =>
      `You are a career counsellor and education journalist in India. Write a 1500-word career guide for EdifyEdu.in.

TARGET KEYWORD: "jobs after online ${v.program || 'MBA'}${v.spec ? ' ' + v.spec : ''} India 2025"

REQUIRED STRUCTURE:
1. Title: "Jobs After Online ${v.program || 'MBA'}${v.spec ? ' in ' + v.spec : ''} India 2025: Salary, Roles & Top Companies"
2. Meta Description (max 155 chars)
3. <h2>Is an Online ${v.program || 'MBA'} Degree Valid for Jobs?</h2> — address the #1 concern upfront
4. <h2>Top 8 Career Paths After Online ${v.program || 'MBA'}${v.spec ? ' in ' + v.spec : ''}</h2>
   For each role: Job Title | Avg Salary (INR LPA) | Required Skills | Top 3 Employers
5. <h2>Salary Progression Table</h2> — Experience Level vs Salary vs Role (0-2yr, 3-5yr, 6-10yr, 10yr+)
6. <h2>Companies That Hire Online ${v.program || 'MBA'} Graduates</h2> — list 15 companies, mention their hiring patterns
7. <h2>How to Get a Job After Online ${v.program || 'MBA'} — Step by Step</h2> — practical 6-step plan
8. <h2>Online MBA vs Full-Time MBA for Job Outcomes</h2> — honest comparison table
9. <h2>Frequently Asked Questions</h2> — 5 FAQs with specific salary numbers

OUTPUT: Valid HTML only. No markdown. Use real INR salary figures.`,
  },
  {
    id: 'city-guide',
    emoji: '🏙️',
    title: 'City / State SEO Guide',
    desc: 'Hyper-local guide for a city — captures geo searches like "MBA in Lucknow"',
    fields: [
      { key: 'city', label: 'City', placeholder: 'Lucknow' },
      { key: 'state', label: 'State', placeholder: 'Uttar Pradesh' },
      { key: 'program', label: 'Program', placeholder: 'MBA' },
    ],
    buildPrompt: (v: Record<string, string>) =>
      `You are a local education expert in India. Write a 1400-word hyper-local SEO guide for EdifyEdu.in.

TARGET KEYWORD: "online ${v.program || 'MBA'} in ${v.city || 'Lucknow'} 2025"
LOCATION: ${v.city || 'Lucknow'}, ${v.state || 'Uttar Pradesh'}

REQUIRED STRUCTURE:
1. Title: "Online ${v.program || 'MBA'} in ${v.city || 'Lucknow'} 2025: Best UGC Approved Universities"
2. Meta Description (max 155 chars, mention ${v.city || 'Lucknow'})
3. <h2>Can You Do an Online ${v.program || 'MBA'} from ${v.city || 'Lucknow'}?</h2> — explain how online programs work, no need to relocate
4. <h2>Best Universities for Online ${v.program || 'MBA'} in ${v.state || 'Uttar Pradesh'}</h2> — table: NIRF, NAAC, Fees, Eligibility, Study Centres near ${v.city || 'Lucknow'}
5. <h2>Is Online ${v.program || 'MBA'} Valid for ${v.state || 'UP'} Government Jobs?</h2>
6. <h2>Study Centres & Exam Centres Near ${v.city || 'Lucknow'}</h2>
7. <h2>Cost Comparison: Online vs Regular ${v.program || 'MBA'} in ${v.city || 'Lucknow'}</h2>
8. <h2>Top Industries & Companies Hiring in ${v.city || 'Lucknow'} / ${v.state || 'UP'}</h2> — mention real local companies/industries
9. <h2>Success Stories: Online ${v.program || 'MBA'} Graduates from ${v.state || 'UP'}</h2> — write 2 fictional but realistic profiles
10. <h2>Frequently Asked Questions</h2> — 5 FAQs specific to ${v.city || 'Lucknow'} / ${v.state || 'UP'}

OUTPUT: Valid HTML only. Be hyper-specific to ${v.city || 'Lucknow'}. Mention real landmarks, industries, companies.`,
  },
  {
    id: 'fee-guide',
    emoji: '💰',
    title: 'Fees & Affordability Guide',
    desc: '"Online MBA fees India" — very high search volume keyword',
    fields: [
      { key: 'program', label: 'Program', placeholder: 'MBA' },
    ],
    buildPrompt: (v: Record<string, string>) =>
      `You are a financial education adviser in India. Write a 1400-word fees guide for EdifyEdu.in.

TARGET KEYWORD: "online ${v.program || 'MBA'} fees India 2025"

REQUIRED STRUCTURE:
1. Title: "Online ${v.program || 'MBA'} Fees in India 2025: University-Wise Comparison (₹50K to ₹4L)"
2. Meta Description (max 155 chars, include ₹ figures)
3. <h2>How Much Does an Online ${v.program || 'MBA'} Cost in India?</h2> — give a clear range upfront (₹50K–₹4L)
4. <h2>University-Wise Fee Comparison 2025</h2> — full table: University | Total Fee | Per Semester | EMI Option | NIRF Rank | NAAC
5. <h2>What Is Included in the Fee?</h2> — semester fees, exam fees, study material, LMS access, certification
6. <h2>Hidden Costs to Watch Out For</h2> — re-exam fees, backlog charges, study centre fees
7. <h2>EMI & Financing Options</h2> — which banks and NBFCs offer education loans for online programs
8. <h2>Government Scholarships for Online Programs</h2>
9. <h2>₹1 Lakh vs ₹3 Lakh Online MBA: What's the Real Difference?</h2> — honest value analysis
10. <h2>Frequently Asked Questions</h2> — 5 FAQs with exact fee numbers

OUTPUT: Valid HTML only. Use real ₹ figures. No vague ranges.`,
  },
]

const CATEGORIES = [
  'MBA Guides', 'MCA Guides', 'BBA Guides', 'BCA Guides',
  'B.Com Guides', 'University Reviews', 'Career Guides',
  'Eligibility', 'Comparison', 'State Guides', 'Fees & Finance',
]

function makeSlug(title: string) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 65)
}

function generateBlogCode(
  slug: string, title: string, metaDesc: string,
  category: string, keyword: string, content: string
): string {
  const today = new Date().toISOString().split('T')[0]
  const words = content.trim().split(/\s+/).length
  const readTime = Math.max(4, Math.round(words / 200))

  // Safely escape for template literal
  const safe = (s: string) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
  const safeStr = (s: string) => s.replace(/'/g, "\\'")

  return `  {
    slug: '${safeStr(slug)}',
    title: '${safeStr(title)}',
    metaDescription: '${safeStr(metaDesc)}',
    category: '${category}',
    tags: ['online degree', 'UGC approved', 'India 2025'],
    publishedAt: '${today}',
    readTime: ${readTime},
    targetKeyword: '${safeStr(keyword)}',
    relatedUniversities: ['nmims', 'manipal', 'lpu', 'amity'],
    status: 'published' as const,
    faqs: [],
    content: \`${safe(content.trim())}\`,
  },`
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function BlogWritePage() {
  const [step, setStep] = useState<'pick' | 'prompt' | 'paste' | 'code'>('pick')
  const [templateId, setTemplateId] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copiedKey, setCopiedKey] = useState('')

  // Paste step
  const [rawHTML, setRawHTML] = useState('')

  // Metadata
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [metaDesc, setMetaDesc] = useState('')
  const [category, setCategory] = useState('MBA Guides')
  const [keyword, setKeyword] = useState('')

  const template = TEMPLATES.find(t => t.id === templateId)

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 2000)
  }

  function handleGenerate() {
    if (!template) return
    setGeneratedPrompt(template.buildPrompt(fields))
    const kw = Object.values(fields).filter(Boolean).join(' ')
    setKeyword(kw)
    setStep('prompt')
  }

  function handleTitleBlur() {
    if (title && !slug) setSlug(makeSlug(title))
  }

  const finalCode = step === 'code'
    ? generateBlogCode(slug, title, metaDesc, category, keyword, rawHTML)
    : ''

  // ── SHARED BUTTON STYLES ──
  const btnPrimary: React.CSSProperties = {
    padding: '12px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer',
    fontSize: '14px', fontWeight: '700', background: '#c9922a', color: '#0f1b2d',
  }
  const btnGhost: React.CSSProperties = {
    padding: '12px 24px', borderRadius: '10px', border: '1px solid #1e2f45', cursor: 'pointer',
    fontSize: '14px', background: 'transparent', color: '#64748b',
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
    background: '#0f1b2d', border: '1px solid #2d4060', color: '#ffffff',
    outline: 'none', boxSizing: 'border-box',
  }

  const steps = [
    { key: 'pick', n: '1', label: 'Choose Template' },
    { key: 'prompt', n: '2', label: 'Copy Prompt' },
    { key: 'paste', n: '3', label: 'Paste Output' },
    { key: 'code', n: '4', label: 'Copy Code' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0f1b2d', color: '#ffffff' }}>
      {/* Top bar */}
      <div style={{ background: '#162032', borderBottom: '1px solid #1e2f45', padding: '14px 24px' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/blog" style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Blog
          </Link>
          <span style={{ color: '#2d4060' }}>›</span>
          <span style={{ color: '#c9922a', fontSize: '13px', fontWeight: '700' }}>✍️ Write New Post</span>
        </div>
      </div>

      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Progress indicator */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '36px', flexWrap: 'wrap' }}>
          {steps.map((s, i) => {
            const isActive = s.key === step
            const isDone = steps.findIndex(x => x.key === step) > i
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                  background: isActive ? '#c9922a' : isDone ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#0f1b2d' : isDone ? '#4ade80' : '#475569',
                  border: `1px solid ${isActive ? '#c9922a' : isDone ? 'rgba(34,197,94,0.3)' : '#1e2f45'}`,
                }}>
                  <span>{isDone ? '✓' : s.n}</span> {s.label}
                </div>
                {i < steps.length - 1 && <span style={{ color: '#1e2f45', fontSize: '14px' }}>→</span>}
              </div>
            )
          })}
        </div>

        {/* ── STEP 1: PICK TEMPLATE ── */}
        {step === 'pick' && (
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>What type of post?</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
              No API needed. Pick a template → get a ready prompt → ask Claude or ChatGPT → paste output here.
            </p>

            {/* How it works banner */}
            <div style={{ padding: '16px 20px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
              <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap' }}>💡 How it works:</span>
              {['1. Pick template', '2. Copy prompt', '3. Paste into Claude.ai (free)', '4. Copy output back here', '5. Get code to add to blog'].map((s, i) => (
                <span key={i} style={{ color: '#64748b', fontSize: '12px' }}>{s} {i < 4 ? '→' : ''}</span>
              ))}
            </div>

            {/* Template grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px', marginBottom: '28px' }}>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => { setTemplateId(t.id); setFields({}) }}
                  style={{
                    padding: '18px', borderRadius: '14px', textAlign: 'left', cursor: 'pointer',
                    background: templateId === t.id ? 'rgba(201,146,42,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `2px solid ${templateId === t.id ? '#c9922a' : '#1e2f45'}`,
                    transition: 'border-color 0.15s',
                  }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{t.emoji}</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#ffffff', marginBottom: '5px' }}>{t.title}</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>{t.desc}</div>
                </button>
              ))}
            </div>

            {/* Fields for selected template */}
            {template && (
              <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '14px', padding: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' }}>
                  {template.emoji} {template.title} — Fill Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                  {template.fields.map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>{f.label}</label>
                      <input
                        value={fields[f.key] || ''}
                        onChange={e => setFields(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={handleGenerate} style={btnPrimary}>
                  Generate Prompt →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: SHOW PROMPT ── */}
        {step === 'prompt' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>Your Prompt is Ready</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              Copy this → open{' '}
              <a href="https://claude.ai/new" target="_blank" rel="noopener" style={{ color: '#c9922a' }}>claude.ai</a>
              {' '}or{' '}
              <a href="https://chat.openai.com" target="_blank" rel="noopener" style={{ color: '#c9922a' }}>ChatGPT</a>
              {' '}(both free) → paste → copy the HTML output → come back
            </p>

            {/* Quick links */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <a href="https://claude.ai/new" target="_blank" rel="noopener"
                style={{ padding: '9px 18px', borderRadius: '8px', background: 'rgba(201,146,42,0.1)', border: '1px solid #c9922a', color: '#c9922a', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ExternalLink size={12} /> Claude.ai (Free)
              </a>
              <a href="https://chat.openai.com" target="_blank" rel="noopener"
                style={{ padding: '9px 18px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid #1e2f45', color: '#64748b', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ExternalLink size={12} /> ChatGPT (Free)
              </a>
            </div>

            {/* Prompt box */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <div style={{
                background: '#0a1220', border: '1px solid #1e2f45', borderRadius: '12px',
                padding: '20px 20px 20px 20px', fontFamily: 'monospace', fontSize: '13px',
                color: '#94a3b8', lineHeight: '1.75', whiteSpace: 'pre-wrap',
                maxHeight: '420px', overflowY: 'auto',
              }}>
                {generatedPrompt}
              </div>
              <button onClick={() => copy(generatedPrompt, 'prompt')}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '700',
                  background: copiedKey === 'prompt' ? '#22c55e' : '#c9922a',
                  color: '#0f1b2d', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                {copiedKey === 'prompt' ? <><CheckCircle size={12} /> Copied!</> : <><Copy size={12} /> Copy Prompt</>}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('pick')} style={btnGhost}>← Back</button>
              <button onClick={() => setStep('paste')} style={btnPrimary}>I have the output → Paste it</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: PASTE OUTPUT + METADATA ── */}
        {step === 'paste' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>Paste the Article + Fill Metadata</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              Paste the HTML output from Claude/ChatGPT below. Fill in the metadata fields. Then generate the code.
            </p>

            {/* Metadata */}
            <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#c9922a', textTransform: 'uppercase', marginBottom: '16px' }}>Blog Metadata</div>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Post Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} onBlur={handleTitleBlur}
                    placeholder="NMIMS vs Manipal Online MBA 2025: Honest Comparison"
                    style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>URL Slug * <span style={{ color: '#475569', fontWeight: '400', textTransform: 'none', fontSize: '10px' }}>(auto-fills from title)</span></label>
                    <input value={slug} onChange={e => setSlug(e.target.value)}
                      placeholder="nmims-vs-manipal-online-mba-2025"
                      style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px', color: '#a78bfa' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      style={{ ...inputStyle }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Meta Description * <span style={{ fontWeight: '400', color: metaDesc.length > 145 ? '#f59e0b' : '#475569' }}>({metaDesc.length}/155)</span>
                  </label>
                  <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value.slice(0, 155))}
                    placeholder="Honest comparison of NMIMS vs Manipal online MBA. Fees, NIRF rank, specialisations, and which one is right for you in 2025."
                    rows={2}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5', fontFamily: 'inherit' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Target Keyword</label>
                  <input value={keyword} onChange={e => setKeyword(e.target.value)}
                    placeholder="NMIMS vs Manipal online MBA 2025"
                    style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Paste area */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Paste AI-Generated HTML Here *
                {rawHTML && <span style={{ fontWeight: '400', color: '#475569', marginLeft: '8px' }}>({rawHTML.trim().split(/\s+/).length} words)</span>}
              </label>
              <textarea
                value={rawHTML}
                onChange={e => setRawHTML(e.target.value)}
                placeholder={`<h2>Quick Verdict</h2>\n<p>NMIMS is better for...</p>\n...paste the full HTML output from Claude or ChatGPT here...`}
                rows={16}
                style={{
                  ...inputStyle,
                  fontFamily: 'monospace', fontSize: '12px', resize: 'vertical',
                  lineHeight: '1.6', color: '#94a3b8', background: '#0a1220',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('prompt')} style={btnGhost}>← Back</button>
              <button
                onClick={() => { if (rawHTML.trim() && title) setStep('code') }}
                disabled={!rawHTML.trim() || !title}
                style={{ ...btnPrimary, opacity: rawHTML && title ? 1 : 0.4, cursor: rawHTML && title ? 'pointer' : 'not-allowed' }}>
                Generate Blog Code →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: FINAL CODE ── */}
        {step === 'code' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>✓</div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Blog Code Ready</h2>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              Copy this code → open{' '}
              <code style={{ background: '#1e2f45', padding: '2px 7px', borderRadius: '4px', color: '#c9922a', fontSize: '12px' }}>lib/blog.ts</code>
              {' '}→ paste it inside the{' '}
              <code style={{ background: '#1e2f45', padding: '2px 7px', borderRadius: '4px', color: '#a78bfa', fontSize: '12px' }}>BLOG_POSTS = [</code>
              {' '}array (add it as the first item)
            </p>

            {/* Step-by-step add instructions */}
            <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
              <div style={{ color: '#4ade80', fontWeight: '700', fontSize: '13px', marginBottom: '12px' }}>📂 How to add this to your website</div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {[
                  ['Open VS Code', 'Navigate to lib/blog.ts in your project'],
                  ['Find the array', "Look for: export const BLOG_POSTS: BlogPost[] = ["],
                  ['Paste the code', 'Add the copied code right after the opening [  on the next line'],
                  ['Save the file', 'Ctrl+S — Next.js will auto-rebuild'],
                  ['View your post', `Go to /blog/${slug || 'your-slug'} to see it live`],
                ].map(([title, detail], i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ background: '#c9922a', color: '#0f1b2d', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                    <div>
                      <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '13px' }}>{title}</span>
                      <span style={{ color: '#64748b', fontSize: '13px' }}> — {detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code block */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <pre style={{
                background: '#060e18', border: '1px solid #1e2f45', borderRadius: '12px',
                padding: '20px', fontSize: '11.5px', fontFamily: '"Fira Code", "Courier New", monospace',
                color: '#94a3b8', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                maxHeight: '480px', overflowY: 'auto', margin: 0, lineHeight: '1.65',
              }}>
                {finalCode}
              </pre>
              <button onClick={() => copy(finalCode, 'code')}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '700',
                  background: copiedKey === 'code' ? '#22c55e' : '#c9922a',
                  color: '#0f1b2d', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                {copiedKey === 'code' ? <><CheckCircle size={12} /> Copied!</> : <><Copy size={12} /> Copy Code</>}
              </button>
            </div>

            {/* Post summary */}
            <div style={{ background: '#162032', border: '1px solid #1e2f45', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Post URL', value: '/blog/' + (slug || '…') },
                { label: 'Category', value: category },
                { label: 'Word Count', value: rawHTML.trim().split(/\s+/).length + ' words' },
                { label: 'Read Time', value: Math.max(4, Math.round(rawHTML.trim().split(/\s+/).length / 200)) + ' min read' },
                { label: 'Keyword', value: keyword || '—' },
              ].map(r => (
                <div key={r.label}>
                  <div style={{ fontSize: '10px', color: '#475569', fontWeight: '700', textTransform: 'uppercase', marginBottom: '3px' }}>{r.label}</div>
                  <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '600', wordBreak: 'break-all' }}>{r.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setStep('pick'); setTemplateId(''); setRawHTML(''); setTitle(''); setSlug(''); setMetaDesc(''); setFields({}); setKeyword(''); }}
                style={btnGhost}>
                Write Another Post
              </button>
              <Link href="/blog"
                style={{ padding: '12px 24px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80', fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}>
                View Blog →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
