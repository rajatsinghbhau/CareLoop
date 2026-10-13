-- ============================================================
-- CARELOOP - Complete Supabase Database Schema
-- Run this entire script in: Supabase Dashboard → SQL Editor
-- CARELOOP does NOT diagnose diseases or prescribe treatment.
-- All identifiers use text IDs to match the existing JS data model.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USER PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  full_name    TEXT NOT NULL,
  role         TEXT NOT NULL CHECK (role IN ('ADMIN', 'DOCTOR', 'PATIENT', 'COORDINATOR')),
  avatar       TEXT,
  email        TEXT,
  doctor_id    TEXT,
  patient_id   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. DOCTORS
-- ============================================================
CREATE TABLE IF NOT EXISTS doctors (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  specialty  TEXT NOT NULL,
  hospital   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. CARE COORDINATORS
-- ============================================================
CREATE TABLE IF NOT EXISTS care_coordinators (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  hospital   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. PATIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  first_name            TEXT,
  age                   INTEGER,
  gender                TEXT,
  avatar                TEXT,
  email                 TEXT,
  phone                 TEXT,
  condition             TEXT,
  care_plan             TEXT,
  primary_provider      TEXT,
  specialist_provider   TEXT,
  providers             TEXT[],
  doctor_id             TEXT REFERENCES doctors(id),
  coordinator_id        TEXT REFERENCES care_coordinators(id),
  care_status           TEXT NOT NULL DEFAULT 'GAP_DETECTED'
                        CHECK (care_status IN ('GAP_DETECTED', 'CLOSED', 'ACTIVE', 'VERIFICATION_REQUESTED')),
  journey_status        TEXT NOT NULL DEFAULT 'ACTION_NEEDED'
                        CHECK (journey_status IN ('ACTION_NEEDED', 'CARE_CLOSED', 'VERIFICATION_REQUESTED', 'ACTIVE')),
  journey_progress      INTEGER DEFAULT 0,
  completed_steps       INTEGER DEFAULT 0,
  total_steps           INTEGER DEFAULT 9,
  patient_auth_confirmed BOOLEAN DEFAULT FALSE,
  last_appointment      DATE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. CARE EVENTS (Staff-facing — full 9-stage pipeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS care_events (
  id                TEXT PRIMARY KEY,
  patient_id        TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  stage             TEXT NOT NULL CHECK (stage IN (
                      'CONSULTATION','TEST_ORDERED','TEST_COMPLETED',
                      'RESULT_AVAILABLE','DOCTOR_REVIEW','REFERRAL',
                      'SPECIALIST','FOLLOW_UP','CARE_CLOSED'
                    )),
  status            TEXT NOT NULL DEFAULT 'NOT_STARTED'
                    CHECK (status IN ('COMPLETED','PENDING','OVERDUE','NOT_STARTED','MISSING','SCHEDULED','NOT_REQUIRED')),
  provider          TEXT,
  facility          TEXT,
  facility_group    TEXT,
  clinician         TEXT,
  event_date        DATE,
  scheduled_date    DATE,
  waiting_days      INTEGER,
  test_name         TEXT,
  result_summary    TEXT,
  notes             TEXT,
  patient_authorized BOOLEAN DEFAULT FALSE,
  auth_date         DATE,
  resolved_by       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. JOURNEY EVENTS (Patient-portal-facing, richer labelling)
-- ============================================================
CREATE TABLE IF NOT EXISTS journey_events (
  id               TEXT PRIMARY KEY,
  patient_id       TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  event_key        TEXT NOT NULL,
  event_type       TEXT NOT NULL,
  short_label      TEXT,
  provider         TEXT,
  facility_group   TEXT,
  doctor           TEXT,
  event_date       TEXT,
  expected_window  TEXT,
  status           TEXT NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('VERIFIED','UNVERIFIED','PENDING','UNKNOWN')),
  evidence         TEXT,
  missing_item     TEXT,
  next_dependency  TEXT,
  confidence       INTEGER DEFAULT 100,
  is_gap           BOOLEAN DEFAULT FALSE,
  details          TEXT,
  display_order    INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. CARE GAPS
-- ============================================================
CREATE TABLE IF NOT EXISTS care_gaps (
  id                  TEXT PRIMARY KEY,
  patient_id          TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  event_key           TEXT,
  gap_type            TEXT NOT NULL,
  title               TEXT NOT NULL,
  reason              TEXT,
  confidence          INTEGER NOT NULL DEFAULT 0,
  priority            TEXT NOT NULL DEFAULT 'HIGH'
                      CHECK (priority IN ('HIGH','MEDIUM','LOW')),
  status              TEXT NOT NULL DEFAULT 'OPEN'
                      CHECK (status IN ('OPEN','RESOLVED','UNKNOWN','IN_PROGRESS')),
  age_in_days         INTEGER DEFAULT 0,
  source_provider     TEXT,
  source_facility     TEXT,
  affected_stage      TEXT,
  step_number         INTEGER,
  total_steps         INTEGER DEFAULT 9,
  description         TEXT,
  patient_auth_confirmed BOOLEAN DEFAULT TRUE,
  resolved_at         TIMESTAMPTZ,
  resolved_by         TEXT,
  resolution_note     TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. GAP EVIDENCE (checklist items per gap)
-- ============================================================
CREATE TABLE IF NOT EXISTS gap_evidence (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gap_id      TEXT NOT NULL REFERENCES care_gaps(id) ON DELETE CASCADE,
  patient_id  TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  verified    BOOLEAN NOT NULL DEFAULT FALSE,
  detail      TEXT,
  is_missing_break BOOLEAN DEFAULT FALSE,
  display_order    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id               TEXT PRIMARY KEY,
  patient_id       TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'Available'
                   CHECK (status IN ('Available','Pending','Processing','Archived')),
  relative_time    TEXT,
  report_date      DATE,
  provider         TEXT,
  category         TEXT,
  workflow_stage   TEXT,
  shared_with      TEXT[],
  file_name        TEXT,
  file_size        TEXT,
  file_url         TEXT,
  summary_note     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id              TEXT PRIMARY KEY,
  patient_id      TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  appt_date       TEXT,
  short_date      TEXT,
  appt_time       TEXT,
  doctor          TEXT,
  provider        TEXT,
  department      TEXT,
  location        TEXT,
  status          TEXT NOT NULL DEFAULT 'UPCOMING'
                  CHECK (status IN ('UPCOMING','COMPLETED','CANCELLED','RESCHEDULED')),
  note            TEXT,
  reminder_set    BOOLEAN DEFAULT FALSE,
  confirmed       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. SHARED RECORDS (patient-authorized record sharing)
-- ============================================================
CREATE TABLE IF NOT EXISTS shared_records (
  id               TEXT PRIMARY KEY,
  patient_id       TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider         TEXT NOT NULL,
  provider_role    TEXT,
  records          TEXT,
  included_items   TEXT[],
  auth_status      TEXT NOT NULL DEFAULT 'Authorized'
                   CHECK (auth_status IN ('Authorized','Pending','Revoked')),
  authorized_date  TEXT,
  last_accessed    TEXT,
  active           BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. RECORD ACCESS LOG (audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS record_access_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id   TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  shared_id    TEXT REFERENCES shared_records(id),
  accessed_by  TEXT NOT NULL,
  access_type  TEXT NOT NULL DEFAULT 'READ'
               CHECK (access_type IN ('READ','WRITE','REVOKE','AUTHORIZE')),
  accessed_at  TIMESTAMPTZ DEFAULT NOW(),
  notes        TEXT
);

-- ============================================================
-- 13. ACTIVITY LOG (system-wide audit)
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id  TEXT REFERENCES patients(id),
  user_id     UUID REFERENCES auth.users(id),
  message     TEXT NOT NULL,
  log_type    TEXT NOT NULL DEFAULT 'info'
              CHECK (log_type IN ('success','alert','warning','info','error')),
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. GAP RESOLUTIONS (history of each resolution action)
-- ============================================================
CREATE TABLE IF NOT EXISTS gap_resolutions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gap_id          TEXT NOT NULL REFERENCES care_gaps(id) ON DELETE CASCADE,
  patient_id      TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  resolution_type TEXT NOT NULL
                  CHECK (resolution_type IN ('SELF_VERIFIED','EXTERNAL_PROVIDER','UNSURE','CARE_TEAM')),
  provider_name   TEXT,
  provider_date   TEXT,
  notes           TEXT,
  file_url        TEXT,
  authorized      BOOLEAN DEFAULT FALSE,
  resolved_by     TEXT,
  resolved_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. ASSISTANT CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS assistant_conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id  TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title       TEXT DEFAULT 'Care Assistant Session',
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  ended_at    TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 16. ASSISTANT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS assistant_messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  patient_id       TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  sender           TEXT NOT NULL CHECK (sender IN ('USER','ASSISTANT')),
  content          TEXT NOT NULL,
  quick_question_id TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_care_events_patient ON care_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_events_stage ON care_events(stage);
CREATE INDEX IF NOT EXISTS idx_journey_events_patient ON journey_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_gaps_patient ON care_gaps(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_gaps_status ON care_gaps(status);
CREATE INDEX IF NOT EXISTS idx_gap_evidence_gap ON gap_evidence(gap_id);
CREATE INDEX IF NOT EXISTS idx_reports_patient ON reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_shared_records_patient ON shared_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_patient ON activity_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_messages_conv ON assistant_messages(conversation_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — enable for all tables
-- ============================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_coordinators ENABLE ROW LEVEL SECURITY;

-- Allow anon/authenticated read on reference tables
CREATE POLICY "public read doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "public read care_coordinators" ON care_coordinators FOR SELECT USING (true);

-- user_profiles: user can read/update their own
CREATE POLICY "user own profile select" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "user own profile update" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Patients: admin/doctor/coordinator see all; patient sees own
CREATE POLICY "staff read patients" ON patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR')
    )
  );
CREATE POLICY "patient read own" ON patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = patients.id
    )
  );
CREATE POLICY "staff write patients" ON patients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR')
    )
  );

-- Care events: same pattern
CREATE POLICY "staff read care_events" ON care_events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR'))
  );
CREATE POLICY "patient read own care_events" ON care_events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = care_events.patient_id)
  );
