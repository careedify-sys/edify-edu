import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface InlineCTAProps {
  text: string
  linkText: string
  href?: string
  variant?: 'primary' | 'compare'
}

export default function InlineCTA({ text, linkText, href = '/contact', variant = 'primary' }: InlineCTAProps) {
  const isPrimary = variant === 'primary'
  return (
    <div className={`rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isPrimary ? 'bg-amber/10 border border-amber/30' : 'bg-slate-50 border border-slate-200'}`}>
      <p className="flex-1 text-sm text-slate-700 font-medium">{text}</p>
      <Link
        href={href}
        className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold no-underline transition-colors ${isPrimary ? 'bg-amber text-navy hover:bg-amber/90' : 'bg-navy text-white hover:bg-navy/90'}`}
        style={isPrimary ? { background: '#F4A024', color: '#0B1533' } : { background: '#0B1533', color: '#fff' }}
      >
        {linkText}
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}
