// app/compare/page.tsx — Server Component wrapper
// Static H1/H2/FAQ is server-rendered (crawler-visible)
// Interactive comparison tool loads client-side via CompareClient
// force-dynamic: each ?a=&b= pair gets its own canonical + title via generateMetadata
export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, ChevronDown, ShieldCheck, Award, Wallet, Phone } from 'lucide-react'
import CompareClient from '@/components/CompareClient'
import { getUniversityById } from '@/lib/data'
import { getTitleName } from '@/lib/seo-title'

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ a?: string; b?: string }> }
): Promise<Metadata> {
  const { a, b } = await searchParams

  if (a && b) {
    const uA = getUniversityById(a)
    const uB = getUniversityById(b)
    if (uA && uB) {
      const nameA = getTitleName(uA.id, uA.name, uA.abbr)
      const nameB = getTitleName(uB.id, uB.name, uB.abbr)
      const canonicalUrl = `https://edifyedu.in/compare?a=${a}&b=${b}`
      const title = `${nameA} vs ${nameB} Online MBA 2026 — Fees, Rank & Syllabus | EdifyEdu`
      const description = `Compare ${nameA} and ${nameB} online MBA side by side. See fees, NIRF rank, NAAC grade, specialisations and semester-wise syllabus for both universities.`
      return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: { title, description, url: canonicalUrl, type: 'website' },
      }
    }
  }

  return {
    title: 'Compare Online MBA & MCA Universities 2026 — Fees, Syllabus & Rankings | EdifyEdu',
    description: 'Compare online MBA and MCA universities side by side. Check fees, NAAC grade, NIRF rank, specialisations and semester-wise syllabus for 125+ UGC DEB approved universities.',
    alternates: { canonical: 'https://edifyedu.in/compare' },
    openGraph: {
      title: 'Compare Online MBA & MCA Universities 2026 | EdifyEdu',
      description: 'Side-by-side comparison of fees, NIRF rankings, NAAC grades and syllabus for 125+ UGC DEB approved online programs.',
      type: 'website',
    },
  }
}

// Popular comparison pairs — MBA
const MBA_PAIRS = [
  { label: 'Amity Online MBA vs NMIMS Online MBA', href: '/compare/amity-vs-nmims' },
  { label: 'Amity Online MBA vs Manipal MUJ Online MBA', href: '/compare/amity-vs-manipal-jaipur' },
  { label: 'MUJ Online MBA vs NMIMS Online MBA', href: '/compare/manipal-jaipur-vs-nmims' },
  { label: 'MUJ Online MBA vs MAHE Online MBA', href: '/compare/manipal-jaipur-vs-manipal-mahe' },
  { label: 'NMIMS Online MBA vs Symbiosis Online MBA', href: '/compare/nmims-vs-symbiosis' },
  { label: 'Amity Online MBA vs Symbiosis Online MBA', href: '/compare/amity-vs-symbiosis' },
  { label: 'Sikkim Manipal vs Amity Online MBA', href: '/compare/sikkim-manipal-vs-amity' },
  { label: 'Amrita vs NMIMS Online MBA', href: '/compare/amrita-vs-nmims' },
]

// Popular comparison pairs — MCA
const MCA_PAIRS = [
  { label: 'Amity Online MCA vs JAIN Online MCA', href: '/compare?a=amity-university-online&b=jain-university-online' },
  { label: 'LPU Online MCA vs Chandigarh University Online MCA', href: '/compare?a=lovely-professional-university-online&b=chandigarh-university-online' },
  { label: 'Manipal MUJ Online MCA vs Sikkim Manipal Online MCA', href: '/compare?a=manipal-university-jaipur-online&b=sikkim-manipal-university-online' },
  { label: 'UPES Online MCA vs Galgotias University Online MCA', href: '/compare?a=upes-online&b=galgotias-university-online' },
  { label: 'VIT Online MCA vs SRM Institute Online MCA', href: '/compare?a=vit-vellore-online&b=srm-institute-science-technology-online' },
  { label: 'Amity Online MCA vs Manipal MUJ Online MCA', href: '/compare?a=amity-university-online&b=manipal-university-jaipur-online' },
]

