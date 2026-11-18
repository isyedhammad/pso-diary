# DG Mines & Minerals – Directions, Meetings & Compliance Management Portal
### Office of the Director General, Mines & Minerals Department, Government of the Punjab, Pakistan

![Government of Punjab](https://img.shields.io/badge/Government_of_the_Punjab-Mines_%26_Minerals_Department-0c3d25?style=for-the-badge)
![Status](https://img.shields.io/badge/Executive_Monitoring-Active-emerald?style=for-the-badge)
![Cloud](https://img.shields.io/badge/Cloud_Storage-Supabase_PostgreSQL-3ecf8e?style=for-the-badge)
![Hosting](https://img.shields.io/badge/Deployment-GitHub_Pages_Live-blue?style=for-the-badge)

---

## 🏛️ Executive Overview

The **DG Directions, Meetings & Compliance Management Portal** is an executive monitoring and digital register system engineered specifically for the **Office of the Director General, Mines & Minerals Department, Government of the Punjab**.

The portal operates on the departmental lifecycle principle:
> **One meeting &rarr; One meeting record &rarr; Multiple agenda items &rarr; Multiple decisions/directions &rarr; Assigned responsibilities &rarr; Supporting documents &rarr; Compliance tracking &rarr; Closure.**

Every meeting retains an immutable historical dossier and verified supporting documentation accessible indefinitely.

---

## 🌐 Live Portal Access

**Official GitHub Pages Production Link:**  
👉 **[https://isyedhammad.github.io/pso-diary/](https://isyedhammad.github.io/pso-diary/)**

---

## 🎨 Visual & Institutional Identity

Adopting the sovereign design language of the Punjab Mines & Minerals Department:
* **Dual Institutional Crests:** Official Directorate General Crest paired alongside the State Seal of the Government of the Punjab.
* **Color Palette:** Sovereign Punjab Emerald (`#0c3d25`), Deep Executive Navy (`#0c1626`, `#080d16`), Sovereign Gold (`#c8a355`), and Charcoal.
* **Layout:** Responsive collapsible sidebar navigation, compact high-density KPI cards, accessible data tables, and dynamic status badges.

---

## 🚀 Core Functional Modules

### 1. Executive Dashboard
* **Dynamic KPI Summary:** Real-time metrics calculated directly from the database:
  - Total Meetings
  - Total Directions Issued
  - Pending Directions
  - Completed Directions
  - Overdue Directions *(evaluated dynamically against current calendar date and completion status)*
  - Directions Due This Week / Within 48 Hours
  - Compliance Awaited
  - Meetings Requiring Follow-up
* **Status Progression:** Visual distribution across *Pending*, *In Progress*, *Compliance Submitted*, *Under Review*, *Completed*, and *Overdue*.
* **Division-wise Performance:** Comparative table tracking all 9 divisions with compliance submission rates.
* **Operational Urgency:** Filterable urgent queue highlighting high-priority directives, overdue matters, and submissions awaiting DG review.
* **Activity Stream:** Chronological immutable audit feed capturing timestamps, users, actions, and remarks.

### 2. Meetings & Briefs Module
* **Independent Meeting Dossiers:** Permanent meeting records containing subject, venue, date, time, chairperson, and participating officers.
* **Dedicated Document Sections (Multi-file upload support):**
  1. *Agenda* (Official signed meeting agendas)
  2. *DG Brief* (Executive briefing documents prepared for the DG)
  3. *Presentations* (Departmental slides and drone surveys)
  4. *Supporting Data* (Reconciled spreadsheets, datasets, royalty audits)
  5. *Minutes of Meeting* (Official signed minutes)
  6. *Compliance Reports* (Subsequent field reports)
* **Direct Direction Creation:** Built-in **"Add DG Direction"** action inside the meeting page that automatically associates the new directive with the active meeting record.

### 3. DG Directions Module
* **Individual Reference IDs:** System-generated unique tracking numbers (e.g. `DIR-2026-001`).
* **Attributes:** Operative mandate, meeting reference, issuance date, responsible division, dependent field office, responsible officer, priority (High, Medium, Normal), deadline, expected deliverable, status, and remarks.
* **Lifecycle Workflow:** `Pending` &rarr; `In Progress` &rarr; `Compliance Submitted` &rarr; `Under Review` &rarr; `Completed`.
* **Supervisory Controls:** Deadline revision modal with mandatory reason recording, reminder dispatch log, and supervisory review adjudication.

### 4. Departmental Divisions & 15 Field Formations
* **9 Master Divisions:**
  1. Administration
  2. Large Scale Mining
  3. Small Scale Mining
  4. Minor Minerals
  5. Resource Mapping
  6. GIS
  7. IT
  8. Environmental Facilitation
  9. Field Offices
* **15 Field Formations (Dependent selection when Field Offices is chosen):**
  - Attock, Bahawalpur, Chakwal, Chiniot, D.G. Khan, Gujranwala, Jhelum, Khushab, Lahore Region, Mianwali, Multan, Rawalpindi, Sahiwal, Sargodha, Sialkot.
  - Multi-office selection supported for joint regional implementation.

### 5. Compliance Monitoring Module
* **Compliance Register:** Consolidated table with keyword search and filtering by division, field office, status, priority, and date.
* **Progress Submission:** Divisional officers upload reports with percentage completion (0-100%), evidence attachments, and remaining actions.
* **Adjudication Actions:**
  - *Accept Compliance* (allows marking direction completed)
  - *Return for Further Action* (requires mandatory explanatory deficiency remarks)
  - *Keep Under Review*
* **Reminders Log:** Tracks follow-up dispatches and telephonic reminders.

### 6. Centralized Documents Repository
* Global searchable index of all official documents across meetings and directions.
* Preserves relational metadata: meeting ID, direction ID, division, uploader, format (PDF, DOCX, XLSX, PPTX, Images), and upload timestamp.
* Document preview dossier and secure downloads.

### 7. Executive Reports & Analytics
* **Meeting-wise Report:** Directives generated and disposal ratios for any date range.
* **Division-wise Compliance Report:** Statistical breakdown across all 9 divisions.
* **Field Office Compliance Report:** Regional performance across the 15 formations.
* **Pending & Overdue Report:** Consolidated action roster for executive review.
* **Monthly Performance Rollup:** Multi-month trend tracking.
* **Exporting:** One-click export to Excel/CSV and printable executive PDF format.

### 8. System Settings & Cloud Database
* **Supabase Integration:** Full connectivity to PostgreSQL cloud database and private storage buckets.
* **Copy-pasteable SQL Schema:** Provided directly in the Settings tab with all 12 relational tables, foreign keys, indexes, and Row Level Security (RLS) policies.
* **User Roles Simulator:** Instantly switch between *Administrator*, *Monitoring / DG Office*, and *Division / Field Office User* to test different access levels.
* **Data Management:** Download full JSON database backups, restore backups, or reset demo data with a single click.

---

## 🗄️ Relational PostgreSQL Database Schema (Supabase)

The database architecture implements 12 relational tables:
1. `meetings`
2. `meeting_participants`
3. `divisions`
4. `field_offices`
5. `directions`
6. `direction_assignments`
7. `compliance_submissions`
8. `documents`
9. `direction_activity_logs`
10. `meeting_activity_logs`
11. `portal_users`
12. `user_roles`

The complete SQL DDL schema with RLS security policies and initial seed data is available directly in the **Settings &gt; PostgreSQL Relational Schema** tab inside the portal.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
* **Icons:** Lucide React
* **Backend & Cloud:** Supabase (PostgreSQL Database, Auth, Storage)
* **Local Fallback:** Persistent Browser Ledger with Cloud Synchronizer
* **Hosting:** GitHub Pages with automated CI/CD GitHub Actions

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/isyedhammad/pso-diary.git
cd pso-diary

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## 📍 Departmental Location

**Directorate General of Mines & Minerals**  
Mines & Minerals Department, Government of the Punjab  
Poonch House, Multan Road, Lahore, Pakistan  
*Website:* [https://mines.punjab.gov.pk](https://mines.punjab.gov.pk)
