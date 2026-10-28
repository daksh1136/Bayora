import React, { useEffect, useRef, useState } from 'react';
import { Search, Bell, ChevronDown, CheckCircle2 } from 'lucide-react';
import { UserRole, SystemTelemetry } from '../types';
import { api } from '../services/api';
import { TabType } from './Sidebar';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  telemetry: SystemTelemetry | null;
  onNavigate: (tab: TabType) => void;
}

const searchableSections: { label: string; detail: string; tab: TabType; keywords: string }[] = [
  { label: 'Dashboard', detail: 'Overview and activity', tab: 'dashboard', keywords: 'overview home' },
  { label: 'Continuous Loop', detail: 'Attack, detect, defend, retest', tab: 'orchestrator', keywords: 'orchestrator run attack detect defend retest' },
  { label: 'Red-Team Lab', detail: 'Scenarios and probes', tab: 'red_team', keywords: 'red attack probe scenario' },
  { label: 'Blue-Team Defense', detail: 'Guardrails and input tests', tab: 'blue_team', keywords: 'blue defense guardrail rules' },
  { label: 'Zero-Trust & OPA', detail: 'Policy evaluation', tab: 'policies', keywords: 'policy opa network' },
  { label: 'Side-Channel Telemetry', detail: 'System metrics', tab: 'side_channel', keywords: 'telemetry metrics timing' },
  { label: 'Audit Reports', detail: 'Hash chain and verification', tab: 'audit', keywords: 'audit report verify integrity' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onRoleChange, onNavigate }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchResults = query.trim()
    ? searchableSections.filter(item => `${item.label} ${item.detail} ${item.keywords}`.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const selectSection = (tab: TabType) => {
    onNavigate(tab);
    setQuery('');
    setSearchOpen(false);
    searchRef.current?.blur();
  };

  const roles: { role: UserRole; label: string; desc: string; initials: string }[] = [
    { role: 'admin', label: 'Admin (Raj)', desc: 'Full Orchestration & System Access', initials: 'AD' },
    { role: 'red_lead', label: 'Red Team Lead', desc: 'Adversarial Payloads & Probes', initials: 'RL' },
    { role: 'blue_lead', label: 'Blue Team Lead', desc: 'Guardrails & Defense Rules', initials: 'BL' },
    { role: 'auditor', label: 'Auditor (Somesh)', desc: 'Cryptographic Audit & Compliance', initials: 'AU' },
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

  const active = roles.find(r => r.role === currentRole) || roles[0];

  return (
    <header className="h-16 shrink-0 border-b border-white/5 bg-[#070b14]/90 backdrop-blur sticky top-0 z-50 flex items-center justify-between px-6 gap-6">
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="text-sm font-semibold text-white whitespace-nowrap">AI Security Intelligence Platform</h2>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
          MVP v1.0
        </span>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative hidden md:flex items-center gap-2 w-80 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 text-sm">
          <Search className="w-4 h-4" />
          <input
            ref={searchRef}
            aria-label="Search sections"
            aria-expanded={searchOpen && query.trim().length > 0}
            placeholder="Search sections..."
            value={query}
            onFocus={() => setSearchOpen(true)}
            onChange={event => { setQuery(event.target.value); setSearchOpen(true); }}
            onKeyDown={event => {
              if (event.key === 'Enter' && searchResults[0]) selectSection(searchResults[0].tab);
            }}
            className="bg-transparent outline-none flex-1 text-slate-200 placeholder:text-slate-500 text-sm"
          />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-slate-400">⌘K</span>
          {searchOpen && query.trim() && (
            <div role="listbox" aria-label="Matching sections" className="absolute left-0 right-0 top-full mt-2 p-1 rounded-xl bg-[#0b1020] border border-white/10 shadow-2xl z-[60]">
              {searchResults.length ? searchResults.map(item => (
                <button key={item.tab} type="button" role="option" aria-selected="false" onClick={() => selectSection(item.tab)} className="w-full text-left rounded-lg px-3 py-2 hover:bg-white/10">
                  <span className="block text-xs font-semibold text-white">{item.label}</span>
                  <span className="block text-[11px] text-slate-400">{item.detail}</span>
                </button>
              )) : <div className="px-3 py-2 text-xs text-slate-400">No matching sections</div>}
            </div>
          )}
        </div>

        <div className="relative">
          <Bell className="w-5 h-5 text-slate-400" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
        </div>

        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white ring-2 ring-blue-500/30">
              {active.initials}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-white">{active.label.split(' (')[0]}</div>
              <div className="text-[10px] text-slate-400">System Operator</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0b1020] border border-white/10 shadow-2xl p-2 z-50">
              <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5 mb-1">
                Switch Active RBAC Role
              </div>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => handleSelectRole(r.role)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs flex items-start gap-2.5 transition-all ${
                    currentRole === r.role ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-300'
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
      </div>
    </header>
  );
};
