'use client';

import { useState } from 'react';
import { brand } from '@/lib/brand';
import { HelpdeskModal } from './HelpdeskModal';

type Props = {
  prefilledUniversity?: string;
  spotsRemaining?: number;
  variant?: 'full' | 'sidebar';
};

export function HelpdeskTeaser({ prefilledUniversity, spotsRemaining = 73, variant = 'full' }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  if (variant === 'sidebar') {
    return (
      <>
        <div style={{
          padding: '22px 22px',
          background: brand.cream,
        }}>
          <div style={{
            fontSize: 11,
            color: brand.goldMid,
            fontWeight: 500,
            letterSpacing: '0.4px',
            marginBottom: 10,
          }}>
            FREE HELPDESK
          </div>
          <h3 style={{
            fontSize: 17,
            fontWeight: 500,
            color: brand.textPrimary,
            margin: '0 0 8px',
            lineHeight: 1.3,
          }}>
            {prefilledUniversity ? `Got a question about ${prefilledUniversity}?` : 'Got a specific question?'}
          </h3>
          <p style={{
            fontSize: 13,
            color: brand.textBody,
            lineHeight: 1.55,
            margin: '0 0 16px',
          }}>
            Get a research-backed answer on WhatsApp within 24-48 hours. Free for the first 100 students this month.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              width: '100%',
              padding: '11px 16px',
              fontSize: 13,
              fontWeight: 500,
              color: brand.cream,
              background: brand.navy,
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            Ask your question →
          </button>
          <div style={{
            fontSize: 11,
            color: brand.textMuted,
            marginTop: 10,
            textAlign: 'center',
          }}>
            {spotsRemaining} of 100 free spots remaining
          </div>
        </div>
        {modalOpen && (
          <HelpdeskModal
            onClose={() => setModalOpen(false)}
            prefilledUniversity={prefilledUniversity}
            spotsRemaining={spotsRemaining}
          />
        )}
      </>
    );
  }

  // Full variant for /verify index
  const examples = [
    'Can I apply without an entrance exam?',
    'Is this degree valid for SBI / Bank PO jobs?',
    'How does X compare with Y for placements?',
    'What is the actual fee with hidden costs?',
    'Can I switch specialisation midway?',
  ];

  return (
    <>
      <div style={{
        background: 'var(--navy, #0B1D35)',
        borderRadius: 16,
        padding: '36px 36px 32px',
        marginBottom: 24,
        color: '#FFFFFF',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 11px',
          background: 'rgba(212, 168, 67, 0.15)',
          color: brand.gold,
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.4px',
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 11 }}>✓</span>
          FREE FOR FIRST 100 STUDENTS THIS MONTH
        </div>

        <h2 style={{
          fontSize: 30,
          fontWeight: 500,
          margin: '0 0 14px',
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
          color: brand.cream,
        }}>
          Got a specific question?
        </h2>

        <p style={{
          fontSize: 15,
          color: 'rgba(255, 250, 241, 0.8)',
          lineHeight: 1.6,
          margin: '0 0 24px',
          maxWidth: 600,
        }}>
          Verification answers &quot;Is this university real?&quot; But students always have follow-up questions:
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 8,
          marginBottom: 28,
        }}>
          {examples.map((q, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}>
              <span style={{
                color: brand.gold,
                fontSize: 13,
                flexShrink: 0,
                marginTop: 1,
              }}>✓</span>
              <span style={{
                fontSize: 13,
                color: 'rgba(255, 250, 241, 0.92)',
                lineHeight: 1.5,
              }}>
                {q}
              </span>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 14,
          color: 'rgba(255, 250, 241, 0.75)',
          margin: '0 0 24px',
        }}>
          Get a research-backed answer on WhatsApp within 24-48 hours.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              padding: '13px 24px',
              fontSize: 14,
              fontWeight: 500,
              color: brand.navy,
              background: brand.gold,
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            Ask your question →
          </button>
          <span style={{
            fontSize: 12,
            color: 'rgba(255, 250, 241, 0.65)',
          }}>
            {spotsRemaining} of 100 free spots remaining
          </span>
        </div>
      </div>

      {modalOpen && (
        <HelpdeskModal
          onClose={() => setModalOpen(false)}
          prefilledUniversity={prefilledUniversity}
          spotsRemaining={spotsRemaining}
        />
      )}
    </>
  );
}
