// app/universities/[id]/mba/page.tsx
// University Online MBA Page - shows all specializations
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { cleanCareerOutcome } from '@/lib/format'
import { getTitleName } from '@/lib/seo-title'

// Helper to create slug
const makeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('MBA')).map(u => ({ id: u.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const u = getUniversityById(id)
  
  if (!u || !u.programs.includes('MBA')) {
    return { title: 'Program Not Found' }
  }

  const year = new Date().getFullYear()
  const pd = u.programDetails['MBA']
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const title = `${titleName} Online MBA — Fees & Syllabus ${year} | EdifyEdu`
  const description = `${titleName} online MBA: ${pd?.specs?.length || 5}+ specializations, fees ${pd?.fees || `₹${Math.round(u.feeMin/1000)}K+`}, NAAC ${u.naac}${u.nirf < 200 ? `, NIRF #${u.nirf}` : ''}. UGC DEB approved.`

  return {
    title,
    description,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/mba` },
    openGraph: { title, description, type: 'website' },
    robots: { index: true, follow: true },
  }
}

export default async function OnlineMBAPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const u = getUniversityById(id)
  
  if (!u || !u.programs.includes('MBA')) {
    notFound()
  }

  const pd = u.programDetails['MBA']
  const specs = pd?.specs || []

  return (
    <div className="page-shell">
      <div style={{height:3,background:u.color}}/>
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
            <Link href="/" className="hover:text-amber">Home</Link>
            <span>›</span>
            <Link href="/universities" className="hover:text-amber">Universities</Link>
            <span>›</span>
            <Link href={`/universities/${u.id}`} className="hover:text-amber">{u.abbr}</Link>
            <span>›</span>
            <span className="text-amber font-semibold">Online MBA</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{background:'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-[11px] font-bold text-amber uppercase tracking-widest mb-2">
            {specs.length} Specializations · {pd?.duration || '2 Years'} · UGC DEB Approved
          </div>
          <h1 className="font-display text-white" style={{fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:800,marginBottom:8}}>
            {u.name} Online MBA
          </h1>
          <p className="text-slate-400 text-[15px] max-w-2xl mb-6">
            {cleanCareerOutcome(pd?.careerOutcome || '') || `Advance your career with an Online MBA from ${u.name}. Choose from ${specs.length}+ industry-relevant specializations.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-slate-400 text-xs">Total Fees</span>
              <div className="text-white font-bold">{pd?.fees || `₹${Math.round(u.feeMin/1000)}K+`}</div>
            </div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-slate-400 text-xs">Duration</span>
              <div className="text-white font-bold">{pd?.duration || '2 Years'}</div>
            </div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-slate-400 text-xs">NAAC</span>
              <div className="text-white font-bold">{u.naac}</div>
            </div>
            {u.nirf < 200 && (
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-slate-400 text-xs">NIRF</span>
                <div className="text-white font-bold">#{u.nirf}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Specializations Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-xl font-bold text-navy mb-6">
          Choose Your MBA Specialization
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specs.map(spec => {
            const slug = makeSlug(spec)
            return (
              <Link
                key={spec}
                href={`/universities/${u.id}/mba/${slug}`}
                className="block p-5 bg-white border border-border rounded-xl hover:border-amber hover:shadow-lg transition-all no-underline group"
              >
                <div className="text-lg font-bold text-navy mb-2 group-hover:text-amber transition-colors">
                  {spec}
                </div>
                <div className="text-sm text-ink-3 mb-3">
                  Online MBA in {spec} from {u.abbr}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-2">
                    {pd?.duration || '2 Years'} · {pd?.fees || `₹${Math.round(u.feeMin/1000)}K+`}
                  </span>
                  <span className="text-amber font-semibold text-sm">View Details →</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link href={`/universities/${u.id}`} className="text-amber font-semibold hover:underline">
            ← Back to {u.name} All Programs
          </Link>
        </div>
      </div>
    </div>
  )
}

export const revalidate = 21600
