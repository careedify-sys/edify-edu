// WhatsApp buttons rendered on every page open wa.me on click instead of
// carrying an href. As <a href> they were one outbound link per page, and site
// audit crawlers hit wa.me ~3,000 times per crawl, got rate-limited, and
// reported every one as a 429 broken link (Oct 2026). Links that only render
// after a form step are never crawled and can stay as anchors.
export function openWhatsApp(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
