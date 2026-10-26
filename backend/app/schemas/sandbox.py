from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class PolicyEvaluationRequest(BaseModel):
    source: str
    target: str
    action: str
    prompt_length: Optional[int] = 100
    mediated_by_controller: bool = False

class PolicyResponse(BaseModel):
    id: str
    name: str
    source: str
    target: str
    action: str
    description: str
    rego: str

class SystemMetricsResponse(BaseModel):
    cpu_percent: float
    memory_used_mb: float
    memory_percent: float
    timestamp: float
    active_sandboxes: int
    threat_level: str
