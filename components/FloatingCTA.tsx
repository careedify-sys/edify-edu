'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import EnquiryModal from './EnquiryModal'

export default function FloatingCTA() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="floating-cta fixed right-5 bottom-[80px] sm:bottom-6 md:bottom-8 z-[100] flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full shadow-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
        style={{ background:'linear-gradient(135deg,var(--amber),var(--amber-bright))', color:'var(--navy)', boxShadow: 'var(--shadow-amber)' }}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Speak with an Advisor</span>
        <span className="sm:hidden">Enquire</span>
      </button>
      <EnquiryModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
