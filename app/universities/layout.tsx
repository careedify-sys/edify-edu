// app/universities/layout.tsx
// SEO metadata for the Universities Listing page
import type { Metadata } from 'next'

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
    { '@type': 'ListItem', position: 2, name: 'Universities', item: 'https://edifyedu.in/universities' },
  ],
}

export const metadata: Metadata = {
  title: '125+ UGC Approved Online Universities India 2026',
  description: 'Compare 125+ UGC DEB approved online universities in India 2026. Filter by NIRF rank, NAAC grade, program, fees & region. All independently verified.',
  keywords: 'best online universities india 2026, ugc deb approved universities list, nirf ranked online universities, online university comparison india, naac a++ online university, amity online mba, amity university online mba, chandigarh university mba fees, chandigarh university online, manipal university online, manipal online mba, jain university mba fees, jain online mba, dy patil online mba, symbiosis online mba, nmims online mba, lpu online mba, manipal jaipur mba fees, parul university mba fees, amrita university mba fees, liba chennai, loyola institute of business administration, bharati vidyapeeth mba fees, symbiosis distance learning, amity mba fees, dy patil mba fees, chandigarh university online mba, amity university noida mba fees, manipal university jaipur mba fees, jain university online mba, chandigarh university fee structure, amity university mba, chandigarh university mba, sikkim manipal university distance mba fees, nmims online mba reviews, amity noida mba fees, amity noida mba, amity noida bba, amity noida bba fees, amity university noida bba fees, amity bba fees noida, amity bba course, amity bba, amity mba fee structure, amity distance learning, amity executive mba, amity university mba admission, amity online fees, amity university online bba, amity university online mca, amity university online mca fees, amity online mca fees, amity mca online, amity mca, amity university online bca fees, amity university degree, amity course fee, amity university courses fees, amity university chennai fees, amity online admission, amity university online application, amity university online admission, amity university kolkata bba fees, amity university lucknow bba fees, amity university mumbai bba fees, amity university ahmedabad bba fees, amity university ahmedabad mba fees, amity jaipur bba fees, amity raipur bba fees, amity kolkata bba fees, amity kolkata bba, amity university kolkata bba, amity lucknow bba fees, amity mumbai bba fees, amity online ba, amity university online degree, amity university patna bba fees, amity login online, amity distance, amity noida distance mba, amity university distance mba fees, amity university mba fees and placement, amity university noida mba fees and placement, amity online mba login, amity fee structure for bba, amity university bba course fees, amity university bca course fee, amity university hotel management fee structure, online amity university, www amity university online com, amity university mba online, manipal university jaipur bba, manipal university jaipur bca, manipal university jaipur mca fees, manipal university bba fees, manipal university bca fees, manipal mca, manipal bca, manipal distance mba, manipal mba, manipal courses, manipal university jaipur online, manipal university jaipur reviews, manipal university bcom fees, manipal university online certificate courses, manipal university postgraduate courses, manipal university bba, manipal university distance mba, manipal university mca fees, manipal mca fees, manipal university mca, manipal mba online, manipal university jaipur mba, manipal university jaipur bcom fees, sikkim manipal university hyderabad, sikkim manipal university in hyderabad, manipal university online courses, nmims pune mba fees, nmims nagpur, nmims noida, nmims bangalore campus, nmims executive mba fees, nmims data science, nmims digital marketing course, nmims university bangalore, nmims admission helpline, nmims vs symbiosis, nmims latest news, symbiosis university mba fees, symbiosis pune online mba, symbiosis school of distance learning, sibm online mba, symbiosis part time mba, ssodl symbiosis, symbiosis open university, is symbiosis good for mba, 1 year executive mba from symbiosis fees, symbiosis pune mba distance learning, symbiosis online mba courses, symbiosis diploma courses, dy patil bba pune, dy patil bba mumbai, dy patil bba, dy patil mca, dy patil courses, dy patil mba admission, dy patil distance mba, dy patil executive mba, dy patil pune mba placements, dy patil vidyapeeth, dpu mba, dpu mba fees, dpu pune mba fees, dpu online, dy patil lohegaon mba, dy patil pune mba, dayananda sagar university mba fees, dayananda sagar mba, dayananda sagar mba fees, dayananda sagar college of mba, dayananda sagar university mba, dayananda sagar university location, dayananda sagar bca fees, dayananda sagar mba college bangalore, dsu executive mba, dayananda sagar admission, dayananda sagar degree college, daya sagar university, dayananda university, mgr university mba, mgr university distance education, dr mgr university mba fees structure, dr mgr university distance education, mgr university mba fees, mgr university mba fees structure, parul university admission fee, parul university bba admission, parul university mca syllabus, courses in parul university, mba fees in parul university, mba parul university fees, mba parul university, amrita vishwa vidyapeetham mba fees, amrita vishwa vidyapeetham mba, amrita vishwa vidyapeetham chennai reviews, amrita mba fees, amrita mba admission, amrita coimbatore mba, amrita university bangalore mba, amrita application fee, amrita university mba, liba mba fees structure, liba fees, liba admission, liba mba, liba college, loyola liba, liba chennai fees structure, liba chennai fees, liba mba fees, pgdm liba, jain mba fees, jain mba, jain university mba, jain university mba fee structure, jain college mba, mba fees in jain university, chandigarh university reviews, is manipal university jaipur fake, is manipal jaipur good, is chandigarh university good for mba, chandigarh university mba fees structure, chandigarh university distance mba, chandigarh university degree, chandigarh university mba fees per semester, fees of mba in chandigarh university, chandigarh university fees for mba, mba in chandigarh university fees, mba fees chandigarh university, mba chandigarh university fees, mba courses in chandigarh university, chandigarh online, cu online classes, chandigarh university distance mba fees, chandigarh university online courses, manipal university jaipur fees for bba, manipal university jaipur bba fees, imt ghaziabad bba, imt online mba, imt online, imt courses, imt executive mba, mahe mba, mahe online mba, mahe online, mahe counselling, nmims hyderabad logo, sjmsom fees, amrita university coimbatore review, bharati vidyapeeth mba fees structure, bhartiya vidya peeth mba fees, nmims pune mba fees, amrity mba noida, amrita vishwa vidyapeetham mba, amrita university mba fees',
  alternates: { canonical: 'https://edifyedu.in/universities' },
  openGraph: {
    title: '125+ UGC Approved Online Universities India 2026',
    description: 'Compare UGC DEB approved online universities in India. NIRF rankings, NAAC grades, fees from ₹40K. July 2026 batch open.',
    url: 'https://edifyedu.in/universities',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Compare Online Universities India 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '125+ UGC Approved Online Universities India 2026',
    description: 'Compare UGC DEB approved online universities in India. NIRF rankings, NAAC grades, fees from ₹40K.',
    images: ['https://edifyedu.in/og.webp'],
  },
  robots: { index: true, follow: true },
}

export default function UniversitiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  )
}
