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

const CHART_COLORS = ['#ef4444', '#0284c7', '#8b5cf6', '#f59e0b', '#10b981', '#f97316', '#64748b'];
const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    color: '#0f172a',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    fontWeight: '500',
  },
  cursor: { fill: '#f8fafc' }
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
    { name: 'In Progress', value: patients.filter((p) => p.careStatus === 'IN_PROGRESS').length, color: '#0284c7' },
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
    <div className="flex-1 overflow-y-auto bg-[#fbfcff]">
      <TopBar
        title="Analytics & Telemetry"
        subtitle="Care continuity trends and cross-provider performance metrics"
      />
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Key metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Patients Tracked', value: stats.totalPatients, color: 'text-slate-900', bg: 'bg-white' },
            { label: 'Open Protocol Gaps', value: stats.openGaps, color: 'text-red-500', bg: 'bg-red-50/60 border-red-100' },
            { label: 'Avg. Gaps / Journey', value: (stats.openGaps / Math.max(stats.totalPatients, 1)).toFixed(1), color: 'text-amber-500', bg: 'bg-amber-50/60 border-amber-100' },
            { label: 'Care Closure Rate', value: `${stats.careClosureRate}%`, color: 'text-emerald-500', bg: 'bg-emerald-50/60 border-emerald-100' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`p-5 rounded-2xl border border-slate-100 ${bg} shadow-sm text-center`}>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-3xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workflow completion funnel */}
          <div className="clean-pill-card p-6">
            <SectionHeader title="Protocol Completion Velocity" subtitle="% of patients successfully completing each clinical gate" />
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={workflowCompletion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" domain={[0, 100]} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Completion Rate']} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.12}
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Patients by status */}
          <div className="clean-pill-card p-6">
            <SectionHeader title="Patients by Care Continuity Status" subtitle="Distribution across all registered pathways" />
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#cbd5e1' }}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gaps by patient */}
          <div className="clean-pill-card p-6">
            <SectionHeader title="Open Gaps by Patient" subtitle="Top patients requiring clinical reconciliation" />
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={gapsByPatient} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} width={70} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="gaps" fill="#ef4444" radius={[0, 6, 6, 0]} name="Open Gaps" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gap type distribution */}
          <div className="clean-pill-card p-6">
            <SectionHeader title="Gap Type Categorization" subtitle="Frequency of protocol breakdown categories" />
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={gapTypeData} margin={{ bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 9 }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 3 - Priority by type stacked */}
        <div className="clean-pill-card p-6">
          <SectionHeader title="Priority Distribution by Gap Type" subtitle="HIGH / MEDIUM / LOW breakdown across clinical protocol categories" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={priorityByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: '#475569', fontSize: '11px', fontWeight: 600 }} />
              <Bar dataKey="HIGH" stackId="a" fill="#ef4444" name="HIGH Priority" />
              <Bar dataKey="MEDIUM" stackId="a" fill="#f59e0b" name="MEDIUM Priority" />
              <Bar dataKey="LOW" stackId="a" fill="#0284c7" name="LOW Priority" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence distribution table */}
        <div className="clean-pill-card overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm">Gap Confidence Summary</h2>
            <p className="text-xs text-slate-400 mt-0.5">Automated confidence scoring for all detected care gaps</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Gap Type</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.allGaps.map((gap) => {
                  const patient = patients.find((p) => p.id === gap.patientId);
                  const needsVerification = gap.confidence < 70;
                  return (
                    <tr key={gap.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-bold text-slate-900">{patient?.name}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">{GAP_TYPE_LABELS[gap.type]}</td>
                      <td className="px-5 py-3.5">
                        <span className={
                          gap.priority === 'HIGH' ? 'badge-clean-coral font-bold text-[10px]' :
                          gap.priority === 'MEDIUM' ? 'badge-clean-amber font-bold text-[10px]' : 'badge-clean-sky font-bold text-[10px]'
                        }>{gap.priority}</span>
                      </td>
                      <td className="px-5 py-3.5 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${gap.confidence >= 85 ? 'bg-emerald-500' : gap.confidence >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${gap.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-700 w-9">{gap.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {needsVerification ? (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full">
                            Manual Verification Required
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full">
                            High Confidence Automated
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
