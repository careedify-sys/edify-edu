// /refer: the public referral form linked from WhatsApp referral campaigns.
// Not indexed, not in the sitemap, not linked from the site navigation.
// Closed (404) until the disclosure sentence is set in wa_settings (Q55).
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ReferForm from './ReferForm'
import { referralStore } from '@/lib/referrals/refer-store'
import { universityOptions } from '@/lib/referrals/uni-options'
import { PROGRAMME_OPTIONS, TERMS_VERSION } from '@/lib/referrals/refer-rules'
import { REFERRAL_TERMS, REFERRAL_PRIVACY } from '@/lib/referrals/terms'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Refer a friend',
  description: 'Refer a friend to Edify for independent guidance on online degrees.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
}

export default async function ReferPage() {
  let disclosure = ''
  try { disclosure = await referralStore().disclosure() } catch { disclosure = '' }
  if (!disclosure) notFound()

  return (
    <div className="bg-[#f1f5f9] min-h-screen">
      <div className="bg-navy text-white py-12 border-b-4 border-[#B8892A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-[#B8892A] font-semibold tracking-wide uppercase text-xs mb-3">Edify referral</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Help a friend make the right education decision.</h1>
          <p className="text-base md:text-lg text-white/75">
            Know someone choosing an online degree? Share their details and an Edify counsellor will call them.
            Edify compares public UGC-DEB, NAAC and NIRF data, with no paid rankings.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <ol className="grid gap-3 sm:grid-cols-3 mb-8 text-sm">
          {['You share your friend’s details with their permission.', 'An Edify counsellor calls them and helps them compare options.', 'If they take admission through Edify, we contact you about the reward.'].map((t, i) => (
            <li key={i} className="bg-white rounded-xl p-4 border border-slate-200">
              <span className="inline-flex w-7 h-7 rounded-full bg-[#B8892A] text-white font-bold items-center justify-center mb-2">{i + 1}</span>
              <p className="text-slate-700">{t}</p>
            </li>
          ))}
        </ol>

        <ReferForm
          programmes={[...PROGRAMME_OPTIONS]}
          universities={universityOptions()}
          disclosure={disclosure}
          terms={REFERRAL_TERMS}
          privacy={REFERRAL_PRIVACY}
          termsVersion={TERMS_VERSION}
        />
      </div>
    </div>
  )
}
