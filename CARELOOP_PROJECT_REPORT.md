# CARELOOP — Care Continuity Intelligence Platform
## Complete Project Architecture, Design, and Implementation Report

---

### Executive Overview

**CARELOOP** is a clinical care-continuity intelligence platform created to resolve a major systemic flaw in modern healthcare delivery: **the silent breakdown of multi-provider care journeys**.

> **Platform Thesis:**  
> *"The primary failure mode in complex patient care is not missed appointments. Patients attend visits and undergo diagnostics, but their longitudinal treatment plan breaks silently between hospitals, diagnostic laboratories, and specialists. CARELOOP sees the journey, detects the break, and closes the loop."*

---

## 1. System Identity & Safety Principles

1. **Non-Diagnostic Nature**: CARELOOP never diagnoses illnesses or prescribes medication. It is a workflow telemetry and process-integrity engine.
2. **Never Assume Patient Default**: A missing follow-up record does not imply that the patient missed their care. Statuses are categorized rigorously as `Verified`, `Unverified`, `Pending`, and `Unknown`.
3. **Cross-Facility Patient Consent**: Records moving between Hospital A and Hospital B require explicit patient-controlled cryptographic authorization tokens (`#AUTH-xxxx`).
4. **Deterministic Gap Confidence**: Confidence scores (e.g., 94%) calculate the mathematical strength of available evidence proving that a process step broke—they do **not** indicate clinical health risk.

---

## 2. Technical Stack & Engineering Specifications

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, Vite 8 |
| **Styling & Design System** | Tailwind CSS (Tailored healthcare palette: `#fbfcff` Bone White, `#0f172a` Navy, `#e84343` Coral, `#0d9488` Clinical Teal) |
| **Icons & Visuals** | Lucide React, Organic SVG Blobs |
| **Application State** | React Context (`AppContext.jsx`) with dual-engine sync (Supabase Cloud + Local In-Memory Fallback) |
| **Cloud Database** | **Supabase** (PostgreSQL 15, Row Level Security, Custom Triggers, Stored Procedures) |
| **Production Deployment** | **Vercel** with GitHub CI/CD automation |
| **Repository** | `https://github.com/rajatsinghbhau/CareLoop.git` |

---

## 3. Database Schema Design (Supabase)

The cloud database is structured across **16 normalized tables**:

- **`user_profiles`**: Role-based identities (`PATIENT`, `DOCTOR`, `ADMIN`, `COORDINATOR`).
- **`patients`**: Core demographic and clinical continuity metadata (e.g. Rahul Sharma `P-1001`, phone `+91 6006853510`).
- **`doctors` & `care_coordinators`**: Attending clinicians across affiliated healthcare networks.
- **`care_events`**: 9-stage staff-facing chronological event records.
- **`journey_events`**: Patient-portal-facing milestones (`Consultation ✓ → Diagnostic ✓ → Result ✓ → Doctor Review ✓ → Referral ✓ → Specialist ✓ → Follow-up ⚠ → Closure ○`).
- **`care_gaps`**: Identified continuity failures, confidence scores (e.g. 94%), priority tags, and current statuses.
- **`gap_evidence`**: Checklist verification items validating each care gap.
- **`gap_resolutions`**: Audit log recording how each gap was resolved (`SELF_VERIFIED`, `EXTERNAL_PROVIDER`, `UNSURE`).
- **`reports`**: Clinical investigation documents (HbA1c, Complete Blood Count, Lipid Profile, Specialist Report).
- **`appointments`**: Scheduled upcoming visits and completed historical consultations.
- **`shared_records`**: Inter-facility record-sharing permissions with explicit patient consent tracking.
- **`record_access_log`**: HIPAA/GDPR audit trail logging who accessed which document and when.
- **`activity_log`**: Real-time event log for clinical coordinators.
- **`assistant_conversations` & `assistant_messages`**: Patient Care Assistant message threads and guidance answers.

---

## 4. Key Functional Capabilities

### A. The Signature Care Continuity Map™
- Visualizes provider swimlanes: **Hospital A** (Primary facility) vs. **Hospital B** (Referred specialist clinic).
- Highlights the exact transition point where care was authorized by the patient and where continuity failed.
- Interactive contextual rail displaying deterministic reasons, clinical timeline, and one-click outreach tools.

### B. Production Patient Dashboard (Rahul Sharma)
- **Top Summary Cards**: Journey Progress (78%), Pending Actions (1), Verified Reports (4), Next Appointment (18 Oct).
- **Interactive Care Gap Card**: Prominently displays the 94% confidence follow-up gap with options:
  - *I completed it* $\rightarrow$ Live animates to 100% Care Closure.
  - *I completed it elsewhere* $\rightarrow$ Captures outside provider, date, file, and consent token.
  - *I'm not sure* $\rightarrow$ Flags status as `Unknown` without penalty.
- **Embedded Medical PDF Report Viewer**: Realistic lab report reader rendering comprehensive test parameters, reference intervals, observed values, flags, specimen data, and pathologist signature.
- **AI Care Continuity Assistant**: Answers questions regarding next steps, reason for pending records, and appointment schedules with built-in non-diagnostic clinical disclaimers.

### C. Clinical Staff Action Center & Telemetry
- Multi-specialty patient register (Diabetes, Cardiology, Oncology, Pulmonology).
- Task Center with actionable follow-up and doctor review queues.
- Interactive contact modal allowing coordinators to reach patients via **Phone Call**, **SMS**, **Email**, or **In-Person** outreach.
- CSV ingestion and telemetry analytics for hospital network leadership.

### D. Strict Role-Based Dashboard Isolation
- **Patients** are strictly confined to their personal patient dashboard and cannot view other patients or hospital administrative panels.
- **Doctors & Admins** have dedicated clinical continuity map and registry views without access to private patient portals.

---

## 5. Judge Presentation Demo Script (3 Minutes)

1. **Minute 0:00 – The Hook**:
   *“Judges, when you open CARELOOP, you don’t see a generic table of patient numbers. You see an immediate answer to one question: Where is this patient's care journey right now—and where did it break?”*
2. **Minute 0:45 – The Break Detection**:
   *Show Rahul Sharma’s journey across Hospital A and Hospital B. Highlight Step 7 of 8: specialist visit completed, but follow-up missing with 94% gap confidence.*
3. **Minute 1:30 – The Patient Experience**:
   *Open the Patient Dashboard. Show the verified HbA1c medical PDF report. Click 'I completed it' on the Care Gap card to demonstrate the live transition from 78% Action Needed to 100% Care Closed.*
4. **Minute 2:15 – Inter-Provider Trust & Security**:
   *Show the cross-facility authorization token and the Access & Privacy Audit Log proving that records only travel with explicit patient consent.*
5. **Minute 2:45 – The Closing**:
   *“CARELOOP is deterministic, cloud-connected with Supabase, safe, and ready for deployment across modern hospital networks.”*
