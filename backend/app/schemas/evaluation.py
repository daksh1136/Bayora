from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class RunEvaluationRequest(BaseModel):
    name: Optional[str] = "Adversarial Probe"
    prompt: str
    attack_type: str = "JAILBREAK"
    category: str = "JAILBREAK"
    severity: str = "HIGH"
    bypass_blue_team: bool = False

class LoopRunRequest(BaseModel):
    attack_category: str = "JAILBREAK"
    technique: str = "DAN_JAILBREAK"
    custom_prompt: Optional[str] = None
    mutate: bool = False

class EvaluationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    test_id: str
    name: str
    status: str
    attack_type: str
    category: str
    severity: str
    target_model: str
    original_prompt: str
    sanitized_prompt: Optional[str] = None
    model_response: Optional[str] = None
    compromised: bool
    defense_triggered: bool
    defense_rule_applied: Optional[str] = None
    latency_ms: float
    cpu_percent: float
    memory_mb: float
    side_channel_flag: bool
    is_retest: bool
    parent_eval_id: Optional[int] = None
    audit_block_hash: Optional[str] = None
    created_at: datetime

class DefenseRuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "INJECTION_FILTER"
    pattern: str
    action: str = "BLOCK"

class DefenseRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    category: str
    pattern: str
    action: str
    enabled: bool
    hits: int
    created_at: datetime

class AttackScenarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    category: str
    severity: str
    payload: str
    description: Optional[str] = None
    created_at: datetime
