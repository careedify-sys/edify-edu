import Link from 'next/link'
import { ArrowRight, RefreshCw } from 'lucide-react'

interface Props {
  program: string
  universityId: string
}

export default function LastUpdatedStamp({ program, universityId }: Props) {
  const now = new Date()
  const month = now.toLocaleString('en-IN', { month: 'long' })
  const year = now.getFullYear()

  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-slate-500">
      <div className="flex items-center gap-2 flex-1">
        <RefreshCw size={14} className="text-slate-400 shrink-0" />
        <span>
          Page data last verified: <strong className="text-slate-700">{month} {year}</strong>.
          Fees and intake dates may change — confirm at the official university portal before applying.
        </span>
      </div>
      <Link
        href="/contact"
        className="shrink-0 inline-flex items-center gap-1 text-amber font-bold hover:underline no-underline whitespace-nowrap"
        style={{ color: '#F4A024' }}
      >
        Get free counselling <ArrowRight size={13} />
      </Link>
    </div>
  )
}
