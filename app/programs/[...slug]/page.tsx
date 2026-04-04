import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BookOpen, Award, Users, Briefcase, TrendingUp } from 'lucide-react'
import { formatFeeSlim as formatFee } from '@/lib/data-slim'
import { PROGRAM_META } from '@/lib/data-client'
import { getAllSpecs, getUniversitiesByProgram, UNIVERSITIES } from '@/lib/data'
import { getProgramContent, getSpecContent, getSpecFallback } from '@/lib/content'
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

  const year = new Date().getFullYear()
  const canonicalSlug = activeSpec
    ? `https://edifyedu.in/programs/${programSlug}/${subSlug}`
    : `https://edifyedu.in/programs/${programSlug}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
      { '@type': 'ListItem', position: 2, name: 'Programs', item: 'https://edifyedu.in/programs' },
      { '@type': 'ListItem', position: 3, name: `Online ${program}`, item: `https://edifyedu.in/programs/${programSlug}` },
      ...(activeSpec ? [{ '@type': 'ListItem', position: 4, name: activeSpec, item: canonicalSlug }] : []),
    ],
  }

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: activeSpec ? `Online ${program} in ${activeSpec}` : `Online ${program} in India ${year}`,
    description: activeSpec
      ? `UGC DEB approved online ${program} with ${activeSpec} specialisation. Compare ${universities.length} top-ranked universities in India.`
      : `UGC DEB approved online ${program} programs in India. Compare ${universities.length} top-ranked universities. Fees from ₹${Math.round(feeMin/1000)}K.`,
    provider: { '@type': 'Organization', name: 'Edify', sameAs: 'https://edifyedu.in' },
    educationalLevel: program.startsWith('M') ? 'Postgraduate' : 'Undergraduate',
    offers: {
      '@type': 'Offer',
      price: feeMin,
      priceCurrency: 'INR',
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: feeMin,
        maxPrice: feeMax,
        priceCurrency: 'INR',
      },
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: 'PT2Y',
      startDate: `${year}-07-01`,
    },
  }

  const faqSchema = content?.faqs?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.slice(0, 5).map((f: { q: string; a: string }) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
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

            {/* About this Specialisation — only shown when a spec is active */}
            {activeSpec && (() => {
              const sc = getSpecContent(activeSpec) || getSpecFallback(activeSpec, program)
              const uniWithSpec = universities.find(u => u.programDetails[program]?.specs?.includes(activeSpec))
              const uniName = uniWithSpec?.name || `Top UGC DEB Approved Universities`
              return (
                <section className="card p-6 md:p-8 mt-6">
                  <h2 className="text-xl font-bold text-navy mb-4">About Online {program} in {activeSpec}</h2>
                  <div className="flex flex-col gap-4 text-[15px] text-ink-2 leading-relaxed">
                    <p>
                      {uniName.replace(/\s+online\s*$/i, '')} and other UGC DEB approved universities offer an Online {program} in {activeSpec} as a{program === 'MCA' || program === 'MSc' ? ' 2-year' : program === 'MBA' || program === 'M.Com' || program === 'MA' ? ' 2-year' : ' 3-year'} postgraduate program delivered entirely online. The program is UGC DEB approved and designed for working professionals and fresh graduates.
                    </p>
                    {sc.overview && <p>{sc.overview}</p>}
                    <p>
                      Online degrees from UGC DEB approved universities are accepted by government and private sector employers across India. The degree holds the same value as a regular on-campus degree as per UGC regulations.
                    </p>
                  </div>
                </section>
              )
            })()}

            {/* Top universities for this specialisation — direct internal links to spec pages */}
            {activeSpec && (() => {
              const specSlugStr = activeSpec.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
              const unisWithSpec = universities
                .filter(u => u.programDetails[program]?.specs?.some(s => s === activeSpec))
                .sort((a,b) => (a.nirf||999) - (b.nirf||999))
                .slice(0, 8)
              if (!unisWithSpec.length) return null
              return (
                <section className="card p-6 md:p-8 mt-6">
                  <h2 className="text-xl font-bold text-navy mb-1">
                    Top Universities for {program} in {activeSpec}
                  </h2>
                  <p className="text-sm text-ink-3 mb-5">
                    UGC DEB approved universities offering {program} with {activeSpec} specialisation — sorted by NIRF rank
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {unisWithSpec.map(u => {
                      const pd = u.programDetails[program]
                      return (
                        <Link
                          key={u.id}
                          href={`/universities/${u.id}/${programSlug}/${specSlugStr}`}
                          className="flex items-center gap-3 p-4 bg-white border border-border rounded-xl hover:border-amber hover:shadow-md transition-all no-underline group"
                        >
                          <div className="w-9 h-9 rounded-lg border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                            {u.logo
                              ? <img src={u.logo} alt={u.name} className="max-w-full max-h-full object-contain p-0.5" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                              : <span style={{ fontSize:9, fontWeight:800, color:'#fff', background:u.color, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6 }}>{u.abbr?.slice(0,2)}</span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-navy group-hover:text-amber transition-colors leading-snug truncate">
                              {u.name.replace(/\bOnline\b\s*$/i,'')}
                            </div>
                            <div className="text-xs text-ink-3">
                              NAAC {u.naac}{u.nirf < 200 ? ` · NIRF #${u.nirf}` : ''} · {pd?.fees || formatFee(u.feeMin)}
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-amber shrink-0" />
                        </Link>
                      )
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3">
                    <Link href={`/programs/${programSlug}`} className="text-sm text-amber font-semibold hover:underline no-underline">
                      ← All {program} Universities
                    </Link>
                    <Link href="/compare" className="text-sm text-ink-2 font-semibold hover:text-amber no-underline">
                      Compare Side-by-Side →
                    </Link>
                  </div>
                </section>
              )
            })()}

            <ProgramPageClient
              program={program}
              programSlug={programSlug}
              universities={universities}
              allSpecs={allSpecs}
              initialSpec={activeSpec}
            />

            {/* Related Programs — internal linking for SEO */}
            {program === 'MBA' && (
              <section className="card p-6 md:p-8 mt-6">
                <h2 className="text-lg font-bold text-navy mb-4">Related Programs You May Consider</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { href: '/programs/mba', label: 'Online MBA India' },
                    { href: '/programs/mba/finance', label: 'MBA Finance' },
                    { href: '/programs/mba/marketing', label: 'MBA Marketing' },
                    { href: '/programs/mba/hr', label: 'MBA Human Resources' },
                    { href: '/programs/mba/data-science', label: 'MBA Data Science' },
                    { href: '/compare', label: 'Compare Universities' },
                  ].map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 px-4 py-3 bg-white border border-border rounded-lg text-sm font-medium text-navy hover:border-amber hover:text-amber transition-colors no-underline"
                    >
                      <ChevronRight size={14} className="text-amber shrink-0" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