CREATE POLICY "staff write care_events" ON care_events FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR'))
  );

-- Journey events
CREATE POLICY "journey_events read own or staff" ON journey_events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR'))
    OR
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = journey_events.patient_id)
  );
CREATE POLICY "journey_events write staff" ON journey_events FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR')));
CREATE POLICY "patient write own journey" ON journey_events FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = journey_events.patient_id));

-- Care gaps
CREATE POLICY "care_gaps read" ON care_gaps FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR'))
    OR
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = care_gaps.patient_id)
  );
CREATE POLICY "care_gaps write staff" ON care_gaps FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR')));
CREATE POLICY "patient update own gap" ON care_gaps FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = care_gaps.patient_id));

-- Gap evidence
CREATE POLICY "gap_evidence read" ON gap_evidence FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR'))
    OR
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = gap_evidence.patient_id)
  );
CREATE POLICY "gap_evidence write" ON gap_evidence FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR')));

-- Reports
CREATE POLICY "reports read" ON reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR'))
    OR
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = reports.patient_id)
  );
CREATE POLICY "reports write" ON reports FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR')));

-- Appointments
CREATE POLICY "appointments read" ON appointments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR'))
    OR
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = appointments.patient_id)
  );
CREATE POLICY "appointments write" ON appointments FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR')));
CREATE POLICY "patient update own appt" ON appointments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = appointments.patient_id));

