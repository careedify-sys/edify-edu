import './leads.css';
import type { Metadata } from 'next';
import PrivateAreaGuard from './PrivateAreaGuard';

export const metadata: Metadata = {
  title: 'Leads CRM · edifyedu.in',
  robots: { index: false, follow: false },
};

// Auth is handled by middleware.ts (PROTECTED_PATHS includes /leads).
// This layout sets up the scoped stylesheet and keeps third-party tags out.
// data-clarity-mask tells Clarity to mask everything inside, should it ever run here.

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="leads-scope" data-clarity-mask="true">
      <PrivateAreaGuard />
      {children}
    </div>
  );
}
