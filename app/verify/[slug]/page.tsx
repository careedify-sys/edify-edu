import { notFound, redirect } from 'next/navigation';
import { brand } from '@/lib/brand';
import { VerifyHero } from '@/components/verify/VerifyHero';
import { ProReportCTAPlaceholder } from '@/components/verify/ProReportCTAPlaceholder';
import { ProgrammeFinder } from '@/components/verify/ProgrammeFinder';
import { ApprovalsCard } from '@/components/verify/ApprovalsCard';
import { NIRFStrip } from '@/components/verify/NIRFStrip';
import { DataFreshnessBadge } from '@/components/verify/DataFreshnessBadge';
import { TrackPageView } from '@/components/verify/TrackPageView';
import { AboutUniversity } from '@/components/verify/AboutUniversity';
import { HelpdeskTeaser } from '@/components/verify/HelpdeskTeaser';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = 'force-dynamic';

// Map brand-merged slugs to brand_slug values
const BRAND_SLUGS: Record<string, string> = {
  'amity-online': 'amity',
};

async function getSupabase() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await getSupabase();
  if (!supabase) return { title: `Verify ${slug} — edifyedu.in` };

  const brandSlug = BRAND_SLUGS[slug];

  if (brandSlug) {
    return {
      title: `Is Amity online MBA / MCA UGC-DEB approved? · Edify`,
      description: `Independent verification of Amity online programmes. Different programmes are approved through Amity University Uttar Pradesh (Noida) and Amity University Rajasthan (Jaipur) — see exactly which entity issues each degree.`,
      openGraph: {
        title: `Amity online programmes — UGC-DEB verification`,
        description: 'See which Amity entity (Noida or Jaipur) approves each online programme.',
        type: 'article',
      },
    };
  }

  const { data: uni } = await supabase
    .from('universities')
    .select('name, city, state')
    .eq('slug', slug)
    .single();

  if (!uni) return { title: 'University not found · Edify' };

  const location = [uni.city, uni.state].filter(Boolean).join(', ');
  return {
    title: `Is ${uni.name} UGC-DEB approved? · Edify`,
    description: `Verify ${uni.name}${location ? ' (' + location + ')' : ''} — UGC-DEB approval, AICTE, NAAC grade, NIRF rank — all from official sources.`,
    openGraph: {
      title: `Is ${uni.name} UGC-DEB approved?`,
      description: `Independent verification of ${uni.name} from UGC, AICTE, NAAC and NIRF official sources.`,
      type: 'article',
    },
  };
}

