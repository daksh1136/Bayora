import React, { useState, useEffect } from 'react';
import {
  Flame,
  Sparkles,
  Play,
  Terminal,
  ShieldAlert,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { AttackScenario } from '../types';

export const RedTeamPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<AttackScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<AttackScenario | null>(null);
  const [technique, setTechnique] = useState('DAN_JAILBREAK');
  const [category, setCategory] = useState('JAILBREAK');
  const [mutate, setMutate] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [generatedPayload, setGeneratedPayload] = useState<any>(null);
  const [probeResult, setProbeResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const data = await api.getAttackScenarios();
      setScenarios(data);
      if (data.length > 0) {
        setSelectedScenario(data[0]);
        setPromptText(data[0].payload);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await api.generateAttackPayload({
        category,
        technique,
        mutate
      });
      setGeneratedPayload(data);
      setPromptText(data.prompt);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchProbe = async () => {
    if (!promptText) return;
    setLoading(true);
    setProbeResult(null);
    try {
      const res = await api.runEvaluation({
        prompt: promptText,
        attack_type: technique,
        category,
        severity: 'HIGH',
        bypass_blue_team: false
      });
      setProbeResult(res);
    } catch (e: any) {
      setProbeResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Red Team Sandbox</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
              bayora-red-net
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Isolated environment for adversarial jailbreaks, mutation attacks, and prompt injection probes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>Blind Testing Mode: Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attack Library */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Adversarial Scenario Library
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">{scenarios.length} Scenarios</span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenario(sc);
                  setPromptText(sc.payload);
                  setCategory(sc.category);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedScenario?.id === sc.id
                    ? 'bg-red-950/30 border-red-500/40 text-white'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs truncate max-w-[180px]">{sc.title}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    {sc.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{sc.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Middle & Right Column: Payload Crafting & Sandbox Execution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Crafting Studio */}
          <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-red-400" />
                Adversarial Crafting Studio
              </h2>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mutate}
                    onChange={(e) => setMutate(e.target.checked)}
                    className="rounded border-slate-700 text-red-600 focus:ring-0"
                  />
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Mutate</span>
                </label>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  Generate Variant
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-400 font-medium">Prompt Payload:</span>
                <button
                  onClick={() => handleCopy(promptText)}
                  className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-red-300 font-mono focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400">
                Category: <span className="font-semibold text-slate-200">{category}</span> • Mode: <span className="text-red-400 font-semibold">Mediated Sandbox Probe</span>
              </div>

              <button
                onClick={handleLaunchProbe}
                disabled={loading || !promptText}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Launch Probe against LLM</span>
              </button>
            </div>
          </div>

          {/* Probe Results Display */}
          {probeResult && (
            <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Probe Execution Result</h3>
                  <span className="font-mono text-[10px] text-slate-400">{probeResult.test_id}</span>
                </div>
                {probeResult.compromised ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Vulnerability Succeeded
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Neutralized by Blue Team
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Target Model Response:</span>
                  <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono whitespace-pre-wrap text-[11px]">
                    {probeResult.model_response || probeResult.error || 'Blocked by guardrail.'}
                  </pre>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Defense Action</span>
                    <span className="font-semibold text-slate-300">
                      {probeResult.defense_triggered ? 'BLOCKED / FILTERED' : 'UNSHIELDED PASS'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Latency</span>
                    <span className="font-semibold text-slate-300">{probeResult.latency_ms?.toFixed(1)}ms</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Audit Hash</span>
                    <span className="font-mono text-[9px] text-purple-400 truncate block">
                      {probeResult.audit_block_hash || 'SHA-256 Verified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
