'use client'

import { getSampleDegree } from '@/lib/sample-degrees'
import RequestSampleCertCard from './RequestSampleCertCard'

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
        UGC DEB approved online degrees are legally equivalent to on-campus degrees and valid for private sector employment and government roles where UGC DEB is accepted.
      </p>

      {degPath ? (
        <figure className="flex flex-col items-center gap-3">
          <figcaption className="text-sm font-semibold text-slate-600 text-center">
            Sample {program} Degree Certificate from {universityName}
          </figcaption>
          <div
            className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 p-4"
            style={{ maxWidth: 480, width: '100%' }}
          >
            <img
              src={degPath}
              alt={`${universityName} ${program} sample degree certificate`}
              className="max-h-72 object-contain w-full"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        </figure>
      ) : (
        <RequestSampleCertCard universityName={universityName} />
      )}
    </section>
  )
}
