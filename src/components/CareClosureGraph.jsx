// CARELOOP - Care Closure Graph Component
import React, { useState } from 'react';
import {
  CheckCircle, XCircle, Clock, AlertTriangle, Minus, 
  Calendar, ChevronDown, ChevronUp, ArrowDown, Info
} from 'lucide-react';
import { ConfidenceBar, PriorityBadge } from '../components/shared/UI';

const STAGE_CONFIG = [
  {
    id: 'CONSULTATION',
    label: 'Consultation',
    icon: '🩺',
    description: 'Initial clinical consultation',
    mandatory: true,
  },
  {
    id: 'TEST_ORDERED',
    label: 'Test Ordered',
    icon: '📋',
    description: 'Diagnostic tests ordered by clinician',
    mandatory: true,
    dependsOn: ['CONSULTATION'],
  },
  {
    id: 'TEST_COMPLETED',
    label: 'Test Completed',
    icon: '🔬',
    description: 'Patient completed the ordered tests',
    mandatory: true,
    dependsOn: ['TEST_ORDERED'],
  },
  {
    id: 'RESULT_AVAILABLE',
    label: 'Result Available',
    icon: '📊',
    description: 'Test results received from laboratory',
    mandatory: true,
    dependsOn: ['TEST_COMPLETED'],
  },
  {
    id: 'DOCTOR_REVIEW',
    label: 'Doctor Review',
    icon: '👨‍⚕️',
    description: 'Clinician reviews and interprets results',
    mandatory: true,
    dependsOn: ['RESULT_AVAILABLE'],
  },
  {
    id: 'REFERRAL',
    label: 'Referral',
    icon: '🔗',
    description: 'Specialist referral if indicated',
    mandatory: false,
    dependsOn: ['DOCTOR_REVIEW'],
  },
  {
    id: 'FOLLOW_UP',
    label: 'Follow-up',
    icon: '📞',
    description: 'Patient follow-up and monitoring',
    mandatory: true,
    dependsOn: ['DOCTOR_REVIEW'],
  },
  {
    id: 'CARE_CLOSED',
    label: 'Care Closed',
    icon: '✅',
    description: 'Care loop formally closed',
    mandatory: true,
    dependsOn: ['FOLLOW_UP'],
  },
];

