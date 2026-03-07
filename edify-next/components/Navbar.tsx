'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, X, Menu, GraduationCap, Phone } from 'lucide-react'
import { UNIVERSITIES, PROGRAM_META } from '@/lib/data'
import type { Program } from '@/lib/data'

/* ─── PREMIUM BRANDS shown in mega menu ─────────────────────────────────────
   Neuroscience: familiarity bias — people convert faster when they recognise
   brand names. Show only reputed brands, sorted by NIRF, horizontally scrollable.
   ─────────────────────────────────────────────────────────────────────────── */
const PREMIUM_IDS = [
  'nmims', 'symbiosis', 'manipal', 'chandigarh', 'lpu', 'amity',
  'bits-pilani-work-integrat', 'srm-institut-of-science', 'jain', 'dypatil',
]

const PROGRAM_CATEGORIES = {
  'Postgraduate': ['MBA', 'MBA (WX)', 'MCA', 'MA', 'M.Com', 'MSc'],
  'Undergraduate': ['BBA', 'BCA', 'BA', 'B.Com', 'BSc'],
}

export default function Navbar() {
  const [megaOpen, setMegaOpen]             = useState(false)
  const [activeProgram, setActiveProgram]   = useState('MBA')
  const [searchQuery, setSearchQuery]       = useState('')
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [mobileSearch, setMobileSearch]     = useState('')
  const [mobileProgOpen, setMobileProgOpen] = useState(false)
  const closeTimer = useRef<NodeJS.Timeout>()

  const searchResults = searchQuery.length > 1
    ? UNIVERSITIES.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.programs.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : []

  const mobileSearchResults = mobileSearch.length > 1
    ? UNIVERSITIES.filter(u =>
        u.name.toLowerCase().includes(mobileSearch.toLowerCase()) ||
        u.programs.some(p => p.toLowerCase().includes(mobileSearch.toLowerCase()))
      ).slice(0, 5)
    : []

  /* Premium universities for the active program — brand names only, scrollable */
  const premiumForActive = UNIVERSITIES
    .filter(u => PREMIUM_IDS.includes(u.id) && u.programs.includes(activeProgram as Program))
    .sort((a, b) => a.nirf - b.nirf)

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
          border-radius: 8px; font-size: 13px; transition: all 0.12s;
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
          text-decoration: none; transition: all 0.15s; flex-shrink: 0;
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
      <div style={{ background: 'var(--navy)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        className="py-1.5 px-4 text-center text-xs">
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>India&apos;s most trusted guide — </span>
        <span style={{ color: 'var(--amber-bright)', fontWeight: 700 }}>
          Zero paid rankings · 106+ UGC verified universities
        </span>
      </div>

      {/* ── Main header ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50"
        style={{ background: '#fff', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0" style={{ textDecoration: 'none' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,var(--navy),var(--navy-light))', boxShadow: '0 2px 8px rgba(11,29,53,0.25)' }}>
                <GraduationCap className="w-5 h-5" style={{ color: 'var(--amber-bright)' }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: '20px', fontWeight: 800, color: 'var(--navy)', lineHeight: 1, letterSpacing: '-0.01em' }}>Edify</div>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber)', marginTop: '1px' }}>edifyedu.in</div>
              </div>
            </Link>

            {/* Desktop search */}
            <div className="flex-1 max-w-xs hidden md:block">
              <div style={{ position: 'relative' }}>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--ink-3)', zIndex: 1 }} />
                <input
                  type="search"
                  placeholder="Search 106+ universities..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onBlur={() => setTimeout(() => setSearchQuery(''), 220)}
                  className="nav-search"
                  style={{ width: '100%', paddingLeft: '38px', paddingRight: '14px', paddingTop: '9px', paddingBottom: '9px', borderRadius: '10px', border: '1.5px solid var(--border)', outline: 'none', background: 'var(--surface-2)', fontSize: '13px', color: 'var(--ink)', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--amber)')}
                />
                {searchQuery.length > 1 && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, borderRadius: '14px', overflow: 'hidden', background: '#fff', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-xl)', zIndex: 200 }}>
                    {searchResults.length > 0 ? searchResults.map(u => (
                      <Link key={u.id} href={`/universities/${u.id}`} className="nav-search-row">
                        <div style={{ width: '4px', height: '32px', borderRadius: '2px', background: u.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--amber)', marginTop: '2px', fontWeight: 600 }}>NIRF #{u.nirf} · {u.city}</div>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', background: 'var(--sage-light)', color: 'var(--sage)', flexShrink: 0 }}>UGC ✓</span>
                      </Link>
                    )) : (
                      <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--ink-3)' }}>No universities found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5 ml-auto">
              {/* Programs mega menu */}
              <div style={{ position: 'relative' }} onMouseEnter={openMega} onMouseLeave={scheduledClose}>
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', transition: 'all 0.15s', background: megaOpen ? 'var(--amber-light)' : 'transparent', color: megaOpen ? 'var(--amber)' : 'var(--ink-2)' }}>
                  Programs
                  <ChevronDown style={{ width: '14px', height: '14px', transition: 'transform 0.2s', transform: megaOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>

                {megaOpen && (
                  <div
                    style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', width: '720px', borderRadius: '16px', overflow: 'hidden', background: '#fff', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-xl)', zIndex: 200 }}
                    onMouseEnter={openMega} onMouseLeave={scheduledClose}>
                    <div style={{ display: 'flex' }}>

                      {/* Left: program list */}
                      <div style={{ width: '190px', padding: '12px', background: 'var(--surface-2)', borderRight: '1px solid var(--border)', flexShrink: 0 }}>
                        {Object.entries(PROGRAM_CATEGORIES).map(([cat, progs]) => (
                          <div key={cat} style={{ marginBottom: '16px' }}>
                            <div style={{ padding: '4px 12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-3)', marginBottom: '4px' }}>{cat}</div>
                            {progs.map(prog => (
                              <button key={prog}
                                className={`nav-prog-btn ${activeProgram === prog ? 'active' : ''}`}
                                onMouseEnter={() => setActiveProgram(prog)}
                                onClick={() => setMegaOpen(false)}>
                                {(PROGRAM_META as any)[prog]?.icon || '📚'} {prog}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Right: premium brands for this program */}
                      <div style={{ flex: 1, padding: '16px', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ fontFamily: "'Fraunces',serif", fontSize: '16px', fontWeight: 700, color: 'var(--navy)' }}>
                            Online {activeProgram}
                          </div>
                          <Link
                            href={`/programs/${activeProgram.toLowerCase().replace(/[\s()]/g, '-').replace(/-+/g, '-')}`}
                            style={{ fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '999px', background: 'var(--amber-light)', color: 'var(--amber)', textDecoration: 'none' }}
                            onClick={() => setMegaOpen(false)}>
                            View all →
                          </Link>
                        </div>

                        {/* Neuroscience: horizontal scroll of brand pills — familiar names build confidence */}
                        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                          Premium Brands
                        </div>
                        {premiumForActive.length > 0 ? (
                          <div className="brand-scroll" style={{ marginBottom: '14px' }}>
                            {premiumForActive.map(u => (
                              <Link key={u.id} href={`/universities/${u.id}`} className="brand-pill"
                                onClick={() => setMegaOpen(false)}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.color, flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)' }}>{u.abbr}</div>
                                  <div style={{ fontSize: '10px', color: 'var(--amber)', fontWeight: 600 }}>NIRF #{u.nirf}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: '13px', color: 'var(--ink-3)', padding: '8px 0 14px' }}>No premium brands for this program</p>
                        )}

                        {/* Below: top 4 by NIRF (all universities) */}
                        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                          Top by NIRF Rank
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {UNIVERSITIES
                            .filter(u => u.programs.includes(activeProgram as Program))
                            .sort((a, b) => a.nirf - b.nirf)
                            .slice(0, 4)
                            .map(u => (
                              <Link key={u.id} href={`/universities/${u.id}`} className="nav-mega-link"
                                onClick={() => setMegaOpen(false)}>
                                <div style={{ width: '3px', height: '28px', borderRadius: '2px', background: u.color, flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '1px' }}>
                                    <span style={{ color: 'var(--amber)', fontWeight: 700 }}>NIRF #{u.nirf}</span>
                                    {' · '}{u.programDetails[activeProgram as Program]?.fees || 'See fees'}
                                  </div>
                                </div>
                                <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '999px', background: 'var(--navy)', color: 'var(--amber-bright)', flexShrink: 0 }}>#{u.nirf}</span>
                              </Link>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {[
                { label: 'Universities', href: '/universities' },
                { label: 'Compare',     href: '/compare' },
                { label: 'Blog',        href: '/blog' },
                { label: 'Guides',      href: '/guides' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="nav-link">{item.label}</Link>
              ))}
            </nav>

            {/* Right CTA */}
            <div className="flex items-center gap-2 ml-auto lg:ml-3 shrink-0">
              {/* Neuroscience: phone icon + number = highest trust signal in nav */}
              <a href="tel:+917061285806" className="hidden xl:flex items-center gap-1.5"
                style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-2)', textDecoration: 'none' }}>
                <Phone style={{ width: '13px', height: '13px', color: 'var(--sage)' }} />
                +91 70612 85806
              </a>
              <Link href="/universities"
                className="hidden sm:inline-flex items-center gap-2 btn-primary"
                style={{ padding: '9px 18px', borderRadius: '10px', fontSize: '13px', textDecoration: 'none' }}>
                Free Counselling
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
            style={{ background: '#fff', borderTop: '1px solid var(--border)', maxHeight: '88vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* Mobile search */}
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--ink-3)' }} />
                <input
                  type="search"
                  placeholder="Search universities, programs..."
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
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {mobileSearchResults.length > 0 ? mobileSearchResults.map(u => (
                    <Link key={u.id} href={`/universities/${u.id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: '#fff', textDecoration: 'none' }}
                      onClick={() => { setMobileOpen(false); setMobileSearch('') }}>
                      <div style={{ width: '4px', height: '32px', borderRadius: '2px', background: u.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>{u.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--amber)', marginTop: '2px', fontWeight: 600 }}>NIRF #{u.nirf} · {u.city}</div>
                      </div>
                    </Link>
                  )) : (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--ink-3)' }}>No universities found</div>
                  )}
                </div>
              )}

              {/* Premium brands scrollable — mobile */}
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: '4px' }}>
                Top Brands
              </div>
              <div className="brand-scroll">
                {UNIVERSITIES
                  .filter(u => PREMIUM_IDS.includes(u.id))
                  .sort((a, b) => a.nirf - b.nirf)
                  .map(u => (
                    <Link key={u.id} href={`/universities/${u.id}`} className="brand-pill"
                      onClick={() => setMobileOpen(false)}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: u.color }} />
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>{u.abbr}</span>
                    </Link>
                  ))}
              </div>

              {/* Programs accordion */}
              <button
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--navy)', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}
                onClick={() => setMobileProgOpen(!mobileProgOpen)}>
                All Programs
                <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--ink-3)', transform: mobileProgOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {mobileProgOpen && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
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
                          <span>{(PROGRAM_META as any)[prog]?.icon || '📚'} {prog}</span>
                          <ChevronDown style={{ width: '14px', height: '14px', transform: 'rotate(-90deg)', color: 'var(--ink-3)' }} />
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {[
                { label: '🎓 All Universities', href: '/universities' },
                { label: '⚖️ Compare Programs', href: '/compare' },
                { label: '📰 Blog',             href: '/blog' },
                { label: '📚 Guides',           href: '/guides' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="mob-link"
                  onClick={() => setMobileOpen(false)}>
                  {item.label}
                  <ChevronDown style={{ width: '14px', height: '14px', transform: 'rotate(-90deg)', color: 'var(--ink-3)' }} />
                </Link>
              ))}

              {/* Phone CTA in mobile menu — neuroscience: personal contact = highest trust */}
              <a href="tel:+917061285806"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '12px', background: 'var(--sage-light)', border: '1.5px solid rgba(46,125,100,0.25)', color: 'var(--sage)', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
                <Phone style={{ width: '16px', height: '16px' }} />
                Call: +91 70612 85806
              </a>

              <Link href="/universities"
                style={{ display: 'block', textAlign: 'center', padding: '15px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', textDecoration: 'none', background: 'var(--amber)', color: '#fff' }}
                onClick={() => setMobileOpen(false)}>
                Get Free Counselling →
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
