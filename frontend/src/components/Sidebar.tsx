import React from 'react';
import {
  LayoutDashboard,
  Repeat,
  Flame,
  ShieldCheck,
  FileKey,
  Network,
  Activity,
  Code
} from 'lucide-react';
import { UserRole } from '../types';

export type TabType = 'dashboard' | 'orchestrator' | 'red_team' | 'blue_team' | 'audit' | 'policies' | 'side_channel';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, currentRole }) => {
  const navItems: { id: TabType; label: string; icon: React.ElementType; badge?: string; allowedRoles?: UserRole[] }[] = [
    { id: 'dashboard', label: 'Security Posture', icon: LayoutDashboard },
    { id: 'orchestrator', label: 'Continuous Loop', icon: Repeat, badge: 'Attack→Retest' },
    { id: 'red_team', label: 'Red Team Sandbox', icon: Flame, badge: 'Attacker' },
    { id: 'blue_team', label: 'Blue Team Sandbox', icon: ShieldCheck, badge: 'Defender' },
    { id: 'audit', label: 'SHA-256 Hash Chain', icon: FileKey, badge: 'Tamper-Evident' },
    { id: 'policies', label: 'Zero-Trust & OPA', icon: Network },
    { id: 'side_channel', label: 'Side-Channel Telemetry', icon: Activity },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#090d16] flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
            Core Modules
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                        item.id === 'red_team'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : item.id === 'blue_team'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : item.id === 'orchestrator'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Micro-Segmentation Map Card */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300">Network Micro-Seg</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-1.5 text-[10px] font-mono text-slate-400">
            <div className="flex items-center justify-between">
              <span className="text-red-400">bayora-red-net</span>
              <span className="text-slate-500">ISOLATED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-400">bayora-blue-net</span>
              <span className="text-slate-500">ISOLATED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-400">bayora-llm-net</span>
              <span className="text-slate-500">PROTECTED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>Protocol:</span>
          <span className="font-mono text-slate-400">SHA-256 Ledger</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Team:</span>
          <span className="text-slate-300 font-medium">Avinya</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span>Members:</span>
          <span className="text-slate-400">Daksh, Raj, Somesh</span>
        </div>
      </div>
    </aside>
  );
};
