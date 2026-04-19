import { Users, Compass, Network, Briefcase } from 'lucide-react'

interface Props {
  cleanName: string
}

const OFFERS = [
  {
    Icon: Users,
    title: 'Alumni in Your Target Industry',
    body: (uni: string) =>
      `We introduce you to 2 to 3 alumni from ${uni} working in your target role or industry. Real conversations with real graduates, not generic testimonials.`,
  },
  {
    Icon: Compass,
    title: 'Free Career Transition Call',
    body: () =>
      '30-minute planning call to map your current role to your target role. Works for career switchers, returning professionals, and fresh grads choosing a first specialisation.',
  },
  {
    Icon: Network,
    title: 'Community Access',
    body: () =>
      'Invite to the EdifyEdu alumni LinkedIn circle, monthly virtual events with industry speakers, and niche WhatsApp groups for your chosen stream.',
  },
  {
    Icon: Briefcase,
    title: 'Monthly Job Referrals',
    body: () =>
      'Curated openings from our partner network emailed monthly. Filtered by your role, experience, and location preferences collected on enrolment.',
  },
]

export default function BeyondAdmissionSection({ cleanName }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#F4A024' }}>
        EdifyEdu Network
      </div>
      <h2 className="text-lg font-bold mb-1" style={{ color: '#0B1533' }}>
        Beyond Admission: Your EdifyEdu Network
      </h2>
      <p className="text-sm text-slate-500 mb-5">
        What you get from EdifyEdu after you enrol. This is where we go beyond comparison.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {OFFERS.map(({ Icon, title, body }) => (
          <div
            key={title}
            className="beyond-card rounded-xl border border-slate-200 p-6"
            style={{ transition: 'border-color 200ms ease, transform 200ms ease' }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <Icon size={20} style={{ color: '#B45309' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0B1533', marginBottom: 8, lineHeight: 1.3 }}>
              {title}
            </h3>
            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.65 }}>
              {body(cleanName)}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-5 text-center">
        All four offerings are included. No additional charges. Your admission at {cleanName} triggers these automatically.
      </p>

      <style>{`
        .beyond-card:hover {
          border-color: rgba(244,160,36,0.35) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  )
}
