// One way to submit a lead. Every form POSTs to /api/enquiry through this, so
// the Meta Pixel 'Lead' and GA4 'generate_lead' events fire from every form,
// exactly once per successful submission. Before this only the DBA form sent
// the Meta event, and five forms each sent their own GA4 event.
//
// Returns the fetch Response unchanged (and throws on a network error, like
// fetch), so each form keeps its own success and error handling.
//
// Never put name, phone or email in event parameters.

type EnquiryBody = Record<string, unknown>
type EventParams = Record<string, string | undefined>

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 100) : undefined)

export async function submitEnquiry(body: EnquiryBody, eventParams: EventParams = {}): Promise<Response> {
  const res = await fetch('/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (res.ok) fireLeadEvents(body, eventParams)
  return res
}

function fireLeadEvents(body: EnquiryBody, extra: EventParams) {
  if (typeof window === 'undefined') return
  const program = str(body.program)
  const source = str(body.source) || 'enquiry'
  const params: Record<string, string> = {}
  for (const [k, v] of Object.entries({ program, source, ...extra })) {
    if (v) params[k] = v
  }
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
  try {
    if (typeof w.gtag === 'function') w.gtag('event', 'generate_lead', params)
  } catch { /* analytics must never break a form */ }
  try {
    if (typeof w.fbq === 'function') {
      w.fbq('track', 'Lead', { content_name: params.program || 'Not specified', content_category: params.source })
    }
  } catch { /* analytics must never break a form */ }
}
