// components/verify/VerifyAdvisory.tsx
//
// A material fact about a university that a UGC-DEB entitlement check does not
// surface, shown directly under the verdict.
//
// Why this exists. On 2026-09-29 the Mangalayatan page answered "Is Mangalayatan
// University Fake? No." while the Ministry of Education had named that
// university, in a December 2024 reply to the Rajya Sabha, among ten private
// universities facing CVC complaints about improperly awarded PhD degrees. The
// UGC-DEB claim on that page was true and the flat "No" was broader than the
// evidence supported. A reader searching "mangalayatan university fake" is
// almost certainly searching because of that story, and was being told nothing
// about it.
//
// The tone is deliberate. A complaint is not a finding, the note says so, and it
// states plainly where no adverse finding has been reported. This is here to
// inform someone about to pay fees, not to accuse an institution.
//
// Content lives in lib/data/verify-advisories.json, which carries the drafting
// rules. Presence of an entry also suppresses the "Is X Fake? No." title on that
// page, because a flat No would contradict this block sitting beneath it.

type Advisory = {
  addedAt: string
  heading: string
  paragraphs: string[]
  checkYourself?: string
}

export function VerifyAdvisory({ advisory }: { advisory: Advisory }) {
  return (
    <section
      aria-label="Additional information about this university"
      className="rounded-xl border border-amber/40 bg-amber/5 p-5 md:p-6 mt-4"
    >
      <h2 className="text-base md:text-lg font-bold text-navy mb-3">{advisory.heading}</h2>

      {advisory.paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-ink-2 leading-relaxed mb-3 last:mb-0">
          {p}
        </p>
      ))}

      {advisory.checkYourself && (
        <p className="text-sm text-ink-2 leading-relaxed mt-3 pt-3 border-t border-amber/30">
          <span className="font-semibold text-navy">Check it yourself. </span>
          {advisory.checkYourself}{' '}
          <a
            href="https://www.ugc.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber font-semibold hover:underline"
          >
            ugc.gov.in
          </a>{' '}
          and{' '}
          <a
            href="https://deb.ugc.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber font-semibold hover:underline"
          >
            deb.ugc.ac.in
          </a>
          .
        </p>
      )}

      <p className="text-xs text-ink-3 mt-4">
        Recorded by EdifyEdu on{' '}
        <time dateTime={advisory.addedAt}>{advisory.addedAt}</time>. Tell us at hello@edifyedu.in if
        this is out of date and we will correct it with the reason.
      </p>
    </section>
  )
}
