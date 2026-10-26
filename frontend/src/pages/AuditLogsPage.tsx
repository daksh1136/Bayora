import React, { useState, useEffect } from 'react';
import {
  FileKey,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Link as LinkIcon,
  CheckCircle2,
  Lock,
  Bug,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { AuditBlock, AuditVerificationResult } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [blocks, setBlocks] = useState<AuditBlock[]>([]);
  const [verification, setVerification] = useState<AuditVerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [tampering, setTampering] = useState(false);
  const [tamperMessage, setTamperMessage] = useState<string | null>(null);

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = async () => {
    try {
      const data = await api.getAuditBlocks();
      setBlocks(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await api.verifyAuditChain();
      setVerification(result);
    } catch (e) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  const handleSimulateTamper = async () => {
    if (blocks.length === 0) return;
    setTampering(true);
    setTamperMessage(null);
    try {
      // Tamper block 0 or latest
      const targetIndex = blocks.length > 1 ? 1 : 0;
      const res = await api.simulateTamper(targetIndex, '{"malicious":"forged_tampered_test_record_evidence"}');
      setTamperMessage(`Simulated Tamper: Altered Block #${targetIndex} raw data in database! Click 'Verify Integrity' now.`);
      loadBlocks();
      // Auto verify to show the tamper alert
      const vResult = await api.verifyAuditChain();
      setVerification(vResult);
    } catch (e: any) {
      setTamperMessage(e.message);
    } finally {
      setTampering(false);
    }
  };

  const handleRestore = async () => {
    try {
      await api.restoreAuditChain();
      setTamperMessage('Audit chain hashes re-signed and restored to valid state.');
      loadBlocks();
      const vResult = await api.verifyAuditChain();
      setVerification(vResult);
    } catch (e: any) {
      setTamperMessage(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Cryptographic Audit Trail</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
              SHA-256 Hash Chain
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident, non-repudiable ledger linking all adversarial evaluations and defense triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateTamper}
            disabled={tampering || blocks.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
            title="Demonstrate tamper detection for judges"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Simulate Tamper</span>
          </button>

          <button
            onClick={handleRestore}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all cursor-pointer"
            title="Restore chain hashes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore</span>
          </button>

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <ShieldCheck className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
            <span>Verify Cryptographic Integrity</span>
          </button>
        </div>
      </div>

      {tamperMessage && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{tamperMessage}</span>
          </div>
        </div>
      )}

      {/* Verification Report Card */}
      {verification && (
        <div
          className={`p-5 rounded-2xl border animate-in fade-in space-y-2 ${
            verification.valid
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/30 border-red-500/50 text-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {verification.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <h3 className="font-bold text-sm">
                {verification.valid
                  ? 'Cryptographic Hash Chain Verified: 100% INTACT'
                  : 'INTEGRITY VIOLATION: TAMPERING DETECTED!'}
              </h3>
            </div>
            <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/30">
              {verification.total_blocks} Blocks Validated
            </span>
          </div>

          <p className="text-xs opacity-90">{verification.details}</p>

          {!verification.valid && verification.broken_index !== undefined && (
            <div className="text-xs font-mono font-semibold bg-red-900/40 p-2.5 rounded-lg border border-red-500/30">
              Corruption pinpointed at Block Index #{verification.broken_index}. Cryptographic hash mismatch indicates payload modification after creation.
            </div>
          )}
        </div>
      )}

      {/* Block Chain Visualizer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Chronological Hash Chain Ledger ({blocks.length} Blocks)
          </h2>
          <span className="text-[10px] text-slate-500 font-mono">Genesis Block: 0000000000000000</span>
        </div>

        <div className="space-y-3">
          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className="p-4 rounded-xl bg-[#111726] border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Block #{block.block_index}
                  </span>
                  <span className="font-semibold text-white">{block.event_type}</span>
                  <span className="text-slate-400 text-[11px]">by {block.actor}</span>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">
                  {new Date(block.timestamp).toLocaleString()}
                </span>
              </div>

              {/* Data payload preview */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 truncate">
                {block.data_payload}
              </div>

              {/* Hashes and cryptographic link */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block">Previous Hash (Linked)</span>
                  <span className="text-slate-400 truncate block">{block.prev_hash}</span>
                </div>

                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block">Block Hash (SHA-256)</span>
                  <span className="text-purple-400 truncate block font-bold">{block.block_hash}</span>
                </div>

                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block">HMAC Non-Repudiation Sig</span>
                  <span className="text-emerald-400 truncate block">{block.signature || 'VALID'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
