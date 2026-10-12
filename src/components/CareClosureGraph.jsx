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
    dotClass: 'bg-emerald-500',
    nodeClass: 'bg-emerald-50/80 border-2 border-emerald-400 text-emerald-800 shadow-sm',
    iconClass: 'text-emerald-600',
    badgeClass: 'badge-clean-emerald',
  },
  PENDING: {
    label: '⏳ Pending',
    dotClass: 'bg-amber-500',
    nodeClass: 'bg-amber-50/80 border-2 border-amber-400 text-amber-800 shadow-sm',
    iconClass: 'text-amber-600',
    badgeClass: 'badge-clean-amber',
  },
  OVERDUE: {
    label: '⚠ Overdue',
    dotClass: 'bg-red-500',
    nodeClass: 'bg-red-50/80 border-2 border-red-500 text-red-800 shadow-sm',
    iconClass: 'text-red-500',
    badgeClass: 'badge-clean-coral',
  },
  MISSING: {
    label: '✗ Missing',
    dotClass: 'bg-red-600',
    nodeClass: 'bg-red-100/80 border-2 border-red-600 text-red-900 shadow-sm',
    iconClass: 'text-red-600',
    badgeClass: 'bg-red-100 text-red-700 border border-red-300',
  },
  NOT_STARTED: {
    label: '○ Not Started',
    dotClass: 'bg-slate-300',
    nodeClass: 'bg-white border-2 border-slate-200 text-slate-600 shadow-sm',
    iconClass: 'text-slate-400',
    badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
  },
  SCHEDULED: {
    label: '📅 Scheduled',
    dotClass: 'bg-sky-500',
    nodeClass: 'bg-sky-50/80 border-2 border-sky-400 text-sky-800 shadow-sm',
    iconClass: 'text-sky-600',
    badgeClass: 'badge-clean-sky',
  },
  NOT_REQUIRED: {
    label: '— Not Required',
    dotClass: 'bg-slate-300',
    nodeClass: 'bg-slate-50 border border-slate-200 text-slate-400',
    iconClass: 'text-slate-400',
    badgeClass: 'bg-slate-100 text-slate-400 border border-slate-200',
  },
};

