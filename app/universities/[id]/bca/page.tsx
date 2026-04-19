// app/universities/[id]/bca/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { cleanCareerOutcome, getShortUniversityName } from '@/lib/format'
import { getTitleName } from '@/lib/seo-title'

const makeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('BCA')).map(u => ({ id: u.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('BCA')) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const pd = u.programDetails['BCA']
  const titleName = getTitleName(u.id, u.name, u.abbr)
  return {
    title: `${titleName} Online BCA — Fees & Syllabus ${year} | EdifyEdu`,
    description: `${titleName} online BCA: fees ${pd?.fees || `₹${Math.round(u.feeMin/1000)}K+`}, NAAC ${u.naac}${u.nirf < 200 ? `, NIRF #${u.nirf}` : ''}. UGC DEB approved. 3-year degree.`,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/bca` },
  }
}

export default async function OnlineBCAPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('BCA')) notFound()

  const pd = u.programDetails['BCA']
  const specs = pd?.specs || ['Computer Science', 'Data Science', 'Cloud Computing', 'Web Development', 'Mobile App Development']
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
            <span className="text-amber font-semibold">Online BCA</span>
          </div>
        </div>
      </div>

      <div style={{background:'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-[11px] font-bold text-amber uppercase tracking-widest mb-2">
            Undergraduate · {pd?.duration || '3 Years'} · UGC DEB Approved
          </div>
          <h1 className="font-display text-white" style={{fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:800,marginBottom:8}}>
            {cleanName} Online BCA
          </h1>
          <p className="text-slate-400 text-[15px] max-w-2xl">
            {cleanCareerOutcome(pd?.careerOutcome || '') || `Bachelor of Computer Applications from ${cleanName}. Start your career in software development and IT.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-xl font-bold text-navy mb-6">{cleanName} Online BCA Specializations 2026</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specs.map(spec => (
            <Link key={spec} href={`/universities/${u.id}/bca/${makeSlug(spec)}`}
              className="block p-5 bg-white border border-border rounded-xl hover:border-amber hover:shadow-lg transition-all no-underline group">
              <div className="text-lg font-bold text-navy mb-2 group-hover:text-amber">{spec}</div>
              <div className="text-sm text-ink-3 mb-3">Online BCA in {spec}</div>
              <span className="text-amber font-semibold text-sm">View Details →</span>
            </Link>
          ))}
        </div>

        {/* Program overview section */}
        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-display text-lg font-bold text-navy mb-3">About the Online BCA at {cleanName}</h2>
              <p className="text-ink-2 leading-relaxed text-[15px]">
                {cleanName} offers a UGC DEB approved Bachelor of Computer Applications that students can complete entirely online over {pd?.duration || '3 years'}. The BCA program is built for students who have finished Class 12 and want to start a career in software development, web technologies, or IT management without leaving their home city.
              </p>
              <p className="text-ink-2 leading-relaxed text-[15px] mt-3">
                The university is accredited by NAAC with a grade of {u.naac}{u.nirf < 200 ? ` and holds a NIRF rank of #${u.nirf}` : ''}. The degree is recognized by government and private sector employers across India, and students can choose from multiple specializations to match their interest area.
              </p>
            </div>

            {pd?.roles && pd.roles.length > 0 && (
              <div>
                <h2 className="font-display text-lg font-bold text-navy mb-3">Career Scope After {u.abbr} Online BCA</h2>
                <p className="text-ink-2 text-[15px] mb-3">
                  After completing the BCA from {cleanName}, students typically go into junior software developer, web developer, technical support, and QA analyst roles. Many graduates also continue to an MCA or MBA to grow into senior positions faster.
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
                <h2 className="font-display text-lg font-bold text-navy mb-3">Companies That Hire {u.abbr} BCA Graduates</h2>
                <p className="text-ink-2 text-[15px]">
                  Graduates from {cleanName} BCA have joined companies like {pd.topCompanies.slice(0, 6).join(', ')} and others across IT services and product roles. The university provides a student portal, live sessions, and basic placement support throughout the program.
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
                  <span className="font-bold text-navy">{pd?.duration || '3 Years'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-3">Specializations</span>
                  <span className="font-bold text-navy">{specs.length}+</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-3">NAAC Grade</span>
                  <span className="font-bold text-navy">{u.naac}</span>
                </div>
                {u.nirf < 200 && (
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
              <p className="text-sm text-ink-2 leading-relaxed">Class 12 pass in any stream (Science, Commerce, or Arts). Students with Mathematics or Computer Science background find the program easier to start. Minimum 45% marks required in most cases.</p>
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
