import Link from 'next/link'
import { GraduationCap, Phone, Mail, Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background:'var(--navy)', color:'rgba(255,255,255,0.7)' }}>
      <style>{`
        .footer-link { color: rgba(255,255,255,0.45); transition: color 0.15s; display: block; font-size: 14px; margin-bottom: 10px; text-decoration: none; line-height: 1.4; }
        .footer-link:hover { color: rgba(255,255,255,0.9); }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)' }}>
                <GraduationCap className="w-5 h-5" style={{ color:'var(--amber-bright)' }} />
              </div>
              <div>
                <div className="font-semibold text-xl text-white" style={{ fontFamily:"'Fraunces',serif", letterSpacing:'0.03em' }}>Edify</div>
                <div className="text-[9px] tracking-widest uppercase" style={{ color:'var(--amber-bright)', letterSpacing:'0.12em' }}>edifyedu.in</div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-5" style={{ color:'rgba(255,255,255,0.45)', lineHeight:'1.7' }}>
              India&apos;s independent guide to UGC DEB approved online degrees. No paid rankings. No university affiliations.
            </p>
            <div className="flex flex-col gap-2">
              <a href="tel:7061285806" className="footer-link flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" style={{ color:'var(--amber-bright)' }} /> 70612 85806
              </a>
              <a href="mailto:hello@edifyedu.in" className="footer-link flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" style={{ color:'var(--amber-bright)' }} /> hello@edifyedu.in
              </a>
            </div>
            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ background:'rgba(21,128,61,0.15)', color:'#4ade80', border:'1px solid rgba(21,128,61,0.25)' }}>
                <Shield className="w-3 h-3" /> Zero paid university deals
              </span>
            </div>
          </div>

          {/* Universities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color:'var(--amber-bright)' }}>Top Universities</h4>
            {[
              { label:'NMIMS Online',     href:'/universities/nmims' },
              { label:'Symbiosis SSDL',   href:'/universities/symbiosis' },
              { label:'Manipal Online',   href:'/universities/manipal' },
              { label:'LPU Online',       href:'/universities/lpu' },
              { label:'Amity Online',     href:'/universities/amity' },
              { label:'View All 100+ →',  href:'/universities' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
            ))}
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color:'var(--amber-bright)' }}>Programs</h4>
            {['MBA','MCA','BBA','BCA','B.Com','MA','M.Com','BA'].map(p => (
              <Link key={p} href={`/programs?p=${p}`} className="footer-link">Online {p}</Link>
            ))}
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color:'var(--amber-bright)' }}>Resources</h4>
            {[
              { label:'Is My Degree Valid for Govt Jobs?', href:'/guides' },
              { label:'Online vs Distance Education',      href:'/guides' },
              { label:'Compare Universities',              href:'/compare' },
              { label:'UGC DEB What It Means',            href:'/guides' },
              { label:'Is Online MBA Worth It?',           href:'/guides' },
              { label:'Blog',                              href:'/blog' },
            ].map(l => (
              <Link key={l.label} href={l.href} className="footer-link">{l.label}</Link>
            ))}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs" style={{ color:'rgba(255,255,255,0.25)' }}>
            © 2026 Edify (edifyedu.in) — Independent information portal. Not affiliated with any university.
          </p>
          <p className="text-xs text-center" style={{ color:'rgba(255,255,255,0.25)' }}>
            All data from public UGC/NAAC/NIRF records. Verify fees with university before enrolling.
          </p>
        </div>
      </div>
    </footer>
  )
}
