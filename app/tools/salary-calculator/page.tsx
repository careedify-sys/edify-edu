'use client'
import { getSortRank } from '@/lib/data-slim'
import { useState } from 'react'
import Link from 'next/link'
import { Calculator, ChevronRight, TrendingUp, Briefcase, GraduationCap } from 'lucide-react'
import { UNIS_SLIM } from '@/lib/data-slim'

const ROLES = [
  { title: 'Business Analyst', minSalary: 600000, maxSalary: 1500000, growth: 15 },
  { title: 'Marketing Manager', minSalary: 700000, maxSalary: 1800000, growth: 12 },
  { title: 'HR Manager', minSalary: 500000, maxSalary: 1400000, growth: 10 },
  { title: 'Finance Manager', minSalary: 800000, maxSalary: 2000000, growth: 14 },
  { title: 'Operations Manager', minSalary: 600000, maxSalary: 1600000, growth: 11 },
  { title: 'Product Manager', minSalary: 1000000, maxSalary: 3000000, growth: 20 },
  { title: 'Data Analyst', minSalary: 500000, maxSalary: 1200000, growth: 18 },
  { title: 'Project Manager', minSalary: 700000, maxSalary: 1800000, growth: 13 },
]

const EXPERIENCE_MULTIPLIER: Record<string, number> = {
  '0-2': 0.7,
  '2-5': 1.0,
  '5-8': 1.4,
  '8-12': 1.8,
  '12+': 2.2,
}

const CITY_MULTIPLIER: Record<string, number> = {
  'Mumbai': 1.2,
  'Bangalore': 1.15,
  'Delhi NCR': 1.1,
  'Hyderabad': 1.05,
  'Pune': 1.0,
  'Chennai': 0.95,
  'Kolkata': 0.9,
  'Other': 0.85,
}

