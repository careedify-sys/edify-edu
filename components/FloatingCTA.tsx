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
        className="floating-cta fixed right-5 z-[100] flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full shadow-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
        style={{ bottom:'24px', background:'linear-gradient(135deg,#F59E0B,#F5C842)', color:'#1A2F4E', boxShadow: '0 4px 24px rgba(245,158,11,0.4)' }}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Get Free Counselling</span>
        <span className="sm:hidden">Enquire</span>
      </button>
      <EnquiryModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
