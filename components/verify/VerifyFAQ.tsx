import { brand } from '@/lib/brand'

type Props = {
  universityName: string
  city?: string | null
  state?: string | null
  ugcStatus?: string | null
  ugcValidTill?: string | null
  programmeCount?: number
}

export function getVerifyFAQs({ universityName, city, state, ugcStatus, ugcValidTill, programmeCount = 0 }: Props) {
  const location = [city, state].filter(Boolean).join(', ')
  const validTillYear = ugcValidTill ? new Date(ugcValidTill).getFullYear() : null
  const isApproved = ugcStatus === 'approved'

  return [
    {
      q: `Is ${universityName} UGC-DEB approved for online programmes?`,
      a: isApproved
        ? `Yes. ${universityName} is currently approved by the UGC Distance Education Bureau (UGC-DEB) for online and distance-mode programmes${validTillYear ? `, with approval valid till ${validTillYear}` : ''}. The approval is verified against the official UGC-DEB list at deb.ugc.ac.in. Degrees issued under this approval are legally equivalent to on-campus degrees under UGC 2020 regulations.`
        : `${universityName}'s UGC-DEB approval status is shown on this page based on the latest data from the UGC-DEB official list. Always cross-check at deb.ugc.ac.in before making an admission decision. We update this page whenever the UGC-DEB list is republished.`,
    },
    {
      q: `What does UGC-DEB approved mean?`,
      a: `UGC-DEB stands for the University Grants Commission Distance Education Bureau, the regulatory body that approves Indian universities to offer online and distance-mode degrees. A UGC-DEB approval means the university is allowed to issue legally valid online degrees that are accepted for government jobs, PSU recruitment, UPSC, banking exams, higher studies, and private-sector employment. Without UGC-DEB approval, an online degree from any university is not legally valid in India.`,
    },
    {
      q: `How can I verify ${universityName}'s approval myself?`,
      a: `Three official sources to cross-check: (1) deb.ugc.ac.in for the UGC-DEB approved list, (2) ugc.gov.in for the recognised university list, and (3) naac.gov.in for NAAC accreditation grade and validity. For NIRF rank, use nirfindia.org. Every fact on this page links back to one of these official sources. If any data point looks outdated, contact us and we will refresh it within 48 hours.`,
    },
    {
      q: `Is the online degree from ${universityName} valid for government jobs?`,
      a: isApproved
        ? `Yes. Online degrees from ${universityName} are accepted for central government jobs (UPSC, SSC, banking, PSU, defence civilian roles), state government jobs, teaching positions, and judicial services where the eligibility specifies a recognised degree. The degree certificate does not mention "online" or "distance" mode. UGC public notice (April 2020) clarified that online degrees from UGC-DEB approved universities have the same legal status as on-campus degrees.`
        : `Eligibility for government jobs requires a UGC-recognised degree. Verify ${universityName}'s current UGC-DEB approval status on this page and at deb.ugc.ac.in before applying. If approval has lapsed for the relevant academic year, the degree may not qualify for that year's intake.`,
    },
    {
      q: `What is the difference between UGC, AICTE, NAAC, and NIRF?`,
      a: `Each body plays a different role. UGC (University Grants Commission) approves universities to award degrees. UGC-DEB specifically approves online and distance-mode programmes. AICTE approves technical programmes like online MBA and online MCA. NAAC grades the quality of the institution (A++, A+, A, B++ etc.) on a 7-year cycle. NIRF ranks the top universities annually on academic, research, outcome, and perception parameters. A trustworthy online university typically has UGC-DEB approval, AICTE approval (for management or technical courses), and a NAAC grade of B++ or higher.`,
    },
    {
      q: `How current is the data on this verification page?`,
      a: `Every accreditation, ranking, and approval shown on this page is dated. The UGC-DEB status is refreshed whenever the official UGC-DEB list is republished. NAAC grade and validity are updated from naac.gov.in. NIRF ranks reflect the latest released rankings (NIRF 2025 for the current academic year). The "Data freshness" badge on this page tells you when each source was last verified.`,
    },
    {
      q: programmeCount > 0
        ? `Which online programmes does ${universityName} offer?`
        : `What programmes does ${universityName} offer online?`,
      a: programmeCount > 0
        ? `${universityName} currently offers ${programmeCount} approved online programmes covering MBA, MCA, BBA, BCA, B.Com, M.Com, BA, MA, BSc and MSc tracks (subject to the university's specific approvals). The full programme list with each programme's approving entity is shown in the "Find your programme" section on this page. Click any programme to see fees, syllabus, and admission details.`
        : `Programme approvals are listed in the "Find your programme" section on this page. Each programme is mapped to its specific approving entity (UGC-DEB, AICTE, NCTE, or NMC depending on the discipline). If a programme is not in the list, the university is not currently authorised to offer it in online mode.`,
    },
    {
      q: `Does EdifyEdu earn commission from ${universityName}?`,
      a: `No. EdifyEdu earns zero referral commissions from ${universityName} or any other Indian online university. Our verification pages exist to help students avoid fraudulent or lapsed approvals before they pay any fee. We make money through advisory subscriptions, paid premium reports, and partner integrations that do not influence which universities we recommend. Independence is our business model.`,
    },
  ]
}

export function VerifyFAQ(props: Props) {
  const faqs = getVerifyFAQs(props)
  const { universityName, city, state } = props
  const location = [city, state].filter(Boolean).join(', ')

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '22px 28px', border: `1px solid ${brand.creamBorder}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 4, height: 16, background: brand.gold, borderRadius: 2 }} />
        <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: brand.textPrimary }}>
          About {universityName}{location ? ` (${location})` : ''} verification
        </h2>
      </div>

      <p style={{ fontSize: 13, color: brand.textBody, lineHeight: 1.6, margin: '0 0 12px' }}>
        {universityName} is one of the Indian online universities tracked by EdifyEdu. This page consolidates approval, accreditation, and ranking data from the UGC Distance Education Bureau (deb.ugc.ac.in), AICTE, NAAC (naac.gov.in), and NIRF (nirfindia.org) so you can verify the legal validity of any online degree from {universityName} before paying admission fees.
      </p>
      <p style={{ fontSize: 13, color: brand.textBody, lineHeight: 1.6, margin: '0 0 18px' }}>
        Online degrees from UGC-DEB approved universities are legally equivalent to on-campus degrees under the UGC public notice of April 2020. They are accepted for UPSC, banking exams, PSU recruitment, state government jobs, private-sector employment, and PhD admissions. The degree certificate carries no mention of "online" or "distance" mode. EdifyEdu earns zero referral commissions from {universityName}, which is why this verification page presents both strengths and gaps without favouritism.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 12 }}>
        <div style={{ width: 4, height: 16, background: brand.gold, borderRadius: 2 }} />
        <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: brand.textPrimary }}>
          Frequently asked questions
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {faqs.map((f, i) => (
          <details
            key={i}
            style={{
              background: brand.cream,
              border: `1px solid ${brand.creamBorder}`,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <summary
              style={{
                padding: '12px 14px',
                fontSize: 13,
                fontWeight: 500,
                color: brand.textPrimary,
                cursor: 'pointer',
                listStyle: 'none',
              }}
            >
              {f.q}
            </summary>
            <div
              style={{
                padding: '0 14px 14px',
                fontSize: 13,
                color: brand.textBody,
                lineHeight: 1.6,
              }}
            >
              {f.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
