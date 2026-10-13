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
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Patient ID</p>
            <p className="text-slate-900 font-bold font-mono">{patient.id}</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Condition</p>
            <p className="text-slate-900 font-bold">{patient.condition}</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Phone</p>
            <p className="text-slate-900 font-bold flex items-center gap-1.5"><Phone size={12} className="text-slate-400" />{patient.phone}</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Email</p>
            <p className="text-slate-900 font-bold flex items-center gap-1.5 truncate"><Mail size={12} className="text-slate-400" />{patient.email}</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <PriorityBadge priority={gap.priority} />
            <GapTypeChip type={gap.type} />
          </div>
          <p className="text-xs font-semibold text-slate-800">{gap.description}</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Contact Method *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'phone', label: 'Phone Call', icon: Phone },
              { id: 'sms', label: 'SMS / Text', icon: MessageSquare },
              { id: 'email', label: 'Email', icon: Mail },
              { id: 'in-person', label: 'In-Person', icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = method === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethod(item.id)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#e84343] text-white border-[#e84343] shadow-sm shadow-rose-200 ring-2 ring-rose-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={13} className={isSelected ? 'text-white' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Contact Notes *</label>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-400 focus:bg-white placeholder-slate-400"
            rows={3}
            placeholder="Document conversation and scheduled next steps..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn-soft-pill text-xs">Cancel</button>
          <button
            onClick={handleLog}
            disabled={!notes.trim()}
            className="btn-coral-pill text-xs disabled:opacity-50"
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
    showNotification(`Gap escalated to senior care coordinator: ${task.patient.name}`, 'warning');
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
    <div className="flex-1 overflow-y-auto bg-[#fbfcff]">
      <TopBar
        title="Task & Action Center"
        subtitle={`${tasks.length} actionable workflow items requiring clinical attention`}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <SafetyDisclaimer />

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Tasks', value: tasks.length, color: 'text-slate-900', bg: 'bg-white' },
            { label: 'HIGH Priority', value: highPriorityTasks.length, color: 'text-red-500', bg: 'bg-red-50/60 border-red-100' },
            { label: 'Follow-ups Due', value: followUpTasks.length, color: 'text-amber-500', bg: 'bg-amber-50/60 border-amber-100' },
            { label: 'Reviews Pending', value: reviewTasks.length, color: 'text-sky-500', bg: 'bg-sky-50/60 border-sky-100' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`p-5 rounded-2xl border border-slate-100 ${bg} shadow-sm text-center`}>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-3xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap border-b border-slate-200/80 pb-2">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`filter-pill text-xs ${activeTab === tab.id ? 'active' : ''}`}
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
              className={`clean-pill-card p-5 border ${
                gap.priority === 'HIGH' ? 'border-red-200 bg-red-50/20' :
                gap.priority === 'MEDIUM' ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <PriorityBadge priority={gap.priority} />
                    <GapTypeChip type={gap.type} />
                    <span className="text-xs text-slate-400 font-mono font-medium">{gap.ageInDays}d elapsed</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="text-sm font-bold text-slate-900 hover:text-red-500 transition-colors"
                    >
                      {patient.name}
                    </button>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400 font-mono">{patient.id}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-medium">{patient.condition}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{gap.description}</p>
                  <div className="mt-2.5 w-48">
                    <ConfidenceBar score={gap.confidence} />
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 flex-shrink-0">
                  {(user?.role === 'CARE_COORDINATOR' || user?.role === 'ADMIN') && (
                    <>
                      <button
                        onClick={() => setContactTarget({ gap, patient })}
                        className="btn-soft-pill flex items-center gap-1.5 text-xs font-bold"
                      >
                        <Phone size={12} className="text-red-500" /> Contact Patient
                      </button>
                      <button
                        onClick={() => handleEscalate({ gap, patient })}
                        className="btn-soft-pill flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
                      >
                        <AlertTriangle size={12} className="text-amber-500" /> Escalate
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleMarkComplete({ gap, patient })}
                    className="btn-coral-pill flex items-center gap-1.5 text-xs font-bold"
                  >
                    <CheckCircle2 size={13} /> Mark Complete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {currentData.length === 0 && (
            <div className="clean-pill-card p-12 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-slate-900 font-bold text-sm">No tasks in this category</p>
              <p className="text-slate-400 text-xs mt-1">All care pathways for selected criteria are closed</p>
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
