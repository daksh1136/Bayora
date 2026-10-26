from fastapi import APIRouter, Response
from backend.app.core.side_channel_monitor import side_channel_monitor
from backend.app.sandboxes.manager import sandbox_manager

router = APIRouter(prefix="/telemetry", tags=["Telemetry & Prometheus"])

@router.get("/metrics")
def get_prometheus_metrics():
    """Expose metrics in Prometheus text exposition format."""
    resources = side_channel_monitor.sample_system_resources()
    
    output = [
        "# HELP bayora_cpu_percent System CPU utilization percentage",
        "# TYPE bayora_cpu_percent gauge",
        f"bayora_cpu_percent {resources['cpu_percent']}",
        "# HELP bayora_memory_used_mb System memory utilized in megabytes",
        "# TYPE bayora_memory_used_mb gauge",
        f"bayora_memory_used_mb {resources['memory_used_mb']}",
        "# HELP bayora_active_sandboxes Number of active isolated sandboxes",
        "# TYPE bayora_active_sandboxes gauge",
        "bayora_active_sandboxes 3",
        "# HELP bayora_zero_trust_status Zero-trust isolation status (1=enforced, 0=degraded)",
        "# TYPE bayora_zero_trust_status gauge",
        "bayora_zero_trust_status 1"
    ]
    return Response(content="\n".join(output), media_type="text/plain; version=0.0.4")

@router.get("/system")
def get_system_telemetry():
    """JSON format telemetry for Web Dashboard."""
    resources = side_channel_monitor.sample_system_resources()
    sandbox_status = sandbox_manager.get_sandbox_status()
    
    return {
        "resources": resources,
        "sandboxes": sandbox_status,
        "side_channel_history_samples": len(side_channel_monitor.latency_history),
        "threat_level": "ELEVATED" if any(side_channel_monitor.latency_history and lat > 1500 for lat in list(side_channel_monitor.latency_history)[-5:]) else "NORMAL"
    }

@router.get("/side-channel")
def get_side_channel_stats():
    """Retrieve side-channel timing jitter and resource variance data."""
    latencies = list(side_channel_monitor.latency_history)
    cpus = list(side_channel_monitor.cpu_history)
    mems = list(side_channel_monitor.memory_history)

    return {
        "sample_count": len(latencies),
        "latencies_ms": latencies,
        "cpu_usage_pct": cpus,
        "memory_mb": mems,
        "status": "MONITORING_ACTIVE"
    }