export default function SalaryCalculatorPage() {
  const [role, setRole] = useState(ROLES[0])
  const [experience, setExperience] = useState('2-5')
  const [city, setCity] = useState('Bangalore')
  const [hasMBA, setHasMBA] = useState(true)

  const baseMin = role.minSalary * EXPERIENCE_MULTIPLIER[experience] * CITY_MULTIPLIER[city]
  const baseMax = role.maxSalary * EXPERIENCE_MULTIPLIER[experience] * CITY_MULTIPLIER[city]
  const mbaBonus = hasMBA ? 1.3 : 1.0
  
  const salaryMin = Math.round(baseMin * mbaBonus)
  const salaryMax = Math.round(baseMax * mbaBonus)
  const salaryAvg = Math.round((salaryMin + salaryMax) / 2)

  const topUnis = [...UNIS_SLIM].sort((a, b) => getSortRank(a) - getSortRank(b)).slice(0, 5)

  return (
    <div className="min-h-screen bg-surface">
      {/* Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'MBA Salary Calculator India',
        description: 'Calculate expected salary after MBA based on role, experience, city and university ranking.',
        applicationCategory: 'BusinessApplication',
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
            <span className="text-amber font-semibold">Salary Calculator</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage/10 text-sage text-xs font-bold mb-4">
            <TrendingUp size={14} />
            Based on 2024-25 Industry Data
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
            MBA Salary Calculator India
          </h1>
          <p className="text-ink-2 max-w-xl mx-auto">
            Estimate your expected salary after MBA based on your role, experience, location, 
            and whether you have an MBA degree.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Calculator */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-bold text-navy mb-6">Calculate Your Expected Salary</h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-ink-2 block mb-2">Job Role</label>
                <select
                  value={role.title}
                  onChange={e => setRole(ROLES.find(r => r.title === e.target.value) || ROLES[0])}
                  className="w-full p-3 rounded-xl border border-border bg-surface-2 text-navy font-medium"
                >
                  {ROLES.map(r => (
                    <option key={r.title} value={r.title}>{r.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-ink-2 block mb-2">Experience (years)</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(EXPERIENCE_MULTIPLIER).map(exp => (
                    <button
                      key={exp}
                      onClick={() => setExperience(exp)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        experience === exp 
                          ? 'bg-amber text-white' 
                          : 'bg-surface-2 text-ink-2 hover:bg-surface-3'
                      }`}
                    >
                      {exp} yrs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-ink-2 block mb-2">City</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-surface-2 text-navy font-medium"
                >
                  {Object.keys(CITY_MULTIPLIER).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-ink-2 block mb-2">Do you have an MBA?</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setHasMBA(true)}
                    className={`flex-1 p-3 rounded-xl text-sm font-semibold transition-all border ${
                      hasMBA 
                        ? 'bg-sage/10 border-sage text-sage' 
                        : 'bg-surface-2 border-border text-ink-2'
                    }`}
                  >
                    ✓ Yes, MBA
                  </button>
                  <button
                    onClick={() => setHasMBA(false)}
                    className={`flex-1 p-3 rounded-xl text-sm font-semibold transition-all border ${
                      !hasMBA 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'bg-surface-2 border-border text-ink-2'
                    }`}
                  >
                    No MBA
                  </button>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="mt-8 p-5 bg-gradient-to-br from-sage to-sage-dark rounded-xl text-white">
              <div className="text-xs text-white/60 mb-1">Expected Annual Salary</div>
              <div className="text-3xl font-bold mb-2">
                ₹{(salaryAvg/100000).toFixed(1)} LPA
              </div>
              <div className="text-sm text-white/80">
                Range: ₹{(salaryMin/100000).toFixed(1)}L - ₹{(salaryMax/100000).toFixed(1)}L
              </div>
              {hasMBA && (
                <div className="mt-3 pt-3 border-t border-white/20 text-sm">
                  <span className="text-white/60">MBA Premium:</span>{' '}
                  <span className="font-bold text-amber-light">+30% higher salary</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-bold text-navy mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-amber" />
                {role.title} Career Outlook
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-ink-2 text-sm">Average Growth Rate</span>
                  <span className="font-bold text-sage">{role.growth}% YoY</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-ink-2 text-sm">Entry Level (0-2 yrs)</span>
                  <span className="font-semibold text-navy">₹{(role.minSalary/100000).toFixed(1)}L - ₹{(role.minSalary*1.3/100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-ink-2 text-sm">Mid Level (5-8 yrs)</span>
                  <span className="font-semibold text-navy">₹{((role.minSalary + role.maxSalary)/2/100000).toFixed(1)}L - ₹{(role.maxSalary*0.9/100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-2 text-sm">Senior Level (12+ yrs)</span>
                  <span className="font-semibold text-navy">₹{(role.maxSalary/100000).toFixed(1)}L+</span>
                </div>
              </div>
            </div>

            {!hasMBA && (
              <div className="bg-amber/5 border border-amber/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap size={18} className="text-amber" />
                  <h3 className="font-bold text-navy">Boost Your Salary with MBA</h3>
                </div>
                <p className="text-sm text-ink-2 mb-4">
                  An MBA from a top university can increase your salary by 30-50%. 
                  Online MBA fees start from just ₹40,000.
                </p>
                <div className="space-y-2">
                  {topUnis.map(u => (
                    <Link
                      key={u.id}
                      href={`/universities/${u.id}`}
                      className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-white transition-colors"
                    >
                      <span className="font-medium text-navy">{u.abbr}</span>
                      <span className="text-ink-3">NIRF #{u.nirf}</span>
                    </Link>
                  ))}
                </div>
                <Link href="/programs/mba" className="text-amber font-semibold text-sm mt-3 inline-block">
                  Explore Online MBA Programs →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-12 bg-white rounded-2xl border border-border p-8">
          <h2 className="font-display text-2xl font-bold text-navy mb-4">
            MBA Salary in India 2024-25: Complete Guide
          </h2>
          <div className="prose prose-sm max-w-none text-ink-2">
            <p>
              The average MBA salary in India ranges from ₹6 LPA to ₹25 LPA depending on the university tier, 
              specialization, experience, and location. Online MBA graduates from NIRF-ranked universities 
              typically earn 20-30% more than non-MBA professionals in similar roles.
            </p>
            <h3 className="text-navy font-semibold mt-6 mb-2">Salary by MBA Specialization</h3>
            <ul>
              <li><strong>Finance MBA:</strong> ₹8-25 LPA - Highest paying specialization</li>
              <li><strong>Marketing MBA:</strong> ₹6-20 LPA - Best for creative professionals</li>
              <li><strong>HR MBA:</strong> ₹5-15 LPA - Stable career growth</li>
              <li><strong>Operations MBA:</strong> ₹6-18 LPA - Manufacturing & logistics focus</li>
              <li><strong>Business Analytics:</strong> ₹8-22 LPA - Fastest growing specialization</li>
            </ul>
            <h3 className="text-navy font-semibold mt-6 mb-2">Online MBA vs Regular MBA Salary</h3>
            <p>
              According to industry data, online MBA graduates from top universities (NIRF Top 50) earn comparable 
              salaries to regular MBA graduates. The key factors affecting salary are university ranking, 
              specialization, and prior work experience rather than the mode of learning.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
