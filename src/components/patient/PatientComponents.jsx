// CARELOOP - Reusable Patient Care Continuity Intelligence Components
// Designed with the clean bone-white (#fbfcff), coral (#e84343), deep navy (#0f172a),
// and calm clinical teal (#0d9488) aesthetic of CARELOOP.

import React, { useState } from 'react';
import {
  CheckCircle2, AlertTriangle, Clock, HelpCircle, ChevronRight,
  FileText, Calendar, ShieldCheck, Building2, Lock, Sparkles,
  X, Upload, Check, Bell, MessageSquare, ArrowRight, ArrowDown,
  Info, UserCheck, ExternalLink, RotateCcw, Eye, Send
} from 'lucide-react';
import { ASSISTANT_QUICK_QUESTIONS } from '../../data/patientPortalData';

/* ──────────────────────────────────────────────────────────
   1. PROGRESS CARD (Section 3: Four Compact Summary Cards)
   ────────────────────────────────────────────────────────── */
export function ProgressCard({ label, value, subtext, icon: Icon, accent = 'teal', onClick }) {
  const accentMap = {
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    coral: 'bg-rose-50 text-[#e84343] border-rose-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    navy: 'bg-slate-100 text-slate-800 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs transition-all ${
        onClick ? 'cursor-pointer hover:border-teal-500/40 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 tracking-tight">{label}</span>
        {Icon && (
          <div className={`w-7 h-7 rounded-xl border flex items-center justify-center ${accentMap[accent] || accentMap.teal}`}>
            <Icon size={14} />
          </div>
        )}
      </div>
      <div className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1.5">
        {value}
      </div>
      <p className="text-xs text-slate-500 font-medium truncate">{subtext}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   2. JOURNEY NODE (Section 4: Individual Horizontal Step Node)
   ────────────────────────────────────────────────────────── */
export function JourneyNode({ event, isSelected, onClick, isLast }) {
  const isVerified = event.status === 'VERIFIED';
  const isUnverified = event.status === 'UNVERIFIED';
  const isUnknown = event.status === 'UNKNOWN';

  return (
    <div className="flex items-center flex-1 min-w-[115px]">
      <button
        type="button"
        onClick={() => onClick(event)}
        className={`w-full text-left rounded-2xl p-3 transition-all relative group border ${
          isUnverified
            ? 'bg-rose-50/90 border-2 border-[#e84343] shadow-sm ring-4 ring-rose-100/80'
            : isUnknown
            ? 'bg-amber-50/80 border-2 border-amber-400 shadow-2xs'
            : isVerified
            ? 'bg-emerald-50/40 border-emerald-200/90 hover:border-emerald-400 hover:bg-emerald-50/70'
            : 'bg-slate-50/80 border-slate-200/80 hover:border-slate-300'
        } ${isSelected ? 'ring-2 ring-teal-600 ring-offset-2' : ''}`}
      >
        {/* Pulse indicator on active Care Gap node */}
        {isUnverified && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-[#e84343] text-white text-[10px] font-bold items-center justify-center">
              !
            </span>
          </span>
        )}

        <div className="flex items-center justify-between mb-1.5">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isVerified
                ? 'bg-emerald-600 text-white'
                : isUnverified
                ? 'bg-[#e84343] text-white'
                : isUnknown
                ? 'bg-amber-500 text-white'
                : 'bg-white border-2 border-slate-300 text-slate-400'
            }`}
          >
            {isVerified ? '✓' : isUnverified ? '⚠' : isUnknown ? '?' : '○'}
          </span>

          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              isVerified
                ? 'text-emerald-700 bg-emerald-100/80'
                : isUnverified
                ? 'text-[#e84343] bg-rose-100'
                : isUnknown
                ? 'text-amber-800 bg-amber-100'
                : 'text-slate-500 bg-slate-200/70'
            }`}
          >
            {isVerified
              ? 'Verified'
              : isUnverified
              ? 'Unverified'
              : isUnknown
              ? 'Unknown'
              : 'Pending'}
          </span>
        </div>

        <p
          className={`text-xs font-extrabold tracking-tight truncate ${
            isUnverified ? 'text-slate-900' : isVerified ? 'text-slate-800' : 'text-slate-500'
          }`}
        >
          {event.shortLabel}
        </p>
        <p className="text-[10px] text-slate-500 truncate mt-0.5">
          {event.provider.split('/')[0].trim()}
        </p>
      </button>

      {!isLast && (
        <div className="px-1.5 flex items-center justify-center flex-shrink-0">
          <div
            className={`w-4 h-0.5 rounded-full ${
              isVerified ? 'bg-emerald-400' : 'bg-slate-200'
            }`}
          />
          <ChevronRight
            size={13}
            className={`-ml-1 ${isVerified ? 'text-emerald-500' : 'text-slate-300'}`}
          />
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   3. HERO CARE JOURNEY (Section 4: Most Visually Important Component)
   ────────────────────────────────────────────────────────── */
export function CareJourney({
  events,
  progress,
  completedSteps,
  totalSteps,
  journeyStatus,
  selectedEventId,
  onSelectNode,
}) {
  const isClosed = journeyStatus === 'CARE_CLOSED';
  const isUnknown = journeyStatus === 'VERIFICATION_REQUESTED';

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs relative overflow-hidden">
      {/* Subtle top accent bar */}
      <div
        className={`
          absolute top-0 left-0 right-0 h-1 transition-colors duration-500
          ${isClosed ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-600 via-teal-500 to-[#e84343]'}
        `}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              My Care Journey
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/70">
              Care Continuity Map™
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Expected care compared with what has been completed
          </p>
        </div>

        {/* Progress readout & bar */}
        <div className="flex flex-col sm:items-end gap-1.5 min-w-[220px]">
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
            <span className="text-xs font-bold text-slate-700">
              {progress}% journey progress
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              ({completedSteps} of {totalSteps} steps)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isClosed
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Horizontal Care Journey Nodes */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex items-stretch min-w-[920px] py-2">
          {events.map((ev, idx) => (
            <JourneyNode
              key={ev.id}
              event={ev}
              isSelected={selectedEventId === ev.id}
              onClick={onSelectNode}
              isLast={idx === events.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Legend & Current Status Bar */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-500">Current status:</span>
          {isClosed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={13} />
              CARE CLOSED ✓
            </span>
          ) : isUnknown ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
              <HelpCircle size={13} />
              Care team checking records (Unknown status)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-[#e84343] border border-rose-200">
              <AlertTriangle size={13} />
              Action needed
            </span>
          )}
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            · Click any step node to inspect verification evidence
          </span>
        </div>

        {/* Status key */}
        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            Completed = Verified
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e84343] inline-block" />
            Warning = Needs verification
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-slate-400 bg-white inline-block" />
            Future = Pending
          </span>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   4. CARE GAP CARD (Section 5: Prominent Gap & Evidence Card)
   ────────────────────────────────────────────────────────── */
export function CareGapCard({
  gap,
  isResolved,
  externalVerification,
  onOpenVerifyModal,
  onOpenWhyDrawer,
  onResetDemo,
}) {
  if (isResolved) {
    return (
      <div className="bg-emerald-50/70 rounded-3xl border border-emerald-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  CARE CLOSED ✓
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  100% Journey Progress
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Follow-up verified — Care journey successfully closed.
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {externalVerification
                  ? `Verified via patient-authorized record from ${externalVerification.provider} (${externalVerification.date}). All 9 care continuity steps are now complete.`
                  : 'Your post-specialist follow-up has been confirmed and linked to your care pathway. All expected steps are verified.'}
              </p>

              {/* Show cross-provider chain if verified via external provider (Section 7) */}
              {externalVerification && (
                <div className="mt-4 p-3.5 bg-white rounded-2xl border border-emerald-200/80 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                    City Care Hospital
                  </span>
                  <ArrowRight size={13} className="text-emerald-600" />
                  <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                    Patient-authorized record ✓
                  </span>
                  <ArrowRight size={13} className="text-emerald-600" />
                  <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
                    {externalVerification.provider}
                  </span>
                  <ArrowRight size={13} className="text-emerald-600" />
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white">
                    Follow-up verified ✓
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onResetDemo}
            className="btn-soft-pill text-xs self-start md:self-center flex-shrink-0"
          >
            <RotateCcw size={13} />
            <span>Reset to Unverified State</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-rose-200/90 p-6 shadow-sm relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Description & Evidence Checklist */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-[#e84343] flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {gap.title}
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#e84343] border border-rose-200">
                    {gap.status === 'UNKNOWN' ? 'Status: Unknown' : 'Needs Verification'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Step 7 of 8 · Post-Specialist Follow-up Continuity Check
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenWhyDrawer}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 border border-teal-200/70 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 flex-shrink-0"
            >
              <Info size={13} />
              <span>Why am I seeing this?</span>
            </button>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/90 p-3.5 rounded-2xl border border-slate-100 font-medium">
            “{gap.reason}”
          </p>

          {/* Evidence Grid */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Continuity Evidence
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {gap.evidenceChecklist.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-semibold ${
                    item.verified
                      ? 'bg-emerald-50/50 border-emerald-200/70 text-slate-800'
                      : 'bg-rose-50/60 border-rose-200 text-rose-900'
                  }`}
                >
                  <span
                    className={`font-extrabold text-sm ${
                      item.verified ? 'text-emerald-600' : 'text-[#e84343]'
                    }`}
                  >
                    {item.verified ? '✓' : '✕'}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Gap Confidence & Patient Actions */}
        <div className="lg:col-span-5 bg-[#fbfcff] rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-extrabold text-slate-800">
                Gap confidence: {gap.confidence}%
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Evidence-Based
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-teal-600 rounded-full"
                style={{ width: `${gap.confidence}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
              “Confidence means confidence that this workflow gap exists based on available evidence. It is <strong>NOT</strong> medical risk.”
            </p>
          </div>

          {/* 3 Required Patient Action Buttons */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              How would you like to resolve this?
            </p>
            <button
              type="button"
              onClick={() => onOpenVerifyModal('COMPLETED')}
              className="w-full btn-coral-pill py-2.5 text-xs justify-center"
            >
              <CheckCircle2 size={15} />
              <span>I completed it</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onOpenVerifyModal('ELSEWHERE')}
                className="w-full py-2.5 px-3 rounded-full text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Building2 size={13} />
                <span>I completed it elsewhere</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenVerifyModal('UNSURE')}
                className="w-full py-2.5 px-3 rounded-full text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HelpCircle size={13} />
                <span>I’m not sure</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   5. EXPECTED VS ACTUAL VIEW (Section 14: Signature Comparison)
   ────────────────────────────────────────────────────────── */
export function ExpectedVsActualView({ events, onSelectNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Signature CARELOOP Comparison
          </span>
          <h3 className="text-base font-extrabold text-slate-900 mt-1">
            Expected Care vs. Actual Care
          </h3>
          <p className="text-xs text-slate-500">
            Visualizing where the expected care pathway diverges from recorded events
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Expected Care */}
        <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/70">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/70">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Expected Care
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Standard Clinical Pathway
            </span>
          </div>
          <div className="space-y-1.5">
            {events.map((ev, idx) => (
              <div key={ev.id}>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200/70 text-xs font-semibold text-slate-700">
                  <span>{ev.shortLabel}</span>
                  <span className="text-[10px] text-slate-400">Step {idx + 1}</span>
                </div>
                {idx < events.length - 1 && (
                  <div className="flex justify-center py-0.5 text-slate-300 text-xs leading-none">
                    ↓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Actual Care */}
        <div className="bg-[#fbfcff] rounded-2xl p-4 border border-slate-200/90">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/70">
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Actual Care
            </span>
            <span className="text-[11px] font-semibold text-teal-700">
              Live Continuity State
            </span>
          </div>
          <div className="space-y-1.5">
            {events.map((ev, idx) => {
              const isVerified = ev.status === 'VERIFIED';
              const isUnverified = ev.status === 'UNVERIFIED';
              const isUnknown = ev.status === 'UNKNOWN';

              return (
                <div key={ev.id}>
                  <button
                    type="button"
                    onClick={() => onSelectNode(ev)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                      isVerified
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 hover:bg-emerald-50'
                        : isUnverified
                        ? 'bg-rose-50 border-2 border-[#e84343] text-rose-950 shadow-xs'
                        : isUnknown
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-slate-100/70 border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{ev.shortLabel}</span>
                      {isUnverified && (
                        <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-[#e84343] text-white">
                          BROKEN DEPENDENCY
                        </span>
                      )}
                    </span>
                    <span
                      className={
                        isVerified
                          ? 'text-emerald-600 font-extrabold'
                          : isUnverified
                          ? 'text-[#e84343] font-extrabold'
                          : 'text-slate-400'
                      }
                    >
                      {isVerified ? '✓' : isUnverified ? '⚠' : isUnknown ? '?' : '○'}
                    </span>
                  </button>
                  {idx < events.length - 1 && (
                    <div
                      className={`flex justify-center py-0.5 text-xs leading-none font-bold ${
                        isVerified ? 'text-emerald-500' : 'text-[#e84343]'
                      }`}
                    >
                      ↓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   6. CROSS-PROVIDER CONTINUITY (Section 15: Multi-Hospital Swimlane)
   ────────────────────────────────────────────────────────── */
export function CrossProviderContinuity({ events, externalVerification, onOpenShareModal }) {
  const hospitalAEvents = events.filter((e) =>
    ['CONSULTATION', 'DIAGNOSTIC', 'RESULT', 'REFERRAL'].includes(e.key)
  );
  const hospitalBEvents = events.filter((e) =>
    ['SPECIALIST', 'FOLLOW_UP'].includes(e.key)
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
            Cross-Provider Continuity
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <Lock size={11} /> Patient-Controlled Consent
          </span>
        </div>

        <h3 className="text-base font-extrabold text-slate-900">
          Your care journey continues across providers.
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 mb-5">
          Hospitals cannot freely access your records. Continuity links are established only through your explicit authorization.
        </p>

        {/* Provider Flow Diagram */}
        <div className="space-y-3">
          {/* Hospital A Box */}
          <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-teal-700" />
                <span className="text-xs font-extrabold text-slate-900">
                  Hospital A · City Care Hospital
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                4 Steps Verified ✓
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {hospitalAEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white px-2.5 py-2 rounded-xl border border-emerald-200/70 text-xs font-bold text-slate-800 flex items-center justify-between"
                >
                  <span className="truncate">{ev.shortLabel}</span>
                  <span className="text-emerald-600 ml-1">✓</span>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Authorization Bridge */}
          <div className="flex flex-col items-center py-1">
            <div className="w-0.5 h-3 bg-teal-500" />
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-300 text-teal-900 text-xs font-extrabold shadow-2xs">
              <ShieldCheck size={14} className="text-teal-700" />
              <span>Patient authorization</span>
              <span className="text-[10px] font-semibold text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-200">
                Authorized ✓
              </span>
            </div>
            <div className="w-0.5 h-3 bg-teal-500" />
          </div>

          {/* Hospital B Box */}
          <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-sky-700" />
                <span className="text-xs font-extrabold text-slate-900">
                  Hospital B · Specialist Clinic
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                Receiving Provider
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {hospitalBEvents.map((ev) => {
                const isVer = ev.status === 'VERIFIED';
                return (
                  <div
                    key={ev.id}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                      isVer
                        ? 'bg-white border-emerald-200 text-slate-800'
                        : 'bg-rose-50 border-[#e84343] text-rose-900'
                    }`}
                  >
                    <span>{ev.shortLabel}</span>
                    <span className={isVer ? 'text-emerald-600' : 'text-[#e84343]'}>
                      {isVer ? '✓' : '⚠'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional External Provider Handoff (if Completed Elsewhere was used) */}
          {externalVerification && (
            <>
              <div className="flex flex-col items-center py-1">
                <div className="w-0.5 h-3 bg-emerald-500" />
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-extrabold">
                  <UserCheck size={13} />
                  <span>Patient-authorized external record</span>
                </div>
                <div className="w-0.5 h-3 bg-emerald-500" />
              </div>
              <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-slate-900">
                    External Provider · {externalVerification.provider}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Follow-up verified on {externalVerification.date}
                  </p>
                </div>
                <span className="text-xs font-extrabold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200">
                  Follow-up verified ✓
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          You can revoke or modify provider permissions anytime.
        </span>
        <button
          type="button"
          onClick={onOpenShareModal}
          className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
        >
          <span>Manage access</span>
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   7. REPORT CARD (Section 8: Clean Non-Diagnostic Report Item)
   ────────────────────────────────────────────────────────── */
export function ReportCard({ report, onViewReport }) {
  return (
    <div
      onClick={() => onViewReport(report)}
      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fbfcff] border border-slate-200/80 hover:border-teal-300 hover:shadow-xs transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
          <FileText size={16} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-extrabold text-slate-900 truncate">
              {report.title}
            </h4>
            <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-extrabold text-[9px] uppercase">
              PDF
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {report.fileName || `${report.title}.pdf`} · {report.status}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onViewReport(report);
        }}
        className="px-3 py-1.5 rounded-full text-xs font-bold text-teal-700 bg-teal-50/80 group-hover:bg-teal-600 group-hover:text-white border border-teal-200/70 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer"
      >
        <Eye size={12} />
        <span>View PDF</span>
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   8. APPOINTMENT CARD (Section 9: Upcoming Appointment)
   ────────────────────────────────────────────────────────── */
export function AppointmentCard({ appointment, onToggleReminder, onViewDetails }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Next appointment
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            {appointment.title}
          </span>
        </div>

        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {appointment.date}
          </span>
          <span className="text-sm font-bold text-teal-700">
            {appointment.time}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-100">
          <p className="font-extrabold text-slate-900">{appointment.doctor}</p>
          <p className="font-medium text-slate-500">{appointment.provider}</p>
          <p className="text-[11px] text-teal-800 font-semibold pt-1 flex items-center gap-1.5">
            <Info size={12} className="text-teal-600" />
            “{appointment.note}”
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onViewDetails(appointment)}
          className="btn-soft-pill text-xs py-2 justify-center"
        >
          View details
        </button>
        <button
          type="button"
          onClick={() => onToggleReminder(appointment.id)}
          className={`rounded-full text-xs font-bold py-2 px-3 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            appointment.reminderSet
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          <Bell size={12} />
          <span>{appointment.reminderSet ? 'Reminder added ✓' : 'Add reminder'}</span>
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   9. SHARED RECORD CARD & SECTION (Section 10: Privacy & Audit)
   ────────────────────────────────────────────────────────── */
export function SharedRecordCard({ record, onToggleAccess }) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fbfcff] border border-slate-200/80">
      <div>
        <h4 className="text-xs font-extrabold text-slate-900">{record.provider}</h4>
        <p className="text-[11px] text-slate-500">{record.records}</p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            record.active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
        >
          {record.active ? 'Authorized ✓' : 'Revoked'}
        </span>
        {onToggleAccess && (
          <button
            type="button"
            onClick={() => onToggleAccess(record.id)}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 underline ml-1 cursor-pointer"
          >
            {record.active ? 'Revoke' : 'Restore'}
          </button>
        )}
      </div>
    </div>
  );
}

export function RecordSharing({ sharedRecords, onManageAccess, onShareRecord, onToggleAccess }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-extrabold text-slate-900">Your shared records</h3>
          <ShieldCheck size={18} className="text-teal-600" />
        </div>
        <p className="text-xs text-slate-500 mb-4">
          “You control which records are shared with another care provider.”
        </p>

        <div className="space-y-2.5 mb-4">
          {sharedRecords.map((rec) => (
            <SharedRecordCard key={rec.id} record={rec} onToggleAccess={onToggleAccess} />
          ))}
        </div>

        {/* Audit / Privacy Notice */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-center justify-between">
          <span className="font-medium text-slate-500">Last accessed:</span>
          <span className="font-bold text-slate-800">
            Specialist Clinic · Today · 10:42 AM
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onManageAccess}
          className="btn-soft-pill text-xs py-2 justify-center"
        >
          Manage access
        </button>
        <button
          type="button"
          onClick={onShareRecord}
          className="py-2 px-3 rounded-full text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ShieldCheck size={13} />
          <span>Share a record</span>
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   10. ACTIVITY TIMELINE (Section 11: Simple, Clean Timeline)
   ────────────────────────────────────────────────────────── */
export function ActivityTimeline({ activities }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
      <h3 className="text-base font-extrabold text-slate-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((item, idx) => {
          const isWarn = item.type === 'warning';
          return (
            <div key={item.id} className="flex items-start gap-3.5 relative">
              <div className="flex flex-col items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1 ${
                    isWarn ? 'bg-[#e84343] ring-4 ring-rose-100' : 'bg-teal-600'
                  }`}
                />
                {idx < activities.length - 1 && (
                  <div className="w-px h-8 bg-slate-200 mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0 -mt-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {item.time}
                </p>
                <p
                  className={`text-xs font-extrabold ${
                    isWarn ? 'text-[#e84343]' : 'text-slate-900'
                  }`}
                >
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   11. EVIDENCE DRAWER (Section 13: Care Journey Details Drawer)
   ────────────────────────────────────────────────────────── */
export function EvidenceDrawer({
  isOpen,
  onClose,
  selectedEvent,
  gap,
  onVerifyClick,
  onMarkUnknown,
  onContactCareTeam,
}) {
  if (!isOpen || !selectedEvent) return null;

  const isFollowUp = selectedEvent.key === 'FOLLOW_UP';
  const isVerified = selectedEvent.status === 'VERIFIED';
  const isUnverified = selectedEvent.status === 'UNVERIFIED';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/25 backdrop-blur-[2px] animate-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Care Journey Step Details
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                {selectedEvent.type}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Structured Metadata */}
          <div className="space-y-3 bg-[#fbfcff] p-4 rounded-2xl border border-slate-200/80 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Status</span>
              <span
                className={`font-extrabold px-2.5 py-0.5 rounded-full ${
                  isVerified
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isUnverified
                    ? 'bg-rose-50 text-[#e84343] border border-rose-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isVerified
                  ? 'Verified ✓'
                  : isUnverified
                  ? 'Unverified ⚠'
                  : selectedEvent.status === 'UNKNOWN'
                  ? 'Unknown ?'
                  : 'Pending ○'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Provider</span>
              <span className="font-bold text-slate-900">{selectedEvent.provider}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">
                {isFollowUp && !isVerified ? 'Expected' : 'Date'}
              </span>
              <span className="font-bold text-slate-900">
                {isFollowUp && !isVerified
                  ? 'Within 30 days of specialist visit'
                  : selectedEvent.date}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Evidence</span>
              <span className="font-bold text-emerald-700">{selectedEvent.evidence}</span>
            </div>

            {selectedEvent.missingItem && !isVerified && (
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Missing</span>
                <span className="font-extrabold text-[#e84343]">
                  {selectedEvent.missingItem}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500 font-medium">Next dependency</span>
              <span className="font-bold text-slate-800">{selectedEvent.nextDependency}</span>
            </div>
          </div>

          {/* Explanation box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <p className="text-xs font-extrabold text-slate-800">
              Continuity Context
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedEvent.details}
            </p>
          </div>

          {/* Full Evidence Checklist when viewing Follow-up gap */}
          {isFollowUp && gap && (
            <div className="space-y-2.5">
              <p className="text-xs font-extrabold text-slate-900">
                Why CARELOOP flagged this step (Confidence: {gap.confidence}%)
              </p>
              {gap.evidenceChecklist.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-white flex items-start gap-2.5 text-xs"
                >
                  <span
                    className={`font-extrabold ${
                      ev.verified ? 'text-emerald-600' : 'text-[#e84343]'
                    }`}
                  >
                    {ev.verified ? '✓' : '✕'}
                  </span>
                  <div>
                    <p className="font-bold text-slate-800">{ev.label}</p>
                    <p className="text-[11px] text-slate-500">{ev.detail}</p>
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-slate-500 italic pt-1">
                CARELOOP never assumes a missing record means you missed the step. You can confirm completion below.
              </p>
            </div>
          )}
        </div>

        {/* Actions for Follow-up / Unverified step */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          {!isVerified && (
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerifyClick('COMPLETED');
                }}
                className="w-full btn-coral-pill py-2.5 text-xs justify-center"
              >
                <CheckCircle2 size={14} />
                <span>Verify</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onMarkUnknown();
                    onClose();
                  }}
                  className="btn-soft-pill text-xs py-2 justify-center"
                >
                  Mark unknown
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onContactCareTeam();
                    onClose();
                  }}
                  className="btn-soft-pill text-xs py-2 justify-center text-teal-700 border-teal-200"
                >
                  Contact care team
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Close drawer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   12. VERIFICATION MODAL (Sections 6 & 7: Verify & Completed Elsewhere)
   ────────────────────────────────────────────────────────── */
export function VerificationModal({
  isOpen,
  initialMode = 'COMPLETED',
  onClose,
  onConfirmCompleted,
  onConfirmElsewhere,
  onConfirmUnsure,
}) {
  const [selectedOption, setSelectedOption] = useState(initialMode);
  const [providerName, setProviderName] = useState('Apollo Specialty Clinic');
  const [visitDate, setVisitDate] = useState('2026-10-13');
  const [uploadedFile, setUploadedFile] = useState('FollowUp_Consultation_Note.pdf');
  const [authorized, setAuthorized] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOption === 'COMPLETED') {
      onConfirmCompleted();
    } else if (selectedOption === 'ELSEWHERE') {
      if (!authorized) return;
      onConfirmElsewhere({
        provider: providerName || 'External Specialist Clinic',
        date: visitDate || '13 Oct 2026',
        reportFile: uploadedFile,
      });
    } else {
      onConfirmUnsure();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[2px]">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Care Loop Verification
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1">
              Confirm follow-up
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              “Did you complete the follow-up related to this care journey?”
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 3 Radio Options */}
          <div className="space-y-2">
            {[
              {
                id: 'COMPLETED',
                label: 'Yes, I completed it',
                desc: 'Completed at City Care Hospital or Specialist Clinic',
              },
              {
                id: 'ELSEWHERE',
                label: 'I completed it at another provider',
                desc: 'Link an external clinic or hospital record with your authorization',
              },
              {
                id: 'UNSURE',
                label: 'I’m not sure',
                desc: 'Mark as Unknown and ask the care team to check records for you',
              },
            ].map((opt) => (
              <label
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedOption === opt.id
                    ? 'bg-teal-50/60 border-teal-600 ring-2 ring-teal-500/20'
                    : 'bg-[#fbfcff] border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="followup_opt"
                  checked={selectedOption === opt.id}
                  onChange={() => setSelectedOption(opt.id)}
                  className="mt-1 accent-teal-600"
                />
                <div>
                  <p className="text-xs font-extrabold text-slate-900">{opt.label}</p>
                  <p className="text-[11px] text-slate-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Section 7: Completed Elsewhere Form */}
          {selectedOption === 'ELSEWHERE' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5">
              <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Building2 size={14} className="text-teal-700" />
                External Provider Record Details
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Provider name *
                  </label>
                  <input
                    type="text"
                    required
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    placeholder="e.g. Apollo Specialty Clinic"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Optional report upload
                </label>
                <div className="flex items-center justify-between bg-white border border-dashed border-slate-300 rounded-xl px-3 py-2 text-xs">
                  <span className="text-slate-700 font-medium truncate flex items-center gap-1.5">
                    <Upload size={13} className="text-teal-600" />
                    {uploadedFile || 'Attach visit summary (PDF/JPG)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUploadedFile('External_FollowUp_Verified.pdf')}
                    className="text-[11px] font-bold text-teal-700 hover:underline ml-2"
                  >
                    Change file
                  </button>
                </div>
              </div>

              {/* Patient Authorization Checkbox */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={authorized}
                  onChange={(e) => setAuthorized(e.target.checked)}
                  className="mt-0.5 accent-teal-600"
                  required
                />
                <span className="text-xs text-slate-700 font-semibold leading-snug">
                  “I authorize CARELOOP to use this record to update my care journey.”
                </span>
              </label>

              {/* Cross-provider preview */}
              <div className="bg-white p-3 rounded-xl border border-teal-200/80 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-1 font-semibold">
                <span>City Care Hospital</span>
                <span>→</span>
                <span className="text-teal-700 font-bold">Patient-authorized record</span>
                <span>→</span>
                <span>{providerName || 'External Provider'}</span>
                <span>→</span>
                <span className="text-emerald-700 font-bold">Follow-up verified ✓</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-soft-pill text-xs py-2.5 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedOption === 'ELSEWHERE' && !authorized}
              className="btn-coral-pill text-xs py-2.5 px-5 disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              <span>
                {selectedOption === 'ELSEWHERE'
                  ? 'Verify & update journey'
                  : selectedOption === 'COMPLETED'
                  ? 'Verify & close care loop'
                  : 'Save status as Unknown'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   13. AI CARE ASSISTANT (Section 12: Panel & Fullscreen Support)
   ────────────────────────────────────────────────────────── */
export function CareAssistant({
  isOpen,
  onClose,
  isFullScreen = false,
  isJourneyClosed = false,
}) {
  const [messages, setMessages] = useState([
    {
      id: 'm-0',
      sender: 'assistant',
      text: 'Hello Rahul. Your specialist visit has been verified. CARELOOP is waiting for confirmation of the follow-up step. You can tell us whether you completed it, completed it elsewhere, or are unsure.',
    },
  ]);
  const [customInput, setCustomInput] = useState('');

  if (!isOpen && !isFullScreen) return null;

  const handleSelectQuestion = (qObj) => {
    const dynamicAnswer =
      isJourneyClosed && qObj.id === 'q1'
        ? 'Your follow-up step is now verified and your care journey is 100% closed! Keep your upcoming 18 October appointment with Dr. Sharma if you wish to discuss ongoing wellness.'
        : qObj.answer;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: qObj.question },
      { id: `a-${Date.now() + 1}`, sender: 'assistant', text: dynamicAnswer },
    ]);
  };

  const handleSendCustom = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const userText = customInput.trim();
    setCustomInput('');

    let reply =
      'Your specialist visit has been verified. CARELOOP is waiting for confirmation of the follow-up step. You can tell us whether you completed it, completed it elsewhere, or are unsure.';

    const lower = userText.toLowerCase();
    if (lower.includes('next') || lower.includes('do')) {
      reply = ASSISTANT_QUICK_QUESTIONS[0].answer;
    } else if (lower.includes('why') || lower.includes('pending') || lower.includes('follow')) {
      reply = ASSISTANT_QUICK_QUESTIONS[1].answer;
    } else if (lower.includes('share') || lower.includes('record') || lower.includes('access')) {
      reply = ASSISTANT_QUICK_QUESTIONS[2].answer;
    } else if (lower.includes('appointment') || lower.includes('when') || lower.includes('where')) {
      reply = ASSISTANT_QUICK_QUESTIONS[3].answer;
    } else if (lower.includes('journey') || lower.includes('happen')) {
      reply = ASSISTANT_QUICK_QUESTIONS[4].answer;
    } else if (lower.includes('diagnos') || lower.includes('medicine') || lower.includes('dose') || lower.includes('treat')) {
      reply =
        'Important safety note: CARELOOP Care Assistant only explains care workflow steps and record continuity. It does not diagnose conditions, interpret medical values, or prescribe treatment. Please consult Dr. Sharma for medical advice.';
    }

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: userText },
      { id: `a-${Date.now() + 1}`, sender: 'assistant', text: reply },
    ]);
  };

  const content = (
    <div className="flex flex-col h-full justify-between bg-white">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#fbfcff]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              CARELOOP Care Assistant
            </h3>
            <p className="text-xs text-slate-500">“Ask about your care journey.”</p>
          </div>
        </div>
        {!isFullScreen && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Safety Banner */}
      <div className="px-5 py-2.5 bg-teal-50/70 border-b border-teal-100 text-[11px] text-teal-900 font-medium flex items-center gap-2">
        <ShieldCheck size={14} className="text-teal-700 flex-shrink-0" />
        <span>
          Workflow guide only — CARELOOP does not diagnose conditions or prescribe treatment.
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-[#fbfcff] border border-slate-200/90 text-slate-800 font-medium shadow-2xs'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {/* Quick Questions */}
        <div className="pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Suggested Questions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ASSISTANT_QUICK_QUESTIONS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuestion(q)}
                className="text-left text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200/80 transition-colors cursor-pointer"
              >
                {q.question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Footer */}
      <form
        onSubmit={handleSendCustom}
        className="p-4 border-t border-slate-100 bg-[#fbfcff] flex items-center gap-2"
      >
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Ask about your care steps, appointments, or shared records..."
          className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
        />
        <button
          type="submit"
          className="w-9 h-9 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center flex-shrink-0 cursor-pointer"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden h-[640px]">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/25 backdrop-blur-[2px]">
      <div className="w-full max-w-md h-full shadow-2xl border-l border-slate-200">
        {content}
      </div>
    </div>
  );
}
