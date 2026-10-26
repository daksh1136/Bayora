from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models.evaluation import Evaluation
from backend.app.schemas.evaluation import RunEvaluationRequest, EvaluationResponse, LoopRunRequest
from backend.app.sandboxes.manager import sandbox_manager
from backend.app.orchestrator.loop import ContinuousOrchestrator
from backend.app.core.security import get_current_user_payload, require_role

router = APIRouter(prefix="/evaluations", tags=["Evaluations & Loop"])

@router.post("/run", response_model=EvaluationResponse)
def run_evaluation(
    req: RunEvaluationRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_payload)
):
    """Run an isolated adversarial test through the zero-trust pipeline."""
    res = sandbox_manager.run_isolated_evaluation(
        db=db,
        prompt=req.prompt,
        attack_type=req.attack_type,
        category=req.category,
        severity=req.severity,
        bypass_blue_team=req.bypass_blue_team,
        actor=user.get("username", "operator")
    )

    if res.get("status") == "BLOCKED_BY_POLICY":
        raise HTTPException(
            status_code=403,
            detail=f"Zero-Trust Policy Blocked: {res['policy_decision']['reason']}"
        )

    # Persist evaluation record
    eval_record = Evaluation(
        test_id=res["test_id"],
        name=req.name or f"Test-{res['test_id']}",
        status="COMPLETED",
        attack_type=res["attack_type"],
        category=res["category"],
        severity=res["severity"],
        target_model=res["target_model"],
        original_prompt=res["original_prompt"],
        sanitized_prompt=res["sanitized_prompt"],
        model_response=res["model_response"],
        compromised=res["compromised"],
        defense_triggered=res["defense_triggered"],
        defense_rule_applied=res["matched_rule"],
        latency_ms=res["latency_ms"],
        cpu_percent=res["cpu_percent"],
        memory_mb=res["memory_mb"],
        side_channel_flag=res["side_channel_analysis"]["is_suspicious"],
        is_retest=False,
        audit_block_hash=res["audit_block_hash"]
    )
    db.add(eval_record)
    db.commit()
    db.refresh(eval_record)
    return eval_record

@router.post("/continuous-loop")
def run_continuous_loop(
    req: LoopRunRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_payload)
):
    """
    Executes the continuous Attack -> Detect -> Defend -> Retest cycle:
    1. Attack (Red Team Sandbox)
    2. Detect (Baseline Vulnerability Assessment)
    3. Defend (Autonomous Blue Team Guardrail Patching)
    4. Retest (Remediation Verification)
    5. Audit (SHA-256 Hash Chain Record)
    """
    result = ContinuousOrchestrator.run_cycle(
        db=db,
        attack_category=req.attack_category,
        technique=req.technique,
        custom_prompt=req.custom_prompt,
        mutate=req.mutate,
        actor=user.get("username", "orchestrator")
    )
    return result

@router.get("/", response_model=List[EvaluationResponse])
def list_evaluations(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    compromised: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """List historical evaluation runs."""
    query = db.query(Evaluation)
    if category:
        query = query.filter(Evaluation.category == category)
    if compromised is not None:
        query = query.filter(Evaluation.compromised == compromised)
    return query.order_by(Evaluation.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{eval_id}", response_model=EvaluationResponse)
def get_evaluation(eval_id: int, db: Session = Depends(get_db)):
    ev = db.query(Evaluation).filter(Evaluation.id == eval_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return ev
