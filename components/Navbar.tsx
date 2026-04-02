'use client'
import { getSortRank } from '@/lib/data-slim'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, X, Menu, GraduationCap, Phone } from 'lucide-react'
import { UNIS_SLIM } from '@/lib/data-slim'
import { PROGRAM_META } from '@/lib/data-client'
import type { Program } from '@/lib/data-client'

/* ─── Well-known universities shown in mega menu ────────────────────────────
   Show only recognised universities, sorted by NIRF, horizontally scrollable.
   ─────────────────────────────────────────────────────────────────────────── */
const FEATURED_IDS = [
  'nmims', 'symbiosis', 'manipal-jaipur', 'chandigarh', 'lpu', 'amity',
  'bits-pilani-work-integrat', 'srm-institut-of-science', 'jain', 'dypatil',
]

const PROGRAM_CATEGORIES = {
  'Postgraduate': ['MBA', 'MCA', 'MA', 'M.Com', 'MSc'],
  'Undergraduate': ['BBA', 'BCA', 'BA', 'B.Com', 'BSc'],
}

// Popular specializations to highlight
const TRENDING_SPECS = [
  { name: 'AI & Machine Learning', slug: 'artificial-intelligence-machine-learning', program: 'MBA' },
  { name: 'Data Science', slug: 'data-science', program: 'MBA' },
  { name: 'Business Analytics', slug: 'business-analytics', program: 'MBA' },
  { name: 'Digital Marketing', slug: 'digital-marketing', program: 'MBA' },
  { name: 'Finance', slug: 'finance', program: 'MBA' },
  { name: 'Human Resource Management', slug: 'human-resource-management', program: 'MBA' },
]

