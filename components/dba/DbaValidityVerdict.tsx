// Top of every /online-dba page, above the fold, never collapsible. The text is
// fixed: the acceptance check greps built HTML for it verbatim, so edit the
// wording only together with DBA_VERDICT_LINES' consumers.
//
// The two notices are cited by name and date only. ugc.gov.in is not on the
// outbound-link allowlist, so there are no links here.

export const DBA_VERDICT_HEADING = 'Is an online DBA valid in India? Not automatically.'

export const DBA_VERDICT_LINES = [
  'It is not a PhD, and it cannot be used anywhere a UGC-recognised PhD is required.',
  'It is usable in India only if UGC grants an equivalence certificate under the UGC (Recognition and Grant of Equivalence to Qualifications Obtained from Foreign Educational Institutions) Regulations, 2025, notified 4 April 2025. Programmes from unrecognised institutions, unaccredited programmes, or franchise arrangements are not eligible.',
  'On 28 October 2022, UGC and AICTE publicly warned that online doctoral programmes offered by edtech companies with foreign institutions are not recognised.',
  'Outside India, a DBA from a university accredited in its home country is recognised there as a professional doctorate.',
]

export default function DbaValidityVerdict() {
  return (
    <section
      aria-labelledby="dba-verdict-heading"
      className="rounded-xl p-5 sm:p-6 my-6"
      style={{ background: '#fef2f2', borderLeft: '5px solid #ef4444' }}
    >
      <p id="dba-verdict-heading" className="text-lg font-bold mb-3" style={{ color: '#0f172a' }}>
        {DBA_VERDICT_HEADING}
      </p>
      <ul className="list-disc pl-5 space-y-2 text-[15px] leading-relaxed" style={{ color: '#1e293b' }}>
        {DBA_VERDICT_LINES.map(line => (
          <li key={line.slice(0, 24)}>{line}</li>
        ))}
      </ul>
    </section>
  )
}
