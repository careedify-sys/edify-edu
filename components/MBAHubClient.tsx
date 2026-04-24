'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { GraduationCap, Layers, Wallet, BadgeCheck } from 'lucide-react'
import { UNIS_SLIM, formatFeeSlim, type UniSlim } from '@/lib/data-slim'
import { PREFERRED_UNI_IDS } from '@/lib/data-slim'
import { uniHasSpec } from '@/lib/specMapping'
import UniversityCard from '@/components/UniversityCard'

const SPEC_CHIPS = [
  'All', 'Finance', 'Human Resources', 'Marketing', 'Business Analytics',
  'Digital Marketing', 'Operations', 'IT Management', 'Healthcare Management',
  'International Business', 'Data Science', 'Entrepreneurship',
  'Agri Business', 'Logistics & Supply Chain', 'Retail Management',
  'FinTech', 'AI/Machine Learning',
]

// Traffic order for sort
const TRAFFIC_ORDER = [
  'amity-university-online', 'nmims-online', 'manipal-university-jaipur-online',
  'symbiosis-university-online', 'lovely-professional-university-online',
  'jain-university-online', 'upes-online', 'chandigarh-university-online',
  'sikkim-manipal-university-online', 'shoolini-university-online',
  'amrita-vishwa-vidyapeetham-online', 'ignou-online',
  'dr-dy-patil-vidyapeeth-online', 'manipal-academy-higher-education-online',
  'jaypee-university-online', 'galgotias-university-online',
  'uttaranchal-university-online', 'noida-international-university-online',
  'sharda-university-online', 'vignan-university-online',
  'alliance-university-online', 'kurukshetra-university-online',
]

