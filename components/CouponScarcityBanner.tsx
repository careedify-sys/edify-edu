import { Sparkles, Clock } from 'lucide-react'
import { getTodaysBonus, TIER_AMOUNTS, type Tier } from '@/lib/coupons'

interface CouponScarcityBannerProps {
  tier: Tier
  /** Stretch the banner across its container (used on the /coupons hub). */
  fullWidth?: boolean
}

function istDay(now: Date): number {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' })
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return map[fmt.format(now)] ?? 0
}

function dayLabel(day: number): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
}

function buildMessage(day: number, tier: Tier): string {
  const t = TIER_AMOUNTS[tier]
  const base = `Rs ${t.base.toLocaleString('en-IN')}`
  const max = `Rs ${t.max.toLocaleString('en-IN')}`

  switch (day) {
    case 0: // Sun
      return `Max bonus opens Tuesday. Today's enrollment bonus is ${base}. Lock now or wait 2 days for ${max}.`
    case 1: // Mon
      return `Max bonus opens tomorrow (Tuesday). Today's enrollment bonus is ${base}. Wait 24 hours for ${max} on Tuesday.`
    case 2: // Tue (max window)
      return `Max bonus active today. Enrollment bonus is ${max} until midnight IST. Next max window opens Saturday.`
    case 3: // Wed
      return `Next max bonus opens Saturday. Today's enrollment bonus is ${base}. Lock now or wait 3 days for ${max}.`
    case 4: // Thu
      return `Next max bonus opens Saturday. Today's enrollment bonus is ${base}. Wait 2 days for ${max} on Saturday.`
    case 5: // Fri
      return `Max bonus opens tomorrow (Saturday). Today's enrollment bonus is ${base}. Wait 24 hours for ${max} on Saturday.`
    case 6: // Sat (max window)
      return `Max bonus active today. Enrollment bonus is ${max} until midnight IST. Next max window opens Tuesday.`
    default:
      return `Today's enrollment bonus is ${base}. Tuesday and Saturday unlock ${max}.`
  }
}

export default function CouponScarcityBanner({ tier, fullWidth = false }: CouponScarcityBannerProps) {
  const now = new Date()
  const day = istDay(now)
  const { isMaxWindow } = getTodaysBonus(tier)
  const message = buildMessage(day, tier)

  const wrapperClass = fullWidth
    ? 'w-full rounded-2xl border-2 px-5 py-4 sm:px-6 sm:py-5'
    : 'inline-flex max-w-full rounded-xl border-2 px-4 py-3'

  const colorClass = isMaxWindow
    ? 'border-green-400 bg-green-50'
    : 'border-amber-300 bg-amber-50'

  const accentClass = isMaxWindow ? 'text-green-700' : 'text-amber-700'

  return (
    <div className={`${wrapperClass} ${colorClass}`}>
      <div className="flex items-start gap-3">
        <span className={`shrink-0 mt-0.5 ${accentClass}`}>
          {isMaxWindow ? <Sparkles className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${accentClass}`}>
            {isMaxWindow ? `${dayLabel(day)}: max bonus live` : `${dayLabel(day)} pricing`}
          </div>
          <p className={`text-sm leading-relaxed ${isMaxWindow ? 'text-green-800' : 'text-amber-800'}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}
