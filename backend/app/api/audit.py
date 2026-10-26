import hashlib
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models.audit import AuditBlock
from backend.app.schemas.audit import AuditBlockResponse, AuditVerifyResponse, AuditTamperRequest
from backend.app.core.audit_chain import AuditChainEngine

router = APIRouter(prefix="/audit", tags=["Cryptographic Audit Chain"])

@router.get("/blocks", response_model=List[AuditBlockResponse])
def get_audit_blocks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Fetch chronological blocks of the SHA-256 Hash Chain."""
    return db.query(AuditBlock).order_by(AuditBlock.block_index.asc()).offset(skip).limit(limit).all()

@router.post("/verify", response_model=AuditVerifyResponse)
def verify_audit_chain(db: Session = Depends(get_db)):
    """
    Cryptographically verify the entire SHA-256 Hash Chain from genesis to tip.
    Validates sequential indices, previous hash links, payload digests, and block hashes.
    """
    result = AuditChainEngine.verify_chain(db)
    return result

@router.post("/tamper-simulate")
def simulate_tampering(req: AuditTamperRequest, db: Session = Depends(get_db)):
    """
    Tamper Demonstration Endpoint:
    Directly mutates the payload of a block in the database without updating its hash.
    Used to demonstrate that Bayora's cryptographic verification detects tampering immediately!
    """
    block = db.query(AuditBlock).filter(AuditBlock.block_index == req.block_index).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block index not found")

    block.data_payload = req.tampered_payload
    db.commit()

    return {
        "message": f"Block #{req.block_index} data_payload was tampered with in DB.",
        "block_index": req.block_index,
        "tampered_payload": req.tampered_payload,
        "instruction": "Run POST /api/v1/audit/verify to see the cryptographic integrity violation detected!"
    }

@router.post("/restore")
def restore_chain(db: Session = Depends(get_db)):
    """Recompute all hashes and signatures to restore chain integrity if tampered for demo."""
    blocks = db.query(AuditBlock).order_by(AuditBlock.block_index.asc()).all()
    prev_hash = AuditChainEngine.GENESIS_PREV_HASH

    for block in blocks:
        block.prev_hash = prev_hash
        block.payload_hash = hashlib.sha256(block.data_payload.encode("utf-8")).hexdigest()
        block.block_hash = AuditChainEngine.compute_block_hash(
            block_index=block.block_index,
            timestamp_str=block.timestamp.isoformat(),
            event_type=block.event_type,
            actor=block.actor,
            payload_hash=block.payload_hash,
            prev_hash=block.prev_hash
        )
        block.signature = AuditChainEngine.compute_signature(block.block_hash)
        prev_hash = block.block_hash

    db.commit()
    return {"message": "Audit chain hashes successfully recalculated and restored to valid state."}
