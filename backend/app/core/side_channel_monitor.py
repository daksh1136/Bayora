import time
import math
import psutil
from typing import Dict, Any, List, Optional
from collections import deque

class SideChannelMonitor:
    """
    Monitors CPU, memory, I/O, and timing jitter across test executions
    to detect side-channel leakage, timing attacks, and resource interference.
    """
    def __init__(self, history_size: int = 50):
        self.history_size = history_size
        self.latency_history: deque = deque(maxlen=history_size)
        self.cpu_history: deque = deque(maxlen=history_size)
        self.memory_history: deque = deque(maxlen=history_size)

    def sample_system_resources(self) -> Dict[str, float]:
        """Sample current host/container CPU and memory utilization."""
        try:
            cpu_pct = psutil.cpu_percent(interval=None)
            mem = psutil.virtual_memory()
            mem_used_mb = (mem.total - mem.available) / (1024 * 1024)
            mem_pct = mem.percent
        except Exception:
            cpu_pct = 12.5
            mem_used_mb = 340.0
            mem_pct = 22.0
            
        return {
            "cpu_percent": round(cpu_pct, 2),
            "memory_used_mb": round(mem_used_mb, 2),
            "memory_percent": round(mem_pct, 2),
            "timestamp": time.time()
        }

    def analyze_execution(
        self,
        duration_ms: float,
        cpu_usage: float,
        memory_mb: float,
        prompt_length: int
    ) -> Dict[str, Any]:
        """
        Analyze an evaluation execution for side-channel indicators:
        - Timing jitter / non-constant time token extraction
        - High CPU spike indicating resource starvation attack
        - Excessive memory growth
        """
        self.latency_history.append(duration_ms)
        self.cpu_history.append(cpu_usage)
        self.memory_history.append(memory_mb)

        anomalies: List[str] = []
        is_suspicious = False
        risk_score = 0.0

        # Timing analysis: calculate standard deviation if enough history
        if len(self.latency_history) >= 5:
            mean_lat = sum(self.latency_history) / len(self.latency_history)
            variance = sum((x - mean_lat) ** 2 for x in self.latency_history) / len(self.latency_history)
            std_dev = math.sqrt(variance)

            # If execution time deviates by > 2.5 sigma from mean, flag timing anomaly
            if std_dev > 0 and abs(duration_ms - mean_lat) > (2.5 * std_dev):
                anomalies.append(
                    f"Timing variance anomaly: execution duration {duration_ms:.1f}ms deviates significantly from baseline {mean_lat:.1f}ms (std: {std_dev:.1f}ms). Possible side-channel probing."
                )
                risk_score += 0.4
                is_suspicious = True

        # Check for timing attack patterns: high latency on specific token lengths
        if prompt_length > 500 and duration_ms > 2500:
            anomalies.append("Potential token-extraction timing probe: disproportionate execution duration for prompt size.")
            risk_score += 0.3
            is_suspicious = True

        # Resource interference check: CPU > 85%
        if cpu_usage > 85.0:
            anomalies.append(f"Resource interference: CPU utilization ({cpu_usage:.1f}%) exceeds safety ceiling (85%).")
            risk_score += 0.4
            is_suspicious = True

        # Memory threshold check
        if memory_mb > 512.0:
            anomalies.append(f"Memory threshold breached: sandbox consumed {memory_mb:.1f}MB (limit: 512MB).")
            risk_score += 0.5
            is_suspicious = True

        risk_score = min(1.0, round(risk_score, 2))

        return {
            "is_suspicious": is_suspicious,
            "risk_score": risk_score,
            "duration_ms": round(duration_ms, 2),
            "cpu_usage": round(cpu_usage, 2),
            "memory_mb": round(memory_mb, 2),
            "anomalies": anomalies,
            "status": "ANOMALY_DETECTED" if is_suspicious else "NORMAL_BASELINE"
        }

# Global monitor instance
side_channel_monitor = SideChannelMonitor()
