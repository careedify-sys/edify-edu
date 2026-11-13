// Shared bits for the first-hand sections (lib/data/first-hand/). No hooks, so
// the university page's client component and the server hubs can both use them.
import Link from 'next/link'
import { Fragment } from 'react'

/** Renders "[text](/path)" as a link; external hosts allowed only for the three regulators. */
export function FirstHandText({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const href = m[2]
    parts.push(href.startsWith('/')
      ? <Link key={m.index} href={href} className="font-semibold underline" style={{ color: '#0f172a' }}>{m[1]}</Link>
      : href.startsWith('#')
        ? <a key={m.index} href={href} className="font-semibold underline" style={{ color: '#0f172a' }}>{m[1]}</a>
        : <a key={m.index} href={href} rel="noopener" target="_blank" className="font-semibold underline">{m[1]}</a>)
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>
}

export function FirstHandByline({ author, subject, reviewedOnText }: { author: string; subject: string; reviewedOnText: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <img src="/authors/rishi-avatar-sm.svg" alt={author} width={40} height={40} className="rounded-full shrink-0" loading="lazy" />
      <p className="text-sm text-slate-600 leading-relaxed m-0">
        <strong style={{ color: '#0f172a' }}>By {author}, founder of edifyedu.in.</strong> Rishi has spoken to more than 1,000 students about online degrees. This section is based on his conversations with students about {subject}. Reviewed {reviewedOnText}.
      </p>
    </div>
  )
}

export function BulletList({ items, tone = 'neutral', sep = ' ' }: { items: { name?: string; text: string }[]; tone?: 'good' | 'bad' | 'neutral'; sep?: string }) {
  const dot = tone === 'good' ? '#10b981' : tone === 'bad' ? '#ef4444' : '#64748b'
  return (
    <ul className="space-y-2 m-0 p-0 list-none">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
          <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
          <span>{it.name ? <strong style={{ color: '#0f172a' }}>{it.name}</strong> : null}{it.name && it.text ? sep : ''}<FirstHandText text={it.text} /></span>
        </li>
      ))}
    </ul>
  )
}
