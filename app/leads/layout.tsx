import './leads.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leads CRM · Edify',
  robots: { index: false, follow: false },
};

// Auth is handled by middleware.ts (PROTECTED_PATHS includes /leads).
// This layout only sets up the scoped stylesheet.

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  return <div className="leads-scope">{children}</div>;
}
