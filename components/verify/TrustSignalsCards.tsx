type Props = {
  universityCount: number;
};

export function TrustSignalsCards({ universityCount }: Props) {
  const stats = [
    { value: `${universityCount}`, label: 'UNIVERSITIES TRACKED' },
    { value: '5', label: 'OFFICIAL SOURCES' },
    { value: '45 days', label: 'REFRESH CYCLE' },
    { value: 'ZERO', label: 'COMMERCIAL TIES' },
  ];

  return (
    <>
      <style>{`
        .trust-grid-v2 { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 768px) { .trust-grid-v2 { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 420px) { .trust-grid-v2 { grid-template-columns: 1fr !important; } }
      `}</style>
      <div className="trust-grid-v2" style={{
        display: 'grid',
        gap: 12,
        marginBottom: 24,
      }}>
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border, #DDE4F0)',
              borderRadius: 14,
              padding: '22px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 600,
              lineHeight: 1.1,
              color: 'var(--ink, #0B1D35)',
              letterSpacing: '-0.5px',
              marginBottom: 6,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: 10,
              color: 'var(--ink-3, #607B96)',
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
