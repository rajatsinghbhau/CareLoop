// CARELOOP - Signature Landing & Public Continuity Showcase
// Inspired directly by the user's reference design:
// Fresh, friendly, ultra-smooth healthcare landing (English):
// - Curved organic hero blob with healthcare clinician
// - Bright coral pill CTA buttons ("Explore How It Works" / "Launch Map")
// - 3 Organic Blob feature columns
// - Two-column organic photo layout with floating check-list cards
// - Interactive filter pill bar ("All", "Diabetes", "Cardiology", "Oncology")
// - "How does it work? It's simple!" 3 coral numbered steps
// - Interactive live Care Continuity Map embedded preview

import React, { useState } from 'react';
import {
  HeartHandshake, Activity, ShieldCheck, CheckCircle2, ArrowRight,
  GitCommit, Building2, UserCheck, Stethoscope, AlertCircle, Play,
  Calendar, Check, ChevronRight, Sparkles, Layers, Cpu, ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function HomePage({ onExploreApp, onSelectPatient }) {
  const { patients } = useApp();
  const [activeTab, setActiveTab] = useState('ALL');

  return (
    <div className="min-h-screen bg-[#fbfcff] text-slate-800 overflow-x-hidden selection:bg-rose-100 selection:text-rose-900 font-sans">
      
      {/* ──────────────────────────────────────────────────────────
          1. NAVIGATION BAR (Clean white, soft coral brand pill, minimal links)
          ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo with PetHelp style icon badge */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onExploreApp('landing')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e84343] to-[#ff6b6b] text-white flex items-center justify-center font-black shadow-md shadow-rose-200">
              <Activity size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">CARE<span className="text-[#e84343]">LOOP</span></span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-0.5">Care Continuity Platform</p>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-[#e84343] transition-colors">How It Works</a>
            <a href="#continuity-map" className="hover:text-[#e84343] transition-colors">Continuity Map™</a>
            <a href="#pathways" className="hover:text-[#e84343] transition-colors">Care Pathways</a>
            <a href="#benefits" className="hover:text-[#e84343] transition-colors">For Hospitals & Clinics</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onExploreApp('map')}
              className="btn-coral-sm text-xs"
            >
              <span>Launch Map</span>
              <ArrowRight size={13} />
            </button>
            <button
              onClick={() => onExploreApp('dashboard')}
              className="btn-soft-pill text-xs py-2 px-4 hidden sm:inline-flex"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </header>


      {/* ──────────────────────────────────────────────────────────
          2. HERO SECTION (Organic curved blob + doctor/patient artwork)
          ────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        {/* Soft pastel-blue background wave */}
        <div className="absolute top-0 right-0 w-[55vw] h-[85vh] bg-gradient-to-bl from-sky-100/70 via-sky-50/40 to-transparent rounded-bl-[120px] -z-10" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-50/60 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-[#e84343]">
              <Sparkles size={14} />
              <span>Closing the Gap Between Appointments and Care</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Clinical continuity <br className="hidden sm:inline" />
              designed for <br />
              <span className="text-[#e84343]">your patients</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
              The core problem is not missed appointments. Patients attend visits, but their treatment plan breaks silently between hospitals and specialists. <strong>CARELOOP</strong> automatically detects and repairs broken care loops.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onExploreApp('map')}
                className="btn-coral-pill"
              >
                <span>Explore How It Works</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => onExploreApp('demo')}
                className="btn-soft-pill py-3 px-6 text-sm"
              >
                <Play size={14} className="text-[#e84343] fill-[#e84343]" />
                <span>Demo Simulation</span>
              </button>
            </div>

            {/* Metric counters */}
            <div className="pt-6 border-t border-slate-200/80 flex items-center gap-8 text-xs text-slate-500 font-medium">
              <div>
                <strong className="text-slate-900 font-extrabold text-base block font-mono">100%</strong>
                <span>Deterministic Rule Engine</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <strong className="text-slate-900 font-extrabold text-base block font-mono">94%</strong>
                <span>Average Gap Confidence</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <strong className="text-slate-900 font-extrabold text-base block font-mono">2 Facilities</strong>
                <span>Seamless Inter-Hospital Handoff</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Organic Blob & Live Break Card */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-lg aspect-[4/4.5] flex items-center justify-center">
              
              {/* Outer pastel blob */}
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-200/50 via-sky-100/40 to-rose-100/40 organic-shape-1 shadow-lg transform -rotate-3 scale-105" />

              {/* Main photo container with smooth organic curve */}
              <div className="relative w-full h-full overflow-hidden organic-shape-2 border-4 border-white shadow-xl bg-gradient-to-b from-sky-50 to-white flex flex-col justify-between p-8">
                
                {/* Header status */}
                <div className="flex items-center justify-between z-10">
                  <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm text-xs font-bold text-slate-800 flex items-center gap-2 border border-slate-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Real-time Care Gap Detection</span>
                  </div>
                  <span className="bg-[#e84343] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xs">
                    STEP 8/9
                  </span>
                </div>

                {/* Floating Card: Care Continuity Break */}
                <div className="my-auto bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-slate-200/90 shadow-lg space-y-3 z-10 transform hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-[#e84343] flex items-center justify-center font-bold text-sm">
                        !
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">Rahul Sharma (Age 52)</p>
                        <p className="text-[11px] text-slate-500">Type 2 Diabetes • Hospital A → B Pathway</p>
                      </div>
                    </div>
                    <span className="badge-clean-coral text-[10px]">
                      BREAK: FOLLOW-UP
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>1. Initial Consultation</span>
                      <strong className="text-emerald-700">✓ Verified</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>2. Diagnostic Panel (HbA1c 9.4%)</span>
                      <strong className="text-emerald-700">✓ Verified</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>3. Referral to Hospital B Specialist</span>
                      <strong className="text-emerald-700">✓ Verified</strong>
                    </div>
                    <div className="flex items-center justify-between text-rose-800 font-bold bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                      <span>4. Specialist Follow-up Visit</span>
                      <span>⚠ MISSING (10 Days Overdue)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 font-medium">Engine Confidence: <strong>94%</strong></span>
                    <button
                      onClick={() => onExploreApp('map')}
                      className="text-xs font-bold text-[#e84343] hover:underline flex items-center gap-1"
                    >
                      Inspect Evidence <ChevronRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Bottom verified badge */}
                <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-100 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-sky-600" />
                    <span className="text-xs font-semibold text-slate-700">Metro General → Apollo Specialty</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                    Token #AUTH-7821
                  </span>
                </div>
              </div>

              {/* Floating decorative badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3 z-20 hidden sm:flex">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Loop Closed</p>
                  <p className="text-[11px] text-slate-500">100% required milestones met</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ──────────────────────────────────────────────────────────
          3. 3-COLUMN ORGANIC BLOB SECTION (Reference: 3 organic feature columns)
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Care Continuity Intelligence
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Dedicated workflow tracking protocols for chronic illnesses, cardiac rehabilitation, and post-surgical monitoring.
            </p>
          </div>

          {/* 3 Columns with Organic Curved Blob Illustrations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center space-y-5 group">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <div className="absolute inset-0 bg-sky-100/70 organic-shape-1 group-hover:scale-105 transition-transform duration-300 shadow-sm" />
                <div className="relative z-10 w-24 h-24 bg-white organic-shape-2 shadow-md flex items-center justify-center text-sky-600">
                  <GitCommit size={38} className="stroke-[2.2]" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Care Continuity Map™</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs">
                A visual multi-facility workflow graph tracking the journey from consultation, lab order, and specialist transfer to care closure.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center space-y-5 group">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <div className="absolute inset-0 bg-rose-100/70 organic-shape-2 group-hover:scale-105 transition-transform duration-300 shadow-sm" />
                <div className="relative z-10 w-24 h-24 bg-white organic-shape-3 shadow-md flex items-center justify-center text-[#e84343]">
                  <AlertCircle size={38} className="stroke-[2.2]" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Broken Link Detection</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs">
                Deterministic clinical rules detect unreviewed test results, pending specialist handoffs, and overdue follow-up check-ins.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center space-y-5 group">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-100/70 organic-shape-3 group-hover:scale-105 transition-transform duration-300 shadow-sm" />
                <div className="relative z-10 w-24 h-24 bg-white organic-shape-1 shadow-md flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={38} className="stroke-[2.2]" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Care Loop Closure</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs">
                Staff coordinators verify that vital clinical actions were completed, transitioning the score to 100% Care Closed.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ──────────────────────────────────────────────────────────
          4. TWO-COLUMN SPLIT WITH FLOATING CHECKLIST CARDS (Reference: Section 3)
          ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-white via-sky-50/40 to-white relative overflow-hidden" id="benefits">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Visual: Organic curve card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/4.5]">
              <div className="absolute inset-0 bg-sky-200/40 organic-shape-2 shadow-lg -rotate-6" />
              <div className="relative w-full h-full organic-shape-1 overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-sky-100 to-white flex flex-col justify-center items-center p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center text-[#e84343] mb-4">
                  <HeartHandshake size={40} />
                </div>
                <h4 className="text-xl font-extrabold text-slate-900 mb-2">Doctor + Coordinator</h4>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Shared collaborative workspace with deterministic role permissions and automated task dispatch.
                </p>
                <div className="bg-white/95 rounded-2xl px-4 py-2 border border-slate-100 shadow-sm text-xs font-semibold text-slate-700">
                  ✓ Patient Safety Above All
                </div>
              </div>
            </div>
          </div>

          {/* Right Cards: 2x2 Grid with Coral Icon Badges (like PetHelp) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              CARELOOP is complete protection against lost-to-follow-up care. <br />
              <span className="text-[#e84343]">What you gain:</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* Card 1 */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#e84343] flex items-center justify-center shrink-0 border border-rose-100">
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Inter-Facility Handoffs</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Automated patient consent verification and digital transition tokens across health systems.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#e84343] flex items-center justify-center shrink-0 border border-rose-100">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Care Closure Score</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time completion percentage tracking whether mandatory clinical steps are finished.</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#e84343] flex items-center justify-center shrink-0 border border-rose-100">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Explainable Evidence (Why?)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Transparent checklist explaining why each care gap was flagged with verifiable EHR timestamps.</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#e84343] flex items-center justify-center shrink-0 border border-rose-100">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Staff Verification Principle</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Safety by design: CARELOOP identifies workflow gaps; it never issues autonomous clinical diagnoses.</p>
                </div>
              </div>

            </div>

            <div className="pt-2">
              <button
                onClick={() => onExploreApp('patients')}
                className="btn-coral-pill"
              >
                <span>View Patient Register</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

        </div>
      </section>


      {/* ──────────────────────────────────────────────────────────
          5. FILTER TABS & INTERACTIVE PATHWAY CARDS
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white" id="pathways">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Clinical Care Pathways
            </h2>
            <p className="text-sm text-slate-500">
              Explore active patient journeys organized by clinical specialty:
            </p>

            {/* Filter Pill Tabs */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
              {[
                { id: 'ALL', label: 'All Pathways' },
                { id: 'DIABETES', label: 'Diabetes & Nephrology' },
                { id: 'CARDIO', label: 'Cardiology' },
                { id: 'ONCOLOGY', label: 'Oncology Surveillance' },
                { id: 'PULMONARY', label: 'Pulmonology' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`filter-pill ${activeTab === tab.id ? 'filter-pill-active' : 'filter-pill-inactive'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pathway Patient Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {patients.slice(0, 3).map((p) => {
              const isGap = p.careStatus === 'GAP_DETECTED';
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPatient(p.id)}
                  className="clean-pill-card hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-semibold text-slate-400">{p.id}</span>
                      {isGap ? (
                        <span className="badge-clean-coral">
                          ⚠ CARE GAP DETECTED
                        </span>
                      ) : (
                        <span className="badge-clean-emerald">
                          ✓ IN PROGRESS
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{p.age} years • {p.gender}</p>

                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Condition</p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{p.condition}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#e84343]">
                    <span>Open Continuity Map</span>
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ──────────────────────────────────────────────────────────
          6. "HOW DOES IT WORK? IT'S SIMPLE!" 3 CORAL BLOB STEPS
          ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-white via-sky-50/30 to-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How does it work? It's simple!
            </h2>
            <p className="text-sm text-slate-500">
              Three essential steps to eliminating care gaps and protecting vulnerable patients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-tr from-[#e84343] to-[#ff6b6b] organic-shape-1 flex items-center justify-center text-white shadow-lg shadow-rose-200">
                <span className="text-3xl font-black font-mono">1</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Ingest Clinical Events</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
                Connects appointments, lab orders, test receipts, and specialist referrals across Hospital A and Hospital B.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-tr from-[#e84343] to-[#ff6b6b] organic-shape-2 flex items-center justify-center text-white shadow-lg shadow-rose-200">
                <span className="text-3xl font-black font-mono">2</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Detect the Broken Link</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
                Rule engine tracks mandatory dependencies: if a downstream action is delayed or missing, it alerts the care team.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-tr from-[#e84343] to-[#ff6b6b] organic-shape-3 flex items-center justify-center text-white shadow-lg shadow-rose-200">
                <span className="text-3xl font-black font-mono">3</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Close the Loop (100%)</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
                Coordinators complete outreach, physicians review diagnostics, and the care loop formally settles into closed status.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ──────────────────────────────────────────────────────────
          7. BOTTOM CALL TO ACTION FOR JUDGES
          ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-3xl bg-gradient-to-r from-sky-50 via-white to-rose-50 border border-slate-100 p-8 sm:p-14 shadow-lg overflow-hidden">
            
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-rose-100/40 organic-shape-1 -z-0" />

            <div className="relative z-10 max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-2xs border border-slate-100">
                <Sparkles size={14} className="text-[#e84343]" />
                <span>Hackathon Live Prototype</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Experience CARELOOP in full live action
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Interact with the full scenario using synthetic data for patient <strong>Rahul Sharma</strong>, cross-facility break detection at Hospital B, and real-time loop closure.
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onExploreApp('map')}
                  className="btn-coral-pill"
                >
                  <span>Launch Continuity Map™</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => onExploreApp('dashboard')}
                  className="btn-soft-pill py-3 px-6 text-sm"
                >
                  <span>Analytics Dashboard</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ──────────────────────────────────────────────────────────
          8. CLEAN FOOTER
          ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-[#fbfcff] py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#e84343] text-white flex items-center justify-center font-bold text-xs">
              CL
            </div>
            <span className="font-extrabold text-slate-900 text-sm">CARELOOP</span>
            <span className="text-slate-400">© 2026 Healthcare Continuity Platform</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-600">
            <button onClick={() => onExploreApp('map')} className="hover:text-[#e84343]">Continuity Map</button>
            <button onClick={() => onExploreApp('patients')} className="hover:text-[#e84343]">Patients</button>
            <button onClick={() => onExploreApp('analytics')} className="hover:text-[#e84343]">Analytics</button>
            <button onClick={() => onExploreApp('demo')} className="hover:text-[#e84343]">Demo</button>
          </div>

          <div className="text-[11px] text-slate-400">
            College Hackathon Prototype. Synthetic demo data only.
          </div>
        </div>
      </footer>

    </div>
  );
}
