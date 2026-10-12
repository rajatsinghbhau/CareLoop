# CARELOOP — Care Closure Platform

> **Closing the Gap Between Appointments and Care**

CARELOOP is a healthcare care-gap detection and care-closure platform built for hackathon demonstration. It detects broken clinical workflow loops and routes them to the appropriate staff for resolution.

---

## 🚀 Quick Start

```bash
cd careloop
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🔐 Demo Accounts

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Admin** | `admin` | `admin123` | Full access — all patients, analytics, import |
| **Doctor** | `doctor` | `doctor123` | Assigned patients, review, care events |
| **Coordinator** | `coordinator` | `coord123` | Open gaps, task center, patient contact |

---

## 🏥 What CARELOOP Detects

CARELOOP's **Care Gap Engine** runs a deterministic rule-based analysis across every patient's care workflow:

```
CONSULTATION ✓
      ↓
TEST ORDERED ✓
      ↓
TEST COMPLETED ✓
      ↓
RESULT AVAILABLE ✓
      ↓
DOCTOR REVIEW ✗   ← GAP DETECTED (HIGH PRIORITY, 94% confidence)
      ↓
FOLLOW-UP  —
      ↓
CARE NOT CLOSED
```

### Gap Types Detected

| Gap Type | Trigger |
|----------|---------|
| `RESULT_NOT_REVIEWED` | Result available but doctor review pending |
| `TEST_NOT_COMPLETED` | Test ordered but not completed within threshold |
| `RESULT_PENDING` | Test done but no result in system |
| `REFERRAL_PENDING` | Referral initiated but not confirmed |
| `FOLLOW_UP_OVERDUE` | Follow-up scheduled but not attended |
| `CARE_LOOP_UNCLOSED` | All steps done but care not formally closed |
| `MISSING_EVENT` | A required workflow event has no record |

---

## 🧠 Care Gap Engine

The engine is **100% deterministic and rule-based** — it does not use AI for primary gap detection.

Every gap includes:
- **Reason**: Plain English explanation of why a gap was detected
- **Priority**: HIGH / MEDIUM / LOW with explicit justification  
- **Confidence Score**: 0–100% based on data completeness
- **Dependency Analysis**: Which upstream events are verified

### Safety Principle

> CARELOOP identifies potential workflow gaps for staff verification.  
> It does **not** make clinical decisions.  
> Low-confidence gaps (< 70%) are flagged for mandatory human verification.

---

## 📋 Application Pages

| Page | Description |
|------|-------------|
| **Login** | Demo account quick-login with care journey preview |
| **Dashboard** | Key metrics, open gaps table, care journey chart, activity log |
| **Patient List** | Searchable/filterable table with gap indicators |
| **Patient Details** | Care Closure Graph, gaps, timeline, patient info |
| **Care Gaps** | All gaps with filtering by priority/type and detail modal |
| **Task Center** | Action list for coordinators: contact, escalate, complete |
| **Analytics** | Charts: workflow funnel, priority breakdown, gap distribution |
| **CSV Import** | Drag-and-drop CSV with preview and template download |
| **Demo Mode** | Step-by-step animated scenario walkthroughs |
| **Settings** | Profile, role permissions, engine thresholds |

---

## 📂 Project Structure

```
src/
├── context/
│   └── AppContext.jsx        # Global state management
├── data/
│   └── patients.js           # Synthetic patient data (10 patients)
├── engine/
│   └── careGapEngine.js      # Rule-based gap detection engine
├── components/
│   ├── CareClosureGraph.jsx  # Core visual: interactive workflow graph
│   └── shared/
│       ├── UI.jsx            # Reusable components
│       └── Navigation.jsx    # Sidebar + topbar + notifications
└── pages/
    ├── LoginPage.jsx
    ├── DashboardPage.jsx
    ├── PatientListPage.jsx
    ├── PatientDetailsPage.jsx
    ├── CareGapsPage.jsx
    ├── TaskCenterPage.jsx
    ├── AnalyticsPage.jsx
    ├── CsvImportPage.jsx
    ├── DemoSimulationPage.jsx
    └── SettingsPage.jsx
```

---

## 🎨 Tech Stack

- **React 19** + Vite
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **Recharts** (analytics charts)
- **Lucide React** (icons)

## ⚡ Build for Production

```bash
npm run build
```

Outputs to `dist/` — ready for deployment.

---

*All patient data is synthetic. CARELOOP does not process or store real patient information.*
