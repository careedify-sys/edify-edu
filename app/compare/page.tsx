'use client'

import { getSortRank } from '@/lib/data-slim'
import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle, XCircle, BarChart2, Plus, Minus, 
  TrendingUp, Briefcase, Building2, Lock, Award, 
  GraduationCap, Wallet, BookOpen, ChevronRight,
  Info, ShieldCheck, Zap
} from 'lucide-react'
import { UNIS_SLIM, getSlimById, formatFeeSlim as formatFee } from '@/lib/data-slim'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { getUniversityLogo, getMasterSyllabus } from '@/lib/content'
import type { University, Program } from '@/lib/data'
import EnquiryModal from '@/components/EnquiryModal'
import { clsx } from 'clsx'

const ALL_PROGRAMS: Program[] = ['MBA', 'MCA', 'BBA', 'BCA', 'B.Com', 'MA', 'M.Com']

const progSlug = (p: Program) => p.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

function CompareContent() {
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [program, setProgram] = useState<Program>('MBA')
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [enquiryUni, setEnquiryUni] = useState('')
  const [initialized, setInitialized] = useState(false)
  
  const headerRef = useRef<HTMLDivElement>(null)

  // Read ?a= and ?b= params on load, or use defaults
  useEffect(() => {
    if (initialized) return
    const a = searchParams.get('a')
    const b = searchParams.getAll('b')
    const ids = [a, ...b].filter((id): id is string => !!id)
    const validIds = ids.filter(id => UNIS_SLIM.some(u => u.id === id))
    const unique = Array.from(new Set(validIds))
    if (unique.length > 0) {
      setSelectedIds(unique.slice(0, 3))
    } else {
      setSelectedIds(['jain', 'amity'])
    }
    setInitialized(true)
  }, [searchParams, initialized])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-ink-3">
        <Zap className="animate-pulse mr-2" size={20} />
        Loading premium comparison...
      </div>
    )
  }

  const universities = selectedIds
    .map(id => getUniversityById(id))
    .filter((u): u is University => u !== undefined)
  const available = UNIS_SLIM.filter(u => !selectedIds.includes(u.id))

  function addUni(id: string) {
    if (selectedIds.length >= 3) return
    if (selectedIds.includes(id)) return
    setSelectedIds(prev => [...prev, id])
  }

  function removeUni(id: string) {
    setSelectedIds(prev => prev.filter(x => x !== id))
  }

  function getVerdict() {
    if (universities.length < 2) return null
    const sorted = [...universities].sort((a, b) => getSortRank(a) - getSortRank(b))
    return {
      bestNirf: sorted[0],
      cheapest: [...universities].sort((a, b) => a.feeMin - b.feeMin)[0],
      bestSalary: universities.reduce((best, u) => {
        const salary = u.programDetails?.[program]?.avgSalary || ''
        const bestSalary = best.programDetails?.[program]?.avgSalary || ''
        const parse = (s: string) => parseInt(s.replace(/[^0-9]/g, '').slice(0, 2)) || 0
        return parse(salary) > parse(bestSalary) ? u : best
      }),
    }
  }

  const verdict = getVerdict()

  return (
    <div className="page-shell pb-20">
      {universities.length >= 2 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
          '@context':'https://schema.org','@type':'Article',
          headline:`${universities[0]?.name} vs ${universities[1]?.name} Online Programs — Honest Comparison 2026`,
          description:`Detailed comparison of ${universities[0]?.name} and ${universities[1]?.name} — fees, NIRF rank, NAAC grade, programs and which is better for your profile.`,
          url:`https://edifyedu.in/compare?a=${universities[0]?.id}&b=${universities[1]?.id}`,
          author:{'@type':'Organization',name:'Edify',url:'https://edifyedu.in'},
          publisher:{'@type':'Organization',name:'Edify',logo:{'@type':'ImageObject',url:'https://edifyedu.in/logo.png'}},
          dateModified:'2026-03-22',
        })}} />
      )}

      {/* Hero Section */}
      <div className="bg-white border-b border-border-light relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-glow/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="label-sm text-amber px-2 py-0.5 bg-amber-light rounded-full">Compare & Save</span>
                <span className="text-[11px] text-ink-3 font-medium">Updated for July 2026 Session</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl text-navy font-bold mb-3 tracking-tight">
                Compare {universities.length > 0 ? `${universities.length} Universities` : 'Online Degrees'}
              </h1>
              <p className="text-sm text-ink-2 max-w-xl">
                Side-by-side analysis of UGC DEB approved universities. We compare what matters: 
                <span className="font-semibold text-navy"> Real Fees, NIRF Rank, and Career ROI.</span>
              </p>
            </div>

            <div className="bg-bg/50 p-1.5 rounded-xl border border-border flex items-center gap-1">
              <span className="text-[11px] font-bold text-ink-3 px-3 uppercase tracking-wider">Show for:</span>
              <div className="flex bg-white rounded-lg shadow-sm border border-border/40 overflow-hidden">
                {ALL_PROGRAMS.slice(0, 4).map(p => (
                  <button 
                    key={p} 
                    onClick={() => setProgram(p)}
                    className={clsx(
                      "px-4 py-2 text-xs font-bold transition-all",
                      program === p ? "bg-navy text-white" : "text-ink-2 hover:bg-bg"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-ink-3 mr-1">Add to compare:</span>
            {available.slice(0, 6).map(u => (
              <button 
                key={u.id} 
                onClick={() => addUni(u.id)}
                disabled={selectedIds.length >= 3}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border hover:border-amber hover:text-amber transition-all text-xs font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={12} /> {u.abbr || u.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {universities.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart2 size={32} className="text-ink-3 opacity-20" />
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">No Universities Selected</h2>
            <p className="text-ink-3 mb-8">Add up to 3 universities to compare their fees and rankings side-by-side.</p>
            <Link href="/universities" className="btn-primary rounded-xl">Browse All Universities</Link>
          </div>
        ) : (
          <div className="mt-8">
            {/* Verdict Card */}
            {verdict && (
              <div className="mb-8 p-6 bg-white border border-border rounded-2xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-glow -mr-16 -mt-16 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="w-10 h-10 bg-amber rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber/20">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-navy">The Edify Verdict</h3>
                    <p className="text-xs text-ink-3">Based on current rankings and placement data for {program}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                  <div className="p-4 rounded-xl bg-bg border border-border-light hover:border-amber-glow transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-amber font-bold text-[10px] uppercase tracking-widest">
                      <Zap size={10} /> Highest Rank
                    </div>
                    <div className="text-navy font-bold text-sm leading-tight mb-1">{verdict.bestNirf.name}</div>
                    <div className="text-xs text-ink-3 font-semibold">NIRF Rank #{verdict.bestNirf.nirf}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-bg border border-border-light hover:border-amber-glow transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-sage font-bold text-[10px] uppercase tracking-widest">
                      <Wallet size={10} /> Best ROI
                    </div>
                    <div className="text-navy font-bold text-sm leading-tight mb-1">{verdict.cheapest.name}</div>
                    <div className="text-xs text-ink-3 font-semibold">Starting {formatFee(verdict.cheapest.feeMin)}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-bg border border-border-light hover:border-amber-glow transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-blue font-bold text-[10px] uppercase tracking-widest">
                      <Briefcase size={10} /> Career Reach
                    </div>
                    <div className="text-navy font-bold text-sm leading-tight mb-1">{verdict.bestSalary.name}</div>
                    <div className="text-xs text-ink-3 font-semibold">Top Hiring Index for {program}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Syllabus Comparator — TOP ─────────────────────── */}
            <div className="mb-8 rounded-2xl overflow-hidden border border-amber/30" style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FFF7E6 100%)' }}>
              <div className="px-6 py-4 border-b border-amber/20 flex items-center gap-3">
                <span className="text-xl">📚</span>
                <div>
                  <div className="font-bold text-navy text-base">Compare Syllabus of Any Two Universities</div>
                  <div className="text-xs text-ink-3 mt-0.5">Select a specialisation for each university to compare Sem 3–4 subjects side by side</div>
                </div>
              </div>
              <SyllabusComparison universities={universities} program={program} />
            </div>

            {/* Comparison Grid */}
            <div className="bg-white border border-border rounded-2xl shadow-xl overflow-hidden">
              
              {/* Sticky Table Header */}
              <div className="sticky top-0 z-[40] bg-white border-b border-border/80 backdrop-blur-md shadow-sm">
                <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] items-stretch">
                  <div className="p-4 flex flex-col justify-center border-r border-border/50 bg-bg/20">
                    <span className="label-sm text-ink-3">Comparing:</span>
                    <span className="text-[10px] font-bold text-amber">{universities.length} Universities</span>
                  </div>
                  {universities.map(u => (
                    <div key={u.id} className="p-4 border-r border-border/50 flex flex-col items-center text-center relative group min-w-[200px]">
                      <button 
                        onClick={() => removeUni(u.id)}
                        className="absolute right-2 top-2 p-1.5 rounded-full bg-bg text-ink-3 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red transition-all"
                      >
                        <Minus size={12} />
                      </button>
                      <div className="h-12 flex items-center justify-center mb-3">
                        {getUniversityLogo(u.id) ? (
                          <img 
                            src={getUniversityLogo(u.id)!} 
                            alt={u.name} 
                            style={{ maxHeight: '100%', maxWidth: '140px', objectFit: 'contain' }}
                          />
                        ) : (
                          <div className="text-navy font-black text-xl italic">{u.abbr}</div>
                        )}
                      </div>
                      <div className="text-xs font-black text-navy leading-tight line-clamp-2 px-2 uppercase tracking-tight">{u.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: ACADEMIC CREDIBILITY */}
              <div className="bg-navy p-3 px-5 flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-bright uppercase tracking-[0.2em] flex items-center gap-2">
                  <Award size={14} /> Academic Credibility & Trust
                </span>
                <Info size={12} className="text-white/40 cursor-help" />
              </div>

              <ComparisonRow 
                label="NIRF Ranking" 
                icon={<BarChart2 size={12} className="text-amber" />}
                unis={universities} 
                fn={u => (
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-navy italic">#{u.nirf || '—'}</span>
                    <span className="text-[9px] text-ink-3 uppercase font-bold tracking-wider">National Rank</span>
                  </div>
                )}
              />
              <ComparisonRow 
                label="NAAC Grade" 
                icon={<ShieldCheck size={12} className="text-sage" />}
                unis={universities} 
                fn={u => (
                  <div className={clsx(
                    "px-3 py-1 rounded-full font-black text-sm",
                    u.naac.includes('A++') ? "bg-sage-light text-sage" : 
                    u.naac.includes('A+') ? "bg-amber-light text-amber-text" : "bg-bg text-ink-2"
                  )}>
                    {u.naac || '—'}
                  </div>
                )}
              />
              <ComparisonRow 
                label="Approvals" 
                icon={<CheckCircle size={12} className="text-blue" />}
                unis={universities} 
                fn={u => (
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {['UGC DEB', 'AICTE', 'WES', 'QS'].map(ap => {
                      const has = u.approvals.some(a => a.toLowerCase().includes(ap.toLowerCase()))
                      return (
                        <div key={ap} className={clsx(
                          "px-2 py-0.5 rounded-md text-[9px] font-bold border transition-all",
                          has ? "bg-white border-sage/30 text-sage shadow-sm shadow-sage/5 scale-105" : "bg-bg border-border text-ink-3 opacity-40 grayscale"
                        )}>
                          {ap}
                        </div>
                      )
                    })}
                  </div>
                )}
              />

              {/* SECTION: COURSE INVESTMENT */}
              <div className="bg-bg p-3 px-5 flex items-center gap-2 border-y border-border/50">
                <span className="text-[10px] font-black text-navy uppercase tracking-[0.2em] flex items-center gap-2">
                  <Wallet size={14} /> Fee Structure & Flexibility
                </span>
              </div>

              <ComparisonRow 
                label="Course Fees" 
                unis={universities} 
                fn={u => (
                  <div className="flex flex-col items-center">
                    <span className="text-base font-black text-navy">{formatFee(u.feeMin)} – {formatFee(u.feeMax)}</span>
                    <span className="text-[10px] text-ink-3 font-medium">Total Online Program Fee</span>
                  </div>
                )}
              />
              <ComparisonRow 
                label="EMI Starting" 
                unis={universities} 
                fn={u => (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-light rounded-lg border border-amber/20">
                    <span className="text-xs font-black text-amber-text italic">₹{u.emiFrom.toLocaleString()}/mo</span>
                    <ChevronRight size={10} className="text-amber animate-pulse" />
                  </div>
                )}
              />

              {/* 🔒 SCHOLARSHIP SECTION (The target lead gen) */}
              <div 
                onClick={() => { setEnquiryUni('Scholarship Enquiry'); setEnquiryOpen(true) }}
                className="cursor-pointer group relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 transition-all hover:brightness-110"
              >
                <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] items-stretch border-b border-orange-400/30">
                  <div className="p-4 flex items-center gap-2 bg-black/10">
                    <Lock size={16} className="text-white animate-bounce" />
                    <span className="text-[11px] font-black text-white uppercase tracking-wider">Scholarship</span>
                  </div>
                  {universities.map(u => (
                    <div key={u.id} className="p-4 border-l border-white/10 flex flex-col items-center gap-1 justify-center">
                      <div className="text-xs font-bold text-white/90 text-center leading-snug mb-1">Scholarship that can actually save you money — up to ₹50,000 off</div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full backdrop-blur-md border border-white/30 text-[10px] font-bold text-white group-hover:bg-white group-hover:text-orange-600 transition-all uppercase tracking-tighter">
                        <Zap size={10} fill="currentColor" /> Check Eligibility
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: CAREER OUTCOMES */}
              <div className="bg-sage-light p-3 px-5 flex items-center gap-2 border-y border-border/50">
                <span className="text-[10px] font-black text-sage uppercase tracking-[0.2em] flex items-center gap-2">
                  <TrendingUp size={14} /> Career Impact & Salary
                </span>
              </div>

              <ComparisonRow 
                label="Avg Salary" 
                unis={universities} 
                fn={u => (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-black text-sage uppercase tracking-tight italic">{u.programDetails[program]?.avgSalary || '₹5L - ₹12L'}</span>
                    <TrendingUp size={14} className="text-sage/40" />
                  </div>
                )}
              />
              <ComparisonRow 
                label="Top Hiring Partners" 
                unis={universities} 
                fn={u => (
                  <div className="flex flex-wrap justify-center gap-1">
                    {u.programDetails[program]?.topCompanies.slice(0, 4).map(c => (
                      <span key={c} className="px-2 py-0.5 rounded bg-bg border border-border/40 text-[9px] font-bold text-ink-3">{c}</span>
                    ))}
                  </div>
                )}
              />
              <ComparisonRow 
                label="Placement Support" 
                unis={universities} 
                fn={() => (
                  <div className="flex items-center gap-2 text-xs font-bold text-navy">
                    <CheckCircle size={14} className="text-sage" />
                    <span>LMS + Job Portal Access</span>
                  </div>
                )}
              />

              {/* SECTION: CURRICULUM */}
              <div className="bg-bg p-3 px-5 flex items-center gap-2 border-y border-border/50">
                <span className="text-[10px] font-black text-navy-light uppercase tracking-[0.2em] flex items-center gap-2">
                  <BookOpen size={14} /> Curriculum & Specialisations
                </span>
              </div>

              <ComparisonRow 
                label="Specialisations" 
                unis={universities} 
                fn={u => (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-lg font-black text-amber italic">{u.programDetails[program]?.specs.length || 0}</span>
                    <div className="flex flex-wrap justify-center gap-1 max-w-[160px]">
                      {u.programDetails[program]?.specs.slice(0, 3).map(s => (
                        <span key={s} className="text-[9px] font-bold text-ink-3 text-center leading-tight line-clamp-1">{s}</span>
                      ))}
                      {(u.programDetails[program]?.specs.length || 0) > 3 && <span className="text-[9px] text-amber font-bold">+{u.programDetails[program]!.specs.length - 3} more</span>}
                    </div>
                  </div>
                )}
              />
              
              <ComparisonRow
                label="Syllabus Quality"
                unis={universities}
                fn={() => (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[11px] font-bold text-navy uppercase text-center">Industry Focused</span>
                    <span className="text-[9px] text-ink-3">Live Classes + Recordings</span>
                  </div>
                )}
              />

              {/* SYLLABUS COMPARISON */}
              {universities.length >= 2 && (
                <SyllabusComparison universities={universities} program={program} />
              )}

              {/* ACTION BUTTON ROW */}
              <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] items-stretch bg-bg/40">
                <div className="p-4 flex items-center justify-center font-bold text-xs text-ink-3 border-r border-border/50 bg-bg/20">
                  Ready to proceed?
                </div>
                {universities.map(u => (
                  <div key={u.id} className="p-5 border-l border-border/50 shadow-inner flex flex-col gap-3">
                    <button 
                      onClick={() => { setEnquiryUni(u.name); setEnquiryOpen(true) }}
                      className="w-full btn-primary py-3 rounded-xl shadow-lg ring-4 ring-amber-light/50 font-black text-xs uppercase"
                    >
                      Enquire Now
                    </button>
                    <Link 
                      href={`/universities/${u.id}/${progSlug(program)}`}
                      className="text-[10px] font-black text-center text-amber hover:text-amber-bright uppercase tracking-tighter"
                    >
                      View Detailed Analysis →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Proof Section */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
              <div className="p-8 bg-navy rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-bright/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <h3 className="font-display text-2xl font-bold mb-4">India's Only Direct-to-Counsellor Guide</h3>
                <p className="text-white/70 text-sm mb-8 leading-relaxed">
                  We are not an automated search engine. Our database is verified by human experts who cross-check every UGC approval and NIRF update directly from government sources.
                </p>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-amber">127+</span>
                    <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Unis Verified</span>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-amber">24 Hr</span>
                    <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Callback Guarantee</span>
                  </div>
                </div>
              </div>
              
              <div className="p-8 bg-white border border-border rounded-3xl relative">
                <h3 className="font-display text-xl font-bold text-navy mb-4">Frequently Compared</h3>
                <div className="space-y-4">
                  {[
                    "Amity Online vs Manipal Online",
                    "Jain Online vs Chandigarh University",
                    "LPU Online vs NMIMS Online",
                    "Sikkim Manipal vs Amrita AHEAD"
                  ].map(c => (
                    <div key={c} className="flex items-center justify-between p-3 rounded-xl border border-border-light hover:border-amber hover:bg-amber-light/10 transition-all cursor-pointer group">
                      <span className="text-xs font-bold text-ink-2 group-hover:text-navy">{c}</span>
                      <ChevronRight size={14} className="text-ink-3 group-hover:text-amber" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <EnquiryModal 
        isOpen={enquiryOpen} 
        onClose={() => setEnquiryOpen(false)} 
        universityName={enquiryUni} 
      />
    </div>
  )
}

// ── Per-spec subject list (Sem 3 & 4 electives by specialisation) ──
const SPEC_SUBJECTS: Record<string, string[]> = {
  'Finance': ['Portfolio Management', 'Corporate Finance', 'Financial Derivatives', 'Investment Analysis', 'Risk Management', 'Taxation & GST', 'Mergers & Acquisitions', 'Treasury Management'],
  'Finance & Banking': ['Portfolio Management', 'Corporate Finance', 'Financial Derivatives', 'Investment Analysis', 'Risk Management', 'Taxation & GST', 'Mergers & Acquisitions', 'Treasury Management'],
  'Marketing': ['Consumer Behaviour', 'Digital Marketing', 'Brand Management', 'Sales & Distribution', 'Advertising & Communication', 'Marketing Research', 'Retail Management', 'CRM'],
  'Digital Marketing': ['SEO & SEM', 'Social Media Marketing', 'Content Strategy', 'Email Marketing', 'Google Analytics', 'Influencer Marketing', 'E-Commerce Strategy', 'Performance Marketing'],
  'Human Resource Management': ['Talent Acquisition', 'Compensation & Benefits', 'HR Analytics', 'Labour Laws', 'Organisational Development', 'Performance Management', 'Learning & Development', 'Employee Relations'],
  'Operations Management': ['Supply Chain Management', 'Lean Six Sigma', 'Quality Management', 'Project Management', 'Production Planning', 'Inventory Control', 'Logistics Management', 'ERP Systems'],
  'Information Technology': ['Cloud Architecture', 'Data Structures', 'Database Systems', 'Software Engineering', 'Network Security', 'Web Development', 'AI Fundamentals', 'DevOps'],
  'Data Science': ['Machine Learning', 'Statistical Analysis', 'Python for Data Science', 'Big Data Analytics', 'Data Visualisation', 'Deep Learning', 'NLP', 'Model Deployment'],
  'Business Analytics': ['Predictive Modelling', 'Data Mining', 'Statistical Tools', 'R & Python', 'Dashboard Design', 'Business Intelligence', 'Forecasting', 'Decision Analytics'],
  'International Business': ['Global Trade & Policy', 'Export-Import Management', 'Cross-cultural Management', 'Foreign Exchange Markets', 'International Marketing', 'Trade Finance', 'Global Supply Chain', 'WTO & Regulations'],
  'Entrepreneurship': ['Startup Ecosystems', 'Business Plan Development', 'Venture Capital', 'Design Thinking', 'Growth Hacking', 'Lean Startup', 'Intellectual Property', 'Social Entrepreneurship'],
  'General Management': ['Strategic Management', 'Leadership & Team Building', 'Organisational Behaviour', 'Business Ethics', 'Change Management', 'Corporate Governance', 'Negotiation Skills', 'Decision Making'],
  'Healthcare Management': ['Hospital Administration', 'Healthcare Finance', 'Medical Tourism', 'Health Policy', 'Pharmaceutical Management', 'Clinical Operations', 'Patient Experience', 'Healthcare Analytics'],
  'Logistics & Supply Chain Management': ['Warehouse Management', 'Transportation Planning', 'Global Logistics', 'Demand Forecasting', 'Cold Chain Management', 'Inventory Optimisation', 'Procurement Strategy', 'Port & Customs'],
  'Artificial Intelligence & Machine Learning': ['Deep Learning', 'Computer Vision', 'NLP', 'Reinforcement Learning', 'AI Ethics', 'Model Deployment', 'Neural Networks', 'Generative AI'],
}

function getSpecSubjects(spec: string): string[] {
  return SPEC_SUBJECTS[spec] || SPEC_SUBJECTS['General Management'] || []
}

// ── Syllabus Comparison Component ─────────────────────────────
function SyllabusComparison({ universities, program }: { universities: University[]; program: Program }) {
  // Per-university selected spec
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({})

  if (universities.length < 2) return null

  // Get available specs for each university (first 2 universities)
  const uniA = universities[0]
  const uniB = universities[1]
  const specsA = uniA.programDetails[program]?.specs || []
  const specsB = uniB.programDetails[program]?.specs || []

  const specA = selectedSpecs[uniA.id] || ''
  const specB = selectedSpecs[uniB.id] || ''

  const subjectsA = specA ? getSpecSubjects(specA) : []
  const subjectsB = specB ? getSpecSubjects(specB) : []

  // Determine highlight colour per subject
  function getSubjectMeta(subject: string, otherList: string[]) {
    if (!otherList.length) return 'neutral'
    return otherList.includes(subject) ? 'match' : 'diff'
  }

  return (
    <div className="border-b border-border/50">
      {/* Header row */}
      <div className="bg-bg p-3 px-5 flex items-center gap-2 border-t border-border/50">
        <span className="text-[10px] font-black text-navy-light uppercase tracking-[0.2em] flex items-center gap-2">
          <BookOpen size={14} /> Compare Specialisation Curriculum
        </span>
      </div>

      {/* Two-column dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-t border-border/50">
        {[{ u: uniA, specs: specsA }, { u: uniB, specs: specsB }].map(({ u, specs }, i) => (
          <div key={u.id} className={`p-4 ${i === 1 ? 'border-t sm:border-t-0 sm:border-l border-border/50' : ''}`}>
            <div className="text-[10px] font-black uppercase tracking-wider text-ink-3 mb-2">{u.abbr} — Select Specialisation</div>
            <select
              value={selectedSpecs[u.id] || ''}
              onChange={e => setSelectedSpecs(prev => ({ ...prev, [u.id]: e.target.value }))}
              className="w-full text-xs font-semibold rounded-lg border border-border bg-white px-3 py-2 text-ink focus:outline-none focus:border-amber"
              style={{ appearance: 'auto' }}
            >
              <option value="">— Pick a specialisation —</option>
              {specs.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {selectedSpecs[u.id] && (
              <div className="mt-3">
                <div className="text-[9px] font-bold uppercase tracking-widest text-ink-3 mb-2">Sem 3–4 Subjects</div>
                <div className="space-y-1">
                  {getSpecSubjects(selectedSpecs[u.id]).map(subj => {
                    const otherSpec = i === 0 ? (selectedSpecs[uniB.id] || '') : (selectedSpecs[uniA.id] || '')
                    const otherSubjects = otherSpec ? getSpecSubjects(otherSpec) : []
                    const meta = getSubjectMeta(subj, otherSubjects)
                    return (
                      <div
                        key={subj}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                        style={{
                          background: !otherSpec ? '#F8FAFC'
                            : meta === 'match' ? 'rgba(34,197,94,0.1)'
                            : 'rgba(251,191,36,0.12)',
                          color: !otherSpec ? 'var(--ink-2)'
                            : meta === 'match' ? '#15803D'
                            : '#92400E',
                          borderLeft: !otherSpec ? '3px solid #E2E8F0'
                            : meta === 'match' ? '3px solid #22C55E'
                            : '3px solid #F59E0B',
                        }}
                      >
                        {subj}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      {(specA || specB) && (
        <div className="flex items-center gap-4 px-4 pb-3 pt-1">
          <span className="flex items-center gap-1.5 text-[10px] text-ink-3">
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(34,197,94,0.2)', border: '1.5px solid #22C55E', display: 'inline-block' }} />
            Common subject
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-ink-3">
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(251,191,36,0.2)', border: '1.5px solid #F59E0B', display: 'inline-block' }} />
            Different subject
          </span>
        </div>
      )}
    </div>
  )
}

function ComparisonRow({ label, unis, fn, icon = null }: {
  label: string, 
  unis: University[], 
  fn: (u: University) => React.ReactNode,
  icon?: React.ReactNode 
}) {
  return (
    <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] items-stretch border-b border-border/50 group hover:bg-bg/20 transition-colors">
      <div className="p-4 flex items-center gap-2 bg-bg/5 font-bold text-xs text-ink-3 border-r border-border/50">
        {icon} {label}
      </div>
      {unis.map(u => (
        <div key={u.id} className="p-4 py-6 border-l border-border/50 flex flex-col items-center justify-center text-center">
          {fn(u)}
        </div>
      ))}
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center text-ink-3">
        Loading Comparison Engine...
      </div>
    }>
      <CompareContent />
    </Suspense>
  )
}
