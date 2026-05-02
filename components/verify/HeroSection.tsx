'use client';

import { VerifySearch } from './VerifySearch';

type Uni = {
  slug: string; name: string; short_name: string | null;
  city: string | null; state: string | null;
  is_ioe: boolean; programme_count: number;
  brand_slug?: string | null; aliases?: string[] | null;
  university_type?: string | null;
};

type Props = {
  universities: Uni[];
  totalCount: number;
};

export function HeroSection({ universities, totalCount }: Props) {
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <>
      <style>{`
        .vfy-hero { padding: 60px 0 52px; position: relative; overflow: hidden; }
        .vfy-hero-inner { max-width: 680px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 2; }
        .vfy-hero h1 { font-size: clamp(1.8rem, 4.5vw, 2.8rem); }
        .vfy-search-wrap { max-width: 560px; margin: 0 auto; }
        @media (max-width: 640px) {
          .vfy-hero { padding: 40px 0 36px; }
        }
      `}</style>
      <section className="vfy-hero" style={{
        background: 'var(--bg, #F6F8FB)',
        textAlign: 'center',
        marginBottom: 24,
      }}>
        {/* Background decorative elements */}
        {/* Top-right warm glow */}
        <div style={{
          position: 'absolute', top: -100, right: -60, width: 380, height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,129,26,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Bottom-left sage glow */}
        <div style={{
          position: 'absolute', bottom: -80, left: -40, width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(31,107,82,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Center-top soft highlight behind heading */}
        <div style={{
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(11,29,53,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(11,29,53,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }} />

        <div className="vfy-hero-inner">
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 14px',
            background: 'var(--sage-light, #E4F5EF)',
            color: 'var(--sage, #1F6B52)',
            borderRadius: 'var(--r-pill, 999px)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage-bright, #3AA17F)' }} />
            INDEPENDENT · {totalCount} UNIVERSITIES · UPDATED {today.toUpperCase()}
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 800,
            lineHeight: 1.12,
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
            color: 'var(--navy, #0B1D35)',
          }}>
            Is your online degree<br />
            <span style={{ color: 'var(--amber, #C8811A)' }}>actually valid?</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 16,
            color: 'var(--ink-2, #344A62)',
            lineHeight: 1.7,
            margin: '0 auto 36px',
            maxWidth: 520,
          }}>
            Independent verification against UGC-DEB, AICTE, NAAC, NIRF, and AACSB official sources. No paid rankings. No referral commissions.
          </p>

          {/* Search */}
          <div className="vfy-search-wrap" style={{
            background: 'var(--surface, #FFFFFF)',
            borderRadius: 'var(--r-md, 16px)',
            padding: '20px 22px 16px',
            border: '1px solid var(--border, #DDE4F0)',
            boxShadow: '0 4px 24px rgba(11, 29, 53, 0.06)',
          }}>
            <VerifySearch universities={universities} compact />
          </div>
        </div>
      </section>
    </>
  );
}
