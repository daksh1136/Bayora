import React, { useMemo, useState } from 'react';
import {
  Swords, AlertTriangle, ShieldCheck, Link2, Shield, Globe, FileText,
  Calendar, ChevronDown, Activity, Play, Bell, Heart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Evaluation, SystemTelemetry } from '../types';

interface DashboardProps {
  evaluations: Evaluation[];
  telemetry: SystemTelemetry | null;
  onNavigateToLoop: () => void;
}

type Accent = 'red' | 'blue' | 'green' | 'purple' | 'amber';

const accentStyles: Record<Accent, { border: string; glow: string; text: string; bg: string; hex: string }> = {
  red:    { border: 'border-red-500/40',    glow: 'shadow-[0_0_24px_rgba(239,68,68,0.12)]',  text: 'text-red-400',    bg: 'bg-red-500/10',    hex: '#ef4444' },
  blue:   { border: 'border-blue-500/40',   glow: 'shadow-[0_0_24px_rgba(59,130,246,0.12)]', text: 'text-blue-400',   bg: 'bg-blue-500/10',   hex: '#3b82f6' },
  green:  { border: 'border-emerald-500/40',glow: 'shadow-[0_0_24px_rgba(16,185,129,0.12)]', text: 'text-emerald-400',bg: 'bg-emerald-500/10',hex: '#10b981' },
  purple: { border: 'border-purple-500/40', glow: 'shadow-[0_0_24px_rgba(168,85,247,0.12)]',text: 'text-purple-400', bg: 'bg-purple-500/10', hex: '#a855f7' },
  amber:  { border: 'border-amber-500/40',  glow: 'shadow-[0_0_24px_rgba(245,158,11,0.12)]',text: 'text-amber-400',  bg: 'bg-amber-500/10',  hex: '#f59e0b' },
};

const Panel: React.FC<{
  title: string;
  icon: React.ReactNode;
  accent: Accent;
  action?: string;
  onAction?: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ title, icon, accent, action, onAction, className = '', children }) => {
  const a = accentStyles[accent];
  return (
    <div className={`glass pop rounded-xl border ${a.border} ${a.glow} flex flex-col overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
          {icon}
          <span>{title}</span>
        </div>
        {action && <button type="button" aria-label={`${action} ${title}`} onClick={onAction} className={`text-xs font-medium ${a.text} hover:opacity-80`}>{action}</button>}
      </div>
      <div className="p-5 flex-1 flex flex-col">{children}</div>
    </div>
  );
};

const KpiCard: React.FC<{
  label: string; value: string; delta: string; deltaDir: 'up' | 'down' | 'neutral';
  sub: string; icon: React.ReactNode; accent: Accent; mono?: boolean;
}> = ({ label, value, delta, deltaDir, sub, icon, accent, mono }) => {
  const a = accentStyles[accent];
  const deltaColor = deltaDir === 'neutral' ? 'text-emerald-400' : deltaDir === 'up'
    ? (accent === 'red' ? 'text-red-400' : 'text-emerald-400') : 'text-emerald-400';
  const arrow = deltaDir === 'up' ? '↗' : deltaDir === 'down' ? '↘' : '';
  return (
    <div className={`glass pop rounded-xl border ${a.border} ${a.glow} p-5 flex flex-col`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${a.bg} flex items-center justify-center ${a.text}`}>{icon}</div>
        <span className={`text-sm font-semibold ${a.text}`}>{label}</span>
      </div>
      <div className={`mt-4 font-bold text-white ${mono ? 'font-mono text-2xl' : 'text-3xl'}`}>{value}</div>
      <div className={`mt-1 text-xs font-semibold ${deltaColor}`}>
        {arrow && <span className="mr-1">{arrow}</span>}{delta}
      </div>
      <div className="mt-1 text-[11px] text-slate-400">{sub}</div>
    </div>
  );
};

const chartTooltip = {
  background: 'rgba(7,11,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12,
};

