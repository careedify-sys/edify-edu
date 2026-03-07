// @ts-nocheck
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Copy, CheckCircle, Save, Eye, FileText,
  Bold, Italic, List, Heading2, Quote, Link2, Code,
  Plus, Trash2, Tag, Clock, Hash
} from 'lucide-react'
import type { BlogPost } from '@/lib/blog'

/* ── CATEGORIES & HELPERS ─────────────────────────────────────────── */
const CATEGORIES = [
  'MBA Guides', 'MCA Guides', 'BBA Guides', 'BCA Guides',
  'Validity & Recognition', 'Career Guides', 'University Reviews',
  'Fees & Finance', 'City Guides', 'Comparison'
]

function slugify(title: string) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function estimateReadTime(content: string) {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/* ── TOOLBAR BUTTON ───────────────────────────────────────────────── */
function ToolBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      style={{
        padding: '6px 10px', borderRadius: 8, border: '1px solid #E2E8F4',
        background: '#fff', cursor: 'pointer', fontSize: 12,
        color: '#475569', display: 'flex', alignItems: 'center', gap: 4,
        fontFamily: 'inherit', transition: 'all 0.1s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8F9FC' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}
    >
      {icon}
    </button>
  )
}

function insertIntoTextarea(id: string, before: string, after = '', placeholder = 'text here') {
  const el = document.getElementById(id) as HTMLTextAreaElement
  if (!el) return
  const start = el.selectionStart, end = el.selectionEnd
  const selected = el.value.slice(start, end)
  const replacement = before + (selected || placeholder) + after
  el.setRangeText(replacement, start, end, 'select')
  el.focus()
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function BlogWritePage() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [metaDesc, setMetaDesc] = useState('')
  const [category, setCategory] = useState('MBA Guides')
  const [targetKeyword, setTargetKeyword] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [content, setContent] = useState('')
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([{ q: '', a: '' }])
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [preview, setPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  // Auto-generate slug from title
  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slugEdited) setSlug(slugify(val))
  }

  function handleCopyCode() {
    const now = new Date().toISOString().split('T')[0]
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const post: BlogPost = {
      slug: slug || slugify(title),
      title,
      metaDescription: metaDesc,
      category,
      tags,
      publishedAt: now,
      readTime: estimateReadTime(content),
      content,
      faqs: faqs.filter(f => f.q && f.a),
      relatedUniversities: [],
      targetKeyword,
      status,
    }

    const code = `  {
    slug: '${post.slug}',
    title: '${post.title.replace(/'/g, "\\'")}',
    metaDescription: '${post.metaDescription.replace(/'/g, "\\'")}',
    category: '${post.category}',
    tags: [${post.tags.map(t => `'${t}'`).join(', ')}],
    publishedAt: '${post.publishedAt}',
    readTime: ${post.readTime},
    targetKeyword: '${post.targetKeyword}',
    relatedUniversities: [],
    status: '${post.status}',
    faqs: [\n${post.faqs.map(f => `      { q: '${f.q.replace(/'/g, "\\'")}', a: '${f.a.replace(/'/g, "\\'")}' }`).join(',\n')}\n    ],
    content: \`\n${post.content}\n    \`,
  },`

    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  const readTime = estimateReadTime(content)
  const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  const metaDescColor = metaDesc.length < 120 ? '#DC2626' : metaDesc.length > 160 ? '#DC2626' : '#15803D'

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FC' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F4', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 13 }}>
              <ArrowLeft size={14} /> Admin
            </Link>
            <span style={{ color: '#E2E8F4' }}>›</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0B1D35' }}>Write New Post</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setPreview(!preview)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid #E2E8F4', background: preview ? '#0B1D35' : '#fff', color: preview ? '#fff' : '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Eye size={14} /> {preview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleCopyCode}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: copied ? '#15803D' : 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* HOW TO PUBLISH — Instructions box */}
        <div style={{ marginBottom: 24, padding: '16px 20px', background: 'rgba(200,129,26,0.06)', border: '1px solid rgba(200,129,26,0.2)', borderRadius: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#C8811A', marginBottom: 8 }}>📋 How to Publish Your Blog Post</div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#475569', lineHeight: 1.8 }}>
            <li>Fill in all fields below (title, meta description, content, FAQs)</li>
            <li>Click <strong>"Copy Code"</strong> — this copies the formatted TypeScript object</li>
            <li>Open <code style={{ background: '#F8F9FC', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>lib/blog.ts</code> in your code editor</li>
            <li>Paste inside the <code style={{ background: '#F8F9FC', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>BLOG_POSTS</code> array (before the last <code style={{ background: '#F8F9FC', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>]</code>)</li>
            <li>Save the file and redeploy — your post will be live immediately</li>
          </ol>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'flex-start' }}>

          {/* ── MAIN FORM ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {preview ? (
              /* ── PREVIEW MODE ── */
              <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 32 }}>
                <div style={{ maxWidth: 720 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#C8811A', textTransform: 'uppercase', marginBottom: 8 }}>{category}</div>
                  <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#0B1D35', lineHeight: 1.25, marginBottom: 12 }}>{title || 'Your Title Here'}</h1>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>{metaDesc || 'Meta description preview...'}</p>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>⏱ {readTime} min read · {wordCount} words</div>
                  <div
                    style={{ fontSize: 15, color: '#334155', lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: content || '<p style="color:#94a3b8">Your content will appear here...</p>' }}
                  />
                  {faqs.some(f => f.q && f.a) && (
                    <div style={{ marginTop: 32 }}>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0B1D35', marginBottom: 12 }}>Frequently Asked Questions</h2>
                      {faqs.filter(f => f.q && f.a).map((faq, i) => (
                        <div key={i} style={{ marginBottom: 12, padding: '14px 18px', background: '#F8F9FC', borderRadius: 12, border: '1px solid #E2E8F4' }}>
                          <div style={{ fontWeight: 700, color: '#0B1D35', fontSize: 14, marginBottom: 6 }}>Q: {faq.q}</div>
                          <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{faq.a}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Title */}
                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#C8811A', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                    Post Title *
                  </label>
                  <input
                    value={title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="e.g. Online MBA vs Full-Time MBA in India 2025: Honest Comparison"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F4', fontSize: 15, fontWeight: 600, color: '#0B1D35', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Slug:</span>
                    <input
                      value={slug}
                      onChange={e => { setSlug(e.target.value); setSlugEdited(true) }}
                      style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: '1px solid #E2E8F4', fontSize: 11, color: '#64748b', outline: 'none', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                {/* Meta Description */}
                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#C8811A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Meta Description * (150–160 chars for SEO)
                    </label>
                    <span style={{ fontSize: 12, fontWeight: 700, color: metaDescColor }}>{metaDesc.length}/160</span>
                  </div>
                  <textarea
                    value={metaDesc}
                    onChange={e => setMetaDesc(e.target.value)}
                    rows={2}
                    placeholder="Describe the post in 150–160 characters. This shows in Google search results."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F4', fontSize: 13, color: '#0B1D35', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
                  />
                  <div style={{ marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
                    💡 Start with the primary keyword. E.g. &quot;Compare online MBA fees at NMIMS, Manipal and LPU. Honest 2025 guide with salary data and real reviews.&quot;
                  </div>
                </div>

                {/* Content Editor */}
                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F4', background: 'rgba(200,129,26,0.04)' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#C8811A', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
                      Blog Content * (HTML — write naturally, wrap in tags)
                    </label>
                    {/* Toolbar */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <ToolBtn icon={<><Heading2 size={12}/> H2</>} label="Heading 2" onClick={() => insertIntoTextarea('blog-content', '<h2>', '</h2>', 'Your heading')} />
                      <ToolBtn icon={<span style={{fontSize:11,fontWeight:700}}>H3</span>} label="Heading 3" onClick={() => insertIntoTextarea('blog-content', '<h3>', '</h3>', 'Sub-heading')} />
                      <ToolBtn icon={<Bold size={12}/>} label="Bold" onClick={() => insertIntoTextarea('blog-content', '<strong>', '</strong>')} />
                      <ToolBtn icon={<Italic size={12}/>} label="Italic" onClick={() => insertIntoTextarea('blog-content', '<em>', '</em>')} />
                      <ToolBtn icon={<List size={12}/>} label="List" onClick={() => insertIntoTextarea('blog-content', '<ul>\n  <li>', '</li>\n  <li>item</li>\n</ul>', 'item')} />
                      <ToolBtn icon={<span style={{fontSize:11}}>1.</span>} label="Numbered List" onClick={() => insertIntoTextarea('blog-content', '<ol>\n  <li>', '</li>\n  <li>item</li>\n</ol>', 'item')} />
                      <ToolBtn icon={<><span style={{fontSize:11}}>¶</span></>} label="Paragraph" onClick={() => insertIntoTextarea('blog-content', '<p>', '</p>', 'Your paragraph text')} />
                      <ToolBtn icon={<Quote size={12}/>} label="Callout box" onClick={() => insertIntoTextarea('blog-content', '<div class="callout">', '</div>', 'Key insight or stat')} />
                      <ToolBtn icon={<><span style={{fontSize:10}}>TBL</span></>} label="Table" onClick={() => insertIntoTextarea('blog-content', '<table>\n  <thead><tr><th>Column 1</th><th>Column 2</th></tr></thead>\n  <tbody>\n    <tr><td>', '</td><td>value</td></tr>\n  </tbody>\n</table>', 'value')} />
                      <ToolBtn icon={<Link2 size={12}/>} label="Internal link" onClick={() => insertIntoTextarea('blog-content', '<a href="/universities/nmims">', '</a>', 'NMIMS Online')} />
                      <ToolBtn icon={<Code size={12}/>} label="Code" onClick={() => insertIntoTextarea('blog-content', '<code>', '</code>')} />
                    </div>
                  </div>
                  <textarea
                    id="blog-content"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={24}
                    placeholder={`Write your content in HTML. Example:\n\n<h2>Who Should Do an Online MBA?</h2>\n<p>An online MBA makes sense if you are already working and want to move into management without quitting your job.</p>\n\n<h2>Top Universities for Online MBA in India 2025</h2>\n<p>All programs below are UGC DEB approved.</p>\n<ul>\n  <li><strong>Manipal University Online</strong> — NIRF #40, fees ₹1.4L–₹2L</li>\n  <li><strong>LPU Online</strong> — NIRF #42, fees ₹75K–₹1.8L</li>\n</ul>`}
                    style={{ width: '100%', padding: '16px', fontSize: 13, fontFamily: 'monospace', color: '#334155', border: 'none', outline: 'none', resize: 'vertical', lineHeight: 1.7, minHeight: 480, boxSizing: 'border-box' }}
                  />
                  <div style={{ padding: '8px 16px', borderTop: '1px solid #E2E8F4', background: '#F8F9FC', display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8' }}>
                    <span>📝 {wordCount} words</span>
                    <span>⏱ {readTime} min read</span>
                    <span>🎯 Target: 1500–2500 words for best SEO</span>
                  </div>
                </div>

                {/* FAQs */}
                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#C8811A', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                        FAQs * (adds JSON-LD schema for Google rich snippets)
                      </label>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Use real questions from Google &quot;People Also Ask&quot;</div>
                    </div>
                    <button
                      onClick={() => setFaqs([...faqs, { q: '', a: '' }])}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #C8811A', color: '#C8811A', background: 'transparent', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <Plus size={12} /> Add FAQ
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {faqs.map((faq, i) => (
                      <div key={i} style={{ padding: 14, background: '#F8F9FC', borderRadius: 12, border: '1px solid #E2E8F4' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>FAQ {i + 1}</span>
                          {faqs.length > 1 && (
                            <button onClick={() => setFaqs(faqs.filter((_, j) => j !== i))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}>
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <input
                          value={faq.q}
                          onChange={e => { const f = [...faqs]; f[i] = { ...f[i], q: e.target.value }; setFaqs(f) }}
                          placeholder="e.g. Is online MBA valid for government jobs in India?"
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E2E8F4', fontSize: 13, fontWeight: 600, color: '#0B1D35', outline: 'none', marginBottom: 8, fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                        <textarea
                          value={faq.a}
                          onChange={e => { const f = [...faqs]; f[i] = { ...f[i], a: e.target.value }; setFaqs(f) }}
                          rows={2}
                          placeholder="Write a clear, direct answer. 2–4 sentences. Use facts when possible."
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E2E8F4', fontSize: 13, color: '#475569', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>

            {/* Status */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#C8811A', textTransform: 'uppercase', marginBottom: 12 }}>Publish Status</div>
              {(['draft', 'published'] as const).map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', borderRadius: 8, marginBottom: 6, border: `1px solid ${status === s ? '#C8811A' : '#E2E8F4'}`, background: status === s ? 'rgba(200,129,26,0.08)' : 'transparent', color: status === s ? '#C8811A' : '#64748b', fontSize: 13, fontWeight: status === s ? 700 : 500, cursor: 'pointer', textTransform: 'capitalize' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s === 'published' ? '#15803D' : '#94a3b8' }} />
                  {s}
                </button>
              ))}
            </div>

            {/* Category + Keyword */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#C8811A', textTransform: 'uppercase', marginBottom: 12 }}>SEO Settings</div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E2E8F4', fontSize: 13, color: '#0B1D35', outline: 'none', fontFamily: 'inherit' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Primary Keyword</label>
                <input value={targetKeyword} onChange={e => setTargetKeyword(e.target.value)}
                  placeholder="e.g. online MBA India 2025"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E2E8F4', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Put this in H1, first 100 words, meta desc</div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Tags (comma separated)</label>
                <input value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                  placeholder="online MBA, UGC approved, India 2025"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E2E8F4', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* SEO Checklist */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#C8811A', textTransform: 'uppercase', marginBottom: 12 }}>SEO Checklist</div>
              {[
                { check: title.length >= 40 && title.length <= 65, label: `Title 40–65 chars (${title.length})` },
                { check: metaDesc.length >= 120 && metaDesc.length <= 160, label: `Meta 120–160 chars (${metaDesc.length})` },
                { check: targetKeyword.length > 0, label: 'Primary keyword set' },
                { check: wordCount >= 1000, label: `Min 1000 words (${wordCount})` },
                { check: faqs.filter(f => f.q && f.a).length >= 3, label: `Min 3 FAQs (${faqs.filter(f => f.q && f.a).length})` },
                { check: content.includes('<h2>'), label: 'Has H2 headings' },
                { check: slug.length > 0, label: 'Slug generated' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, fontSize: 12 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: item.check ? '#15803D' : '#E2E8F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.check && <CheckCircle size={10} color="#fff" />}
                  </div>
                  <span style={{ color: item.check ? '#15803D' : '#94a3b8' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Copy button */}
            <button onClick={handleCopyCode}
              style={{ width: '100%', padding: 14, borderRadius: 12, background: copied ? '#15803D' : 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {copied ? <><CheckCircle size={16} /> Copied to Clipboard!</> : <><Copy size={16} /> Copy Code to Publish</>}
            </button>

            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, padding: '0 4px' }}>
              After copying: paste into <code style={{ background: '#F8F9FC', padding: '1px 4px', borderRadius: 4, fontSize: 10 }}>lib/blog.ts</code> → <code style={{ background: '#F8F9FC', padding: '1px 4px', borderRadius: 4, fontSize: 10 }}>BLOG_POSTS</code> array → save → redeploy.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
