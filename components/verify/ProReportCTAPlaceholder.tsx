'use client';
import { brand } from '@/lib/brand';
import { track } from '@/lib/tracking';

export function ProReportCTAPlaceholder({ universityName }: { universityName: string }) {
  const shortName = universityName.split(' ')[0];

  function handleClick() {
    track.ctaClick('pro_report_cta_placeholder', { university: universityName });
    alert('Pro Report launches soon. We will notify you on WhatsApp.');
  }

  return (
    <div style={{ padding: '18px 20px 22px', background: brand.white }}>
      <div style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${brand.navy} 0%, ${brand.navyDeep} 100%)`,
        borderRadius: 14, padding: '18px 18px 16px', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 80, height: 80,
          background: 'radial-gradient(circle at top right, rgba(201,146,42,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{
            background: brand.gold, color: brand.navy, fontSize: 9, fontWeight: 500,
            letterSpacing: '0.5px', padding: '3px 8px', borderRadius: 999,
          }}>PRO REPORT</span>
          <span style={{
            background: 'rgba(34,197,94,0.18)', color: '#4ADE80', fontSize: 9,
            fontWeight: 500, letterSpacing: '0.4px', padding: '3px 8px', borderRadius: 999,
          }}>FREE FOR YOUR FIRST UNIVERSITY</span>
        </div>
        <div style={{
          fontSize: 17, fontWeight: 500, color: brand.cream, lineHeight: 1.3,
          margin: '0 0 6px', letterSpacing: '-0.2px',
        }}>
          Get a custom research report on {shortName}
        </div>
        <div style={{ fontSize: 12, color: '#C9C9C9', lineHeight: 1.55, margin: '0 0 14px' }}>
          We dig into placements, alumni reviews, hidden fees, recruiter perception. Delivered on WhatsApp in 24-48 hrs.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {['Real placement % from 2024-25 alumni', 'Honest alumni reviews — no university filter', 'Hidden fees, scholarships, completion rates', 'Speak directly to a current alum (optional)'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#4ADE80', fontSize: 11 }}>✓</span>
              <span style={{ fontSize: 11, color: brand.cream }}>{item}</span>
            </div>
          ))}
        </div>
        <button
          onClick={handleClick}
          style={{
            width: '100%', padding: 12, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', background: brand.orange, color: brand.white,
            border: 'none', borderRadius: 10, marginBottom: 8,
          }}
        >Get my free Pro Report →</button>
        <div style={{ fontSize: 10, color: '#C9C9C9', textAlign: 'center', lineHeight: 1.5 }}>
          2-min form · Free for your first university only
        </div>
      </div>
    </div>
  );
}
