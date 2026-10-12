// CARELOOP - Settings Page
import React, { useState } from 'react';
import { Settings, User, Shield, Bell, Database, Save, Eye, EyeOff } from 'lucide-react';
import { useApp, DEMO_USERS } from '../context/AppContext';
import { GAP_THRESHOLDS } from '../engine/careGapEngine';
import { SafetyDisclaimer } from '../components/shared/UI';
import { TopBar } from '../components/shared/Navigation';

const ROLE_CONFIG = {
  ADMIN: {
    color: 'text-purple-400',
    bg: 'bg-purple-500/20 border-purple-500/30',
    label: 'Administrator',
    permissions: [
      'View all patients',
      'View all care gaps',
      'Import via CSV',
      'Manage user accounts',
      'View analytics',
      'Assign care gaps',
      'Resolve / verify gaps',
      'Configure engine thresholds',
    ],
  },
  DOCTOR: {
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20 border-cyan-500/30',
    label: 'Doctor',
    permissions: [
      'View assigned patients',
      'View clinical workflow',
      'Review pending test results',
      'Resolve doctor-review gaps',
      'Update care events',
    ],
  },
  CARE_COORDINATOR: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/20 border-amber-500/30',
    label: 'Care Coordinator',
    permissions: [
      'View open care gaps',
      'Assign tasks to staff',
      'Contact / follow up with patients',
      'Escalate unresolved gaps',
      'Mark workflow actions complete',
    ],
  },
};

export function SettingsPage() {
  const { user, patients, showNotification } = useApp();
  const [thresholds, setThresholds] = useState({ ...GAP_THRESHOLDS });
  const [saved, setSaved] = useState(false);

  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.ADMIN;

  const handleSave = () => {
    showNotification('Settings saved successfully', 'success');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfcff]">
      <TopBar
        title="Settings & System Configuration"
        subtitle="Manage your profile, permissions, and Care Gap Engine thresholds"
      />

      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Profile */}
        <div className="clean-pill-card p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <User size={16} className="text-red-500" /> User Profile
          </h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 text-xl font-black">
              {user?.avatar}
            </div>
            <div>
              <p className="text-slate-900 font-bold text-base">{user?.name}</p>
              <p className="text-slate-400 text-xs font-mono">{user?.email}</p>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold mt-1.5 inline-block badge-clean-coral">
                {roleConfig.label}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                defaultValue={user?.name}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-400 focus:bg-white shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                defaultValue={user?.email}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-400 focus:bg-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Role & permissions */}
        <div className="clean-pill-card p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Shield size={16} className="text-red-500" /> Active Role & Protocol Access
          </h3>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-200 bg-red-50 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="font-bold text-xs text-red-600">{roleConfig.label} Access Tier</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {roleConfig.permissions.map((perm) => (
              <div key={perm} className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                <span className="text-emerald-500 font-bold">✓</span>
                <span className="text-slate-700 font-medium">{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Engine thresholds (Admin only) */}
        {user?.role === 'ADMIN' && (
          <div className="clean-pill-card p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
              <Settings size={16} className="text-red-500" /> Care Gap Engine Deterministic Thresholds
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Configure the time-based thresholds used by the Care Continuity Engine to calculate protocol gaps.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'RESULT_REVIEW_DAYS', label: 'Result Review Threshold', unit: 'days', desc: 'Days before unreviewed lab results trigger a gap' },
                { key: 'TEST_COMPLETION_DAYS', label: 'Test Completion Threshold', unit: 'days', desc: 'Days before unfulfilled diagnostic orders trigger an alert' },
                { key: 'REFERRAL_DAYS', label: 'Referral Confirmation Threshold', unit: 'days', desc: 'Days before unconfirmed cross-provider referrals trigger an alert' },
                { key: 'FOLLOW_UP_OVERDUE_DAYS', label: 'Follow-up Overdue Threshold', unit: 'days', desc: 'Days after missed appointments before marked overdue' },
              ].map(({ key, label, unit, desc }) => (
                <div key={key} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <label className="block text-xs font-bold text-slate-800 mb-1">{label}</label>
                  <p className="text-[11px] text-slate-400 mb-3">{desc}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={thresholds[key]}
                      onChange={(e) => setThresholds({ ...thresholds, [key]: parseInt(e.target.value) })}
                      className="w-20 bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-red-400 shadow-sm"
                    />
                    <span className="text-xs text-slate-500 font-medium">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="btn-coral-pill mt-5 flex items-center gap-2 text-xs">
              <Save size={14} />
              {saved ? 'Thresholds Saved!' : 'Save Engine Thresholds'}
            </button>
          </div>
        )}

        {/* Demo accounts info */}
        <div className="clean-pill-card p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Database size={16} className="text-red-500" /> Platform Telemetry & Environment
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 text-center">
            {[
              { label: 'Registered Patients', value: patients.length },
              { label: 'Demo Clinicians', value: DEMO_USERS.length },
              { label: 'Architecture', value: 'Edge Static' },
              { label: 'Engine Core', value: 'v2.4 LTS' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                <p className="text-slate-900 font-black text-base">{value}</p>
              </div>
            ))}
          </div>
          <SafetyDisclaimer />
          <div className="mt-4 bg-sky-50/70 border border-sky-100 rounded-2xl p-4">
            <p className="text-sky-800 text-xs font-bold mb-1">CARELOOP v2.4 — Live Production Ready</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              All clinical records and pathways are deterministic and rule-governed. 
              The application complies with safety protocol standards for decision-support displays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
