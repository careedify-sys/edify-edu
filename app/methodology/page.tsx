// app/methodology/page.tsx
//
// Why this page exists. A live Perplexity test on 2026-09-28 cited EdifyEdu
// exactly once in a "best online MBA India" answer, and the citation was on the
// verification steps, not on the recommendation. The site already wins method
// citations and had no page stating its method. This is that page.
//
// Every number here is derived at build time from the same sources the site
// renders from. Nothing is hardcoded, because a methodology page that goes
// stale is worse than none at all: it would be a claim about accuracy that is
// itself inaccurate.

import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { UNIVERSITIES, getUniversitiesByProgram, type Program, type University } from '@/lib/data'
import { getDisplayFee } from '@/lib/fees'
import naacSnapshot from '@/data/naac-verified.json'

const BASE = 'https://edifyedu.in'

export const metadata: Metadata = {
  title: 'Methodology: How EdifyEdu Verifies What It Publishes',
  description:
    'Where every figure on EdifyEdu comes from, when it was last checked, and what we do when a NAAC cycle lapses or a fee cannot be stood behind. No commission, no paid rankings.',
  alternates: { canonical: `${BASE}/methodology` },
  openGraph: {
    title: 'Methodology: How EdifyEdu Verifies What It Publishes',
    description:
      'Where every figure comes from, when it was checked, and what we do when we cannot verify something.',
    url: `${BASE}/methodology`,
    type: 'article',
  },
  robots: { index: true, follow: true },
}

const snapshot = (naacSnapshot as {
  refreshedAt?: string
  grades: Record<string, { grade: string; validTill: string | null }>
})

function verifiedNaac(id: string, today: Date) {
  const g = snapshot.grades[id]
  if (!g) return null
  if (g.validTill && new Date(g.validTill) < today) return null
  return g
}

