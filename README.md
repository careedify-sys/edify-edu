# EdifyEdu.in — Next.js Project

**India's honest guide to UGC DEB approved online degrees.**

## 🚀 Quick Start (5 minutes to live)

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 3. Deploy to Vercel (one click)
```bash
npm install -g vercel
vercel
```
Or connect your GitHub repo on vercel.com — auto-deploys on every push.

---

## 📁 Project Structure

```
edifyedu/
├── app/
│   ├── layout.tsx          # Root layout — Navbar + Footer on all pages
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles + Google Fonts
│   ├── universities/
│   │   ├── page.tsx        # University listing with filters
│   │   └── [id]/
│   │       └── page.tsx    # Individual university page (dynamic route)
│   ├── compare/
│   │   └── page.tsx        # Side-by-side comparison tool
│   ├── programs/
│   │   └── page.tsx        # Programs guide (MBA, MCA, etc.)
│   ├── guides/
│   │   └── page.tsx        # Honest guides (validity, govt jobs, etc.)
│   └── admin/
│       └── page.tsx        # Admin panel (password protected)
├── components/
│   ├── Navbar.tsx          # Navbar with upGrad-style mega menu ✨
│   ├── Footer.tsx          # Footer
│   └── UniversityCard.tsx  # Reusable university card
├── lib/
│   └── data.ts             # ALL university data — edit here
├── public/                 # Static assets
├── package.json
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

---

## ✏️ Adding a New University

Open `lib/data.ts` and add to the `UNIVERSITIES` array:

```typescript
{
  id: 'university-id',          // URL slug: /universities/university-id
  name: 'University Full Name Online',
  abbr: 'UNI',                  // Short name for cards
  city: 'City',
  state: 'State',
  region: 'North',              // North | South | West | East | Central
  nirf: 50,                     // NIRF rank number
  naac: 'A+',                   // NAAC grade
  ugc: true,                    // Always true for listed universities
  examMode: 'Online',           // Online | Assignment-based | Exam Centre | Hybrid
  govtRecognised: false,        // Is it valid for central govt/PSU?
  psuEligible: false,
  feeMin: 100000,               // Lowest fee in ₹ (any program)
  feeMax: 200000,               // Highest fee in ₹ (any program)
  emiFrom: 5000,                // EMI amount per month
  eligibility: '35% in graduation',
  eligibilityPct: 35,           // Number for filtering
  highlight: 'One line why students pick this',
  tagline: 'Short punchy tagline',
  description: '2-3 sentence honest description',
  forWho: ['Who should pick this', 'Second reason', 'Third reason'],
  notFor: ['Who should NOT pick this', 'Second reason'],
  programs: ['MBA', 'MCA', 'BBA'],   // Programs list
  specs: {
    'MBA': ['Finance', 'Marketing', 'HR'],
    'MCA': ['General', 'Data Science'],
  },
  fees: {
    'MBA': '₹1,80,000',
    'MCA': '₹1,50,000',
  },
  color: '#f97316',   // Hex color for card accent
}
```

---

## 🔍 SEO Strategy

Each page has full metadata. For programmatic SEO at scale:

**Pages to create (high-value, low competition):**
- `/universities/[id]` — "Is [University] UGC approved?" (already built)
- `/compare/[a]-vs-[b]` — "[Uni A] vs [Uni B] MBA" (add dynamic route)
- `/guides/is-online-mba-valid-for-govt-jobs` — High traffic, low competition
- `/guides/online-vs-distance-education-india`
- `/programs/online-mba-india` — "Best online MBA India"

**Target keywords:**
- "online MBA India UGC approved"
- "is [university] online degree valid"
- "[university A] vs [university B] online MBA"
- "online degree for government jobs India"

---

## 🎨 Design System

- **Primary:** Orange (#f97316)
- **Dark:** Slate (#0f172a)
- **Font Display:** Sora (headings)
- **Font Body:** Plus Jakarta Sans (body text)
- **Tailwind** for all styling

---

## 📧 Contact

edifyedu.in


## OG Image Optimisation (Required Before Launch)
The current `public/og.png` is 281KB. Compress it before launch:
```bash
# Using squoosh CLI
npx @squoosh/cli --webp '{quality:85}' --resize '{width:1200}' public/og.png
# Or use: https://squoosh.app (drag og.png, export as WebP, target <80KB)
```
