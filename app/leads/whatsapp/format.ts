// Display helpers, usable from server and client components.
export const inr = (n: number | null | undefined, digits = 2) =>
  n == null || !Number.isFinite(n) ? 'not set' : '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
export const fmt = (n: number | null | undefined) => (n == null ? '0' : n.toLocaleString('en-IN'))
export const when = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : ''
export const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 1000) / 10}%` : 'n/a')
