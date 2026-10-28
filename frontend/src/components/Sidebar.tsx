import React from 'react';
import { LayoutDashboard, Repeat, Flame, ShieldCheck, FileKey, Network, Activity, Shield } from 'lucide-react';
import { UserRole } from '../types';

export type TabType = 'dashboard' | 'orchestrator' | 'red_team' | 'blue_team' | 'audit' | 'policies' | 'side_channel';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orchestrator', label: 'Continuous Loop', icon: Repeat },
    { id: 'red_team', label: 'Red-Team Lab', icon: Flame },
    { id: 'blue_team', label: 'Blue-Team Defense', icon: ShieldCheck },
    { id: 'policies', label: 'Zero-Trust & OPA', icon: Network },
    { id: 'side_channel', label: 'Side-Channel Telemetry', icon: Activity },
    { id: 'audit', label: 'Audit Reports', icon: FileKey },
  ];

  return (
    <aside className="w-60 shrink-0 border-r border-white/5 bg-[#070b14]/90 backdrop-blur flex flex-col">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/5">
        <Shield className="w-6 h-6 text-blue-500" />
        <span className="text-xl font-bold tracking-wide text-blue-400">BAYORA</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/30 to-blue-600/5 text-blue-400 font-semibold shadow-[inset_2px_0_0_#3b82f6]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-1.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          System Online
        </div>
        <div className="text-[11px] text-slate-400 leading-relaxed">
          Bayora Engine v2.4.1-rc<br />
          Status: <span className="text-slate-300">Active &amp; Secure</span>
        </div>
      </div>
    </aside>
  );
};