export default function MethodologyPage() {
  const today = new Date()
  const asOf = today.toISOString().slice(0, 10)

  // Worked example. MBA is the flagship programme and the one a reader is most
  // likely to check us on, so the live counts quoted below are its counts.
  const mba = getUniversitiesByProgram('MBA') as University[]
  const mbaNaacOk = mba.filter(u => verifiedNaac(u.id, today)).length
  const mbaNaacNot = mba.length - mbaNaacOk
  const mbaFeeNot = mba.filter(u => !(getDisplayFee(u, 'MBA' as Program) as { ok: boolean }).ok).length

  const lapsed = (UNIVERSITIES as University[]).filter(u => {
    const g = snapshot.grades[u.id]
    return g?.validTill && new Date(g.validTill) < today
  }).length

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Methodology', item: `${BASE}/methodology` },
    ],
  }

  const webpage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Methodology: How EdifyEdu Verifies What It Publishes',
    description:
      'Where every figure on EdifyEdu comes from, when it was last checked, and what we do when something cannot be verified.',
    url: `${BASE}/methodology`,
    dateModified: asOf,
    isPartOf: { '@type': 'WebSite', name: 'EdifyEdu', url: BASE },
    publisher: { '@type': 'Organization', name: 'EdifyEdu', url: BASE },
    breadcrumb,
  }

  const Source = ({ href, name, used }: { href: string; name: string; used: string }) => (
    <tr className="border-t border-border align-top">
      <th scope="row" className="text-left px-3 py-3 font-semibold text-navy whitespace-nowrap">
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-navy hover:text-amber no-underline">{name}</a>
      </th>
      <td className="px-3 py-3 text-ink-2">{used}</td>
    </tr>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />

      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-1 text-xs text-ink-2">
          <Link href="/" className="hover:text-amber no-underline">Home</Link>
          <ChevronRight size={12} />
          <span className="text-navy font-semibold">Methodology</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-3">
          How EdifyEdu verifies what it publishes
        </h1>
        <p className="text-base text-ink-2 leading-relaxed mb-2">
          We cover {UNIVERSITIES.length} UGC-DEB universities. This page states where every figure
          comes from, what we do when a figure cannot be stood behind, and who pays us. The short
          answer to the last one is nobody.
        </p>
        <p className="text-sm text-ink-3 mb-8">
          Last reviewed <time dateTime={asOf} className="font-semibold text-ink-2">{asOf}</time>.
          Accreditation records last refreshed {snapshot.refreshedAt ?? asOf}.
        </p>

        <section className="card p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-navy mb-3">The only four sources we cite</h2>
          <p className="text-sm text-ink-2 mb-4 leading-relaxed">
            Everything factual on this site traces to one of these four. We do not cite commercial
            education aggregators, including the ones that rank well for the queries we compete on,
            because their figures are not independently checkable and several of them take payment
            from the universities they rank.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <caption className="sr-only">The four official sources EdifyEdu cites and what each is used for</caption>
              <thead>
                <tr className="bg-bg">
                  <th scope="col" className="text-left px-3 py-3 font-semibold text-navy">Source</th>
                  <th scope="col" className="text-left px-3 py-3 font-semibold text-navy">What we take from it</th>
                </tr>
              </thead>
              <tbody>
                <Source href="https://deb.ugc.ac.in" name="UGC Distance Education Bureau" used="Whether a named university is entitled to offer a named programme in online mode, in a named academic session. This is the only thing that makes an online degree a degree." />
                <Source href="https://naac.gov.in" name="NAAC" used="Institutional accreditation grade and, critically, the date that grade expires." />
                <Source href="https://nirfindia.org" name="NIRF India Rankings" used="Category ranks. We record which table a rank came from, because they are not interchangeable." />
                <Source href="https://ugc.gov.in" name="University Grants Commission" used="Notifications on degree recognition and the equivalence of online, distance and conventional modes." />
              </tbody>
            </table>
          </div>
        </section>

        <section className="card p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-navy mb-3">UGC-DEB entitlement is narrower than people think</h2>
          <p className="text-sm text-ink-2 mb-3 leading-relaxed">
            Entitlement is granted to a specific university, for a specific programme, for a specific
            academic session. It is not a permanent institutional badge, and a university being
            UGC-recognised does not mean every programme it advertises is entitled for online mode.
          </p>
          <p className="text-sm text-ink-2 leading-relaxed">
            So the question is never &ldquo;is this university approved&rdquo;. It is &ldquo;is this
            programme entitled for online mode in the session I am joining&rdquo;. Those have
            different answers, and we write them as different questions everywhere on the site.
            Check yours on the register and keep the evidence:{' '}
            <a href="https://deb.ugc.ac.in" target="_blank" rel="noopener noreferrer" className="text-amber font-semibold hover:underline">deb.ugc.ac.in</a>.
          </p>
        </section>

        <section className="card p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-navy mb-3">What we do when a NAAC cycle lapses</h2>
          <p className="text-sm text-ink-2 mb-3 leading-relaxed">
            A NAAC grade expires. Most comparison sites print the grade and omit the date, so a
            lapsed accreditation reads as a current one indefinitely. We store the validity date
            alongside the grade and suppress the grade once the cycle has passed.
          </p>
          <p className="text-sm text-ink-2 mb-3 leading-relaxed">
            The consequence is visible rather than claimed. Of the {mba.length} universities offering
            an online MBA, <strong className="text-navy">{mbaNaacNot} show &ldquo;Not verified&rdquo;</strong>{' '}
            in our comparison table rather than a grade, and {lapsed} universities across the whole
            database currently sit on a lapsed cycle. We would rather show a gap than a number we
            cannot stand behind.
          </p>
          <Link href="/programs/mba#comparison-table" className="text-sm text-amber font-semibold hover:underline no-underline">
            See it in the MBA comparison table
          </Link>
        </section>

        <section className="card p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-navy mb-3">Every NIRF rank names its category</h2>
          <p className="text-sm text-ink-2 mb-3 leading-relaxed">
            NIRF publishes separate tables. A university ranked 11th in Management and 24th in the
            University table has two different facts attached to it, and a brochure printing a bare
            &ldquo;#11&rdquo; invites you to read the flattering one.
          </p>
          <p className="text-sm text-ink-2 leading-relaxed">
            This matters most with clinical institutions. A university ranked highly in the NIRF
            Medical or Pharmacy tables may have no Management placement at all, which tells you
            nothing about how it teaches business. We name the category on every rank we print, and
            where a university has no rank in the relevant table we say so.
          </p>
        </section>

        <section className="card p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-navy mb-3">Fees are indicative, and some we refuse to print</h2>
          <p className="text-sm text-ink-2 mb-3 leading-relaxed">
            University fee pages change between intakes and are frequently published as wide ranges
            that no student actually pays. We run every fee through three checks before it reaches a
            page, and suppress it if any of them fails:
          </p>
          <ul className="text-sm text-ink-2 space-y-2 mb-3 pl-5 list-disc leading-relaxed">
            <li>A range spanning more than three times its own floor is treated as a placeholder or a
              stale figure, not a price.</li>
            <li>A figure below a credible floor for a recognised postgraduate programme is treated as
              an authoring error.</li>
            <li>Text carrying no digits at all, such as a fee listed as &ldquo;on request&rdquo;, is
              never passed through as though it were a number.</li>
          </ul>
          <p className="text-sm text-ink-2 leading-relaxed">
            On the online MBA comparison, <strong className="text-navy">{mbaFeeNot} of {mba.length} rows
            print &ldquo;Not published&rdquo;</strong> as a result. Every figure that does pass is still
            indicative. Confirm it on the university&rsquo;s own portal before you pay anything.
          </p>
        </section>

        <section className="card p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-navy mb-3">Who pays us</h2>
          <p className="text-sm text-ink-2 mb-3 leading-relaxed">
            No university pays EdifyEdu. We take no referral commission on an admission, we do not
            sell ranking positions or placement in any list, and no university has editorial input
            into what we publish about it.
          </p>
          <p className="text-sm text-ink-2 leading-relaxed">
            Ordering in our comparison tables is computed from NIRF category rank and then
            accreditation, in that order, with ties broken alphabetically. There is no manual
            override and no promoted slot. If that produces an ordering a university dislikes, that
            is the method working.
          </p>
        </section>

        <section className="card p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-navy mb-3">When we get something wrong</h2>
          <p className="text-sm text-ink-2 mb-3 leading-relaxed">
            We publish a lot of figures about institutions that change them without notice, so we get
            things wrong. When a reader or a university tells us, we check it against the source
            above, correct it, and record the change with the reason rather than editing quietly.
          </p>
          <p className="text-sm text-ink-2 leading-relaxed">
            Report an error at{' '}
            <a href="mailto:hello@edifyedu.in" className="text-amber font-semibold hover:underline">hello@edifyedu.in</a>{' '}
            or through the <Link href="/contact" className="text-amber font-semibold hover:underline no-underline">contact page</Link>.
            Tell us the page and the figure and we will tell you which source we took it from.
          </p>
        </section>

        <section className="card p-6 md:p-8">
          <h2 className="text-xl font-bold text-navy mb-3">Check our work</h2>
          <p className="text-sm text-ink-2 mb-4 leading-relaxed">
            None of the above is worth much unless you can test it. These pages are where the method
            is visible.
          </p>
          <ul className="text-sm space-y-2 pl-5 list-disc">
            <li><Link href="/programs/mba#comparison-table" className="text-amber font-semibold hover:underline no-underline">The online MBA comparison table</Link>, where the suppressed grades and fees are visible row by row</li>
            <li><Link href="/guides/how-to-check-ugc-deb-approval" className="text-amber font-semibold hover:underline no-underline">How to check UGC-DEB approval yourself</Link>, so you do not have to take our word for it</li>
            <li><Link href="/guides/naac-nirf-rankings-explained" className="text-amber font-semibold hover:underline no-underline">What NAAC grades and NIRF ranks actually mean</Link></li>
            <li><Link href="/about" className="text-amber font-semibold hover:underline no-underline">Who we are</Link></li>
          </ul>
        </section>
      </main>
    </>
  )
}