function getStatusIcon(status, size = 16) {
  const props = { size, className: STATUS_CONFIG[status]?.iconClass || 'text-slate-400' };
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
      className={`relative flex flex-col rounded-2xl p-4 cursor-pointer transition-all border-2 group
        ${isGap
          ? 'border-red-500 bg-red-50/90 shadow-md ring-2 ring-red-400/30'
          : isActive
          ? 'border-red-400 bg-red-50/30 shadow-md'
          : sc.nodeClass + ' hover:border-slate-300'
        }
      `}
    >
      {isGap && (
        <div className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
          !
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{config?.icon}</span>
          <div>
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">{stage.label}</p>
            {config?.mandatory === false && (
              <p className="text-[10px] text-slate-400 font-medium">Optional Step</p>
            )}
          </div>
        </div>
        {getStatusIcon(status)}
      </div>

      <div className={`text-[11px] px-2.5 py-0.5 rounded-full self-start font-bold ${sc.badgeClass}`}>
        {sc.label}
      </div>

      {event?.date && (
        <p className="text-xs text-slate-500 mt-2 font-mono font-medium">
          {event.date}
        </p>
      )}
      {event?.waitingDays > 0 && !event?.date && (
        <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1">
          <Clock size={12} /> Waiting {event.waitingDays} day{event.waitingDays !== 1 ? 's' : ''}
        </p>
      )}

      {isGap && gap && (
        <div className="mt-2.5 pt-2 border-t border-red-200">
          <p className="text-xs text-red-600 font-bold flex items-center gap-1 mb-1">
            <AlertTriangle size={12} /> GAP DETECTED
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
    <div className="clean-pill-card p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config?.icon}</span>
          <div>
            <h3 className="text-slate-900 font-bold text-lg">{stage.label}</h3>
            <p className="text-slate-500 text-xs font-medium">{config?.description}</p>
          </div>
        </div>
        <div className={`text-xs px-3 py-1 rounded-full font-bold ${sc.badgeClass}`}>
          {sc.label}
        </div>
      </div>

      {/* Event details */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {event?.date && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Event Date</p>
            <p className="text-slate-800 font-bold font-mono">{event.date}</p>
          </div>
        )}
        {event?.doctor && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Clinician</p>
            <p className="text-slate-800 font-bold">{event.doctor}</p>
          </div>
        )}
        {event?.lab && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Laboratory</p>
            <p className="text-slate-800 font-bold">{event.lab}</p>
          </div>
        )}
        {event?.testName && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Test(s)</p>
            <p className="text-slate-800 font-bold">{event.testName}</p>
          </div>
        )}
        {event?.resultSummary && (
          <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Result Summary</p>
            <p className="text-slate-800 font-medium">{event.resultSummary}</p>
          </div>
        )}
        {event?.waitingDays > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 col-span-2">
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mb-1">Overdue Duration</p>
            <p className="text-red-600 font-black text-sm">{event.waitingDays} day(s) overdue</p>
          </div>
        )}
      </div>

      {event?.notes && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Clinical Notes</p>
          <p className="text-slate-700 text-xs">{event.notes}</p>
        </div>
      )}

      {/* Gap information */}
      {gap && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <p className="text-red-600 font-bold text-xs uppercase tracking-wider">CARE GAP DETECTED</p>
            <PriorityBadge priority={gap.priority} />
          </div>
          <p className="text-slate-800 text-xs font-semibold">{gap.description}</p>

          <div className="space-y-1 pt-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Why this is a gap:</p>
            {gap.reasons.map((r, i) => (
              <p key={i} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="text-red-500 mt-0.5 font-bold">•</span> {r}
              </p>
            ))}
          </div>

          {gap.priorityReasons?.length > 0 && (
            <div className="space-y-1 pt-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Priority reasons ({gap.priority}):</p>
              {gap.priorityReasons.map((r, i) => (
                <p key={i} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 font-bold">•</span> {r}
                </p>
              ))}
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-red-200">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Confidence: {gap.confidence}%</p>
            <ConfidenceBar score={gap.confidence} />
            <div className="grid grid-cols-1 gap-1 pt-1">
              {gap.confidenceFactors?.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={f.met ? 'text-emerald-500 font-bold' : 'text-slate-400'}>{f.met ? '✓' : '○'}</span>
                  <span className={f.met ? 'text-slate-800 font-medium' : 'text-slate-400'}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dependencies */}
      {config?.dependsOn && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
          <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <Info size={12} className="text-slate-400" /> Prerequisite Stages
          </p>
          <div className="space-y-1">
            {config.dependsOn.map((dep) => {
              const depEvent = patient?.careEvents?.find((e) => e.stage === dep);
              const depStage = STAGE_CONFIG.find((s) => s.id === dep);
              const done = depEvent?.status === 'COMPLETED' || depEvent?.status === 'NOT_REQUIRED';
              return (
                <p key={dep} className={`text-xs font-medium flex items-center gap-1.5 ${done ? 'text-emerald-600' : 'text-red-500'}`}>
                  <span>{done ? '✓' : '✗'}</span> Depends on: <span className="font-bold">{depStage?.label || dep}</span>
                </p>
              );
            })}
          </div>
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
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="clean-pill-card p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Care Journey Protocol Progress</p>
          <p className="text-xs font-black text-slate-900">{completedCount} of {STAGE_CONFIG.length} stages verified ({progress}%)</p>
        </div>
        <div className="bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[11px] text-slate-400 font-medium">Initial Consultation</span>
          <span className="text-[11px] text-slate-600 font-bold">{progress}% Complete</span>
          <span className="text-[11px] text-slate-400 font-medium">Complete Care Closure</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph column */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3">
            Care Closure Graph — {patient.condition}
          </p>
          <div className="space-y-2">
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
                            ? 'text-emerald-400'
                            : 'text-slate-300'
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
        <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
          {selectedStage ? (
            <NodeDetail
              stage={STAGE_CONFIG.find((s) => s.id === selectedStage)}
              event={getEventForStage(selectedStage)}
              gap={getGapForStage(selectedStage)}
              patient={patient}
            />
          ) : (
            <div className="clean-pill-card p-8 flex flex-col items-center justify-center min-h-[220px] text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <Info size={20} />
              </div>
              <p className="text-slate-800 font-bold text-sm">Select a Stage Node</p>
              <p className="text-slate-500 text-xs mt-1 max-w-xs">Click any node in the care journey graph to view detailed event history, dependencies, and care gap intelligence</p>
            </div>
          )}

          {/* Legend */}
          <div className="clean-pill-card p-4">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-3">Stage Status Legend</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { status: 'COMPLETED', label: 'Completed' },
                { status: 'PENDING', label: 'Pending Review' },
                { status: 'OVERDUE', label: 'Overdue Gap' },
                { status: 'MISSING', label: 'Missing Required Step' },
                { status: 'NOT_STARTED', label: 'Not Started' },
                { status: 'SCHEDULED', label: 'Scheduled' },
              ].map(({ status, label }) => {
                const sc = STATUS_CONFIG[status];
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${sc.dotClass}`} />
                    <span className="text-xs text-slate-600 font-medium">{label}</span>
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
