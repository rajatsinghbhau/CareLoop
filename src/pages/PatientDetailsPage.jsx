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
    <div className={`card border ${gap.priority === 'HIGH' ? 'border-red-500/30' : gap.priority === 'MEDIUM' ? 'border-amber-500/20' : 'border-slate-700'}`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <PriorityBadge priority={gap.priority} />
          <GapTypeChip type={gap.type} />
          <p className="text-sm text-slate-300 truncate">{gap.description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ConfidenceBar score={gap.confidence} />
          <span className="text-xs text-slate-500 w-8">{gap.ageInDays}d</span>
          {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50 pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">Gap Reasons</p>
              {gap.reasons.map((r, i) => (
                <p key={i} className="text-xs text-slate-300 flex items-start gap-2 mb-1">
                  <span className="text-red-400 mt-0.5">•</span>{r}
                </p>
              ))}
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">
                Confidence: {gap.confidence}%
              </p>
              <ConfidenceBar score={gap.confidence} />
              <div className="mt-2 space-y-1">
                {gap.confidenceFactors?.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={f.met ? 'text-green-400' : 'text-slate-600'}>{f.met ? '✓' : '○'}</span>
                    <span className={f.met ? 'text-slate-300' : 'text-slate-500'}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {gap.priorityReasons?.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-400 font-bold mb-2 uppercase tracking-wide">
                {gap.priority} Priority — Reasons
              </p>
              {gap.priorityReasons.map((r, i) => (
                <p key={i} className="text-xs text-slate-300 flex items-start gap-2 mb-1">
                  <span className="text-amber-400 mt-0.5">•</span>{r}
                </p>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => onResolve(gap)}
              className="btn-primary flex items-center gap-2"
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
        <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={gap.priority} />
            <GapTypeChip type={gap.type} />
          </div>
          <p className="text-sm text-slate-300">{gap.description}</p>
          <p className="text-xs text-slate-500">Affected stage: {gap.affectedStage}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Resolution Action</label>
          <select
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 mb-3"
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

          <label className="block text-sm font-medium text-slate-300 mb-2">Resolution Notes *</label>
          <textarea
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            rows={4}
            placeholder="Describe the resolution action taken..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-400">
          ⚠ This will mark the {gap.affectedStage} stage as COMPLETED. Ensure all clinical actions have been completed before resolving.
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleResolve}
            disabled={!notes.trim()}
            className="btn-primary disabled:opacity-50"
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
    <div className="flex-1 flex items-center justify-center">
      <p className="text-slate-500">Patient not found</p>
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
    <div className="flex-1 overflow-y-auto">
      <TopBar
        title={patient.name}
        subtitle={`${patient.id} · ${patient.condition}`}
        actions={
          <button
            onClick={onBack}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            Back to Patients
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Quick summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs text-slate-400 mb-1">Care Status</p>
            <CareStatusBadge status={patient.careStatus} />
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-400 mb-1">Open Gaps</p>
            <p className="text-2xl font-bold text-white">{gaps.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-400 mb-1">Assigned Doctor</p>
            <p className="text-sm font-medium text-white">{doctor?.name || '—'}</p>
            <p className="text-xs text-slate-500">{doctor?.specialty}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-400 mb-1">Care Coordinator</p>
            <p className="text-sm font-medium text-white">{coordinator?.name || '—'}</p>
          </div>
        </div>

        {gaps.length > 0 && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-red-400" />
              <p className="text-red-400 font-bold text-sm">{gaps.length} CARE GAP{gaps.length !== 1 ? 'S' : ''} DETECTED</p>
            </div>
            <div className="flex flex-wrap gap-2">
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
        <div className="flex gap-1 border-b border-slate-700 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-cyan-400 bg-cyan-500/5'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
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
              <div className="card p-12 text-center">
                <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3" />
                <p className="text-white font-medium">No care gaps detected</p>
                <p className="text-slate-400 text-sm mt-1">The care journey is proceeding normally</p>
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
          <div className="card p-5">
            <h3 className="font-bold text-white mb-5">Care Event Timeline</h3>
            <div className="relative">
              {patient.careEvents?.map((event, idx) => {
                const statusColors = {
                  COMPLETED: 'bg-green-500',
                  PENDING: 'bg-amber-500',
                  OVERDUE: 'bg-red-500',
                  MISSING: 'bg-red-700',
                  SCHEDULED: 'bg-blue-500',
                  NOT_STARTED: 'bg-slate-600',
                  NOT_REQUIRED: 'bg-slate-700',
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
                  <div key={event.id} className="flex gap-4 mb-5 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${statusColors[event.status] || 'bg-slate-600'}`} />
                      {idx < patient.careEvents.length - 1 && (
                        <div className="w-px flex-1 bg-slate-700 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white text-sm">{stageLabels[event.stage] || event.stage}</p>
                        <span className="text-xs text-slate-500">{event.date || 'Pending'}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Status: {event.status}</p>
                      {event.notes && (
                        <p className="text-xs text-slate-400 mt-1 bg-slate-700/30 rounded p-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <User size={16} className="text-cyan-400" /> Patient Information
              </h3>
              {[
                { label: 'Patient ID', value: patient.id },
                { label: 'Full Name', value: patient.name },
                { label: 'Age', value: `${patient.age} years` },
                { label: 'Gender', value: patient.gender },
                { label: 'Condition', value: patient.condition },
                { label: 'Last Appointment', value: patient.lastAppointment },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between text-sm">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white font-medium text-right">{value}</span>
                </div>
              ))}
            </div>
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Phone size={16} className="text-cyan-400" /> Contact & Care Team
              </h3>
              {[
                { label: 'Phone', value: patient.phone },
                { label: 'Email', value: patient.email },
                { label: 'Doctor', value: doctor?.name || '—' },
                { label: 'Specialty', value: doctor?.specialty || '—' },
                { label: 'Coordinator', value: coordinator?.name || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between text-sm">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white font-medium text-right">{value}</span>
                </div>
              ))}
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
