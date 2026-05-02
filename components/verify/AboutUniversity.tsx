import { brand } from '@/lib/brand';

type Props = {
  description: string | null;
  knownFor: string | null;
  historySummary: string | null;
  universityName: string;
};

export function AboutUniversity({ description, knownFor, historySummary, universityName }: Props) {
  if (!description && !knownFor && !historySummary) return null;

  return (
    <div style={{ padding: '24px 28px', background: brand.white }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 4, height: 16, background: brand.gold, borderRadius: 2 }} />
        <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: brand.textPrimary }}>
          About {universityName}
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {description && (
          <div>
            <div style={{ fontSize: 11, color: brand.goldMid, fontWeight: 500, marginBottom: 6, letterSpacing: '0.3px' }}>
              OVERVIEW
            </div>
            <p style={{ fontSize: 14, color: brand.textBody, lineHeight: 1.65, margin: 0 }}>
              {description}
            </p>
          </div>
        )}
        {knownFor && (
          <div>
            <div style={{ fontSize: 11, color: brand.goldMid, fontWeight: 500, marginBottom: 6, letterSpacing: '0.3px' }}>
              WHAT IT IS KNOWN FOR
            </div>
            <p style={{ fontSize: 14, color: brand.textBody, lineHeight: 1.65, margin: 0 }}>
              {knownFor}
            </p>
          </div>
        )}
        {historySummary && (
          <div>
            <div style={{ fontSize: 11, color: brand.goldMid, fontWeight: 500, marginBottom: 6, letterSpacing: '0.3px' }}>
              FOR ONLINE LEARNERS
            </div>
            <p style={{ fontSize: 14, color: brand.textBody, lineHeight: 1.65, margin: 0 }}>
              {historySummary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
