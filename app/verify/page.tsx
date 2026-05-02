import { VerifySearch } from '@/components/verify/VerifySearch';
import { HeroSection } from '@/components/verify/HeroSection';
import { TrustSignalsCards } from '@/components/verify/TrustSignalsCards';
import { HowEdifyVerifies } from '@/components/verify/HowEdifyVerifies';
import { HelpdeskTeaser } from '@/components/verify/HelpdeskTeaser';
import { LoginPlaceholder } from '@/components/verify/LoginPlaceholder';

export const metadata = {
  title: 'Verify University Approvals: UGC-DEB, NAAC, NIRF, AICTE Status Check | edifyedu.in',
  description: 'Cross-check any online university approval and accreditation status from 5 official sources. UGC-DEB, NAAC grade, NIRF rank, AICTE and AACSB verified for 122+ universities. Free, no login needed. Only on edifyedu.in.',
  keywords: [
    'verify university ugc deb approval',
    'check naac grade university',
    'nirf ranking verification',
    'is online degree valid india',
    'ugc deb approved universities list 2026',
    'check university accreditation india',
    'online university verification tool',
    'aicte approval check',
  ],
  openGraph: {
    title: 'Verify University Approvals: UGC-DEB, NAAC, NIRF Check | edifyedu.in',
    description: 'The only platform where you can cross-check any online university approval from 5 official sources. Free. No login. 122+ universities tracked.',
    type: 'website',
    url: 'https://edifyedu.in/verify',
  },
  alternates: {
    canonical: 'https://edifyedu.in/verify',
  },
};

export const dynamic = 'force-dynamic';

