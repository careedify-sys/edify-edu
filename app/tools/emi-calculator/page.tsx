'use client'
import { getSortRank } from '@/lib/data-slim'
import { useState } from 'react'
import Link from 'next/link'
import { Calculator, ChevronRight, GraduationCap, TrendingUp, CheckCircle } from 'lucide-react'
import { UNIS_SLIM } from '@/lib/data-slim'
import { formatINR, formatNumber } from '@/lib/format'

export default function EMICalculatorPage() {
  const [principal, setPrincipal] = useState(150000)
  const [rate, setRate] = useState(10)
  const [tenure, setTenure] = useState(24)

  const monthlyRate = rate / 12 / 100
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1)
  const totalPayment = emi * tenure
  const totalInterest = totalPayment - principal

  const topUnis = [...UNIS_SLIM].sort((a, b) => getSortRank(a) - getSortRank(b)).slice(0, 6)

  return (
    <div className="min-h-screen bg-surface">
      {/* Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Education Loan EMI Calculator',
        description: 'Calculate monthly EMI for your online MBA, MCA, BBA education loan. Compare fees across top universities.',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }
      })}} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-2">
            <Link href="/" className="hover:text-amber">Home</Link>
            <ChevronRight size={12} />
            <Link href="/tools" className="hover:text-amber">Tools</Link>
            <ChevronRight size={12} />
            <span className="text-amber font-semibold">EMI Calculator</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber/10 text-amber text-xs font-bold mb-4">
            <Calculator size={14} />
            Free Tool · No Login Required
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
            Education Loan EMI Calculator
          </h1>
          <p className="text-ink-2 max-w-xl mx-auto">
            Calculate your monthly EMI for online MBA, MCA, BBA, BCA education loans. 
            Most banks offer education loans at 8-12% interest for UGC-approved programs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Calculator */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-bold text-navy mb-6">Calculate Your EMI</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-ink-2 block mb-2">
                  Loan Amount (₹)
                </label>
                <input
                  type="range"
                  min="50000"
                  max="500000"
                  step="10000"
                  value={principal}
                  onChange={e => setPrincipal(Number(e.target.value))}
                  className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-amber"
                />
                <div className="flex justify-between text-xs text-ink-3 mt-1">
                  <span>₹50K</span>
                  <span suppressHydrationWarning className="font-bold text-navy text-lg">{formatINR(principal)}</span>
                  <span>₹5L</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-ink-2 block mb-2">
                  Interest Rate (% per annum)
                </label>
                <input
                  type="range"
                  min="6"
                  max="18"
                  step="0.5"
                  value={rate}
                  onChange={e => setRate(Number(e.target.value))}
                  className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-amber"
                />
                <div className="flex justify-between text-xs text-ink-3 mt-1">
                  <span>6%</span>
                  <span className="font-bold text-navy text-lg">{rate}%</span>
                  <span>18%</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-ink-2 block mb-2">
                  Loan Tenure (months)
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[12, 18, 24, 36, 48, 60].map(m => (
                    <button
                      key={m}
                      onClick={() => setTenure(m)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        tenure === m 
                          ? 'bg-amber text-white' 
                          : 'bg-surface-2 text-ink-2 hover:bg-surface-3'
                      }`}
                    >
                      {m} mo
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="mt-8 p-5 bg-gradient-to-br from-navy to-navy-light rounded-xl text-white">
              <div className="text-xs text-white/60 mb-1">Your Monthly EMI</div>
              <div suppressHydrationWarning className="text-3xl font-bold mb-4">
                {formatINR(emi)}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-white/60 text-xs">Total Payment</div>
                  <div suppressHydrationWarning className="font-semibold">{formatINR(totalPayment)}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs">Total Interest</div>
                  <div suppressHydrationWarning className="font-semibold">{formatINR(totalInterest)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-bold text-navy mb-4">Education Loan Tips</h3>
              <ul className="space-y-3">
                {[
                  'UGC-DEB approved programs are eligible for education loans',
                  'SBI, HDFC, Axis offer education loans at 8.5-11% interest',
                  'Most banks offer 100% financing for top-ranked universities',
                  'EMI moratorium available during study period',
                  'Tax benefit under Section 80E on interest paid'
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
                    <CheckCircle size={16} className="text-sage shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber/5 border border-amber/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap size={18} className="text-amber" />
                <h3 className="font-bold text-navy">Compare University Fees</h3>
              </div>
              <p className="text-sm text-ink-2 mb-4">
                Online MBA fees range from ₹40,000 to ₹4,00,000 depending on the university.
              </p>
              <div className="space-y-2">
                {topUnis.slice(0, 4).map(u => (
                  <Link
                    key={u.id}
                    href={`/universities/${u.id}`}
                    className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-white transition-colors"
                  >
                    <span className="font-medium text-navy">{u.abbr}</span>
                    <span className="text-ink-3">₹{(u.feeMin/1000).toFixed(0)}K - ₹{(u.feeMax/1000).toFixed(0)}K</span>
                  </Link>
                ))}
              </div>
              <Link href="/universities" className="text-amber font-semibold text-sm mt-3 inline-block">
                View all universities →
              </Link>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-12 bg-white rounded-2xl border border-border p-8">
          <h2 className="font-display text-2xl font-bold text-navy mb-4">
            How to Finance Your Online MBA/MCA in India
          </h2>
          <div className="prose prose-sm max-w-none text-ink-2">
            <p>
              Online degrees from UGC-DEB approved universities are eligible for education loans from all major banks. 
              With fees ranging from ₹40,000 to ₹4,00,000 for a complete program, most students can comfortably finance 
              their education through EMI options.
            </p>
            <h3 className="text-navy font-semibold mt-6 mb-2">Popular Banks for Education Loans</h3>
            <ul>
              <li><strong>SBI Scholar Loan:</strong> 8.5% onwards, up to ₹20 lakhs without collateral</li>
              <li><strong>HDFC Credila:</strong> 9.5% onwards, flexible repayment options</li>
              <li><strong>Axis Bank:</strong> 10.5% onwards, quick processing</li>
              <li><strong>ICICI Bank:</strong> 10% onwards, covers tuition + living expenses</li>
            </ul>
            <h3 className="text-navy font-semibold mt-6 mb-2">Tax Benefits on Education Loan</h3>
            <p>
              Under Section 80E of the Income Tax Act, the interest paid on education loans is fully deductible 
              from your taxable income. There is no upper limit on this deduction, and it can be claimed for 
              up to 8 years from the year you start repaying.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
