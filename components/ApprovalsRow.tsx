import type { University } from '@/lib/data'
import { ExternalLink } from 'lucide-react'

interface ApprovalDef {
  key: string
  label: string
  sub: string
  href: string
  color: string
  bg: string
}

const APPROVAL_DEFS: ApprovalDef[] = [
  { key: 'UGC DEB', label: 'UGC DEB', sub: 'Govt Approved', href: 'https://deb.ugc.ac.in', color: '#1B4FBE', bg: '#EFF6FF' },
  { key: 'NAAC', label: 'NAAC', sub: 'Accredited', href: 'https://naac.gov.in', color: '#C5870A', bg: '#FFFBEB' },
  { key: 'NIRF', label: 'NIRF', sub: 'India Rankings', href: 'https://nirfindia.org', color: '#16A34A', bg: '#F0FDF4' },
  { key: 'AICTE', label: 'AICTE', sub: 'Tech Council', href: 'https://aicte-india.org', color: '#7C3AED', bg: '#F5F3FF' },
  { key: 'WES', label: 'WES Recognised', sub: 'Global Validity', href: 'https://wes.org', color: '#DC2626', bg: '#FEF2F2' },
  { key: 'QS', label: 'QS Ranked', sub: 'World Rankings', href: 'https://topuniversities.com', color: '#0891B2', bg: '#F0F9FF' },
]

interface Props {
  u: University
}

export default function ApprovalsRow({ u }: Props) {
  const approvals = u.approvals || []
  const active = APPROVAL_DEFS.filter(d => {
    if (d.key === 'NAAC') return true
    if (d.key === 'NIRF') return u.nirf > 0 && u.nirf < 999
    return approvals.some(a => a.toUpperCase().includes(d.key.toUpperCase()))
  })

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Approvals & Recognitions</h2>
      <div className="flex flex-wrap gap-2">
        {/* Always show NAAC */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border"
          style={{ background: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E' }}
        >
          <span>NAAC</span>
          <span className="font-black">{u.naac}</span>
        </div>

        {/* NIRF if ranked */}
        {u.nirf > 0 && u.nirf < 999 && (
          <a
            href="https://nirfindia.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border no-underline"
            style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#14532D' }}
          >
            {(u as any).nirfMgt && (u as any).nirfMgt > 0 && (u as any).nirfMgt < 200 ? `NIRF #${(u as any).nirfMgt} Management` : `NIRF #${u.nirf} University`}
            <ExternalLink size={10} className="opacity-50" />
          </a>
        )}

        {/* Other approvals */}
        {active
          .filter(d => d.key !== 'NAAC' && d.key !== 'NIRF')
          .map(d => (
            <a
              key={d.key}
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border no-underline"
              style={{ background: d.bg, borderColor: `${d.color}30`, color: d.color }}
            >
              {d.label}
              <ExternalLink size={10} className="opacity-50" />
            </a>
          ))}

        {u.psuEligible && (
          <span className="flex items-center px-3 py-2 rounded-lg text-xs font-bold border bg-blue-50 border-blue-200 text-blue-700">
            PSU Eligible
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-400 mt-2.5">
        Source: UGC DEB, NAAC, NIRF India Rankings. Verified by Edify research team.
      </p>
    </section>
  )
}
