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
    <div className="flex-1 overflow-y-auto">
      <TopBar
        title="Settings & Profile"
        subtitle="Manage your profile, permissions, and engine configuration"
      />

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Profile */}
        <div className="card p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <User size={16} className="text-cyan-400" /> Your Profile
          </h3>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
              {user?.avatar}
            </div>
            <div>
              <p className="text-white font-bold text-lg">{user?.name}</p>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold mt-1 inline-block ${roleConfig.bg} ${roleConfig.color}`}>
                {roleConfig.label}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                defaultValue={user?.name}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                defaultValue={user?.email}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Role & permissions */}
        <div className="card p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Shield size={16} className="text-cyan-400" /> Role & Permissions
          </h3>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border mb-4 ${roleConfig.bg}`}>
            <div className={`w-2 h-2 rounded-full bg-current ${roleConfig.color}`} />
            <span className={`font-bold text-sm ${roleConfig.color}`}>{roleConfig.label}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {roleConfig.permissions.map((perm) => (
              <div key={perm} className="flex items-center gap-2 text-sm">
                <span className="text-green-400">✓</span>
                <span className="text-slate-300">{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Engine thresholds (Admin only) */}
        {user?.role === 'ADMIN' && (
          <div className="card p-5">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <Settings size={16} className="text-cyan-400" /> Gap Engine Thresholds
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Configure the time-based thresholds used by the Care Gap Engine to classify gaps.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'RESULT_REVIEW_DAYS', label: 'Result Review Threshold', unit: 'days', desc: 'Days before result-not-reviewed becomes a gap' },
                { key: 'TEST_COMPLETION_DAYS', label: 'Test Completion Threshold', unit: 'days', desc: 'Days before pending test becomes overdue' },
                { key: 'REFERRAL_DAYS', label: 'Referral Threshold', unit: 'days', desc: 'Days before pending referral becomes a gap' },
                { key: 'FOLLOW_UP_OVERDUE_DAYS', label: 'Follow-up Overdue Threshold', unit: 'days', desc: 'Days before scheduled follow-up becomes overdue' },
              ].map(({ key, label, unit, desc }) => (
                <div key={key} className="bg-slate-700/30 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-200 mb-1">{label}</label>
                  <p className="text-xs text-slate-400 mb-2">{desc}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={thresholds[key]}
                      onChange={(e) => setThresholds({ ...thresholds, [key]: parseInt(e.target.value) })}
                      className="w-20 bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-sm text-slate-400">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="btn-primary mt-4 flex items-center gap-2">
              <Save size={14} />
              {saved ? 'Saved!' : 'Save Thresholds'}
            </button>
          </div>
        )}

        {/* Demo accounts info */}
        <div className="card p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Database size={16} className="text-cyan-400" /> Demo System Info
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-center">
            {[
              { label: 'Total Patients', value: patients.length },
              { label: 'Demo Users', value: DEMO_USERS.length },
              { label: 'Data Source', value: 'Synthetic' },
              { label: 'Version', value: '1.0.0' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className="text-white font-bold">{value}</p>
              </div>
            ))}
          </div>
          <SafetyDisclaimer />
          <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-blue-400 text-xs font-medium mb-1">CARELOOP v1.0 — Hackathon Demo</p>
            <p className="text-slate-400 text-xs">
              All patient data is synthetic and used for demonstration purposes only. 
              No real patient information is stored or processed. 
              CARELOOP detects workflow gaps only — it does not make clinical decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
