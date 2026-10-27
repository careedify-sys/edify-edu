import Link from 'next/link';
import { brand } from '@/lib/brand';

type University = {
  name: string;
  short_name: string | null;
  slug: string;
  university_type: string | null;
  state: string | null;
  city: string | null;
  is_ioe: boolean;
  established_year: number | null;
  programme_count: number;
  ugc_deb_status: string;
  data_updated_at: string | null;
};

type Accreditation = {
  body: string;
  category: string | null;
  grade: string | null;
  rank: number | null;
  via_school: string | null;
};

type Props = {
  university: University;
  accreditations?: Accreditation[];
  /** Site overview URL, resolved on the server by getUniversityForVerifySlug.
   *  Replaces a hand-kept SLUG_MAP that sent unmapped slugs to 404s and
   *  mapped Amity Rajasthan onto Amity Online. null hides the link. */
  universityHref?: string | null;
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
}

export function VerifyHero({ university, accreditations = [], universityHref = null }: Props) {
  const isApproved = university.ugc_deb_status === 'approved';
  const lastUpdated = formatDate(university.data_updated_at);

  // Pick best NAAC grade
  const naac = accreditations.find(a => a.body === 'NAAC');
  // Pick best NIRF rank — prefer Overall, then University
  const nirfOverall = accreditations.find(a => a.body === 'NIRF' && a.category === 'Overall' && !a.via_school);
  const nirfUniversity = accreditations.find(a => a.body === 'NIRF' && a.category === 'University' && !a.via_school);
  const bestNirf = nirfOverall || nirfUniversity;

  // Build stats inline
  const stats: { label: string; value: string }[] = [];
  if (university.established_year) {
    stats.push({ label: 'Founded', value: `${university.established_year}` });
  }
  if (university.university_type) {
    stats.push({ label: 'Type', value: university.university_type });
  }
  if (university.programme_count > 0) {
    stats.push({ label: 'Online programmes', value: `${university.programme_count}` });
  }
  if (naac && naac.grade) {
    stats.push({ label: 'NAAC', value: naac.grade });
  }
  if (bestNirf && bestNirf.rank) {
    const cat = bestNirf.category === 'Overall' ? 'NIRF Overall' : 'NIRF University';
    stats.push({ label: cat, value: `#${bestNirf.rank}` });
  }
  if (university.is_ioe) {
    stats.push({ label: 'Status', value: 'Institution of Eminence' });
  }

  return (
    <div style={{ padding: '28px 32px 24px' }}>
      {/* Status pill with verdict + updated info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 11px',
            borderRadius: 999,
            background: isApproved ? brand.successBg : '#FEE2E2',
            color: isApproved ? brand.successAccent : '#B91C1C',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.4px',
          }}
        >
          <span style={{ fontSize: 11 }}>{isApproved ? '✓' : '✕'}</span>
          {isApproved ? 'UGC-DEB APPROVED' : 'NOT UGC-DEB APPROVED'}
        </span>
        {lastUpdated && (
          <span style={{ fontSize: 11, color: brand.textMuted }}>
            Updated {lastUpdated} · Refreshed every 7 days
          </span>
        )}
      </div>

      {/* Keyword-rich H1 mirrors the meta title for ranking signal */}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 500,
          lineHeight: 1.18,
          letterSpacing: '-0.4px',
          color: brand.textPrimary,
          margin: '0 0 10px',
        }}
      >
        Is {university.name} UGC-DEB Approved? Verification {new Date().getFullYear()}
      </h1>

      {/* Verdict sentence */}
      <p
        style={{
          fontSize: 15,
          color: brand.textBody,
          lineHeight: 1.55,
          margin: '0 0 22px',
          maxWidth: 640,
        }}
      >
        {isApproved
          ? `Yes, ${university.name} is approved to offer online degrees in India under UGC-DEB regulations.`
          : `${university.name} is not currently approved to offer online degrees under UGC-DEB.`}
      </p>

      {/* Inline stats row */}
      {stats.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0,
            marginBottom: 18,
            border: `1px solid ${brand.creamBorder}`,
            borderRadius: 10,
            background: brand.cream,
            overflow: 'hidden',
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                padding: '10px 14px',
                flex: '1 1 auto',
                minWidth: 140,
                borderRight: i < stats.length - 1 ? `1px solid ${brand.creamBorder}` : 'none',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: brand.goldMid,
                  fontWeight: 500,
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: brand.textPrimary,
                  lineHeight: 1.3,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtle profile link — no giant button */}
      {universityHref && <Link
        href={universityHref}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 13,
          color: brand.goldDeep,
          textDecoration: 'none',
          fontWeight: 500,
          padding: '6px 0',
        }}
      >
        View full university profile →
      </Link>}
    </div>
  );
}
