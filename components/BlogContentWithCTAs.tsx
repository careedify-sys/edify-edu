'use client'

import BlogCTACard from './BlogCTACard'

type Variant = 'compare' | 'counsel' | 'verify' | 'shortlist'

const CTA_TOKEN = /<div class="blog-cta-spot" data-variant="(\w+)"><\/div>/g

export default function BlogContentWithCTAs({ html }: { html: string }) {
  // Split HTML at CTA tokens
  const parts: { type: 'html' | 'cta'; content: string; variant?: Variant }[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  const regex = new RegExp(CTA_TOKEN.source, 'g')
  while ((match = regex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'html', content: html.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'cta', content: '', variant: match[1] as Variant })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < html.length) {
    parts.push({ type: 'html', content: html.slice(lastIndex) })
  }

  // If no CTA tokens found, render plain HTML
  if (parts.length === 0) {
    return <div className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div className="prose-article">
      {parts.map((part, i) =>
        part.type === 'html' ? (
          <div key={i} dangerouslySetInnerHTML={{ __html: part.content }} />
        ) : (
          <BlogCTACard key={i} variant={part.variant || 'counsel'} />
        )
      )}
    </div>
  )
}
