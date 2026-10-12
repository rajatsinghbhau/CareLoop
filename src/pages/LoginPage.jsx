// CARELOOP - Login Page styled with Care Continuity Map preview
import React, { useState } from 'react';
import { Activity, Eye, EyeOff, Shield, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp, DEMO_USERS } from '../context/AppContext';

export function LoginPage() {
  const { login } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
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
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      {/* Left panel - The 10-Second Judge Hook */}
      <div className="lg:w-7/12 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-8 lg:p-12 flex flex-col justify-between">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 font-black flex items-center justify-center text-base shadow-xs">
              CL
            </div>
            <div>
              <p className="text-white font-bold text-lg tracking-tight">CARELOOP</p>
              <p className="text-teal-400 text-[11px] font-semibold tracking-wider uppercase">Care Continuity Intelligence</p>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
            See the journey. Find the break.<br />
            <span className="text-teal-400">Close the loop.</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mb-8">
            The core healthcare problem isn’t missed appointments. It’s patients attending visits while their clinical continuity breaks silently across providers.
          </p>

          {/* Signature Preview: Care Continuity Map Preview */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 mb-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">Rahul Sharma</span>
                <span className="text-xs text-slate-400 ml-2">Type 2 Diabetes Pathway</span>
              </div>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded border border-rose-500/30 animate-pulse">
                ⚠ CARE NOT CLOSED
              </span>
            </div>

            {/* Swimlanes Visual Preview */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">HOSPITAL A</span>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✓</span> Consultation</div>
                  <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✓</span> Diagnostic Panel</div>
                  <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✓</span> Lab Result (HbA1c 9.4%)</div>
                  <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✓</span> Doctor Review</div>
                  <div className="flex items-center gap-1.5 text-teal-400 font-semibold"><span className="text-emerald-400 font-bold">✓</span> Referral Transfer →</div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-rose-950/50">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-2">HOSPITAL B</span>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✓</span> Specialist Consultation</div>
                  <div className="flex items-center gap-1.5 font-bold text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                    Follow-up (BREAK DETECTED)
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">○ Care Closed</div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-teal-400 font-medium">CARELOOP FOUND THE BREAK: Step 8 of 9</span>
              <span className="text-slate-500">Confidence: 94%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Shield size={13} className="text-teal-500" />
          <span>Non-diagnostic care-continuity intelligence for college hackathon demonstration.</span>
        </div>
      </div>

      {/* Right panel - Demo Sign-in */}
      <div className="lg:w-5/12 p-8 lg:p-12 flex flex-col justify-center bg-slate-950">
        <div className="max-w-sm mx-auto w-full">
          <h2 className="text-xl font-bold text-white mb-1">Enter Prototype</h2>
          <p className="text-xs text-slate-400 mb-6">Select a pre-configured persona or sign in below</p>

          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg px-3 py-2.5 mb-4 text-xs">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Quick Demo Persona Launchers */}
          <div className="space-y-2 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              One-Click Role Launch
            </span>
            {DEMO_USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className="w-full text-left p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{u.name}</p>
                  <p className="text-[10px] text-teal-400 capitalize">{u.role.toLowerCase().replace('_', ' ')}</p>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  Launch <ArrowRight size={12} />
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 pr-9 text-xs focus:outline-none focus:border-teal-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-xs font-bold tracking-wide mt-2"
            >
              {loading ? 'Opening Care Continuity Map...' : 'Launch CARELOOP Map'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
