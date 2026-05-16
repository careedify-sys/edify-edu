// lib/university-blog-cta.ts — Config-driven CTA bundles for high-traffic
// university review/comparison blogs. Each entry is a strict-typed config
// consumed by the three generic blog-cta components.
//
// Pattern proven on MUJ ("is-manipal-university-jaipur-fake-or-legit-2026").
// New blogs join by adding a config entry and wiring into BLOG_CTA_BUNDLES.

export interface UniversityComparison {
  /** Tag suffix slug. Becomes `${sourceNamespace}_mid_compare_${slug}`. */
  readonly slug: string
  /** Full title shown on the comparison link card. */
  readonly title: string
  /** Subtitle / one-line description. */
  readonly desc: string
  /** Other university ID for /compare?b={otherId}. */
  readonly otherId: string
}

export interface UniversitySecondaryLink {
  /** Programme code in URL: 'mba', 'bba', 'bca', etc. Drives both href and tag suffix. */
  readonly program: string
  /** Display label on the link button. */
  readonly label: string
}

export interface UniversityBlogCtaConfig {
  // ── Identity ──────────────────────────────────────────────────────────────
  /** Exact string passed to EnquiryModal universityName. */
  readonly universityName: string
  /** University id used in /universities/{id}/{program}, /compare?a={id}, EnquiryModal. */
  readonly universityId: string
  /** Short brand name. Used as a fallback in some headings; explicit fields preferred. */
  readonly shortName: string

  // ── CTA #1: Top verdict callout ───────────────────────────────────────────
  /** Headline next to the green check icon. */
  readonly verdictHeadline: string
  /** Subheading under the headline. */
  readonly verdictSubheading: string
  /** Discount button label including emoji. */
  readonly verdictDiscountLabel: string
  /** Compare button label including emoji. */
  readonly verdictCompareLabel: string
  /** Counsellor button label including emoji. */
  readonly verdictCounsellorLabel: string
  /** Coupon page slug. Null falls back to /coupons hub. */
  readonly couponSlug: string | null

  // ── CTA #2: Mid-article comparison ────────────────────────────────────────
  /** Heading ID in the rendered blog content where the mid-CTA marker is spliced in (BEFORE the next h2). */
  readonly midCtaAnchorHeadingId: string
  /** Bold heading at the top of the comparison card. */
  readonly midHeading: string
  /** One-line subheading under the comparison heading. */
  readonly midSubheading: string
  /** Three comparison cards. Order preserved in render. */
  readonly comparisons: readonly UniversityComparison[]

  // ── CTA #3: End-of-article hard close ─────────────────────────────────────
  /** Big heading on the closing card. */
  readonly endHeading: string
  /** Subheading directly under the closing heading. */
  readonly endSubheading: string
  /** Label on the form submit button (no arrow — added by component). */
  readonly endSubmitLabel: string
  /** Trust bullets shown above the form. House-style enforced (no em dashes). */
  readonly endTrustBullets: readonly string[]
  /** Three secondary programme links shown after the form. Order preserved. */
  readonly secondaryLinks: readonly UniversitySecondaryLink[]

