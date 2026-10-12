// CARELOOP - Navigation Sidebar & Top Bar
import React, { useState } from 'react';
import {
  Globe, GitCommit, Users, AlertCircle, ClipboardList,
  BarChart3, Upload, Play, Settings, LogOut, ChevronLeft,
  ChevronRight, Shield, Activity, Hospital, Cpu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { id: 'landing', label: 'Home Portal', icon: Globe, badge: 'PORTAL' },
  { id: 'map', label: 'Continuity Map', icon: GitCommit, badge: 'SIGNATURE' },
  { id: 'patients', label: 'Patient Register', icon: Users },
  { id: 'gaps', label: 'Care Gaps', icon: AlertCircle },
  { id: 'tasks', label: 'Action Center', icon: ClipboardList },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'demo', label: 'Demo Simulation', icon: Play },
  { id: 'import', label: 'CSV Ingestion', icon: Upload },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate }) {
  const { user, logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col bg-white border-r border-slate-200/90 h-screen sticky top-0 transition-all duration-200 z-20 shadow-2xs ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#e84343] to-[#ff6b6b] flex items-center justify-center flex-shrink-0 text-white font-black shadow-md shadow-rose-200">
          <Activity size={18} className="stroke-[2.5]" />
        </div>
        {!collapsed && (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-900 font-extrabold text-base tracking-tight">CARE<span className="text-[#e84343]">LOOP</span></span>
              <span className="text-[9px] bg-rose-50 text-[#e84343] font-bold px-1.5 py-0.2 rounded-full border border-rose-200">
                PRO
              </span>
            </div>
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Care Continuity</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-rose-50 text-[#e84343] font-bold shadow-2xs border border-rose-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <Icon size={16} className={`flex-shrink-0 ${active ? 'text-[#e84343]' : 'text-slate-400'}`} />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      active ? 'bg-[#e84343] text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & collapse */}
      <div className="border-t border-slate-100 p-3 bg-slate-50/50">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 mb-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-[#e84343] flex items-center justify-center font-bold text-xs border border-rose-200">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] text-[#e84343] capitalize font-medium">{user.role?.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          {!collapsed && (
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 hover:text-[#e84343] transition-colors font-medium rounded-xl hover:bg-white"
            >
              <LogOut size={13} />
              <span>Log out</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export function TopBar({ title, subtitle, actions }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-white sticky top-0 z-10 shadow-2xs">
      <div>
        <h1 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.2">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </header>
  );
}

export function NotificationToast() {
  const { notification } = useApp();
  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-slate-800 px-5 py-3.5 rounded-2xl shadow-xl text-xs flex items-center gap-2.5 animate-in">
      <div className="w-2 h-2 rounded-full bg-[#e84343] animate-ping" />
      <span className="font-semibold">{notification.message}</span>
    </div>
  );
}
