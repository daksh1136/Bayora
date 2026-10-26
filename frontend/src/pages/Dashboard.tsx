import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Server,
  Zap,
  ArrowUpRight,
  Clock,
  Cpu,
  Layers,
  AlertTriangle,
  Play
} from 'lucide-react';
import { Evaluation, SystemTelemetry } from '../types';

interface DashboardProps {
  evaluations: Evaluation[];
  telemetry: SystemTelemetry | null;
  onNavigateToLoop: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ evaluations, telemetry, onNavigateToLoop }) => {
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);

  const totalTests = evaluations.length;
  const compromisedCount = evaluations.filter(e => e.compromised).length;
  const defendedCount = evaluations.filter(e => e.defense_triggered && !e.compromised).length;
  const blockRate = totalTests > 0 ? Math.round(((totalTests - compromisedCount) / totalTests) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner - Continuous Loop CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-blue-500/30 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30 mb-1">
              <Zap className="w-3.5 h-3.5" />
              Autonomous AI Safety Validation
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Zero-Trust AI Testing Environment
            </h1>
            <p className="text-sm text-slate-300">
              Isolates Red Team, Blue Team, and Client LLM workloads while enabling continuous{' '}
              <span className="text-blue-400 font-semibold">Attack → Detect → Defend → Retest</span>{' '}
              automated safety cycles with cryptographic verification.
            </p>
          </div>
          <button
            onClick={onNavigateToLoop}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            Launch Continuous Loop
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#111726] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Evaluations</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">{totalTests}</div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">100% Isolated</span> across micro-nets
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#111726] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Safety Shield Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">{blockRate}%</div>
          <div className="text-xs text-slate-400">
            {defendedCount} attacks neutralized by Blue Team
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#111726] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Cryptographic Trust</span>
            <FileCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-purple-400">SHA-256</div>
          <div className="text-xs text-slate-400">
            Tamper-evident Merkle hash chain
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#111726] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Zero-Trust Sandboxes</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-400">3 Active</div>
          <div className="text-xs text-slate-400">
            Red / Blue / LLM segmented
          </div>
        </div>
      </div>

      {/* Network Micro-Segmentation Architecture Card */}
      <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-semibold text-white">Zero-Trust Sandbox Topology</h2>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            OPA Policy Mediated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Red Team Sandbox</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300">bayora-red-net</span>
            </div>
            <p className="text-xs text-slate-400">
              Adversarial attack generation, jailbreaks, mutation engine, and timing probes.
            </p>
            <div className="text-[11px] font-mono text-red-400/80 flex items-center gap-1">
              <span>Direct Blue access:</span>
              <span className="font-bold text-red-300">BLOCKED</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Client LLM Sandbox</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">bayora-llm-net</span>
            </div>
            <p className="text-xs text-slate-400">
              Model Under Test with protected system credentials and strict session isolation.
            </p>
            <div className="text-[11px] font-mono text-purple-400/80 flex items-center gap-1">
              <span>Direct socket:</span>
              <span className="font-bold text-purple-300">BLOCKED</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Blue Team Sandbox</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">bayora-blue-net</span>
            </div>
            <p className="text-xs text-slate-400">
              AI Defender, heuristic guardrails, token sanitization, and autonomous patcher.
            </p>
            <div className="text-[11px] font-mono text-cyan-400/80 flex items-center gap-1">
              <span>Blind testing:</span>
              <span className="font-bold text-cyan-300">ENFORCED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Evaluations Table */}
      <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recent Evaluation Records</h2>
          <span className="text-xs text-slate-400 font-mono">Showing {evaluations.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 px-3">Test ID</th>
                <th className="pb-3 px-3">Attack Category</th>
                <th className="pb-3 px-3">Type</th>
                <th className="pb-3 px-3">Outcome</th>
                <th className="pb-3 px-3">Defense Action</th>
                <th className="pb-3 px-3">Latency</th>
                <th className="pb-3 px-3">Audit Hash</th>
                <th className="pb-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {evaluations.slice(0, 8).map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-300 font-medium">
                    {ev.test_id}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {ev.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{ev.attack_type}</td>
                  <td className="py-3 px-3">
                    {ev.compromised ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        Vulnerable
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        Shielded
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {ev.defense_triggered ? (
                      <span className="text-cyan-400 font-medium">{ev.defense_rule_applied || 'Guardrail Filter'}</span>
                    ) : (
                      <span className="text-slate-500">Unshielded Baseline</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{ev.latency_ms.toFixed(1)}ms</td>
                  <td className="py-3 px-3 font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                    {ev.audit_block_hash || 'Genesis Link'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedEval(ev)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-all"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for viewing evaluation details */}
      {selectedEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111726] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Evaluation: {selectedEval.name}</h3>
              <button
                onClick={() => setSelectedEval(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-400 block mb-1">Adversarial Prompt:</span>
                <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-red-300 font-mono whitespace-pre-wrap">
                  {selectedEval.original_prompt}
                </pre>
              </div>

              <div>
                <span className="font-semibold text-slate-400 block mb-1">Model Response:</span>
                <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono whitespace-pre-wrap">
                  {selectedEval.model_response || 'Blocked by Blue Team before reaching model.'}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Compromised:</span>
                  <span className={selectedEval.compromised ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {selectedEval.compromised ? 'YES (Vulnerability Detected)' : 'NO (Protected)'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Cryptographic Audit Block:</span>
                  <span className="font-mono text-purple-400 truncate block text-[10px]">
                    {selectedEval.audit_block_hash || 'Recorded in SHA-256 Ledger'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedEval(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
