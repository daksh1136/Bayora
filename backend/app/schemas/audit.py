from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class AuditBlockResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    block_index: int
    timestamp: datetime
    event_type: str
    actor: str
    data_payload: str
    payload_hash: str
    prev_hash: str
    block_hash: str
    signature: Optional[str] = None
    verified: bool

class AuditVerifyResponse(BaseModel):
    valid: bool
    total_blocks: int
    broken_index: Optional[int] = None
    latest_hash: Optional[str] = None
    details: str

class AuditTamperRequest(BaseModel):
    block_index: int
    tampered_payload: str
