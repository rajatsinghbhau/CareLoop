// CARELOOP - Main Dashboard
import React from 'react';
import {
  Users, AlertCircle, TrendingUp, Clock, CalendarCheck, CheckCircle2,
  ArrowRight, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { getAggregateStats, detectCareGaps, PRIORITY } from '../engine/careGapEngine';
import {
  StatCard, PriorityBadge, CareStatusBadge, ConfidenceBar,
  ActivityItem, GapTypeChip, SafetyDisclaimer, SectionHeader, Td, Th, TableRow
} from '../components/shared/UI';
import { TopBar } from '../components/shared/Navigation';
import { STAGE_LABELS } from '../data/patients';

const PRIORITY_COLORS = {
  HIGH: '#e84343',
  MEDIUM: '#f59e0b',
  LOW: '#38bdf8',
};

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#ffffff',
    border: '1px solid #f1f5f9',
    borderRadius: '16px',
    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
    color: '#0f172a',
    fontSize: '12px',
    fontWeight: '600'
  },
  cursor: { fill: '#f8fafc' }
};

export function DashboardPage({ onNavigate, onSelectPatient }) {
  const { patients, activityLog, doctors, coordinators } = useApp();
  const stats = getAggregateStats(patients);

  const allGaps = stats.allGaps.map((gap) => {
    const patient = patients.find((p) => p.id === gap.patientId);
    const doctor = doctors.find((d) => d.id === patient?.doctorId);
    return { ...gap, patient, doctor };
  });

  // Workflow stage aggregate
  const stageCounts = {};
  for (const stage of Object.keys(STAGE_LABELS)) {
    const completed = patients.filter((p) => {
      const e = p.careEvents?.find((ev) => ev.stage === stage);
      return e?.status === 'COMPLETED' || e?.status === 'NOT_REQUIRED';
    }).length;
    stageCounts[stage] = completed;
  }

  const stageChartData = Object.entries(STAGE_LABELS).map(([key, label]) => ({
    name: label.split(' ')[0],
    completed: stageCounts[key] || 0,
    total: patients.length,
  }));

  const priorityData = [
    { name: 'HIGH', value: stats.highPriorityGaps, color: '#e84343' },
    { name: 'MEDIUM', value: stats.mediumPriorityGaps, color: '#f59e0b' },
    { name: 'LOW', value: stats.lowPriorityGaps, color: '#38bdf8' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfcff]">
      <TopBar
        title="Dashboard"
        subtitle="Care continuity telemetry across all registered patient pathways"
        actions={<SafetyDisclaimer />}
      />

      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            icon={Users}
            label="Active Patients"
            value={stats.totalPatients}
            color="sky"
            onClick={() => onNavigate('patients')}
          />
          <StatCard
            icon={AlertCircle}
            label="Open Care Gaps"
            value={stats.openGaps}
            color="red"
            onClick={() => onNavigate('gaps')}
          />
          <StatCard
            icon={TrendingUp}
            label="High Priority"
            value={stats.highPriorityGaps}
            color="red"
            onClick={() => onNavigate('gaps')}
          />
          <StatCard
            icon={Clock}
            label="Pending Reviews"
            value={stats.pendingReviews}
            color="amber"
          />
          <StatCard
            icon={CalendarCheck}
            label="Follow-ups Due"
            value={stats.followUpsDue}
            color="amber"
          />
          <StatCard
            icon={CheckCircle2}
            label="Closure Rate"
            value={`${stats.careClosureRate}%`}
            color="green"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Care journey overview */}
          <div className="clean-pill-card lg:col-span-2">
            <SectionHeader
              title="Care Journey Overview"
              subtitle="Completed workflow milestones across patient cohort"
            />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="completed" fill="#38bdf8" radius={[8, 8, 0, 0]} name="Completed" />
                <Bar dataKey="total" fill="#e2e8f0" radius={[8, 8, 0, 0]} name="Total Cohort" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Priority breakdown */}
          <div className="clean-pill-card">
            <SectionHeader
              title="Priority Distribution"
              subtitle="Gaps sorted by urgency"
            />
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-around pt-3 border-t border-slate-100 text-xs font-semibold">
              <span className="text-[#e84343] flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#e84343]" /> High: {stats.highPriorityGaps}</span>
              <span className="text-amber-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Med: {stats.mediumPriorityGaps}</span>
              <span className="text-sky-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-400" /> Low: {stats.lowPriorityGaps}</span>
            </div>
          </div>
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Open Care Gaps Table */}
          <div className="clean-pill-card lg:col-span-2 overflow-hidden p-0">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Active Care Gaps</h3>
                <p className="text-xs text-slate-500 mt-0.5">Prioritized by severity and workflow blockage</p>
              </div>
              <button
                onClick={() => onNavigate('gaps')}
                className="text-xs font-bold text-[#e84343] hover:underline flex items-center gap-1"
              >
                View all gaps <ArrowRight size={13} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <Th>Patient</Th>
                    <Th>Gap Type</Th>
                    <Th>Priority</Th>
                    <Th>Confidence</Th>
                    <Th>Age</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {allGaps.slice(0, 5).map((gap) => (
                    <TableRow key={gap.id} highlight={gap.priority === 'HIGH'}>
                      <Td>
                        <button
                          onClick={() => onSelectPatient && onSelectPatient(gap.patientId)}
                          className="text-left font-bold text-slate-900 hover:text-[#e84343] transition-colors"
                        >
                          {gap.patient?.name}
                          <span className="text-[11px] text-slate-400 block font-normal">{gap.patient?.condition}</span>
                        </button>
                      </Td>
                      <Td><GapTypeChip type={gap.type} /></Td>
                      <Td><PriorityBadge priority={gap.priority} /></Td>
                      <Td className="min-w-[100px]"><ConfidenceBar score={gap.confidence} /></Td>
                      <Td className="font-mono text-slate-500">{gap.ageInDays}d</Td>
                      <Td>
                        <button
                          onClick={() => onSelectPatient && onSelectPatient(gap.patientId)}
                          className="btn-coral-sm text-[11px] py-1.5 px-3"
                        >
                          Inspect
                        </button>
                      </Td>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity stream */}
          <div className="clean-pill-card">
            <SectionHeader
              title="Continuity Activity"
              subtitle="Real-time clinical event feed"
            />
            <div className="space-y-4 pt-1">
              {activityLog.slice(0, 6).map((item) => (
                <ActivityItem key={item.id} activity={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
