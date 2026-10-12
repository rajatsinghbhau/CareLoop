// CARELOOP - Patient Details Page
import React, { useState } from 'react';
import {
  ArrowLeft, User, Phone, Mail, Calendar, Stethoscope,
  AlertCircle, CheckCircle2, Edit3, Save, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectCareGaps } from '../engine/careGapEngine';
import { CareClosureGraph } from '../components/CareClosureGraph';
import {
  PriorityBadge, CareStatusBadge, ConfidenceBar, GapTypeChip,
  SafetyDisclaimer, Modal
} from '../components/shared/UI';
import { TopBar } from '../components/shared/Navigation';

function GapCard({ gap, patient, onResolve }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`clean-pill-card border ${gap.priority === 'HIGH' ? 'border-red-200 bg-red-50/30' : gap.priority === 'MEDIUM' ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'}`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <PriorityBadge priority={gap.priority} />
          <GapTypeChip type={gap.type} />
          <p className="text-xs font-bold text-slate-800 truncate">{gap.description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ConfidenceBar score={gap.confidence} />
          <span className="text-xs text-slate-400 font-mono w-8">{gap.ageInDays}d</span>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wider">Gap Reasons</p>
              {gap.reasons.map((r, i) => (
                <p key={i} className="text-xs text-slate-700 flex items-start gap-2 mb-1.5">
                  <span className="text-red-500 mt-0.5 font-bold">•</span>{r}
                </p>
              ))}
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wider">
                Continuity Confidence: {gap.confidence}%
              </p>
              <ConfidenceBar score={gap.confidence} />
              <div className="mt-2.5 space-y-1">
                {gap.confidenceFactors?.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={f.met ? 'text-emerald-500 font-bold' : 'text-slate-300'}>{f.met ? '✓' : '○'}</span>
                    <span className={f.met ? 'text-slate-700 font-medium' : 'text-slate-400'}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {gap.priorityReasons?.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5">
              <p className="text-xs text-amber-700 font-bold mb-2 uppercase tracking-wide">
                {gap.priority} Priority — Reasons
              </p>
              {gap.priorityReasons.map((r, i) => (
                <p key={i} className="text-xs text-slate-700 flex items-start gap-2 mb-1">
                  <span className="text-amber-500 mt-0.5 font-bold">•</span>{r}
                </p>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => onResolve(gap)}
              className="btn-coral-sm flex items-center gap-2 text-xs"
            >
              <CheckCircle2 size={14} />
              Resolve Gap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResolveGapModal({ gap, patient, onClose }) {
  const { dispatch, showNotification, user } = useApp();
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState('');

  const handleResolve = () => {
    if (!notes.trim()) return;
    dispatch({
      type: 'RESOLVE_GAP',
      payload: {
        patientId: patient.id,
        stage: gap.affectedStage,
        resolution: notes,
        resolvedBy: user?.name || 'Staff',
      },
    });
    showNotification(`Gap resolved for ${patient.name}`, 'success');
    onClose();
  };

  return (
    <Modal title={`Resolve Gap — ${patient.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={gap.priority} />
            <GapTypeChip type={gap.type} />
          </div>
          <p className="text-xs font-bold text-slate-900">{gap.description}</p>
          <p className="text-[11px] text-slate-400">Affected stage: <span className="font-semibold text-slate-700">{gap.affectedStage}</span></p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Resolution Action</label>
          <select
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-red-400 focus:bg-white mb-3"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="">Select action taken...</option>
            <option value="completed">Event completed and verified</option>
            <option value="contacted">Patient contacted and appointment scheduled</option>
            <option value="reviewed">Clinical review completed</option>
            <option value="referred">Referral confirmed</option>
            <option value="followup">Follow-up conducted</option>
            <option value="other">Other action taken</option>
          </select>

          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Resolution Notes *</label>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-400 focus:bg-white placeholder-slate-400"
            rows={4}
            placeholder="Describe clinical resolution action taken..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-medium">
          ⚠ This action marks the {gap.affectedStage} protocol step as COMPLETED. Ensure all cross-provider verification checks are validated.
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn-soft-pill text-xs">Cancel</button>
          <button
            onClick={handleResolve}
            disabled={!notes.trim()}
            className="btn-coral-pill text-xs disabled:opacity-50"
          >
            Mark as Resolved
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function PatientDetailsPage({ patientId, onBack }) {
  const { patients, doctors, coordinators } = useApp();
  const [activeTab, setActiveTab] = useState('graph');
  const [resolvingGap, setResolvingGap] = useState(null);

  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return (
    <div className="flex-1 flex items-center justify-center bg-[#fbfcff]">
      <p className="text-slate-400">Patient not found</p>
    </div>
  );

  const gaps = detectCareGaps(patient);
  const doctor = doctors.find((d) => d.id === patient.doctorId);
  const coordinator = coordinators.find((c) => c.id === patient.coordinatorId);

  const TABS = [
    { id: 'graph', label: 'Care Closure Graph' },
    { id: 'gaps', label: `Care Gaps (${gaps.length})` },
    { id: 'timeline', label: 'Care Timeline' },
    { id: 'info', label: 'Patient Info' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfcff]">
      <TopBar
        title={patient.name}
        subtitle={`${patient.id} · ${patient.condition}`}
        actions={
          <button
            onClick={onBack}
            className="btn-soft-pill flex items-center gap-2 text-xs"
          >
            <ArrowLeft size={14} />
            Back to Patients
          </button>
        }
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Quick summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="clean-pill-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Care Status</p>
            <CareStatusBadge status={patient.careStatus} />
          </div>
          <div className="clean-pill-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Active Gaps</p>
            <p className={`text-2xl font-black ${gaps.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{gaps.length}</p>
          </div>
          <div className="clean-pill-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Assigned Clinician</p>
            <p className="text-xs font-bold text-slate-900 truncate">{doctor?.name || '—'}</p>
            <p className="text-[11px] text-slate-400 font-medium truncate">{doctor?.specialty}</p>
          </div>
          <div className="clean-pill-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Care Coordinator</p>
            <p className="text-xs font-bold text-slate-900 truncate">{coordinator?.name || '—'}</p>
            <p className="text-[11px] text-slate-400 font-medium">Care Continuity Desk</p>
          </div>
        </div>

        {gaps.length > 0 && (
          <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertCircle size={18} className="text-red-500" />
              <p className="text-red-600 font-black text-xs uppercase tracking-wider">{gaps.length} CARE GAP{gaps.length !== 1 ? 'S' : ''} DETECTED ON PROTOCOL</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {gaps.map((g) => (
                <div key={g.id} className="flex items-center gap-1.5">
                  <PriorityBadge priority={g.priority} />
                  <GapTypeChip type={g.type} />
                </div>
              ))}
            </div>
            <SafetyDisclaimer />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200/80 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`filter-pill text-xs ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'graph' && (
          <CareClosureGraph patient={patient} gaps={gaps} />
        )}

        {activeTab === 'gaps' && (
          <div className="space-y-3">
            {gaps.length === 0 ? (
              <div className="clean-pill-card p-12 text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-slate-900 font-bold text-sm">No Care Gaps Detected</p>
                <p className="text-slate-400 text-xs mt-1">This patient's cross-provider care journey is proceeding normally without protocol breakage</p>
              </div>
            ) : (
              gaps.map((gap) => (
                <GapCard
                  key={gap.id}
                  gap={gap}
                  patient={patient}
                  onResolve={setResolvingGap}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="clean-pill-card p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-6">Care Event Timeline</h3>
            <div className="relative space-y-6">
              {patient.careEvents?.map((event, idx) => {
                const statusColors = {
                  COMPLETED: 'bg-emerald-500',
                  PENDING: 'bg-amber-400',
                  OVERDUE: 'bg-red-500',
                  MISSING: 'bg-red-600',
                  SCHEDULED: 'bg-sky-500',
                  NOT_STARTED: 'bg-slate-300',
                  NOT_REQUIRED: 'bg-slate-300',
                };
                const stageLabels = {
                  CONSULTATION: 'Consultation',
                  TEST_ORDERED: 'Test Ordered',
                  TEST_COMPLETED: 'Test Completed',
                  RESULT_AVAILABLE: 'Result Available',
                  DOCTOR_REVIEW: 'Doctor Review',
                  REFERRAL: 'Referral',
                  FOLLOW_UP: 'Follow-up',
                  CARE_CLOSED: 'Care Closed',
                };
                return (
                  <div key={event.id} className="flex gap-4 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${statusColors[event.status] || 'bg-slate-300'} ring-4 ring-white shadow-sm`} />
                      {idx < patient.careEvents.length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-800 text-xs">{stageLabels[event.stage] || event.stage}</p>
                        <span className="text-[11px] text-slate-400 font-mono font-medium">{event.date || 'Pending'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Status: <span className="font-semibold text-slate-700">{event.status}</span></p>
                      {event.notes && (
                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
                          {event.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="clean-pill-card p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <User size={16} className="text-red-500" /> Patient Demographics
              </h3>
              <div className="divide-y divide-slate-100">
                {[
                  { label: 'Patient ID', value: patient.id },
                  { label: 'Full Name', value: patient.name },
                  { label: 'Age', value: `${patient.age} years` },
                  { label: 'Gender', value: patient.gender },
                  { label: 'Primary Condition', value: patient.condition },
                  { label: 'Last Recorded Appt.', value: patient.lastAppointment },
                ].map(({ label, value }) => (
                  <div key={label} className="py-2.5 flex items-start justify-between text-xs">
                    <span className="text-slate-400 font-medium">{label}</span>
                    <span className="text-slate-800 font-bold text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="clean-pill-card p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Phone size={16} className="text-red-500" /> Contact & Care Team
              </h3>
              <div className="divide-y divide-slate-100">
                {[
                  { label: 'Primary Phone', value: patient.phone },
                  { label: 'Email Address', value: patient.email },
                  { label: 'Attending Physician', value: doctor?.name || '—' },
                  { label: 'Specialty', value: doctor?.specialty || '—' },
                  { label: 'Coordinator Desk', value: coordinator?.name || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="py-2.5 flex items-start justify-between text-xs">
                    <span className="text-slate-400 font-medium">{label}</span>
                    <span className="text-slate-800 font-bold text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {resolvingGap && (
        <ResolveGapModal
          gap={resolvingGap}
          patient={patient}
          onClose={() => setResolvingGap(null)}
        />
      )}
    </div>
  );
}
