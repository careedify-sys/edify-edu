// Cloudflare Email Address Obfuscation rewrites every mailto: in the HTML into
// /cdn-cgi/l/email-protection#<hex>, which crawlers read as an internal link
// and the Semrush audit of 27 Oct 2026 flagged on every page (the footer
// carries one). Cloudflare skips anything between these two HTML comments, so
// the address ships as a plain mailto: whether obfuscation is on or off.
// React cannot emit a comment directly; the empty display:contents spans carry
// them without adding a box, so flex and gap layouts are unaffected.
const marker = (comment: string) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: `<!--${comment}-->` }} />
)

export default function EmailOff({ children }: { children: React.ReactNode }) {
  return (
    <>
      {marker('email_off')}
      {children}
      {marker('email_on')}
    </>
  )
}
