// "Your UGC-DEB ID" block, rendered on every programme hub
// (/universities/{id}/{program}) directly after the ABC ID section.
// Copy from Rishi, 13 Nov 2026. Same on every hub; the only link is deb.ugc.ac.in.
// id="deb-id" is the target of first-hand FAQ links such as "How to get your DEB ID".
export default function DebIdBlock() {
  return (
    <section id="deb-id" className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>
        Your UGC-DEB ID: what it is and how to get one
      </h2>
      <p className="text-sm text-slate-700 leading-relaxed mb-3">
        Since August 2024, UGC requires every student joining an online or distance programme in India to have a DEB ID before admission. International learners are exempt. The DEB ID shows you are joining a UGC-recognised programme. It stays valid for life, and it is free.
      </p>
      <h3 className="text-base font-bold mb-2" style={{ color: '#0B1533' }}>How to get it:</h3>
      <ol className="space-y-1 pl-5 m-0 text-sm text-slate-700 leading-relaxed list-decimal">
        <li>Create your ABC ID (Academic Bank of Credits) on DigiLocker, using your Aadhaar-linked mobile number.</li>
        <li>
          Go to{' '}
          <a href="https://deb.ugc.ac.in" target="_blank" rel="noopener" className="font-semibold underline" style={{ color: '#0f172a' }}>deb.ugc.ac.in</a>
          {' '}and open the Student DEB ID page.
        </li>
        <li>Enter your ABC ID and generate your DEB ID.</li>
        <li>Save it. Your university will ask for it during admission.</li>
      </ol>
    </section>
  )
}
