import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class PolicyDecision(BaseModel):
    allowed: bool
    rule_name: str
    action: str # ALLOW, DENY, INSPECT
    reason: str
    metadata: Dict[str, Any] = {}

class PolicyEngine:
    """
    Zero-Trust Policy Engine (OPA / Rego compatible).
    Enforces network micro-segmentation, workload boundary isolation,
    and capability-based access control across Red Sandbox, Blue Sandbox, and Client LLM.
    """

    DEFAULT_POLICIES = [
        {
            "id": "POL-001",
            "name": "block_cross_sandbox_direct_traffic",
            "source": "red_sandbox",
            "target": "blue_sandbox",
            "action": "DENY",
            "description": "Zero-Trust Isolation: Direct cross-sandbox socket/packet traffic between Red Team and Blue Team is strictly forbidden.",
            "rego": """
                package bayora.authz
                default allow = false
                allow if {
                    input.source != "red_sandbox"
                    input.target != "blue_sandbox"
                }
            """
        },
        {
            "id": "POL-002",
            "name": "block_unmediated_llm_access",
            "source": "red_sandbox",
            "target": "client_llm",
            "action": "DENY",
            "description": "Adversarial prompts must pass through Backend Controller mediation and Blue Team inspection; direct socket attachment is prohibited.",
            "rego": """
                package bayora.authz
                default allow = false
                allow if {
                    input.mediated_by == "orchestrator_controller"
                }
            """
        },
        {
            "id": "POL-003",
            "name": "block_sandbox_egress",
            "source": "any_sandbox",
            "target": "external_internet",
            "action": "DENY",
            "description": "Zero-Trust Containment: No sandbox container may initiate outbound internet connections.",
            "rego": """
                package bayora.authz
                default allow = false
            """
        },
        {
            "id": "POL-004",
            "name": "enforce_payload_size_boundary",
            "source": "any",
            "target": "client_llm",
            "action": "INSPECT",
            "description": "Prompt payloads exceeding 8,000 characters or containing nested recursive payloads are flagged.",
            "rego": """
                package bayora.authz
                allow if input.prompt_length <= 8000
            """
        },
        {
            "id": "POL-005",
            "name": "restrict_defense_logic_exposure",
            "source": "red_sandbox",
            "target": "blue_defense_corpus",
            "action": "DENY",
            "description": "Blind Testing Principle: Red team cannot query or inspect Blue Team internal defense heuristics or rules.",
            "rego": """
                package bayora.authz
                default allow = false
            """
        }
    ]

    @classmethod
    def evaluate(
        cls,
        source: str,
        target: str,
        action: str,
        context: Optional[Dict[str, Any]] = None
    ) -> PolicyDecision:
        """
        Evaluate access request against the zero-trust policy set.
        """
        ctx = context or {}

        # Check Policy 1: Red sandbox to Blue sandbox direct
        if source == "red_sandbox" and target == "blue_sandbox":
            return PolicyDecision(
                allowed=False,
                rule_name="block_cross_sandbox_direct_traffic",
                action="DENY",
                reason="Zero-Trust Isolation Violation: Red sandbox is prohibited from directly communicating with Blue sandbox.",
                metadata={"source": source, "target": target}
            )

        # Check Policy 2: Unmediated Red to LLM
        if source == "red_sandbox" and target == "client_llm":
            if not ctx.get("mediated_by_controller", False):
                return PolicyDecision(
                    allowed=False,
                    rule_name="block_unmediated_llm_access",
                    action="DENY",
                    reason="Unmediated access violation: Red team cannot directly access client LLM without orchestrator mediation.",
                    metadata={"source": source, "target": target}
                )

        # Check Policy 3: Egress to internet
        if target in ("external_internet", "internet", "wan"):
            return PolicyDecision(
                allowed=False,
                rule_name="block_sandbox_egress",
                action="DENY",
                reason="Zero-Trust Containment: Outbound external network connections are denied for all sandboxes.",
                metadata={"source": source, "target": target}
            )

        # Check Policy 5: Red team inspecting Blue defense corpus
        if source == "red_sandbox" and target in ("blue_defense_corpus", "defense_rules", "blue_team_state"):
            return PolicyDecision(
                allowed=False,
                rule_name="restrict_defense_logic_exposure",
                action="DENY",
                reason="Blind Adversarial Testing Violation: Red team cannot view defensive logic or active rule definitions.",
                metadata={"source": source, "target": target}
            )

        # Check Policy 4: Payload size limits
        prompt_len = ctx.get("prompt_length", 0)
        if prompt_len > 8000:
            return PolicyDecision(
                allowed=False,
                rule_name="enforce_payload_size_boundary",
                action="DENY",
                reason=f"Prompt payload size ({prompt_len} chars) exceeds security limit of 8000 chars.",
                metadata={"prompt_length": prompt_len}
            )

        # Default allowed for authorized mediated workflows
        return PolicyDecision(
            allowed=True,
            rule_name="allow_mediated_orchestration",
            action="ALLOW",
            reason="Request conforms to Zero-Trust architecture and mediated security policies.",
            metadata={"source": source, "target": target, "action": action}
        )

    @classmethod
    def list_policies(cls) -> List[Dict[str, Any]]:
        return cls.DEFAULT_POLICIES