export default function Navbar() {
  const [megaOpen, setMegaOpen]             = useState(false)
  const [activeProgram, setActiveProgram]   = useState('MBA')
  const [searchQuery, setSearchQuery]       = useState('')
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [mobileSearch, setMobileSearch]     = useState('')
  const [mobileProgOpen, setMobileProgOpen] = useState(false)
  const closeTimer = useRef<NodeJS.Timeout>()

  const searchResults = searchQuery.length > 1
    ? UNIS_SLIM.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.programs.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : []

  const mobileSearchResults = mobileSearch.length > 1
    ? UNIS_SLIM.filter(u =>
        u.name.toLowerCase().includes(mobileSearch.toLowerCase()) ||
        u.programs.some(p => p.toLowerCase().includes(mobileSearch.toLowerCase()))
      ).slice(0, 5)
    : []

  /* Featured universities for the active program — well-known names only */
  const featuredForActive = UNIS_SLIM
    .filter(u => FEATURED_IDS.includes(u.id) && u.programs.includes(activeProgram as Program))
    .sort((a, b) => getSortRank(a) - getSortRank(b))

  function openMega()       { clearTimeout(closeTimer.current); setMegaOpen(true) }
  function scheduledClose() { closeTimer.current = setTimeout(() => setMegaOpen(false), 180) }
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  return (
    <>
      <style>{`
        /* Navbar internal styles */
        .nav-mega-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          text-decoration: none; transition: background 0.12s;
          color: var(--navy);
        }
        .nav-mega-link:hover { background: var(--surface-2); }

        .nav-search-row {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; border-bottom: 1px solid var(--border-light);
          text-decoration: none; transition: background 0.1s;
        }
        .nav-search-row:hover { background: var(--bg); }

        .nav-prog-btn {
          width: 100%; text-align: left; padding: 8px 12px;
          border-radius: 8px; font-size: 13px; transition: var(--t-fast);
          cursor: pointer; border: none; background: transparent;
          color: var(--ink-2); font-family: inherit;
        }
        .nav-prog-btn:hover { background: var(--surface-3); }
        .nav-prog-btn.active {
          background: var(--navy); color: #fff; font-weight: 600;
        }

        /* Brand scroll strip */
        .brand-scroll {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px;
          -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .brand-scroll::-webkit-scrollbar { display: none; }

        .brand-pill {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 14px; border-radius: 10px; white-space: nowrap;
          border: 1.5px solid var(--border); background: var(--surface);
          text-decoration: none; transition: var(--t-base); flex-shrink: 0;
          color: var(--ink);
        }
        .brand-pill:hover { border-color: var(--amber); background: var(--amber-light); }

        /* Mobile menu item */
        .mob-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-radius: 12px; font-size: 14px;
          font-weight: 600; text-decoration: none; transition: background 0.1s;
          background: var(--surface-2); border: 1px solid var(--border);
          color: var(--navy);
        }
        .mob-link:hover { background: var(--surface-3); }

        /* Prevent iOS zoom on inputs */
        .nav-search { font-size: 16px !important; }
      `}</style>

      {/* ── Trust bar ─────────────────────────────────────────── */}
      <div className="bg-navy border-b border-white/[0.07] py-1.5 px-4 text-center text-xs">
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>India&apos;s independent education guide — </span>
        <span className="text-amber font-bold">
          106+ UGC DEB verified universities · NIRF ranked
        </span>
      </div>

      {/* ── Main header ───────────────────────────────────────── */}
      <header className="sticky top-0 bg-white border-b border-border shadow-sm" style={{ zIndex: 9990 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline">
              <img src="/logos/university_logos/edify_logo_transparent_onlight.svg" alt="Edify" className="h-8 sm:h-10 lg:h-12 w-auto object-contain" />
            </Link>

            {/* Desktop search */}
            <div className="flex-1 max-w-xs hidden md:block">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 z-[1]" />
                <input
                  type="search"
                  placeholder="Search universities..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onBlur={() => setTimeout(() => setSearchQuery(''), 220)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-border shadow-lg z-50 overflow-hidden">
                    {searchResults.map(u => (
                      <Link key={u.id} href={`/universities/${u.id}`} className="nav-search-row">
                        <div style={{ width: '4px', height: '28px', borderRadius: '2px', background: u.color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)' }}>{u.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{u.nirf < 200 ? `NIRF #${u.nirf} · ` : ''}{u.city}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Programs dropdown */}
              <div
                onMouseEnter={openMega}
                onMouseLeave={scheduledClose}
                className="relative"
              >
                <button
                  onClick={() => setMegaOpen(!megaOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-ink hover:bg-surface-2 transition-colors"
                  style={{ cursor: 'pointer', border: 'none', background: 'transparent', fontFamily: 'inherit' }}
                >
                  Programs
                  <ChevronDown className="w-4 h-4" style={{ transform: megaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {megaOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 bg-white rounded-2xl border border-border shadow-xl"
                    style={{ width: '680px', zIndex: 9999 }}
                    onMouseEnter={openMega}
                    onMouseLeave={scheduledClose}
                  >
                    <div className="flex">
                      {/* Left: Program list */}
                      <div className="w-48 border-r border-border p-3">
                        <div className="text-[10px] font-bold text-ink-3 uppercase tracking-wider px-3 mb-2">
                          Postgraduate
                        </div>
                        {PROGRAM_CATEGORIES.Postgraduate.map(prog => (
                          <Link
                            key={prog}
                            href={`/programs/${prog.toLowerCase().replace(/[\s().]/g, '')}`}
                            className={`nav-prog-btn ${activeProgram === prog ? 'active' : ''}`}
                            onMouseEnter={() => setActiveProgram(prog)}
                            onClick={() => setMegaOpen(false)}
                            style={{ display: 'block', textDecoration: 'none' }}
                          >
                            {(PROGRAM_META[prog as keyof typeof PROGRAM_META])?.icon || '📚'} {prog}
                          </Link>
                        ))}
                        <div className="text-[10px] font-bold text-ink-3 uppercase tracking-wider px-3 mt-4 mb-2">
                          Undergraduate
                        </div>
                        {PROGRAM_CATEGORIES.Undergraduate.map(prog => (
                          <Link
                            key={prog}
                            href={`/programs/${prog.toLowerCase().replace(/[\s().]/g, '')}`}
                            className={`nav-prog-btn ${activeProgram === prog ? 'active' : ''}`}
                            onMouseEnter={() => setActiveProgram(prog)}
                            onClick={() => setMegaOpen(false)}
                            style={{ display: 'block', textDecoration: 'none' }}
                          >
                            {(PROGRAM_META[prog as keyof typeof PROGRAM_META])?.icon || '📚'} {prog}
                          </Link>
                        ))}
                      </div>

                      {/* Right: Featured universities + Trending Specs */}
                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-bold text-navy">
                            Top Universities for {activeProgram}
                          </div>
                          <Link
                            href={`/programs/${activeProgram.toLowerCase().replace(/[\s().]/g, '')}`}
                            className="text-xs font-semibold text-amber hover:underline"
                            onClick={() => setMegaOpen(false)}
                          >
                            View all →
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {featuredForActive.slice(0, 4).map(u => (
                            <Link
                              key={u.id}
                              href={`/universities/${u.id}`}
                              className="nav-mega-link"
                              onClick={() => setMegaOpen(false)}
                            >
                              {u.logo ? (
                                <div className="w-12 h-10 shrink-0 bg-white border border-slate-200 rounded flex items-center justify-center p-1 shadow-sm">
                                  <img src={u.logo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                              ) : (
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: u.color }} />
                              )}
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{u.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '2px' }}>{u.nirf < 200 ? `NIRF #${u.nirf}` : u.naac}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                        
                        {/* Trending Specializations */}
                        {activeProgram === 'MBA' && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="text-[10px] font-bold text-ink-3 uppercase tracking-wider mb-2">
                              Trending Specializations
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {TRENDING_SPECS.map(spec => (
                                <Link
                                  key={spec.slug}
                                  href={`/programs/mba/${spec.slug}`}
                                  className="text-xs px-2.5 py-1 rounded-full bg-amber/10 text-amber font-medium hover:bg-amber/20 transition-colors"
                                  onClick={() => setMegaOpen(false)}
                                >
                                  {spec.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Link
                          href="/universities"
                          className="block mt-3 py-2.5 text-center rounded-lg bg-surface-2 text-sm font-semibold text-navy hover:bg-surface-3 transition-colors"
                          onClick={() => setMegaOpen(false)}
                        >
                          Browse All Universities →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {[
                { label: 'Universities', href: '/universities' },
                { label: 'Compare', href: '/compare' },
                { label: 'Guides', href: '/guides' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-ink hover:bg-surface-2 transition-colors no-underline"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right CTA */}
            <div className="flex items-center gap-2 ml-auto lg:ml-3 shrink-0">
              <a href="tel:+917061285806" className="hidden xl:flex items-center gap-1.5"
                style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-2)', textDecoration: 'none' }}>
                <Phone style={{ width: '13px', height: '13px', color: 'var(--sage)' }} />
                +91 70612 85806
              </a>
              <Link href="/universities"
                className="hidden sm:inline-flex items-center gap-2 btn-primary"
                style={{ padding: '9px 18px', borderRadius: '10px', fontSize: '13px', textDecoration: 'none' }}>
                Browse Universities
              </Link>
              <button
                className="lg:hidden p-2.5 rounded-xl transition-colors"
                style={{ color: 'var(--ink-2)', background: mobileOpen ? 'var(--surface-2)' : 'transparent', border: 'none', cursor: 'pointer' }}
                onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ───────────────────────────────────────── */}
        {mobileOpen && (
          <div className="lg:hidden"
            style={{ background: '#fff', borderTop: '1px solid var(--border)', maxHeight: '88vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* Mobile search */}
              <div className="relative">
                <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--ink-3)' }} />
                <input
                  type="search"
                  placeholder="Search universities, programs..." aria-label="Search universities and programs"
                  value={mobileSearch}
                  onChange={e => setMobileSearch(e.target.value)}
                  className="nav-search"
                  style={{ width: '100%', paddingLeft: '42px', paddingRight: '42px', paddingTop: '13px', paddingBottom: '13px', borderRadius: '12px', border: '1.5px solid var(--border)', outline: 'none', background: 'var(--surface-2)', fontSize: '16px', color: 'var(--ink)', fontFamily: 'inherit' }}
                />
                {mobileSearch && (
                  <button onClick={() => setMobileSearch('')}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X style={{ width: '16px', height: '16px', color: 'var(--ink-3)' }} />
                  </button>
                )}
              </div>

              {mobileSearch.length > 1 && (
                <div className="rounded-xl overflow-hidden border border-border">
                  {mobileSearchResults.length > 0 ? mobileSearchResults.map(u => (
                    <Link key={u.id} href={`/universities/${u.id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: '#fff', textDecoration: 'none' }}
                      onClick={() => { setMobileOpen(false); setMobileSearch('') }}>
                      <div style={{ width: '4px', height: '32px', borderRadius: '2px', background: u.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>{u.name}</div>
                        <div className="text-[11px] text-amber mt-0.5 font-semibold">{u.nirf < 200 ? `NIRF #${u.nirf} · ` : ''}{u.city}</div>
                      </div>
                    </Link>
                  )) : (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--ink-3)' }}>No universities found</div>
                  )}
                </div>
              )}

              {/* Featured universities — mobile */}
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: '4px' }}>
                Top Universities
              </div>
              <div className="brand-scroll">
                {UNIS_SLIM
                  .filter(u => FEATURED_IDS.includes(u.id))
                  .sort((a, b) => getSortRank(a) - getSortRank(b))
                  .map(u => (
                    <Link key={u.id} href={`/universities/${u.id}`} className="brand-pill"
                      onClick={() => setMobileOpen(false)}>
                      {u.logo ? (
                        <div className="w-7 h-7 shrink-0 bg-white border border-slate-200 rounded flex items-center justify-center p-0.5 shadow-sm">
                          <img src={u.logo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: u.color }} />
                      )}
                      <span style={{ fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{u.name}</span>
                    </Link>
                  ))}
              </div>

              {/* Programs accordion */}
              <button
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--navy)', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}
                onClick={() => setMobileProgOpen(!mobileProgOpen)}>
                All Programs
                <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--ink-3)', transform: mobileProgOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
              </button>

              {mobileProgOpen && (
                <div className="rounded-xl overflow-hidden border border-border">
                  {[
                    { group: 'Postgraduate', items: ['MBA', 'MCA', 'MA', 'M.Com', 'MSc'] },
                    { group: 'Undergraduate', items: ['BBA', 'BCA', 'BA', 'B.Com', 'BSc'] },
                  ].map(({ group, items }) => (
                    <div key={group}>
                      <div style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'var(--surface-3)', color: 'var(--ink-3)', borderBottom: '1px solid var(--border)' }}>
                        {group}
                      </div>
                      {items.map(prog => (
                        <Link key={prog}
                          href={`/programs/${prog.toLowerCase().replace(/[\s().]/g, '').replace(/\+/g, '')}`}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '1px solid var(--border-light)', background: '#fff', color: 'var(--navy)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
                          onClick={() => setMobileOpen(false)}>
                          <span>{(PROGRAM_META[prog as keyof typeof PROGRAM_META])?.icon || '📚'} {prog}</span>
                          <ChevronDown className="w-[14px] h-[14px] rotate-[-90deg] text-ink-3" />
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {[
                { label: 'All Universities', href: '/universities' },
                { label: 'Compare Programs', href: '/compare' },
                { label: 'Guides', href: '/guides' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="mob-link"
                  onClick={() => setMobileOpen(false)}>
                  {item.label}
                  <ChevronDown className="w-[14px] h-[14px] rotate-[-90deg] text-ink-3" />
                </Link>
              ))}

              {/* Phone CTA in mobile menu */}
              <a href="tel:+917061285806"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '12px', background: 'var(--sage-light)', border: '1.5px solid rgba(46,125,100,0.25)', color: 'var(--sage)', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
                <Phone style={{ width: '16px', height: '16px' }} />
                Call: +91 70612 85806
              </a>

              <Link href="/universities"
                style={{ display: 'block', textAlign: 'center', padding: '15px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', textDecoration: 'none', background: 'var(--amber)', color: '#fff' }}
                onClick={() => setMobileOpen(false)}>
                Browse Universities →
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
