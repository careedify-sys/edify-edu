'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import { UNIS_SLIM, formatFeeSlim, PREFERRED_UNI_IDS } from '@/lib/data-slim'
import { getCanonicalSpec, type CanonicalSpec } from '@/lib/specMapping'
import UniversityCard from '@/components/UniversityCard'

interface Props {
  specSlug: string
  specName: string
}

export default function MBASpecHubClient({ specSlug, specName }: Props) {
  const canonical = getCanonicalSpec(specSlug)

  const mbaUnis = useMemo(() => {
    const canonical = getCanonicalSpec(specSlug)
    const variants = canonical?.variants || [specSlug]
    return UNIS_SLIM
      .filter(u => {
        if (!PREFERRED_UNI_IDS.includes(u.id) || !u.programs.includes('MBA')) return false
        const uniSpecs = (u as any).mbaSpecs as string[] | undefined
        if (!uniSpecs || uniSpecs.length === 0) return false
        return uniSpecs.some(s => {
          const sn = s.toLowerCase().replace(/[^a-z ]/g, '').trim()
          return variants.some(v => {
            const vn = v.toLowerCase().replace(/[^a-z ]/g, '').trim()
            if (sn === vn) return true
            if (sn.startsWith(vn + ' ') || sn.startsWith(vn + 's')) return true
            if (vn.startsWith(sn + ' ') || vn.startsWith(sn + 's')) return true
            return false
          })
        })
      })
      .sort((a, b) => {
        const an = a.nirf > 0 && a.nirf < 200 ? a.nirf : 999
        const bn = b.nirf > 0 && b.nirf < 200 ? b.nirf : 999
        return an - bn
      })
  }, [specSlug])

  const feeFloor = Math.min(...mbaUnis.map(u => u.feeMin).filter(f => f > 0))
  const feeCeiling = Math.max(...mbaUnis.map(u => u.feeMax).filter(f => f > 0))
  const uniCount = mbaUnis.length

  return (
    <>
      {/* Spec Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <nav className="text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-white no-underline">Home</Link>
            {' > '}
            <Link href="/programs/mba" className="hover:text-white no-underline">Online MBA</Link>
            {' > '}
            <span className="text-amber-400">{specName}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
            Online MBA in {specName} - {uniCount} Universities Compared
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-6">
            UGC-approved programmes from {formatFeeSlim(feeFloor)} to {formatFeeSlim(feeCeiling)}. Independent comparison.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              {uniCount} Universities
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              {formatFeeSlim(feeFloor)} - {formatFeeSlim(feeCeiling)}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              <BadgeCheck size={14} className="text-amber-400" /> NIRF 2025 Verified
            </span>
          </div>
        </div>
      </section>

      {/* TL;DR Card */}
      {canonical && (
        <section className="max-w-3xl mx-auto px-4 -mt-6 relative z-10 mb-8">
          <div className="rounded-xl bg-slate-800 text-white p-5">
            <div className="space-y-2 text-sm">
              <p>✓ <strong>Best for:</strong> {canonical.careerTag}</p>
              <p>⚠ <strong>Watch out:</strong> {canonical.watchOut}</p>
              <p>💰 <strong>Fee range:</strong> {formatFeeSlim(feeFloor)} - {formatFeeSlim(feeCeiling)}</p>
            </div>
          </div>
        </section>
      )}

      {/* About this Specialisation */}
      {canonical && (
        <section className="max-w-3xl mx-auto px-4 pb-8">
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#0B1533' }}>What is Online MBA in {specName}?</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{canonical.domainDescription}</p>
        </section>
      )}

      {/* Career Graph */}
      {canonical && (
        <section className="max-w-5xl mx-auto px-4 pb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#0B1533' }}>Career Roles and Industries</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold mb-2 text-amber-600">Entry-Level Roles</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                {canonical.typicalRoles.entry.map((r, i) => <li key={i}>- {r}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold mb-2 text-amber-600">Mid to Senior Roles</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                {canonical.typicalRoles.mid.map((r, i) => <li key={i}>- {r}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold mb-2 text-amber-600">Industries</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                {canonical.typicalRoles.industries.map((r, i) => <li key={i}>- {r}</li>)}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Universities Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#0B1533' }}>
          {uniCount} Universities Offering Online MBA {specName}
        </h2>
        <p className="text-sm text-slate-500 mb-6">Sorted by NIRF 2025 rank. Click any university for spec-specific programme details.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mbaUnis.map(u => (
            <UniversityCard key={u.id} u={u as any} highlightProgram="MBA" />
          ))}
        </div>
      </section>

      {/* Related Specialisations */}
      {canonical && canonical.relatedSpecs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-8">
          <h3 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>Also Consider</h3>
          <div className="flex flex-wrap gap-2">
            {canonical.relatedSpecs.map(rs => {
              const related = getCanonicalSpec(rs)
              if (!related) return null
              return (
                <Link
                  key={rs}
                  href={`/programs/mba/${rs}`}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:bg-amber-50 no-underline transition-colors"
                >
                  {related.canonicalName}
                </Link>
              )
            })}
            <Link
              href="/programs/mba"
              className="px-4 py-2 rounded-full text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:bg-amber-50 no-underline transition-colors"
            >
              ← All Specialisations
            </Link>
          </div>
        </section>
      )}

      {/* Compare CTA */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-700 py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-white mb-2">Compare Online MBA {specName} Programmes</h2>
          <p className="text-slate-300 text-sm mb-4">Side-by-side comparison of fees, NIRF rankings, and scholarships.</p>
          <Link href="/compare" className="inline-block px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors no-underline">
            Open Comparison Tool →
          </Link>
        </div>
      </section>

      {/* Counsellor CTA */}
      <section className="py-10 px-4 text-center">
        <p className="text-slate-500 text-sm mb-4 max-w-lg mx-auto">Get personalised guidance on picking the right {specName} MBA. Free 20-minute counselling call.</p>
        <Link href="/contact" className="inline-block px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors no-underline">
          Book Free Counselling →
        </Link>
      </section>
    </>
  )
}