const FAQS = [
  {
    q: 'Which online MBA is best in India in 2026?',
    a: 'There is no single best — it depends on your budget, current qualification, and career goal. NMIMS and Symbiosis are premium options (₹1.5L–₹2.5L) with strong brand value. Amity, JAIN, and LPU offer good programs in the ₹60K–₹1.2L range. Use the comparison tool above to evaluate NIRF rank, NAAC grade, and specialisations side by side.',
  },
  {
    q: 'Is an online MBA valid for PSU and government jobs?',
    a: 'Yes — online degrees from UGC DEB approved universities are treated on par with regular degrees for PSU eligibility and government employment as per the UGC DEB regulations 2020. However, a few specific PSUs may have their own criteria. Our counsellors can confirm eligibility for any specific university before you apply.',
  },
  {
    q: 'What is the difference between NAAC A++ and NAAC A+ grade?',
    a: "NAAC grades reflect the overall academic quality of a university on a scale of A++ (highest), A+, A, B++, B+, B, C, and D. A++ means the university scored 3.51\u20134.00 on NAAC's cumulative grading point average, covering research, teaching quality, infrastructure, and outcomes. A+ universities scored 3.01\u20133.50. For employers and higher studies, A++ carries slightly stronger recognition, particularly in the public sector.",
  },
  {
    q: 'What does NIRF rank mean and why does it matter?',
    a: "NIRF (National Institutional Ranking Framework) is an annual ranking published by the Government of India's Ministry of Education. It scores universities on teaching and learning resources, research productivity, graduation outcomes, outreach, and perception. Lower the number, better the rank. NIRF rank directly affects employer perception — many corporates and HR teams use it as a credibility filter when shortlisting candidates from online programs.",
  },
  {
    q: 'How much does an online MBA cost in India?',
    a: 'Online MBA fees range from ₹40,000 (Kurukshetra, VTU) to ₹2.5L+ (NMIMS, Symbiosis). Most UGC DEB approved programs fall in the ₹70,000–₹1.5L range. Almost all universities offer semester-wise EMI plans starting from ₹4,000–₹8,000 per month, making the degree manageable even for working professionals. Use the EMI calculator in our tools section to estimate monthly outgo.',
  },
  {
    q: 'Can I compare more than two universities at once?',
    a: 'Yes. The comparison tool above lets you add up to 3 universities simultaneously and view their fees, NIRF rank, NAAC grade, approvals, average salary, specialisations, and hiring partners side by side. You can also compare semester-wise syllabus for two universities using the syllabus comparison tool.',
  },
  {
    q: 'Is the syllabus the same across online MBA universities?',
    a: 'No — syllabi vary significantly. While Semester 1 and 2 cover common management foundations (financial management, marketing, HR, operations), Semester 3 and 4 specialisation subjects differ by university. Some universities like Amity and JAIN offer 10+ specialisations; others like NMIMS offer fewer but more focused tracks. The syllabus comparison tool on this page lets you see subject-level differences before deciding.',
  },
  {
    q: 'How long does an online MBA or MCA take to complete?',
    a: 'Both online MBA and online MCA are typically 2-year (4 semester) programs under UGC DEB regulations. A few universities offer an accelerated format with annual exams. Working professionals generally take 2–2.5 years to complete the degree. There is no fast-track option — UGC DEB mandates a minimum duration to maintain degree equivalency.',
  },
  {
    q: 'What specialisations are available in online MBA?',
    a: 'Most online MBA programs offer 8–15 specialisations. The most popular are Finance, Marketing, Human Resource Management, Business Analytics, Operations Management, Data Science, Supply Chain Management, and International Business. A few universities like JAIN and Amity also offer niche tracks like Logistics, Retail, Healthcare, and Banking & Insurance.',
  },
  {
    q: 'How do I choose between online MBA and online MCA?',
    a: 'Choose MBA if your goal is moving into management, business strategy, leadership, or switching from a technical to a business role. Choose MCA if you want to stay in or deepen a technology career — software development, data science, cloud computing, or IT management. Both degrees are eligible for government and private sector jobs. If you already hold a BCA or B.Sc (CS), MCA is a natural progression; if you hold any graduation, MBA is open to you.',
  },
]

