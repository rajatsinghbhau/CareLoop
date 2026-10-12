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
        <div className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <PriorityBadge priority={gap.priority} />
              <GapTypeChip type={gap.type} />
              <span className="text-xs text-slate-400">Age: {gap.ageInDays} day(s)</span>
            </div>
            <p className="text-white font-semibold">{gap.description}</p>
            <p className="text-slate-400 text-sm mt-1">
              Patient: <span className="text-white">{patient?.name}</span> ({gap.patientId}) · 
              Condition: <span className="text-white">{patient?.condition}</span>
            </p>
          </div>
        </div>

        {/* Confidence */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-white">Confidence Analysis</p>
            <span className="text-lg font-bold text-white">{gap.confidence}%</span>
          </div>
          <ConfidenceBar score={gap.confidence} />
          {gap.confidence < 70 && (
            <p className="text-amber-400 text-xs mt-2 flex items-center gap-1">
              <Info size={10} /> Low confidence — this gap requires manual human verification before any action
            </p>
          )}
          <div className="grid grid-cols-1 gap-1 mt-3">
            {gap.confidenceFactors?.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={f.met ? 'text-green-400 font-bold' : 'text-slate-500'}>
                  {f.met ? '✓' : '○'}
                </span>
                <span className={f.met ? 'text-slate-200' : 'text-slate-500'}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reasons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <p className="font-semibold text-white mb-3 flex items-center gap-2">
              <AlertCircle size={14} className="text-red-400" /> Gap Reasons
            </p>
            {gap.reasons?.map((r, i) => (
              <p key={i} className="text-sm text-slate-300 flex items-start gap-2 mb-1.5">
                <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>{r}
              </p>
            ))}
          </div>
          <div className="card p-4">
            <p className="font-semibold text-white mb-3">Priority Reasons ({gap.priority})</p>
            {gap.priorityReasons?.map((r, i) => (
              <p key={i} className="text-sm text-slate-300 flex items-start gap-2 mb-1.5">
                <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>{r}
              </p>
            ))}
          </div>
        </div>

        <SafetyDisclaimer />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Close</button>
          <button
            onClick={() => { onResolve(); onClose(); }}
            className="btn-primary flex items-center gap-2"
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
    <div className="flex-1 overflow-y-auto">
      <TopBar
        title="Care Gaps"
        subtitle={`${allGapsWithPatient.length} open gaps across all patients`}
      />

      <div className="p-6 space-y-5">
        {/* Priority summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'HIGH Priority', count: gapStats.high, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            { label: 'MEDIUM Priority', count: gapStats.medium, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'LOW Priority', count: gapStats.low, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`card border p-4 ${bg}`}>
              <p className="text-slate-400 text-xs mb-1">{label}</p>
              <p className={`text-3xl font-black ${color}`}>{count}</p>
            </div>
          ))}
        </div>

        <SafetyDisclaimer />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div>
            <p className="text-xs text-slate-400 mb-1.5 font-medium">Priority</p>
            <div className="flex gap-1">
              {PRIORITY_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setPriorityFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    priorityFilter === f
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-1.5 font-medium">Type</p>
            <div className="flex flex-wrap gap-1">
              {GAP_TYPE_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    typeFilter === f
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {f === 'ALL' ? 'All Types' : GAP_TYPE_LABELS[f] || f}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-auto">
            <p className="text-xs text-slate-400 mb-1.5 font-medium">Sort by</p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="priority">Priority</option>
              <option value="age">Age (oldest first)</option>
              <option value="confidence">Confidence</option>
            </select>
          </div>
        </div>

        {/* Gaps table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/80 border-b border-slate-700">
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
              <tbody>
                {filtered.map((gap) => (
                  <TableRow
                    key={gap.id}
                    highlight={gap.priority === 'HIGH'}
                  >
                    <Td>
                      <button
                        onClick={() => onSelectPatient(gap.patientId)}
                        className="text-left hover:text-cyan-400 transition-colors"
                      >
                        <p className="font-medium text-white text-xs">{gap.patient?.name}</p>
                        <p className="text-slate-500 text-xs">{gap.patientId}</p>
                      </button>
                    </Td>
                    <Td className="text-slate-300 text-xs max-w-[150px] truncate">
                      {gap.patient?.condition}
                    </Td>
                    <Td><GapTypeChip type={gap.type} /></Td>
                    <Td><PriorityBadge priority={gap.priority} /></Td>
                    <Td className="min-w-[120px]"><ConfidenceBar score={gap.confidence} /></Td>
                    <Td className="text-slate-400 text-xs font-mono">{gap.ageInDays}d</Td>
                    <Td>
                      <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        OPEN
                      </span>
                    </Td>
                    <Td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedGap(gap)}
                          className="text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleResolveGap(gap)}
                          className="text-xs text-green-400 hover:text-green-300"
                        >
                          Resolve
                        </button>
                      </div>
                    </Td>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <CheckCircle2 size={32} className="text-green-400 mx-auto mb-2" />
                      <p className="text-slate-400 font-medium">No gaps match the current filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Showing {filtered.length} of {allGapsWithPatient.length} total gaps
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
