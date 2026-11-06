// UGC Distance Education Bureau officers, copied from the official page.
// Source: https://deb.ugc.ac.in/About/Officers, checked 2026-11-06.
// UGC's own /Contact page still names a former Deputy Secretary (Dr. Salil S),
// so the Officers page is the one to trust. Re-check it before editing: officers
// move, and a stale name here sends a student's complaint to the wrong desk.

export const UGC_DEB_SOURCE_URL = 'https://deb.ugc.ac.in/About/Officers'
export const UGC_DEB_CHECKED = '6 November 2026'

export const UGC_DEB_OFFICE = {
  address: 'Distance Education Bureau, University Grants Commission, 35 Feroze Shah Road, New Delhi 110001',
  phone: '011-2360-4645',
}

export interface UgcDebOfficer {
  name: string
  designation: string
  email: string
  phones: string[]
  states: string[]
}

export const UGC_DEB_SENIOR: UgcDebOfficer[] = [
  { name: 'Dr. Madhukar Maruti Waware', designation: 'Joint Secretary', email: 'mwaware.ugc@gov.in', phones: ['011-2360-4678', '011-2360-4674'], states: [] },
  { name: 'Ms. Neethu S. Thulaseedharan', designation: 'Deputy Secretary', email: 'neethuthulasi.ugc@gov.in', phones: ['011-2360-4687'], states: [] },
]

export const UGC_DEB_STATE_OFFICERS: UgcDebOfficer[] = [
  {
    name: 'Dr. Naresh Pal Meena', designation: 'Education Officer', email: 'nmeena.ugc@gov.in', phones: ['011-2360-4694'],
    states: ['Tamil Nadu', 'Kerala', 'Karnataka', 'Lakshadweep', 'Telangana', 'Andhra Pradesh', 'Odisha', 'Chhattisgarh', 'Puducherry', 'Gujarat'],
  },
  {
    name: 'Sh. Sanjay Kumar', designation: 'Under Secretary', email: 'sanjay.ugc@nic.in', phones: ['011-2360-4660'],
    states: ['Rajasthan', 'Himachal Pradesh', 'Maharashtra', 'Arunachal Pradesh', 'Manipur', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura', 'Meghalaya', 'Daman and Diu', 'Dadra and Nagar Haveli', 'Ladakh', 'Andaman and Nicobar'],
  },
  {
    name: 'Dr. Nand Kishore', designation: 'Under Secretary', email: 'nandkishor.ugc@nic.in', phones: ['011-2360-4698'],
    states: ['Uttar Pradesh', 'Delhi', 'Uttarakhand', 'Chandigarh', 'West Bengal', 'Jammu and Kashmir', 'Madhya Pradesh', 'Jharkhand', 'Bihar', 'Punjab', 'Haryana', 'Assam', 'Goa'],
  },
]

const norm = (s: string) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/^(nct of )?new /, '').replace(/[^a-z]/g, '')

const ALIASES: Record<string, string> = {
  orissa: 'odisha',
  pondicherry: 'puducherry',
  delhincr: 'delhi',
  nctofdelhi: 'delhi',
  andamanandnicobarislands: 'andamanandnicobar',
  dadraandnagarhavelianddamananddiu: 'damananddiu',
}

/** The officer UGC-DEB assigns to a state, or null when the state is blank or unknown. */
export function ugcDebOfficerForState(state?: string | null): UgcDebOfficer | null {
  if (!state) return null
  let key = norm(state)
  key = ALIASES[key] ?? key
  return UGC_DEB_STATE_OFFICERS.find(o => o.states.some(s => norm(s) === key)) ?? null
}