export default async function VerifyPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await getSupabase();
  if (!supabase) redirect('/verify');

  // Check if this is a brand-merged page
  const brandSlug = BRAND_SLUGS[slug];

  if (brandSlug) {
    // Fetch all universities sharing this brand
    const { data: brandUnis } = await supabase
      .from('universities')
      .select('*')
      .eq('brand_slug', brandSlug)
      .order('name');

    if (!brandUnis || brandUnis.length === 0) notFound();

    // Fetch all programmes + accreditations for all entities
    const uniIds = brandUnis.map(u => u.id);
    const [progRes, accRes] = await Promise.all([
      supabase.from('programmes').select('*, university_id').in('university_id', uniIds).order('name'),
      supabase.from('accreditations').select('*, university_id').in('university_id', uniIds),
    ]);

    return <BrandMergedPage
      slug={slug}
      brandSlug={brandSlug}
      universities={brandUnis}
      programmes={progRes.data || []}
      accreditations={accRes.data || []}
    />;
  }

  // Standard single-university page
  const { data: university } = await supabase
    .from('universities')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!university) notFound();

  const [progRes, accRes] = await Promise.all([
    supabase.from('programmes').select('*').eq('university_id', university.id).order('name'),
    supabase.from('accreditations').select('*').eq('university_id', university.id),
  ]);

  const programmes = progRes.data || [];
  const accreditations = accRes.data || [];

  return (
    <main style={{ background: brand.cream, minHeight: '100vh' }}>
      <TrackPageView universityId={university.id} universitySlug={slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": university.name,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": university.city,
              "addressRegion": university.state,
              "addressCountry": "IN",
            },
            "foundingDate": university.established_year ? `${university.established_year}-01-01` : undefined,
          }),
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px' }}>
        <div className="verify-grid" style={{
          display: 'grid', gap: 24, gridTemplateColumns: '1fr',
        }}>
          <style>{`
            @media (min-width: 900px) {
              .verify-grid {
                grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) !important;
                align-items: start;
              }
              .verify-sidebar {
                position: sticky;
                top: 24px;
              }
            }
          `}</style>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: `1px solid ${brand.creamBorder}` }}>
              <VerifyHero university={university} accreditations={accreditations} />
            </div>
            {(university.description || university.known_for || university.history_summary) && (
              <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: `1px solid ${brand.creamBorder}` }}>
                <AboutUniversity
                  universityName={university.name}
                  description={university.description}
                  knownFor={university.known_for}
                  historySummary={university.history_summary}
                />
              </div>
            )}
            {programmes.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: `1px solid ${brand.creamBorder}`, padding: '22px 0 6px' }}>
                <ProgrammeFinder universitySlug={slug} programmes={programmes} />
              </div>
            )}
            <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: `1px solid ${brand.creamBorder}` }}>
              <ApprovalsCard
                accreditations={accreditations}
                ugcStatus={university.ugc_deb_status}
                ugcValidTill={university.ugc_deb_valid_till}
              />
            </div>
            <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: `1px solid ${brand.creamBorder}` }}>
              <DataFreshnessBadge updatedAt={university.data_updated_at} />
            </div>
          </div>

          <aside className="verify-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: `1px solid ${brand.creamBorder}` }}>
              <HelpdeskTeaser variant="sidebar" prefilledUniversity={university.name} spotsRemaining={73} />
            </div>
            <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: `1px solid ${brand.creamBorder}` }}>
              <NIRFStrip accreditations={accreditations} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// Brand-merged page (e.g., /verify/amity-online combining Amity Noida + Jaipur)
