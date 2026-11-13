import {
  UGC_DEB_CHECKED,
  UGC_DEB_OFFICE,
  UGC_DEB_SENIOR,
  UGC_DEB_SOURCE_URL,
  UGC_DEB_STATE_OFFICERS,
  ugcDebOfficerForState,
  type UgcDebOfficer,
} from '@/lib/ugc-deb-contacts'

interface Props {
  /** When set, the officer for this state is shown first and marked. */
  state?: string | null
  universityName?: string
}

const NAVY = '#0f172a'
const ORANGE = '#f97316'
const SLATE = '#64748b'
const BG = '#f1f5f9'

function OfficerCard({ o, highlight }: { o: UgcDebOfficer; highlight?: string }) {
  return (
    <div style={{
      border: `1px solid ${highlight ? ORANGE : '#e2e8f0'}`,
      background: highlight ? '#fff7ed' : '#ffffff',
      borderRadius: 12, padding: '14px 16px', minWidth: 0,
    }}>
      {highlight && (
        <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, letterSpacing: '0.04em', marginBottom: 6 }}>
          {highlight}
        </div>
      )}
      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{o.name}</div>
      <div style={{ fontSize: 12, color: SLATE, marginBottom: 8 }}>{o.designation}, UGC-DEB</div>
      <div style={{ fontSize: 13, lineHeight: 1.7, overflowWrap: 'anywhere' }}>
        <a href={`mailto:${o.email}`} style={{ color: NAVY, fontWeight: 600 }}>{o.email}</a>
        <br />
        {o.phones.map((p, i) => (
          <span key={p}>
            {i > 0 && ' / '}
            <a href={`tel:${p.replace(/-/g, '')}`} style={{ color: NAVY }}>{p}</a>
          </span>
        ))}
      </div>
      {o.states.length > 0 && (
        <div style={{ fontSize: 12, color: SLATE, marginTop: 8, lineHeight: 1.55 }}>
          <strong style={{ color: NAVY }}>Handles:</strong> {o.states.join(', ')}
        </div>
      )}
    </div>
  )
}

export function UgcDebContacts({ state, universityName }: Props) {
  const match = ugcDebOfficerForState(state)
  const others = UGC_DEB_STATE_OFFICERS.filter(o => o !== match)

  return (
    <section
      id="contact-ugc-deb"
      style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px 22px' }}
    >
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>
        Contact UGC-DEB directly
      </h2>
      <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.65, margin: '0 0 6px' }}>
        The UGC Distance Education Bureau approves every online and distance programme in India.
        Write to the officer who handles {universityName ? `${universityName}'s state` : "your university's state"} to
        confirm a programme&apos;s approval, or to report a university that advertises a programme it is not approved for.
      </p>
      <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: '0 0 16px' }}>
        Include the university name, the programme, your admission session and screenshots of any advertisement.
        edifyedu.in is not part of UGC. We list these details so you can reach the regulator without going through anyone.
      </p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {match && <OfficerCard o={match} highlight={`HANDLES ${state!.toUpperCase()}`} />}
        {others.map(o => <OfficerCard key={o.email} o={o} />)}
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: '20px 0 10px' }}>
        Senior officers, for an unresolved complaint
      </h3>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {UGC_DEB_SENIOR.map(o => <OfficerCard key={o.email} o={o} />)}
      </div>

      <div style={{ background: BG, borderRadius: 10, padding: '12px 14px', marginTop: 16, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
        <strong style={{ color: NAVY }}>DEB office:</strong> {UGC_DEB_OFFICE.address}.{' '}
        Phone <a href={`tel:${UGC_DEB_OFFICE.phone.replace(/-/g, '')}`} style={{ color: NAVY }}>{UGC_DEB_OFFICE.phone}</a>.
      </div>

      <p style={{ fontSize: 12, color: SLATE, margin: '12px 0 0', lineHeight: 1.55 }}>
        Source:{' '}
        <a href={UGC_DEB_SOURCE_URL} target="_blank" rel="noopener" style={{ color: SLATE }}>deb.ugc.ac.in officers page</a>,
        checked {UGC_DEB_CHECKED}. UGC reassigns officers from time to time, so confirm the name there before you write.
      </p>
    </section>
  )
}
