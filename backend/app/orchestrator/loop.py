import time
import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.sandboxes.manager import sandbox_manager
from backend.app.models.evaluation import Evaluation, AttackCategory, AttackSeverity
from backend.app.core.audit_chain import AuditChainEngine

class ContinuousOrchestrator:
    """
    Automated Attack -> Detect -> Defend -> Retest Loop Engine.
    Coordinates adversarial red team tests, vulnerability detection,
    blue team defense generation, and automated verification retesting.
    """

    @classmethod
    def run_cycle(
        cls,
        db: Session,
        attack_category: str = "JAILBREAK",
        technique: str = "DAN_JAILBREAK",
        custom_prompt: str = None,
        mutate: bool = False,
        actor: str = "orchestrator"
    ) -> Dict[str, Any]:
        cycle_id = f"cycle-{uuid.uuid4().hex[:8]}"
        start_time = time.time()
        steps: List[Dict[str, Any]] = []

        # ==========================================
        # STEP 1: ATTACK (Red Team Sandbox)
        # ==========================================
        if custom_prompt:
            attack_data = {
                "category": attack_category,
                "technique": technique,
                "prompt": custom_prompt,
                "mutated": mutate,
                "mutation_type": "CUSTOM_PAYLOAD"
            }
        else:
            attack_res = sandbox_manager.red_team.execute({
                "category": attack_category,
                "technique": technique,
                "mutate": mutate
            })
            attack_data = attack_res["payload"]

        steps.append({
            "step": 1,
            "phase": "ATTACK",
            "title": "Red Team Adversarial Payload Generation",
            "status": "COMPLETED",
            "details": {
                "category": attack_data["category"],
                "technique": attack_data["technique"],
                "prompt": attack_data["prompt"],
                "mutated": attack_data["mutated"],
                "mutation_type": attack_data.get("mutation_type")
            },
            "timestamp": time.time()
        })

        # ==========================================
        # STEP 2: DETECT (Baseline Model Evaluation)
        # ==========================================
        # Run against LLM without current patch to detect vulnerability
        baseline_eval = sandbox_manager.run_isolated_evaluation(
            db=db,
            prompt=attack_data["prompt"],
            attack_type=attack_data["technique"],
            category=attack_data["category"],
            severity="HIGH",
            bypass_blue_team=True, # Unshielded baseline to establish vulnerability
            actor=actor
        )

        # Save baseline evaluation to DB
        eval_record_baseline = Evaluation(
            test_id=baseline_eval["test_id"],
            name=f"Baseline: {attack_data['technique']}",
            status="COMPLETED",
            attack_type=attack_data["technique"],
            category=attack_data["category"],
            severity="HIGH",
            target_model=baseline_eval["target_model"],
            original_prompt=baseline_eval["original_prompt"],
            sanitized_prompt=baseline_eval["sanitized_prompt"],
            model_response=baseline_eval["model_response"],
            compromised=baseline_eval["compromised"],
            defense_triggered=baseline_eval["defense_triggered"],
            defense_rule_applied=baseline_eval["matched_rule"],
            latency_ms=baseline_eval["latency_ms"],
            cpu_percent=baseline_eval["cpu_percent"],
            memory_mb=baseline_eval["memory_mb"],
            side_channel_flag=baseline_eval["side_channel_analysis"]["is_suspicious"],
            is_retest=False,
            audit_block_hash=baseline_eval["audit_block_hash"]
        )
        db.add(eval_record_baseline)
        db.commit()
        db.refresh(eval_record_baseline)

        steps.append({
            "step": 2,
            "phase": "DETECT",
            "title": "Vulnerability Detection & Impact Assessment",
            "status": "COMPROMISED" if baseline_eval["compromised"] else "RESILIENT",
            "details": {
                "test_id": baseline_eval["test_id"],
                "model": baseline_eval["target_model"],
                "compromised": baseline_eval["compromised"],
                "model_response": baseline_eval["model_response"],
                "audit_block_hash": baseline_eval["audit_block_hash"]
            },
            "timestamp": time.time()
        })

        # ==========================================
        # STEP 3: DEFEND (Blue Team Auto-Patching)
        # ==========================================
        patch_info = None
        if baseline_eval["compromised"]:
            # Auto-synthesize defense patch
            patch_info = sandbox_manager.blue_team.synthesize_patch(
                vulnerability_pattern=attack_data["prompt"],
                attack_category=attack_data["category"]
            )
            defense_status = "PATCH_DEPLOYED"
        else:
            defense_status = "EXISTING_GUARDS_SUFFICIENT"

        steps.append({
            "step": 3,
            "phase": "DEFEND",
            "title": "Blue Team Autonomous Guardrail Synthesis",
            "status": defense_status,
            "details": {
                "action": "DYNAMIC_RULE_DEPLOYMENT" if patch_info else "NO_PATCH_REQUIRED",
                "patch": patch_info,
                "active_rules_total": len(sandbox_manager.blue_team.rules)
            },
            "timestamp": time.time()
        })

        # ==========================================
        # STEP 4: RETEST (Automated Retest Cycle)
        # ==========================================
        # Run exact same adversarial payload through updated Blue Team defenses
        retest_eval = sandbox_manager.run_isolated_evaluation(
            db=db,
            prompt=attack_data["prompt"],
            attack_type=attack_data["technique"],
            category=attack_data["category"],
            severity="HIGH",
            bypass_blue_team=False, # Now with Blue Team guards active!
            actor=actor
        )

        eval_record_retest = Evaluation(
            test_id=retest_eval["test_id"],
            name=f"Retest: {attack_data['technique']}",
            status="COMPLETED",
            attack_type=attack_data["technique"],
            category=attack_data["category"],
            severity="HIGH",
            target_model=retest_eval["target_model"],
            original_prompt=retest_eval["original_prompt"],
            sanitized_prompt=retest_eval["sanitized_prompt"],
            model_response=retest_eval["model_response"],
            compromised=retest_eval["compromised"],
            defense_triggered=retest_eval["defense_triggered"],
            defense_rule_applied=retest_eval["matched_rule"],
            latency_ms=retest_eval["latency_ms"],
            cpu_percent=retest_eval["cpu_percent"],
            memory_mb=retest_eval["memory_mb"],
            side_channel_flag=retest_eval["side_channel_analysis"]["is_suspicious"],
            is_retest=True,
            parent_eval_id=eval_record_baseline.id,
            audit_block_hash=retest_eval["audit_block_hash"]
        )
        db.add(eval_record_retest)
        db.commit()
        db.refresh(eval_record_retest)

        retest_success = not retest_eval["compromised"] and retest_eval["defense_triggered"]

        steps.append({
            "step": 4,
            "phase": "RETEST",
            "title": "Automated Safety Retest Verification",
            "status": "VULNERABILITY_REMEDIATED" if retest_success else ("BLOCKED" if not retest_eval["compromised"] else "STILL_VULNERABLE"),
            "details": {
                "test_id": retest_eval["test_id"],
                "defense_triggered": retest_eval["defense_triggered"],
                "defense_action": retest_eval["defense_action"],
                "matched_rule": retest_eval["matched_rule"],
                "model_response": retest_eval["model_response"],
                "audit_block_hash": retest_eval["audit_block_hash"],
                "retest_success": retest_success
            },
            "timestamp": time.time()
        })

        # Record summary to Audit Chain
        audit_block = AuditChainEngine.record_event(
            db=db,
            event_type="LOOP_CYCLE_COMPLETED",
            actor=actor,
            data_payload={
                "cycle_id": cycle_id,
                "technique": attack_data["technique"],
                "initial_compromise": baseline_eval["compromised"],
                "remediated": retest_success,
                "baseline_test_id": baseline_eval["test_id"],
                "retest_test_id": retest_eval["test_id"]
            }
        )

        total_duration_ms = (time.time() - start_time) * 1000

        return {
            "cycle_id": cycle_id,
            "total_duration_ms": round(total_duration_ms, 2),
            "remediated": retest_success,
            "summary": "Attack successfully detected, defended, and verified by retest." if retest_success else "Model resisted initial attack or defense in progress.",
            "steps": steps,
            "audit_hash": audit_block.block_hash
        }
