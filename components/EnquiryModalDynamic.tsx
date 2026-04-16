'use client'
// Lazy-loaded wrapper — EnquiryModal only downloads when first opened.
// Import this instead of EnquiryModal directly in any component that is
// rendered on every page (FloatingCTA, LeadCapture, EdifyTrust, homepage).
import dynamic from 'next/dynamic'

const EnquiryModal = dynamic(() => import('./EnquiryModal'), { ssr: false })

export default EnquiryModal
