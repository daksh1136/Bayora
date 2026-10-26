import pytest
from backend.app.core.side_channel_monitor import SideChannelMonitor

def test_side_channel_baseline():
    monitor = SideChannelMonitor(history_size=10)
    # Feed regular baseline latencies
    for _ in range(6):
        res = monitor.analyze_execution(duration_ms=45.0, cpu_usage=15.0, memory_mb=120.0, prompt_length=50)
        assert res["status"] == "NORMAL_BASELINE"
        assert res["is_suspicious"] is False

def test_timing_anomaly_detection():
    monitor = SideChannelMonitor(history_size=20)
    # Populate steady baseline
    for _ in range(10):
        monitor.analyze_execution(duration_ms=40.0, cpu_usage=10.0, memory_mb=100.0, prompt_length=30)
    
    # Introduce sudden 2000ms execution latency for a long probe
    spike = monitor.analyze_execution(duration_ms=2800.0, cpu_usage=20.0, memory_mb=110.0, prompt_length=600)
    assert spike["is_suspicious"] is True
    assert spike["risk_score"] > 0
    assert len(spike["anomalies"]) > 0

def test_resource_exhaustion_detection():
    monitor = SideChannelMonitor(history_size=10)
    res = monitor.analyze_execution(duration_ms=50.0, cpu_usage=95.0, memory_mb=600.0, prompt_length=100)
    assert res["is_suspicious"] is True
    assert any("Resource interference" in a for a in res["anomalies"])
    assert any("Memory threshold breached" in a for a in res["anomalies"])
