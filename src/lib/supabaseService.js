// CARELOOP - Supabase Service Layer
// All data operations go through this module.
// CARELOOP does NOT diagnose diseases or prescribe treatment.

import { supabase } from './supabase';

// ─── AUTH ──────────────────────────────────────────────────────────
export const authService = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email, password, profileData) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        ...profileData,
      });
    }
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ─── PATIENTS ──────────────────────────────────────────────────────
export const patientService = {
  async getAll() {
    const { data, error } = await supabase
      .from('patients')
      .select('*, doctors(name,specialty), care_coordinators(name)')
      .order('name');
    if (error) throw error;
    return data;
  },

  async getById(patientId) {
    const { data, error } = await supabase
      .from('patients')
      .select('*, doctors(name,specialty), care_coordinators(name)')
      .eq('id', patientId)
      .single();
    if (error) throw error;
    return data;
  },

  async update(patientId, updates) {
    const { data, error } = await supabase
      .from('patients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', patientId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateJourneyProgress(patientId, progress, completedSteps, journeyStatus) {
    return patientService.update(patientId, {
      journey_progress: progress,
      completed_steps: completedSteps,
      journey_status: journeyStatus,
    });
  },
};

// ─── CARE EVENTS (Staff-facing) ────────────────────────────────────
export const careEventService = {
  async getByPatient(patientId) {
    const { data, error } = await supabase
      .from('care_events')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at');
    if (error) throw error;
    return data;
  },

  async update(eventId, updates) {
    const { data, error } = await supabase
      .from('care_events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async resolveEvent(eventId, patientId, resolution, resolvedBy) {
    const updated = await careEventService.update(eventId, {
      status: 'COMPLETED',
      event_date: new Date().toISOString().split('T')[0],
      notes: resolution,
      resolved_by: resolvedBy,
    });
    await activityService.log(patientId, `Care event resolved: ${eventId} by ${resolvedBy}`, 'success');
    return updated;
  },
};

// ─── JOURNEY EVENTS (Patient-portal-facing) ────────────────────────
export const journeyService = {
  async getByPatient(patientId) {
    const { data, error } = await supabase
      .from('journey_events')
      .select('*')
      .eq('patient_id', patientId)
      .order('display_order');
    if (error) throw error;
    return data;
  },

  async updateEventStatus(eventId, patientId, status, additionalUpdates = {}) {
    const { data, error } = await supabase
      .from('journey_events')
      .update({ status, ...additionalUpdates, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select()
      .single();
    if (error) throw error;
    await activityService.log(patientId, `Journey event ${eventId} updated to ${status}`, 'success');
    return data;
  },
};

// ─── CARE GAPS ─────────────────────────────────────────────────────
export const careGapService = {
  async getAll() {
    const { data, error } = await supabase
      .from('care_gaps')
      .select('*, patients(name,age,condition)')
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByPatient(patientId) {
    const { data, error } = await supabase
      .from('care_gaps')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getWithEvidence(gapId) {
    const [gapRes, evidenceRes] = await Promise.all([
      supabase.from('care_gaps').select('*').eq('id', gapId).single(),
      supabase.from('gap_evidence').select('*').eq('gap_id', gapId).order('display_order'),
    ]);
    if (gapRes.error) throw gapRes.error;
    if (evidenceRes.error) throw evidenceRes.error;
    return { gap: gapRes.data, evidence: evidenceRes.data };
  },

  async resolveGap(gapId, patientId, resolutionType, details, resolvedBy) {
    const now = new Date().toISOString();

    // 1. Update gap status
    const { data: gap, error: gapErr } = await supabase
      .from('care_gaps')
      .update({
        status: 'RESOLVED',
        resolved_at: now,
        resolved_by: resolvedBy,
        resolution_note: details.notes || '',
        updated_at: now,
      })
      .eq('id', gapId)
      .select()
      .single();
    if (gapErr) throw gapErr;

    // 2. Insert resolution record
    await supabase.from('gap_resolutions').insert({
      gap_id: gapId,
      patient_id: patientId,
      resolution_type: resolutionType,
      provider_name: details.providerName || null,
      provider_date: details.providerDate || null,
      notes: details.notes || null,
      authorized: details.authorized || false,
      resolved_by: resolvedBy,
    });

    // 3. Log activity
    await activityService.log(patientId, `Care gap resolved: ${gapId} via ${resolutionType}`, 'success');

    return gap;
  },

  async openCount() {
    const { count, error } = await supabase
      .from('care_gaps')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'OPEN');
    if (error) throw error;
    return count || 0;
  },
};

// ─── REPORTS ───────────────────────────────────────────────────────
export const reportService = {
  async getByPatient(patientId) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('patient_id', patientId)
      .order('report_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async add(reportData) {
    const { data, error } = await supabase
      .from('reports')
      .insert(reportData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─── APPOINTMENTS ──────────────────────────────────────────────────
export const appointmentService = {
  async getByPatient(patientId) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async setReminder(appointmentId, patientId) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ reminder_set: true, updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
      .select()
      .single();
    if (error) throw error;
    await activityService.log(patientId, `Reminder set for appointment ${appointmentId}`, 'info');
    return data;
  },
};

// ─── SHARED RECORDS ────────────────────────────────────────────────
export const sharedRecordService = {
  async getByPatient(patientId) {
    const { data, error } = await supabase
      .from('shared_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at');
    if (error) throw error;
    return data;
  },

  async revokeAccess(recordId, patientId) {
    const { data, error } = await supabase
      .from('shared_records')
      .update({ active: false, auth_status: 'Revoked', updated_at: new Date().toISOString() })
      .eq('id', recordId)
      .select()
      .single();
    if (error) throw error;

    // Log access event
    await supabase.from('record_access_log').insert({
      patient_id: patientId,
      shared_id: recordId,
      accessed_by: 'Patient',
      access_type: 'REVOKE',
    });
    await activityService.log(patientId, `Record access revoked for ${recordId}`, 'warning');
    return data;
  },

  async grantAccess(patientId, provider, role, records, includedItems) {
    const id = `SHR-${Date.now()}`;
    const { data, error } = await supabase
      .from('shared_records')
      .insert({
        id,
        patient_id: patientId,
        provider,
        provider_role: role,
        records,
        included_items: includedItems,
        auth_status: 'Authorized',
        authorized_date: new Date().toLocaleDateString('en-IN'),
        active: true,
      })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('record_access_log').insert({
      patient_id: patientId,
      shared_id: id,
      accessed_by: 'Patient',
      access_type: 'AUTHORIZE',
    });
    await activityService.log(patientId, `Record sharing authorized for ${provider}`, 'success');
    return data;
  },
};

// ─── ACTIVITY LOG ──────────────────────────────────────────────────
export const activityService = {
  async log(patientId, message, type = 'info', metadata = null) {
    const { error } = await supabase.from('activity_log').insert({
      patient_id: patientId || null,
      message,
      log_type: type,
      metadata,
    });
    if (error) console.warn('Activity log error:', error.message);
  },

  async getRecent(limit = 20) {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getByPatient(patientId, limit = 10) {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },
};

// ─── ASSISTANT (Chat history) ──────────────────────────────────────
export const assistantService = {
  async getOrCreateConversation(patientId) {
    // Get active conversation
    const { data: existing } = await supabase
      .from('assistant_conversations')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) return existing;

    // Create new
    const { data, error } = await supabase
      .from('assistant_conversations')
      .insert({ patient_id: patientId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMessages(conversationId) {
    const { data, error } = await supabase
      .from('assistant_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at');
    if (error) throw error;
    return data;
  },

  async sendMessage(conversationId, patientId, sender, content, quickQuestionId = null) {
    const { data, error } = await supabase
      .from('assistant_messages')
      .insert({
        conversation_id: conversationId,
        patient_id: patientId,
        sender,
        content,
        quick_question_id: quickQuestionId,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async closeConversation(conversationId) {
    await supabase
      .from('assistant_conversations')
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq('id', conversationId);
  },
};

// ─── STATS (for staff dashboard) ──────────────────────────────────
export const statsService = {
  async getAggregateStats() {
    const [patientsRes, openGapsRes, highGapsRes, closedRes] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }),
      supabase.from('care_gaps').select('*', { count: 'exact', head: true }).eq('status', 'OPEN'),
      supabase.from('care_gaps').select('*', { count: 'exact', head: true }).eq('status', 'OPEN').eq('priority', 'HIGH'),
      supabase.from('patients').select('*', { count: 'exact', head: true }).eq('care_status', 'CLOSED'),
    ]);

    const totalPatients = patientsRes.count || 0;
    const openGaps = openGapsRes.count || 0;
    const highPriorityGaps = highGapsRes.count || 0;
    const closedPatients = closedRes.count || 0;

    return {
      totalPatients,
      openGaps,
      highPriorityGaps,
      careClosureRate: totalPatients > 0 ? Math.round((closedPatients / totalPatients) * 100) : 0,
    };
  },
};
