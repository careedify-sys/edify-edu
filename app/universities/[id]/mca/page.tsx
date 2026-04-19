// app/universities/[id]/mca/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { getMasterSyllabus } from '@/lib/content'
import { cleanCareerOutcome, getShortUniversityName } from '@/lib/format'
import { getTitleName } from '@/lib/seo-title'

const makeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('MCA')).map(u => ({ id: u.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('MCA')) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const pd = u.programDetails['MCA']
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const syllabus = getMasterSyllabus(u.id, 'MCA') as any
  const description = syllabus?.metaDesc ||
    `${titleName} online MCA: ${pd?.specs?.length || 3}+ specializations, fees ${pd?.fees || `₹${Math.round(u.feeMin/1000)}K+`}, NAAC ${u.naac}${u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''}. UGC DEB approved.`
  const keywords = syllabus?.metaKeywords || undefined
  return {
    title: `${titleName} Online MCA — Fees & Syllabus ${year} | EdifyEdu`,
    description,
    keywords,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/mca` },
  }
}

export default async function OnlineMCAPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('MCA')) notFound()

  const pd = u.programDetails['MCA']
  const specs = pd?.specs || ['Data Science', 'AI & Machine Learning', 'Cloud Computing', 'Cyber Security']
  const cleanName = getShortUniversityName(u.name)

  return (
    <div className="page-shell">
      <div style={{height:3,background:u.color}}/>
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
            <Link href="/">Home</Link><span>›</span>
            <Link href="/universities">Universities</Link><span>›</span>
            <Link href={`/universities/${u.id}`}>{cleanName}</Link><span>›</span>
            <span className="text-amber font-semibold">Online MCA</span>
          </div>
        </div>
      </div>

      <div style={{background:'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-[11px] font-bold text-amber uppercase tracking-widest mb-2">
            {specs.length} Specializations · {pd?.duration || '2 Years'} · UGC DEB Approved
          </div>
          <h1 className="font-display text-white" style={{fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:800,marginBottom:8}}>
            {cleanName} Online MCA
          </h1>
          <p className="text-slate-400 text-[15px] max-w-2xl">
            {cleanCareerOutcome(pd?.careerOutcome || '') || `Master of Computer Applications from ${cleanName}. Build expertise in software development, data science, and emerging technologies.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-xl font-bold text-navy mb-6">{cleanName} Online MCA Specializations 2026</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specs.map(spec => (
            <Link key={spec} href={`/universities/${u.id}/mca/${makeSlug(spec)}`}
              className="block p-5 bg-white border border-border rounded-xl hover:border-amber hover:shadow-lg transition-all no-underline group">
              <div className="text-lg font-bold text-navy mb-2 group-hover:text-amber">{spec}</div>
              <div className="text-sm text-ink-3 mb-3">Online MCA in {spec}</div>
              <span className="text-amber font-semibold text-sm">View Details →</span>
            </Link>
          ))}
        </div>

        {/* Program overview section */}
        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-display text-lg font-bold text-navy mb-3">About the Online MCA at {cleanName}</h2>
              <p className="text-ink-2 leading-relaxed text-[15px]">
                {cleanName} offers a fully online Master of Computer Applications approved by UGC DEB. The program runs for {pd?.duration || '2 years'} and is designed for graduates who want to build strong expertise in software engineering, data science, cloud infrastructure, and modern IT systems. Students get access to live sessions, recorded lectures, and project-based assessments so they can study without stepping away from work.
              </p>
              <p className="text-ink-2 leading-relaxed text-[15px] mt-3">
                The university holds NAAC {u.naac} accreditation{u.nirf > 0 && u.nirf < 200 ? ` and a NIRF rank of #${u.nirf}` : ''}, which makes the degree widely accepted by employers across India. Graduates from {u.abbr} Online MCA have joined companies in IT services, product development, consulting, and government sectors.
              </p>
            </div>

            {pd?.roles && pd.roles.length > 0 && (
              <div>
                <h2 className="font-display text-lg font-bold text-navy mb-3">Career Scope After {u.abbr} Online MCA</h2>
                <p className="text-ink-2 text-[15px] mb-3">
                  An MCA from {cleanName} prepares students for roles across software development, data analytics, system administration, and IT management. The average salary reported by recent graduates ranges around {pd.avgSalary || '₹5L to ₹12L'} per year depending on the specialization and location.
                </p>
                <div className="flex flex-wrap gap-2">
                  {pd.roles.slice(0, 8).map(role => (
                    <span key={role} className="px-3 py-1.5 bg-surface-2 border border-border rounded-lg text-sm text-ink-2 font-medium">{role}</span>
                  ))}
                </div>
              </div>
            )}

            {pd?.topCompanies && pd.topCompanies.length > 0 && (
              <div>
                <h2 className="font-display text-lg font-bold text-navy mb-3">Top Hiring Companies</h2>
                <p className="text-ink-2 text-[15px]">
                  {u.abbr} MCA alumni have been placed with organizations including {pd.topCompanies.slice(0, 6).join(', ')} and others. The placement cell provides career support through resume workshops, mock interviews, and a job portal with active listings.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="bg-white border border-border rounded-xl p-5">
              <h3 className="font-bold text-navy mb-4 text-sm uppercase tracking-wide">Program At a Glance</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-3">Total Fees</span>
                  <span className="font-bold text-navy">{pd?.fees || `₹${Math.round(u.feeMin/1000)}K+`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-3">Duration</span>
                  <span className="font-bold text-navy">{pd?.duration || '2 Years'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-3">Specializations</span>
                  <span className="font-bold text-navy">{specs.length}+</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-3">NAAC Grade</span>
                  <span className="font-bold text-navy">{u.naac}</span>
                </div>
                {u.nirf > 0 && u.nirf < 200 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-3">NIRF Rank</span>
                    <span className="font-bold text-navy">#{u.nirf}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-ink-3">Approval</span>
                  <span className="font-bold text-navy">UGC DEB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-3">Mode</span>
                  <span className="font-bold text-navy">100% Online</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-xl p-5">
              <h3 className="font-bold text-navy mb-3 text-sm uppercase tracking-wide">Eligibility</h3>
              <p className="text-sm text-ink-2 leading-relaxed">{u.eligibility || 'Bachelor\'s degree in any discipline with at least 50% aggregate marks. Final year students may also apply.'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <Link href={`/universities/${u.id}`} className="text-amber font-semibold">← Back to {cleanName}</Link>
        </div>
      </div>
    </div>
  )
}

export const revalidate = 21600