// Uses the SAME 2-column layout as single-uni pages
function BrandMergedPage({ slug, brandSlug, universities, programmes, accreditations }: any) {
  const brandName = brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);
  const primaryUni = universities[0];

  // Merge all accreditations for the NIRF strip sidebar
  const allAccreditations = accreditations;

  return (
    <main style={{ background: brand.cream, minHeight: '100vh' }}>
      <TrackPageView universityId={primaryUni.id} universitySlug={slug} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px' }}>
        <div className="verify-grid" style={{
          display: 'grid', gap: 24, gridTemplateColumns: '1fr',
        }}>
          <style>{`
            @media (min-width: 900px) {
              .verify-grid {
                grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) !important;
                align-items: start;
              }
              .verify-sidebar {
                position: sticky;
                top: 24px;
              }
            }
          `}</style>

          {/* MAIN COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Hero */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: `1px solid ${brand.creamBorder}` }}>
              <VerifyHero university={{...primaryUni, name: `${brandName} University`, programme_count: programmes.length}} accreditations={allAccreditations} />
            </div>

            {/* About */}
            {(primaryUni.description || primaryUni.known_for || primaryUni.history_summary) && (
              <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: `1px solid ${brand.creamBorder}` }}>
                <AboutUniversity
                  universityName={brandName}
                  description={primaryUni.description}
                  knownFor={primaryUni.known_for}
                  historySummary={primaryUni.history_summary}
                />
              </div>
            )}

            {/* Approving entities */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '22px 28px', border: `1px solid ${brand.creamBorder}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 4, height: 16, background: brand.gold, borderRadius: 2 }} />
                <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: brand.textPrimary }}>Approving entities</h2>
              </div>
              <p style={{ fontSize: 13, color: brand.textBody, lineHeight: 1.5, margin: '0 0 12px' }}>
                {brandName} offers online programmes through {universities.length} legally distinct UGC-DEB approved universities.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {universities.map((uni: any) => (
                  <div key={uni.id} style={{ background: brand.cream, border: `1px solid ${brand.creamBorder}`, borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: brand.textPrimary }}>{uni.name}</div>
                    <div style={{ fontSize: 11, color: brand.textMuted, marginTop: 2 }}>
                      {uni.state} · {uni.university_type} · {programmes.filter((p: any) => p.university_id === uni.id).length} programmes
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Approvals per entity */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '22px 28px', border: `1px solid ${brand.creamBorder}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 4, height: 16, background: brand.gold, borderRadius: 2 }} />
                <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: brand.textPrimary }}>Approvals & accreditations</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {universities.map((uni: any) => {
                  const uniAccreds = accreditations.filter((a: any) => a.university_id === uni.id);
                  return (
                    <div key={uni.id}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: brand.goldMid, marginBottom: 8, letterSpacing: '0.3px' }}>
                        {uni.name.toUpperCase()}
                      </div>
                      <ApprovalsCardInline accreditations={uniAccreds} ugcStatus={uni.ugc_deb_status} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* All programmes */}
            {programmes.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '22px 28px', border: `1px solid ${brand.creamBorder}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 4, height: 16, background: brand.gold, borderRadius: 2 }} />
                  <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: brand.textPrimary }}>All approved programmes</h2>
                  <span style={{ fontSize: 12, color: brand.goldMid, fontWeight: 500, marginLeft: 'auto' }}>
                    {programmes.length} programmes
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {programmes.map((prog: any) => {
                    const approvingUni = universities.find((u: any) => u.id === prog.university_id);
                    return (
                      <div key={prog.id} style={{
                        background: brand.successBgSoft, border: `1px solid ${brand.successBorder}`,
                        borderRadius: 10, padding: '12px 14px', display: 'flex',
                        alignItems: 'center', gap: 12,
                      }}>
                        <div style={{
                          width: 22, height: 22, background: brand.successAccent, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <span style={{ color: brand.white, fontSize: 11, fontWeight: 500 }}>✓</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: brand.textPrimary }}>{prog.name}</div>
                          <div style={{ fontSize: 11, color: brand.successText, marginTop: 2 }}>
                            Approved by: {approvingUni?.name || 'Unknown entity'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Data freshness */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: `1px solid ${brand.creamBorder}` }}>
              <DataFreshnessBadge updatedAt={primaryUni.data_updated_at} />
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="verify-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: `1px solid ${brand.creamBorder}` }}>
              <HelpdeskTeaser variant="sidebar" prefilledUniversity={brandName} spotsRemaining={73} />
            </div>
            <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: `1px solid ${brand.creamBorder}` }}>
              <NIRFStrip accreditations={allAccreditations} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// Lightweight inline version of ApprovalsCard for nested use on brand pages
function ApprovalsCardInline({ accreditations, ugcStatus }: { accreditations: any[]; ugcStatus: string }) {
  const aicte = accreditations.find(a => a.body === 'AICTE');
  const naac = accreditations.find(a => a.body === 'NAAC');
  const aacsb = accreditations.find(a => a.body === 'AACSB');
  const nba = accreditations.find(a => a.body === 'NBA');
  const nirfRanks = accreditations.filter(a => a.body === 'NIRF' && a.rank);

  // Sort NIRF by category importance
  const NIRF_ORDER = ['Overall', 'University', 'Pharmacy', 'Medical', 'Dental', 'Law', 'Engineering', 'Management', 'Research', 'Architecture', 'Agriculture'];
  const sortedNirf = [...nirfRanks].sort((a, b) => {
    const aIdx = NIRF_ORDER.indexOf(a.category || '');
    const bIdx = NIRF_ORDER.indexOf(b.category || '');
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  // Regulatory tier (UGC, AICTE)
  const regulatory: any[] = [
    { label: 'UGC-DEB', status: ugcStatus === 'approved' ? 'Active' : 'Lapsed', desc: 'Mandatory for online programmes' },
  ];
  if (aicte) regulatory.push({ label: 'AICTE', status: aicte.status === 'active' ? 'Active' : 'Lapsed', desc: 'Online MBA / MCA listed' });

  // Accreditation tier (NAAC, AACSB, NBA)
  const accred: any[] = [];
  if (naac) {
    const desc = [
      naac.cycle ? `Cycle ${naac.cycle}` : null,
      naac.valid_till ? `valid till ${new Date(naac.valid_till).getFullYear()}` : null,
    ].filter(Boolean).join(' · ');
    accred.push({
      label: 'NAAC', grade: naac.grade,
      status: naac.score ? `CGPA ${naac.score}` : 'Accredited',
      desc: desc || 'Accredited by NAAC',
    });
  }
  if (aacsb) accred.push({
    label: 'AACSB',
    status: aacsb.via_school ? `via ${aacsb.via_school.split(',')[0]}` : 'Accredited',
    desc: 'Global B-school accreditation',
  });
  if (nba) accred.push({
    label: 'NBA',
    status: nba.score ? `${Math.round(nba.score)} courses` : 'Accredited',
    desc: nba.notes || 'Programme-level accreditation',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Regulatory + Accreditation grid */}
      {(regulatory.length > 0 || accred.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {regulatory.map((item, i) => (
            <div key={`reg-${i}`} style={{
              background: brand.successBgSoft,
              border: `1px solid ${brand.successBorder}`,
              borderRadius: 10, padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: brand.textPrimary }}>{item.label}</span>
                <span style={{ fontSize: 11, color: brand.successAccent, fontWeight: 500 }}>{item.status}</span>
              </div>
              <div style={{ fontSize: 11, color: brand.textMuted, marginTop: 3 }}>{item.desc}</div>
            </div>
          ))}
          {accred.map((item, i) => (
            <div key={`acc-${i}`} style={{
              background: brand.cream,
              border: `1px solid ${brand.creamBorder}`,
              borderRadius: 10, padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: brand.textPrimary }}>
                  {item.label}{item.grade ? ` · ${item.grade}` : ''}
                </span>
                <span style={{ fontSize: 11, color: brand.goldDeep, fontWeight: 500 }}>{item.status}</span>
              </div>
              <div style={{ fontSize: 11, color: brand.textMuted, marginTop: 3 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* NIRF strip */}
      {sortedNirf.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 11, color: brand.goldMid, fontWeight: 500, marginBottom: 8, letterSpacing: '0.3px' }}>
            NIRF 2025 RANKINGS · {sortedNirf.length} categor{sortedNirf.length > 1 ? 'ies' : 'y'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {sortedNirf.map((rank, i) => {
              const isHighlight = i < 2 && !rank.via_school;
              return (
                <div key={i} style={{
                  background: isHighlight ? brand.navy : (rank.via_school ? brand.creamWarm : brand.cream),
                  border: isHighlight ? 'none' : `1px solid ${brand.creamBorder}`,
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  <div style={{
                    fontSize: 10,
                    color: isHighlight ? brand.gold : (rank.via_school ? brand.goldDeep : brand.textMuted),
                    fontWeight: 500, letterSpacing: '0.3px', marginBottom: 6,
                  }}>
                    {(rank.category || '').toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{
                      fontSize: 24, fontWeight: 500, lineHeight: 1,
                      color: isHighlight ? brand.cream : (rank.via_school ? brand.goldDeep : brand.textPrimary),
                    }}>
                      #{rank.rank}
                    </span>
                    {rank.total_ranked && (
                      <span style={{
                        fontSize: 10,
                        color: isHighlight ? brand.gold : (rank.via_school ? brand.goldDeep : brand.textMuted),
                      }}>
                        /{rank.total_ranked}
                      </span>
                    )}
                  </div>
                  {rank.via_school && (
                    <div style={{ fontSize: 10, color: brand.goldDeep, marginTop: 4 }}>
                      via {rank.via_school.split(' ').slice(0, 3).join(' ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
