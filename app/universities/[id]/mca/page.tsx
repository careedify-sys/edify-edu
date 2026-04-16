// app/universities/[id]/mca/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { getMasterSyllabus } from '@/lib/content'
import { cleanCareerOutcome } from '@/lib/format'
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
  const syllabus = getMasterSyllabus(u.id, 'MCA') as any
  const description = syllabus?.metaDesc ||
    `${u.name} MCA - ${pd?.specs?.length || 3}+ specializations. Fees ${pd?.fees || `₹${Math.round(u.feeMin/1000)}K+`}. NAAC ${u.naac}. UGC DEB approved.`
  const keywords = syllabus?.metaKeywords || undefined
  const titleName = getTitleName(u.id, u.name, u.abbr)
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

  return (
    <div className="page-shell">
      <div style={{height:3,background:u.color}}/>
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
            <Link href="/">Home</Link><span>›</span>
            <Link href="/universities">Universities</Link><span>›</span>
            <Link href={`/universities/${u.id}`}>{u.abbr}</Link><span>›</span>
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
            {u.name} Online MCA
          </h1>
          <p className="text-slate-400 text-[15px] max-w-2xl">
            {cleanCareerOutcome(pd?.careerOutcome || '') || `Master of Computer Applications from ${u.name}. Build expertise in software development, data science, and emerging technologies.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-xl font-bold text-navy mb-6">Choose Your MCA Specialization</h2>
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
        <div className="mt-8 pt-6 border-t border-border">
          <Link href={`/universities/${u.id}`} className="text-amber font-semibold">← Back to {u.name}</Link>
        </div>
      </div>
    </div>
  )
}

export const revalidate = 21600
