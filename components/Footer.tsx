import Link from 'next/link'
import { GraduationCap, Phone, Mail, Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy text-white/70">
      <style>{`
        .footer-link { color: rgba(255,255,255,0.45); transition: color 0.15s; display: block; font-size: 14px; margin-bottom: 10px; text-decoration: none; line-height: 1.4; }
        .footer-link:hover { color: rgba(255,255,255,0.9); }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 shrink-0 mb-4 inline-flex no-underline">
              <img src="/logos/university_logos/edify_logo_transparent_ondark.svg" alt="Edify" style={{ height: '36px', width: 'auto' }} />
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
            <div className="mt-5">
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
              { label:'Symbiosis SSODL',   href:'/universities/symbiosis-university-online' },
              { label:'Manipal Online',   href:'/universities/manipal-university-jaipur-online' },
              { label:'LPU Online',       href:'/universities/lovely-professional-university-online' },
              { label:'Amity Online',     href:'/universities/amity-university-online' },
              { label:'View All 100+ →',  href:'/universities' },
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

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-amber">Resources</h4>
            {[
              { label:'Is My Degree Valid for Govt Jobs?', href:'/guides' },
              { label:'Online vs Distance Education',      href:'/guides' },
              { label:'Compare Universities',              href:'/compare' },
              { label:'UGC DEB What It Means',            href:'/guides' },
              { label:'Is Online MBA Worth It?',           href:'/guides' },
              { label:'Blog',                              href:'/blog' },
              { label:'About Us',                          href:'/about' },
              { label:'Contact Us',                        href:'/contact' },
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
