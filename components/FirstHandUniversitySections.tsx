// First-hand sections on the university page (/universities/{id}), for
// universities with a lib/data/first-hand/ file. Rendered in three places:
//   part="intro" after the hero: byline, what it is, approvals table, notice box
//   part="life"  after the programmes: classes, exams, student tools, what
//                students say, a 2-line admission summary linking the MBA hub
//   part="fit"   in place of "Who Should Apply": first item of each list
// No hooks: UniversityPageClient renders it from server-resolved props.
import Link from 'next/link'
import type { ResolvedFirstHand } from '@/lib/first-hand'
import { FirstHandByline, FirstHandText, BulletList } from './FirstHandShared'

const H2 = 'font-display text-xl font-bold text-navy mb-4'

export default function FirstHandUniversitySections({ fh, part }: { fh: ResolvedFirstHand; part: 'intro' | 'life' | 'fit' }) {
  if (part === 'intro') return (
    <>
      <FirstHandByline author={fh.author} subject={fh.subject} reviewedOnText={fh.reviewedOnText} />

      <section className="card-lg p-6">
        <h2 className={H2}>What {fh.subject} is</h2>
        <p className="text-ink-2 text-[15px] leading-relaxed m-0"><FirstHandText text={fh.whatItIs} /></p>
      </section>

      <section className="card-lg p-6" id="approvals">
        <h2 className={H2}>Approvals and accreditation</h2>
        <p className="text-ink-2 text-[15px] leading-relaxed mb-4">{fh.approvalsIntro}</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr>
                {['Body', `What ${fh.shortName} holds`, 'Source and date'].map(h => (
                  <th key={h} className="text-left font-semibold text-white" style={{ background: '#0f172a', padding: '8px 10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fh.approvals.map(r => (
                <tr key={r.body}>
                  <td className="align-top font-semibold" style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>{r.body}</td>
                  <td className="align-top text-slate-700" style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>
                    {r.holds}
                    {r.programmes?.length ? (
                      <ul className="mt-2 mb-0 pl-4 space-y-1">
                        {r.programmes.map(p => (
                          <li key={p.name} className="text-xs text-slate-600">{p.name}: {p.notice}, {p.period}</li>
                        ))}
                      </ul>
                    ) : null}
                  </td>
                  <td className="align-top text-slate-600 text-xs" style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>
                    {r.source}
                    {r.link ? (
                      <>
                        {r.source ? <br /> : null}
                        {r.link.href.startsWith('/')
                          ? <Link href={r.link.href} className="font-semibold underline">{r.link.label}</Link>
                          : <a href={r.link.href} rel="noopener" target="_blank" className="font-semibold underline">{r.link.label}</a>}
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {fh.approvalsFooter ? (
          <p className="text-ink-2 text-sm leading-relaxed mt-4 mb-0"><FirstHandText text={fh.approvalsFooter} /></p>
        ) : null}
      </section>

      {fh.noticeBox ? (
        <section className="card-lg p-6" style={{ borderColor: '#B8892A' }}>
          <h2 className={H2}>{fh.noticeBox.heading}</h2>
          <p className="text-ink-2 text-[15px] leading-relaxed m-0"><FirstHandText text={fh.noticeBox.text} /></p>
        </section>
      ) : null}
    </>
  )

  if (part === 'life') return (
    <>
      {fh.batches ? (
        <section className="card-lg p-6" id="classes">
          <h2 className={H2}>How {fh.subject} classes work</h2>
          <p className="text-ink-2 text-[15px] leading-relaxed m-0">{fh.batches}</p>
        </section>
      ) : null}

      {fh.studyingAt ? (
        <section className="card-lg p-6" id="studying">
          <h2 className={H2}>How studying at {fh.subject} works</h2>
          <p className="text-ink-2 text-[15px] leading-relaxed m-0"><FirstHandText text={fh.studyingAt.text} /></p>
          {fh.studyingAt.more ? (
            <p className="text-ink-2 text-[15px] leading-relaxed mt-3 mb-0"><FirstHandText text={fh.studyingAt.more} /></p>
          ) : null}
        </section>
      ) : null}

      {fh.exams ? (
        <section className="card-lg p-6" id="exams">
          <h2 className={H2}>How {fh.subject} exams work</h2>
          <p className="text-ink-2 text-[15px] leading-relaxed m-0">{fh.exams}</p>
        </section>
      ) : null}

      {fh.studentTools?.length ? (
        <section className="card-lg p-6">
          <h2 className={H2}>What you get as an {fh.subject} student</h2>
          {fh.studentToolsIntro ? <p className="text-ink-2 text-[15px] leading-relaxed mb-3">{fh.studentToolsIntro}</p> : null}
          <BulletList items={fh.studentTools} sep=": " />
        </section>
      ) : null}

      <section className="card-lg p-6">
        <h2 className={H2}>What students tell me after they join</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-navy mb-3">What works</h3>
            <BulletList items={fh.worksWell} tone="good" />
          </div>
          <div>
            <h3 className="font-semibold text-navy mb-3">{fh.complaintsHeading ?? 'What students complain about'}</h3>
            <BulletList items={fh.complaints} tone="bad" />
          </div>
        </div>
      </section>

      <section className="card-lg p-6">
        <h2 className={H2}>How admission works</h2>
        <p className="text-ink-2 text-[15px] leading-relaxed mb-1">{fh.admissionSteps[0]}</p>
        <p className="text-ink-2 text-[15px] leading-relaxed mb-3">{fh.admissionSteps[fh.admissionSteps.length - 1]}</p>
        <Link href={`/universities/${fh.universityId}/mba#admission`} className="text-sm font-semibold text-amber no-underline hover:underline">
          Every admission step and the documents you need, on the {fh.shortName} MBA page
        </Link>
      </section>
    </>
  )

  return (
    <section className="card-lg p-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className={H2}>Who {fh.shortName}&apos;s online MBA is for</h2>
          <BulletList items={fh.whoShouldChoose.slice(0, 1).map(text => ({ text }))} tone="good" />
        </div>
        <div>
          <h2 className={H2}>Who should not pick it</h2>
          <BulletList items={fh.whoShouldNot.slice(0, 1).map(text => ({ text }))} tone="bad" />
        </div>
      </div>
    </section>
  )
}
