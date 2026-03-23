import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedPosts, BLOG_CATEGORIES } from '@/lib/blog'
import BlogIndexClient from './BlogIndexClient'
import BlogSidebarForm from '@/components/BlogSidebarForm'

export const metadata: Metadata = {
  title: 'Online MBA Blog India 2026 — Honest Guides, Reviews & Advice | Edify',
  description: 'No-fluff guides on online MBA, MCA, BBA in India. Compare fees, accreditation, career outcomes. Written by Edify experts. Updated for 2026 admissions.',
  keywords: 'online mba blog india, online degree guide 2026, ugc deb approved universities, best online mba india, online mba for working professionals',
  alternates: { canonical: 'https://edifyedu.in/blog' },
  openGraph: {
    title: 'Edify Blog — Online Degree Guides & University Reviews India 2026',
    description: 'Honest, independent guides on online degrees in India. No paid placements. NIRF-ranked comparisons.',
    url: 'https://edifyedu.in/blog',
    type: 'website',
  },
}

// ── Featured post ─────────────────────────────────────────────────────────────
function FeaturedPost({ post }: { post: ReturnType<typeof getPublishedPosts>[0] }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block no-underline group">
      <div className="rounded-2xl overflow-hidden border border-border bg-white hover:border-amber hover:shadow-md transition-all"
        style={{ borderLeft: '4px solid var(--amber)' }}>
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-light text-amber-text">
              {post.category}
            </span>
            <span className="text-[10px] font-bold text-amber uppercase tracking-widest px-3 py-1 rounded-full bg-amber/10">
              ⭐ Featured
            </span>
          </div>
          <h2 className="font-display text-lg sm:text-xl lg:text-2xl font-extrabold text-navy leading-tight mb-2 group-hover:text-amber transition-colors">
            {post.title}
          </h2>
          <p className="text-sm text-ink-3 leading-relaxed mb-4 line-clamp-2">
            {post.metaDescription}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-3">
            <span>🕐 {post.readTime} min read</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="text-amber font-semibold ml-auto group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
              Read article →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Trust strip ───────────────────────────────────────────────────────────────
function TrustStrip() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="text-[10px] font-bold text-ink-3 uppercase tracking-widest mb-4">Why Trust Edify?</div>
      {[
        { icon: '✅', text: 'Every post fact-checked against UGC DEB & NIRF data' },
        { icon: '🔒', text: 'Zero paid university partnerships — 100% independent' },
        { icon: '⭐', text: 'Real fees & salary data from 125+ universities' },
      ].map(({ icon, text }) => (
        <div key={text} className="flex items-start gap-3 mb-3 last:mb-0">
          <span className="text-base shrink-0 mt-0.5">{icon}</span>
          <p className="text-xs text-ink-3 leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  )
}

// ── Popular topics as pill chips ──────────────────────────────────────────────
const TRENDING_TOPICS = [
  { label: 'Online MBA 2026',          href: '/blog/online-mba-working-professionals-india-2026' },
  { label: 'UGC DEB Approved List',    href: '/blog/ugc-deb-approved-online-universities-india' },
  { label: 'MBA vs MCA',               href: '/programs/mba' },
  { label: 'Best MBA Specialisations', href: '/programs/mba/finance' },
  { label: 'Compare Universities',     href: '/compare' },
  { label: 'MBA for Govt Jobs',        href: '/blog/ugc-deb-approved-online-universities-india' },
  { label: 'Fees Under ₹1 Lakh',      href: '/universities' },
  { label: 'Online MCA 2026',          href: '/programs/mca' },
]

function PopularTopics() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="text-[10px] font-bold text-ink-3 uppercase tracking-widest mb-3">Trending Topics</div>
      {/* Horizontally scrollable on mobile, wraps on desktop */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {TRENDING_TOPICS.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber/30 bg-amber/5 text-amber hover:bg-amber hover:text-white transition-all no-underline whitespace-nowrap"
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const allPosts = getPublishedPosts()
  const featured  = allPosts[0]
  const restPosts = allPosts.slice(1)

  return (
    <div className="page-shell">

      {/* ── Hero / Page Header ─────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(180deg,#0B1D35 0%,#0f2137 100%)', borderBottom: '1px solid #1e2f45' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

          {/* Label */}
          <div className="text-[10px] font-bold text-amber uppercase tracking-widest mb-3">
            Edify Blog · Online Degree Guides India
          </div>

          {/* Heading */}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3" style={{ maxWidth: 600 }}>
            Honest Guides to Online Degrees in India 2026
          </h1>
          <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 500 }}>
            No paid content. No fluff. Real answers on fees, accreditation, career outcomes and which university is worth your money.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-5 sm:gap-8">
            {[
              { val: '125+', label: 'Universities reviewed' },
              { val: '2026', label: 'Data updated' },
              { val: 'Free', label: 'Independent advice' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <div className="text-lg sm:text-2xl font-extrabold text-amber leading-none">{val}</div>
                <div className="text-[10px] sm:text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Layout ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

          {/* ── Articles column — appears first on mobile, left on desktop ── */}
          <div className="flex-1 min-w-0">

            {/* Featured post */}
            {featured && (
              <div className="mb-6">
                <FeaturedPost post={featured} />
              </div>
            )}

            {/* Category filter + grid */}
            <BlogIndexClient posts={restPosts} categories={BLOG_CATEGORIES} />
          </div>

          {/* ── Sidebar — appears BELOW articles on mobile, right on desktop ── */}
          <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0">
            <div className="lg:sticky lg:top-20 flex flex-col gap-4">

              {/* Lead capture form */}
              <BlogSidebarForm />

              {/* Trending topics */}
              <PopularTopics />

              {/* Why trust */}
              <TrustStrip />

              {/* Compare CTA */}
              <div className="rounded-2xl overflow-hidden border border-amber/30 bg-amber/5 p-5 text-center">
                <div className="text-2xl mb-2">⚖️</div>
                <div className="font-bold text-navy text-sm mb-1.5">Compare All Universities</div>
                <p className="text-xs text-ink-3 mb-3">Side-by-side fees, rankings & placements</p>
                <Link
                  href="/compare"
                  className="block py-2.5 rounded-xl font-bold text-white text-xs no-underline transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,var(--amber),var(--amber-bright))' }}
                >
                  Open Comparison Tool →
                </Link>
              </div>

            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
