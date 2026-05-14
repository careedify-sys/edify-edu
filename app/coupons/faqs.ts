// app/coupons/faqs.ts — Single source of truth for /coupons hub FAQs.
//
// Both the visible accordion in page.tsx and the FAQPage JSON-LD schema in
// layout.tsx import from this module so the two stay byte-identical. If you
// edit a question or answer here, both surfaces update on next build.

export const COUPONS_HUB_FAQS = [
  {
    q: 'What is an online MBA discount coupon?',
    a: 'An online MBA discount coupon is a verified code that delivers a fixed fee reduction at the point of enrollment. The coupons on this page deliver up to Rs 5,000 off the published programme fee on Tuesday and Saturday in IST, and Rs 4,000 on other days. There is no marksheet upload, no eligibility test, and no category certificate required to redeem the coupon.',
  },
  {
    q: 'Why is the maximum discount only on Tuesday and Saturday?',
    a: 'Tuesday and Saturday are the two days each week when the maximum coupon discount of Rs 5,000 is active across all listed universities. On other days, the base amount of Rs 4,000 applies. The live amount and the countdown to the next max window are visible at the top of this page.',
  },
  {
    q: 'How is a coupon different from a university scholarship?',
    a: 'A coupon is a fixed, no-paperwork discount that any applicant can redeem at enrollment. A university scholarship (merit, defence, divyaang, alumni, sports) has eligibility rules, documentation requirements, and is administered directly by the university. The coupons on this page do not replace university scholarships; if you qualify for one, ask the university admissions team directly.',
  },
  {
    q: 'Are these coupon codes issued by the universities?',
    a: 'No. The coupon codes are administered by edifyedu.in and represent enrollment-time fee adjustments coordinated by our admission desk. They are not official discount offers from the listed universities. University-administered scholarships are separate and should be verified directly with each university.',
  },
  {
    q: 'Can I combine the coupon with a university scholarship?',
    a: 'Whether the coupon can be combined with a university-administered scholarship depends on the university and the scholarship category. Ask the university admissions team during enrollment. Our admission desk will help you confirm what the university allows for the 2026 batch.',
  },
  {
    q: 'How do I redeem the coupon code?',
    a: 'Reveal a coupon code on this page by submitting the quick form, then mention the code during your enrollment call with our admission desk. The desk coordinates with the university so the discount is reflected in your fee invoice before you make any payment.',
  },
  {
    q: 'Does the coupon discount work with EMI payment plans?',
    a: 'Yes at most universities. The discount reduces the total programme fee first, and you then pay the reduced balance via the universitys EMI plan. Verify specific terms with the university during enrollment, since some universities apply coupons to lump-sum payment only.',
  },
  {
    q: 'How long is the coupon valid?',
    a: 'Coupon codes are on a rolling 30-day validity and refresh each month. The amounts (Rs 4,000 base and Rs 5,000 max on Tuesday and Saturday) are reviewed and republished at the start of each calendar month based on the active enrollment cycle.',
  },
]
