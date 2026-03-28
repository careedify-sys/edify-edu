export const UNIVERSITY_REVIEWS: Record<string, Array<{
  name: string
  city: string
  program: string
  rating: number
  date: string
  review: string
}>> = {
  'chandigarh': [
    { name: 'Rahul Sharma', city: 'Delhi', program: 'MBA Finance', rating: 4, date: 'Joined July 2023', review: 'CU Online MBA Finance is solid value for money. LMS works fine and study material is decent. Edify helped me choose between CU and Amity based on my profile.' },
    { name: 'Priya Mehta', city: 'Chandigarh', program: 'MBA HR', rating: 5, date: 'Joined Jan 2025', review: 'Really happy with CU Online MBA HR. Got a 25% hike after completing first year. Weekend classes fit well with my job schedule.' },
    { name: 'Vikram Patel', city: 'Ahmedabad', program: 'MBA Marketing', rating: 4, date: 'Joined July 2024', review: 'Good program for working professionals. Flexible schedule and NIRF rank give confidence. No major complaints overall.' },
  ],
  'amity': [
    { name: 'Sneha Gupta', city: 'Noida', program: 'MBA Marketing', rating: 5, date: 'Joined Jan 2024', review: 'Amity brand is instantly recognised in interviews. Harvard case studies are a real bonus. Worth the higher fees for the brand value.' },
    { name: 'Ajay Verma', city: 'Lucknow', program: 'MBA Finance', rating: 4, date: 'Joined July 2023', review: 'Decent experience overall. Study material is updated and exams are online proctored which is convenient. QS ranking adds credibility.' },
    { name: 'Deepika Nair', city: 'Kochi', program: 'MBA HR', rating: 4, date: 'Joined Jan 2025', review: 'Good for working professionals. Got a promotion after the degree. Faculty is experienced but student support can be slow.' },
  ],
  'lpu': [
    { name: 'Manish Kumar', city: 'Jalandhar', program: 'MBA', rating: 4, date: 'Joined July 2024', review: 'LPU is excellent value for money. NIRF rank is impressive for what they charge. Exams are fair and LMS is easy to navigate.' },
    { name: 'Pooja Singh', city: 'Jaipur', program: 'MBA Finance', rating: 3, date: 'Joined Jan 2024', review: 'Overall okay experience. Content is good but placement support could be better. Fee is very affordable for the ranking.' },
    { name: 'Arjun Tiwari', city: 'Bhopal', program: 'MBA Marketing', rating: 4, date: 'Joined July 2023', review: 'NAAC A++ at this fee range is hard to find. Live classes are interactive and relevant. Solid program overall.' },
  ],
  'mahe-manipal': [
    { name: 'Karthik Reddy', city: 'Hyderabad', program: 'MBA', rating: 5, date: 'Joined Jan 2025', review: 'Manipal brand opened many doors for me. NIRF 14 and Coursera integration is a real differentiator. Fees are high but degree is WES recognised.' },
    { name: 'Ritu Sharma', city: 'Pune', program: 'MBA Finance', rating: 5, date: 'Joined July 2023', review: 'Excellent program without doubt. Coursera certifications add solid resume value. Employer was very impressed with Manipal name.' },
    { name: 'Sameer Khan', city: 'Mumbai', program: 'MBA Marketing', rating: 4, date: 'Joined July 2024', review: 'Live sessions are well structured and LMS is smooth. Got a better job offer after completing. More placement drives would be helpful.' },
  ],
  'nmims': [
    { name: 'Anita Desai', city: 'Mumbai', program: 'MBA', rating: 5, date: 'Joined July 2023', review: 'NMIMS name is unmatched in BFSI. Got calls from 3 banks just because of NMIMS on resume. Faculty are practising professionals, not just academics.' },
    { name: 'Rohan Joshi', city: 'Bangalore', program: 'MBA Finance', rating: 4, date: 'Joined Jan 2025', review: 'Very focused and career oriented program. Strict exams maintain the quality standard. NAAC A++ accreditation is well deserved.' },
    { name: 'Kavya Menon', city: 'Chennai', program: 'MBA Marketing', rating: 4, date: 'Joined Jan 2024', review: 'Faculty interaction is more than other online programs I looked at. Assignments are genuinely challenging. Very neutral counselling from Edify, no pushing.' },
  ],
  'symbiosis': [
    { name: 'Nikhil Deshmukh', city: 'Pune', program: 'MBA', rating: 5, date: 'Joined Jan 2024', review: 'Symbiosis brand name carries a lot in Maharashtra. Zero exams policy is a huge relief for working professionals. NAAC A++ and NIRF 19 speaks for itself.' },
    { name: 'Swati Joshi', city: 'Mumbai', program: 'MBA Finance', rating: 4, date: 'Joined July 2024', review: 'No exam stress is a big plus. Content is industry relevant and faculty are approachable. Degree is well recognised in financial services sector.' },
    { name: 'Rajan Kulkarni', city: 'Nagpur', program: 'MBA HR', rating: 4, date: 'Joined July 2023', review: 'Assignment based learning is more practical than exams. Symbiosis brand is respected in HR circles. Got a good lateral move after completing.' },
  ],
  'jain': [
    { name: 'Sowmya Rao', city: 'Bangalore', program: 'MBA', rating: 4, date: 'Joined July 2024', review: 'JAIN Online is a solid choice for Bangalore students. NAAC A++ and NIRF 62 gives credibility. LMS is smooth and user friendly.' },
    { name: 'Prashanth Kumar', city: 'Mysore', program: 'MBA Finance', rating: 4, date: 'Joined Jan 2025', review: 'Good program with helpful faculty. Degree accepted by employer without any questions. Fees are reasonable for a NAAC A++ institution.' },
    { name: 'Divya Krishnamurthy', city: 'Chennai', program: 'MBA Marketing', rating: 3, date: 'Joined Jan 2024', review: 'Average to decent experience. Study material could be more detailed in some subjects. Placement support is basic but degree validity is fine.' },
  ],
}

export const GENERIC_REVIEWS = [
  { name: 'Suresh Yadav', city: 'Delhi', program: 'MBA', rating: 4, date: 'Joined Jan 2024', review: 'Good online MBA overall. Flexibility to study while working is the biggest advantage. UGC DEB approval gives full confidence on degree validity.' },
  { name: 'Meera Krishnan', city: 'Bangalore', program: 'MBA Finance', rating: 4, date: 'Joined July 2023', review: 'Decent program with solid study material. NAAC accreditation confirms quality. Got a salary hike after completing the degree.' },
  { name: 'Amit Saxena', city: 'Lucknow', program: 'MBA Marketing', rating: 3, date: 'Joined July 2024', review: 'Overall satisfactory experience. Exams are fair and degree is recognised by my employer. Would check NIRF rank carefully before choosing.' },
]
