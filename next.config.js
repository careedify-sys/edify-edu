/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next-prod', // Using .next-prod to avoid Windows EPERM lock on .next/trace

  // ── Image optimisation ──────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'edifyedu.in' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // ── Compiler tweaks ─────────────────────────────────────────────────
  compiler: {
    // Remove console.log in production builds
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // ── Tree-shake large icon/component packages ────────────────────────
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  async redirects() {
    return [
      // Online-prefix → canonical slug
      { source: '/programs/online-mba',        destination: '/programs/mba',   permanent: true  },
      { source: '/programs/online-mca',        destination: '/programs/mca',   permanent: true  },
      { source: '/programs/online-bba',        destination: '/programs/bba',   permanent: true  },
      { source: '/programs/online-bca',        destination: '/programs/bca',   permanent: true  },
      { source: '/programs/online-mcom',       destination: '/programs/mcom',  permanent: true  },
      { source: '/programs/online-bcom',       destination: '/programs/bcom',  permanent: true  },
      { source: '/programs/online-ma',         destination: '/programs/ma',    permanent: true  },
      { source: '/programs/online-msc',        destination: '/programs/msc',   permanent: true  },
      { source: '/programs/online-mba/:uni',   destination: '/programs/mba/:uni', permanent: true },
      { source: '/programs/online-mca/:uni',   destination: '/programs/mca/:uni', permanent: true },
      { source: '/programs/online-bba/:uni',   destination: '/programs/bba/:uni', permanent: true },
      { source: '/programs/online-bca/:uni',   destination: '/programs/bca/:uni', permanent: true },

      // Removed programs
      { source: '/programs/mba-wx',            destination: '/programs/mba',   permanent: true },
      { source: '/programs/mba-wx/:path*',     destination: '/programs/mba',   permanent: true },
      { source: '/universities/:id/mba-wx',    destination: '/universities/:id/mba', permanent: true },

      // Dot-slug normalisation
      { source: '/programs/m.com',             destination: '/programs/mcom',  permanent: true },
      { source: '/programs/m.com/:path*',      destination: '/programs/mcom',  permanent: true },
      { source: '/universities/:id/m.com',     destination: '/universities/:id/mcom', permanent: true },
      { source: '/programs/b.com',             destination: '/programs/bcom',  permanent: true },
      { source: '/programs/b.com/:path*',      destination: '/programs/bcom',  permanent: true },
      { source: '/universities/:id/b.com',     destination: '/universities/:id/bcom', permanent: true },
      { source: '/programs/m.sc',              destination: '/programs/msc',   permanent: true },
      { source: '/programs/b.sc',              destination: '/programs/bsc',   permanent: true },

      // University ID renames
      { source: '/universities/manipal',          destination: '/universities/mahe-manipal', permanent: true },
      { source: '/universities/manipal/:path*',   destination: '/universities/mahe-manipal/:path*', permanent: true },

      // Legacy patterns
      { source: '/college/:id',                destination: '/universities/:id',          permanent: true },
      { source: '/college/:id/:program',       destination: '/universities/:id/:program', permanent: true },
      { source: '/university/:id',             destination: '/universities/:id',          permanent: true },
      { source: '/university/:id/:program',    destination: '/universities/:id/:program', permanent: true },

      // Old SEO canonical URLs (/online-mba/jain-university) → program pages
      { source: '/online-mba/:id',             destination: '/programs/mba',  permanent: true },
      { source: '/online-mca/:id',             destination: '/programs/mca',  permanent: true },
      { source: '/online-bba/:id',             destination: '/programs/bba',  permanent: true },
      { source: '/online-bca/:id',             destination: '/programs/bca',  permanent: true },
      { source: '/online-mcom/:id',            destination: '/programs/mcom', permanent: true },
      { source: '/online-bcom/:id',            destination: '/programs/bcom', permanent: true },
      { source: '/online-ma/:id',              destination: '/programs/ma',   permanent: true },
      { source: '/online-msc/:id',             destination: '/programs/msc',  permanent: true },
      { source: '/online-ba/:id',              destination: '/programs/ba',   permanent: true },
      { source: '/online-bsc/:id',             destination: '/programs/bsc',  permanent: true },

      // Short aliases
      { source: '/mba',                        destination: '/programs/mba',  permanent: true },
      { source: '/mca',                        destination: '/programs/mca',  permanent: true },
      { source: '/bba',                        destination: '/programs/bba',  permanent: true },
      { source: '/bca',                        destination: '/programs/bca',  permanent: true },
      { source: '/online-mba',                 destination: '/programs/mba',  permanent: true },
      { source: '/online-mca',                 destination: '/programs/mca',  permanent: true },
      { source: '/online-mba-india',           destination: '/programs/mba',  permanent: true },

      // Blog legacy
      { source: '/post/:slug',                 destination: '/blog/:slug',    permanent: true },
      { source: '/article/:slug',              destination: '/blog/:slug',    permanent: true },

      // Trailing slash
      { source: '/universities/',              destination: '/universities',  permanent: true },
      { source: '/programs/',                  destination: '/programs',      permanent: true },
      { source: '/compare/',                   destination: '/compare',       permanent: true },
      { source: '/tools/',                     destination: '/tools',         permanent: true },
    ]
  },

  // ── Security & cache headers ─────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""} https://www.googletagmanager.com https://api.web3forms.com https://cdnjs.cloudflare.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' https://api.web3forms.com https://api.anthropic.com https://api.github.com https://www.google-analytics.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/university-data/:path*',
        headers: [
          { key: 'X-Robots-Tag',   value: 'noindex' },
          { key: 'Cache-Control',  value: 'no-store' },
        ],
      },
      {
        source: '/logos/:path*',
        headers: [
          { key: 'Cache-Control',  value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control',  value: 'no-store' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
