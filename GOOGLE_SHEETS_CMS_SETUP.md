# 📊 Edify CMS — Google Sheets Setup Guide

## Overview
This guide will help you set up Google Sheets as a CMS to manage:
- Universities (fees, NIRF, NAAC, programs)
- Program details (specializations, syllabus)
- Blog posts
- Guides
- University logos
- Site configuration

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: **"Edify CMS"**

---

### Step 2: Add Google Apps Script

1. In your sheet, go to **Extensions → Apps Script**
2. Delete any existing code
3. Copy the entire contents from: `scripts/google-apps-script.js`
4. Paste into the Apps Script editor
5. Click **Save** (💾 icon or Ctrl+S)
6. Name the project: **"Edify CMS Backend"**

---

### Step 3: Build CMS Template

1. In Apps Script, select function: **`buildCMSTemplate`** from dropdown
2. Click **Run** (▶️ button)
3. Authorize when prompted (Review permissions → Allow)
4. This creates 9 sheets automatically:
   - 📊 Universities
   - 📚 Programs
   - 📖 Syllabus
   - ✍️ Blog Posts
   - 🗺️ Guides
   - 🖼️ Logos
   - 🌐 Site Config
   - 📋 Page Registry
   - Edify Leads

---

### Step 4: Deploy as Web App

1. In Apps Script, click **Deploy → New deployment**
2. Click the gear icon ⚙️ → Select **Web app**
3. Configure:
   - Description: `Edify CMS v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/ABC123.../exec`)

---

### Step 5: Set Secrets

1. Back in Apps Script, run **`setSecret`** function
2. Enter a strong secret (e.g., `edify-cms-2026-xyz`)
3. Save this — you'll need it for Vercel

4. Run **`setRevalidateSecret`** function
5. Enter another secret for cache revalidation
6. Save this too

---

### Step 6: Configure Vercel Environment Variables

In your Vercel project settings, add:

```env
NEXT_PUBLIC_CMS_SHEET_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
CMS_SHEET_SECRET=your-cms-secret-here
REVALIDATE_SECRET=your-revalidate-secret-here
```

---

## 📋 Sheet Column Reference

### 📊 Universities Sheet

| Column | Required | Example | Notes |
|--------|----------|---------|-------|
| ID | ✅ | `jain` | URL-safe slug, lowercase |
| University Full Name | ✅ | `JAIN (Deemed-to-be University)` | Full official name |
| Abbreviation | | `JUJOD` | Short code for cards |
| City | | `Bangalore` | |
| State | | `Karnataka` | |
| NIRF Rank | | `62` | Leave empty or use 999 if not ranked |
| NIRF Management Rank | | `45` | Category-specific rank |
| NAAC Grade | ✅ | `A++` | A++, A+, A, B++, B+, B |
| Programs Offered | ✅ | `MBA, MCA, BBA, BCA` | Comma-separated |
| Region | ✅ | `South` | North, South, East, West, Central |
| Fee Min ₹ | | `60000` | Number only, no commas |
| Fee Max ₹ | | `280000` | Number only |
| EMI From ₹/month | | `2500` | Minimum EMI amount |
| Approvals | | `UGC DEB, NAAC, AICTE` | Comma-separated |
| Highlight Badge | | `NIRF #62 · NAAC A++` | Shown on cards |
| Brand Color | | `#1B4FBE` | Hex code |
| Status | | `active` | active, inactive, draft |

### 📚 Programs Sheet

| Column | Required | Example |
|--------|----------|---------|
| University ID | ✅ | `jain` |
| Program | ✅ | `MBA` |
| Specialisations | | `Finance, Marketing, HR, Data Analytics` |
| Fee Range | | `₹1.2L – ₹2.8L` |
| Duration | | `2 Years` |
| Avg Salary | | `₹6L – ₹18L` |
| Entry Roles | | `Manager, Analyst, Consultant` |
| Top Companies | | `Deloitte, TCS, Infosys` |

### 📖 Syllabus Sheet

| Column | Required | Example |
|--------|----------|---------|
| University ID | ✅ | `jain` |
| Program | ✅ | `MBA` |
| Specialisation | | `Finance` (leave empty for core) |
| Semester 1 | | `Subject 1 \| Subject 2 \| Subject 3` |
| Semester 2 | | `Subject 1 \| Subject 2 \| Subject 3` |
| Semester 3 | | `Subject 1 \| Subject 2 \| Subject 3` |
| Semester 4 | | `Subject 1 \| Subject 2 \| Subject 3` |

**Note:** Use pipe `|` to separate subjects within a semester.

### 🖼️ Logos Sheet

