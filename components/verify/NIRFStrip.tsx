import { brand } from '@/lib/brand';

type Accreditation = {
  body: string; category: string | null; rank: number | null;
  total_ranked: number | null; via_school: string | null;
};

const CATEGORY_ORDER = ['Overall', 'University', 'Pharmacy', 'Medical', 'Dental', 'Law', 'Engineering', 'Management', 'Research', 'Architecture', 'Agriculture'];

export function NIRFStrip({ accreditations }: { accreditations: Accreditation[] }) {
  const nirfRanks = accreditations.filter(a => a.body === 'NIRF' && a.rank);
  if (nirfRanks.length === 0) return null;

  const sorted = [...nirfRanks].sort((a, b) => {
    const aIdx = CATEGORY_ORDER.indexOf(a.category || '');
    const bIdx = CATEGORY_ORDER.indexOf(b.category || '');
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  return (
    <div style={{ padding: '22px 0', background: brand.white }}>
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 4, height: 16, background: brand.gold, borderRadius: 2 }} />
          <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: brand.textPrimary, flex: 1 }}>NIRF 2025 rankings</h2>
          <span style={{ fontSize: 11, color: brand.gold, fontWeight: 500 }}>{nirfRanks.length} categor{nirfRanks.length > 1 ? 'ies' : 'y'}</span>
        </div>
        <p style={{ fontSize: 12, color: brand.textBody, lineHeight: 1.5, margin: '0 0 14px', paddingLeft: 12 }}>
          Ranked across {nirfRanks.length} of NIRF&apos;s 17 categories.
        </p>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
        }}>
          {sorted.map((rank, i) => <NIRFCard key={i} rank={rank} isHighlight={i < 2 && !rank.via_school} />)}
        </div>
      </div>

      {sorted.some(r => r.via_school) && (
        <p style={{ fontSize: 11, color: brand.textMuted, padding: '12px 20px 0', lineHeight: 1.5, margin: 0 }}>
          &quot;via&quot; means the rank is for a constituent school. The umbrella deemed university itself isn&apos;t ranked in that category.
        </p>
      )}
    </div>
  );
}

function NIRFCard({ rank, isHighlight }: { rank: Accreditation; isHighlight: boolean }) {
  if (isHighlight) {
    return (
      <div style={{
        background: brand.navy, borderRadius: 12, padding: '14px 16px',
      }}>
        <div style={{ fontSize: 10, color: brand.gold, letterSpacing: '0.4px', marginBottom: 8, fontWeight: 500 }}>
          {(rank.category || '').toUpperCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, color: brand.cream }}>#{rank.rank}</span>
          {rank.total_ranked && <span style={{ fontSize: 10, color: brand.gold }}>/{rank.total_ranked}</span>}
        </div>
        {rank.rank && rank.total_ranked && rank.rank <= rank.total_ranked * 0.1 && (
          <div style={{ fontSize: 11, color: brand.cream, marginTop: 6, opacity: 0.8 }}>Top 10% nationally</div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: rank.via_school ? brand.creamWarm : brand.cream,
      border: `1px solid ${brand.creamBorder}`,
      borderRadius: 12, padding: '14px 16px',
    }}>
      <div style={{
        fontSize: 10, color: rank.via_school ? brand.goldDeep : brand.textMuted,
        letterSpacing: '0.4px', marginBottom: 8, fontWeight: 500,
      }}>
        {(rank.category || '').toUpperCase()}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontSize: 28, fontWeight: 500, lineHeight: 1,
          color: rank.via_school ? brand.goldDeep : brand.textPrimary,
        }}>#{rank.rank}</span>
        {rank.total_ranked && (
          <span style={{ fontSize: 10, color: rank.via_school ? brand.goldDeep : brand.textMuted }}>/{rank.total_ranked}</span>
        )}
      </div>
      {rank.via_school && (
        <div style={{ fontSize: 11, color: brand.goldDeep, marginTop: 6 }}>
          via {rank.via_school.split(' ').slice(0, 3).join(' ')}
        </div>
      )}
    </div>
  );
}
