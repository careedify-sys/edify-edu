import { brand } from '@/lib/brand';

export function VerifyTrustSignals() {
  const signals = [
    {
      title: 'Independent',
      desc: 'No commercial relationships with any university. We do not earn from your enrolment decision.',
    },
    {
      title: 'Official sources only',
      desc: 'UGC-DEB, AICTE, NAAC and NIRF official portals. No third-party listings.',
    },
    {
      title: 'Refreshed every 7 days',
      desc: 'Verification data is re-checked weekly. Last refreshed dates shown on every university.',
    },
  ];

  return (
    <div style={{
      background: brand.white,
      border: `1px solid ${brand.creamBorder}`,
      borderRadius: 16,
      padding: '24px 28px',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <div style={{ width: 4, height: 16, background: brand.gold, borderRadius: 2 }} />
        <h2 style={{ fontSize: 15, fontWeight: 500, margin: 0, color: brand.textPrimary }}>
          Why students trust Edify
        </h2>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
      }}>
        {signals.map((s, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: brand.successBg,
                color: brand.successAccent,
                fontSize: 10,
                fontWeight: 500,
                flexShrink: 0,
                marginTop: 2,
              }}>✓</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: brand.textPrimary }}>
                {s.title}
              </span>
            </div>
            <p style={{
              fontSize: 12,
              color: brand.textMuted,
              lineHeight: 1.55,
              margin: 0,
              paddingLeft: 28,
            }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