export default async function VerifyHomePage() {
  let list: any[] = [];

  // Try Supabase first, fallback to local data if it fails
  try {
    const { createSupabaseServerClient } = await import('@/lib/supabase/server');
    const supabase = await createSupabaseServerClient();
    const { data: universities } = await supabase
      .from('universities')
      .select('slug, name, short_name, city, state, is_ioe, programme_count, brand_slug, aliases, university_type')
      .eq('ugc_deb_status', 'approved')
      .order('name');
    list = universities ?? [];
  } catch {
    // Supabase unavailable — fallback to local university data
    const { UNIVERSITIES } = await import('@/lib/data');
    list = UNIVERSITIES.map(u => ({
      slug: u.id,
      name: u.name,
      short_name: u.abbr || null,
      city: null,
      state: null,
      is_ioe: false,
      programme_count: u.programs?.length || 0,
      brand_slug: null,
      aliases: null,
      university_type: null,
    }));
  }

  const seenBrands = new Set<string>();
  let dedupedCount = 0;
  for (const uni of list) {
    if (uni.brand_slug) {
      if (seenBrands.has(uni.brand_slug)) continue;
      seenBrands.add(uni.brand_slug);
    }
    dedupedCount++;
  }

  const verifyPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'edifyedu.in University Verification Tool',
    url: 'https://edifyedu.in/verify',
    applicationCategory: 'EducationalApplication',
    description: 'Free tool to cross-check any online university approval and accreditation status from 5 official Indian government sources.',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    provider: {
      '@type': 'Organization',
      name: 'edifyedu.in',
      url: 'https://edifyedu.in',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does the edifyedu.in Verify tool check?',
        acceptedAnswer: { '@type': 'Answer', text: 'It cross-checks a university against 5 official sources: UGC-DEB approval status, NAAC accreditation grade, NIRF ranking (Overall, University, and Management categories), AICTE approval for technical programs, and AACSB accreditation for business schools. All data is pulled from ugc.ac.in, naac.gov.in, nirfindia.org, and aicte-india.org.' },
      },
      {
        '@type': 'Question',
        name: 'Why should I verify a university before enrolling?',
        acceptedAnswer: { '@type': 'Answer', text: 'Many platforms display outdated accreditation data or make misleading claims about rankings. A university could have lost its NAAC grade or UGC-DEB approval since the last time you checked. Enrolling without verification means your degree might not be valid for government jobs, corporate hiring, or higher education. edifyedu.in checks every 45 days so you always see current status.' },
      },
      {
        '@type': 'Question',
        name: 'Is the edifyedu.in Verify tool free to use?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Completely free. No login, no signup, no hidden paywall. You can verify any of the 122+ tracked universities as many times as you want.' },
      },
      {
        '@type': 'Question',
        name: 'How often is verification data updated?',
        acceptedAnswer: { '@type': 'Answer', text: 'Every 45 days. Each university page shows the last verified date. When NIRF releases new rankings or NAAC updates a grade, we update within one refresh cycle.' },
      },
    ],
  };

  return (
    <main style={{ background: 'var(--bg, #F6F8FB)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(verifyPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Login */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <LoginPlaceholder />
        </div>
      </div>

      {/* Hero */}
      <HeroSection universities={list} totalCount={dedupedCount} />

      {/* Content sections */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 60px' }}>
        <TrustSignalsCards universityCount={dedupedCount} />

        {/* ── WHY WE BUILT THIS ── */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border, #DDE4F0)',
          borderRadius: 16,
          padding: '40px 36px',
          marginBottom: 24,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)', borderRadius: 999,
            fontSize: 10, color: '#dc2626', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 16,
          }}>
            THE PROBLEM
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800, color: 'var(--navy, #0B1D35)', lineHeight: 1.2,
            margin: '0 0 16px', letterSpacing: '-0.02em',
          }}>
            Students pay lakhs for degrees that turn out to be invalid.
          </h2>
          <div style={{ maxWidth: 720 }}>
            <p style={{ fontSize: 15, color: 'var(--ink-2, #344A62)', lineHeight: 1.8, margin: '0 0 16px' }}>
              Every year, thousands of students enrol in online programs without checking whether the university actually holds UGC-DEB approval. Some universities lose their NAAC grade mid-session. Others claim NIRF ranks from years ago that no longer apply.
            </p>
            <p style={{ fontSize: 15, color: 'var(--ink-2, #344A62)', lineHeight: 1.8, margin: '0 0 16px' }}>
              The result? A degree that employers question, that government recruitment boards reject, and that costs two to four lakhs you cannot get back.
            </p>
            <p style={{ fontSize: 15, color: 'var(--ink-2, #344A62)', lineHeight: 1.8, margin: '0 0 24px' }}>
              No other platform in India lets you cross-check a university's live approval status from official sources in one place. That is why we built this tool.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {[
              {
                icon: '🏛️',
                title: 'Outdated accreditation claims',
                body: 'A university website might still display "NAAC A+" even after the grade expired. Our tool checks naac.gov.in directly and shows you the current grade with its validity period.',
              },
              {
                icon: '📊',
                title: 'Misleading rank claims',
                body: 'Some portals show NIRF 2019 ranks as if they are current. edifyedu.in pulls the latest NIRF 2025 data and separates Overall, University, and Management categories so you can compare accurately.',
              },
              {
                icon: '⚠️',
                title: 'Missing regulatory checks',
                body: 'Deemed universities need separate AICTE approval for online MBA and MCA programs. State private universities do not. Most students do not know which rule applies to their university. We flag it clearly.',
              },
            ].map(item => (
              <div key={item.title} style={{
                background: 'var(--surface-2, #F8FAFC)', border: '1px solid var(--border, #DDE4F0)',
                borderRadius: 14, padding: '22px 20px',
              }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy, #0B1D35)', marginBottom: 8 }}>{item.title}</div>
                <p style={{ fontSize: 13, color: 'var(--ink-2, #344A62)', lineHeight: 1.65, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHAT GETS VERIFIED ── */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border, #DDE4F0)',
          borderRadius: 16,
          padding: '40px 36px',
          marginBottom: 24,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.15)', borderRadius: 999,
            fontSize: 10, color: '#059669', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 16,
          }}>
            WHAT GETS CHECKED
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800, color: 'var(--navy, #0B1D35)', lineHeight: 1.2,
            margin: '0 0 12px', letterSpacing: '-0.02em',
          }}>
            Five official sources. One page. Every university.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.75, margin: '0 0 28px', maxWidth: 640 }}>
            Each verification report pulls data from the same portals that government recruitment boards use. If a university passes all five checks, your degree is solid for jobs, higher studies, and career growth.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              {
                source: 'UGC-DEB',
                portal: 'ugc.ac.in',
                color: '#1F6B52',
                bg: '#E4F5EF',
                what: 'Confirms the university is legally allowed to offer online degree programs in India.',
                why: 'Without DEB approval, your degree is not valid for government jobs or higher education.',
              },
              {
                source: 'NAAC',
                portal: 'naac.gov.in',
                color: '#B8892A',
                bg: '#FEF3DC',
                what: 'Shows the current accreditation grade (A++, A+, A, B++, B+, B) and validity dates.',
                why: 'NAAC grade reflects teaching quality. Employers and loan providers check this before decisions.',
              },
              {
                source: 'NIRF',
                portal: 'nirfindia.org',
                color: '#0B1D35',
                bg: '#F0F3F8',
                what: 'Displays the latest 2025 rank in Overall, University, and Management categories separately.',
                why: 'NIRF is the only government-backed ranking. A university may rank differently in each category.',
              },
              {
                source: 'AICTE',
                portal: 'aicte-india.org',
                color: '#7c3aed',
                bg: '#f3f0ff',
                what: 'Checks if deemed universities have the separate AICTE approval needed for online MBA and MCA.',
                why: 'State private universities are exempt, but deemed universities must have AICTE clearance for technical programs.',
              },
              {
                source: 'AACSB',
                portal: 'aacsb.edu',
                color: '#0369a1',
                bg: '#e0f2fe',
                what: 'Confirms international business school accreditation, held by fewer than 6% of business schools worldwide.',
                why: 'AACSB signals global recognition. Relevant if you plan to work abroad or pursue international MBA programs.',
              },
            ].map(item => (
              <div key={item.source} style={{
                background: item.bg, border: `1px solid ${item.color}20`,
                borderRadius: 14, padding: '20px 18px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: item.color }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: item.color, letterSpacing: '0.04em', marginBottom: 6 }}>{item.source}</div>
                <div style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 12 }}>{item.portal}</div>
                <p style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6, margin: '0 0 10px', fontWeight: 600 }}>{item.what}</p>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.55, margin: 0 }}>{item.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW TO USE ── */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border, #DDE4F0)',
          borderRadius: 16,
          padding: '40px 36px',
          marginBottom: 24,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', background: 'rgba(212,146,42,0.1)',
            border: '1px solid rgba(212,146,42,0.2)', borderRadius: 999,
            fontSize: 10, color: 'var(--amber-text, #A0650F)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 16,
          }}>
            HOW TO USE
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800, color: 'var(--navy, #0B1D35)', lineHeight: 1.2,
            margin: '0 0 12px', letterSpacing: '-0.02em',
          }}>
            Three steps. Two minutes. Complete clarity.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.75, margin: '0 0 32px', maxWidth: 560 }}>
            No signup. No login. No paywall. Search any university and get a full verification report instantly.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              {
                step: '01',
                title: 'Search for your university',
                body: 'Type the university name in the search bar above. We track 122+ UGC-DEB approved online universities. Results appear as you type.',
                accent: '#1F6B52',
                accentBg: '#E4F5EF',
              },
              {
                step: '02',
                title: 'Read the verification report',
                body: 'Each university page shows its UGC-DEB status, NAAC grade with validity dates, NIRF rank across categories, AICTE clearance, and the last date we verified the data.',
                accent: '#B8892A',
                accentBg: '#FEF3DC',
              },
              {
                step: '03',
                title: 'Make a confident decision',
                body: 'Green checkmarks mean the approval is current and verified. If something looks off, use the free helpdesk below to ask a specific question and get a research-backed answer within 48 hours.',
                accent: '#0B1D35',
                accentBg: '#F0F3F8',
              },
            ].map(item => (
              <div key={item.step} style={{
                background: 'var(--surface-2, #F8FAFC)', border: '1px solid var(--border, #DDE4F0)',
                borderRadius: 14, padding: '24px 22px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: item.accent }} />
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: item.accentBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: item.accent, marginBottom: 14,
                }}>{item.step}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy, #0B1D35)', marginBottom: 8, lineHeight: 1.3 }}>{item.title}</div>
                <p style={{ fontSize: 13, color: 'var(--ink-2, #344A62)', lineHeight: 1.65, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <HowEdifyVerifies />

        <HelpdeskTeaser spotsRemaining={73} />

        {/* University directory */}
        <div style={{
          background: 'var(--surface, #FFFFFF)',
          borderRadius: 'var(--r-md, 16px)',
          padding: '28px 28px 32px',
          border: '1px solid var(--border, #DDE4F0)',
          boxShadow: '0 1px 4px rgba(11,29,53,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 4, height: 18, background: 'var(--amber, #C8811A)', borderRadius: 2 }} />
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 22,
              fontWeight: 700,
              margin: 0,
              color: 'var(--navy, #0B1D35)',
              letterSpacing: '-0.02em',
            }}>
              All verified universities
            </h2>
            <span style={{ fontSize: 12, color: 'var(--ink-3, #607B96)', fontWeight: 600, marginLeft: 'auto' }}>
              {dedupedCount} approved
            </span>
          </div>

          <VerifySearch universities={list} />
        </div>

        {/* ── ONLY ON EDIFY ── */}
        <div style={{
          background: 'var(--navy, #0B1D35)',
          borderRadius: 16,
          padding: '36px',
          marginTop: 24,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', background: 'rgba(16,185,129,0.15)',
            color: '#34d399', borderRadius: 999, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.04em', marginBottom: 16,
          }}>
            ONLY ON EDIFYEDU
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
            fontWeight: 800, color: '#fff', lineHeight: 1.3, margin: '0 0 12px',
          }}>
            No other platform in India offers this.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 8px' }}>
            Other portals rank universities based on who pays them. They never show you the raw approval data.
            edifyedu.in pulls directly from government portals, displays every data point with its source, and refreshes every 45 days. Free. No login. No strings.
          </p>
        </div>
      </div>
    </main>
  );
}
