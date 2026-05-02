'use client';

import { useEffect, useRef, useState } from 'react';

export function HowEdifyVerifies() {
  const steps = [
    {
      num: '01',
      title: 'Pull from 5 official portals',
      desc: 'UGC-DEB, AICTE, NAAC, NIRF, AACSB. No third-party listings. Only government and accreditation body data.',
      sources: ['UGC-DEB', 'AICTE', 'NAAC', 'NIRF', 'AACSB'],
      accent: 'var(--sage, #1F6B52)',
      accentLight: 'var(--sage-light, #E4F5EF)',
    },
    {
      num: '02',
      title: 'Cross-check programme by programme',
      desc: 'Every online programme matched to its approving entity. We show you exactly which university issues each degree.',
      sources: ['796 programmes', '123 entities'],
      accent: 'var(--amber-text, #A0650F)',
      accentLight: 'var(--amber-light, #FEF3DC)',
    },
    {
      num: '03',
      title: 'Refresh every 45 days',
      desc: 'Verification data reviewed against official portals every 45 days. Last refresh date shown on every page.',
      sources: ['Auto-refresh', 'Date stamped'],
      accent: 'var(--navy-light, #1C3252)',
      accentLight: 'var(--surface-2, #F0F3F8)',
    },
    {
      num: '04',
      title: 'Explain regulatory nuance',
      desc: 'Deemed universities need AICTE for online MBA/MCA. State Private do not. We explain which rule applies.',
      sources: ['UGC rules', 'AICTE norms'],
      accent: 'var(--sage-mid, #2E7D64)',
      accentLight: 'var(--sage-light, #E4F5EF)',
    },
  ];

  return (
    <>
      <style>{`
        @keyframes methodFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .method-card-v2 {
          opacity: 0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .method-card-v2.visible {
          animation: methodFadeUp 0.45s ease forwards;
        }
        .method-card-v2:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(11, 29, 53, 0.08);
        }
        .method-grid-v2 { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 700px) {
          .method-grid-v2 { grid-template-columns: 1fr !important; }
          .method-header-v2 { flex-direction: column !important; align-items: flex-start !important; }
          .method-header-v2 p { text-align: left !important; }
          .method-section-v2 { padding: 28px 20px 32px !important; }
        }
      `}</style>
      <div className="method-section-v2" style={{
        background: '#FFFFFF',
        border: '1px solid var(--border, #DDE4F0)',
        borderRadius: 16,
        padding: '36px 36px 40px',
        marginBottom: 24,
      }}>
        {/* Header */}
        <div className="method-header-v2" style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 28,
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              background: 'var(--surface-2, #F0F3F8)',
              border: '1px solid var(--border-light, #EDF1F8)',
              borderRadius: 999,
              fontSize: 10,
              color: 'var(--ink-3, #607B96)',
              fontWeight: 600,
              letterSpacing: '0.5px',
              marginBottom: 12,
            }}>
              METHODOLOGY
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 600,
              color: 'var(--ink, #0B1D35)',
              margin: 0,
              letterSpacing: '-0.4px',
              lineHeight: 1.15,
            }}>
              How edifyedu.in verifies
            </h2>
          </div>
          <p style={{
            fontSize: 13,
            color: 'var(--ink-3, #607B96)',
            margin: 0,
            maxWidth: 300,
            lineHeight: 1.5,
            textAlign: 'right',
          }}>
            Every data point traced to its official government or accreditation source.
          </p>
        </div>

        {/* Cards */}
        <div className="method-grid-v2" style={{
          display: 'grid',
          gap: 14,
        }}>
          {steps.map((step, i) => (
            <MethodCard key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}

function MethodCard({ step, index }: { step: any; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`method-card-v2 ${visible ? 'visible' : ''}`}
      style={{
        background: 'var(--surface-2, #F0F3F8)',
        border: '1px solid var(--border-light, #EDF1F8)',
        borderRadius: 14,
        padding: '24px 22px 20px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* Accent top line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 3,
        background: step.accent,
      }} />

      {/* Number badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: step.accentLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: step.accent,
        }}>
          {step.num}
        </div>
      </div>

      <h3 style={{
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--ink, #0B1D35)',
        margin: '0 0 8px',
        lineHeight: 1.3,
      }}>
        {step.title}
      </h3>
      <p style={{
        fontSize: 13,
        color: 'var(--ink-2, #344A62)',
        lineHeight: 1.6,
        margin: '0 0 14px',
      }}>
        {step.desc}
      </p>

      {/* Source chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {step.sources.map((s: string) => (
          <span key={s} style={{
            padding: '3px 8px',
            fontSize: 10,
            fontWeight: 600,
            color: step.accent,
            background: step.accentLight,
            borderRadius: 6,
            letterSpacing: '0.2px',
          }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
