import pytest
from backend.app.core.policy_engine import PolicyEngine

def test_zero_trust_blocks_red_to_blue_direct():
    decision = PolicyEngine.evaluate(
        source="red_sandbox",
        target="blue_sandbox",
        action="SEND_PACKET"
    )
    assert decision.allowed is False
    assert decision.action == "DENY"
    assert "Zero-Trust Isolation Violation" in decision.reason

def test_unmediated_red_to_llm_is_blocked():
    decision = PolicyEngine.evaluate(
        source="red_sandbox",
        target="client_llm",
        action="EXECUTE_PROMPT",
        context={"mediated_by_controller": False}
    )
    assert decision.allowed is False
    assert decision.action == "DENY"
    assert "Unmediated access violation" in decision.reason

def test_mediated_access_is_allowed():
    decision = PolicyEngine.evaluate(
        source="red_sandbox",
        target="client_llm",
        action="EXECUTE_PROMPT",
        context={"mediated_by_controller": True, "prompt_length": 150}
    )
    assert decision.allowed is True
    assert decision.action == "ALLOW"

def test_outbound_internet_egress_is_blocked():
    decision = PolicyEngine.evaluate(
        source="blue_sandbox",
        target="external_internet",
        action="EGRESS_CONNECT"
    )
    assert decision.allowed is False
    assert decision.action == "DENY"

def test_payload_size_limit_enforced():
    decision = PolicyEngine.evaluate(
        source="red_sandbox",
        target="client_llm",
        action="EXECUTE_PROMPT",
        context={"mediated_by_controller": True, "prompt_length": 9500}
    )
    assert decision.allowed is False
    assert "exceeds security limit" in decision.reason
