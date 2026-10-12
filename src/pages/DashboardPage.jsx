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
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#3b82f6',
};

export function DashboardPage({ onNavigate }) {
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
    name: label.replace(' ', '\n'),
    completed: stageCounts[key] || 0,
    total: patients.length,
  }));

  const priorityData = [
    { name: 'HIGH', value: stats.highPriorityGaps, color: '#ef4444' },
    { name: 'MEDIUM', value: stats.mediumPriorityGaps, color: '#f59e0b' },
    { name: 'LOW', value: stats.lowPriorityGaps, color: '#3b82f6' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar
        title="Dashboard"
        subtitle="Care gap overview across all active patients"
        actions={
          <SafetyDisclaimer />
        }
      />
      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            icon={Users}
            label="Active Patients"
            value={stats.totalPatients}
            color="cyan"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Care journey overview */}
          <div className="card p-5 lg:col-span-2">
            <SectionHeader
              title="Care Journey Overview"
              subtitle="Patients who have completed each workflow stage"
            />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageChartData} margin={{ top: 0, right: 0, left: -30, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                  cursor={{ fill: '#334155' }}
                />
                <Bar dataKey="completed" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="total" fill="#1e293b" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Priority distribution */}
          <div className="card p-5">
            <SectionHeader title="Gap Priority" subtitle="Distribution of open gaps" />
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  labelLine={{ stroke: '#64748b' }}
                >
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {priorityData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-400">{d.name}: <span className="text-white font-bold">{d.value}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Open gaps table + activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Open care gaps table */}
          <div className="card lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <div>
                <h2 className="font-bold text-white">Open Care Gaps</h2>
                <p className="text-xs text-slate-400 mt-0.5">{allGaps.length} gaps require attention</p>
              </div>
              <button
                onClick={() => onNavigate('gaps')}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/60">
                  <tr>
                    <Th>Patient</Th>
                    <Th>Gap Type</Th>
                    <Th>Priority</Th>
                    <Th>Confidence</Th>
                    <Th>Age</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {allGaps.slice(0, 8).map((gap) => (
                    <TableRow key={gap.id}>
                      <Td>
                        <div>
                          <p className="font-medium text-white text-xs">{gap.patient?.name}</p>
                          <p className="text-slate-500 text-xs">{gap.patientId}</p>
                        </div>
                      </Td>
                      <Td><GapTypeChip type={gap.type} /></Td>
                      <Td><PriorityBadge priority={gap.priority} /></Td>
                      <Td className="min-w-[100px]"><ConfidenceBar score={gap.confidence} /></Td>
                      <Td className="text-slate-400 text-xs">{gap.ageInDays}d</Td>
                      <Td>
                        <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          OPEN
                        </span>
                      </Td>
                    </TableRow>
                  ))}
                  {allGaps.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500 text-sm">
                        No open care gaps detected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity log */}
          <div className="card p-5">
            <SectionHeader title="Recent Activity" subtitle="Latest care workflow updates" />
            <div className="space-y-4">
              {activityLog.slice(0, 8).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
