// CARELOOP - Analytics Page
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area
} from 'recharts';
import { useApp } from '../context/AppContext';
import { detectCareGaps, getAggregateStats, GAP_TYPE_LABELS } from '../engine/careGapEngine';
import { SectionHeader } from '../components/shared/UI';
import { TopBar } from '../components/shared/Navigation';

const CHART_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#f97316'];
const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '12px',
  },
  cursor: { fill: '#334155' }
};

export function AnalyticsPage() {
  const { patients } = useApp();
  const stats = getAggregateStats(patients);

  // Gap type distribution
  const gapTypeData = Object.entries(GAP_TYPE_LABELS).map(([key, label]) => ({
    name: label,
    count: stats.allGaps.filter((g) => g.type === key).length,
  })).filter((d) => d.count > 0);

  // Patients by care status
  const statusData = [
    { name: 'Gap Detected', value: patients.filter((p) => p.careStatus === 'GAP_DETECTED').length, color: '#ef4444' },
    { name: 'In Progress', value: patients.filter((p) => p.careStatus === 'IN_PROGRESS').length, color: '#06b6d4' },
    { name: 'Closed', value: patients.filter((p) => p.careStatus === 'CLOSED').length, color: '#10b981' },
  ];

  // Gaps by patient
  const gapsByPatient = patients
    .map((p) => ({
      name: p.name.split(' ')[0],
      gaps: detectCareGaps(p).length,
      condition: p.condition,
    }))
    .sort((a, b) => b.gaps - a.gaps)
    .slice(0, 8);

  // Priority breakdown by gap type
  const priorityByType = Object.keys(GAP_TYPE_LABELS).map((type) => {
    const typeGaps = stats.allGaps.filter((g) => g.type === type);
    return {
      name: GAP_TYPE_LABELS[type]?.split(' ').slice(0, 2).join(' ') || type,
      HIGH: typeGaps.filter((g) => g.priority === 'HIGH').length,
      MEDIUM: typeGaps.filter((g) => g.priority === 'MEDIUM').length,
      LOW: typeGaps.filter((g) => g.priority === 'LOW').length,
    };
  }).filter((d) => d.HIGH + d.MEDIUM + d.LOW > 0);

  // Simulated confidence trend
  const confidenceData = patients.flatMap((p) => detectCareGaps(p)).map((g, i) => ({
    gap: i + 1,
    confidence: g.confidence,
    priority: g.priority,
  }));

  // Workflow completion rates
  const stages = ['CONSULTATION', 'TEST_ORDERED', 'TEST_COMPLETED', 'RESULT_AVAILABLE', 'DOCTOR_REVIEW', 'REFERRAL', 'FOLLOW_UP', 'CARE_CLOSED'];
  const stageLabels = {
    CONSULTATION: 'Consult',
    TEST_ORDERED: 'Test Ord.',
    TEST_COMPLETED: 'Test Done',
    RESULT_AVAILABLE: 'Result',
    DOCTOR_REVIEW: 'Review',
    REFERRAL: 'Referral',
    FOLLOW_UP: 'Follow-up',
    CARE_CLOSED: 'Closed',
  };
  const workflowCompletion = stages.map((stage) => {
    const completed = patients.filter((p) => {
      const e = p.careEvents?.find((ev) => ev.stage === stage);
      return e?.status === 'COMPLETED' || e?.status === 'NOT_REQUIRED';
    }).length;
    return {
      stage: stageLabels[stage],
      rate: Math.round((completed / patients.length) * 100),
    };
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <TopBar
        title="Analytics"
        subtitle="Care gap trends and workflow performance metrics"
      />
      <div className="p-6 space-y-6">
        {/* Key metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Patients', value: stats.totalPatients, color: 'text-cyan-400' },
            { label: 'Open Gaps', value: stats.openGaps, color: 'text-red-400' },
            { label: 'Avg. Gaps/Patient', value: (stats.openGaps / Math.max(stats.totalPatients, 1)).toFixed(1), color: 'text-amber-400' },
            { label: 'Care Closure Rate', value: `${stats.careClosureRate}%`, color: 'text-green-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 text-center">
              <p className="text-slate-400 text-xs mb-1">{label}</p>
              <p className={`text-3xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Workflow completion funnel */}
          <div className="card p-5">
            <SectionHeader title="Workflow Completion Rate" subtitle="% of patients completing each stage" />
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={workflowCompletion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="stage" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} unit="%" domain={[0, 100]} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Completion Rate']} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Patients by status */}
          <div className="card p-5">
            <SectionHeader title="Patients by Care Status" subtitle="Distribution across all patients" />
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#64748b' }}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Gaps by patient */}
          <div className="card p-5">
            <SectionHeader title="Open Gaps by Patient" subtitle="Top patients by gap count" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gapsByPatient} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={70} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="gaps" fill="#ef4444" radius={[0, 4, 4, 0]} name="Open Gaps" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gap type distribution */}
          <div className="card p-5">
            <SectionHeader title="Gap Type Distribution" subtitle="Breakdown by gap category" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gapTypeData} margin={{ bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 9 }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 3 - Priority by type stacked */}
        <div className="card p-5">
          <SectionHeader title="Priority Distribution by Gap Type" subtitle="HIGH / MEDIUM / LOW breakdown across gap categories" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={priorityByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
              <Bar dataKey="HIGH" stackId="a" fill="#ef4444" name="HIGH" />
              <Bar dataKey="MEDIUM" stackId="a" fill="#f59e0b" name="MEDIUM" />
              <Bar dataKey="LOW" stackId="a" fill="#3b82f6" name="LOW" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence distribution table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="font-bold text-white">Gap Confidence Summary</h2>
            <p className="text-xs text-slate-400 mt-0.5">Confidence scores for all detected gaps</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Gap Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Confidence</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification</th>
                </tr>
              </thead>
              <tbody>
                {stats.allGaps.map((gap) => {
                  const patient = patients.find((p) => p.id === gap.patientId);
                  const needsVerification = gap.confidence < 70;
                  return (
                    <tr key={gap.id} className="border-b border-slate-700/50">
                      <td className="px-4 py-3 text-sm text-white">{patient?.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{GAP_TYPE_LABELS[gap.type]}</td>
                      <td className="px-4 py-3">
                        <span className={
                          gap.priority === 'HIGH' ? 'badge-high' :
                          gap.priority === 'MEDIUM' ? 'badge-medium' : 'badge-low'
                        }>{gap.priority}</span>
                      </td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${gap.confidence >= 85 ? 'bg-green-500' : gap.confidence >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${gap.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-slate-300 w-9">{gap.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {needsVerification ? (
                          <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            Manual Verification Required
                          </span>
                        ) : (
                          <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                            High Confidence
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
