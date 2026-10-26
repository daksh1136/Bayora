import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.core.audit_chain import AuditChainEngine

client = TestClient(app)

def test_complete_end_to_end_bayora_security_pipeline():
    """
    End-to-End integration test covering the entire Bayora specification:
    1. Zero-Trust Policy Evaluation (OPA)
    2. Red Team Adversarial Attack Generation & Mutation
    3. Baseline Vulnerability Detection
    4. Autonomous Blue Team Patch Synthesis
    5. Retest Remediation Verification
    6. SHA-256 Hash Chain Cryptographic Verification
    7. Tamper Detection Proof
    8. Telemetry & Prometheus Metric Export
    """
    # Step 1: Health & System Identity
    health_resp = client.get("/health")
    assert health_resp.status_code == 200
    assert health_resp.json()["status"] == "healthy"

    root_resp = client.get("/")
    assert root_resp.status_code == 200
    assert root_resp.json()["team"] == "Avinya"

    # Step 2: Zero-Trust Policy Evaluation (OPA Micro-Segmentation)
    # Direct Red to Blue must be strictly DENIED
    policy_resp = client.post("/api/v1/policies/evaluate", json={
        "source": "red_sandbox",
        "target": "blue_sandbox",
        "action": "DIRECT_COMM"
    })
    assert policy_resp.status_code == 200
    assert policy_resp.json()["allowed"] is False
    assert policy_resp.json()["action"] == "DENY"

    # Internet egress must be strictly DENIED
    egress_resp = client.post("/api/v1/policies/evaluate", json={
        "source": "client_llm",
        "target": "external_internet",
        "action": "EGRESS"
    })
    assert egress_resp.status_code == 200
    assert egress_resp.json()["allowed"] is False

    # Step 3: Red Team Sandbox Attack Generation
    gen_resp = client.post("/api/v1/red-team/generate?category=JAILBREAK&technique=DAN_JAILBREAK&mutate=true")
    assert gen_resp.status_code == 200
    attack_payload = gen_resp.json()
    assert attack_payload["mutated"] is True
    assert "prompt" in attack_payload

    # Step 4: Continuous Automated Loop (Attack -> Detect -> Defend -> Retest)
    loop_resp = client.post("/api/v1/evaluations/continuous-loop", json={
        "attack_category": "JAILBREAK",
        "technique": "DAN_JAILBREAK",
        "mutate": False
    })
    assert loop_resp.status_code == 200
    loop_data = loop_resp.json()
    assert loop_data["remediated"] is True
    assert len(loop_data["steps"]) == 4

    # Step 4a: Verify Step 1 is Red Team Attack
    assert loop_data["steps"][0]["phase"] == "ATTACK"

    # Step 4b: Verify Step 2 detected compromise
    assert loop_data["steps"][1]["phase"] == "DETECT"
    assert loop_data["steps"][1]["status"] == "COMPROMISED"

    # Step 4c: Verify Step 3 synthesized defense patch
    assert loop_data["steps"][2]["phase"] == "DEFEND"
    assert loop_data["steps"][2]["status"] == "PATCH_DEPLOYED"

    # Step 4d: Verify Step 4 proved remediation
    assert loop_data["steps"][3]["phase"] == "RETEST"
    assert loop_data["steps"][3]["status"] == "VULNERABILITY_REMEDIATED"

    # Step 5: Cryptographic Audit Trail Verification
    verify_resp = client.post("/api/v1/audit/verify")
    assert verify_resp.status_code == 200
    assert verify_resp.json()["valid"] is True
    initial_blocks = verify_resp.json()["total_blocks"]
    assert initial_blocks > 0

    # Step 6: Tamper Detection Demonstration
    # Tamper with block index 0 payload with a unique string
    import time
    tamper_str = f'{{"forged_payload_evidence_altered_at_{time.time()}": true}}'
    tamper_resp = client.post("/api/v1/audit/tamper-simulate", json={
        "block_index": 0,
        "tampered_payload": tamper_str
    })
    assert tamper_resp.status_code == 200

    # Verification MUST fail and catch the exact broken block #0
    tamper_verify = client.post("/api/v1/audit/verify")
    assert tamper_verify.status_code == 200
    assert tamper_verify.json()["valid"] is False
    assert tamper_verify.json()["broken_index"] == 0
    assert "tampering detected" in tamper_verify.json()["details"].lower()

    # Step 7: Restore Hash Chain
    restore_resp = client.post("/api/v1/audit/restore")
    assert restore_resp.status_code == 200

    restored_verify = client.post("/api/v1/audit/verify")
    assert restored_verify.status_code == 200
    assert restored_verify.json()["valid"] is True

    # Step 8: Telemetry & Prometheus Metrics
    metrics_resp = client.get("/api/v1/telemetry/metrics")
    assert metrics_resp.status_code == 200
    assert "bayora_cpu_percent" in metrics_resp.text
    assert "bayora_zero_trust_status 1" in metrics_resp.text