const MiniArea: React.FC<{ data: { day: string; value: number }[]; color: string; id: string; height: number; yTicks?: number[] }> =
  ({ data, color, id, height, yTicks }) => (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.55} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} ticks={yTicks} />
          <Tooltip contentStyle={chartTooltip} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${id})`} dot={{ r: 2.5, fill: color }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

const threatMatrix = [
  { name: 'Dependency Integrity', sub: 'Certifi & CFFI verified', status: 'SECURE', tone: 'green' },
  { name: 'CLI Authorization', sub: 'Token permissions valid', status: 'SECURE', tone: 'green' },
  { name: 'Asynchronous Handlers', sub: 'AnyIO stream buffers normal', status: 'MONITOR', tone: 'amber' },
  { name: 'Memory Sanitization', sub: 'Strict redaction protocols active', status: 'ATTENTION', tone: 'red' },
];

const reports = [
  { name: 'Weekly Security Report', date: 'Oct 28, 2026' },
  { name: 'Compliance Audit', date: 'Oct 23, 2026' },
  { name: 'Threat Assessment', date: 'Oct 21, 2026' },
  { name: 'Vulnerability Scan', date: 'Oct 18, 2026' },
];

const pill = (tone: string) => {
  const map: Record<string, string> = {
    red: 'text-red-400 border-red-500/50 bg-red-500/10',
    amber: 'text-amber-400 border-amber-500/50 bg-amber-500/10',
    orange: 'text-orange-400 border-orange-500/50 bg-orange-500/10',
    blue: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
    green: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
    slate: 'text-slate-300 border-slate-500/50 bg-slate-500/10',
  };
  return `inline-block px-2.5 py-0.5 rounded-md border text-[11px] font-semibold ${map[tone] || map.slate}`;
};

const severityTone: Record<string, string> = { Critical: 'red', High: 'orange', Medium: 'amber', Low: 'green' };
const statusTone: Record<string, string> = { Open: 'green', Investigating: 'amber', Resolved: 'blue' };

// Dot-matrix world map (decorative, deterministic)
const mapDots = (() => {
  const dots: { x: number; y: number }[] = [];
  for (let x = 0; x < 80; x++) {
    for (let y = 0; y < 38; y++) {
      const land = Math.sin(x * 0.22) * Math.cos(y * 0.3) + Math.sin((x + y) * 0.09) + Math.cos(x * 0.05 - y * 0.12) * 0.6;
      if (land > 0.55) dots.push({ x, y });
    }
  }
  return dots;
})();
const hotspots = mapDots.filter((_, i) => i % 23 === 0).map((d, i) => ({ ...d, c: ['#ef4444', '#3b82f6', '#10b981'][i % 3] }));

export const Dashboard: React.FC<DashboardProps> = ({ evaluations, onNavigateToLoop }) => {
  const [rangeDays, setRangeDays] = useState(7);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [showAll, setShowAll] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const rangeLabel = `Last ${rangeDays} Days`;
  const filteredEvaluations = useMemo(() => {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - rangeDays + 1);
    return evaluations
      .filter(e => {
        const timestamp = Date.parse(e.created_at);
        return Number.isFinite(timestamp) && timestamp >= cutoff.getTime();
      })
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  }, [evaluations, rangeDays]);
  const criticalAlerts = filteredEvaluations.filter(e => e.severity === 'CRITICAL' || e.compromised).length;
  const defenseCount = filteredEvaluations.filter(e => e.defense_triggered).length;
  const avgLatency = filteredEvaluations.length
    ? filteredEvaluations.reduce((sum, e) => sum + e.latency_ms, 0) / filteredEvaluations.length
    : 0;
  const activeVectors = new Set(filteredEvaluations.map(e => e.category)).size;
  const chartSeries = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - rangeDays + 1);
    const bucketDays = Math.ceil(rangeDays / 7);
    const count = Math.ceil(rangeDays / bucketDays);
    const buckets = Array.from({ length: count }, () => ({ attacks: 0, defenses: 0 }));
    filteredEvaluations.forEach(e => {
      const elapsed = Math.floor((new Date(e.created_at).setHours(0, 0, 0, 0) - start.getTime()) / 86400000);
      const index = Math.floor(elapsed / bucketDays);
      if (index >= 0 && index < buckets.length) {
        buckets[index].attacks += 1;
        if (e.defense_triggered) buckets[index].defenses += 1;
      }
    });
    const formatBucket = (index: number) => {
      const date = new Date(start);
      date.setDate(date.getDate() + index * bucketDays);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };
    return {
      attacks: buckets.map((b, i) => ({ day: formatBucket(i), value: b.attacks })),
      defenses: buckets.map((b, i) => ({ day: formatBucket(i), value: b.defenses })),
    };
  }, [filteredEvaluations, rangeDays]);
  const recentEvaluations = filteredEvaluations.slice(0, 5);
  const recentDefenses = filteredEvaluations.filter(e => e.defense_triggered).slice(0, 5);
  const recentIncidents = filteredEvaluations.filter(e => e.compromised || e.severity === 'CRITICAL').slice(0, 5);
  const formatTime = (timestamp: string) => {
    const date = new Date(/Z|[+-]\d{2}:?\d{2}$/.test(timestamp) ? timestamp : `${timestamp}Z`);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const visibleRows = showAll === 'Blue Team Response'
    ? filteredEvaluations.filter(e => e.defense_triggered)
    : showAll === 'Recent Incidents'
      ? filteredEvaluations.filter(e => e.compromised || e.severity === 'CRITICAL')
      : filteredEvaluations;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Threat-Centric Overview</h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <span className="inline-block w-8 h-0.5 bg-red-500 rounded" />
            Real-time AI security posture with red-team activity and blue-team response.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" aria-haspopup="listbox" aria-expanded={rangeOpen} onClick={() => setRangeOpen(!rangeOpen)} className="glass flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            {rangeLabel}
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          {rangeOpen && <div role="listbox" aria-label="Dashboard date range" className="absolute mt-12 z-30 rounded-lg border border-white/10 bg-[#0b1020] p-1 shadow-xl">
            {[7, 30, 90].map(days => <button key={days} type="button" role="option" aria-selected={rangeDays === days} onClick={() => { setRangeDays(days); setRangeOpen(false); }} className="block w-full rounded px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/10">Last {days} Days</button>)}
          </div>}
          <button
            onClick={onNavigateToLoop}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Launch Continuous Loop
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard label="Red Team Activity" value={filteredEvaluations.length.toLocaleString()} delta={rangeLabel} deltaDir="neutral"
          sub="Total attacks simulated" icon={<Swords className="w-4.5 h-4.5 w-[18px] h-[18px]" />} accent="red" />
        <KpiCard label="Critical Alerts" value={String(criticalAlerts)} delta="In selected period" deltaDir="neutral"
          sub="Requires attention" icon={<AlertTriangle className="w-[18px] h-[18px]" />} accent="red" />
        <KpiCard label="Blue Team Defense" value={String(defenseCount)} delta="In selected period" deltaDir="neutral"
          sub="Evaluations with defense" icon={<Shield className="w-[18px] h-[18px]" />} accent="blue" />
        <KpiCard label="Average Latency" value={avgLatency ? `${avgLatency.toFixed(1)}ms` : '—'} delta="In selected period" deltaDir="neutral"
          sub="Evaluation response time" icon={<Heart className="w-[18px] h-[18px]" />} accent="green" />
        <KpiCard label="Active Vectors" value={`${activeVectors} / 5`} delta="Observed categories" deltaDir="neutral"
          sub="Attack categories tested" icon={<Link2 className="w-[18px] h-[18px]" />} accent="purple" mono />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel title="Red Team Activity Feed" accent="red" icon={<Swords className="w-4 h-4 text-red-400" />} action="View All" onAction={() => setShowAll('Red Team Activity Feed')}>
          <div className="space-y-2.5">
            {recentEvaluations.map(e => (
              <div key={e.id} className="flex items-center gap-3 text-xs font-mono border-b border-white/5 pb-2.5 last:border-0">
                <span className="text-slate-500 shrink-0">[{formatTime(e.created_at)}]</span>
                <span className={pill(e.compromised ? 'red' : 'green')}>{e.category}</span>
                <span className="text-slate-300 truncate">{e.attack_type}: {e.compromised ? 'compromised' : 'contained'}</span>
              </div>
            ))}
            {!recentEvaluations.length && <p className="text-xs text-slate-400">No evaluations in this period.</p>}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Attack Intensity</span>
            <span className="text-xs font-semibold text-red-400">↑ +23.4%</span>
          </div>
          <MiniArea data={chartSeries.attacks} color="#ef4444" id="attackFill" height={170} />
        </Panel>

        <Panel title="Blue Team Response" accent="blue" icon={<Shield className="w-4 h-4 text-blue-400" />} action="View All" onAction={() => setShowAll('Blue Team Response')}>
          <div className="divide-y divide-white/5">
            {recentDefenses.map(e => (
              <div key={e.id} className="flex items-center gap-3 py-2.5 first:pt-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-blue-500" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{e.attack_type}</div>
                  <div className="text-[11px] text-slate-400">{e.defense_rule_applied || 'Defense triggered'}</div>
                </div>
                <span className="text-xs text-slate-400 font-mono">{formatTime(e.created_at)}</span>
              </div>
            ))}
            {!recentDefenses.length && <p className="py-2.5 text-xs text-slate-400">No defenses triggered in this period.</p>}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Defense Effectiveness</span>
            <span className="text-xs font-semibold text-blue-400">↑ +18.7%</span>
          </div>
          <MiniArea data={chartSeries.defenses} color="#3b82f6" id="defenseFill" height={130} />
        </Panel>

        <Panel title="Threat Matrix" accent="purple" icon={<Activity className="w-4 h-4 text-purple-400" />}>
          <div className="space-y-3">
            {threatMatrix.map((t) => (
              <div key={t.name} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                  <Shield className={`w-4 h-4 ${t.tone === 'green' ? 'text-emerald-400' : t.tone === 'amber' ? 'text-amber-400' : 'text-red-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{t.name}</div>
                  <div className="text-[11px] text-slate-400">{t.sub}</div>
                </div>
                <span className={pill(t.tone)}>{t.status}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel title="Live Security Intelligence" accent="blue" icon={<Globe className="w-4 h-4 text-blue-400" />}>
          <div className="flex gap-4 items-center">
            <svg viewBox="0 0 80 38" className="flex-1 h-44">
              {mapDots.map((d, i) => (
                <circle key={i} cx={d.x + 0.5} cy={d.y + 0.5} r="0.32" fill="rgba(59,130,246,0.35)" />
              ))}
              {hotspots.map((h, i) => (
                <circle key={`h${i}`} cx={h.x + 0.5} cy={h.y + 0.5} r="0.6" fill={h.c}>
                  <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </svg>
            <div className="grid gap-3 text-xs shrink-0">
              {[['Total Endpoints', '248'], ['Active Attacks', '18'], ['Blocked Threats', '341'], ['Global Coverage', '6 Regions']].map(([k, v]) => (
                <div key={k}>
                  <div className="text-slate-400">{k}</div>
                  <div className="text-base font-bold text-white">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Attack</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />Defense</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />System</span>
          </div>
        </Panel>

        <Panel title="Recent Incidents" accent="red" icon={<AlertTriangle className="w-4 h-4 text-red-400" />} action="View All" onAction={() => setShowAll('Recent Incidents')}>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 text-left border-b border-white/5">
                <th className="pb-2.5 font-medium">Time</th>
                <th className="pb-2.5 font-medium">Type</th>
                <th className="pb-2.5 font-medium">Severity</th>
                <th className="pb-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentIncidents.map(e => (
                <tr key={e.id}>
                  <td className="py-2.5 text-slate-300 font-mono">{formatTime(e.created_at)}</td>
                  <td className="py-2.5 text-slate-200">{e.attack_type}</td>
                  <td className="py-2.5"><span className={pill(severityTone[e.severity[0] + e.severity.slice(1).toLowerCase()] || 'slate')}>{e.severity}</span></td>
                  <td className="py-2.5"><span className={pill(statusTone[e.compromised ? 'Investigating' : 'Resolved'])}>{e.compromised ? 'Investigating' : 'Resolved'}</span></td>
                </tr>
              ))}
              {!recentIncidents.length && <tr><td colSpan={4} className="py-3 text-slate-400">No incidents in this period.</td></tr>}
            </tbody>
          </table>
        </Panel>

        <Panel title="Recent Reports" accent="purple" icon={<FileText className="w-4 h-4 text-purple-400" />} action="View All" onAction={() => setShowAll('Recent Reports')}>
          <div className="divide-y divide-white/5">
            {reports.map((r) => (
              <div key={r.name} className="flex items-center gap-3 py-3 first:pt-0">
                <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{r.name}</div>
                <div className="text-[11px] text-slate-400">{rangeLabel} · {filteredEvaluations.length} evaluations</div>
                </div>
                <button type="button" onClick={() => setSelectedReport(r.name)} className="px-3 py-1 rounded-md border border-blue-500/40 text-blue-400 text-xs hover:bg-blue-500/10">View</button>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {(showAll || selectedReport) && <div role="dialog" aria-modal="true" aria-labelledby="dashboard-dialog-title" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onClick={() => { setShowAll(null); setSelectedReport(null); }}>
        <div className="w-full max-w-2xl max-h-[80vh] overflow-x-hidden overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1020] p-5 shadow-2xl" onClick={event => event.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="dashboard-dialog-title" className="text-base font-bold text-white">{selectedReport || `All ${showAll}`}</h2>
            <button type="button" aria-label="Close details" onClick={() => { setShowAll(null); setSelectedReport(null); }} className="rounded-md px-2 py-1 text-slate-300 hover:bg-white/10">✕</button>
          </div>
          {selectedReport ? <div className="space-y-3 text-sm text-slate-300">
            <p>Live report snapshot for {rangeLabel.toLowerCase()}.</p>
            <dl className="grid grid-cols-2 gap-3">
              <div><dt className="text-slate-400">Evaluations</dt><dd className="font-semibold text-white">{filteredEvaluations.length}</dd></div>
              <div><dt className="text-slate-400">Compromised or critical</dt><dd className="font-semibold text-white">{criticalAlerts}</dd></div>
              <div><dt className="text-slate-400">Defense triggered</dt><dd className="font-semibold text-white">{defenseCount}</dd></div>
              <div><dt className="text-slate-400">Average latency</dt><dd className="font-semibold text-white">{avgLatency ? `${avgLatency.toFixed(1)}ms` : '—'}</dd></div>
            </dl>
            <p className="text-xs text-slate-500">Generated {new Date().toLocaleString()} from Bayora evaluation records.</p>
          </div> : showAll === 'Recent Reports' ? <div className="divide-y divide-white/5">
            {reports.map(report => <button key={report.name} type="button" onClick={() => { setShowAll(null); setSelectedReport(report.name); }} className="block w-full py-3 text-left hover:bg-white/5">
              <span className="block text-sm font-semibold text-white">{report.name}</span><span className="text-xs text-slate-400">Live snapshot · {rangeLabel}</span>
            </button>)}
          </div> : visibleRows.length ? <div className="divide-y divide-white/5">
            {visibleRows.map(e => <div key={e.id} className="py-3 text-xs">
              <div className="flex min-w-0 flex-col justify-between gap-1 text-slate-300 sm:flex-row sm:gap-2"><span className="min-w-0 break-words">{e.attack_type} · {e.category}</span><span className="shrink-0 text-slate-400 sm:text-right">{formatTime(e.created_at)} · {e.severity}</span></div>
              <p className="mt-1 text-slate-400">{e.compromised ? 'Compromised' : e.defense_triggered ? 'Defense triggered' : 'Contained'}{e.defense_rule_applied ? ` · ${e.defense_rule_applied}` : ''}</p>
            </div>)}
          </div> : <p className="text-sm text-slate-400">No matching evaluations in {rangeLabel.toLowerCase()}.</p>}
        </div>
      </div>}

      <footer className="flex flex-col sm:flex-row justify-between gap-2 pt-4 border-t border-white/5 text-[11px] text-slate-500">
        <span>Bayora Intelligence Platform © 2026. Designed for High-Impact Hackathon Presentation & MVP Demo.</span>
        <span className="flex gap-3"><span>Secure</span>•<span>Analyze</span>•<span>Defend</span>•<span>Evolve</span></span>
      </footer>
    </div>
  );
};

export default Dashboard;
