/** @type {import('next').NextConfig} */
const nextConfig = {
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
      // ── www → non-www (permanent 301) ─────────────────────────────────
      // Fixes Google Search Console "Page with redirect" for http://www.edifyedu.in/
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.edifyedu.in' }],
        destination: 'https://edifyedu.in/:path*',
        permanent: true,
      },

      // University program slug: online-mba → mba (removes duplicate "online" since university IDs already contain it)
      { source: '/universities/:id/online-mba',           destination: '/universities/:id/mba',           permanent: true },
      { source: '/universities/:id/online-mba/:path*',    destination: '/universities/:id/mba/:path*',    permanent: true },
      { source: '/universities/:id/online-mca',           destination: '/universities/:id/mca',           permanent: true },
      { source: '/universities/:id/online-mca/:path*',    destination: '/universities/:id/mca/:path*',    permanent: true },
      { source: '/universities/:id/online-bba',           destination: '/universities/:id/bba',           permanent: true },
      { source: '/universities/:id/online-bba/:path*',    destination: '/universities/:id/bba/:path*',    permanent: true },
      { source: '/universities/:id/online-bca',           destination: '/universities/:id/bca',           permanent: true },
      { source: '/universities/:id/online-bca/:path*',    destination: '/universities/:id/bca/:path*',    permanent: true },

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

      // University slug renames — old short/truncated IDs → SEO-friendly slugs
      { source: '/universities/jain',                           destination: '/universities/jain-university-online',                           permanent: true },
      { source: '/universities/jain/:path*',                    destination: '/universities/jain-university-online/:path*',                    permanent: true },
      { source: '/universities/amity',                          destination: '/universities/amity-university-online',                          permanent: true },
      { source: '/universities/amity/:path*',                   destination: '/universities/amity-university-online/:path*',                   permanent: true },
      { source: '/universities/lpu',                            destination: '/universities/lovely-professional-university-online',            permanent: true },
      { source: '/universities/lpu/:path*',                     destination: '/universities/lovely-professional-university-online/:path*',     permanent: true },
      { source: '/universities/dayanand-sagar-universi',        destination: '/universities/dayananda-sagar-university-online',               permanent: true },
      { source: '/universities/dayanand-sagar-universi/:path*', destination: '/universities/dayananda-sagar-university-online/:path*',        permanent: true },
      { source: '/universities/dypatil',                        destination: '/universities/dy-patil-university-online',                      permanent: true },
      { source: '/universities/dypatil/:path*',                 destination: '/universities/dy-patil-university-online/:path*',               permanent: true },
      { source: '/universities/universi-of-petroleu-and',       destination: '/universities/upes-online',                                     permanent: true },
      { source: '/universities/universi-of-petroleu-and/:path*',destination: '/universities/upes-online/:path*',                              permanent: true },
      { source: '/universities/parul-universi',                 destination: '/universities/parul-university-online',                         permanent: true },
      { source: '/universities/parul-universi/:path*',          destination: '/universities/parul-university-online/:path*',                  permanent: true },
      { source: '/universities/amrita-vishwa-vidyapee',         destination: '/universities/amrita-vishwa-vidyapeetham-online',               permanent: true },
      { source: '/universities/amrita-vishwa-vidyapee/:path*',  destination: '/universities/amrita-vishwa-vidyapeetham-online/:path*',        permanent: true },
      { source: '/universities/mangalay-universi',              destination: '/universities/mangalayatan-university-online',                  permanent: true },
      { source: '/universities/mangalay-universi/:path*',       destination: '/universities/mangalayatan-university-online/:path*',           permanent: true },
      { source: '/universities/shoolini',                       destination: '/universities/shoolini-university-online',                      permanent: true },
      { source: '/universities/shoolini/:path*',                destination: '/universities/shoolini-university-online/:path*',               permanent: true },
      { source: '/universities/manipal-jaipur',                 destination: '/universities/manipal-university-jaipur-online',                permanent: true },
      { source: '/universities/manipal-jaipur/:path*',          destination: '/universities/manipal-university-jaipur-online/:path*',         permanent: true },
      { source: '/universities/galgotia-universi',              destination: '/universities/galgotias-university-online',                     permanent: true },
      { source: '/universities/galgotia-universi/:path*',       destination: '/universities/galgotias-university-online/:path*',              permanent: true },
      { source: '/universities/sikkim-manipal',                 destination: '/universities/sikkim-manipal-university-online',                permanent: true },
      { source: '/universities/sikkim-manipal/:path*',          destination: '/universities/sikkim-manipal-university-online/:path*',         permanent: true },
      { source: '/universities/symbiosis',                      destination: '/universities/symbiosis-university-online',                     permanent: true },
      { source: '/universities/symbiosis/:path*',               destination: '/universities/symbiosis-university-online/:path*',              permanent: true },
      { source: '/universities/chitkara-universi',              destination: '/universities/chitkara-university-online',                      permanent: true },
      { source: '/universities/chitkara-universi/:path*',       destination: '/universities/chitkara-university-online/:path*',               permanent: true },
      { source: '/universities/yenepoya-universi',              destination: '/universities/yenepoya-university-online',                      permanent: true },
      { source: '/universities/yenepoya-universi/:path*',       destination: '/universities/yenepoya-university-online/:path*',               permanent: true },
      { source: '/universities/sharda-universi',                destination: '/universities/sharda-university-online',                        permanent: true },
      { source: '/universities/sharda-universi/:path*',         destination: '/universities/sharda-university-online/:path*',                 permanent: true },
      { source: '/universities/vignans-foundati-for-science',   destination: '/universities/vignan-university-online',                        permanent: true },
      { source: '/universities/vignans-foundati-for-science/:path*', destination: '/universities/vignan-university-online/:path*',           permanent: true },
      { source: '/universities/manonman-sundaran-universi',     destination: '/universities/manonmaniam-sundaranar-university-online',        permanent: true },
      { source: '/universities/manonman-sundaran-universi/:path*', destination: '/universities/manonmaniam-sundaranar-university-online/:path*', permanent: true },
      { source: '/universities/nmims',                          destination: '/universities/nmims-online',                                    permanent: true },
      { source: '/universities/nmims/:path*',                   destination: '/universities/nmims-online/:path*',                             permanent: true },
      { source: '/universities/mahe-manipal',                   destination: '/universities/manipal-academy-higher-education-online',         permanent: true },
      { source: '/universities/mahe-manipal/:path*',            destination: '/universities/manipal-academy-higher-education-online/:path*',  permanent: true },
      { source: '/universities/manipal',                        destination: '/universities/manipal-academy-higher-education-online',         permanent: true },
      { source: '/universities/manipal/:path*',                 destination: '/universities/manipal-academy-higher-education-online/:path*',  permanent: true },
      { source: '/universities/koneru-lakshmai-educatio-found', destination: '/universities/kl-university-online',                           permanent: true },
      { source: '/universities/koneru-lakshmai-educatio-found/:path*', destination: '/universities/kl-university-online/:path*',             permanent: true },
      { source: '/universities/chandigarh',                     destination: '/universities/chandigarh-university-online',                    permanent: true },
      { source: '/universities/chandigarh/:path*',              destination: '/universities/chandigarh-university-online/:path*',             permanent: true },
      { source: '/universities/visveswa-technolo-universi',     destination: '/universities/vtu-online',                                      permanent: true },
      { source: '/universities/visveswa-technolo-universi/:path*', destination: '/universities/vtu-online/:path*',                           permanent: true },
      { source: '/universities/integral-universi',              destination: '/universities/integral-university-online',                      permanent: true },
      { source: '/universities/integral-universi/:path*',       destination: '/universities/integral-university-online/:path*',               permanent: true },
      { source: '/universities/manav-rachna-internat-institut', destination: '/universities/manav-rachna-online',                             permanent: true },
      { source: '/universities/manav-rachna-internat-institut/:path*', destination: '/universities/manav-rachna-online/:path*',              permanent: true },
      { source: '/universities/karnatak-state-open-universi',   destination: '/universities/karnataka-state-open-university-online',          permanent: true },
      { source: '/universities/karnatak-state-open-universi/:path*', destination: '/universities/karnataka-state-open-university-online/:path*', permanent: true },
      { source: '/universities/bharathidasan-uni',              destination: '/universities/bharathidasan-university-online',                 permanent: true },
      { source: '/universities/bharathidasan-uni/:path*',       destination: '/universities/bharathidasan-university-online/:path*',          permanent: true },
      { source: '/universities/hindusta-institut-of-technolo',  destination: '/universities/hindustan-institute-technology-online',           permanent: true },
      { source: '/universities/hindusta-institut-of-technolo/:path*', destination: '/universities/hindustan-institute-technology-online/:path*', permanent: true },
      { source: '/universities/guru-ghasidas-vishwavi',         destination: '/universities/guru-ghasidas-vishwavidyalaya-online',             permanent: true },
      { source: '/universities/guru-ghasidas-vishwavi/:path*',  destination: '/universities/guru-ghasidas-vishwavidyalaya-online/:path*',      permanent: true },
      { source: '/universities/dr-babasahe-ambedkar-open',      destination: '/universities/dr-babasaheb-ambedkar-open-university-online',    permanent: true },
      { source: '/universities/dr-babasahe-ambedkar-open/:path*', destination: '/universities/dr-babasaheb-ambedkar-open-university-online/:path*', permanent: true },
      { source: '/universities/marwadi-universi',               destination: '/universities/marwadi-university-online',                       permanent: true },
      { source: '/universities/marwadi-universi/:path*',        destination: '/universities/marwadi-university-online/:path*',                permanent: true },
      { source: '/universities/pp-savani-universi',             destination: '/universities/pp-savani-university-online',                     permanent: true },
      { source: '/universities/pp-savani-universi/:path*',      destination: '/universities/pp-savani-university-online/:path*',              permanent: true },
      { source: '/universities/universi-of-mysore',             destination: '/universities/university-of-mysore-online',                     permanent: true },
      { source: '/universities/universi-of-mysore/:path*',      destination: '/universities/university-of-mysore-online/:path*',              permanent: true },
      { source: '/universities/aligarh-muslim-universi',        destination: '/universities/aligarh-muslim-university-online',                permanent: true },
      { source: '/universities/aligarh-muslim-universi/:path*', destination: '/universities/aligarh-muslim-university-online/:path*',         permanent: true },
      { source: '/universities/gujarat-universi',               destination: '/universities/gujarat-university-online',                       permanent: true },
      { source: '/universities/gujarat-universi/:path*',        destination: '/universities/gujarat-university-online/:path*',                permanent: true },
      { source: '/universities/charotar-universi-of-science',   destination: '/universities/charusat-university-online',                      permanent: true },
      { source: '/universities/charotar-universi-of-science/:path*', destination: '/universities/charusat-university-online/:path*',         permanent: true },
      { source: '/universities/gls-universi',                   destination: '/universities/gls-university-online',                          permanent: true },
      { source: '/universities/gls-universi/:path*',            destination: '/universities/gls-university-online/:path*',                   permanent: true },
      { source: '/universities/maharish-markande-universi',     destination: '/universities/maharishi-markandeshwar-university-online',       permanent: true },
      { source: '/universities/maharish-markande-universi/:path*', destination: '/universities/maharishi-markandeshwar-university-online/:path*', permanent: true },
      { source: '/universities/mizoram-universi',               destination: '/universities/mizoram-university-online',                       permanent: true },
      { source: '/universities/mizoram-universi/:path*',        destination: '/universities/mizoram-university-online/:path*',                permanent: true },
      { source: '/universities/vivekana-global-universi',       destination: '/universities/vivekananda-global-university-online',            permanent: true },
      { source: '/universities/vivekana-global-universi/:path*',destination: '/universities/vivekananda-global-university-online/:path*',    permanent: true },
      { source: '/universities/dr-mgr-educatio-and',            destination: '/universities/dr-mgr-educational-research-institute-online',   permanent: true },
      { source: '/universities/dr-mgr-educatio-and/:path*',     destination: '/universities/dr-mgr-educational-research-institute-online/:path*', permanent: true },
      { source: '/universities/uttaranc-universi',              destination: '/universities/uttaranchal-university-online',                   permanent: true },
      { source: '/universities/uttaranc-universi/:path*',       destination: '/universities/uttaranchal-university-online/:path*',            permanent: true },
      { source: '/universities/andhra-universi',                destination: '/universities/andhra-university-online',                        permanent: true },
      { source: '/universities/andhra-universi/:path*',         destination: '/universities/andhra-university-online/:path*',                 permanent: true },
      { source: '/universities/sgt-universi',                   destination: '/universities/sgt-university-online',                          permanent: true },
      { source: '/universities/sgt-universi/:path*',            destination: '/universities/sgt-university-online/:path*',                   permanent: true },
      { source: '/universities/universi-of-himachal-pradesh',   destination: '/universities/central-university-himachal-pradesh-online',     permanent: true },
      { source: '/universities/universi-of-himachal-pradesh/:path*', destination: '/universities/central-university-himachal-pradesh-online/:path*', permanent: true },
      { source: '/universities/mahatma-gandhi-universi',        destination: '/universities/mahatma-gandhi-university-online',                permanent: true },
      { source: '/universities/mahatma-gandhi-universi/:path*', destination: '/universities/mahatma-gandhi-university-online/:path*',         permanent: true },
      { source: '/universities/vellore-institut-of-technolo',   destination: '/universities/vit-university-online',                          permanent: true },
      { source: '/universities/vellore-institut-of-technolo/:path*', destination: '/universities/vit-university-online/:path*',              permanent: true },
      { source: '/universities/karunya-institut-of-technolo',   destination: '/universities/karunya-university-online',                       permanent: true },
      { source: '/universities/karunya-institut-of-technolo/:path*', destination: '/universities/karunya-university-online/:path*',          permanent: true },
      { source: '/universities/kurukshe-universi',              destination: '/universities/kurukshetra-university-online',                   permanent: true },
      { source: '/universities/kurukshe-universi/:path*',       destination: '/universities/kurukshetra-university-online/:path*',            permanent: true },
      { source: '/universities/sastra-deemed-universi',         destination: '/universities/sastra-university-online',                        permanent: true },
      { source: '/universities/sastra-deemed-universi/:path*',  destination: '/universities/sastra-university-online/:path*',                 permanent: true },
      { source: '/universities/dr-dy-patil-vidyapeeth',         destination: '/universities/dr-dy-patil-vidyapeeth-online',                  permanent: true },
      { source: '/universities/dr-dy-patil-vidyapeeth/:path*',  destination: '/universities/dr-dy-patil-vidyapeeth-online/:path*',           permanent: true },
      { source: '/universities/jamia-millia-islamia-universi',  destination: '/universities/jamia-millia-islamia-online',                    permanent: true },
      { source: '/universities/jamia-millia-islamia-universi/:path*', destination: '/universities/jamia-millia-islamia-online/:path*',       permanent: true },
      { source: '/universities/christ-deemed-to-be',            destination: '/universities/christ-university-online',                        permanent: true },
      { source: '/universities/christ-deemed-to-be/:path*',     destination: '/universities/christ-university-online/:path*',                permanent: true },
      { source: '/universities/shobhit-universi',               destination: '/universities/shobhit-university-online',                      permanent: true },
      { source: '/universities/shobhit-universi/:path*',        destination: '/universities/shobhit-university-online/:path*',               permanent: true },
      { source: '/universities/bharati-vidyapee-universi',      destination: '/universities/bharati-vidyapeeth-university-online',           permanent: true },
      { source: '/universities/bharati-vidyapee-universi/:path*', destination: '/universities/bharati-vidyapeeth-university-online/:path*',  permanent: true },
      { source: '/universities/assam-down-town-universi',       destination: '/universities/assam-don-bosco-university-online',              permanent: true },
      { source: '/universities/assam-down-town-universi/:path*',destination: '/universities/assam-don-bosco-university-online/:path*',      permanent: true },
      { source: '/universities/universi-of-lucknow',            destination: '/universities/university-of-lucknow-online',                   permanent: true },
      { source: '/universities/universi-of-lucknow/:path*',     destination: '/universities/university-of-lucknow-online/:path*',            permanent: true },
      { source: '/universities/jss-academy-of-higher',          destination: '/universities/jss-university-online',                          permanent: true },
      { source: '/universities/jss-academy-of-higher/:path*',   destination: '/universities/jss-university-online/:path*',                   permanent: true },
      { source: '/universities/srm-institut-of-science',        destination: '/universities/srm-institute-science-technology-online',        permanent: true },
      { source: '/universities/srm-institut-of-science/:path*', destination: '/universities/srm-institute-science-technology-online/:path*', permanent: true },
      { source: '/universities/vellore-vit-online',             destination: '/universities/vit-vellore-online',                             permanent: true },
      { source: '/universities/vellore-vit-online/:path*',      destination: '/universities/vit-vellore-online/:path*',                      permanent: true },
      { source: '/universities/kalinga-institut-of-industri',   destination: '/universities/kalinga-institute-industrial-technology-online', permanent: true },
      { source: '/universities/kalinga-institut-of-industri/:path*', destination: '/universities/kalinga-institute-industrial-technology-online/:path*', permanent: true },

      // ── Broken/truncated slugs indexed by Google — 301 to correct canonical ──
      // University slugs (truncated old versions)
      { source: '/universities/shanmugh-arts-science-technolo',          destination: '/universities/shanmugha-arts-science-technology-research-online',    permanent: true },
      { source: '/universities/shanmugh-arts-science-technolo/:path*',   destination: '/universities/shanmugha-arts-science-technology-research-online/:path*', permanent: true },
      { source: '/universities/sri-ramachandra-universi',                destination: '/universities/sri-ramachandra-university-online',                    permanent: true },
      { source: '/universities/sri-ramachandra-universi/:path*',         destination: '/universities/sri-ramachandra-university-online/:path*',             permanent: true },
      { source: '/universities/bharath-institut-of-higher',              destination: '/universities',                                                       permanent: true },
      { source: '/universities/bharath-institut-of-higher/:path*',       destination: '/universities',                                                       permanent: true },
      { source: '/universities/deen-dayal-upadhyay-gorakhpu',            destination: '/universities/deen-dayal-upadhyay-gorakhpur-university-online',      permanent: true },
      { source: '/universities/deen-dayal-upadhyay-gorakhpu/:path*',     destination: '/universities/deen-dayal-upadhyay-gorakhpur-university-online/:path*', permanent: true },
      { source: '/universities/sathyaba-institut-of-science',            destination: '/universities/sathyabama-university-online',                         permanent: true },
      { source: '/universities/sathyaba-institut-of-science/:path*',     destination: '/universities/sathyabama-university-online/:path*',                  permanent: true },
      { source: '/universities/bharathi-universi',                       destination: '/universities/bharathidasan-university-online',                      permanent: true },
      { source: '/universities/bharathi-universi/:path*',                destination: '/universities/bharathidasan-university-online/:path*',               permanent: true },
      { source: '/universities/teerthanker-universi',                    destination: '/universities/teerthanker-mahaveer-university-online',               permanent: true },
      { source: '/universities/teerthanker-universi/:path*',             destination: '/universities/teerthanker-mahaveer-university-online/:path*',        permanent: true },
      { source: '/universities/jaypee-universi',                         destination: '/universities/jaypee-university-online',                             permanent: true },
      { source: '/universities/jaypee-universi/:path*',                  destination: '/universities/jaypee-university-online/:path*',                      permanent: true },
      { source: '/universities/arka-jain-universi',                      destination: '/universities/arka-jain-university-online',                          permanent: true },
      { source: '/universities/arka-jain-universi/:path*',               destination: '/universities/arka-jain-university-online/:path*',                   permanent: true },

      // CU BBA business-analytics truncated suffix
      { source: '/universities/chandigarh-university-online/bba/business-analytics-specialization-with-data-focuse', destination: '/universities/chandigarh-university-online/bba/business-analytics', permanent: true },

      // Program slugs with double-hyphens (CMS generation artifact)
      { source: '/programs/mba/hospital--health-care-management',        destination: '/programs/mba/hospital-healthcare-management',                       permanent: true },
      { source: '/programs/mba/data-science--ai',                        destination: '/programs/mba/data-science-ai',                                      permanent: true },
      { source: '/programs/mba/tourism--event-management',               destination: '/programs/mba/tourism-event-management',                             permanent: true },

      // Program slugs with trailing noise suffix
      { source: '/programs/msc/data-science-focus-no-sub-specializations-80-cre', destination: '/programs/msc/data-science',                               permanent: true },
      { source: '/programs/mca/artificial-intelligence-and-data-science-cyber-se', destination: '/programs/mca/artificial-intelligence-and-data-science',  permanent: true },

      // Missing-data program pages
      { source: '/programs/mba/insurance-management',                    destination: '/programs/mba/banking-insurance',                                    permanent: true },
      { source: '/programs/mba/public-policy',                           destination: '/programs/mba',                                                      permanent: true },

      // Legacy patterns
      { source: '/college/:id',                destination: '/universities/:id',          permanent: true },
      { source: '/college/:id/:program',       destination: '/universities/:id/:program', permanent: true },
      { source: '/university/:id',             destination: '/universities/:id',          permanent: true },
      { source: '/university/:id/:program',    destination: '/universities/:id/:program', permanent: true },

      // Old SEO canonical URLs (/online-mba/jain-university) → program pages
      { source: '/online-mba/:id',             destination: '/programs/mba',  permanent: true },
      // NOTE: /online-mca/:id intentionally removed — /online-mca/[slug] is a real page (MCA blog posts)
      { source: '/online-bba/:id',             destination: '/programs/bba',  permanent: true },
      { source: '/online-bca/:id',             destination: '/programs/bca',  permanent: true },
      { source: '/online-mcom/:id',            destination: '/programs/mcom', permanent: true },
      { source: '/online-bcom/:id',            destination: '/programs/bcom', permanent: true },
      { source: '/online-ma/:id',              destination: '/programs/ma',   permanent: true },
      { source: '/online-msc/:id',             destination: '/programs/msc',  permanent: true },
      { source: '/online-ba/:id',              destination: '/programs/ba',   permanent: true },
      { source: '/online-bsc/:id',             destination: '/programs/bsc',  permanent: true },

      // University-program vanity URLs (e.g. /{uni}-online-{program})
      { source: '/vignan-online-mca',          destination: '/universities/vignan-university-online/mca', permanent: true },

      // Short aliases
      { source: '/mba',                        destination: '/programs/mba',  permanent: true },
      { source: '/mca',                        destination: '/programs/mca',  permanent: true },
      { source: '/bba',                        destination: '/programs/bba',  permanent: true },
      { source: '/bca',                        destination: '/programs/bca',  permanent: true },
      { source: '/online-mba',                 destination: '/programs/mba',  permanent: true },
      { source: '/online-mca',                 destination: '/programs/mca',  permanent: true },
      { source: '/online-mba-india',           destination: '/programs/mba',  permanent: true },

      // Program spec sub-routes — these 500 in the server component; redirect to base program
      // University ID sub-routes are handled separately by permanentRedirect in the page component
      ...[
        'marketing','marketing-management','finance','finance-management','financial-management',
        'human-resource-management','hr-management','hr','data-science-analytics','data-science',
        'business-analytics','digital-marketing','operations-management','international-business',
        'entrepreneurship','project-management','supply-chain-management','healthcare-management',
        'it-management','general-management','banking-finance','logistics-supply-chain',
      ].map(spec => ({
        source: `/programs/:program/${spec}`,
        destination: '/programs/:program',
        permanent: false,
      })),

      // Blog legacy
      { source: '/post/:slug',                 destination: '/blog/:slug',    permanent: true },
      { source: '/article/:slug',              destination: '/blog/:slug',    permanent: true },

      // Trailing slash
      { source: '/universities/',              destination: '/universities',  permanent: true },
      { source: '/programs/',                  destination: '/programs',      permanent: true },
      { source: '/compare/',                   destination: '/compare',       permanent: true },
      { source: '/tools/',                     destination: '/tools',         permanent: true },
      { source: '/index.html',                 destination: '/',              permanent: true },
      { source: '/index',                      destination: '/',              permanent: true },
      // Legacy cPanel / WordPress URLs Google has indexed
      { source: '/cgi-sys/suspendedpage.cgi',  destination: '/',              permanent: true },
      { source: '/cgi-sys/:path*',             destination: '/',              permanent: true },
      { source: '/author/:path*',              destination: '/blog',          permanent: true },
      { source: '/feed',                       destination: '/blog',          permanent: true },
      { source: '/feed/',                      destination: '/blog',          permanent: true },
      { source: '/wp-content/:path*',          destination: '/',              permanent: true },
      { source: '/wp-admin/:path*',            destination: '/',              permanent: true },
      { source: '/wp-login.php',               destination: '/',              permanent: true },
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
