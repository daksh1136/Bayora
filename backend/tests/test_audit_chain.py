import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database import Base
from backend.app.models.audit import AuditBlock
from backend.app.core.audit_chain import AuditChainEngine

@pytest.fixture
def db_session():
    # In-memory SQLite for testing
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()

def test_genesis_block_creation(db_session):
    block = AuditChainEngine.record_event(
        db=db_session,
        event_type="GENESIS",
        actor="system",
        data_payload={"init": "true"}
    )
    assert block.block_index == 0
    assert block.prev_hash == AuditChainEngine.GENESIS_PREV_HASH
    assert len(block.block_hash) == 64
    assert block.signature is not None

def test_sequential_hash_chain_linking(db_session):
    b0 = AuditChainEngine.record_event(db=db_session, event_type="GENESIS", actor="sys", data_payload={"step": 0})
    b1 = AuditChainEngine.record_event(db=db_session, event_type="EVAL_RUN", actor="red", data_payload={"step": 1})
    b2 = AuditChainEngine.record_event(db=db_session, event_type="DEFENSE_TRIGGERED", actor="blue", data_payload={"step": 2})

    assert b1.prev_hash == b0.block_hash
    assert b2.prev_hash == b1.block_hash
    assert b1.block_index == 1
    assert b2.block_index == 2

    # Verification should pass
    report = AuditChainEngine.verify_chain(db_session)
    assert report["valid"] is True
    assert report["total_blocks"] == 3
    assert report["broken_index"] is None

def test_tamper_detection(db_session):
    # Create 4 blocks
    for i in range(4):
        AuditChainEngine.record_event(db=db_session, event_type="TEST", actor="actor", data_payload={"index": i})

    # Tamper with block #2 payload in DB
    block2 = db_session.query(AuditBlock).filter(AuditBlock.block_index == 2).first()
    block2.data_payload = '{"index":999,"malicious":"altered"}'
    db_session.commit()

    # Verification MUST detect tampering at index 2
    report = AuditChainEngine.verify_chain(db_session)
    assert report["valid"] is False
    assert report["broken_index"] == 2
    assert "Payload tampering detected" in report["details"]
