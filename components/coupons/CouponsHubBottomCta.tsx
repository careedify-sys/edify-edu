import BlogLeadForm from '../BlogLeadForm'

export default function CouponsHubBottomCta() {
  return (
    <section id="coupons-hub-bottom-cta" className="max-w-3xl mx-auto px-4 sm:px-6 my-10 sm:my-12">
      <div className="text-center mb-5">
        <h2 className="font-display font-bold mb-2 leading-tight" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.875rem)', color: '#0B1D35' }}>
          Still deciding? Talk to a counsellor.
        </h2>
        <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: '#3B5068' }}>
          Drop your details. We'll share current discounts across all 125+ UGC-DEB approved universities, no obligation.
        </p>
      </div>

      <BlogLeadForm
        title="Get All Discounts"
        desc="Free counselling across 125+ UGC-DEB approved universities. Zero commission. Honest advice."
        submitLabel="Get All Discounts"
        source="coupons_hub_bottom"
        defaultProgram="Online MBA"
        bestTimeField
      />
    </section>
  )
}
