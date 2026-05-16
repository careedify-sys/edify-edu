import BlogLeadForm from '../BlogLeadForm'

const MUJ_COUPON = 'MUJ2026-4K'

export default function MujCouponEndCta() {
  return (
    <section id="muj-coupon-end-close" className="my-8">
      <h2 className="font-display font-bold mb-2 leading-tight" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.875rem)', color: '#0B1D35' }}>
        Ready to enrol at MUJ Online?
      </h2>
      <p className="text-sm sm:text-base mb-5" style={{ color: '#3B5068' }}>
        Drop your details. We'll get the discount applied and a counsellor will call you back to confirm everything.
      </p>

      <BlogLeadForm
        title="Claim Your MUJ Discount"
        desc="Free counselling. Zero commission. Honest advice."
        submitLabel="Claim My Discount"
        source="muj_coupon_end"
        defaultProgram="Online MBA"
        bestTimeField
        couponCode={MUJ_COUPON}
      />
    </section>
  )
}
