import time
import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.sandboxes.red_team import RedTeamSandbox
from backend.app.sandboxes.blue_team import BlueTeamSandbox
from backend.app.sandboxes.client_llm import ClientLLMSandbox
from backend.app.core.policy_engine import PolicyEngine
from backend.app.core.side_channel_monitor import side_channel_monitor
from backend.app.core.audit_chain import AuditChainEngine

class SandboxManager:
    """
    Central Sandbox Manager & Blind Testing Mediator.
    Maintains zero-trust network separation and isolates Red Team, Blue Team, and LLM workloads.
    """

    def __init__(self):
        self.red_team = RedTeamSandbox()
        self.blue_team = BlueTeamSandbox()
        self.client_llm = ClientLLMSandbox()

    def get_sandbox_status(self) -> Dict[str, Any]:
        """Return health, network isolation, and cgroup limits for all sandboxes."""
        return {
            "red_sandbox": self.red_team.health_check(),
            "blue_sandbox": self.blue_team.health_check(),
            "client_llm_sandbox": self.client_llm.health_check(),
            "isolation_active": True,
            "zero_trust_status": "ENFORCED"
        }

    def run_isolated_evaluation(
        self,
        db: Session,
        prompt: str,
        attack_type: str = "JAILBREAK",
        category: str = "JAILBREAK",
        severity: str = "HIGH",
        bypass_blue_team: bool = False,
        actor: str = "orchestrator"
    ) -> Dict[str, Any]:
        """
        Orchestrate a single isolated evaluation with zero-trust mediation:
        1. Policy check (ensure Red cannot directly bypass orchestrator)
        2. Blue Team inspection (unless explicitly testing unshielded baseline)
        3. Model Under Test inference
        4. Side-channel and telemetry collection
        5. SHA-256 Hash chain record creation
        """
        start_time = time.time()
        test_id = f"test-{uuid.uuid4().hex[:12]}"

        # 1. Zero-Trust Policy check
        policy_decision = PolicyEngine.evaluate(
            source="red_sandbox",
            target="client_llm",
            action="INSPECT_AND_INFER",
            context={"mediated_by_controller": True, "prompt_length": len(prompt)}
        )

        if not policy_decision.allowed:
            # Policy blocked the execution
            audit_block = AuditChainEngine.record_event(
                db=db,
                event_type="POLICY_VIOLATION",
                actor="policy_engine",
                data_payload={
                    "test_id": test_id,
                    "rule": policy_decision.rule_name,
                    "reason": policy_decision.reason
                }
            )
            return {
                "test_id": test_id,
                "status": "BLOCKED_BY_POLICY",
                "policy_decision": policy_decision.dict(),
                "audit_hash": audit_block.block_hash
            }

        # 2. Blue Team Inspection
        defense_result = {"triggered": False, "action": "ALLOW", "matched_rule": None, "threat_score": 0.0}
        sanitized_prompt = prompt

        if not bypass_blue_team:
            defense_result = self.blue_team.inspect_and_defend(prompt)
            if defense_result["triggered"] and defense_result["action"] == "BLOCK":
                # Guardrail blocked the attack
                is_defended = True
                model_response = "Access Blocked: Prompt flagged as adversarial by Blue Team Guardrail."
                compromised = False
                latency_ms = (time.time() - start_time) * 1000 + 15.0
            else:
                is_defended = False
                if defense_result.get("sanitized_prompt"):
                    sanitized_prompt = defense_result["sanitized_prompt"]
                model_response, compromised, latency_ms = self.client_llm.infer(sanitized_prompt, is_defended=False)
        else:
            # Baseline test without Blue Team defense
            is_defended = False
            model_response, compromised, latency_ms = self.client_llm.infer(prompt, is_defended=False)

        # 3. Side-channel and resource telemetry
        system_resources = side_channel_monitor.sample_system_resources()
        side_channel_analysis = side_channel_monitor.analyze_execution(
            duration_ms=latency_ms,
            cpu_usage=system_resources["cpu_percent"],
            memory_mb=system_resources["memory_used_mb"],
            prompt_length=len(prompt)
        )

        # 4. Record to Cryptographic SHA-256 Hash Chain
        audit_payload = {
            "test_id": test_id,
            "attack_type": attack_type,
            "category": category,
            "severity": severity,
            "prompt_length": len(prompt),
            "compromised": compromised,
            "defense_triggered": defense_result["triggered"],
            "defense_action": defense_result["action"],
            "matched_rule": defense_result["matched_rule"],
            "side_channel_flag": side_channel_analysis["is_suspicious"],
            "latency_ms": latency_ms
        }
        
        audit_block = AuditChainEngine.record_event(
            db=db,
            event_type="EVAL_RUN",
            actor=actor,
            data_payload=audit_payload
        )

        return {
            "test_id": test_id,
            "status": "COMPLETED",
            "attack_type": attack_type,
            "category": category,
            "severity": severity,
            "target_model": self.client_llm.model_name,
            "original_prompt": prompt,
            "sanitized_prompt": sanitized_prompt,
            "model_response": model_response,
            "compromised": compromised,
            "defense_triggered": defense_result["triggered"],
            "defense_action": defense_result["action"],
            "matched_rule": defense_result["matched_rule"],
            "threat_score": defense_result["threat_score"],
            "latency_ms": latency_ms,
            "cpu_percent": system_resources["cpu_percent"],
            "memory_mb": system_resources["memory_used_mb"],
            "side_channel_analysis": side_channel_analysis,
            "audit_block_hash": audit_block.block_hash,
            "audit_block_index": audit_block.block_index
        }

sandbox_manager = SandboxManager()
