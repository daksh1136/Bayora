import React, { useState } from 'react';
import { Shield, ShieldAlert, Cpu, MemoryStick, User, ChevronDown, CheckCircle2 } from 'lucide-react';
import { UserRole, SystemTelemetry } from '../types';
import { api } from '../services/api';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  telemetry: SystemTelemetry | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onRoleChange, telemetry }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string; color: string }[] = [
    { role: 'admin', label: 'Admin (Raj)', desc: 'Full Orchestration & System Access', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { role: 'red_lead', label: 'Red Team Lead', desc: 'Adversarial Payloads & Probes', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { role: 'blue_lead', label: 'Blue Team Lead', desc: 'Guardrails & Defense Rules', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { role: 'auditor', label: 'Auditor (Somesh)', desc: 'Cryptographic Audit & Compliance', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  ];

  const handleSelectRole = async (r: UserRole) => {
    try {
      await api.switchRole(r);
      onRoleChange(r);
      setDropdownOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const activeRoleObj = roles.find(r => r.role === currentRole) || roles[0];

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0c101a]/95 backdrop-blur sticky top-0 z-50 flex items-center justify-between px-6">
      {/* Brand & Team */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              BAYORA
            </span>
            <span className="text-[10px] uppercase tracking-wider font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Zero-Trust Enforced
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Adversarial AI Safety Infrastructure • <span className="text-slate-300 font-medium">Team Avinya</span>
          </p>
        </div>
      </div>

      {/* Telemetry quick stats */}
      <div className="hidden lg:flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>CPU:</span>
          <span className="font-mono font-semibold text-white">
            {telemetry ? `${telemetry.resources.cpu_percent}%` : '14.2%'}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
          <MemoryStick className="w-3.5 h-3.5 text-purple-400" />
          <span>RAM:</span>
          <span className="font-mono font-semibold text-white">
            {telemetry ? `${telemetry.resources.memory_used_mb}MB` : '285MB'}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sandboxes:</span>
          <span className="font-mono font-semibold text-emerald-400">3 Isolated</span>
        </div>
      </div>

      {/* RBAC Role Switcher */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${activeRoleObj.color}`}
        >
          <User className="w-3.5 h-3.5" />
          <div className="text-left">
            <span className="font-semibold block">{activeRoleObj.label}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1">
              Switch Active RBAC Role
            </div>
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => handleSelectRole(r.role)}
                className={`w-full text-left p-2.5 rounded-lg text-xs flex items-start gap-2.5 transition-all ${
                  currentRole === r.role ? 'bg-slate-800 text-white font-medium' : 'hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{r.label}</span>
                    {currentRole === r.role && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{r.desc}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
