export default function FranchiseQuestion({ provider }: { provider: string }) {
  return (
    <section
      className="rounded-xl p-5 my-8"
      style={{ background: 'rgba(184,137,42,0.08)', borderLeft: '4px solid #B8892A' }}
    >
      <h2 className="text-lg font-bold mb-2" style={{ color: '#0f172a' }}>
        The franchise question
      </h2>
      <p className="text-[15px] leading-relaxed" style={{ color: '#1e293b' }}>
        Before you pay, ask in writing whether this DBA is delivered through a franchise or partner
        arrangement. If it is, it is not eligible for UGC equivalence. Talk to our counsellor to check
        this for {provider}.
      </p>
    </section>
  )
}
