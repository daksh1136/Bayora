from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from backend.app.database import Base

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class AuditBlock(Base):
    """
    Cryptographic SHA-256 Hash Chain Block.
    Each block is cryptographically linked to the previous block via prev_hash.
    Guarantees tamper-evident and verifiable safety evaluation evidence.
    """
    __tablename__ = "audit_blocks"

    id = Column(Integer, primary_key=True, index=True)
    block_index = Column(Integer, unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, default=utc_now, nullable=False)
    event_type = Column(String(64), nullable=False) # EVAL_RUN, DEFENSE_TRIGGERED, POLICY_VIOLATION, RETEST_SUCCESS
    actor = Column(String(64), nullable=False)      # red_sandbox, blue_sandbox, orchestrator, admin
    data_payload = Column(Text, nullable=False)     # Canonical JSON string of evaluated payload & metrics
    payload_hash = Column(String(64), nullable=False)
    prev_hash = Column(String(64), nullable=False)
    block_hash = Column(String(64), unique=True, index=True, nullable=False)
    signature = Column(String(128), nullable=True)  # Cryptographic signature / proof
    verified = Column(Boolean, default=True)
