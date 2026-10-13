// CARELOOP - Login & Welcome Portal
// Restyled to match the clean, bright, friendly PetHelp aesthetic:
// Pure bone white (#fbfcff), pastel sky-blue organic waves, coral pill buttons, and friendly cards.

import React, { useState } from 'react';
import { Activity, Eye, EyeOff, Shield, AlertCircle, ArrowRight, CheckCircle2, Building2, Sparkles, UserCheck } from 'lucide-react';
import { useApp, DEMO_USERS } from '../context/AppContext';

export function LoginPage() {
  const { login } = useApp();
  const [username, setUsername] = useState('patient');
  const [password, setPassword] = useState('patient123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        setError('Invalid credentials. Try the demo accounts below.');
      }
      setLoading(false);
    }, 400);
  };

  const handleQuickLogin = (user) => {
    setUsername(user.username);
    setPassword(user.password);
    setLoading(true);
    setError('');
    setTimeout(() => {
      login(user.username, user.password);
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#fbfcff] text-slate-800 flex flex-col lg:flex-row relative overflow-hidden font-sans">
      
      {/* Decorative soft pastel waves and organic curves */}
      <div className="absolute top-0 left-0 w-[50vw] h-[80vh] bg-gradient-to-br from-sky-100/60 via-sky-50/40 to-transparent rounded-br-[140px] -z-10" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-50/60 rounded-full blur-3xl -z-10" />

      {/* ──────────────────────────────────────────────────────────
          LEFT PANEL: Showcase with Organic Blob & Live Break Preview
          ────────────────────────────────────────────────────────── */}
      <div className="lg:w-7/12 p-8 lg:p-14 flex flex-col justify-between relative">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
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

          {/* Heading */}
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-[#e84343] mb-4">
            <Sparkles size={14} />
            <span>Healthcare Care-Closure Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
            See the journey. <br />
            Find the break. <br />
            <span className="text-[#e84343]">Close the care loop.</span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mb-8">
            The core healthcare challenge is not missed appointments. Patients attend visits, but their treatment plan breaks silently between hospitals and specialists.
          </p>

          {/* Interactive Live Break Card (Clean white with subtle shadow) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md max-w-xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-[#e84343] flex items-center justify-center font-bold text-xs">
                  !
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Rahul Sharma (Age 52)</h4>
                  <p className="text-[11px] text-slate-500">Type 2 Diabetes • Multi-Facility Pathway</p>
                </div>
              </div>
              <span className="badge-clean-coral text-[10px]">
                ⚠ CARE NOT CLOSED
              </span>
            </div>

            {/* Swimlanes preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">HOSPITAL A (Primary)</span>
                <div className="text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Consultation</div>
                  <div className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Lab Panel (HbA1c 9.4%)</div>
                  <div className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Doctor Review</div>
                  <div className="flex items-center gap-1.5 text-sky-700 font-semibold"><span className="text-emerald-600 font-bold">✓</span> Specialist Referral →</div>
                </div>
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-rose-100 space-y-1.5">
                <span className="text-[10px] font-bold text-[#e84343] uppercase tracking-wider block mb-1">HOSPITAL B (Specialist)</span>
                <div className="text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Specialist Visit</div>
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 bg-rose-100/70 p-1 rounded-md text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-[#e84343] animate-ping inline-block" />
                    Follow-up (10d Overdue)
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">○ Care Closed</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">CARELOOP Found The Break: <strong className="text-[#e84343]">Step 8 of 9</strong></span>
              <span className="bg-emerald-50 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-200">
                Confidence: 94%
              </span>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-8 flex items-center gap-2 text-xs text-slate-400">
          <Shield size={14} className="text-[#e84343]" />
          <span>Non-diagnostic workflow continuity engine for healthcare hackathon demonstration.</span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          RIGHT PANEL: Clean White Sign-in & One-Click Role Launch
          ────────────────────────────────────────────────────────── */}
      <div className="lg:w-5/12 p-8 lg:p-14 flex flex-col justify-center bg-white border-t lg:border-t-0 lg:border-l border-slate-100 shadow-sm relative">
        <div className="max-w-md mx-auto w-full space-y-6">
          
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to CARELOOP</h2>
            <p className="text-xs text-slate-500 mt-1">Select a one-click demo persona or enter credentials</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-xs font-semibold">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Persona Launchers (Pill styled like reference cards) */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              One-Click Role Launch
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group shadow-2xs ${
                    u.role === 'PATIENT'
                      ? 'border-teal-300 bg-teal-50/40 hover:bg-teal-50/80'
                      : 'border-slate-100 bg-[#fbfcff] hover:bg-rose-50/50 hover:border-rose-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-colors ${
                        u.role === 'PATIENT'
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white border-slate-200 text-slate-700 group-hover:bg-[#e84343] group-hover:text-white group-hover:border-[#e84343]'
                      }`}
                    >
                      {u.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">{u.name}</p>
                        {u.role === 'PATIENT' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                            Patient Dashboard
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 capitalize">
                        {u.role === 'PATIENT'
                          ? 'Personal Care Continuity Portal'
                          : u.role.toLowerCase().replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#e84343] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Launch <ArrowRight size={13} />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Regular Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#fbfcff] border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#e84343] transition-colors font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#fbfcff] border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 pr-10 text-xs focus:outline-none focus:border-[#e84343] transition-colors font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-coral-pill py-3 text-xs font-bold tracking-wide mt-2"
            >
              {loading ? 'Launching Care Continuity...' : 'Enter CARELOOP'}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
