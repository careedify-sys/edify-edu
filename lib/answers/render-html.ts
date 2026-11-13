// lib/answers/render-html.ts
// AnswerSection[] -> HTML for blog appendices and generic pages. Body starts at
// H2 (house rule), no em dashes, links only to internal paths or to the three
// approved registers.
import type { AnswerSection } from './university-answers'

const EXTERNAL_OK = /^https:\/\/(www\.)?(deb\.ugc\.ac\.in|naac\.gov\.in|nirfindia\.org)(\/|$)/

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Escape, then turn [label](href) into a link. Throws on a disallowed href. */
export function inline(s: string): string {
  return esc(s).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, href: string) => {
    if (href.startsWith('/')) return `<a href="${href}">${label}</a>`
    if (EXTERNAL_OK.test(href)) return `<a href="${href}" target="_blank" rel="noopener">${label}</a>`
    throw new Error(`render-html: link not allowed: ${href}`)
  })
}

export function sectionHtml(s: AnswerSection): string {
  const parts: string[] = []
  parts.push(`<h2 id="${s.key}">${esc(s.heading)}</h2>`)
  parts.push(`<p>${inline(s.lead)}</p>`)
  if (s.table) {
    parts.push('<table>')
    parts.push('<thead><tr>' + s.table.head.map(h => `<th>${esc(h)}</th>`).join('') + '</tr></thead>')
    parts.push('<tbody>' + s.table.rows.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody>')
    parts.push('</table>')
  }
  if (s.footnote) parts.push(`<p><em>${esc(s.footnote)}</em></p>`)
  if (s.bullets?.length) parts.push('<ul>' + s.bullets.map(b => `<li>${inline(b)}</li>`).join('') + '</ul>')
  if (s.notPublished) parts.push(`<p class="callout-key">${inline(s.notPublished)}</p>`)
  return parts.join('\n')
}

export const APPENDIX_START = '<!-- ai-answers:start -->'
export const APPENDIX_END = '<!-- ai-answers:end -->'

export function appendixHtml(sections: AnswerSection[], extra: string[] = []): string {
  const body = [...sections.map(sectionHtml), ...extra].join('\n')
  return `\n${APPENDIX_START}\n${body}\n<p class="cta-box">edifyedu.in compares public UGC/NAAC/NIRF data, no paid rankings. Talk to our counsellor at <a href="/contact">edifyedu.in/contact</a> before you pay any fee.</p>\n${APPENDIX_END}\n`
}
