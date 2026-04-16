// app/universities/[id]/bba/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { cleanCareerOutcome } from '@/lib/format'
import { getTitleName } from '@/lib/seo-title'

const makeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('BBA')).map(u => ({ id: u.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('BBA')) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const pd = u.programDetails['BBA']
  const titleName = getTitleName(u.id, u.name, u.abbr)
  return {
    title: `${titleName} Online BBA — Fees & Syllabus ${year} | EdifyEdu`,
    description: `${titleName} online BBA: fees ${pd?.fees || `₹${Math.round(u.feeMin/1000)}K+`}, NAAC ${u.naac}${u.nirf < 200 ? `, NIRF #${u.nirf}` : ''}. UGC DEB approved. 3-year degree.`,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/bba` },
  }
}

export default async function OnlineBBAPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('BBA')) notFound()

  const pd = u.programDetails['BBA']
  const specs = pd?.specs || ['General Management', 'Marketing', 'Finance', 'Human Resource Management', 'International Business']

  return (
    <div className="page-shell">
      <div style={{height:3,background:u.color}}/>
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
            <Link href="/">Home</Link><span>›</span>
            <Link href="/universities">Universities</Link><span>›</span>
            <Link href={`/universities/${u.id}`}>{u.abbr}</Link><span>›</span>
            <span className="text-amber font-semibold">Online BBA</span>
          </div>
        </div>
      </div>

      <div style={{background:'linear-gradient(180deg,#0a1220 0%,#0f1b2d 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-[11px] font-bold text-amber uppercase tracking-widest mb-2">
            Undergraduate · {pd?.duration || '3 Years'} · UGC DEB Approved
          </div>
          <h1 className="font-display text-white" style={{fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:800,marginBottom:8}}>
            {u.name} Online BBA
          </h1>
          <p className="text-slate-400 text-[15px] max-w-2xl">
            {cleanCareerOutcome(pd?.careerOutcome || '') || `Bachelor of Business Administration from ${u.name}. Build your foundation in business management and leadership skills.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-xl font-bold text-navy mb-6">{u.name} Online BBA Specializations 2026</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specs.map(spec => (
            <Link key={spec} href={`/universities/${u.id}/bba/${makeSlug(spec)}`}
              className="block p-5 bg-white border border-border rounded-xl hover:border-amber hover:shadow-lg transition-all no-underline group">
              <div className="text-lg font-bold text-navy mb-2 group-hover:text-amber">{spec}</div>
              <div className="text-sm text-ink-3 mb-3">Online BBA in {spec}</div>
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
