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
};

// Map Supabase slugs (full official names) to data.ts slugs (shorter site slugs)
const SLUG_MAP: Record<string, string> = {
  'manipal-academy-of-higher-education-online': 'manipal-academy-higher-education-online',
  'amrita-vishwa-vidyapeetham-university-online': 'amrita-vishwa-vidyapeetham-online',
  'bharati-vidyapeeth-online': 'bharati-vidyapeeth-university-online',
  'bs-abdur-rahman-institute-of-science-and-technology-online': 'bs-abdur-rahman-university-online',
  'central-university-of-himachal-pradesh-online': 'central-university-himachal-pradesh-online',
  'centurion-university-of-technology-and-management-online': 'centurion-university-online',
  'charotar-university-of-science-technology-online': 'charusat-university-online',
  'chatrapati-shahuji-maharaj-university-online': 'chhatrapati-shahu-ji-maharaj-university-online',
  'christ-deemed-to-be-university-online': 'christ-university-online',
  'datta-meghe-institute-of-higher-education-and-research-online': 'datta-meghe-university-online',
  'dayanand-sagar-university-online': 'dayananda-sagar-university-online',
  'dr-dy-patil-vidyapeeth-pune-online': 'dr-dy-patil-vidyapeeth-online',
  'dr-mgr-educational-and-research-institute-online': 'dr-mgr-educational-research-institute-online',
  'dy-patil-navi-mumbai-online': 'dy-patil-university-online',
  'graphic-era-online': 'graphic-era-university-online',
  'guru-gobind-singh-indraprastha-vishwavidyalaya-online': 'guru-gobind-singh-indraprastha-university-online',
  'guru-jambheshwar-university-of-science-and-technology-online': 'guru-jambheshwar-university-online',
  'hindustan-institute-of-technology-and-science-hits-online': 'hindustan-institute-technology-online',
  'icfai-foundation-for-higher-education-online': 'icfai-university-online',
  'indian-institute-of-foreign-trade-online': 'iift-online',
  'jain-deemed-to-be-university-online': 'jain-university-online',
  'jamia-millia-islamia-university-online': 'jamia-millia-islamia-online',
  'jaypee-institute-of-information-technology-online': 'jaypee-university-online',
  'jss-academy-of-education-and-research-online': 'jss-university-online',
  'kalasalingam-academy-of-research-and-higher-education-online': 'kalasalingam-university-online',
  'kalinga-institute-of-industrial-technology-online': 'kalinga-institute-industrial-technology-online',
  'karunya-institute-of-technology-and-sciences-online': 'karunya-university-online',
  'koneru-lakshmaiah-education-foundation-online': 'kl-university-online',
  'maharishi-markandeshwar-online': 'maharishi-markandeshwar-university-online',
  'manav-rachna-international-institute-of-research-studies-online': 'manav-rachna-online',
  'manipal-university-online': 'manipal-university-jaipur-online',
  'meenakshi-academy-of-higher-education-and-research-online': 'meenakshi-academy-higher-education-online',
  'mody-university-of-science-and-technology-online': 'mody-university-online',
  'narsee-monjee-institute-of-management-studies-nmims-online': 'nmims-online',
  'sathyabama-institute-of-science-and-technology-online': 'sathyabama-university-online',
  'shanmugha-arts-science-technology-research-academy-online': 'sastra-university-online',
  'shiv-nadar-institution-of-eminence-online': 'shiv-nadar-university-online',
  'shobhit-institute-of-engineering-technology-online': 'shobhit-university-online',
  'shoolini-university-of-biotechnology-and-management-sciences-online': 'shoolini-university-online',
  'sri-ramachandra-institute-of-higher-education-and-research-online': 'sri-ramachandra-university-online',
  'srm-institute-of-sciences-and-technology-online': 'srm-institute-science-technology-online',
  'swami-vivekanand-subharti-university-online': 'subharti-university-online',
  'symbiosis-international-online': 'symbiosis-university-online',
  'the-northcap-university-online': 'northcap-university-online',
  'university-of-petroleum-and-energy-studies-online': 'upes-online',
  'vellore-institute-of-technology-online': 'vit-university-online',
  'vels-institute-of-science-technology-advanced-studies-vistas-online': 'vels-university-online',
  'vignans-foundation-for-science-technology-and-research-online': 'vignan-university-online',
  'visvesvaraya-technological-university-online': 'vtu-online',
  'yenepoya-online': 'yenepoya-university-online',
  'amity-university-rajasthan-online': 'amity-university-online',
  'birla-institute-of-technology-online': 'bits-pilani-online',
  'international-institute-of-information-technology-online': 'iiit-bangalore-online',
};

function getSiteSlug(supabaseSlug: string): string {
  return SLUG_MAP[supabaseSlug] || supabaseSlug;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
}

export function VerifyHero({ university, accreditations = [] }: Props) {
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

      {/* University name */}
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
        {university.name}
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
          ? 'This university is approved to offer online degrees in India.'
          : 'This university is not currently approved to offer online degrees.'}
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
      <Link
        href={`/universities/${getSiteSlug(university.slug)}`}
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
      </Link>
    </div>
  );
}
