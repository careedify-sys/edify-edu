// Server component wrappers for lib/fee-plans.ts. The HTML is built from
// lib/data.ts only (no user input), so rendering it as HTML is safe and keeps
// one formatter for blog bodies, hubs and university pages.
import type { University, Program } from '@/lib/data'
import { feePlanTableHtml, peerFeeTableHtml, manipalTrioHtml, symbiosisDistanceAnswerHtml, nmimsNoDistanceHtml } from '@/lib/fee-plans'

function Html({ html, className }: { html: string; className?: string }) {
  if (!html) return null
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

export function FeePlanTable({ u, program = 'MBA', spec, title }: { u: University; program?: Program | string; spec?: string; title?: string }) {
  return <Html html={feePlanTableHtml(u, program, { spec, title })} className="fee-plan-wrap" />
}

export function FeePeerTable({ uniId }: { uniId: string }) {
  return <Html html={peerFeeTableHtml(uniId)} />
}

export function ManipalTrioTable() {
  return <Html html={manipalTrioHtml()} />
}

export function SymbiosisDistanceAnswer() {
  return <Html html={symbiosisDistanceAnswerHtml()} />
}

export function NmimsNoDistance() {
  return <Html html={nmimsNoDistanceHtml()} />
}
