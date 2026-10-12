// CARELOOP - Shared Clinical UI Components
import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Calendar, Shield, ArrowRight, UserCheck } from 'lucide-react';

export function PriorityBadge({ priority }) {
  if (!priority) return null;
  const classes = {
    HIGH: 'badge-clean-coral',
    MEDIUM: 'bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1',
    LOW: 'badge-clean-sky',
  };
  return <span className={classes[priority] || 'badge-clean-sky'}>{priority}</span>;
}

export function CareStatusBadge({ status }) {
  const config = {
    CLOSED: { cls: 'badge-clean-emerald', label: '✓ Care Closed' },
    IN_PROGRESS: { cls: 'badge-clean-sky', label: 'In Progress' },
    GAP_DETECTED: { cls: 'badge-clean-coral', label: '⚠ Care Gap Detected' },
  };
  const c = config[status] || config.IN_PROGRESS;
  return <span className={c.cls}>{c.label}</span>;
}

export function ConfidenceBar({ score }) {
  const color =
    score >= 85 ? 'bg-emerald-500' : score >= 65 ? 'bg-amber-500' : 'bg-[#e84343]';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-slate-700 w-8 text-right">{score}%</span>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, color = 'sky', onClick }) {
  const colors = {
    cyan: 'bg-sky-50 border-sky-100 text-sky-700',
    sky: 'bg-sky-50 border-sky-100 text-sky-700',
    red: 'bg-rose-50 border-rose-100 text-[#e84343]',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    green: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    slate: 'bg-slate-50 border-slate-100 text-slate-700',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md p-5 transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-slate-200' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl border ${colors[color] || colors.slate}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export function SafetyDisclaimer() {
  return (
    <div className="flex items-center gap-2 bg-sky-50/70 border border-sky-100 rounded-full px-4 py-1.5 text-xs text-slate-600">
      <Shield size={14} className="text-sky-600 shrink-0" />
      <span>
        <strong className="text-slate-900 font-bold">Clinical Process Intelligence:</strong> Identifies care pathway workflow breaks for staff verification. Does not issue autonomous medical diagnoses.
      </span>
    </div>
  );
}

export function Modal({ title, children, onClose, width = 'max-w-2xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4">
      <div className={`bg-white border border-slate-100 rounded-3xl w-full ${width} max-h-[90vh] flex flex-col shadow-2xl animate-in`}>
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-base">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function GapTypeChip({ type }) {
  const labels = {
    TEST_NOT_COMPLETED: 'Diagnostic Not Completed',
    RESULT_PENDING: 'Result Pending',
    RESULT_NOT_REVIEWED: 'Doctor Review Pending',
    REFERRAL_PENDING: 'Referral Pending',
    SPECIALIST_PENDING: 'Specialist Visit Pending',
    FOLLOW_UP_OVERDUE: 'Follow-up Overdue',
    CARE_LOOP_UNCLOSED: 'Care Loop Unclosed',
    MISSING_EVENT: 'Missing Event',
  };
  return (
    <span className="bg-slate-50 text-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-slate-200">
      {labels[type] || type}
    </span>
  );
}

export function TableRow({ children, onClick, highlight }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-slate-100 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-slate-50/80' : ''
      } ${highlight ? 'bg-rose-50/30' : ''}`}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className = '' }) {
  return <td className={`px-4 py-3.5 text-xs text-slate-700 font-medium ${className}`}>{children}</td>;
}

export function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3.5 text-left text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/60 ${className}`}>
      {children}
    </th>
  );
}

export function ActivityItem({ activity }) {
  return (
    <div className="flex items-start gap-3 text-xs">
      <div className="w-2 h-2 rounded-full bg-[#e84343] mt-1.5 shrink-0" />
      <div className="flex-1">
        <p className="text-slate-700 font-semibold">{activity.message}</p>
        <span className="text-slate-400 text-[11px]">Recent update</span>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="p-3.5 bg-rose-50 rounded-2xl mb-3 text-[#e84343] border border-rose-100">
          <Icon size={24} />
        </div>
      )}
      <p className="text-slate-800 font-bold text-sm">{title}</p>
      {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
