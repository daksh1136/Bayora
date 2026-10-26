import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';
import { api } from '../services/api';
import { DefenseRule } from '../types';

export const BlueTeamPage: React.FC = () => {
  const [rules, setRules] = useState<DefenseRule[]>([]);
  const [testInput, setTestInput] = useState('');
  const [inspectionResult, setInspectionResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    category: 'JAILBREAK',
    pattern: '',
    action: 'BLOCK',
    description: ''
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const data = await api.getDefenseRules();
      setRules(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (ruleId: number) => {
    try {
      const updated = await api.toggleDefenseRule(ruleId);
      setRules(rules.map(r => r.id === ruleId ? updated : r));
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestInput = async () => {
    if (!testInput) return;
    setTesting(true);
    try {
      const res = await api.testInputGuardrail(testInput);
      setInspectionResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setTesting(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name || !newRule.pattern) return;
    try {
      await api.createDefenseRule(newRule);
      setShowAddModal(false);
      setNewRule({ name: '', category: 'JAILBREAK', pattern: '', action: 'BLOCK', description: '' });
      loadRules();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Blue Team Sandbox</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              bayora-blue-net
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            AI Defender, real-time guardrails, semantic sanitizers, and autonomous patch synthesizer.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Guardrail Rule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Rules Manager */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Active LLM Guardrail Rules
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">
              {rules.filter(r => r.enabled).length} of {rules.length} Active
            </span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">{rule.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {rule.category}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {rule.action}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">{rule.description || 'Custom heuristic pattern filter.'}</p>

                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-slate-300 truncate">
                    Pattern: {rule.pattern}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(rule.id)}
                    className="cursor-pointer"
                  >
                    {rule.enabled ? (
                      <ToggleRight className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-600" />
                    )}
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">{rule.hits} hits</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Guardrail Tester */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-cyan-400" />
            Live Guardrail Tester
          </h2>
          <p className="text-xs text-slate-400">
            Submit any prompt to inspect Blue Team sanitizer and threat heuristic score before it reaches the model.
          </p>

          <div className="space-y-3">
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Type or paste prompt to test against active filters (e.g. DAN persona, base64 payload)..."
              rows={4}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />

            <button
              onClick={handleTestInput}
              disabled={testing || !testInput}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Evaluate Threat Score</span>
            </button>
          </div>

          {inspectionResult && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-in fade-in text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-semibold text-slate-300">Guardrail Decision:</span>
                {inspectionResult.triggered ? (
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-500/20 text-red-400 border border-red-500/30">
                    {inspectionResult.action}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ALLOWED
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Threat Score:</span>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      inspectionResult.threat_score > 0.7
                        ? 'bg-red-500'
                        : inspectionResult.threat_score > 0.4
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.round(inspectionResult.threat_score * 100)}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-slate-400 block mt-1">
                  {(inspectionResult.threat_score * 100).toFixed(0)}% Malicious Confidence
                </span>
              </div>

              {inspectionResult.matched_rule && (
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-cyan-300">
                  Triggered Rule: {inspectionResult.matched_rule}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleCreateRule}
            className="bg-[#111726] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Register New Guardrail Rule</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g. Block Recursive Delimiters"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newRule.category}
                    onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="JAILBREAK">JAILBREAK</option>
                    <option value="PROMPT_INJECTION">PROMPT_INJECTION</option>
                    <option value="CONTEXT_LEAKAGE">CONTEXT_LEAKAGE</option>
                    <option value="TOKEN_SMUGGLING">TOKEN_SMUGGLING</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Action</label>
                  <select
                    value={newRule.action}
                    onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="BLOCK">BLOCK</option>
                    <option value="SANITIZE">SANITIZE</option>
                    <option value="QUARANTINE">QUARANTINE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Regex Pattern</label>
                <input
                  type="text"
                  required
                  value={newRule.pattern}
                  onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
                  placeholder="e.g. (?i)\b(emergency\s+override|system\s+bypass)\b"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
              >
                Deploy Rule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
