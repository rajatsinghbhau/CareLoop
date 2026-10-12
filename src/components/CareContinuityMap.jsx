// CARELOOP - Signature Interface: CARE CONTINUITY MAP™
// Restyled to match the clean, bright, white and friendly PetHelp aesthetic.
// Crisp white substrate (#fbfcff), pastel sky-blue accents, coral highlights, and clean modern cards.

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
    showNotification('Continuity gap re-injected for live demonstration', 'info');
  };

  const handleQuickAction = (actionName) => {
    setQuickActionDone(actionName);
    showNotification(`Intervention triggered: ${actionName}`, 'success');
  };

  const selectedEvent = events.find((e) => e.stage === selectedNode) || events[0];
  const isSelectedNodeGap = primaryGap && primaryGap.affectedStage === selectedNode && !isClosed;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbfcff] overflow-hidden text-slate-900 font-sans">
      
      {/* ──────────────────────────────────────────────────────────
          1. TOP COMMAND BAR (Clean White with Coral Pill status)
          ────────────────────────────────────────────────────────── */}
      <div className="bg-white text-slate-800 border-b border-slate-200/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-10 shrink-0 shadow-2xs">
        {/* Patient Identity & Telemetry */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#e84343] font-black text-sm shadow-2xs">
              <Activity size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <select
                  value={currentPatient.id}
                  onChange={(e) => onPatientChange && onPatientChange(e.target.value)}
                  className="bg-[#fbfcff] hover:bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#e84343] cursor-pointer shadow-2xs"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500 font-medium">
                  {currentPatient.age}y • {currentPatient.gender}
                </span>
                <span className="text-[10px] bg-sky-50 text-sky-800 px-2.5 py-0.5 rounded-full font-bold border border-sky-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  FHIR R4 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Care Pathway: <span className="text-[#e84343] font-bold">{currentPatient.condition}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Journey Status & Actions */}
        <div className="flex items-center gap-3">
          {isClosed ? (
            <div className="badge-clean-emerald text-xs py-1.5 px-4 shadow-sm">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>CARE LOOP CLOSED (100%)</span>
            </div>
          ) : (
            <div className="badge-clean-coral text-xs py-1.5 px-4 animate-pulse shadow-sm">
              <AlertCircle size={14} className="text-[#e84343]" />
              <span>CARE NOT CLOSED (BREAK AT STEP 8)</span>
            </div>
          )}

          <button
            onClick={handleResetDemo}
            title="Re-inject break to demonstrate live judge detection"
            className="btn-soft-pill text-xs py-1.5 px-3.5"
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
          
          {/* Hero Banner: Clean Soft Gradient with Radial Gauge */}
          <div className="clean-pill-card p-6 mb-6 flex flex-wrap items-center justify-between gap-4 border border-slate-100 shadow-sm bg-gradient-to-r from-sky-50/70 via-white to-rose-50/50">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#e84343] flex items-center gap-1">
                  <Activity size={13} />
                  CARE CONTINUITY MAP™
                </span>
                <span className="text-[10px] bg-rose-50 text-[#e84343] px-2.5 py-0.5 rounded-full font-bold border border-rose-200">
                  Cross-Provider Pathway
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {currentPatient.name}’s Multi-Facility Care Journey
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring continuity handoffs between <strong className="text-slate-800">Hospital A (Originating)</strong> and <strong className="text-slate-800">Hospital B (Specialist Care)</strong>
              </p>
            </div>

            {/* Circular Telemetry Gauge */}
            <div className="flex items-center gap-4 bg-white border border-slate-200/90 rounded-2xl px-5 py-3 shadow-sm">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Care Closure Score
                </span>
                <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1 justify-end font-mono">
                  <span className={isClosed ? 'text-emerald-700' : 'text-[#e84343]'}>{closureScore.percentage}%</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({closureScore.completed}/{closureScore.total})
                  </span>
                </div>
              </div>
              
              {/* Radial Ring */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center relative shrink-0">
                <svg className="w-12 h-12 -rotate-90">
                  <circle cx="24" cy="24" r="19" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                  <circle
                    cx="24" cy="24" r="19"
                    stroke={isClosed ? '#10b981' : '#e84343'}
                    strokeWidth="4"
                    strokeDasharray="119.38"
                    strokeDashoffset={119.38 - (119.38 * closureScore.percentage) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute text-[11px] font-extrabold text-slate-800 font-mono">
                  {isClosed ? '✓' : `${closureScore.percentage}%`}
                </span>
              </div>
            </div>
          </div>

          {/* SWIMLANES CONTAINER (Clean White Canvas) */}
          <div className="clean-pill-card p-6 mb-6 flex-1 flex flex-col justify-between border border-slate-100 shadow-sm">
            {/* Legend & Layer Guidance */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3 text-xs mb-6">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Layers:</span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium text-xs">
                  <span className="w-2.5 h-0.5 bg-slate-300 inline-block rounded" /> Expected Pathway
                </span>
                <span className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Verified Events
                </span>
                <span className="flex items-center gap-1.5 text-rose-700 font-extrabold text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#e84343] inline-block animate-ping" /> Break Detected
                </span>
              </div>
              <span className="text-[11px] text-slate-400 italic">
                Click any milestone to inspect clinical evidence & telemetry
              </span>
            </div>

            {/* Provider Swimlanes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              
              {/* SWIMLANE 1: HOSPITAL A */}
              <div className="bg-[#f8fafc] border border-slate-200/90 rounded-3xl p-5 flex flex-col justify-between shadow-2xs">
                {/* Lane Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-200/80 flex items-center justify-center text-slate-700 font-bold">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">HOSPITAL A</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Metro General Hospital (Primary & Diagnostics)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-200/80 text-slate-700 px-2.5 py-1 rounded-full">
                    Originating Care
                  </span>
                </div>

                {/* Milestone Cards for Hospital A */}
                <div className="space-y-3">
                  {hospitalAEvents.map((ev, idx) => {
                    const isSelected = selectedNode === ev.stage;
                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedNode(ev.stage)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white ring-2 ring-[#e84343] border-[#e84343] shadow-sm'
                            : 'bg-white hover:border-slate-300 border-slate-200/80 shadow-2xs hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
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
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs bg-sky-50/70 p-3 rounded-2xl border border-sky-200/80">
                  <div className="flex items-center gap-2 text-sky-950 font-bold text-xs">
                    <UserCheck size={15} className="text-sky-700" />
                    <span>Patient Authorized Transfer</span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-900 bg-white px-2.5 py-0.5 rounded-full border border-sky-200 font-extrabold">
                    Token: #AUTH-7821
                  </span>
                </div>
              </div>

              {/* SWIMLANE 2: HOSPITAL B */}
              <div className="bg-[#f8fafc] border border-slate-200/90 rounded-3xl p-5 flex flex-col justify-between shadow-2xs">
                {/* Lane Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-[#e84343] flex items-center justify-center font-bold">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wide">HOSPITAL B</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Apollo Specialty Hospital (Specialist & Continuity)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-100 text-[#e84343] px-2.5 py-1 rounded-full">
                    Receiving Facility
                  </span>
                </div>

                {/* Milestone Cards for Hospital B */}
                <div className="space-y-3">
                  {hospitalBEvents.map((ev, idx) => {
                    const stepNumber = hospitalAEvents.length + idx + 1;
                    const isSelected = selectedNode === ev.stage;
                    const isGap = primaryGap && primaryGap.affectedStage === ev.stage && !isClosed;
                    const isStepClosed = ev.status === 'COMPLETED';

                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedNode(ev.stage)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isGap
                            ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-300 shadow-sm'
                            : isSelected
                            ? 'bg-white ring-2 ring-[#e84343] border-[#e84343] shadow-sm'
                            : isStepClosed
                            ? 'bg-white hover:border-slate-300 border-slate-200/80 shadow-2xs hover:shadow-xs'
                            : 'bg-slate-100/70 border-dashed border-slate-300 text-slate-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            {isGap ? (
                              <div className="w-6 h-6 rounded-full bg-[#e84343] text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse mt-0.5">
                                !
                              </div>
                            ) : isStepClosed ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                ✓
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                ○
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`text-xs font-bold leading-snug ${isGap ? 'text-rose-950 font-black' : 'text-slate-900'}`}>
                                  {stepNumber}. {ev.stage.replace('_', ' ')}
                                </p>
                                {isGap && (
                                  <span className="badge-clean-coral uppercase text-[9px] tracking-wider font-extrabold">
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
                              <span className="text-[10px] font-bold text-[#e84343] bg-rose-100 px-2 py-0.5 rounded-full font-mono">
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
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Final Care Loop State:</span>
                  {isClosed ? (
                    <span className="badge-clean-emerald font-bold">✓ CLOSED</span>
                  ) : (
                    <span className="badge-clean-coral font-bold">⚠ UNRESOLVED</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Callout Banner (Clean warm gradient) */}
            <div className="mt-6 bg-gradient-to-r from-slate-50 via-sky-50 to-rose-50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#e84343] to-[#ff6b6b] text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                  CL
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    {isClosed
                      ? 'CARE CONTINUITY RESTORED: All milestones verified'
                      : 'CARELOOP FOUND THE BREAK: Step 8 of 9 (Follow-up at Hospital B)'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isClosed
                      ? 'Patient journey successfully reconciled between Metro General and Apollo Specialty.'
                      : 'Downstream care loop severed. Patient completed specialist consultation but failed follow-up checkpoint.'}
                  </p>
                </div>
              </div>

              {!isClosed && (
                <button
                  onClick={() => setIsVerifying(true)}
                  className="btn-coral-pill py-2.5 px-5 text-xs whitespace-nowrap"
                >
                  <Check size={14} />
                  <span>Resolve & Close Loop</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT CONTEXTUAL RAIL: INSPECTOR & TRIAGE PANEL */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200/90 bg-white p-6 flex flex-col justify-between overflow-y-auto shrink-0 shadow-2xs">
          <div className="space-y-5">
            {/* Header */}
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Contextual Inspector
                </span>
                {isSelectedNodeGap ? (
                  <span className="badge-clean-coral text-[10px]">
                    ACTIVE CARE GAP
                  </span>
                ) : (
                  <span className="badge-clean-emerald text-[10px]">
                    VERIFIED EVENT
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {selectedEvent.stage.replace('_', ' ')}
              </h3>
              <p className="text-xs text-slate-500">
                Provider: <strong className="text-slate-800">{selectedEvent.provider}</strong>
              </p>
            </div>

            {/* BREAKDOWN: IF NODE IS A GAP */}
            {isSelectedNodeGap && primaryGap ? (
              <div className="space-y-4">
                {/* Explainable Why Evidence Box */}
                <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-rose-950 font-bold text-xs">
                    <AlertCircle size={15} className="text-[#e84343] shrink-0" />
                    <span>WHY IS THIS CONSIDERED A BREAK?</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {primaryGap.whyEvidence?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        {item.verified ? (
                          <span className="text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="text-[#e84343] font-bold">✕</span>
                        )}
                        <span className={item.isMissingBreak ? 'font-bold text-rose-950 leading-tight' : 'text-slate-700 leading-tight'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gap Confidence Meter */}
                <div className="clean-pill-card p-4 space-y-2 border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">CONTINUITY CONFIDENCE</span>
                    <span className="font-mono font-bold text-[#e84343] text-sm">{primaryGap.confidence}%</span>
                  </div>
                  <ConfidenceBar score={primaryGap.confidence} />
                  <p className="text-[10px] text-slate-400">
                    Engine verified 7 prior timestamps + authenticated cross-hospital token.
                  </p>
                </div>

                {/* Source & Authorization Cards */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#fbfcff] border border-slate-200 rounded-2xl p-3">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">SOURCE</span>
                    <strong className="text-slate-800 text-xs block truncate">{primaryGap.sourceProvider}</strong>
                  </div>
                  <div className="bg-[#fbfcff] border border-slate-200 rounded-2xl p-3">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">PATIENT CONSENT</span>
                    <strong className="text-emerald-700 text-xs block font-bold">✓ Verified</strong>
                  </div>
                </div>

                {/* Quick Triage Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setIsVerifying(true)}
                    className="w-full btn-coral-pill py-3 text-xs"
                  >
                    <Check size={14} />
                    <span>Verify & Close Loop</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickAction('Staff outreach task assigned')}
                      className={`btn-soft-pill py-2 text-xs ${quickActionDone === 'Staff outreach task assigned' ? 'bg-rose-50 border-rose-300 text-[#e84343] font-bold' : ''}`}
                    >
                      <User size={12} />
                      <span>{quickActionDone === 'Staff outreach task assigned' ? 'Assigned ✓' : 'Assign Task'}</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('Patient SMS outreach triggered')}
                      className={`btn-soft-pill py-2 text-xs ${quickActionDone === 'Patient SMS outreach triggered' ? 'bg-rose-50 border-rose-300 text-[#e84343] font-bold' : ''}`}
                    >
                      <Phone size={12} />
                      <span>{quickActionDone === 'Patient SMS outreach triggered' ? 'Sent SMS ✓' : 'Outreach'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Verified Event Details */
              <div className="space-y-3.5 text-xs">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold mb-1">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Milestone Confirmed</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    {selectedEvent.notes || 'Documented in EHR without continuity discrepancy.'}
                  </p>
                </div>

                <div className="clean-pill-card p-4 space-y-2.5 text-xs border border-slate-100">
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Timestamp:</span>
                    <strong className="font-mono text-slate-800">{selectedEvent.date || 'Pending'}</strong>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
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
          <div className="pt-4 border-t border-slate-100 mt-6">
            <SafetyDisclaimer />
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {isVerifying && (
        <Modal title="Verify Clinical Action & Close Care Loop" onClose={() => setIsVerifying(false)}>
          <div className="space-y-4 text-xs">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-slate-800 leading-relaxed">
              You are verifying resolution of the <strong>Follow-up</strong> milestone for <strong>{currentPatient.name}</strong>.
              Upon confirmation, this patient's Care Closure Score will transition to <strong className="text-emerald-700">100% (CARE CLOSED)</strong>.
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Resolution Documentation *
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
                className="w-full bg-[#fbfcff] border border-slate-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-[#e84343] text-slate-800 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button onClick={() => setIsVerifying(false)} className="btn-soft-pill">
                Cancel
              </button>
              <button
                onClick={handleResolveGap}
                className="btn-coral-pill py-2.5 px-6 text-xs"
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
