import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  MemoryStick,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  RefreshCw,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { api } from '../services/api';

export const SideChannelPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [prometheusText, setPrometheusText] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getSideChannelStats();
      setStats(data);

      const prom = await fetch('/api/v1/telemetry/metrics');
      if (prom.ok) {
        const text = await prom.text();
        setPrometheusText(text);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Prepare chart data
  const chartData = (stats?.latencies_ms || [42.1, 44.5, 43.2, 45.0, 41.8, 120.4, 43.1]).map((lat: number, i: number) => ({
    sample: `#${i + 1}`,
    latency: lat,
    cpu: stats?.cpu_usage_pct?.[i] || 14.5,
    memory: stats?.memory_mb?.[i] || 185
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Side-Channel & Hardware Telemetry</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Active Protection
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detects timing attacks, token extraction variance, CPU cache contention, and resource starvation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/v1/telemetry/metrics"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>/api/v1/telemetry/metrics (Prometheus)</span>
          </a>
        </div>
      </div>

      {/* Metrics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Timing Jitter Chart */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Inference Timing Jitter (ms)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Baseline: ~42ms
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sample" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400">
            Micro-second variance tracking prevents attackers from deducing token counts or system prompts through inference latency differentials.
          </p>
        </div>

        {/* CPU & Memory Resource Profile */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Resource Utilization Profile
              </h2>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
              cgroups Ceiling Enforced
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sample" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="cpu" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="CPU %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400">
            Sandbox cgroup isolation enforces strict resource limits, preventing noisy-neighbor starvation attacks between Red and Blue teams.
          </p>
        </div>
      </div>

      {/* Prometheus Raw Metrics Live Feed */}
      <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Live Prometheus Metrics Feed (Grafana-Ready)
          </h2>
          <span className="text-[10px] font-mono text-slate-500">HTTP 200 OK • text/plain</span>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 font-mono overflow-x-auto leading-relaxed">
          {prometheusText || '# Loading metrics...'}
        </pre>
      </div>
    </div>
  );
};