-- Shared records
CREATE POLICY "shared_records read" ON shared_records FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR'))
    OR
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = shared_records.patient_id)
  );
CREATE POLICY "shared_records write patient" ON shared_records FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = shared_records.patient_id)
    OR
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR'))
  );

-- Activity log
CREATE POLICY "activity_log read staff" ON activity_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR')));
CREATE POLICY "activity_log read patient own" ON activity_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = activity_log.patient_id));
CREATE POLICY "activity_log insert all" ON activity_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Record access log
CREATE POLICY "record_access_log read" ON record_access_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR'))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = record_access_log.patient_id));
CREATE POLICY "record_access_log insert" ON record_access_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Gap resolutions
CREATE POLICY "gap_resolutions read" ON gap_resolutions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('ADMIN','DOCTOR','COORDINATOR'))
    OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'PATIENT' AND patient_id = gap_resolutions.patient_id)
  );
CREATE POLICY "gap_resolutions insert patient" ON gap_resolutions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND patient_id = gap_resolutions.patient_id));

-- Assistant conversations
CREATE POLICY "assistant_conversations own" ON assistant_conversations FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND patient_id = assistant_conversations.patient_id));

-- Assistant messages
CREATE POLICY "assistant_messages own" ON assistant_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND patient_id = assistant_messages.patient_id));

