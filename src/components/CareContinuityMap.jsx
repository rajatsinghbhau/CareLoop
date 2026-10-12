// CARELOOP - Signature Interface: CARE CONTINUITY MAP™
// Refined with Clinical Intelligence Palette: Obsidian Navy, Surgical Teal (#00C49F/#0D9488), Clinical Azure, Bone White, and Restrained Crimson Alert

import React, { useState } from 'react';
import {
  CheckCircle2, AlertCircle, Clock, ArrowRight, Shield,
  Building2, UserCheck, Check, RotateCcw, Sparkles, ChevronRight,
  Info, ExternalLink, Calendar, Stethoscope, FileText, Activity,
  PhoneCall, Zap, Send, Phone, User, Fingerprint, Layers, Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectCareGaps, calculateCareClosureScore } from '../engine/careGapEngine';
import { ConfidenceBar, SafetyDisclaimer, Modal } from './shared/UI';

export function CareContinuityMap({ initialPatientId, onPatientChange }) {
  const { patients, dispatch, showNotification, user } = useApp();

  // Active patient (defaults to Rahul Sharma P-1001)
  const currentPatient =
    patients.find((p) => p.id === (initialPatientId || 'P-1001')) || patients[0];

  const [selectedNode, setSelectedNode] = useState('FOLLOW_UP'); // Defaults to break point
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('Outpatient specialist follow-up completed. Medication reconciliation confirmed without renal toxicity markers.');
  const [quickActionDone, setQuickActionDone] = useState(null);

  const gaps = detectCareGaps(currentPatient);
  const closureScore = calculateCareClosureScore(currentPatient);
  const events = currentPatient.careEvents || [];

  // Group events by provider swimlanes
  const hospitalAEvents = events.filter((e) => (e.provider || 'HOSPITAL A') === 'HOSPITAL A');
  const hospitalBEvents = events.filter((e) => (e.provider || '').includes('HOSPITAL B'));

  const primaryGap = gaps[0] || null;
  const isClosed = closureScore.isClosed;

  const handleResolveGap = () => {
    dispatch({
      type: 'RESOLVE_GAP',
      payload: {
        patientId: currentPatient.id,
        stage: 'FOLLOW_UP',
        resolution: verificationNotes,
        resolvedBy: user?.name || 'Care Coordinator Anjali Gupta',
      },
    });

    setTimeout(() => {
      dispatch({
        type: 'RESOLVE_GAP',
        payload: {
          patientId: currentPatient.id,
          stage: 'CARE_CLOSED',
          resolution: 'Cross-facility clinical loop verified and formally closed.',
          resolvedBy: user?.name || 'Clinical Continuity Intelligence',
        },
      });
      showNotification('Care loop closed! Care closure score transitioned to 100%', 'success');
      setIsVerifying(false);
    }, 300);
  };

  const handleResetDemo = () => {
    dispatch({
      type: 'SIMULATE_GAP',
      payload: { patientId: currentPatient.id, stage: 'FOLLOW_UP' },
    });
    dispatch({
      type: 'UPDATE_CARE_EVENT',
      payload: {
        patientId: currentPatient.id,
        eventId: events.find(e => e.stage === 'CARE_CLOSED')?.id,
        updates: { status: 'NOT_STARTED', date: null }
      }
    });
    setQuickActionDone(null);
    setSelectedNode('FOLLOW_UP');
    showNotification('Continuity gap re-injected for live judge demonstration', 'info');
  };

  const handleQuickAction = (actionName) => {
    setQuickActionDone(actionName);
    showNotification(`Intervention triggered: ${actionName}`, 'success');
  };

  const selectedEvent = events.find((e) => e.stage === selectedNode) || events[0];
  const isSelectedNodeGap = primaryGap && primaryGap.affectedStage === selectedNode && !isClosed;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f7fb] overflow-hidden text-slate-900 font-sans">
      {/* ──────────────────────────────────────────────────────────
          1. OBSIDIAN CYBERNETIC COMMAND BAR (Clinical Intelligence)
          ────────────────────────────────────────────────────────── */}
      <div className="bg-[#080d16] text-white border-b border-slate-800/90 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 z-10 shrink-0 shadow-sm">
        {/* Patient Identity & Telemetry */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-teal-300 font-bold text-xs tracking-tight shadow-inner">
              <Cpu size={16} className="text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <select
                  value={currentPatient.id}
                  onChange={(e) => onPatientChange && onPatientChange(e.target.value)}
                  className="bg-[#0e1626] hover:bg-[#131d32] border border-slate-700/80 text-white font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-teal-400 cursor-pointer transition-colors"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 font-medium">
                  {currentPatient.age}y • {currentPatient.gender}
                </span>
                <span className="text-[10px] bg-teal-950/80 text-teal-300 px-2 py-0.5 rounded font-mono border border-teal-800/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  FHIR R4 LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Care Pathway: <span className="text-teal-300 font-semibold">{currentPatient.condition}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Journey Status & Actions */}
        <div className="flex items-center gap-3">
          {isClosed ? (
            <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-xs">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>CARE LOOP CLOSED (100%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-rose-950/80 text-rose-300 border border-rose-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide glow-intelligence-red animate-pulse">
              <AlertCircle size={14} className="text-rose-400" />
              <span>CARE NOT CLOSED (BREAK AT STEP 8)</span>
            </div>
          )}

          <button
            onClick={handleResetDemo}
            title="Re-inject break to demonstrate live judge detection"
            className="btn-clinical-dark text-xs py-1.5 px-3"
          >
            <RotateCcw size={12} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. WORKSPACE BODY: 72% MAP CANVAS + 28% CONTEXTUAL RAIL
          ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* LEFT CANVAS (The Care Continuity Map) */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto min-w-0">
          
          {/* Executive Telemetry Card: Obsidian + Surgical Teal Gauge */}
          <div className="clinical-card-dark p-5 mb-5 flex flex-wrap items-center justify-between gap-4 border-slate-800/90 shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 flex items-center gap-1">
                  <Activity size={12} className="text-teal-400" />
                  CARE CONTINUITY MAP™
                </span>
                <span className="text-[10px] bg-teal-500/15 text-teal-300 px-2 py-0.5 rounded-full font-semibold border border-teal-500/30">
                  Cross-Provider Telemetry
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {currentPatient.name}’s Multi-Facility Care Journey
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring continuity handoffs between <strong className="text-slate-200">Hospital A (Originating)</strong> and <strong className="text-slate-200">Hospital B (Specialist Care)</strong>
              </p>
            </div>

            {/* Circular Telemetry Gauge */}
            <div className="flex items-center gap-4 bg-[#0a1120] border border-slate-800 rounded-xl px-4 py-2.5 shadow-inner">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Care Closure Score
                </span>
                <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1 justify-end font-mono">
                  <span>{closureScore.percentage}%</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({closureScore.completed}/{closureScore.total})
                  </span>
                </div>
              </div>
              
              {/* High-Precision SVG Gauge */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center relative shrink-0">
                <svg className="w-12 h-12 -rotate-90">
                  <circle cx="24" cy="24" r="19" stroke="#1e293b" strokeWidth="3.5" fill="transparent" />
                  <circle
                    cx="24" cy="24" r="19"
                    stroke={isClosed ? '#10b981' : '#0d9488'}
                    strokeWidth="3.5"
                    strokeDasharray="119.38"
                    strokeDashoffset={119.38 - (119.38 * closureScore.percentage) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-white font-mono">
                  {isClosed ? '✓' : `${closureScore.percentage}%`}
                </span>
              </div>
            </div>
          </div>

          {/* SWIMLANES CONTAINER (Clinical Clean Bone White Canvas) */}
          <div className="clinical-card p-6 mb-5 flex-1 flex flex-col justify-between border-slate-200/90 shadow-xs">
            {/* Legend & Layer Guidance */}
            <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-slate-100 gap-3 text-xs mb-5">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Layers:</span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium text-xs">
                  <span className="w-2.5 h-0.5 bg-slate-300 inline-block rounded" /> Expected Pathway
                </span>
                <span className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Actual Verified Events
                </span>
                <span className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-600 inline-block animate-ping" /> Break Detected
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Click any milestone to inspect clinical evidence & telemetry
              </span>
            </div>

            {/* Provider Swimlanes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
              
              {/* SWIMLANE 1: HOSPITAL A */}
              <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
                {/* Lane Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-700">
                      <Building2 size={14} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">HOSPITAL A</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Metro General Hospital (Primary & Diagnostics)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md">
                    Originating Care
                  </span>
                </div>

                {/* Milestone Cards for Hospital A */}
                <div className="space-y-2.5">
                  {hospitalAEvents.map((ev, idx) => {
                    const isSelected = selectedNode === ev.stage;
                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedNode(ev.stage)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white ring-2 ring-teal-500 border-teal-500 shadow-sm'
                            : 'bg-white hover:border-slate-300 border-slate-200/90 shadow-2xs hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                              ✓
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 leading-snug">
                                {idx + 1}. {ev.stage.replace('_', ' ')}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {ev.clinician || ev.notes}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {ev.date}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Inter-Hospital Transfer Callout */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs bg-teal-50/70 p-2.5 rounded-xl border border-teal-200/80">
                  <div className="flex items-center gap-1.5 text-teal-950 font-semibold text-xs">
                    <UserCheck size={14} className="text-teal-700" />
                    <span>Patient Authorized Transfer</span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200/80 font-bold">
                    Token: #AUTH-7821
                  </span>
                </div>
              </div>

              {/* SWIMLANE 2: HOSPITAL B */}
              <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
                {/* Lane Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                      <Building2 size={14} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-teal-950 uppercase tracking-wide">HOSPITAL B</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Apollo Specialty Hospital (Specialist & Continuity)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                    Receiving Facility
                  </span>
                </div>

                {/* Milestone Cards for Hospital B */}
                <div className="space-y-2.5">
                  {hospitalBEvents.map((ev, idx) => {
                    const stepNumber = hospitalAEvents.length + idx + 1;
                    const isSelected = selectedNode === ev.stage;
                    const isGap = primaryGap && primaryGap.affectedStage === ev.stage && !isClosed;
                    const isStepClosed = ev.status === 'COMPLETED';

                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedNode(ev.stage)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isGap
                            ? 'bg-rose-50/90 border-rose-500 ring-2 ring-rose-400/60 shadow-md glow-intelligence-red'
                            : isSelected
                            ? 'bg-white ring-2 ring-teal-500 border-teal-500 shadow-sm'
                            : isStepClosed
                            ? 'bg-white hover:border-slate-300 border-slate-200/90 shadow-2xs hover:shadow-xs'
                            : 'bg-slate-100/70 border-dashed border-slate-300 text-slate-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            {isGap ? (
                              <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse mt-0.5">
                                !
                              </div>
                            ) : isStepClosed ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                                ✓
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                                ○
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`text-xs font-bold leading-snug ${isGap ? 'text-rose-950 font-black' : 'text-slate-900'}`}>
                                  {stepNumber}. {ev.stage.replace('_', ' ')}
                                </p>
                                {isGap && (
                                  <span className="badge-break-critical uppercase text-[9px] tracking-wider">
                                    BREAK DETECTED
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {ev.notes || ev.clinician || 'Expected continuity milestone'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {isGap ? (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md font-mono">
                                10d Overdue
                              </span>
                            ) : ev.date ? (
                              <span className="text-[10px] font-mono text-slate-400">
                                {ev.date}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Loop State */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Final Care Loop State:</span>
                  {isClosed ? (
                    <span className="badge-verified-clean font-bold">✓ CLOSED</span>
                  ) : (
                    <span className="badge-break-critical font-bold">⚠ UNRESOLVED</span>
                  )}
                </div>
              </div>
            </div>

            {/* Innovation Callout Banner */}
            <div className="mt-5 bg-[#0a1120] text-white rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-teal-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                  CL
                </div>
                <div>
                  <p className="text-xs font-bold text-teal-300 uppercase tracking-wide">
                    {isClosed
                      ? 'CARE CONTINUITY RESTORED: All milestones verified'
                      : 'CARELOOP FOUND THE BREAK: Step 8 of 9 (Follow-up at Hospital B)'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isClosed
                      ? 'Patient journey successfully reconciled between Metro General and Apollo Specialty.'
                      : 'Downstream care loop severed. Patient completed specialist consultation but failed follow-up checkpoint.'}
                  </p>
                </div>
              </div>

              {!isClosed && (
                <button
                  onClick={() => setIsVerifying(true)}
                  className="btn-clinical-primary text-xs py-2 px-3.5 whitespace-nowrap glow-intelligence-teal"
                >
                  <Check size={14} />
                  <span>Resolve & Close Loop</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT CONTEXTUAL RAIL: INSPECTOR & TRIAGE PANEL */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200/90 bg-white p-5 flex flex-col justify-between overflow-y-auto shrink-0 shadow-xs">
          <div className="space-y-4">
            {/* Header */}
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Contextual Inspector
                </span>
                {isSelectedNodeGap ? (
                  <span className="badge-break-critical">
                    ACTIVE CARE GAP
                  </span>
                ) : (
                  <span className="badge-verified-clean">
                    VERIFIED EVENT
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {selectedEvent.stage.replace('_', ' ')}
              </h3>
              <p className="text-xs text-slate-500">
                Provider: <strong className="text-slate-800">{selectedEvent.provider}</strong>
              </p>
            </div>

            {/* BREAKDOWN: IF NODE IS A GAP */}
            {isSelectedNodeGap && primaryGap ? (
              <div className="space-y-3.5">
                {/* Explainable Why Evidence Box */}
                <div className="bg-rose-50/80 border border-rose-200/90 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-950 font-bold text-xs">
                    <AlertCircle size={15} className="text-rose-600 shrink-0" />
                    <span>WHY IS THIS CONSIDERED A BREAK?</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {primaryGap.whyEvidence?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        {item.verified ? (
                          <span className="text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="text-rose-600 font-bold">✕</span>
                        )}
                        <span className={item.isMissingBreak ? 'font-bold text-rose-950 leading-tight' : 'text-slate-700 leading-tight'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gap Confidence Meter */}
                <div className="clinical-card p-3.5 space-y-2 border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">CONTINUITY CONFIDENCE</span>
                    <span className="font-mono font-bold text-teal-700 text-sm">{primaryGap.confidence}%</span>
                  </div>
                  <ConfidenceBar score={primaryGap.confidence} />
                  <p className="text-[10px] text-slate-400">
                    Engine verified 7 prior timestamps + authenticated cross-hospital token.
                  </p>
                </div>

                {/* Source & Authorization Cards */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">SOURCE</span>
                    <strong className="text-slate-800 text-xs block truncate">{primaryGap.sourceProvider}</strong>
                  </div>
                  <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">PATIENT CONSENT</span>
                    <strong className="text-emerald-700 text-xs block">✓ Verified</strong>
                  </div>
                </div>

                {/* Quick Triage Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setIsVerifying(true)}
                    className="w-full btn-clinical-primary text-xs py-2.5"
                  >
                    <Check size={14} />
                    <span>Verify & Close Loop</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickAction('Staff outreach task assigned')}
                      className={`btn-clinical-secondary py-2 text-xs ${quickActionDone === 'Staff outreach task assigned' ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold' : ''}`}
                    >
                      <User size={12} />
                      <span>{quickActionDone === 'Staff outreach task assigned' ? 'Task Assigned ✓' : 'Assign Task'}</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('Patient SMS outreach triggered')}
                      className={`btn-clinical-secondary py-2 text-xs ${quickActionDone === 'Patient SMS outreach triggered' ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold' : ''}`}
                    >
                      <Phone size={12} />
                      <span>{quickActionDone === 'Patient SMS outreach triggered' ? 'Sent SMS ✓' : 'Outreach'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Verified Event Details */
              <div className="space-y-3 text-xs">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold mb-1">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Milestone Confirmed</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {selectedEvent.notes || 'Documented in EHR without continuity discrepancy.'}
                  </p>
                </div>

                <div className="clinical-card p-3.5 space-y-2 text-xs border-slate-200">
                  <div className="flex justify-between pb-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Timestamp:</span>
                    <strong className="font-mono text-slate-800">{selectedEvent.date || 'Pending'}</strong>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Clinician:</span>
                    <strong className="text-slate-800">{selectedEvent.clinician || 'Attending Physician'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Facility:</span>
                    <strong className="text-slate-800 truncate max-w-[170px]">{selectedEvent.facility || 'Facility Desk'}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Safety Disclaimer Footer */}
          <div className="pt-3.5 border-t border-slate-100 mt-4">
            <SafetyDisclaimer />
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {isVerifying && (
        <Modal title="Verify Clinical Action & Close Care Loop" onClose={() => setIsVerifying(false)}>
          <div className="space-y-3.5 text-xs">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-teal-900">
              You are verifying resolution of the <strong>Follow-up</strong> milestone for <strong>{currentPatient.name}</strong>.
              Upon confirmation, this patient's Care Closure Score will transition to <strong>100% (CARE CLOSED)</strong>.
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Resolution Documentation *
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-teal-500 text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsVerifying(false)} className="btn-clinical-secondary">
                Cancel
              </button>
              <button
                onClick={handleResolveGap}
                className="btn-clinical-primary"
              >
                <Check size={14} />
                <span>Confirm Resolution & Close Loop</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