export default function MBAHubClient() {
  const [selectedSpec, setSelectedSpec] = useState('All')

  // Get all shipped MBA unis
  const mbaUnis = useMemo(() => {
    return UNIS_SLIM
      .filter(u => PREFERRED_UNI_IDS.includes(u.id) && u.programs.includes('MBA'))
      .sort((a, b) => {
        const ai = TRAFFIC_ORDER.indexOf(a.id)
        const bi = TRAFFIC_ORDER.indexOf(b.id)
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
      })
  }, [])

  // Filter by selected spec
  const filtered = useMemo(() => {
    if (selectedSpec === 'All') return mbaUnis
    return mbaUnis.filter(u => {
      // Check if uni has this spec - use program specs or approvals as proxy
      const specNames = (u as any).specNames || []
      return uniHasSpec(specNames, selectedSpec)
    })
  }, [selectedSpec, mbaUnis])

  const totalSpecs = mbaUnis.reduce((sum, u) => sum + ((u as any).specCount || 0), 0)
  const feeFloor = Math.min(...mbaUnis.map(u => u.feeMin).filter(f => f > 0))
  const feeCeiling = Math.max(...mbaUnis.map(u => u.feeMax).filter(f => f > 0))

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            Online MBA in India - Compare {mbaUnis.length}+ UGC-Approved Universities
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
            Independent comparison of online MBA programmes. No paid rankings, no referral commissions. Verified NIRF 2025 data, transparent fees, real student reviews.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-8">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <GraduationCap className="mx-auto mb-1 text-amber-400" size={20} />
              <div className="text-2xl font-black">{mbaUnis.length}+</div>
              <div className="text-xs text-slate-400">Universities</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Layers className="mx-auto mb-1 text-amber-400" size={20} />
              <div className="text-2xl font-black">150+</div>
              <div className="text-xs text-slate-400">Specialisations</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Wallet className="mx-auto mb-1 text-amber-400" size={20} />
              <div className="text-2xl font-black">{formatFeeSlim(feeFloor)} - {formatFeeSlim(feeCeiling)}</div>
              <div className="text-xs text-slate-400">Fee Range</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <BadgeCheck className="mx-auto mb-1 text-amber-400" size={20} />
              <div className="text-2xl font-black">NIRF 2025</div>
              <div className="text-xs text-slate-400">Verified</div>
            </div>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="#universities" className="px-6 py-3 rounded-xl font-bold text-sm bg-amber-500 text-white hover:bg-amber-600 transition-colors no-underline">
              Browse All Universities
            </a>
            <Link href="/contact" className="px-6 py-3 rounded-xl font-bold text-sm border border-white/30 text-white hover:bg-white/10 transition-colors no-underline">
              Talk to a Counsellor
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#0B1533' }}>What is an Online MBA and Who Should Take One?</h2>
        <div className="text-slate-600 leading-relaxed space-y-4 text-[15px]">
          <p>An online MBA in India is a two-year post-graduate management degree delivered through a university's digital learning platform. Under UGC-DEB 2020 regulations, online MBA degrees from approved institutions are legally equivalent to campus degrees. The same degree certificate is issued regardless of delivery mode. Government jobs, PSU recruitment, banking exams, and private-sector employers all accept UGC-DEB approved online MBAs.</p>
          <p>The cost advantage is significant. Online MBA fees range from Rs 66,000 (IGNOU) to Rs 3,70,000 (Symbiosis SSODL). Most programmes fall between Rs 90,000 and Rs 2,25,000. Compare this to campus MBA fees at private colleges (Rs 5-15 lakh) or IIMs (Rs 22-28 lakh). The curriculum content is comparable, the degree is identical, and you study while keeping your job and salary.</p>
          <p>Online MBA works best for working professionals with 2+ years of experience who want a management credential without career breaks. It also suits fresh graduates in Tier-2 and Tier-3 cities who cannot relocate for campus programmes. Career switchers moving from technical to management tracks benefit from the flexibility. Entrepreneurs building businesses while studying find the evening and weekend scheduling practical.</p>
          <p>Online MBA is NOT the right choice if you need intensive campus networking, peer group bonding, or depend heavily on university placement drives for your first job. Most online MBA programmes have limited active placement support. Working professionals rely on internal promotions and self-directed job applications rather than campus recruitment.</p>
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-4" style={{ color: '#0B1533' }}>How to Choose the Right Online MBA University</h2>
        <div className="text-slate-600 leading-relaxed space-y-4 text-[15px]">
          <p>Start with UGC-DEB approval. Visit deb.ugc.ac.in and verify the university is on the current entitled list. This is non-negotiable. Any online MBA from a non-approved institution is legally invalid.</p>
          <p>Check NIRF 2025 ranking. NIRF ranks universities in multiple categories (Management, University, Overall). Management rank is most relevant for MBA. Universities ranked in the top 50 carry stronger employer recognition. However, NIRF rank alone does not determine programme quality. NAAC accreditation grade (A++, A+, A) is equally important and reflects institutional quality assessment.</p>
          <p>Compare fees transparently. Ask for the all-in cost including tuition, registration, examination, and alumni fees. Some universities advertise tuition-only figures. EdifyEdu discloses all-in costs for every university on this platform. Check scholarship eligibility (defence, divyaang, merit, alumni, early-bird categories vary by university). Confirm EMI terms directly with the admissions team.</p>
          <p>Match the specialisation to your career goal. Review Semester 3-4 subjects (where specialisation depth lives) rather than just the specialisation name. Two universities offering "Finance" may have very different Sem 3-4 curricula. EdifyEdu publishes verified Sem 3-4 subjects for each specialisation where available.</p>
        </div>
      </section>

      {/* Spec Filter */}
      <section id="universities" className="max-w-6xl mx-auto px-4 pb-4">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#0B1533' }}>Find Your Online MBA by Specialisation</h2>
        <p className="text-sm text-slate-500 mb-4">Click any specialisation to see which universities offer it.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {SPEC_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setSelectedSpec(chip)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedSpec === chip
                  ? 'bg-amber-500 text-white border border-amber-600 shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:bg-amber-50'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500">
          Showing <strong>{selectedSpec === 'All' ? mbaUnis.length : filtered.length}</strong> universities
          {selectedSpec !== 'All' && ` offering Online MBA ${selectedSpec}`}
        </p>
      </section>

      {/* Uni Grid — reuses same UniversityCard component as /universities page */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(selectedSpec === 'All' ? mbaUnis : filtered).map(u => (
            <UniversityCard key={u.id} u={u as any} highlightProgram="MBA" />
          ))}
        </div>
        {filtered.length === 0 && selectedSpec !== 'All' && (
          <div className="text-center py-12 text-slate-500">
            <p>No universities currently offer Online MBA {selectedSpec}.</p>
            <p className="text-sm mt-1">Try a different specialisation, or <Link href="/contact" className="text-amber-600 font-semibold">contact a counsellor</Link> for personalised guidance.</p>
          </div>
        )}
      </section>

      {/* Compare CTA */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-700 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Compare Up to 3 Online MBAs Side by Side</h2>
          <p className="text-slate-300 text-sm mb-5">Fees, specialisations, NIRF rankings, scholarships - all in one view.</p>
          <Link href="/compare" className="inline-block px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors no-underline">
            Open Comparison Tool →
          </Link>
        </div>
      </section>

      {/* Eligibility + Admission */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#0B1533' }}>Online MBA Eligibility and Admission Process</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>Eligibility Criteria</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><strong>Bachelor's degree:</strong> Any discipline from a UGC-recognised university with minimum 50% aggregate (45% for reserved categories at most unis)</li>
              <li><strong>Entrance exam:</strong> Most online MBAs offer direct admission without CAT/MAT/XAT. A few may require OPENMAT or similar - check per university.</li>
              <li><strong>Work experience:</strong> Preferred but not mandatory at most unis. MAHE and UPES recommend 2+ years. Fresh graduates typically submit an SOP.</li>
              <li><strong>Age limit:</strong> Typically no upper age limit for online MBA programmes.</li>
              <li><strong>Documents:</strong> Graduation certificate + mark sheets, photo ID (Aadhaar/passport), passport-size photo, work experience letter if applicable.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>Admission Process</h3>
            <ol className="space-y-2.5 text-sm text-slate-600 list-decimal list-inside">
              <li>Shortlist universities based on specialisation, fees, and NIRF ranking</li>
              <li>Fill online application on the university's admission portal</li>
              <li>Upload documents (graduation certificate, ID, photo)</li>
              <li>Pay application fee if applicable (varies Rs 0 to Rs 1,100 across universities)</li>
              <li>University verifies documents (typically 3-5 working days)</li>
              <li>Receive admission confirmation with fee payment link</li>
              <li>Pay semester 1 fee to confirm seat</li>
              <li>Receive LMS access and begin programme</li>
            </ol>
            <p className="text-xs text-slate-400 mt-4">EdifyEdu counsellors assist at zero cost. We do not charge students any fees and we do not accept referral commissions from universities.</p>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-slate-50 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-600">
          <span>✓ Independent - No referral commissions</span>
          <span>✓ Verified - NIRF 2025 + UGC-DEB data</span>
          <span>✓ Transparent - Real reviews, honest red flags</span>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#0B1533' }}>Ready to compare online MBAs?</h2>
        <p className="text-slate-500 text-sm mb-5 max-w-lg mx-auto">Get a free 20-minute call with an EdifyEdu counsellor. No pressure, no paid recommendations - just honest guidance.</p>
        <Link href="/contact" className="inline-block px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors no-underline">
          Book Free Counselling →
        </Link>
      </section>
    </>
  )
}
