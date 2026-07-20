// Per-spec editorial content for /programs/mba/[spec] hub pages.
// Task 3 GSC rescue sprint (July 2026). Pages without an entry here render
// the unchanged legacy template. Never hand-type fees in this file: all fee
// figures on spec hub pages come from UNIS_SLIM at render time.

export interface SpecHubEditorial {
  whoShouldChoose: string[]
  careerOutcomes: string[]
  faqs: { q: string; a: string }[]
  relatedBlogs: { slug: string; label: string }[]
}

export const SPEC_HUB_EDITORIAL: Record<string, SpecHubEditorial> = {
  'operations-management': {
    whoShouldChoose: [
      "This specialisation fits professionals who already work close to execution: plant and shift supervisors, warehouse and logistics executives, procurement staff, quality inspectors, and e-commerce fulfilment team members. The degree helps you move from running a process to designing and improving it. Engineers who want a management track without leaving the factory or supply chain side of the business are the single largest group choosing it.",
      "Skip it if your interest is primarily data and modelling rather than physical processes. An MBA in Business Analytics builds that career more directly. Also think twice if you want a creative or brand-led role, where a Marketing MBA is the better match.",
    ],
    careerOutcomes: [
      "The typical trajectory runs from operations executive to operations manager, and then to plant head, city head, or supply chain lead roles. Common job titles after this MBA include supply chain analyst, procurement specialist, production planner, quality manager, logistics manager, and inventory controller. Manufacturing, e-commerce logistics, retail, FMCG, pharma, and third-party logistics firms hire for these roles across India.",
      "Salary bands mirror the wider online MBA market: entry roles around Rs 3-6 LPA and mid-career roles around Rs 8-18 LPA, with plant-head and supply-chain-lead positions above that. Certifications stack well with this specialisation. Six Sigma (Green or Black Belt), PMP, and APICS CSCP are the three employers cite most often in operations job listings.",
    ],
    faqs: [
      {
        q: "What does an online MBA in Operations Management cover?",
        a: "Core coverage includes supply chain management, procurement and vendor management, production planning, inventory management, quality systems such as TQM and Six Sigma, logistics, and project management. Year 1 covers common MBA foundations. The operations subjects arrive in Semesters 3 and 4.",
      },
      {
        q: "Operations Management or Supply Chain Management MBA: which should I choose?",
        a: "Operations Management is the broader degree. It covers what happens inside the plant or service operation plus the supply chain around it. A dedicated Supply Chain Management MBA goes deeper on end-to-end material flow, sourcing, and distribution networks. Choose SCM if your target roles are purely in logistics and sourcing. Choose Operations if you want plant, quality, or service operations roles too.",
      },
      {
        q: "Is an online MBA in Operations Management good for manufacturing careers?",
        a: "Yes. It is the most directly relevant MBA specialisation for manufacturing. It pairs naturally with shop-floor experience, and working professionals can complete it without leaving their plant role, which matters because operations careers reward continuity in the same company.",
      },
      {
        q: "What is the eligibility for an online MBA in Operations Management?",
        a: "A bachelor's degree in any stream from a UGC-recognised university. Most universities ask for 50% marks in graduation, relaxed to 45% for reserved categories at several universities. Most online MBA programmes admit without an entrance exam, though some conduct a simple online aptitude test.",
      },
      {
        q: "Do I need an engineering background for an MBA in Operations Management?",
        a: "No. Graduates from any stream qualify. Engineers are common in this specialisation because the subject matter connects to production and process work, but commerce and science graduates in logistics, procurement, or retail operations do equally well. Comfort with numbers helps more than any specific degree.",
      },
      {
        q: "Which industries hire online MBA Operations Management graduates?",
        a: "Manufacturing, e-commerce and quick-commerce logistics, retail, FMCG, pharmaceuticals, automotive, aviation ground operations, and third-party logistics providers. Service operations roles in banking and healthcare back offices also recruit operations MBAs.",
      },
    ],
    relatedBlogs: [
      { slug: 'mba-operations-management-career-2026', label: 'MBA in Operations Management: Career Guide 2026' },
      { slug: 'online-mba-supply-chain-management-india-2026', label: 'Online MBA in Supply Chain Management in India' },
      { slug: 'best-mba-specialization-india-2026', label: 'How to Pick the Right MBA Specialisation in 2026' },
    ],
  },
}
