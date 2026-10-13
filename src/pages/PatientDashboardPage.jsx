// CARELOOP - Production-Style Patient Care Continuity Intelligence Dashboard
// Replaces the Care Coordinator Dashboard with the signature Patient Experience (Rahul Sharma).
// Harmonizes the clean bone-white (#fbfcff), coral (#e84343), deep navy (#0f172a),
// and subtle teal (#0d9488) aesthetic of CARELOOP.

import React, { useState } from 'react';
import {
  Activity, GitCommit, CheckSquare, FileText, Calendar, ShieldCheck,
  Sparkles, HelpCircle, Settings, Search, Bell, User, LogOut,
  CheckCircle2, AlertTriangle, Building2, Lock, Play, RotateCcw,
  Eye, X, Plus, ExternalLink, Globe, Phone, Mail, Clock, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  INITIAL_PATIENT_DATA,
  INITIAL_JOURNEY_EVENTS,
  INITIAL_CARE_GAP,
  INITIAL_REPORTS,
  INITIAL_APPOINTMENTS,
  INITIAL_SHARED_RECORDS,
  INITIAL_ACTIVITY,
} from '../data/patientPortalData';
import {
  ProgressCard,
  CareJourney,
  CareGapCard,
  ExpectedVsActualView,
  CrossProviderContinuity,
  ReportCard,
  AppointmentCard,
  RecordSharing,
  ActivityTimeline,
  EvidenceDrawer,
  VerificationModal,
  CareAssistant,
} from '../components/patient/PatientComponents';

const SIDEBAR_MAIN_NAV = [
  { id: 'journey', label: 'My Journey', icon: GitCommit },
  { id: 'actions', label: 'My Actions', icon: CheckSquare },
  { id: 'reports', label: 'My Reports', icon: FileText },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'shared', label: 'Shared Records', icon: ShieldCheck },
  { id: 'assistant', label: 'Care Assistant', icon: Sparkles },
];