| Column | Required | Example |
|--------|----------|---------|
| University ID | ✅ | `jain` |
| Logo URL | ✅ | `https://drive.google.com/uc?id=FILE_ID` |
| Status | | `active` |

**Logo URL Tips:**
- Upload to Google Drive
- Right-click → Share → Anyone with link
- Change URL from: `https://drive.google.com/file/d/FILE_ID/view`
- To: `https://drive.google.com/uc?id=FILE_ID&export=download`

---

## 🔄 Syncing Data to Website

### Option 1: Admin Panel (Recommended)

1. Go to `https://edifyedu.in/admin/cms`
2. Enter admin password
3. Click **Fetch from Sheet**
4. Review validation results
5. Click **Sync to Live**

### Option 2: Direct API Call

```bash
curl -X POST https://edifyedu.in/api/cms/sync \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-cms-secret"}'
```

### Option 3: From Google Sheet

1. In your sheet, go to **🎓 Edify CMS** menu
2. Click **🔄 Revalidate All Pages**

---

## 📝 Adding a New University

1. Open **📊 Universities** sheet
2. Add a new row with:
   - **ID**: `new-university` (lowercase, hyphens only)
   - **University Full Name**: `New University Online`
   - **Programs Offered**: `MBA, MCA`
   - **NAAC Grade**: `A+`
   - **Region**: `North`
   - Fill other columns as needed

3. Open **📚 Programs** sheet
4. Add rows for each program:
   - University ID: `new-university`
   - Program: `MBA`
   - Specialisations: `Finance, Marketing, HR`

5. Open **🖼️ Logos** sheet
6. Add logo:
   - University ID: `new-university`
   - Logo URL: `https://...`

7. Go to `/admin/cms` → **Sync to Live**

---

## ✏️ Updating Existing Data

1. Find the row in the relevant sheet
2. Edit the values directly
3. Go to `/admin/cms` → **Sync to Live**
4. Or use menu: **🎓 Edify CMS → 🔄 Revalidate All Pages**

---

## 🐛 Troubleshooting

### "Unauthorized" Error
- Check `CMS_SHEET_SECRET` in Vercel matches the secret you set in Apps Script
- Run `setSecret()` again in Apps Script

### Data Not Updating
- Clear browser cache
- Wait 60 seconds for ISR cache to expire
- Force revalidate via admin panel

### Validation Errors
- Check the error messages in admin panel
- Common issues:
  - Missing required fields (ID, Name, NAAC, Region, Programs)
  - Duplicate IDs
  - Invalid NAAC grade format
  - Fee Min > Fee Max

### Logo Not Showing
- Ensure Google Drive sharing is set to "Anyone with link"
- Use direct download URL format: `https://drive.google.com/uc?id=FILE_ID`

---

## 📊 Sample Data

### Universities Sheet Example

| ID | University Full Name | Abbreviation | NAAC Grade | Programs Offered | Region | Fee Min ₹ | Fee Max ₹ | Highlight Badge |
|----|---------------------|--------------|------------|------------------|--------|-----------|-----------|-----------------|
| jain | JAIN (Deemed-to-be University) | JUJOD | A++ | MBA, MCA, BBA, BCA | South | 60000 | 280000 | NIRF #62 · NAAC A++ |
| amity | Amity University Online | AUO | A+ | MBA, MCA, BBA, BCA | North | 60000 | 200000 | NAAC A+ · QS Ranked |
| lpu | Lovely Professional University Online | LPUO | A++ | MBA, MCA, BBA, BCA | North | 60000 | 200000 | NAAC A++ · THE Ranked |

### Programs Sheet Example

| University ID | Program | Specialisations | Fee Range | Duration | Avg Salary |
|--------------|---------|-----------------|-----------|----------|------------|
| jain | MBA | Finance, Marketing, HR, Business Analytics, Data Science | ₹1.2L – ₹2.8L | 2 Years | ₹6L – ₹18L |
| jain | MCA | Cloud Computing, AI & ML, Data Science, Cyber Security | ₹1L – ₹2L | 2 Years | ₹5L – ₹15L |
| jain | BBA | General Management, Finance, Marketing, HR | ₹80K – ₹1.5L | 3 Years | ₹3L – ₹8L |

---

## 🔐 Security Notes

1. **Never share** your CMS_SHEET_SECRET publicly
2. **Never commit** .env files to Git
3. The Apps Script is deployed with "Anyone" access but writes are protected by secret
4. Lead data is stored in a separate sheet (Edify Leads) and never exposed via API

---

## 📞 Need Help?

- Check `/admin/cms` for validation errors
- Review Apps Script execution logs: Apps Script → Executions
- Contact: hello@edifyedu.in
