import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BookOpen, Award, Users, Briefcase, TrendingUp } from 'lucide-react'
import { formatFeeSlim as formatFee } from '@/lib/data-slim'
import { PROGRAM_META } from '@/lib/data-client'
import { getAllSpecs, getUniversitiesByProgram, UNIVERSITIES } from '@/lib/data'
import { getProgramContent } from '@/lib/content'
import type { Program } from '@/lib/data'
import ProgramPageClient from '@/components/ProgramPageClient'

const PM: Record<string, Program> = {
  'mba':'MBA','mca':'MCA','bba':'BBA','bca':'BCA','ba':'BA',
  'bcom':'B.Com','mcom':'M.Com','ma':'MA','msc':'MSc','bsc':'BSc',
  // online-* slug variants for SEO-friendly URLs
  'online-mba':'MBA','online-mca':'MCA','online-bba':'BBA','online-bca':'BCA',
  'online-ba':'BA','online-bcom':'B.Com','online-mcom':'M.Com',
  'online-ma':'MA','online-msc':'MSc',
}

function findUniId(slug: string) {
  return UNIVERSITIES.find(u => u.id === slug || u.abbr.toLowerCase() === slug)?.id
}

export async function generateMetadata(
  { params }: { params: any }
): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params
  const slugArray = resolvedParams?.slug || []
  const programSlug = slugArray[0]?.toLowerCase()
  const program = PM[programSlug]
  const subSlug = slugArray[1]?.toLowerCase()
  
  if (!program) return { title: 'Program Not Found' }

  // Check if subSlug is a specialization
  const allSpecs = getAllSpecs(program)
  const activeSpec = allSpecs.find(s => s.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') === subSlug)

  const year = new Date().getFullYear()
  const title = activeSpec 
    ? `Best Online ${program} in ${activeSpec} — Colleges, Fees, Review ${year} | Edify`
    : `Online ${program} India 2026 — Compare 127+ UGC Approved Universities | Edify`
  
  const description = activeSpec
    ? `Compare top UGC DEB approved online universities for ${program} with ${activeSpec} specialisation. Check NIRF ranks, fees, and syllabus for 2026.`
    : `Explore all UGC approved online ${program} programs in India. Find real NIRF rankings, NAAC A++ grades, and fees from ₹40K. Verified admissions for 2026.`

  const canonical = activeSpec
    ? `https://edifyedu.in/programs/${programSlug}/${subSlug}`
    : `https://edifyedu.in/programs/${programSlug}`

  return {
    title,
    description,
    keywords: activeSpec
      ? [`online ${program} ${activeSpec}`, `${program} ${activeSpec} india 2026`, `ugc approved ${program}`, `online ${program} fees india`]
      : [`online ${program} india 2026`, `best online ${program} india`, `ugc approved ${program}`, `online ${program} for working professionals`],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: `Online ${program} India 2026` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function CatchAllProgramPage(
  { params }: { params: any }
) {
  const resolvedParams = params instanceof Promise ? await params : params
  const slugArray = resolvedParams?.slug || []
  const programSlug = slugArray[0]?.toLowerCase()
  const program = PM[programSlug]
  const subSlug = slugArray[1]?.toLowerCase()

  if (!program) notFound()

  // SEO Redirection: If slug[1] is a university, redirect to /universities/[id]/[program]
  if (subSlug) {
    const uId = findUniId(subSlug)
    if (uId) {
      redirect(`/universities/${uId}/${programSlug}`)
    }
  }

  // Check if subSlug is a specialization
  const allSpecs = getAllSpecs(program)
  const activeSpec = allSpecs.find(s => s.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') === subSlug)

  const meta = PROGRAM_META[program]
  const content = getProgramContent(program)
  const universities = getUniversitiesByProgram(program)
  
  const feeMin = universities.length ? Math.min(...universities.map(u => u.feeMin)) : 0
  const feeMax = universities.length ? Math.max(...universities.map(u => u.feeMax)) : 0

  return (
    <div className="bg-surface-1 min-h-screen pt-4 pb-20">
      <div className="container-custom">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 py-4 text-xs text-ink-3">
          <Link href="/" className="hover:text-navy">Home</Link>
          <ChevronRight size={12}/>
          <Link href="/programs" className="hover:text-navy">Programs</Link>
          <ChevronRight size={12}/>
          <span className="text-navy font-semibold">{program}</span>
          {activeSpec && (
            <>
              <ChevronRight size={12}/>
              <span className="text-amber font-bold">{activeSpec}</span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-4 relative">
          <div className="flex-1">
            <div className="card p-6 md:p-8 overflow-hidden relative">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber/10 text-amber-text text-[10px] font-bold tracking-wider uppercase rounded-full mb-4">
                  <TrendingUp size={12}/> UGC DEB Approved 2026
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy leading-tight">
                  Online {program} <br className="hidden md:block"/>
                  {activeSpec ? (
                    <span className="text-amber-text">Spec: {activeSpec}</span>
                  ) : (
                    <span>Your Gateway to Career Growth</span>
                  )}
                </h1>
                <p className="mt-4 text-lg text-ink-2 max-w-2xl leading-relaxed">
                  Compare {universities.length} top-ranked universities offering online {program} in India. 
                  UGC approved degrees valid for govt and private jobs.
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { icon: BookOpen, label: 'Options', value: `${universities.length} Unis` },
                { icon: Award, label: 'Min Fee', value: formatFee(feeMin) },
                { icon: Users, label: 'Specs', value: `${allSpecs.length}+` },
                { icon: Briefcase, label: 'Salary Range', value: '4L-18L' },
              ].map(stat => (
                <div key={stat.label} className="card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-amber-text">
                    <stat.icon size={20}/>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-3">{stat.label}</div>
                    <div className="font-bold text-navy truncate">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <ProgramPageClient 
              program={program}
              programSlug={programSlug}
              universities={universities}
              allSpecs={allSpecs}
              initialSpec={activeSpec}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
