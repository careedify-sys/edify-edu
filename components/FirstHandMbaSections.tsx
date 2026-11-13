// First-hand sections on the MBA hub (/universities/{id}/mba), for universities
// with a lib/data/first-hand/ file. Each part replaces a template block in
// UniProgramBody:
//   who        "Good fit for" / "Not ideal for" (with the byline above)
//   classes    "Class Schedule and Delivery" and "Exams and Evaluation"
//   specAdvice below the specialisation grid (new)
//   admission  AdmissionSteps
//   placements SectionPlacements, BeyondAdmissionSection and TopHirers
//   notice     a short box such as the NMIMS debarment (when the file has one)
//   redFlags   the red flags block
//   verdict    HonestVerdict, plus what counsellors won't tell you and the review link
import Link from 'next/link'
import type { ResolvedFirstHand } from '@/lib/first-hand'
import { FirstHandByline, FirstHandText, BulletList } from './FirstHandShared'

type Part = 'who' | 'classes' | 'specAdvice' | 'admission' | 'placements' | 'notice' | 'redFlags' | 'verdict'

const CARD = 'rounded-xl border border-slate-200 bg-white p-6'
const H2 = 'text-lg font-bold mb-3'
const NAVY = { color: '#0B1533' }

export default function FirstHandMbaSections({ fh, part, eligibility }: { fh: ResolvedFirstHand; part: Part; eligibility?: string }) {
  switch (part) {
    case 'who': return (
      <>
        <FirstHandByline author={fh.author} subject={fh.subject} reviewedOnText={fh.reviewedOnText} />
        <section className={CARD}>
          <h2 className={H2} style={NAVY}>Who {fh.shortName}&apos;s online MBA is for</h2>
          <BulletList items={fh.whoShouldChoose.map(text => ({ text }))} tone="good" />
          <h2 className={`${H2} mt-6`} style={NAVY}>Who should not pick it</h2>
          <BulletList items={fh.whoShouldNot.map(text => ({ text }))} tone="bad" />
        </section>
      </>
    )

    case 'classes': {
      const app = fh.studentTools[0]
      return (
        <section className={CARD}>
          {fh.batches ? (
            <>
              <h2 className={H2} style={NAVY}>How {fh.subject} classes work</h2>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">{fh.batches}</p>
            </>
          ) : (
            <h2 className={H2} style={NAVY}>Classes and exams</h2>
          )}
          <p className="text-sm text-slate-700 leading-relaxed mb-2">
            {fh.exams.split(/(?<=\.)\s/)[0]}{' '}
            <Link href={`/universities/${fh.universityId}#exams`} className="font-semibold underline" style={{ color: '#0f172a' }}>How {fh.subject} exams work</Link>
          </p>
          {!fh.batches && app ? (
            <p className="text-sm text-slate-700 leading-relaxed m-0"><strong style={{ color: '#0f172a' }}>{app.name}:</strong> {app.text}</p>
          ) : null}
        </section>
      )
    }

    case 'specAdvice': return (
      <section className={CARD}>
        <h2 className={H2} style={NAVY}>Which specialisation should you pick?</h2>
        <p className="text-sm text-slate-700 leading-relaxed m-0">{fh.specialisationAdvice}</p>
      </section>
    )

    case 'admission': return (
      <section className={CARD}>
        <h2 className={H2} style={NAVY}>How admission works</h2>
        <ol className="space-y-2 pl-5 m-0">
          {fh.admissionSteps.map((s, i) => (
            <li key={i} className="text-sm text-slate-700 leading-relaxed"><FirstHandText text={s} /></li>
          ))}
        </ol>
        {eligibility ? (
          <p className="text-sm text-slate-700 mt-4 mb-0"><strong style={{ color: '#0f172a' }}>Eligibility:</strong> {eligibility}</p>
        ) : null}
        <h3 className="text-base font-bold mt-6 mb-3" style={NAVY}>Documents you need for the MBA</h3>
        <BulletList items={fh.documents.map(text => ({ text }))} />
        {fh.documentsNote ? <p className="text-xs text-slate-500 mt-3 mb-0">{fh.documentsNote}</p> : null}
      </section>
    )

    case 'placements': return (
      <section className={CARD}>
        <h2 className={H2} style={NAVY}>Placements: what {fh.shortName} says and what I have seen</h2>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 mb-3">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">What {fh.shortName} says (checked {fh.universitySaysCheckedOnText})</div>
          <p className="text-sm text-slate-700 leading-relaxed m-0">{fh.placements.universitySays}</p>
        </div>
        <div className="p-4 rounded-lg border" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
          <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#c2410c' }}>What I have seen</div>
          <p className="text-sm text-slate-700 leading-relaxed m-0">{fh.placements.iHaveSeen}</p>
        </div>
      </section>
    )

    case 'notice': return fh.noticeBox ? (
      <section className={CARD} style={{ borderColor: '#B8892A' }}>
        <h2 className={H2} style={NAVY}>{fh.noticeBox.heading}</h2>
        <p className="text-sm text-slate-700 leading-relaxed m-0"><FirstHandText text={fh.noticeBox.text} /></p>
        {fh.noticeBox.related ? (
          <p className="text-sm text-slate-700 leading-relaxed mt-3 mb-0"><FirstHandText text={fh.noticeBox.related} /></p>
        ) : null}
      </section>
    ) : null

    case 'redFlags': return (
      <section className="rounded-xl border border-red-100 bg-white p-6">
        <h2 className="text-lg font-bold mb-3 text-red-700">Red Flags to Know Before Enrolling</h2>
        <div className="space-y-3">
          {fh.redFlags.map((f, i) => (
            <div key={i} className="p-3 rounded-lg bg-red-50 border border-red-100">
              <span className="text-xs font-black text-red-500 uppercase tracking-wide">Red Flag {i + 1}</span>
              <p className="text-sm text-slate-700 mt-1 mb-0"><strong style={{ color: '#0f172a' }}>{f.title}</strong> {f.text}</p>
            </div>
          ))}
        </div>
      </section>
    )

    case 'verdict': return (
      <>
        <section className={CARD}>
          <h2 className={H2} style={NAVY}>My verdict</h2>
          <p className="text-base font-bold mb-1" style={{ color: '#0f172a' }}>{fh.verdict.oneLine}</p>
          {fh.mbaFee ? <p className="text-sm text-slate-500 mb-3">{fh.shortName} MBA fee: {fh.mbaFee}</p> : null}
          <p className="text-sm text-slate-700 leading-relaxed mb-4">{fh.verdict.detail}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <h3 className="text-sm font-bold text-green-800 mb-2">Worth it if</h3>
              <BulletList items={fh.verdict.worthItIf.map(text => ({ text }))} tone="good" />
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Not worth it if</h3>
              <BulletList items={fh.verdict.notWorthItIf.map(text => ({ text }))} tone="bad" />
            </div>
          </div>
        </section>
        <section className={CARD}>
          <h2 className={H2} style={NAVY}>What {fh.shortName}&apos;s own counsellors won&apos;t tell you</h2>
          <p className="text-sm text-slate-700 leading-relaxed m-0">{fh.counsellorsWontTell}</p>
        </section>
        {fh.reviewLine ? (
          <p className="text-sm text-slate-700 m-0"><FirstHandText text={fh.reviewLine} /></p>
        ) : null}
      </>
    )
  }
}
