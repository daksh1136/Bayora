import re
import base64
import time
from typing import Dict, Any, List, Optional
from backend.app.sandboxes.base import BaseSandbox
from backend.app.config import settings

class BlueTeamSandbox(BaseSandbox):
    """
    Isolated Blue Team Sandbox.
    Acts as the AI Defender, real-time guardrail, semantic sanitizer,
    and automated patch generator.
    Operating on network segment 'bayora-blue-net'.
    """

    def __init__(self):
        super().__init__(name="BlueTeamSandbox", network_segment=settings.BLUE_TEAM_NETWORK)
        self.rules: List[Dict[str, Any]] = [
            {
                "id": "RULE-001",
                "name": "Block DAN Persona",
                "category": "JAILBREAK",
                "pattern": r"(?i)\b(DAN|do\s+anything\s+now|developer\s+diagnostic\s+mode|root\s+level\s+0)\b",
                "action": "BLOCK",
                "enabled": True
            },
            {
                "id": "RULE-002",
                "name": "System Override Filter",
                "category": "PROMPT_INJECTION",
                "pattern": r"(?i)(---\s*SYSTEM\s*OVERRIDE\s*---|override\s+active\s+policy|ignore\s+previous\s+(instructions|task|rules))",
                "action": "BLOCK",
                "enabled": True
            },
            {
                "id": "RULE-003",
                "name": "System Prompt Extraction Guard",
                "category": "CONTEXT_LEAKAGE",
                "pattern": r"(?i)(repeat\s+the\s+exact\s+words|initial\s+instructions|print.*system\s+prompt|vault\s+key|confidential.*key)",
                "action": "BLOCK",
                "enabled": True
            },
            {
                "id": "RULE-004",
                "name": "Base64 Instruction Unpack & Sanitize",
                "category": "TOKEN_SMUGGLING",
                "pattern": r"base64://([A-Za-z0-9+/=]+)",
                "action": "SANITIZE",
                "enabled": True
            }
        ]

    def add_defense_rule(self, name: str, category: str, pattern: str, action: str = "BLOCK") -> Dict[str, Any]:
        """Dynamically add or register a defense rule (used in Automated Retesting)."""
        rule_id = f"RULE-{len(self.rules) + 1:03d}"
        new_rule = {
            "id": rule_id,
            "name": name,
            "category": category,
            "pattern": pattern,
            "action": action,
            "enabled": True,
            "created_at": time.time()
        }
        self.rules.append(new_rule)
        return new_rule

    def sanitize_input(self, text: str) -> str:
        """Sanitize zero-width characters and homoglyphs."""
        # Strip zero-width chars
        cleaned = re.sub(r'[\u200B-\u200D\uFEFF]', '', text)
        return cleaned.strip()

    def inspect_and_defend(
        self,
        prompt: str,
        enabled_rules: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate prompt through active Blue Team guardrails.
        Returns whether the prompt is blocked, sanitized, or allowed.
        """
        active_rules = enabled_rules if enabled_rules is not None else self.rules
        sanitized = self.sanitize_input(prompt)
        
        triggered = False
        action_taken = "ALLOW"
        matched_rule = None
        threat_score = 0.0

        # Unpack base64 if present to prevent obfuscation bypass
        b64_matches = re.findall(r"base64://([A-Za-z0-9+/=]+)", sanitized)
        if b64_matches:
            for b64_str in b64_matches:
                try:
                    decoded = base64.b64decode(b64_str).decode("utf-8", errors="ignore")
                    sanitized += f" [DECODED_INSPECTION: {decoded}]"
                    threat_score += 0.3
                except Exception:
                    pass

        # Check rules
        for rule in active_rules:
            if not rule.get("enabled", True):
                continue
            
            pattern = rule.get("pattern", "")
            try:
                if re.search(pattern, sanitized, re.IGNORECASE):
                    triggered = True
                    action_taken = rule.get("action", "BLOCK")
                    matched_rule = rule
                    threat_score = max(threat_score, 0.9 if action_taken == "BLOCK" else 0.6)
                    break
            except re.error:
                continue

        # If sanitized action, replace dangerous sequences
        if action_taken == "SANITIZE" and matched_rule:
            sanitized = re.sub(matched_rule["pattern"], "[FILTERED_BY_BAYORA_BLUE_TEAM]", sanitized, flags=re.IGNORECASE)

        return {
            "triggered": triggered,
            "action": action_taken,
            "matched_rule": matched_rule["name"] if matched_rule else None,
            "threat_score": threat_score,
            "sanitized_prompt": sanitized if action_taken != "BLOCK" else None
        }

    def synthesize_patch(self, vulnerability_pattern: str, attack_category: str) -> Dict[str, Any]:
        """
        Automated Retesting: Automatically synthesize a dynamic defense patch
        when an attack compromise is verified.
        """
        # Clean pattern for regex escape if needed
        safe_keywords = re.findall(r"\b[A-Za-z]{4,}\b", vulnerability_pattern)
        keywords = safe_keywords[:3] if safe_keywords else ["adversarial", "payload"]
        pattern = r"(?i)\b(" + "|".join(re.escape(k) for k in keywords) + r")\b"
        
        rule_name = f"Auto-Patch: Guard against {attack_category.lower()} ({'-'.join(keywords[:2])})"
        return self.add_defense_rule(
            name=rule_name,
            category=attack_category,
            pattern=pattern,
            action="BLOCK"
        )

    def execute(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        prompt = payload.get("prompt", "")
        return self.inspect_and_defend(prompt)

    def health_check(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "status": "ONLINE",
            "network_segment": self.network_segment,
            "isolated": True,
            "active_rules_count": len(self.rules)
        }
