// Server-rendered building blocks shared by the nine /online-dba pages.

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const DBA_BASE = 'https://edifyedu.in'

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export interface Crumb { name: string; path: string }

/** Visible breadcrumb plus its BreadcrumbList schema. */
export function DbaBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const all: Crumb[] = [{ name: 'Home', path: '/' }, ...crumbs]
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: `${DBA_BASE}${c.path === '/' ? '' : c.path}`,
          })),
        }}
      />
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs mb-4" style={{ color: '#64748b' }}>
        {all.map((c, i) => (
          <span key={c.path} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} />}
            {i === all.length - 1
              ? <span style={{ color: '#0f172a' }}>{c.name}</span>
              : <Link href={c.path} className="hover:underline" style={{ color: '#64748b' }}>{c.name}</Link>}
          </span>
        ))}
      </nav>
    </>
  )
}

export interface Faq { q: string; a: string }

/**
 * FAQ with FAQPage schema. Rendered as <details> so every answer is in the
 * server HTML, not only the one an accordion happens to have open.
 */
export function DbaFaq({ faqs, title = 'Frequently asked questions' }: { faqs: Faq[]; title?: string }) {
  return (
    <section className="my-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />
      <h2 className="text-xl font-bold mb-4" style={{ color: '#0f172a' }}>{title}</h2>
      <div className="space-y-2">
        {faqs.map(f => (
          <details key={f.q} className="rounded-lg border bg-white" style={{ borderColor: '#e2e8f0' }}>
            <summary className="cursor-pointer px-4 py-3.5 text-[15px] font-semibold" style={{ color: '#0f172a' }}>
              {f.q}
            </summary>
            <p className="px-4 pb-4 text-[15px] leading-relaxed" style={{ color: '#334155' }}>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

/** Compact CTA under the verdict. Plain anchor: works without JS. */
export function DbaCompactCta({ target = 'dba-enquiry' }: { target?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl p-4 my-6" style={{ background: '#f1f5f9' }}>
      <p className="text-[15px] flex-1" style={{ color: '#0f172a' }}>
        Not sure a DBA will hold up for your goal? Get a free check before you pay any booking amount.
      </p>
      <a
        href={`#${target}`}
        className="inline-flex justify-center font-bold rounded-xl px-5 py-3 text-sm no-underline"
        style={{ background: '#f97316', color: '#ffffff' }}
      >
        Get the free DBA check
      </a>
    </div>
  )
}

const SECTION_LINKS = [
  { href: '/online-dba', label: 'Online DBA: validity and programmes' },
  { href: '/online-dba/dba-vs-phd', label: 'DBA vs PhD in India' },
  { href: '/online-dba/dba-fees', label: 'DBA course fees compared' },
]

/** Links from every child back to the pillar, the PhD comparison and the fee page. */
export function DbaSectionLinks({ current }: { current: string }) {
  const links = SECTION_LINKS.filter(l => l.href !== current)
  return (
    <nav aria-label="Online DBA section" className="flex flex-wrap gap-2 my-8">
      {links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          className="text-sm font-semibold px-4 py-2 rounded-lg no-underline"
          style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0' }}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  )
}

export function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return <h2 id={id} className="text-xl sm:text-2xl font-bold mt-10 mb-3 scroll-mt-24" style={{ color: '#0f172a' }}>{children}</h2>
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-bold mt-6 mb-2" style={{ color: '#0f172a' }}>{children}</h3>
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] sm:text-base leading-relaxed mb-3" style={{ color: '#334155' }}>{children}</p>
}

export function DbaPage({ children }: { children: React.ReactNode }) {
  return (
    <article data-dba-content className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {children}
    </article>
  )
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left text-xs font-bold uppercase tracking-wide px-3 py-2.5" style={{ color: '#ffffff', background: '#0f172a' }}>{children}</th>
}

export function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2.5 text-sm align-top border-b" style={{ color: '#334155', borderColor: '#e2e8f0' }}>{children}</td>
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border my-4" style={{ borderColor: '#e2e8f0' }}>
      <table className="w-full border-collapse bg-white">{children}</table>
    </div>
  )
}
