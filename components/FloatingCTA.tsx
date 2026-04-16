'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import EnquiryModal from './EnquiryModalDynamic'

export default function FloatingCTA() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="floating-cta hidden lg:flex fixed right-6 bottom-6 z-[60] items-center gap-2 pl-4 pr-5 py-3.5 rounded-full shadow-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
        style={{ background:'linear-gradient(135deg,var(--amber),var(--amber-bright))', color:'var(--navy)', boxShadow: 'var(--shadow-amber)' }}
        aria-label="Speak with an Advisor"
      >
        <MessageCircle className="w-5 h-5 flex-shrink-0" />
        <span className="hidden sm:inline">Speak with an Advisor</span>
      </button>
      <EnquiryModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
