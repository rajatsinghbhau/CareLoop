-- ============================================================
-- CARELOOP - Anon Read Policies (Demo/Hackathon Mode)
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- This allows the demo app to read data without Supabase Auth
-- ============================================================

-- Patients
CREATE POLICY "anon read patients" ON patients FOR SELECT USING (true);

-- Journey Events
CREATE POLICY "anon read journey_events" ON journey_events FOR SELECT USING (true);

-- Care Gaps
CREATE POLICY "anon read care_gaps" ON care_gaps FOR SELECT USING (true);

-- Gap Evidence
CREATE POLICY "anon read gap_evidence" ON gap_evidence FOR SELECT USING (true);

-- Reports
CREATE POLICY "anon read reports" ON reports FOR SELECT USING (true);

-- Appointments
CREATE POLICY "anon read appointments" ON appointments FOR SELECT USING (true);

-- Shared Records
CREATE POLICY "anon read shared_records" ON shared_records FOR SELECT USING (true);

-- Activity Log
CREATE POLICY "anon read activity_log" ON activity_log FOR SELECT USING (true);

-- Care Events
CREATE POLICY "anon read care_events" ON care_events FOR SELECT USING (true);

-- Doctors & Coordinators (already have public read)
-- No change needed

-- Allow anon writes for gap resolution, activity log, shared records
CREATE POLICY "anon insert activity_log" ON activity_log FOR INSERT WITH CHECK (true);
CREATE POLICY "anon update care_gaps" ON care_gaps FOR UPDATE USING (true);
CREATE POLICY "anon update journey_events" ON journey_events FOR UPDATE USING (true);
CREATE POLICY "anon update patients" ON patients FOR UPDATE USING (true);
CREATE POLICY "anon insert shared_records" ON shared_records FOR INSERT WITH CHECK (true);
CREATE POLICY "anon update shared_records" ON shared_records FOR UPDATE USING (true);
CREATE POLICY "anon insert gap_resolutions" ON gap_resolutions FOR INSERT WITH CHECK (true);
CREATE POLICY "anon insert record_access_log" ON record_access_log FOR INSERT WITH CHECK (true);
CREATE POLICY "anon insert assistant_conversations" ON assistant_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "anon read assistant_conversations" ON assistant_conversations FOR SELECT USING (true);
CREATE POLICY "anon insert assistant_messages" ON assistant_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "anon read assistant_messages" ON assistant_messages FOR SELECT USING (true);
