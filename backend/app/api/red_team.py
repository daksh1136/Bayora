from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models.evaluation import AttackScenario
from backend.app.schemas.evaluation import AttackScenarioResponse
from backend.app.sandboxes.manager import sandbox_manager

router = APIRouter(prefix="/red-team", tags=["Red Team Sandbox"])

@router.get("/scenarios", response_model=List[AttackScenarioResponse])
def list_scenarios(db: Session = Depends(get_db)):
    return db.query(AttackScenario).order_by(AttackScenario.id.asc()).all()

@router.post("/generate")
def generate_attack_payload(
    category: str = "JAILBREAK",
    technique: str = "DAN_JAILBREAK",
    mutate: bool = False
):
    """Generate an adversarial payload inside the isolated Red Team sandbox."""
    res = sandbox_manager.red_team.execute({
        "category": category,
        "technique": technique,
        "mutate": mutate
    })
    return res["payload"]

@router.get("/templates")
def list_attack_templates():
    """List available adversarial attack templates."""
    return sandbox_manager.red_team.ATTACK_TEMPLATES

@router.get("/status")
def get_red_sandbox_status():
    return sandbox_manager.red_team.health_check()
