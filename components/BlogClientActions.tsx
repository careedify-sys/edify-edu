'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Copy,
  Check,
} from 'lucide-react'

interface FAQ {
  q: string
  a: string
}

interface Props {
  faqs: FAQ[]
  postTitle: string
  postUrl: string
}

// WhatsApp icon as inline SVG (lucide-react doesn't include it)
function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.08 12.08 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function TwitterXIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export default function BlogClientActions({ faqs, postTitle, postUrl }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(postTitle + ' ' + postUrl)}`
  const liShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
  const twShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`

  return (
    <div className="space-y-8">

      {/* ── FAQ Section ─────────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-navy mb-5 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-amber inline-block shrink-0" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-border rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-start px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors group"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-semibold text-navy text-sm leading-snug pr-4 group-hover:text-amber transition-colors">
                    {faq.q}
                  </span>
                  <span
                    className="shrink-0 w-6 h-6 rounded-full border border-border flex items-center justify-center text-slate-400 transition-all duration-300"
                    aria-hidden="true"
                  >
                    {openFaq === i ? (
                      <span className="text-base leading-none font-bold text-amber">−</span>
                    ) : (
                      <span className="text-base leading-none font-bold">+</span>
                    )}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === i ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-5 pb-4 pt-1 text-sm text-slate-600 leading-relaxed border-t border-border">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Feedback + Share ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">

        {/* Was this helpful? */}
        <div className="mb-6 pb-6 border-b border-border">
          <p className="text-sm font-bold text-navy mb-3">Was this article helpful?</p>
          {feedback === null ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFeedback('up')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-slate-600 text-sm font-semibold hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all"
              >
                <ThumbsUp size={15} />
                Yes, helpful
              </button>
              <button
                onClick={() => setFeedback('down')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-slate-600 text-sm font-semibold hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <ThumbsDown size={15} />
                Needs improvement
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              {feedback === 'up' ? (
                <>
                  <ThumbsUp size={15} className="text-green-500" />
                  <span>Thank you for the feedback! Glad it helped.</span>
                </>
              ) : (
                <>
                  <ThumbsDown size={15} className="text-amber" style={{ color: '#D4922A' }} />
                  <span>Thanks for letting us know. We will keep improving!</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Share buttons */}
        <div>
          <p className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
            <Share2 size={14} className="text-amber" style={{ color: '#D4922A' }} />
            Share this article
          </p>
          <div className="flex flex-wrap gap-2">
            {/* WhatsApp */}
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 no-underline"
              style={{ background: '#25D366' }}
            >
              <WhatsAppIcon />
              WhatsApp
            </a>

            {/* LinkedIn */}
            <a
              href={liShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 no-underline"
              style={{ background: '#0A66C2' }}
            >
              <LinkedInIcon />
              LinkedIn
            </a>

            {/* Twitter / X */}
            <a
              href={twShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 no-underline"
              style={{ background: '#000000' }}
            >
              <TwitterXIcon />
              Twitter / X
            </a>

            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-border text-slate-600 hover:border-amber hover:text-amber transition-all"
              style={copied ? { borderColor: '#22c55e', color: '#22c55e' } : {}}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Legacy named export kept for backward compatibility (no longer used)
export function ShareButton() {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 text-xs font-bold text-amber hover:opacity-80 transition-opacity"
    >
      <Share2 size={14} />
      {copied ? 'Link Copied!' : 'Share Article'}
    </button>
  )
}
