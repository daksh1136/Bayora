from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models.evaluation import DefenseRule
from backend.app.schemas.evaluation import DefenseRuleCreate, DefenseRuleResponse
from backend.app.sandboxes.manager import sandbox_manager

router = APIRouter(prefix="/blue-team", tags=["Blue Team Sandbox"])

@router.get("/rules", response_model=List[DefenseRuleResponse])
def list_defense_rules(db: Session = Depends(get_db)):
    """Fetch active Blue Team defense rules from database."""
    return db.query(DefenseRule).order_by(DefenseRule.id.asc()).all()

@router.post("/rules", response_model=DefenseRuleResponse)
def create_defense_rule(rule_in: DefenseRuleCreate, db: Session = Depends(get_db)):
    """Register a new defense rule in Blue Team guardrails."""
    rule = DefenseRule(
        name=rule_in.name,
        description=rule_in.description,
        category=rule_in.category,
        pattern=rule_in.pattern,
        action=rule_in.action,
        enabled=True,
        hits=0
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)

    # Also register in live in-memory blue team engine
    sandbox_manager.blue_team.add_defense_rule(
        name=rule.name,
        category=rule.category,
        pattern=rule.pattern,
        action=rule.action
    )
    return rule

@router.patch("/rules/{rule_id}/toggle", response_model=DefenseRuleResponse)
def toggle_defense_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(DefenseRule).filter(DefenseRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    rule.enabled = not rule.enabled
    db.commit()
    db.refresh(rule)

    # Sync with sandbox memory
    for r in sandbox_manager.blue_team.rules:
        if r.get("name") == rule.name:
            r["enabled"] = rule.enabled

    return rule

@router.post("/test-input")
def test_input_guardrail(prompt: str):
    """Test a prompt against Blue Team guardrails without calling LLM."""
    return sandbox_manager.blue_team.inspect_and_defend(prompt)

@router.get("/status")
def get_blue_sandbox_status():
    return sandbox_manager.blue_team.health_check()
