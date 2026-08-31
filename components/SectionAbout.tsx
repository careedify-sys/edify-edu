import type { University, ProgramDetail } from '@/lib/data'
import { formatSpecList } from '@/lib/data'
import { formatRank, preferForProgram } from '@/lib/highlight'
import { shouldIndexUniversity } from '@/lib/seo/mode-unverified'

interface Props {
  u: University
  program: string
  pd: ProgramDetail
  cleanName: string
  spec?: string
  customIntro?: string
}

export default function SectionAbout({ u, program, pd, cleanName, spec, customIntro }: Props) {
  // Mode-unverified universities: every sentence below asserts online delivery
  // ("runs an Online X program", "live and recorded sessions", "entitled for
  // online delivery"). None of that is established for these records, so the
  // section is replaced wholesale rather than patched clause by clause.
  // See MODE_UNVERIFIED_UNIS in lib/seo/should-index.ts.
  if (!shouldIndexUniversity(u.id)) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: '#0B1533' }}>
          {cleanName} {program}{spec ? ` in ${spec}` : ''}: What We Can Confirm
        </h2>
        <div className="space-y-3 text-[15px] text-slate-600 leading-relaxed">
          <p>
            {cleanName} appears in the UGC Distance Education Bureau recognition list of
            August 2026, which names {program}{spec ? ` in ${spec}` : ''} among its programmes.
            That document records programme names without a delivery mode, so it does not
            establish whether the grant covers Online mode or Open and Distance Learning.
          </p>
          <p>
            The UGC DEB programme register, which does state the mode against each entry,
            does not list {cleanName}, and the university advertises on-campus programmes
            only on its own website. EdifyEdu cannot confirm that this programme runs online.
          </p>
          <p>
            Contact {cleanName} directly and check deb.ugc.ac.in for the position that applies
            to your admission year before you act on anything here.
          </p>
        </div>
      </section>
    )
  }

  const heading = spec
    ? `${cleanName} Online ${program} in ${spec}: Programme Overview`
    : `${cleanName} Online ${program}: Programme Overview`

  const isPostgrad = ['MBA', 'MCA', 'M.Com', 'MA', 'MSc'].includes(program)
  const isIT       = ['MCA', 'BCA'].includes(program)
  const yearsText  = pd.duration || (isPostgrad ? '2 years' : '3 years')

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold mb-4" style={{ color: '#0B1533' }}>{heading}</h2>
      <div className="space-y-3 text-[15px] text-slate-600 leading-relaxed">
        {spec ? (
          <>
            <p>
              {cleanName} offers an Online {program} with {spec} specialisation, approved by UGC DEB and accredited NAAC {u.naac}. The {yearsText} program is designed for working professionals and fresh graduates who want to build expertise in {spec.toLowerCase()} without stepping away from work.
            </p>
            <p>
              The degree carries the same institutional weight as an on-campus {program} and is valid for private sector employers, government recruitment portals, and further postgraduate studies. UGC DEB approval means the degree meets Indian regulatory standards for distance and online education.
            </p>
          </>
        ) : (
          <>
            {customIntro ? (
              <p>{customIntro}</p>
            ) : (
              <p>
                {cleanName} runs an Online {program} program recognised by UGC DEB, designed for working professionals and fresh graduates aiming for careers in {isIT ? 'software development, data science, and IT management' : 'business management, finance, and leadership'}. The {yearsText} program is delivered through live and recorded sessions on an online platform, with no mandatory campus visits.
              </p>
            )}
            <p>
              {u.naac ? `The university holds NAAC ${u.naac} accreditation` : 'The university is UGC-DEB entitled for online delivery'}
              {(() => { const r = formatRank(u, preferForProgram(program)); return r.rank !== null ? ` and a ${r.label} rank` : '' })()}, giving the {program} degree strong institutional credibility with employers.
              {u.psuEligible ? ' The degree is also eligible for PSU recruitment portals.' : ''}
            </p>
            {pd.specs && pd.specs.length > 0 && (
              <p>
                Students choose a specialisation from {formatSpecList(pd.specs, 4)} — completing the program with an industry project or capstone that reflects their chosen track.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
