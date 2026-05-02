import Link from 'next/link'
import { Phone, Mail, Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy text-white/70">
      <style>{`
        .footer-link { color: rgba(255,255,255,0.45); transition: color 0.15s; display: block; font-size: 14px; margin-bottom: 10px; text-decoration: none; line-height: 1.4; }
        .footer-link:hover { color: rgba(255,255,255,0.9); }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 shrink-0 mb-4 inline-flex no-underline">
              <img src="/logos/university_logos/edify_logo_transparent_ondark.svg" alt="edifyedu.in" style={{ height: '36px', width: 'auto' }} />
            </Link>
            <p className="text-sm leading-relaxed mb-5" style={{ color:'rgba(255,255,255,0.45)', lineHeight:'1.7' }}>
              India&apos;s independent guide to UGC DEB approved online degrees. No paid rankings. No university affiliations.
            </p>
            <div className="flex flex-col gap-2">
              <a href="tel:7061285806" className="footer-link flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-amber" /> 70612 85806
              </a>
              <a href="mailto:hello@edifyedu.in" className="footer-link flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-amber" /> hello@edifyedu.in
              </a>
            </div>
            {/* Social links */}
            <div className="flex items-center gap-3 mt-5">
              <a href="https://youtube.com/@edify_edu?si=WEtJnuyFvY3j0Im3" target="_blank" rel="noopener noreferrer"
                aria-label="edifyedu.in on YouTube"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-100"
                style={{ background:'rgba(255,255,255,0.08)', opacity:0.6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/_edifyeducation?igsh=MXhhYzZmYzVvaHM5OQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer"
                aria-label="edifyedu.in on Instagram"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-100"
                style={{ background:'rgba(255,255,255,0.08)', opacity:0.6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/edifyeducation/" target="_blank" rel="noopener noreferrer"
                aria-label="edifyedu.in on LinkedIn"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-100"
                style={{ background:'rgba(255,255,255,0.08)', opacity:0.6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ background:'rgba(21,128,61,0.15)', color:'var(--sage-bright)', border:'1px solid rgba(21,128,61,0.25)' }}>
                <Shield className="w-3 h-3" /> Zero paid university deals
              </span>
            </div>
          </div>

          {/* Universities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-amber">Top Universities</h4>
            {[
              { label:'NMIMS Online',     href:'/universities/nmims-online' },
              { label:'Symbiosis SSODL',  href:'/universities/symbiosis-university-online' },
              { label:'Manipal Online',   href:'/universities/manipal-university-jaipur-online' },
              { label:'LPU Online',       href:'/universities/lovely-professional-university-online' },
              { label:'Amity Online',     href:'/universities/amity-university-online' },
              { label:'View All 125+ →',  href:'/universities' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
            ))}
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-amber">Programs</h4>
            {[
              { label:'MBA',   slug:'mba'  },
              { label:'MCA',   slug:'mca'  },
              { label:'BBA',   slug:'bba'  },
              { label:'BCA',   slug:'bca'  },
              { label:'B.Com', slug:'bcom' },
              { label:'MA',    slug:'ma'   },
              { label:'M.Com', slug:'mcom' },
              { label:'BA',    slug:'ba'   },
            ].map(p => (
              <Link key={p.slug} href={`/programs/${p.slug}`} className="footer-link">Online {p.label}</Link>
            ))}
          </div>

          {/* Guides + Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-amber">Guides</h4>
            {[
              { label:'Best Online MBA in India 2026',         href:'/best-online-mba-india' },
            { label:'Is Online Degree Valid in India?',     href:'/guides/is-online-degree-valid-india' },
              { label:'Online MBA for Government Jobs',        href:'/guides/online-mba-for-government-jobs' },
              { label:'Online MBA vs Distance MBA',           href:'/guides/online-mba-vs-distance-mba' },
              { label:'How to Check UGC DEB Approval',        href:'/guides/how-to-check-ugc-deb-approval' },
              { label:'NAAC & NIRF Rankings Explained',       href:'/guides/naac-nirf-rankings-explained' },
              { label:'Online MBA Eligibility in India',      href:'/guides/online-mba-eligibility-india' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
            ))}
            <h4 className="text-xs font-bold uppercase tracking-widest mt-6 mb-5 text-amber">Tools</h4>
            {[
              { label:'EMI Calculator',         href:'/tools/emi-calculator' },
              { label:'CGPA Calculator',         href:'/tools/cgpa-calculator' },
              { label:'Percentage to GPA',       href:'/tools/percentage-to-gpa' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
            ))}
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-amber">Resources</h4>
            {[
              { label:'Compare Universities',  href:'/compare' },
              { label:'Discount Coupons',      href:'/coupons' },
              { label:'Blog',                  href:'/blog' },
              { label:'About Us',              href:'/about' },
              { label:'Contact Us',            href:'/contact' },
              { label:'Privacy Policy',        href:'/privacy-policy' },
            ].map(l => (
              <Link key={l.label} href={l.href} className="footer-link">{l.label}</Link>
            ))}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs text-white/25">
            © 2026 Edify (edifyedu.in) — Independent information portal. Not affiliated with any university.
          </p>
          <p className="text-xs text-center text-white/25">
            All data from public UGC/NAAC/NIRF records. Verify fees with university before enrolling.
          </p>
        </div>
      </div>
    </footer>
  )
}
