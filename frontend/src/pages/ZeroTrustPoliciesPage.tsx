import React, { useState, useEffect } from 'react';
import {
  Network,
  Shield,
  ShieldAlert,
  Code,
  CheckCircle2,
  XCircle,
  Play,
  ArrowRight,
  Lock,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { SecurityPolicy } from '../types';

export const ZeroTrustPoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [source, setSource] = useState('red_sandbox');
  const [target, setTarget] = useState('blue_sandbox');
  const [action, setAction] = useState('DIRECT_SOCKET');
  const [mediated, setMediated] = useState(false);
  const [decision, setDecision] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const data = await api.getPolicies();
      setPolicies(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await api.evaluatePolicy(source, target, action, mediated);
      setDecision(res);
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Zero-Trust Network & OPA Policies</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Open Policy Agent (Rego)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enforces strict micro-segmentation and capability-based access control across isolated sandboxes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          <Lock className="w-3.5 h-3.5" />
          <span>Default Action: DENY ALL</span>
        </div>
      </div>

      {/* Network Micro-Segmentation Visual Flow */}
      <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Network className="w-4 h-4 text-blue-400" />
          Network Micro-Segmentation Isolation Topology
        </h2>

        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
            {/* Red Box */}
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-center w-full md:w-56 space-y-1">
              <span className="text-red-400 font-bold block text-sm">🔴 RED SANDBOX</span>
              <span className="text-[10px] text-slate-400 block">bayora-red-net</span>
              <span className="text-[9px] text-red-300/80 block">Attacker Workload</span>
            </div>

            {/* Blocked Direct Path */}
            <div className="flex flex-col items-center text-slate-500 text-[10px] text-center px-2">
              <span className="text-red-400 font-bold">✕ DIRECT CROSS-TALK</span>
              <div className="h-0.5 w-24 bg-red-500/30 my-1 relative">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-red-400 font-bold">🚫</span>
              </div>
              <span className="text-slate-400">BLOCKED by OPA</span>
            </div>

            {/* Controller in the middle */}
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/50 text-center w-full md:w-64 space-y-1 shadow-lg shadow-blue-500/10">
              <span className="text-blue-400 font-bold block text-sm">🛡️ CONTROLLER MEDIATOR</span>
              <span className="text-[10px] text-slate-300 block">Zero-Trust Inspection Broker</span>
              <span className="text-[9px] text-emerald-400 font-semibold block">Policy Verified Routing</span>
            </div>

            {/* LLM Box */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 text-center w-full md:w-56 space-y-1">
              <span className="text-purple-400 font-bold block text-sm">🤖 CLIENT LLM</span>
              <span className="text-[10px] text-slate-400 block">bayora-llm-net</span>
              <span className="text-[9px] text-purple-300/80 block">Isolated Model Under Test</span>
            </div>

            {/* Blue Box */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-center w-full md:w-56 space-y-1">
              <span className="text-cyan-400 font-bold block text-sm">🔵 BLUE SANDBOX</span>
              <span className="text-[10px] text-slate-400 block">bayora-blue-net</span>
              <span className="text-[9px] text-cyan-300/80 block">AI Defender Guardrail</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Policy Simulator */}
      <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Play className="w-4 h-4 text-emerald-400" />
          Interactive OPA Policy Evaluator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Source Workload</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="red_sandbox">Red Team Sandbox</option>
              <option value="blue_sandbox">Blue Team Sandbox</option>
              <option value="client_llm">Client LLM</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Workload / Resource</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="blue_sandbox">Blue Team Sandbox (Direct)</option>
              <option value="client_llm">Client LLM</option>
              <option value="external_internet">External Internet / WAN</option>
              <option value="blue_defense_corpus">Blue Defense Corpus</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="DIRECT_SOCKET">DIRECT_SOCKET (Peer Connect)</option>
              <option value="EXECUTE_PROMPT">EXECUTE_PROMPT</option>
              <option value="INSPECT_RULES">INSPECT_RULES</option>
              <option value="EGRESS_CALL">EGRESS_CALL</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Test OPA Policy</span>
            </button>
          </div>
        </div>

        {decision && (
          <div
            className={`p-4 rounded-xl border animate-in fade-in flex items-start gap-3 ${
              decision.allowed
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-red-950/20 border-red-500/30 text-red-300'
            }`}
          >
            {decision.allowed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-bold flex items-center gap-2">
                <span>OPA DECISION: {decision.action}</span>
                <span className="font-mono text-[10px] text-slate-400">Rule: {decision.rule_name}</span>
              </div>
              <p className="text-[11px] opacity-90">{decision.reason}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rego Policies List */}
      <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Code className="w-4 h-4 text-purple-400" />
          Active OPA Rego Policy Rules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((pol) => (
            <div
              key={pol.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white">{pol.name}</span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                    pol.action === 'DENY'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {pol.action}
                </span>
              </div>

              <p className="text-[11px] text-slate-400">{pol.description}</p>

              <pre className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-[10px] text-purple-300 font-mono overflow-x-auto">
                {pol.rego.trim()}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
