'use client';
import Link from 'next/link';
import { brand } from '@/lib/brand';

export function VerifyHeader() {
  return (
    <div style={{
      background: brand.navy, padding: '14px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link href="/verify" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <span style={{ fontSize: 22, lineHeight: 1, color: brand.gold, fontWeight: 300 }}>‹</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: brand.cream, letterSpacing: '-0.2px' }}>edifyedu.in</span>
      </Link>
      <div style={{ display: 'flex', gap: 14, color: brand.gold, fontSize: 14 }}>
        <button
          onClick={() => {
            if (navigator.share) navigator.share({ url: window.location.href }).catch(() => {});
            else navigator.clipboard?.writeText(window.location.href);
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: brand.gold, padding: 0 }}
          aria-label="Share"
        >↗</button>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: brand.gold, padding: 0 }}
          aria-label="Save"
        >♡</button>
      </div>
    </div>
  );
}