  // ── Analytics ─────────────────────────────────────────────────────────────
  /** Prefix for every data-cta tag emitted by all three components, and for sourcePage on the EnquiryModal. */
  readonly sourceNamespace: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Configs — preserves all existing MUJ tags byte-for-byte. New university
// configs follow the same shape; only data changes.
// ─────────────────────────────────────────────────────────────────────────────

export const MUJ_CONFIG: UniversityBlogCtaConfig = {
  universityName: 'Manipal University Jaipur Online',
  universityId: 'manipal-university-jaipur-online',
  shortName: 'MUJ',

  verdictHeadline: 'Manipal University Jaipur is UGC-DEB approved and 100% legitimate',
  verdictSubheading: 'Considering MUJ Online for your degree?',
  verdictDiscountLabel: '💰 See July 2026 Discount',
  verdictCompareLabel: '📊 Compare MUJ vs Others',
  verdictCounsellorLabel: '📞 Talk to Counsellor (Free)',
  couponSlug: 'manipal-jaipur-online-mba-discount-coupon-2026',

  midCtaAnchorHeadingId: 'is-manipal-university-jaipur-fake-no-and-here-is-the-proof',
  midHeading: "Now that you know MUJ Online is legit. The real question is whether it's the right fit for you.",
  midSubheading: "Here's how MUJ stacks up against other Tier-2 online universities:",
  comparisons: [
    {
      slug: 'lpu',
      title: 'MUJ vs LPU Online',
      desc: 'Which is better for working professionals?',
      otherId: 'lovely-professional-university-online',
    },
    {
      slug: 'amity',
      title: 'MUJ vs Amity Online',
      desc: 'Fees, placement, and recognition compared',
      otherId: 'amity-university-online',
    },
    {
      slug: 'cu',
      title: 'MUJ vs Chandigarh University',
      desc: 'Specialisations and student support',
      otherId: 'chandigarh-university-online',
    },
  ],

  endHeading: 'Ready to apply to MUJ Online?',
  endSubheading: "Before you click 'Apply Now' on the official portal, talk to us first.",
  endSubmitLabel: 'Talk to Counsellor',
  endTrustBullets: [
    "We'll tell you if MUJ is actually your best option (sometimes it isn't)",
    "We'll share current admission discounts and scholarship eligibility",
    "Zero commission. We don't take a cut from any university",
    "Zero pushy sales calls. You ask, we answer, you decide",
  ],
  secondaryLinks: [
    { program: 'mba', label: 'MUJ Online MBA Programmes' },
    { program: 'bba', label: 'MUJ Online BBA Programmes' },
    { program: 'bca', label: 'MUJ Online BCA Programmes' },
  ],

  sourceNamespace: 'muj_blog',
}

export const AMITY_CONFIG: UniversityBlogCtaConfig = {
  universityName: 'Amity University Online',
  universityId: 'amity-university-online',
  shortName: 'Amity',

  verdictHeadline: 'Amity Online MBA is UGC-DEB approved and AICTE recognised',
  verdictSubheading: 'Considering Amity Online for your MBA?',
  verdictDiscountLabel: '💰 See July 2026 Discount',
  verdictCompareLabel: '📊 Compare Amity vs Tier-2 Universities',
  verdictCounsellorLabel: '📞 Talk to Counsellor (Free)',
  couponSlug: 'amity-online-mba-discount-coupon-2026',

  midCtaAnchorHeadingId: 'what-genuinely-sets-amity-apart',
  midHeading: "Now that you know Amity Online is legit. Is it the right fit for you?",
  midSubheading: "Here's how Amity stacks up against other Tier-2 online universities:",
  comparisons: [
    {
      slug: 'lpu',
      title: 'Amity vs LPU Online',
      desc: 'Which is better for working professionals?',
      otherId: 'lovely-professional-university-online',
    },
    {
      slug: 'muj',
      title: 'Amity vs MUJ Online',
      desc: 'Fees, placement, and recognition compared',
      otherId: 'manipal-university-jaipur-online',
    },
    {
      slug: 'cu',
      title: 'Amity vs Chandigarh University',
      desc: 'Specialisations and student support',
      otherId: 'chandigarh-university-online',
    },
  ],

  endHeading: 'Ready to apply to Amity Online?',
  endSubheading: "Before you click 'Apply Now' on the official portal, talk to us first.",
  endSubmitLabel: 'Talk to Counsellor',
  endTrustBullets: [
    "We'll tell you if Amity is actually your best option (sometimes it isn't)",
    "We'll share current admission discounts and scholarship eligibility",
    "Zero commission. We don't take a cut from any university",
    "Zero pushy sales calls. You ask, we answer, you decide",
  ],
  secondaryLinks: [
    { program: 'mba', label: 'Amity Online MBA Programmes' },
    { program: 'bba', label: 'Amity Online BBA Programmes' },
    { program: 'bca', label: 'Amity Online BCA Programmes' },
  ],

  sourceNamespace: 'amity_blog',
}

/**
 * Map blog slug to its CTA config. The blog template looks up the slug here;
 * if present, all three CTAs are rendered. If absent, blog renders without
 * slug-specific CTAs.
 */
export const BLOG_CTA_BUNDLES: Record<string, UniversityBlogCtaConfig> = {
  'is-manipal-university-jaipur-fake-or-legit-2026': MUJ_CONFIG,
  'amity-online-mba-review-2026': AMITY_CONFIG,
}
