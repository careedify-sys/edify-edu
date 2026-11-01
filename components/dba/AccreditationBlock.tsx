import type { PublicDbaProgramme } from '@/data/dba-programmes'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AccreditationBlock({ programme }: { programme: PublicDbaProgramme }) {
  const list = programme.providerStatedAccreditations
  const hasChea = list.includes('CHEA')
  const verified = programme.accreditationsVerified && programme.accreditationsVerifiedOn

  return (
    <section className="my-8">
      <h2 className="text-xl font-bold mb-2" style={{ color: '#0f172a' }}>
        Accreditations and memberships as stated by the provider
      </h2>
      <p className="text-sm mb-4" style={{ color: '#64748b' }}>
        {verified
          ? `Verified by edifyedu.in on ${formatDate(programme.accreditationsVerifiedOn!)}`
          : 'edifyedu.in has not yet independently verified these with each accrediting body. Talk to our counsellor before relying on any of them.'}
      </p>
      <ul className="flex flex-wrap gap-2">
        {list.map(a => (
          <li
            key={a}
            className="text-sm font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0' }}
          >
            {a}
          </li>
        ))}
      </ul>
      {hasChea && (
        <p className="text-sm mt-3" style={{ color: '#64748b' }}>
          CHEA recognises accrediting organisations; it does not accredit institutions directly.
        </p>
      )}
    </section>
  )
}
