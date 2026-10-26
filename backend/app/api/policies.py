from fastapi import APIRouter
from typing import List, Dict, Any
from backend.app.schemas.sandbox import PolicyEvaluationRequest, PolicyResponse
from backend.app.core.policy_engine import PolicyEngine

router = APIRouter(prefix="/policies", tags=["Zero-Trust Policies & OPA"])

@router.get("/", response_model=List[Dict[str, Any]])
def list_policies():
    """List active Zero-Trust security policies and Rego rules."""
    return PolicyEngine.list_policies()

@router.post("/evaluate")
def evaluate_policy_request(req: PolicyEvaluationRequest):
    """Evaluate an inter-workload network or capability request against OPA policies."""
    decision = PolicyEngine.evaluate(
        source=req.source,
        target=req.target,
        action=req.action,
        context={
            "prompt_length": req.prompt_length,
            "mediated_by_controller": req.mediated_by_controller
        }
    )
    return decision.model_dump()
