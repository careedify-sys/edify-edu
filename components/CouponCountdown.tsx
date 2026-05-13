'use client'

import { useEffect, useState } from 'react'
import { Clock, Sparkles } from 'lucide-react'
import { getTodaysBonus, type Tier } from '@/lib/coupons'

type Variant = 'hero' | 'inline' | 'card'

interface CouponCountdownProps {
  tier: Tier
  variant?: Variant
  /** Override the displayed label (e.g. "Premium bonus unlocks in"). */
  label?: string
}

function formatRemaining(ms: number): { d: number; h: number; m: number; s: number } {
  if (ms < 0) ms = 0
  const totalSeconds = Math.floor(ms / 1000)
  const d = Math.floor(totalSeconds / 86400)
  const h = Math.floor((totalSeconds % 86400) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return { d, h, m, s }
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export default function CouponCountdown({ tier, variant = 'inline', label }: CouponCountdownProps) {
  // Compute the initial snapshot on the server so the first paint already
  // shows the correct amount and next-max timestamp. After hydration, useEffect
  // takes over and ticks every second.
  const initial = getTodaysBonus(tier)
  const [{ amount, isMaxWindow, nextMaxAt }, setSnapshot] = useState(initial)
  const [now, setNow] = useState<number>(() => Date.parse(initial.nextMaxAt) - 0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setNow(Date.now())
    const tick = () => {
      const t = Date.now()
      setNow(t)
      // Re-evaluate the tier window each tick: when the countdown crosses
      // IST midnight on a Tue or Sat the amount flips automatically.
      const snap = getTodaysBonus(tier)
      setSnapshot(prev =>
        prev.amount === snap.amount && prev.nextMaxAt === snap.nextMaxAt && prev.isMaxWindow === snap.isMaxWindow
          ? prev
          : snap
      )
    }
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [tier])

  const targetMs = Date.parse(nextMaxAt)
  // Before hydration, render a stable 0 delta so server HTML and first client
  // HTML match. After hydration, render the live ticking diff.
  const remainingMs = mounted ? targetMs - now : 0
  const { d, h, m, s } = formatRemaining(remainingMs)

  if (variant === 'hero') {
    return (
      <div
        className="inline-flex flex-col items-center gap-3 bg-white/10 backdrop-blur-sm border border-amber-400/40 rounded-2xl px-6 py-4"
        suppressHydrationWarning
      >
        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-widest">
          {isMaxWindow ? <Sparkles className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          <span>
            {label ?? (isMaxWindow ? 'Max bonus active today' : 'Max bonus unlocks in')}
          </span>
        </div>
        <div className="flex items-center gap-3 text-white font-mono text-2xl sm:text-3xl font-extrabold tabular-nums">
          {!isMaxWindow && d > 0 && (
            <>
              <span>{d}d</span>
              <span className="text-amber-400">:</span>
            </>
          )}
          <span>{pad(h)}h</span>
          <span className="text-amber-400">:</span>
          <span>{pad(m)}m</span>
          <span className="text-amber-400">:</span>
          <span>{pad(s)}s</span>
        </div>
        <div className="text-amber-200/90 text-xs">
          Today: <strong className="text-white">Rs {amount.toLocaleString('en-IN')}</strong> enrollment bonus
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div
        className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
        suppressHydrationWarning
      >
        <div className="flex items-center gap-2 text-xs text-amber-800">
          {isMaxWindow ? <Sparkles className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          <span className="font-semibold">
            {label ?? (isMaxWindow ? 'Max active today' : 'Max unlocks in')}
          </span>
        </div>
        <span className="font-mono text-xs font-bold text-amber-800 tabular-nums">
          {!isMaxWindow && d > 0 ? `${d}d ` : ''}
          {pad(h)}:{pad(m)}:{pad(s)}
        </span>
      </div>
    )
  }

  // inline (default)
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700"
      suppressHydrationWarning
    >
      {isMaxWindow ? <Sparkles className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
      <span>
        {label ?? (isMaxWindow ? 'Max active' : 'Max in')}
      </span>
      <span className="font-mono tabular-nums">
        {!isMaxWindow && d > 0 ? `${d}d ` : ''}
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </span>
  )
}
