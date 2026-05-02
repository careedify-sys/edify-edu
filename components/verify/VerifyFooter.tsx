'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { brand } from '@/lib/brand';

export function VerifyFooter() {
  const pathname = usePathname();
  return (
    <nav style={{
      height: 60, background: brand.white,
      borderTop: `1px solid ${brand.creamBorder}`,
      display: 'flex', justifyContent: 'space-around',
      alignItems: 'flex-start', paddingTop: 8,
    }}>
      <NavTab href="/verify" label="Verify" active={pathname?.startsWith('/verify')} />
      <NavTab href="/compare" label="Compare" active={pathname?.startsWith('/compare')} />
      <NavTab href="/universities" label="Browse" active={pathname?.startsWith('/universities')} />
      <NavTab href="/dashboard" label="Profile" active={pathname?.startsWith('/dashboard')} />
    </nav>
  );
}

function NavTab({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link href={href} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      padding: '4px 12px', textDecoration: 'none',
    }}>
      <div style={{
        width: 18, height: 18,
        border: active ? `1.5px solid ${brand.gold}` : `1px solid ${brand.textTertiary}`,
        background: active ? brand.creamWarm : 'transparent',
        borderRadius: 5,
      }} />
      <span style={{
        fontSize: 10, fontWeight: active ? 500 : 400,
        color: active ? brand.textPrimary : brand.textMuted,
      }}>{label}</span>
    </Link>
  );
}
