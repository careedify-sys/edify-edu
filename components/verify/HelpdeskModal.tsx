'use client';

import { useState } from 'react';
import { brand } from '@/lib/brand';

type Props = {
  onClose: () => void;
  prefilledUniversity?: string;
  spotsRemaining: number;
};

export function HelpdeskModal({ onClose, prefilledUniversity, spotsRemaining }: Props) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState(prefilledUniversity || '');
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim() || !question.trim()) {
      setError('Please fill the required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/helpdesk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, whatsapp, email, university, question }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or message us on WhatsApp directly: +91 70612 85806');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
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
          maxWidth: 480,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px 28px 24px',
          border: `1px solid ${brand.creamBorder}`,
        }}
      >
        {!submitted ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{
                  fontSize: 11,
                  color: brand.goldMid,
                  fontWeight: 500,
                  letterSpacing: '0.4px',
                  marginBottom: 6,
                }}>
                  ASK A QUESTION
                </div>
                <h3 style={{
                  fontSize: 22,
                  fontWeight: 500,
                  margin: 0,
                  color: brand.textPrimary,
                  letterSpacing: '-0.3px',
                }}>
                  Get a research-backed answer
                </h3>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  color: brand.textMuted,
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p style={{
              fontSize: 13,
              color: brand.textBody,
              lineHeight: 1.55,
              margin: '0 0 20px',
            }}>
              We respond on WhatsApp within 24-48 hours.
            </p>

            <form onSubmit={handleSubmit}>
              <FormField label="Your name *">
                <Input value={name} onChange={setName} placeholder="Rohit Kumar" />
              </FormField>

              <FormField label="WhatsApp number *">
                <Input value={whatsapp} onChange={setWhatsapp} placeholder="+91 9876543210" />
              </FormField>

              <FormField label="Email (optional)">
                <Input value={email} onChange={setEmail} placeholder="rohit@example.com" type="email" />
              </FormField>

              <FormField label="Which university? (optional)">
                <Input value={university} onChange={setUniversity} placeholder="Manipal Online MBA" />
              </FormField>

              <FormField label="Your question *">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Can I apply to MUJ Online MBA without a CAT score? I have 5 years of work experience."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: 13,
                    border: `1.5px solid ${brand.creamBorder}`,
                    borderRadius: 10,
                    background: brand.white,
                    color: brand.textPrimary,
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    lineHeight: 1.5,
                  }}
                />
              </FormField>

              {error && (
                <div style={{
                  padding: '10px 12px',
                  background: '#FEE2E2',
                  color: '#B91C1C',
                  borderRadius: 8,
                  fontSize: 12,
                  marginBottom: 14,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: brand.cream,
                  background: brand.navy,
                  border: 'none',
                  borderRadius: 10,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  marginTop: 4,
                }}
              >
                {submitting ? 'Submitting...' : 'Submit my question →'}
              </button>

              <p style={{
                fontSize: 11,
                color: brand.textMuted,
                textAlign: 'center',
                margin: '14px 0 0',
              }}>
                Free for the first 100 students. {spotsRemaining} spots remaining this month.
              </p>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 8px' }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: brand.successBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: brand.successAccent,
              fontSize: 22,
              fontWeight: 500,
            }}>✓</div>
            <h3 style={{
              fontSize: 22,
              fontWeight: 500,
              margin: '0 0 10px',
              color: brand.textPrimary,
            }}>
              Question received
            </h3>
            <p style={{
              fontSize: 14,
              color: brand.textBody,
              lineHeight: 1.6,
              margin: '0 0 22px',
            }}>
              We will reply on WhatsApp within 24-48 hours. Keep an eye on the number you provided.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: 500,
                color: brand.textPrimary,
                background: brand.cream,
                border: `1px solid ${brand.creamBorder}`,
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block',
        fontSize: 11,
        color: brand.textBody,
        fontWeight: 500,
        marginBottom: 6,
        letterSpacing: '0.2px',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '10px 12px',
        fontSize: 13,
        border: `1.5px solid ${brand.creamBorder}`,
        borderRadius: 10,
        background: brand.white,
        color: brand.textPrimary,
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  );
}
