// app/coupons/faqs.ts — Single source of truth for /coupons hub FAQs.
//
// Both the visible accordion in page.tsx and the FAQPage JSON-LD schema in
// layout.tsx import from this module so the two stay byte-identical. If you
// edit a question or answer here, both surfaces update on next build.

export const COUPONS_HUB_FAQS = [
  {
    q: 'What is the edifyedu.in enrollment bonus?',
    a: 'The edifyedu.in enrollment bonus is a tiered fee adjustment paid by edifyedu.in (not the university) when you enroll in an online MBA or MCA through our advisor. Premium universities pay up to Rs 7,500, standard up to Rs 5,000, and budget up to Rs 4,000. The maximum amount in each tier is active every Tuesday and Saturday in IST.',
  },
  {
    q: 'Why is the maximum bonus only on Tuesday and Saturday?',
    a: 'Tuesday and Saturday are the two days each week when edifyedu.in releases the maximum enrollment bonus across all tiers. On other days, the base amount applies. The live amount and the countdown to the next max window are visible at the top of this page.',
  },
  {
    q: 'How are universities placed into premium, standard, and budget tiers?',
    a: 'Tier placement reflects the published programme fee, NIRF and NAAC standing, and overall positioning of the online MBA. Premium tier covers Symbiosis SSODL and MAHE. Standard tier covers Amity, NMIMS, LPU, Chandigarh University, JAIN, and DY Patil. Budget tier covers SMU, MUJ, and IGNOU.',
  },
  {
    q: 'Is this enrollment bonus from the university or from edifyedu.in?',
    a: 'It is from edifyedu.in, not from the university. The bonus is applied as a fee adjustment during your advisor-assisted enrollment. University scholarships (merit, defence, lump-sum) are separate, come directly from the university, and can be availed on top of the edifyedu.in bonus.',
  },
  {
    q: 'Can I stack the edifyedu.in bonus with a university scholarship?',
    a: 'Yes. The two are independent. A merit scholarship of 10 to 30 percent, a defence waiver, a lump-sum payment discount, or any other university-administered concession applies first. The edifyedu.in enrollment bonus is then applied on top during your advisor-assisted enrollment.',
  },
  {
    q: 'How do I claim the edifyedu.in enrollment bonus?',
    a: 'Reveal a coupon code on this page by submitting the quick form, then mention the code to your edifyedu.in counsellor on the call. The counsellor confirms your eligibility and applies the bonus as a fee adjustment in your invoice before you make any payment.',
  },
  {
    q: 'Does the enrollment bonus work with EMI payment?',
    a: 'Yes. The bonus reduces the total programme fee first, and you then pay the reduced balance via the university EMI plan. Your edifyedu.in counsellor will clarify the exact EMI terms for the university you choose.',
  },
  {
    q: 'Where can I see the live bonus amount and the countdown?',
    a: 'The live amount for each tier and the countdown to the next Tuesday or Saturday max window are visible at the top of this page in IST. Each coupon card also shows the live amount for that specific university based on its tier.',
  },
]