-- ============================================================
-- SEED DATA — Reference Tables
-- ============================================================
INSERT INTO doctors (id, name, specialty, hospital) VALUES
  ('D001', 'Dr. Priya Sharma',  'Endocrinology',  'Metro General (Hospital A)'),
  ('D002', 'Dr. Arjun Mehta',   'Cardiology',      'Metro General (Hospital A)'),
  ('D003', 'Dr. Sunita Rao',    'General Medicine','City Care Clinic (Hospital A)'),
  ('D004', 'Dr. Vikram Nair',   'Nephrology',      'Apollo Specialty (Hospital B)'),
  ('D005', 'Dr. Meera Pillai',  'Pulmonology',     'Fortis Healthcare (Hospital B)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO care_coordinators (id, name, hospital) VALUES
  ('CC001', 'Anjali Gupta', 'Metro Health Network'),
  ('CC002', 'Ravi Kumar',   'Metro Health Network'),
  ('CC003', 'Divya Patel',  'Metro Health Network')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA — Patients
-- ============================================================
INSERT INTO patients (id, name, first_name, age, gender, avatar, email, phone, condition, care_plan,
  primary_provider, specialist_provider, providers, doctor_id, coordinator_id,
  care_status, journey_status, journey_progress, completed_steps, total_steps, patient_auth_confirmed, last_appointment) VALUES
('P-1001','Rahul Sharma','Rahul',52,'Male','RS','rahul.sharma@careloop-demo.org','+91 98112 34567',
 'Type 2 Diabetes (Complex Care Pathway)','Diabetes & Metabolic Care Continuity Pathway',
 'City Care Hospital','Specialist Clinic',ARRAY['City Care Hospital','Specialist Clinic'],
 'D001','CC001','GAP_DETECTED','ACTION_NEEDED',78,7,9,TRUE,'2026-10-15'),
('P-1024','Rajesh Iyer',NULL,58,'Male',NULL,'rajesh.iyer@email.com','+91 98765 43210',
 'Type 2 Diabetes',NULL,'City Care Clinic',NULL,ARRAY['City Care Clinic'],
 'D001','CC001','GAP_DETECTED','ACTION_NEEDED',44,4,9,TRUE,'2026-10-08'),
('P-1082','Anita Desai',NULL,51,'Female',NULL,'anita.d@email.com','+91 21098 76543',
 'Breast Cancer (Post-Op Monitoring)',NULL,'Regional Cancer Institute',NULL,ARRAY['Regional Cancer Institute'],
 'D002','CC002','GAP_DETECTED','ACTION_NEEDED',44,4,9,TRUE,'2026-08-14'),
('P-1055','Arvind Chaudhary',NULL,62,'Male',NULL,'arvind.c@email.com','+91 54321 09876',
 'Coronary Artery Disease',NULL,'Heart Foundation Clinic','Apex Cardiac Rehab Wing',
 ARRAY['Heart Foundation Clinic','Apex Cardiac Rehab Wing'],
 'D002','CC002','CLOSED','CARE_CLOSED',100,9,9,TRUE,'2026-09-29'),
('P-1017','Mohammed Al-Rashid',NULL,45,'Male',NULL,'m.alrashid@email.com','+91 76543 21098',
 'Asthma (Moderate Persistent)',NULL,'Chest Care Center',NULL,ARRAY['Chest Care Center'],
 'D005','CC001','GAP_DETECTED','ACTION_NEEDED',22,2,9,TRUE,'2026-09-13')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA — Journey Events for Rahul Sharma (P-1001)
-- ============================================================
INSERT INTO journey_events (id, patient_id, event_key, event_type, short_label, provider, facility_group,
  doctor, event_date, status, evidence, next_dependency, confidence, is_gap, details, display_order) VALUES
('EVT-01','P-1001','CONSULTATION','Consultation','Consultation','City Care Hospital','HOSPITAL_A',
 'Dr. Priya Sharma','02 October','VERIFIED','Outpatient consultation summary recorded',
 'Diagnostic test',100,FALSE,'Initial consultation completed at City Care Hospital. Care pathway initiated.',1),
('EVT-02','P-1001','DIAGNOSTIC','Diagnostic Test','Diagnostic','City Care Hospital','HOSPITAL_A',
 'City Care Central Lab','12 October','VERIFIED','Lab report uploaded','Result review',100,FALSE,
 'Diagnostic blood panel and HbA1c sample collected and processed.',2),
('EVT-03','P-1001','RESULT','Result','Result','City Care Hospital','HOSPITAL_A',
 'Automated Lab Feed','12 October','VERIFIED','HbA1c & Lipid Profile reports available',
 'Doctor review',100,FALSE,'Diagnostic test results published to CARELOOP record.',3),
('EVT-04','P-1001','DOCTOR_REVIEW','Doctor Review','Doctor Review','City Care Hospital','HOSPITAL_A',
 'Dr. Priya Sharma','13 October','VERIFIED','Physician review confirmation timestamped',
 'Specialist referral',100,FALSE,'Dr. Sharma reviewed your diagnostic results.',4),
('EVT-05','P-1001','REFERRAL','Referral','Referral','City Care Hospital','HOSPITAL_A',
 'Dr. Priya Sharma','14 October','VERIFIED','Referral order & patient record authorization verified',
 'Specialist visit',100,FALSE,'Cross-provider referral issued from City Care Hospital to Specialist Clinic.',5),
('EVT-06','P-1001','SPECIALIST','Specialist Visit','Specialist','Specialist Clinic','HOSPITAL_B',
 'Dr. Vikram Nair (Specialist)','15 October','VERIFIED','Specialist visit summary uploaded & verified',
 'Follow-up within 30 days',100,FALSE,'Specialist consultation completed at Specialist Clinic.',6),
('EVT-07','P-1001','FOLLOW_UP','Follow-up','Follow-up','City Care Hospital / Specialist Clinic','HOSPITAL_B',
 'Dr. Sharma','Expected within 30 days of specialist visit','UNVERIFIED','Specialist visit verified',
 'Care Closure',94,TRUE,'Your specialist visit is recorded, but CARELOOP cannot yet confirm that the required follow-up happened.',7),
('EVT-08','P-1001','CLOSURE','Care Closure','Closure','CARELOOP Continuity Engine','HOSPITAL_B',
 'Care Team Verification','Pending follow-up verification','PENDING','7 of 9 pathway dependencies verified',
 'Complete loop closed',100,FALSE,'Care closure automatically confirmed once all upstream steps are verified.',8)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA — Care Gaps for P-1001
-- ============================================================
INSERT INTO care_gaps (id, patient_id, event_key, gap_type, title, reason, confidence, priority,
  status, age_in_days, source_provider, source_facility, affected_stage, step_number, total_steps, description) VALUES
('GAP-2026-01','P-1001','FOLLOW_UP','FOLLOW_UP_OVERDUE','Follow-up not verified',
 'Your specialist visit is recorded, but CARELOOP cannot yet confirm that the required follow-up happened.',
 94,'HIGH','OPEN',3,'City Care Hospital / Specialist Clinic','Specialist Clinic','FOLLOW_UP',7,9,
 'Follow-up not recorded following specialist care pathway.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO gap_evidence (gap_id, patient_id, label, verified, detail, is_missing_break, display_order) VALUES
('GAP-2026-01','P-1001','Referral verified',TRUE,'Issued by City Care Hospital on 14 Oct',FALSE,1),
('GAP-2026-01','P-1001','Specialist visit verified',TRUE,'Completed at Specialist Clinic on 15 Oct',FALSE,2),
('GAP-2026-01','P-1001','Required by care pathway',TRUE,'Post-specialist follow-up step is mandatory for closure',FALSE,3),
('GAP-2026-01','P-1001','Follow-up not recorded',FALSE,'No confirmation record received from Hospital A or B yet',TRUE,4)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA — Reports for P-1001
-- ============================================================
INSERT INTO reports (id, patient_id, title, status, relative_time, report_date, provider, category,
  workflow_stage, shared_with, file_name, file_size, summary_note) VALUES
('REP-01','P-1001','HbA1c','Available','2 days ago','2026-10-11','City Care Hospital','Laboratory Document',
 'Result ✓',ARRAY['City Care Hospital','Specialist Clinic'],'Rahul_Sharma_HbA1c_Oct2026.pdf','245 KB',
 'Document verified and attached to your Result and Doctor Review steps.'),
('REP-02','P-1001','Blood Test','Available','4 days ago','2026-10-09','City Care Hospital','Diagnostic Panel',
 'Diagnostic ✓',ARRAY['City Care Hospital','Specialist Clinic'],'Rahul_Sharma_BloodPanel_Oct2026.pdf','312 KB',
 'Routine blood panel document uploaded by City Care Hospital laboratory.'),
('REP-03','P-1001','Lipid Profile','Available','7 days ago','2026-10-06','City Care Hospital','Metabolic Panel',
 'Diagnostic ✓',ARRAY['City Care Hospital'],'Rahul_Sharma_LipidProfile_Oct2026.pdf','198 KB',
 'Lipid profile document verified and stored in your personal care continuity repository.'),
('REP-04','P-1001','Specialist Report','Available','9 days ago','2026-10-04','Specialist Clinic','Consultation Summary',
 'Specialist ✓',ARRAY['City Care Hospital','Specialist Clinic'],'Specialist_Consultation_Summary.pdf','420 KB',
 'Specialist visit summary received from Specialist Clinic via patient-authorized record handoff.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA — Appointments for P-1001
-- ============================================================
INSERT INTO appointments (id, patient_id, title, appt_date, short_date, appt_time, doctor, provider,
  department, location, status, note, reminder_set, confirmed) VALUES
('APT-01','P-1001','Follow-up visit','18 October','18 OCT','10:30 AM','Dr. Sharma',
 'City Care Hospital','Internal Medicine & Continuity Clinic','Block B, Room 204 · City Care Hospital',
 'UPCOMING','Bring your latest reports.',FALSE,TRUE),
('APT-02','P-1001','Specialist Consultation','15 October','15 OCT','02:15 PM','Dr. Vikram Nair',
 'Specialist Clinic','Endocrinology & Specialist Care','Suite 12 · Specialist Clinic',
 'COMPLETED','Referral handoff verified by patient authorization.',FALSE,TRUE),
('APT-03','P-1001','Initial Consultation & Workup','02 October','02 OCT','09:00 AM','Dr. Sharma',
 'City Care Hospital','Primary Care','Block A, Room 102 · City Care Hospital',
 'COMPLETED','Care journey initialized.',FALSE,TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA — Shared Records for P-1001
-- ============================================================
INSERT INTO shared_records (id, patient_id, provider, provider_role, records, included_items,
  auth_status, authorized_date, last_accessed, active) VALUES
('SHR-01','P-1001','City Care Hospital','Primary Care Facility (Hospital A)','Care records',
 ARRAY['Consultation notes','HbA1c','Blood Test','Lipid Profile'],
 'Authorized','02 Oct 2026','City Care Hospital · Yesterday · 04:15 PM',TRUE),
('SHR-02','P-1001','Specialist Clinic','Referred Specialist Facility (Hospital B)','Selected reports',
 ARRAY['HbA1c','Blood Test','Specialist Report','Referral Summary'],
 'Authorized','14 Oct 2026','Specialist Clinic · Today · 10:42 AM',TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA — Activity Log
-- ============================================================
INSERT INTO activity_log (patient_id, message, log_type) VALUES
('P-1001','Follow-up needs verification — Specialist visit verified; awaiting follow-up confirmation','warning'),
('P-1001','Specialist report added — Uploaded from Specialist Clinic via authorized handoff','success'),
('P-1055','Care loop closed for P-1055 (Arvind Chaudhary)','success'),
('P-1082','High-priority care gap detected for P-1082 (Anita Desai)','alert'),
('P-1017','Follow-up overdue for P-1017 (Mohammed Al-Rashid)','warning'),
(NULL,'New patient P-1103 (Kamala Subramaniam) registered','info');

-- ============================================================
-- SEED DATA — Care Events (Staff-facing) for all patients
-- ============================================================
INSERT INTO care_events (id, patient_id, stage, status, provider, facility, clinician, event_date, notes, patient_authorized) VALUES
('RS-001','P-1001','CONSULTATION','COMPLETED','HOSPITAL A','Metro General Hospital','Dr. Priya Sharma (Endocrinology)','2026-09-15','Initial evaluation for HbA1c elevation & peripheral neuropathy symptoms.',FALSE),
('RS-002','P-1001','TEST_ORDERED','COMPLETED','HOSPITAL A','Metro General Lab','Dr. Priya Sharma','2026-09-15','HbA1c, Microalbuminuria, Comprehensive Metabolic Panel ordered.',FALSE),
('RS-003','P-1001','TEST_COMPLETED','COMPLETED','HOSPITAL A','Metro Diagnostics Annex','Lab Tech R. Verma','2026-09-19','Specimens collected and processed under priority tag.',FALSE),
('RS-004','P-1001','RESULT_AVAILABLE','COMPLETED','HOSPITAL A','Metro Diagnostics','Dr. S. Roy (Pathology)','2026-09-21','High glycemic index with declining renal indices confirmed.',FALSE),
('RS-005','P-1001','DOCTOR_REVIEW','COMPLETED','HOSPITAL A','Metro General Hospital','Dr. Priya Sharma','2026-09-23','Reviewed. Required urgent cross-facility referral.',FALSE),
('RS-006','P-1001','REFERRAL','COMPLETED','HOSPITAL A','Metro General → Apollo Specialty','Care Coordinator Anjali Gupta','2026-09-25','Inter-facility transfer authorized. Digital transfer packet dispatched.',TRUE),
('RS-007','P-1001','SPECIALIST','COMPLETED','HOSPITAL B','Apollo Specialty Hospital','Dr. Vikram Nair (Senior Nephrologist)','2026-10-03','Specialist consultation completed. Mandatory 7-day follow-up mandated.',FALSE),
('RS-008','P-1001','FOLLOW_UP','OVERDUE','HOSPITAL B','Apollo Specialty Hospital','Outpatient Follow-up Clinic',NULL,'Post-specialist adjustment follow-up overdue. No attendance or outreach logged.',FALSE),
('RS-009','P-1001','CARE_CLOSED','NOT_STARTED','HOSPITAL B','Care Continuity Desk',NULL,NULL,'Care loop remains OPEN due to unresolved follow-up step.',FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA — Rahul Sharma Demo Auth User
-- (Run AFTER creating the auth user in Supabase Auth → Users)
-- Replace 'YOUR-AUTH-USER-UUID' with the actual UUID from Auth
-- ============================================================
-- INSERT INTO user_profiles (id, username, full_name, role, avatar, email, patient_id) VALUES
-- ('YOUR-AUTH-USER-UUID', 'patient', 'Rahul Sharma', 'PATIENT', 'RS', 'rahul.sharma@careloop-demo.org', 'P-1001')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- HELPER: Updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER care_events_updated_at BEFORE UPDATE ON care_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER journey_events_updated_at BEFORE UPDATE ON journey_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER care_gaps_updated_at BEFORE UPDATE ON care_gaps FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER shared_records_updated_at BEFORE UPDATE ON shared_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
