type GtagEvent = {
  form_view: { form_component: string }
  form_start: { form_component: string }
  form_submit: { form_component: string }
  form_error: { form_component: string }
  whatsapp_click: {
    page_path: string
    university?: string
    source: 'sticky' | 'form_fallback' | 'sidebar'
  }
  calculator_bridge_click: { target_path: string }
}

export function trackEvent<K extends keyof GtagEvent>(
  event: K,
  params: GtagEvent[K],
) {
  if (typeof window === 'undefined') return
  const gtag = (window as any).gtag
  if (typeof gtag !== 'function') return
  gtag('event', event, params)
}
