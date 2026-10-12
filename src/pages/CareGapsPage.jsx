// CARELOOP - Care Gaps Page (All Gaps View)
import React, { useState, useMemo } from 'react';
import { Filter, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectCareGaps, GAP_TYPE_LABELS } from '../engine/careGapEngine';
import {
  PriorityBadge, GapTypeChip, ConfidenceBar, CareStatusBadge,
  SafetyDisclaimer, Modal, Td, Th, TableRow
} from '../components/shared/UI';
import { TopBar } from '../components/shared/Navigation';

const PRIORITY_FILTERS = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];
const GAP_TYPE_FILTERS = ['ALL', 'RESULT_NOT_REVIEWED', 'FOLLOW_UP_OVERDUE', 'TEST_NOT_COMPLETED', 'REFERRAL_PENDING', 'RESULT_PENDING', 'CARE_LOOP_UNCLOSED', 'MISSING_EVENT'];

function GapDetailModal({ gap, patient, onClose, onResolve }) {
  return (
    <Modal title="Care Gap Details" onClose={onClose} width="max-w-3xl">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <PriorityBadge priority={gap.priority} />
              <GapTypeChip type={gap.type} />
              <span className="text-xs text-slate-400 font-medium">Age: {gap.ageInDays} day(s)</span>
            </div>
            <p className="text-slate-900 font-bold text-base">{gap.description}</p>
            <p className="text-slate-500 text-xs mt-1.5">
              Patient: <span className="text-slate-800 font-semibold">{patient?.name}</span> ({gap.patientId}) · 
              Condition: <span className="text-slate-800 font-semibold">{patient?.condition}</span>
            </p>
          </div>
        </div>

        {/* Confidence */}
        <div className="clean-pill-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-slate-800 text-sm">Continuity Confidence Analysis</p>
            <span className="text-lg font-black text-slate-900">{gap.confidence}%</span>
          </div>
          <ConfidenceBar score={gap.confidence} />
          {gap.confidence < 70 && (
            <p className="text-amber-600 text-xs mt-2.5 flex items-center gap-1 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200">
              <Info size={12} /> Low confidence — this gap requires manual human verification before taking medical action
            </p>
          )}
          <div className="grid grid-cols-1 gap-1.5 mt-3 pt-3 border-t border-slate-100">
            {gap.confidenceFactors?.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={f.met ? 'text-emerald-500 font-bold' : 'text-slate-300'}>
                  {f.met ? '✓' : '○'}
                </span>
                <span className={f.met ? 'text-slate-700 font-medium' : 'text-slate-400'}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reasons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="clean-pill-card p-4">
            <p className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-2">
              <AlertCircle size={14} className="text-red-500" /> Gap Reasons
            </p>
            {gap.reasons?.map((r, i) => (
              <p key={i} className="text-xs text-slate-600 flex items-start gap-2 mb-1.5">
                <span className="text-red-500 mt-0.5 flex-shrink-0 font-bold">•</span>{r}
              </p>
            ))}
          </div>
          <div className="clean-pill-card p-4">
            <p className="font-bold text-slate-800 text-xs mb-3">Priority Reasons ({gap.priority})</p>
            {gap.priorityReasons?.map((r, i) => (
              <p key={i} className="text-xs text-slate-600 flex items-start gap-2 mb-1.5">
                <span className="text-amber-500 mt-0.5 flex-shrink-0 font-bold">•</span>{r}
              </p>
            ))}
          </div>
        </div>

        <SafetyDisclaimer />

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn-soft-pill text-xs">Close</button>
          <button
            onClick={() => { onResolve(); onClose(); }}
            className="btn-coral-pill text-xs flex items-center gap-2"
          >
            <CheckCircle2 size={14} />
            Resolve Gap
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function CareGapsPage({ onSelectPatient }) {
  const { patients, dispatch, showNotification, user } = useApp();
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedGap, setSelectedGap] = useState(null);
  const [sortBy, setSortBy] = useState('priority');

  const allGapsWithPatient = useMemo(() => {
    return patients.flatMap((p) => {
      const gaps = detectCareGaps(p);
      return gaps.map((g) => ({ ...g, patient: p }));
    });
  }, [patients]);

  const filtered = useMemo(() => {
    let result = allGapsWithPatient;
    if (priorityFilter !== 'ALL') result = result.filter((g) => g.priority === priorityFilter);
    if (typeFilter !== 'ALL') result = result.filter((g) => g.type === typeFilter);

    if (sortBy === 'priority') {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      result = [...result].sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sortBy === 'age') {
      result = [...result].sort((a, b) => b.ageInDays - a.ageInDays);
    } else if (sortBy === 'confidence') {
      result = [...result].sort((a, b) => b.confidence - a.confidence);
    }

    return result;
  }, [allGapsWithPatient, priorityFilter, typeFilter, sortBy]);

  const handleResolveGap = (gap) => {
    const notes = `Gap resolved by ${user?.name}. Stage marked as completed.`;
    dispatch({
      type: 'RESOLVE_GAP',
      payload: {
        patientId: gap.patientId,
        stage: gap.affectedStage,
        resolution: notes,
        resolvedBy: user?.name || 'Staff',
      },
    });
    showNotification(`Gap resolved for ${gap.patient?.name}`, 'success');
    setSelectedGap(null);
  };

  const gapStats = {
    high: allGapsWithPatient.filter((g) => g.priority === 'HIGH').length,
    medium: allGapsWithPatient.filter((g) => g.priority === 'MEDIUM').length,
    low: allGapsWithPatient.filter((g) => g.priority === 'LOW').length,
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfcff]">
      <TopBar
        title="Care Gaps"
        subtitle={`${allGapsWithPatient.length} open gaps across all active patient records`}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Priority summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'HIGH Priority Gaps', count: gapStats.high, color: 'text-red-500', bg: 'bg-red-50/70 border-red-100', pill: 'badge-clean-coral' },
            { label: 'MEDIUM Priority Gaps', count: gapStats.medium, color: 'text-amber-500', bg: 'bg-amber-50/70 border-amber-100', pill: 'badge-clean-amber' },
            { label: 'LOW Priority Gaps', count: gapStats.low, color: 'text-sky-500', bg: 'bg-sky-50/70 border-sky-100', pill: 'badge-clean-sky' },
          ].map(({ label, count, color, bg, pill }) => (
            <div key={label} className={`p-5 rounded-2xl border ${bg} transition-all hover:shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pill}`}>Open</span>
              </div>
              <p className={`text-3xl font-black ${color}`}>{count}</p>
            </div>
          ))}
        </div>

        <SafetyDisclaimer />

        {/* Filters */}
        <div className="clean-pill-card p-4 flex flex-wrap items-center gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Priority</p>
            <div className="flex gap-1.5">
              {PRIORITY_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setPriorityFilter(f)}
                  className={`filter-pill text-xs ${priorityFilter === f ? 'active' : ''}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Type</p>
            <div className="flex flex-wrap gap-1.5">
              {GAP_TYPE_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`filter-pill text-xs ${typeFilter === f ? 'active' : ''}`}
                >
                  {f === 'ALL' ? 'All Types' : GAP_TYPE_LABELS[f] || f}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-auto">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sort by</p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 rounded-full px-4 py-1.5 text-xs font-medium focus:outline-none focus:border-red-400 shadow-sm"
            >
              <option value="priority">Priority</option>
              <option value="age">Age (oldest first)</option>
              <option value="confidence">Confidence</option>
            </select>
          </div>
        </div>

        {/* Gaps table */}
        <div className="clean-pill-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <Th>Patient</Th>
                  <Th>Condition</Th>
                  <Th>Gap Type</Th>
                  <Th>Priority</Th>
                  <Th>Confidence</Th>
                  <Th>Age</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((gap) => (
                  <TableRow
                    key={gap.id}
                    highlight={gap.priority === 'HIGH'}
                  >
                    <Td>
                      <button
                        onClick={() => onSelectPatient(gap.patientId)}
                        className="text-left group"
                      >
                        <p className="font-bold text-slate-900 text-xs group-hover:text-red-500 transition-colors">{gap.patient?.name}</p>
                        <p className="text-slate-400 text-[11px] font-mono">{gap.patientId}</p>
                      </button>
                    </Td>
                    <Td className="text-slate-600 text-xs font-medium max-w-[150px] truncate">
                      {gap.patient?.condition}
                    </Td>
                    <Td><GapTypeChip type={gap.type} /></Td>
                    <Td><PriorityBadge priority={gap.priority} /></Td>
                    <Td className="min-w-[120px]"><ConfidenceBar score={gap.confidence} /></Td>
                    <Td className="text-slate-500 text-xs font-mono font-medium">{gap.ageInDays}d</Td>
                    <Td>
                      <span className="badge-clean-amber text-[10px] font-bold">
                        OPEN
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedGap(gap)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleResolveGap(gap)}
                          className="btn-coral-sm text-xs"
                        >
                          Resolve
                        </button>
                      </div>
                    </Td>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
                        <CheckCircle2 size={24} />
                      </div>
                      <p className="text-slate-800 font-bold text-sm">No care gaps match the current filter</p>
                      <p className="text-slate-400 text-xs mt-1">All care pathways for selected criteria are closed or verified</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          Showing {filtered.length} of {allGapsWithPatient.length} total care gaps
        </p>
      </div>

      {selectedGap && (
        <GapDetailModal
          gap={selectedGap}
          patient={selectedGap.patient}
          onClose={() => setSelectedGap(null)}
          onResolve={() => handleResolveGap(selectedGap)}
        />
      )}
    </div>
  );
}
