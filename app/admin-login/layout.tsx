import type { Metadata } from 'next'

// /admin-login is login UI, not content. It inherited the root layout's
// "index, follow" and served 200, so it was indexable (audit T1, 2026-11-16).
// page.tsx is a client component and cannot export metadata, hence this layout.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
