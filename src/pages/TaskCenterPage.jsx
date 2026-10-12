// CARELOOP - Task/Action Center
import React, { useState } from 'react';
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectCareGaps } from '../engine/careGapEngine';
import { PriorityBadge, GapTypeChip, ConfidenceBar, SafetyDisclaimer, Modal } from '../components/shared/UI';
import { TopBar } from '../components/shared/Navigation';

function ContactModal({ patient, gap, onClose }) {
  const { dispatch, showNotification, user } = useApp();
  const [method, setMethod] = useState('phone');
  const [notes, setNotes] = useState('');

  const handleLog = () => {
    dispatch({
      type: 'RESOLVE_GAP',
      payload: {
        patientId: patient.id,
        stage: gap.affectedStage,
        resolution: `Contact made via ${method}. Notes: ${notes}`,
        resolvedBy: user?.name || 'Coordinator',
      },
    });
    showNotification(`Contact logged for ${patient.name}`, 'success');
    onClose();
  };

  return (
    <Modal title={`Contact Patient — ${patient.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Patient ID</p>
            <p className="text-white font-medium">{patient.id}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Condition</p>
            <p className="text-white font-medium">{patient.condition}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Phone</p>
            <p className="text-white font-medium flex items-center gap-1"><Phone size={10} />{patient.phone}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Email</p>
            <p className="text-white font-medium flex items-center gap-1 truncate"><Mail size={10} />{patient.email}</p>
          </div>
        </div>

        <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <PriorityBadge priority={gap.priority} />
            <GapTypeChip type={gap.type} />
          </div>
          <p className="text-sm text-slate-300">{gap.description}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Contact Method</label>
          <div className="flex gap-2">
            {['phone', 'email', 'sms', 'in-person'].map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  method === m
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-700 text-slate-400 border border-slate-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Contact Notes *</label>
          <textarea
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            rows={3}
            placeholder="Document what was communicated..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleLog}
            disabled={!notes.trim()}
            className="btn-primary disabled:opacity-50"
          >
            Log Contact & Resolve Gap
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function TaskCenterPage({ onSelectPatient }) {
  const { patients, dispatch, showNotification, user, coordinators } = useApp();
  const [contactTarget, setContactTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Build task list from gaps
  const tasks = patients.flatMap((p) => {
    const gaps = detectCareGaps(p);
    return gaps.map((g) => ({ gap: g, patient: p }));
  });

  const followUpTasks = tasks.filter((t) => t.gap.type === 'FOLLOW_UP_OVERDUE');
  const reviewTasks = tasks.filter((t) => t.gap.type === 'RESULT_NOT_REVIEWED');
  const referralTasks = tasks.filter((t) => t.gap.type === 'REFERRAL_PENDING');
  const highPriorityTasks = tasks.filter((t) => t.gap.priority === 'HIGH');

  const tabConfig = [
    { id: 'all', label: `All Tasks (${tasks.length})`, data: tasks },
    { id: 'followup', label: `Follow-ups (${followUpTasks.length})`, data: followUpTasks },
    { id: 'review', label: `Reviews (${reviewTasks.length})`, data: reviewTasks },
    { id: 'referral', label: `Referrals (${referralTasks.length})`, data: referralTasks },
    { id: 'high', label: `HIGH Priority (${highPriorityTasks.length})`, data: highPriorityTasks },
  ];

  const currentData = tabConfig.find((t) => t.id === activeTab)?.data || tasks;

  const handleEscalate = (task) => {
    showNotification(`Gap escalated to senior coordinator: ${task.patient.name}`, 'warning');
  };

  const handleMarkComplete = (task) => {
    dispatch({
      type: 'RESOLVE_GAP',
      payload: {
        patientId: task.patient.id,
        stage: task.gap.affectedStage,
        resolution: `Task completed by ${user?.name}`,
        resolvedBy: user?.name,
      },
    });
    showNotification(`Task marked complete for ${task.patient.name}`, 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar
        title="Task & Action Center"
        subtitle={`${tasks.length} open tasks across all patients`}
      />

      <div className="p-6 space-y-5">
        <SafetyDisclaimer />

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Tasks', value: tasks.length, color: 'text-white' },
            { label: 'HIGH Priority', value: highPriorityTasks.length, color: 'text-red-400' },
            { label: 'Follow-ups Due', value: followUpTasks.length, color: 'text-amber-400' },
            { label: 'Reviews Pending', value: reviewTasks.length, color: 'text-blue-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 text-center">
              <p className="text-slate-400 text-xs mb-1">{label}</p>
              <p className={`text-3xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap border-b border-slate-700 pb-0">
          {tabConfig.map((tab) => (
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

        {/* Task list */}
        <div className="space-y-3">
          {currentData.map(({ gap, patient }) => (
            <div
              key={gap.id}
              className={`card p-4 border ${
                gap.priority === 'HIGH' ? 'border-red-500/30' :
                gap.priority === 'MEDIUM' ? 'border-amber-500/20' : 'border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <PriorityBadge priority={gap.priority} />
                    <GapTypeChip type={gap.type} />
                    <span className="text-xs text-slate-500">{gap.ageInDays}d old</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="text-sm font-bold text-cyan-400 hover:text-cyan-300"
                    >
                      {patient.name}
                    </button>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">{patient.id}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">{patient.condition}</span>
                  </div>
                  <p className="text-sm text-slate-300">{gap.description}</p>
                  <div className="mt-2 w-48">
                    <ConfidenceBar score={gap.confidence} />
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {(user?.role === 'CARE_COORDINATOR' || user?.role === 'ADMIN') && (
                    <>
                      <button
                        onClick={() => setContactTarget({ gap, patient })}
                        className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors"
                      >
                        <Phone size={11} /> Contact Patient
                      </button>
                      <button
                        onClick={() => handleEscalate({ gap, patient })}
                        className="flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors"
                      >
                        <AlertTriangle size={11} /> Escalate
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleMarkComplete({ gap, patient })}
                    className="flex items-center gap-1.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition-colors"
                  >
                    <CheckCircle2 size={11} /> Mark Complete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {currentData.length === 0 && (
            <div className="card p-12 text-center">
              <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3" />
              <p className="text-white font-medium">No tasks in this category</p>
              <p className="text-slate-400 text-sm mt-1">All caught up!</p>
            </div>
          )}
        </div>
      </div>

      {contactTarget && (
        <ContactModal
          patient={contactTarget.patient}
          gap={contactTarget.gap}
          onClose={() => setContactTarget(null)}
        />
      )}
    </div>
  );
}
