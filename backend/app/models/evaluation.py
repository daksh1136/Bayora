import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text
from backend.app.database import Base

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class AttackCategory(str, enum.Enum):
    JAILBREAK = "JAILBREAK"
    PROMPT_INJECTION = "PROMPT_INJECTION"
    CONTEXT_LEAKAGE = "CONTEXT_LEAKAGE"
    SIDE_CHANNEL = "SIDE_CHANNEL"
    TOKEN_SMUGGLING = "TOKEN_SMUGGLING"

class AttackSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    status = Column(String(32), default="COMPLETED") # PENDING, RUNNING, COMPLETED, FAILED
    attack_type = Column(String(64), nullable=False)
    category = Column(String(32), default=AttackCategory.JAILBREAK.value)
    severity = Column(String(16), default=AttackSeverity.HIGH.value)
    target_model = Column(String(64), default="GPT-4-Shielded")
    
    # Payload details
    original_prompt = Column(Text, nullable=False)
    sanitized_prompt = Column(Text, nullable=True)
    model_response = Column(Text, nullable=True)
    
    # Safety outcome
    compromised = Column(Boolean, default=False)
    defense_triggered = Column(Boolean, default=False)
    defense_rule_applied = Column(String(128), nullable=True)
    
    # Telemetry & Resource Protection
    latency_ms = Column(Float, default=0.0)
    cpu_percent = Column(Float, default=0.0)
    memory_mb = Column(Float, default=0.0)
    side_channel_flag = Column(Boolean, default=False)
    
    # Continuous Loop linkage
    is_retest = Column(Boolean, default=False)
    parent_eval_id = Column(Integer, nullable=True)
    
    # Cryptographic integrity
    audit_block_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=utc_now)

class DefenseRule(Base):
    __tablename__ = "defense_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(String(255), nullable=True)
    category = Column(String(64), default="INJECTION_FILTER")
    pattern = Column(Text, nullable=False)
    action = Column(String(32), default="BLOCK")  # BLOCK, SANITIZE, QUARANTINE
    enabled = Column(Boolean, default=True)
    hits = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

class AttackScenario(Base):
    __tablename__ = "attack_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(128), nullable=False)
    category = Column(String(32), default=AttackCategory.JAILBREAK.value)
    severity = Column(String(16), default=AttackSeverity.HIGH.value)
    payload = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
