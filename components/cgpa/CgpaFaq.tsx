export interface CgpaFaqItem {
  q: string
  a: string
}

interface Props {
  items: CgpaFaqItem[]
}

export default function CgpaFaq({ items }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
      <div className="space-y-5">
        {items.map((faq, i) => (
          <details
            key={i}
            className="group border-b border-border last:border-0 pb-5 last:pb-0"
            open={i === 0}
          >
            <summary className="cursor-pointer list-none flex items-start gap-2 font-semibold text-navy text-base">
              <span className="text-amber font-bold shrink-0">Q{i + 1}.</span>
              <span className="flex-1">{faq.q}</span>
              <span className="text-amber text-lg shrink-0 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="text-sm text-ink-2 leading-relaxed pl-7 mt-3">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