const STATUS_CONFIG = {
  COMPLETED: {
    label: '✓ Completed',
    dotClass: 'bg-green-500',
    nodeClass: 'bg-green-500/10 border-2 border-green-500 text-green-400',
    iconClass: 'text-green-400',
    badgeClass: 'bg-green-500/20 text-green-400 border border-green-500/30',
  },
  PENDING: {
    label: '⏳ Pending',
    dotClass: 'bg-amber-500',
    nodeClass: 'bg-amber-500/10 border-2 border-amber-500 text-amber-400',
    iconClass: 'text-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  },
  OVERDUE: {
    label: '⚠ Overdue',
    dotClass: 'bg-red-500',
    nodeClass: 'bg-red-500/10 border-2 border-red-500 text-red-400',
    iconClass: 'text-red-400',
    badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/30',
  },
  MISSING: {
    label: '✗ Missing',
    dotClass: 'bg-red-700',
    nodeClass: 'bg-red-900/20 border-2 border-red-700 text-red-300',
    iconClass: 'text-red-400',
    badgeClass: 'bg-red-900/30 text-red-300 border border-red-700/50',
  },
  NOT_STARTED: {
    label: '○ Not Started',
    dotClass: 'bg-slate-600',
    nodeClass: 'bg-slate-700/50 border border-slate-600 text-slate-400',
    iconClass: 'text-slate-500',
    badgeClass: 'bg-slate-700 text-slate-400 border border-slate-600',
  },
  SCHEDULED: {
    label: '📅 Scheduled',
    dotClass: 'bg-blue-500',
    nodeClass: 'bg-blue-500/10 border-2 border-blue-500 text-blue-400',
    iconClass: 'text-blue-400',
    badgeClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  },
  NOT_REQUIRED: {
    label: '— Not Required',
    dotClass: 'bg-slate-600',
    nodeClass: 'bg-slate-800/30 border border-slate-700/50 text-slate-500',
    iconClass: 'text-slate-600',
    badgeClass: 'bg-slate-800 text-slate-500 border border-slate-700',
  },
};

function getStatusIcon(status, size = 16) {
  const props = { size, className: STATUS_CONFIG[status]?.iconClass || 'text-slate-500' };
  switch (status) {
    case 'COMPLETED': return <CheckCircle {...props} />;
    case 'PENDING': return <Clock {...props} />;
    case 'OVERDUE': return <AlertTriangle {...props} />;
    case 'MISSING': return <XCircle {...props} />;
    case 'SCHEDULED': return <Calendar {...props} />;
    case 'NOT_REQUIRED': return <Minus {...props} />;
    default: return <Minus {...props} />;
  }
}

function NodeCard({ stage, event, gap, isActive, onClick }) {
  const config = STAGE_CONFIG.find((s) => s.id === stage.id);
  const status = event?.status || 'NOT_STARTED';
  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED;
  const isGap = !!gap;

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col rounded-xl p-4 cursor-pointer transition-all border-2 group
        ${isGap
          ? 'border-red-500 bg-red-900/10 hover:bg-red-900/20 ring-2 ring-red-500/30 ring-offset-1 ring-offset-slate-900'
          : isActive
          ? 'border-cyan-500 bg-cyan-500/5'
          : sc.nodeClass + ' hover:scale-[1.02]'
        }
      `}
    >
      {isGap && (
        <div className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config?.icon}</span>
          <div>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">{stage.label}</p>
            {config?.mandatory === false && (
              <p className="text-xs text-slate-600">Optional</p>
            )}
          </div>
        </div>
        {getStatusIcon(status)}
      </div>

      <div className={`text-xs px-2 py-0.5 rounded-full self-start font-medium ${sc.badgeClass}`}>
        {sc.label}
      </div>

      {event?.date && (
        <p className="text-xs text-slate-500 mt-2">
          {event.date}
        </p>
      )}
      {event?.waitingDays > 0 && !event?.date && (
        <p className="text-xs text-red-400 mt-2 font-medium">
          Waiting {event.waitingDays} day{event.waitingDays !== 1 ? 's' : ''}
        </p>
      )}

      {isGap && gap && (
        <div className="mt-2 pt-2 border-t border-red-500/20">
          <p className="text-xs text-red-400 font-medium flex items-center gap-1">
            <AlertTriangle size={10} /> GAP DETECTED
          </p>
          <PriorityBadge priority={gap.priority} />
        </div>
      )}
    </div>
  );
}

function NodeDetail({ stage, event, gap, patient }) {
  const config = STAGE_CONFIG.find((s) => s.id === stage.id);
  const status = event?.status || 'NOT_STARTED';
  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config?.icon}</span>
          <div>
            <h3 className="text-white font-bold text-lg">{stage.label}</h3>
            <p className="text-slate-400 text-sm">{config?.description}</p>
          </div>
        </div>
        <div className={`text-sm px-3 py-1 rounded-full font-medium ${sc.badgeClass}`}>
          {sc.label}
        </div>
      </div>

      {/* Event details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {event?.date && (
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Date</p>
            <p className="text-white font-medium">{event.date}</p>
          </div>
        )}
        {event?.doctor && (
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Clinician</p>
            <p className="text-white font-medium">{event.doctor}</p>
          </div>
        )}
        {event?.lab && (
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Laboratory</p>
            <p className="text-white font-medium">{event.lab}</p>
          </div>
        )}
        {event?.testName && (
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Test(s)</p>
            <p className="text-white font-medium">{event.testName}</p>
          </div>
        )}
        {event?.resultSummary && (
          <div className="col-span-2 bg-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Result Summary</p>
            <p className="text-white font-medium">{event.resultSummary}</p>
          </div>
        )}
        {event?.waitingDays > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Waiting</p>
            <p className="text-red-400 font-bold">{event.waitingDays} day(s)</p>
          </div>
        )}
      </div>

      {event?.notes && (
        <div className="bg-slate-700/30 rounded-lg p-3">
          <p className="text-slate-400 text-xs mb-1">Notes</p>
          <p className="text-slate-200 text-sm">{event.notes}</p>
        </div>
      )}

      {/* Gap information */}
      {gap && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="text-red-400 font-bold">CARE GAP DETECTED</p>
            <PriorityBadge priority={gap.priority} />
          </div>
          <p className="text-slate-300 text-sm">{gap.description}</p>

          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Why this is a gap:</p>
            {gap.reasons.map((r, i) => (
              <p key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span> {r}
              </p>
            ))}
          </div>

          {gap.priorityReasons?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Priority reasons ({gap.priority}):</p>
              {gap.priorityReasons.map((r, i) => (
                <p key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span> {r}
                </p>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Confidence: {gap.confidence}%</p>
            <ConfidenceBar score={gap.confidence} />
            {gap.confidenceFactors?.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={f.met ? 'text-green-400' : 'text-slate-500'}>{f.met ? '✓' : '○'}</span>
                <span className={f.met ? 'text-slate-300' : 'text-slate-500'}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies */}
      {config?.dependsOn && (
        <div className="bg-slate-700/20 rounded-lg p-3">
          <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wide flex items-center gap-1">
            <Info size={10} /> Dependencies
          </p>
          {config.dependsOn.map((dep) => {
            const depEvent = patient?.careEvents?.find((e) => e.stage === dep);
            const depStage = STAGE_CONFIG.find((s) => s.id === dep);
            const done = depEvent?.status === 'COMPLETED' || depEvent?.status === 'NOT_REQUIRED';
            return (
              <p key={dep} className={`text-xs ${done ? 'text-green-400' : 'text-red-400'}`}>
                {done ? '✓' : '✗'} Depends on: {depStage?.label || dep}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CareClosureGraph({ patient, gaps }) {
  const [selectedStage, setSelectedStage] = useState(null);

  const getEventForStage = (stageId) =>
    patient.careEvents?.find((e) => e.stage === stageId);

  const getGapForStage = (stageId) =>
    gaps?.find((g) => g.affectedStage === stageId);

  const completedCount = STAGE_CONFIG.filter((s) => {
    const e = getEventForStage(s.id);
    return e?.status === 'COMPLETED';
  }).length;
  const progress = Math.round((completedCount / STAGE_CONFIG.length) * 100);

  return (
    <div className="space-y-5">
      {/* Progress indicator */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-300">Care Journey Progress</p>
          <p className="text-sm font-bold text-white">{completedCount}/{STAGE_CONFIG.length} stages</p>
        </div>
        <div className="bg-slate-700 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-500">Start</span>
          <span className="text-xs text-slate-500">{progress}% Complete</span>
          <span className="text-xs text-slate-500">Care Closed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Graph column */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-3">
            Care Closure Graph — {patient.condition}
          </p>
          <div className="space-y-1">
            {STAGE_CONFIG.map((stage, idx) => {
              const event = getEventForStage(stage.id);
              const gap = getGapForStage(stage.id);
              const isSelected = selectedStage === stage.id;

              return (
                <div key={stage.id}>
                  <NodeCard
                    stage={stage}
                    event={event}
                    gap={gap}
                    isActive={isSelected}
                    onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                  />
                  {idx < STAGE_CONFIG.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown
                        size={16}
                        className={
                          event?.status === 'COMPLETED'
                            ? 'text-green-500/50'
                            : 'text-slate-700'
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          {selectedStage ? (
            <NodeDetail
              stage={STAGE_CONFIG.find((s) => s.id === selectedStage)}
              event={getEventForStage(selectedStage)}
              gap={getGapForStage(selectedStage)}
              patient={patient}
            />
          ) : (
            <div className="card p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
              <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
                <Info size={20} className="text-slate-500" />
              </div>
              <p className="text-slate-400 font-medium">Select a stage node</p>
              <p className="text-slate-500 text-sm mt-1">Click any node in the graph to view detailed event information and gap analysis</p>
            </div>
          )}

          {/* Legend */}
          <div className="card p-4 mt-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">Legend</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { status: 'COMPLETED', label: 'Completed' },
                { status: 'PENDING', label: 'Pending' },
                { status: 'OVERDUE', label: 'Overdue' },
                { status: 'MISSING', label: 'Missing' },
                { status: 'NOT_STARTED', label: 'Not Started' },
                { status: 'SCHEDULED', label: 'Scheduled' },
              ].map(({ status, label }) => {
                const sc = STATUS_CONFIG[status];
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${sc.dotClass}`} />
                    <span className="text-xs text-slate-400">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