const SIDEBAR_BOTTOM_NAV = [
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function PatientDashboardPage({ onBackToLanding }) {
  const { logout } = useApp();

  // Active Navigation Tab
  const [activeNav, setActiveNav] = useState('journey');
  const [searchQuery, setSearchQuery] = useState('');

  // Core Patient Journey State
  const [patient, setPatient] = useState(INITIAL_PATIENT_DATA);
  const [events, setEvents] = useState(INITIAL_JOURNEY_EVENTS);
  const [gap, setGap] = useState(INITIAL_CARE_GAP);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [sharedRecords, setSharedRecords] = useState(INITIAL_SHARED_RECORDS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITY);
  const [externalVerification, setExternalVerification] = useState(null);

  // Action Checklist State (for "My Actions" tab)
  const [actionItems, setActionItems] = useState([
    {
      id: 'act-verify-followup',
      title: 'Verify follow-up',
      subtitle: 'Confirm whether your post-specialist follow-up was completed',
      category: 'Care Continuity Gap · 94% Confidence',
      status: 'PENDING',
      isPrimaryGap: true,
    },
    {
      id: 'act-review-report',
      title: 'Review report',
      subtitle: 'HbA1c laboratory document available from City Care Hospital',
      category: 'My Reports',
      status: 'PENDING',
    },
    {
      id: 'act-confirm-appt',
      title: 'Confirm appointment',
      subtitle: '18 October · 10:30 AM with Dr. Sharma at City Care Hospital',
      category: 'Appointments',
      status: 'PENDING',
    },
    {
      id: 'act-auth-sharing',
      title: 'Authorize record sharing',
      subtitle: 'Review active consent for City Care Hospital & Specialist Clinic',
      category: 'Privacy & Consent',
      status: 'COMPLETED',
    },
  ]);

  // Drawers, Modals & Demo Animation State
  const [selectedDrawerEvent, setSelectedDrawerEvent] = useState(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyModalMode, setVerifyModalMode] = useState('COMPLETED');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);
  const [viewingAppointment, setViewingAppointment] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [demoAnimating, setDemoAnimating] = useState(false);

  // Share Record Form State
  const [newShareProvider, setNewShareProvider] = useState('');
  const [newShareScope, setNewShareScope] = useState('Selected reports (HbA1c, Specialist Report)');
  const [newShareConsent, setNewShareConsent] = useState(true);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  /* ──────────────────────────────────────────────────────────
     CARE GAP RESOLUTION LOGIC (Sections 6, 7 & 17)
     ────────────────────────────────────────────────────────── */
  const handleConfirmCompleted = () => {
    setVerifyModalOpen(false);
    setExternalVerification(null);

    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.key === 'FOLLOW_UP') {
          return {
            ...ev,
            status: 'VERIFIED',
            date: 'Verified Today',
            evidence: 'Patient-confirmed follow-up completion',
            missingItem: null,
          };
        }
        if (ev.key === 'CLOSURE') {
          return {
            ...ev,
            status: 'VERIFIED',
            date: 'Closed Today',
            evidence: 'All 9 care continuity steps verified ✓',
            missingItem: null,
          };
        }
        return ev;
      })
    );

    setPatient((prev) => ({
      ...prev,
      journeyProgress: 100,
      completedSteps: 9,
      journeyStatus: 'CARE_CLOSED',
    }));

    setGap((prev) => ({ ...prev, status: 'VERIFIED' }));

    setActionItems((prev) =>
      prev.map((item) =>
        item.id === 'act-verify-followup' ? { ...item, status: 'COMPLETED' } : item
      )
    );

    setActivities((prev) => [
      {
        id: `ACT-${Date.now()}`,
        time: 'Just now',
        title: 'Follow-up verified & Care loop closed ✓',
        subtitle: 'Journey progress updated from 78% to 100% (CARE CLOSED)',
        type: 'verified',
      },
      ...prev.filter((a) => a.id !== 'ACT-01'),
    ]);

    triggerToast('Follow-up verified — Care journey successfully closed (100%).');
  };

  const handleConfirmElsewhere = ({ provider, date, reportFile }) => {
    setVerifyModalOpen(false);
    setExternalVerification({ provider, date, reportFile });

    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.key === 'FOLLOW_UP') {
          return {
            ...ev,
            status: 'VERIFIED',
            provider,
            date,
            evidence: `Patient-authorized record from ${provider}`,
            missingItem: null,
          };
        }
        if (ev.key === 'CLOSURE') {
          return {
            ...ev,
            status: 'VERIFIED',
            date: 'Closed Today',
            evidence: 'Cross-provider care continuity verified ✓',
            missingItem: null,
          };
        }
        return ev;
      })
    );

    setPatient((prev) => ({
      ...prev,
      journeyProgress: 100,
      completedSteps: 9,
      journeyStatus: 'CARE_CLOSED',
    }));

    setGap((prev) => ({ ...prev, status: 'VERIFIED' }));

    // Add external provider to Shared Records automatically with patient authorization
    setSharedRecords((prev) => {
      const exists = prev.some((r) => r.provider.toLowerCase() === provider.toLowerCase());
      if (exists) return prev;
      return [
        ...prev,
        {
          id: `SHR-${Date.now()}`,
          provider,
          role: 'External Continuity Provider',
          records: 'Follow-up verification record',
          authorization: 'Authorized',
          lastAccessed: `${provider} · Just now`,
          active: true,
        },
      ];
    });

    setActionItems((prev) =>
      prev.map((item) =>
        item.id === 'act-verify-followup' ? { ...item, status: 'COMPLETED' } : item
      )
    );

    setActivities((prev) => [
      {
        id: `ACT-${Date.now()}`,
        time: 'Just now',
        title: `Follow-up verified via ${provider} ✓`,
        subtitle: 'Patient-authorized cross-provider record closed the care loop (100%)',
        type: 'verified',
      },
      ...prev.filter((a) => a.id !== 'ACT-01'),
    ]);

    triggerToast(`Cross-provider record authorized from ${provider}. Care journey closed!`);
  };

  const handleConfirmUnsure = () => {
    setVerifyModalOpen(false);
    setEvents((prev) =>
      prev.map((ev) =>
        ev.key === 'FOLLOW_UP'
          ? {
              ...ev,
              status: 'UNKNOWN',
              details:
                'Marked as Unknown by patient. CARELOOP has asked the care coordination team to check provider records without assuming the step was missed.',
            }
          : ev
      )
    );
    setPatient((prev) => ({
      ...prev,
      journeyStatus: 'VERIFICATION_REQUESTED',
    }));
    setGap((prev) => ({ ...prev, status: 'UNKNOWN' }));
    setActivities((prev) => [
      {
        id: `ACT-${Date.now()}`,
        time: 'Just now',
        title: 'Follow-up marked as Unknown',
        subtitle: 'Care team notified to check records with City Care Hospital & Specialist Clinic',
        type: 'verified',
      },
      ...prev,
    ]);
    triggerToast('Status set to Unknown. Your care team will check provider records for you.');
  };

  const handleResetDemo = () => {
    setPatient(INITIAL_PATIENT_DATA);
    setEvents(INITIAL_JOURNEY_EVENTS);
    setGap(INITIAL_CARE_GAP);
    setExternalVerification(null);
    setActivities(INITIAL_ACTIVITY);
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === 'act-verify-followup' ? { ...item, status: 'PENDING' } : item
      )
    );
    triggerToast('Demo reset to 78% journey progress (Follow-up unverified).');
  };

  // Section 17: Smooth Live Judge Demo Mode Animation
  const handleRunLiveDemoResolution = () => {
    if (patient.journeyStatus === 'CARE_CLOSED') {
      handleResetDemo();
      return;
    }
    setActiveNav('journey');
    setDemoAnimating(true);
    triggerToast('Demo Mode: Verifying Follow-up step...');

    setTimeout(() => {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.key === 'FOLLOW_UP'
            ? {
                ...ev,
                status: 'VERIFIED',
                date: 'Verified (Demo)',
                evidence: 'Follow-up record confirmed',
              }
            : ev
        )
      );
      setPatient((prev) => ({ ...prev, journeyProgress: 89, completedSteps: 8 }));
    }, 650);

    setTimeout(() => {
      handleConfirmCompleted();
      setDemoAnimating(false);
      triggerToast('Care journey successfully closed.');
    }, 1400);
  };

  const handleToggleReminder = (apptId) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === apptId ? { ...a, reminderSet: !a.reminderSet } : a
      )
    );
    triggerToast('Appointment reminder updated for 18 October · 10:30 AM.');
  };

  const handleToggleSharedAccess = (recId) => {
    setSharedRecords((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, active: !r.active } : r))
    );
    triggerToast('Provider record-sharing permission updated.');
  };

  const handleAddSharedRecord = (e) => {
    e.preventDefault();
    if (!newShareProvider.trim() || !newShareConsent) return;
    const newRec = {
      id: `SHR-${Date.now()}`,
      provider: newShareProvider.trim(),
      role: 'Patient-Authorized Provider',
      records: newShareScope,
      authorization: 'Authorized',
      lastAccessed: 'Authorized Today · No access yet',
      active: true,
    };
    setSharedRecords((prev) => [...prev, newRec]);
    setNewShareProvider('');
    setShareModalOpen(false);
    triggerToast(`Record access authorized for ${newRec.provider}.`);
  };

  const isJourneyClosed = patient.journeyStatus === 'CARE_CLOSED';
  const pendingActionCount = actionItems.filter((a) => a.status === 'PENDING').length;

  const currentNavLabel =
    SIDEBAR_MAIN_NAV.find((n) => n.id === activeNav)?.label ||
    SIDEBAR_BOTTOM_NAV.find((n) => n.id === activeNav)?.label ||
    'My Journey';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#fbfcff] text-slate-800 font-sans">
      {/* ──────────────────────────────────────────────────────────
          1. LEFT SIDEBAR (Section 1: CARELOOP Logo, 6 Nav Items, Bottom Profile)
          ────────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between h-screen sticky top-0 z-20 flex-shrink-0">
        {/* Top Logo & Navigation */}
        <div>
          {/* Brand Logo */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div
              onClick={() => setActiveNav('journey')}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#e84343] to-[#ff6b6b] text-white flex items-center justify-center font-black shadow-sm shadow-rose-200">
                <Activity size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-900 font-extrabold text-base tracking-tight">
                    CARE<span className="text-[#e84343]">LOOP</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider -mt-0.5">
                  Continuity Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Primary Navigation List */}
          <div className="px-3 py-4">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Personal Care Portal
            </p>
            <nav className="space-y-1">
              {SIDEBAR_MAIN_NAV.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveNav(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                      active
                        ? 'bg-teal-50/90 text-teal-900 font-extrabold border-l-4 border-teal-600 shadow-2xs'
                        : 'text-slate-600 font-semibold hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={16}
                        className={active ? 'text-teal-700' : 'text-slate-400'}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.id === 'actions' && pendingActionCount > 0 && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          !isJourneyClosed
                            ? 'bg-rose-100 text-[#e84343]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {pendingActionCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom: Help & Support, Settings, Patient Profile */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/40">
          <div className="space-y-0.5">
            {SIDEBAR_BOTTOM_NAV.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    active
                      ? 'bg-teal-50 text-teal-900 font-extrabold border-l-4 border-teal-600'
                      : 'text-slate-500 font-semibold hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon size={15} className={active ? 'text-teal-700' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Patient Profile Card */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                {patient.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-slate-900 truncate">
                  {patient.name}
                </p>
                <p className="text-[10px] text-teal-700 font-semibold truncate">
                  Patient ID: {patient.id}
                </p>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
              {onBackToLanding && (
                <button
                  type="button"
                  onClick={onBackToLanding}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <Globe size={11} />
                  <span>Home Portal</span>
                </button>
              )}
              <button
                type="button"
                onClick={logout}
                className="text-[11px] font-bold text-slate-500 hover:text-[#e84343] flex items-center gap-1 ml-auto cursor-pointer"
              >
                <LogOut size={11} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────
          2. MAIN CONTENT COLUMN (Top Bar + Scrollable Canvas)
          ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar (Section 1: Breadcrumb, Search, Demo Trigger, Notification, Avatar & Name) */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between flex-shrink-0 z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-400">CARELOOP</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-500">Patient Portal</span>
            <span className="text-slate-300">/</span>
            <span className="font-extrabold text-slate-900">{currentNavLabel}</span>
          </div>

          {/* Right Controls: Search + Demo Mode + Notifications + Patient Profile */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block w-60">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search journey, reports..."
                className="w-full bg-[#fbfcff] border border-slate-200 rounded-full pl-9 pr-3.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-600"
              />
            </div>

            {/* Section 17: Demo Mode One-Click Judge Button */}
            <button
              type="button"
              onClick={handleRunLiveDemoResolution}
              disabled={demoAnimating}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isJourneyClosed
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100 shadow-2xs'
              }`}
              title="Hackathon Judge Presentation Mode: Animate 78% → 100% Care Closure"
            >
              {isJourneyClosed ? (
                <>
                  <RotateCcw size={12} />
                  <span>Reset Demo (78%)</span>
                </>
              ) : (
                <>
                  <Play size={12} className="fill-teal-700 text-teal-700" />
                  <span>{demoAnimating ? 'Closing Loop...' : 'Demo Mode: Resolve Gap'}</span>
                </>
              )}
            </button>

            {/* Notification Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifPopoverOpen(!notifPopoverOpen)}
                className="w-9 h-9 rounded-full bg-[#fbfcff] hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 relative cursor-pointer"
              >
                <Bell size={15} />
                {!isJourneyClosed && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e84343]" />
                )}
              </button>

              {notifPopoverOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-extrabold text-slate-900">
                      Continuity Notifications
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotifPopoverOpen(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-700"
                    >
                      Close
                    </button>
                  </div>
                  {activities.slice(0, 3).map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-xl bg-[#fbfcff] border border-slate-100 text-xs"
                    >
                      <p className="font-bold text-slate-800">{act.title}</p>
                      <p className="text-[11px] text-slate-500">{act.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Patient Avatar & Name */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-extrabold">
                {patient.avatar}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-extrabold text-slate-900 leading-none">
                  {patient.name}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Patient Portal</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* ══════════════════════════════════════════════════════════
                TAB 1: MY JOURNEY (Main Patient Dashboard Screen)
                ══════════════════════════════════════════════════════════ */}
            {activeNav === 'journey' && (
              <>
                {/* Section 2: Patient Greeting Header & Primary/Secondary CTAs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs relative overflow-hidden">
                  {/* Soft decorative wave matching website aesthetic */}
                  <div className="absolute -right-12 -top-12 w-56 h-56 bg-sky-50/70 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-[11px] font-bold mb-2">
                      <span>“See the journey. Find the break. Close the loop.”</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Good morning, {patient.firstName}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Here’s what’s happening in your care journey.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 relative z-10">
                    <button
                      type="button"
                      onClick={() => setAssistantOpen(true)}
                      className="btn-coral-pill text-xs py-2.5 px-5"
                    >
                      <Sparkles size={14} />
                      <span>Ask Care Assistant</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShareModalOpen(true)}
                      className="btn-soft-pill text-xs py-2.5 px-5"
                    >
                      <ShieldCheck size={14} className="text-teal-700" />
                      <span>Share Records</span>
                    </button>
                  </div>
                </div>

                {/* Section 3: Exactly Four Compact Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <ProgressCard
                    label="Journey Progress"
                    value={`${patient.journeyProgress}%`}
                    subtext={`${patient.completedSteps} of ${patient.totalSteps} care steps completed`}
                    icon={GitCommit}
                    accent={isJourneyClosed ? 'emerald' : 'teal'}
                  />
                  <ProgressCard
                    label="Pending Actions"
                    value={isJourneyClosed ? '0' : '1'}
                    subtext={
                      isJourneyClosed
                        ? 'All care steps verified ✓'
                        : 'Follow-up needs verification'
                    }
                    icon={AlertTriangle}
                    accent={isJourneyClosed ? 'emerald' : 'coral'}
                    onClick={() => setActiveNav('actions')}
                  />
                  <ProgressCard
                    label="My Reports"
                    value={String(reports.length)}
                    subtext="Latest report: HbA1c"
                    icon={FileText}
                    accent="teal"
                    onClick={() => setActiveNav('reports')}
                  />
                  <ProgressCard
                    label="Next Appointment"
                    value="18 OCT"
                    subtext="10:30 AM"
                    icon={Calendar}
                    accent="navy"
                    onClick={() => setActiveNav('appointments')}
                  />
                </div>

                {/* Section 4: HERO FEATURE — MY CARE JOURNEY */}
                <CareJourney
                  events={events}
                  progress={patient.journeyProgress}
                  completedSteps={patient.completedSteps}
                  totalSteps={patient.totalSteps}
                  journeyStatus={patient.journeyStatus}
                  selectedEventId={selectedDrawerEvent?.id}
                  onSelectNode={(ev) => setSelectedDrawerEvent(ev)}
                />

                {/* Section 5: PROMINENT CARE GAP CARD */}
                <CareGapCard
                  gap={gap}
                  isResolved={isJourneyClosed}
                  externalVerification={externalVerification}
                  onOpenVerifyModal={(mode) => {
                    setVerifyModalMode(mode);
                    setVerifyModalOpen(true);
                  }}
                  onOpenWhyDrawer={() => {
                    const followUpEvt = events.find((e) => e.key === 'FOLLOW_UP');
                    setSelectedDrawerEvent(followUpEvt);
                  }}
                  onResetDemo={handleResetDemo}
                />

                {/* Sections 14 & 15: Expected vs Actual View + Cross-Provider Continuity */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7">
                    <ExpectedVsActualView
                      events={events}
                      onSelectNode={(ev) => setSelectedDrawerEvent(ev)}
                    />
                  </div>
                  <div className="lg:col-span-5">
                    <CrossProviderContinuity
                      events={events}
                      externalVerification={externalVerification}
                      onOpenShareModal={() => setActiveNav('shared')}
                    />
                  </div>
                </div>

                {/* Sections 8, 9, 10, 11: Reports, Upcoming Appointment, Shared Records, Recent Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                  {/* Section 8: My Reports */}
                  <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-extrabold text-slate-900">
                          My Reports
                        </h3>
                        <button
                          type="button"
                          onClick={() => setActiveNav('reports')}
                          className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                        >
                          See all ({reports.length})
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">
                        Document availability and care workflow linkage
                      </p>

                      <div className="space-y-2.5">
                        {reports.map((rep) => (
                          <ReportCard
                            key={rep.id}
                            report={rep}
                            onViewReport={(r) => setViewingReport(r)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 9: Upcoming Appointment + Section 11: Recent Activity */}
                  <div className="lg:col-span-4 space-y-6">
                    <AppointmentCard
                      appointment={appointments[0]}
                      onToggleReminder={handleToggleReminder}
                      onViewDetails={(apt) => setViewingAppointment(apt)}
                    />
                    <ActivityTimeline activities={activities} />
                  </div>

                  {/* Section 10: Shared Records */}
                  <div className="lg:col-span-4">
                    <RecordSharing
                      sharedRecords={sharedRecords}
                      onManageAccess={() => setActiveNav('shared')}
                      onShareRecord={() => setShareModalOpen(true)}
                      onToggleAccess={handleToggleSharedAccess}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 2: MY ACTIONS (Section 16: All Pending Tasks & Actions)
                ══════════════════════════════════════════════════════════ */}
            {activeNav === 'actions' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">My Actions</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review pending confirmations and record-sharing requests to keep your care journey moving
                    </p>
                  </div>
                  <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    {pendingActionCount} Pending Action{pendingActionCount === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Primary Care Gap Card at top of Actions */}
                <CareGapCard
                  gap={gap}
                  isResolved={isJourneyClosed}
                  externalVerification={externalVerification}
                  onOpenVerifyModal={(mode) => {
                    setVerifyModalMode(mode);
                    setVerifyModalOpen(true);
                  }}
                  onOpenWhyDrawer={() => {
                    const followUpEvt = events.find((e) => e.key === 'FOLLOW_UP');
                    setSelectedDrawerEvent(followUpEvt);
                  }}
                  onResetDemo={handleResetDemo}
                />

                {/* All Action Checklist Cards */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 mb-2">
                    Care Pathway Action Checklist
                  </h3>
                  {actionItems.map((item) => {
                    const done = item.status === 'COMPLETED';
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          done
                            ? 'bg-emerald-50/40 border-emerald-200/80'
                            : 'bg-[#fbfcff] border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5 ${
                              done
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {done ? '✓' : '!'}
                          </span>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                              {item.category}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900">
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-500">{item.subtitle}</p>
                          </div>
                        </div>

                        <div>
                          {item.isPrimaryGap && !done ? (
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyModalMode('COMPLETED');
                                setVerifyModalOpen(true);
                              }}
                              className="btn-coral-sm text-xs"
                            >
                              Verify follow-up
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setActionItems((prev) =>
                                  prev.map((a) =>
                                    a.id === item.id
                                      ? {
                                          ...a,
                                          status:
                                            a.status === 'COMPLETED'
                                              ? 'PENDING'
                                              : 'COMPLETED',
                                        }
                                      : a
                                  )
                                );
                                triggerToast(`Action "${item.title}" updated.`);
                              }}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
                                done
                                  ? 'bg-white text-emerald-700 border-emerald-200'
                                  : 'bg-slate-900 text-white border-slate-900'
                              }`}
                            >
                              {done ? 'Completed ✓' : 'Mark Confirmed'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 3: MY REPORTS (Section 8 & 16: Full Reports Repository)
                ══════════════════════════════════════════════════════════ */}
            {activeNav === 'reports' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">My Reports</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verified documents linked to your care journey steps. CARELOOP displays document availability and workflow linkage only.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newRep = {
                        id: `REP-${Date.now()}`,
                        title: 'External Follow-up Summary',
                        status: 'Available',
                        relativeTime: 'Just uploaded',
                        date: '13 October 2026',
                        provider: 'Patient Uploaded Record',
                        category: 'Visit Summary',
                        workflowStage: 'Follow-up ✓',
                        sharedWith: ['City Care Hospital'],
                        fileName: 'FollowUp_Visit_Summary.pdf',
                        fileSize: '180 KB',
                        summaryNote:
                          'Uploaded directly by patient to verify care continuity.',
                      };
                      setReports((prev) => [newRep, ...prev]);
                      triggerToast('Report uploaded to your personal repository.');
                    }}
                    className="btn-coral-pill text-xs py-2.5 px-5"
                  >
                    <Plus size={14} />
                    <span>Upload External Report</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold">
                            <FileText size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-extrabold text-slate-900">
                                {rep.title}
                              </h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {rep.workflowStage}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {rep.status} · {rep.relativeTime} · {rep.provider}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setViewingReport(rep)}
                          className="btn-soft-pill text-xs py-1.5 px-3.5"
                        >
                          <Eye size={13} />
                          <span>View report</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        {rep.summaryNote}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 4: APPOINTMENTS (Section 9 & 16: Upcoming & Past Visits)
                ══════════════════════════════════════════════════════════ */}
            {activeNav === 'appointments' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
                  <h2 className="text-xl font-extrabold text-slate-900">Appointments</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Scheduled visits and verified historical consultations across your care providers
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className={`bg-white rounded-3xl border p-6 shadow-2xs flex flex-col justify-between ${
                        apt.status === 'UPCOMING'
                          ? 'border-teal-500/60 ring-2 ring-teal-500/10'
                          : 'border-slate-200/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              apt.status === 'UPCOMING'
                                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {apt.status === 'UPCOMING' ? 'Next Appointment' : 'Completed ✓'}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {apt.title}
                          </span>
                        </div>

                        <p className="text-2xl font-extrabold text-slate-900">
                          {apt.date}
                        </p>
                        <p className="text-sm font-bold text-teal-700 mb-4">{apt.time}</p>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                          <p className="font-extrabold text-slate-900">{apt.doctor}</p>
                          <p className="text-slate-600 font-medium">{apt.provider}</p>
                          <p className="text-[11px] text-slate-500 pt-1">“{apt.note}”</p>
                        </div>
                      </div>

                      {apt.status === 'UPCOMING' && (
                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setViewingAppointment(apt)}
                            className="btn-soft-pill text-xs py-2 justify-center"
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleReminder(apt.id)}
                            className="rounded-full text-xs font-bold py-2 px-3 bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                          >
                            {apt.reminderSet ? 'Reminder set ✓' : 'Add reminder'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 5: SHARED RECORDS (Section 10 & 16: Patient Privacy & Audit)
                ══════════════════════════════════════════════════════════ */}
            {activeNav === 'shared' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 mb-1.5">
                      <Lock size={11} />
                      <span>Patient-Controlled Authorization</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Your shared records
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      “You control which records are shared with another care provider.”
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShareModalOpen(true)}
                    className="btn-coral-pill text-xs py-2.5 px-5"
                  >
                    <ShieldCheck size={14} />
                    <span>Share a record</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-4">
                    {sharedRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900">
                              {rec.provider}
                            </h3>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                rec.active
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {rec.active ? 'Authorized ✓' : 'Access Paused'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-teal-800">
                            Scope: {rec.records}
                          </p>
                          <p className="text-[11px] text-slate-400">{rec.lastAccessed}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSharedAccess(rec.id)}
                          className="btn-soft-pill text-xs py-2 px-4 self-start sm:self-center"
                        >
                          {rec.active ? 'Revoke authorization' : 'Authorize access'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Privacy & Access Audit Trail */}
                  <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Access & Privacy Audit Log
                    </h3>
                    <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs space-y-1">
                      <p className="font-bold text-teal-950">Last accessed:</p>
                      <p className="font-extrabold text-teal-800 text-sm">
                        Specialist Clinic · Today · 10:42 AM
                      </p>
                      <p className="text-[11px] text-teal-700 pt-1">
                        Verified against your active consent token (#AUTH-RS-1001).
                      </p>
                    </div>
                    <div className="space-y-2.5 text-xs text-slate-600">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                        <span>Specialist Clinic viewed Specialist Report</span>
                        <span className="font-bold text-slate-800">Today · 10:42 AM</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                        <span>City Care Hospital uploaded HbA1c</span>
                        <span className="font-bold text-slate-800">2 days ago</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                        <span>You authorized Referral Sharing</span>
                        <span className="font-bold text-slate-800">5 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 6: CARE ASSISTANT (Section 12 & 16: Full-Screen AI Assistant)
                ══════════════════════════════════════════════════════════ */}
            {activeNav === 'assistant' && (
              <div className="space-y-4">
                <CareAssistant
                  isOpen={true}
                  isFullScreen={true}
                  isJourneyClosed={isJourneyClosed}
                  onClose={() => {}}
                />
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 7: HELP & SUPPORT
                ══════════════════════════════════════════════════════════ */}
            {activeNav === 'help' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900">Help & Support</h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  CARELOOP helps you track every expected step in your care journey across providers. If a step shows as Unverified, it simply means CARELOOP has not yet received confirmation—never that you missed your care.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#fbfcff] border border-slate-200">
                    <h4 className="text-xs font-extrabold text-slate-900 mb-1">
                      Care Continuity Desk
                    </h4>
                    <p className="text-xs text-slate-500">
                      Available Mon–Sat · 8:00 AM to 8:00 PM
                    </p>
                    <p className="text-xs font-bold text-teal-700 mt-2 flex items-center gap-1.5">
                      <Phone size={12} /> +91 1800-CARELOOP
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#fbfcff] border border-slate-200">
                    <h4 className="text-xs font-extrabold text-slate-900 mb-1">
                      Privacy & Data Officer
                    </h4>
                    <p className="text-xs text-slate-500">
                      Questions about cross-provider record authorization
                    </p>
                    <p className="text-xs font-bold text-teal-700 mt-2 flex items-center gap-1.5">
                      <Mail size={12} /> privacy@careloop.health
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB 8: SETTINGS
                ══════════════════════════════════════════════════════════ */}
            {activeNav === 'settings' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-5 max-w-3xl">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Patient Profile & Continuity Preferences
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Patient Name
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {patient.name}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Care Pathway
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {patient.carePlan}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Primary Hospital
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {patient.primaryProvider}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Referred Specialist
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {patient.specialistProvider}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 22: Subtle Safety / Legal Note Footer */}
            <footer className="pt-4 pb-8 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-teal-600 flex-shrink-0" />
                <span>
                  “CARELOOP supports care coordination and workflow visibility. It does not diagnose conditions or replace clinical judgment.”
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                CARELOOP Care Continuity Intelligence
              </span>
            </footer>
          </div>
        </main>
      </div>

      {/* ──────────────────────────────────────────────────────────
          FLOATING AI CARE ASSISTANT BUTTON (Section 12)
          ────────────────────────────────────────────────────────── */}
      {activeNav !== 'assistant' && !assistantOpen && (
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-40 btn-coral-pill py-3 px-5 text-xs shadow-lg flex items-center gap-2"
        >
          <Sparkles size={15} />
          <span>Care Assistant</span>
        </button>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODALS & DRAWERS (Sections 6, 7, 8, 9, 10, 12, 13)
          ────────────────────────────────────────────────────────── */}
      {/* Section 13: Care Journey Details Drawer */}
      <EvidenceDrawer
        isOpen={!!selectedDrawerEvent}
        selectedEvent={selectedDrawerEvent}
        gap={gap}
        onClose={() => setSelectedDrawerEvent(null)}
        onVerifyClick={(mode) => {
          setVerifyModalMode(mode);
          setVerifyModalOpen(true);
        }}
        onMarkUnknown={handleConfirmUnsure}
        onContactCareTeam={() =>
          triggerToast('Message sent to your City Care Hospital coordination team.')
        }
      />

      {/* Sections 6 & 7: Verify Follow-up & Completed Elsewhere Modal */}
      <VerificationModal
        isOpen={verifyModalOpen}
        initialMode={verifyModalMode}
        onClose={() => setVerifyModalOpen(false)}
        onConfirmCompleted={handleConfirmCompleted}
        onConfirmElsewhere={handleConfirmElsewhere}
        onConfirmUnsure={handleConfirmUnsure}
      />

      {/* Section 12: Right-Side Care Assistant Panel */}
      <CareAssistant
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        isFullScreen={false}
        isJourneyClosed={isJourneyClosed}
      />

      {/* Section 8: Report Availability Modal (No medical interpretation!) */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[2px]">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  {viewingReport.category}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  {viewingReport.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewingReport.status} · {viewingReport.relativeTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingReport(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2.5 bg-[#fbfcff] p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Issuing Provider</span>
                <span className="font-bold text-slate-900">{viewingReport.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded Date</span>
                <span className="font-bold text-slate-900">{viewingReport.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Care Journey Step</span>
                <span className="font-bold text-emerald-700">
                  {viewingReport.workflowStage}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Reference</span>
                <span className="font-mono text-slate-700">{viewingReport.fileName}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {viewingReport.summaryNote}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewingReport(null)}
                className="btn-soft-pill text-xs py-2 px-5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section 9: Appointment Details Modal */}
      {viewingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[2px]">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Appointment Details
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  {viewingAppointment.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingAppointment(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2.5 bg-[#fbfcff] p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time</span>
                <span className="font-extrabold text-slate-900">
                  {viewingAppointment.date} · {viewingAppointment.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clinician</span>
                <span className="font-bold text-slate-900">
                  {viewingAppointment.doctor}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hospital / Clinic</span>
                <span className="font-bold text-slate-900">
                  {viewingAppointment.provider}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location</span>
                <span className="font-semibold text-slate-700">
                  {viewingAppointment.location}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs font-semibold text-teal-900">
              Note: “{viewingAppointment.note}”
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewingAppointment(null)}
                className="btn-soft-pill text-xs py-2 px-5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section 10: Share a Record Modal (Patient-Controlled Consent) */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[2px]">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Patient-Controlled Sharing
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Share a record
                </h3>
                <p className="text-xs text-slate-500">
                  “You control which records are shared with another care provider.”
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddSharedRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Receiving Care Provider *
                </label>
                <input
                  type="text"
                  required
                  value={newShareProvider}
                  onChange={(e) => setNewShareProvider(e.target.value)}
                  placeholder="e.g. Metro Endocrinology Center"
                  className="w-full bg-[#fbfcff] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Records to Share
                </label>
                <select
                  value={newShareScope}
                  onChange={(e) => setNewShareScope(e.target.value)}
                  className="w-full bg-[#fbfcff] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600"
                >
                  <option>Selected reports (HbA1c, Specialist Report)</option>
                  <option>Care records (Full diabetes pathway)</option>
                  <option>Diagnostic lab reports only</option>
                </select>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-teal-50/60 border border-teal-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newShareConsent}
                  onChange={(e) => setNewShareConsent(e.target.checked)}
                  className="mt-0.5 accent-teal-600"
                  required
                />
                <span className="text-xs text-slate-800 font-semibold leading-snug">
                  I explicitly authorize CARELOOP to share the selected records with this provider to support my care continuity.
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="btn-soft-pill text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-coral-pill text-xs py-2 px-5"
                >
                  Authorize & Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-full shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold animate-in">
          <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
