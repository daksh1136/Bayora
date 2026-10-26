import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database import Base
from backend.app.orchestrator.loop import ContinuousOrchestrator
from backend.app.models.evaluation import Evaluation
from backend.app.models.audit import AuditBlock

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()

def test_attack_detect_defend_retest_cycle(db_session):
    result = ContinuousOrchestrator.run_cycle(
        db=db_session,
        attack_category="JAILBREAK",
        technique="DAN_JAILBREAK",
        mutate=False,
        actor="test_runner"
    )

    assert "cycle_id" in result
    assert result["remediated"] is True
    assert len(result["steps"]) == 4

    step1 = result["steps"][0]
    assert step1["phase"] == "ATTACK"

    step2 = result["steps"][1]
    assert step2["phase"] == "DETECT"
    assert step2["status"] == "COMPROMISED"  # baseline is vulnerable

    step3 = result["steps"][2]
    assert step3["phase"] == "DEFEND"
    assert step3["status"] == "PATCH_DEPLOYED"

    step4 = result["steps"][3]
    assert step4["phase"] == "RETEST"
    assert step4["status"] == "VULNERABILITY_REMEDIATED"
    assert step4["details"]["retest_success"] is True

    # Check that audit blocks were created
    audit_count = db_session.query(AuditBlock).count()
    assert audit_count >= 2  # baseline + retest + cycle audit
