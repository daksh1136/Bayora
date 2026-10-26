from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from backend.app.database import Base

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class SecurityPolicy(Base):
    """
    Zero-Trust Policy definition evaluated by the Policy Engine (OPA/Rego style).
    Controls micro-segmentation and capabilities between Red Sandbox, Blue Sandbox, and LLM.
    """
    __tablename__ = "security_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    source_sandbox = Column(String(64), nullable=False) # red_sandbox, blue_sandbox, client_llm, any
    target_sandbox = Column(String(64), nullable=False) # blue_sandbox, client_llm, external_net, orchestrator
    action = Column(String(16), default="DENY")         # ALLOW, DENY, INSPECT
    rego_rule = Column(Text, nullable=False)            # Rego policy code
    enabled = Column(Boolean, default=True)
    violation_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
