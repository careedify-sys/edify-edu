'use client'

import { getSampleDegree } from '@/lib/sample-degrees'
import { Award } from 'lucide-react'

interface Props {
  universityId: string
  program: string
  universityName: string
}

export default function SampleCertificate({ universityId, program, universityName }: Props) {
  const degPath = getSampleDegree(universityId, program.toLowerCase())

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold mb-2" style={{ color: '#0B1533' }}>How Your Degree Will Look</h2>
      <p className="text-sm text-slate-500 mb-4">
        This is an indicative sample. The actual certificate is identical to an on-campus degree issued by {universityName}.
      </p>

      {degPath ? (
        <figure className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 p-4 flex justify-center">
          <img
            src={degPath}
            alt={`${universityName} ${program} sample degree certificate`}
            className="max-h-72 object-contain w-full"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <figcaption className="sr-only">Sample {program} degree certificate from {universityName}</figcaption>
        </figure>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-10 flex flex-col items-center text-center gap-3">
          <Award size={40} className="text-slate-300" />
          <p className="text-sm text-slate-400">
            Sample certificate for {universityName} {program} — available on request during counsellor call.
          </p>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-3">
        UGC DEB approved. Degree is valid for private sector employment, government jobs (where UGC DEB approved), and further studies.
      </p>
    </section>
  )
}
