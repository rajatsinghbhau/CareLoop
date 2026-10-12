// CARELOOP - Shared Clinical UI Components
import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Calendar, Shield, ArrowRight, UserCheck } from 'lucide-react';

export function PriorityBadge({ priority }) {
  if (!priority) return null;
  const classes = {
    HIGH: 'badge-high',
    MEDIUM: 'badge-medium',
    LOW: 'badge-low',
  };
  return <span className={classes[priority] || 'badge-low'}>{priority}</span>;
}

export function CareStatusBadge({ status }) {
  const config = {
    CLOSED: { cls: 'badge-closed', label: '✓ Care Closed' },
    IN_PROGRESS: { cls: 'badge-in-progress', label: 'In Progress' },
    GAP_DETECTED: { cls: 'badge-high', label: '⚠ Care Gap Detected' },
  };
  const c = config[status] || config.IN_PROGRESS;
  return <span className={c.cls}>{c.label}</span>;
}

export function ConfidenceBar({ score }) {
  const color =
    score >= 85 ? 'bg-emerald-600' : score >= 65 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-mono font-semibold text-slate-700 w-8 text-right">{score}%</span>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, color = 'teal', onClick }) {
  const colors = {
    teal: 'bg-teal-50/60 border-teal-200/80 text-teal-800',
    rose: 'bg-rose-50/60 border-rose-200/80 text-rose-800',
    amber: 'bg-amber-50/60 border-amber-200/80 text-amber-800',
    emerald: 'bg-emerald-50/60 border-emerald-200/80 text-emerald-800',
    slate: 'bg-slate-50 border-slate-200 text-slate-800',
  };

  return (
    <div
      onClick={onClick}
      className={`card p-4 transition-all duration-150 ${onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg border ${colors[color] || colors.slate}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export function SafetyDisclaimer() {
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-lg px-3 py-2 text-xs text-slate-600">
      <Shield size={14} className="text-teal-600 flex-shrink-0" />
      <span>
        <strong className="text-slate-900 font-semibold">CARELOOP Intelligence:</strong> Identifies care pathway workflow breaks for staff verification. Does not issue clinical diagnoses.
      </span>
    </div>
  );
}

export function Modal({ title, children, onClose, width = 'max-w-2xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className={`bg-white border border-slate-200 rounded-xl w-full ${width} max-h-[90vh] flex flex-col shadow-xl animate-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors text-xl leading-none"
          >
            ×
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
    <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-medium border border-slate-200">
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
  return <td className={`px-4 py-3 text-sm text-slate-700 ${className}`}>{children}</td>;
}

export function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/60 ${className}`}>
      {children}
    </th>
  );
}

export function ActivityItem({ activity }) {
  return (
    <div className="flex items-start gap-3 text-xs">
      <div className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-slate-700 font-medium">{activity.message}</p>
        <span className="text-slate-400 text-[11px]">Just now</span>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="p-3 bg-slate-100 rounded-full mb-3 text-slate-400">
          <Icon size={24} />
        </div>
      )}
      <p className="text-slate-800 font-medium text-sm">{title}</p>
      {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
