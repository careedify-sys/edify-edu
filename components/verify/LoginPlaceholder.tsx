'use client';

import { useState } from 'react';
import { brand } from '@/lib/brand';

export function LoginPlaceholder() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          fontSize: 13,
          fontWeight: 500,
          color: brand.textPrimary,
          background: brand.white,
          border: `1px solid ${brand.creamBorder}`,
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = brand.cream;
          e.currentTarget.style.borderColor = brand.gold;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = brand.white;
          e.currentTarget.style.borderColor = brand.creamBorder;
        }}
      >
        Log in
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 17, 23, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: brand.white,
              borderRadius: 16,
              maxWidth: 420,
              width: '100%',
              padding: '32px 28px',
              border: `1px solid ${brand.creamBorder}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 4, height: 16, background: brand.gold, borderRadius: 2 }} />
              <span style={{ fontSize: 11, color: brand.goldMid, fontWeight: 500, letterSpacing: '0.4px' }}>
                COMING SOON
              </span>
            </div>
            <h3 style={{
              fontSize: 22,
              fontWeight: 500,
              lineHeight: 1.25,
              color: brand.textPrimary,
              margin: '0 0 12px',
              letterSpacing: '-0.3px',
            }}>
              Sign in to track your shortlist
            </h3>
            <p style={{
              fontSize: 14,
              color: brand.textBody,
              lineHeight: 1.6,
              margin: '0 0 20px',
            }}>
              Login arrives in the next release. Sign in with Google to access:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                'Save verifications across multiple universities',
                'Compare up to 3 universities side-by-side',
                'Request Pro Reports with placement data, alumni reviews, hidden fees',
                'Get notified when verification data updates',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: brand.successBg,
                    color: brand.successAccent,
                    fontSize: 9,
                    fontWeight: 500,
                    flexShrink: 0,
                    marginTop: 2,
                  }}>✓</span>
                  <span style={{ fontSize: 13, color: brand.textBody, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: '100%',
                padding: '11px 16px',
                fontSize: 13,
                fontWeight: 500,
                color: brand.textPrimary,
                background: brand.cream,
                border: `1px solid ${brand.creamBorder}`,
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
