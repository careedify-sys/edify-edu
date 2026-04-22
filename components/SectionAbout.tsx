import type { University, ProgramDetail } from '@/lib/data'
import { formatSpecList } from '@/lib/data'

interface Props {
  u: University
  program: string
  pd: ProgramDetail
  cleanName: string
  spec?: string
}

export default function SectionAbout({ u, program, pd, cleanName, spec }: Props) {
  const heading = spec
    ? `About Online ${program} in ${spec}`
    : `About the Online ${program} at ${cleanName}`

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
            <p>
              {cleanName} runs an Online {program} program recognised by UGC DEB, designed for working professionals and fresh graduates aiming for careers in {isIT ? 'software development, data science, and IT management' : 'business management, finance, and leadership'}. The {yearsText} program is delivered through live and recorded sessions on an online platform, with no mandatory campus visits.
            </p>
            <p>
              The university holds NAAC {u.naac} accreditation
              {u.nirf > 0 && u.nirf < 500 ? ` and a NIRF rank of #${u.nirf}` : ''}, giving the {program} degree strong institutional credibility with employers.
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