export default async function ComparePage(
  { searchParams }: { searchParams: Promise<{ a?: string; b?: string }> }
) {
  // searchParams consumed by generateMetadata above; page content is the same for all pairs
  return (
    <div className="bg-slate-100">

      {/* ── HERO — clean, focused ──────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(160deg, #0d2240 0%, #1b3454 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-10 sm:pt-14 sm:pb-12 text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 text-[11px] font-semibold uppercase tracking-wider mb-5">
            Updated for July 2026 Admission Session
          </span>
          <h1 className="text-2xl sm:text-[2.2rem] font-extrabold text-white mb-3 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Compare Online <em className="text-amber-400 not-italic">MBAs</em> side-by-side.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Side-by-side fees, NIRF rankings, NAAC grades and semester-wise syllabus for 125+ UGC DEB approved universities — so you decide with data, not guesswork.
          </p>
        </div>
      </div>

      {/* ── POPULAR COMPARISONS ───────────────────────────────────────────── */}
      <div className="border-t border-slate-200 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-1">Quick Start</p>
          <h2 className="font-display text-lg font-bold text-slate-800 mb-6">Popular University Comparisons</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Online MBA</p>
              <div className="w-8 h-0.5 bg-orange-500 mb-4" />
              <div className="space-y-2">
                {MBA_PAIRS.map(pair => (
                  <Link
                    key={pair.href}
                    href={pair.href}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/30 transition-all group no-underline"
                  >
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{pair.label}</span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-orange-500 flex-shrink-0 ml-2 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Online MCA</p>
              <div className="w-8 h-0.5 bg-orange-500 mb-4" />
              <div className="space-y-2">
                {MCA_PAIRS.map(pair => (
                  <Link
                    key={pair.href}
                    href={pair.href}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/30 transition-all group no-underline"
                  >
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{pair.label}</span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-orange-500 flex-shrink-0 ml-2 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE COMPARISON TOOL ───────────────────────────────────── */}
      <div className="border-t border-slate-200">
        <CompareClient />
      </div>

      {/* ── TRUST STATS — static, server-rendered ─────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0d2240 0%, #1e3a5f 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-center text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6">Why students trust EdifyEdu</p>
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-8">
            {[
              { icon: Award, stat: '125+', label: 'Universities Verified', sub: 'UGC DEB approved' },
              { icon: ShieldCheck, stat: '24 Hr', label: 'Callback Guarantee', sub: 'Mon–Sat 9am–7pm IST' },
              { icon: Wallet, stat: '100%', label: 'UGC DEB Programs', sub: 'Valid for PSU & private' },
            ].map(item => (
              <div key={item.stat} className="text-center">
                <item.icon size={20} className="text-amber-400 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-amber-400">{item.stat}</p>
                <p className="text-white text-xs sm:text-sm font-semibold mt-1">{item.label}</p>
                <p className="text-slate-300 text-[11px] mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-slate-300 text-sm mb-4">Our team has reviewed every university's syllabus, placement record, and UGC approval status. Free 15-minute call, no obligation.</p>
            <a
              href="tel:7061285806"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white border border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 transition-colors"
            >
              <Phone size={15} className="text-amber-400" />
              Call +91 70612 85806
            </a>
          </div>
        </div>
      </div>

      {/* ── HOW TO COMPARE — 3 steps ──────────────────────────────────────── */}
      <div className="bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-display text-xl font-bold text-slate-800 text-center mb-8">How the Comparison Tool Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Select universities', desc: 'Use the 3 slots to pick any universities you want to compare. Search by name — all 125+ UGC DEB approved programs are available.' },
              { step: '2', title: 'Compare syllabus', desc: 'Pick a specialisation for each university. Green subjects are common to both; amber subjects are unique — so you can see exactly what differs.' },
              { step: '3', title: 'Check rankings & fees', desc: 'Scroll down to see NIRF rank, NAAC grade, total fees, EMI options, average salary, and top hiring companies side by side.' },
            ].map(s => (
              <div key={s.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div>
                  <p className="font-bold text-slate-800 mb-1">{s.title}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest text-center mb-2">Common Questions</p>
          <h2 className="font-display text-xl font-bold text-slate-800 text-center mb-10">
            Frequently Asked Questions — Online MBA &amp; MCA Comparison
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-slate-200 shadow-sm">
                <summary className="flex items-start justify-between gap-3 px-5 py-4 cursor-pointer list-none select-none">
                  <span className="text-sm font-semibold text-slate-800 leading-snug">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className="text-slate-400 flex-shrink-0 mt-0.5 group-open:rotate-180 transition-transform duration-200"
                  />
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          {/* Still confused CTA */}
          <div className="mt-10 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
            <p className="font-bold text-slate-800 mb-1">Still not sure which university to pick?</p>
            <p className="text-sm text-slate-500 mb-4">Our advisors compare programs for you based on your budget, qualification, and career goal — in a free 15-minute call.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:7061285806"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)' }}
              >
                <Phone size={15} />
                Call +91 70612 85806
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors no-underline"
              >
                Send a Message
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
