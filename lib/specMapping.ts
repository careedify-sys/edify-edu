// lib/specMapping.ts — Canonical spec name mapping for filter chips
// Handles naming variance across universities (e.g., "HR Management" vs "Human Resource Management")

export const specMapping: Record<string, string[]> = {
  'Finance': ['Finance', 'Financial Management', 'Finance Management'],
  'Human Resources': ['Human Resource Management', 'HR Management', 'Human Resource', 'Human Resources', 'Strategic Human Resource Management'],
  'Marketing': ['Marketing', 'Marketing Management'],
  'Business Analytics': ['Business Analytics', 'Data Science and Analytics', 'Business Analytics & AI'],
  'Digital Marketing': ['Digital Marketing', 'Digital Marketing Management'],
  'Operations': ['Operations Management', 'Production & Operations', 'Production & Operations Management'],
  'IT Management': ['IT Management', 'Information Technology', 'Information Technology Management', 'IT & Business Analytics', 'Information Systems', 'IT & Systems Management', 'Information System Management'],
  'Healthcare Management': ['Healthcare Management', 'Hospital & Healthcare Management', 'Hospital & Health Care Management', 'Hospital Administration & Healthcare Management', 'Healthcare and Hospital Administration', 'Hospital & Health Systems Management'],
  'International Business': ['International Business', 'International Business Management'],
  'Data Science': ['Data Science', 'Data Science & AI', 'Data Science and Analytics'],
  'Entrepreneurship': ['Entrepreneurship', 'Entrepreneurship Management'],
  'Agri Business': ['Agri Business', 'Agribusiness'],
  'Logistics & Supply Chain': ['Logistics & Supply Chain Management', 'Logistics and Supply Chain Management', 'Supply Chain Management', 'Supply Chain & Operations Management'],
  'Retail Management': ['Retail Management', 'Retail'],
  'FinTech': ['FinTech', 'FinTech Management', 'Digital Finance', 'Financial Management (FinTech Focus)'],
  'AI/Machine Learning': ['AI & ML', 'Artificial Intelligence', 'AI for Business', 'Artificial Intelligence and Machine Learning'],
  'ESG': ['ESG'],
  'Real Estate': ['Real Estate Management'],
}

export function uniHasSpec(specNames: string[], chipName: string): boolean {
  if (chipName === 'All') return true
  const variants = specMapping[chipName] || [chipName]
  return specNames.some(s =>
    variants.some(v => s.toLowerCase().includes(v.toLowerCase()))
  )
}
