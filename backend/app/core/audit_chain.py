import hashlib
import json
import hmac
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple, Optional
from sqlalchemy.orm import Session
from backend.app.models.audit import AuditBlock
from backend.app.config import settings

class AuditChainEngine:
    """
    Cryptographic SHA-256 Hash Chain Manager.
    Implements a tamper-evident, verifiable log of all evaluations, attacks, and security events.
    """
    GENESIS_PREV_HASH = "0" * 64

    @staticmethod
    def canonical_json(data: Any) -> str:
        """Produce deterministic canonical JSON string."""
        return json.dumps(data, sort_keys=True, separators=(',', ':'))

    @classmethod
    def compute_payload_hash(cls, payload: Dict[str, Any]) -> str:
        """Compute SHA-256 hash of arbitrary payload data."""
        canonical = cls.canonical_json(payload)
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    @classmethod
    def compute_block_hash(
        cls,
        block_index: int,
        timestamp_str: str,
        event_type: str,
        actor: str,
        payload_hash: str,
        prev_hash: str
    ) -> str:
        """
        Compute SHA-256 block hash over all block components.
        block_hash = SHA256(index | timestamp | event_type | actor | payload_hash | prev_hash)
        """
        raw = f"{block_index}|{timestamp_str}|{event_type}|{actor}|{payload_hash}|{prev_hash}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    @classmethod
    def compute_signature(cls, block_hash: str) -> str:
        """Generate HMAC-SHA256 signature using system secret key for non-repudiation."""
        return hmac.new(
            settings.SECRET_KEY.encode("utf-8"),
            block_hash.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

    @classmethod
    def record_event(
        cls,
        db: Session,
        event_type: str,
        actor: str,
        data_payload: Dict[str, Any]
    ) -> AuditBlock:
        """
        Append a new tamper-evident event block to the SHA-256 hash chain.
        """
        # Get the latest block to obtain prev_hash and next index
        latest_block = db.query(AuditBlock).order_by(AuditBlock.block_index.desc()).first()
        
        if latest_block is None:
            block_index = 0
            prev_hash = cls.GENESIS_PREV_HASH
        else:
            block_index = latest_block.block_index + 1
            prev_hash = latest_block.block_hash

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        timestamp_str = now.isoformat()
        
        canonical_payload_str = cls.canonical_json(data_payload)
        payload_hash = hashlib.sha256(canonical_payload_str.encode("utf-8")).hexdigest()
        
        block_hash = cls.compute_block_hash(
            block_index=block_index,
            timestamp_str=timestamp_str,
            event_type=event_type,
            actor=actor,
            payload_hash=payload_hash,
            prev_hash=prev_hash
        )
        
        signature = cls.compute_signature(block_hash)

        block = AuditBlock(
            block_index=block_index,
            timestamp=now,
            event_type=event_type,
            actor=actor,
            data_payload=canonical_payload_str,
            payload_hash=payload_hash,
            prev_hash=prev_hash,
            block_hash=block_hash,
            signature=signature,
            verified=True
        )

        db.add(block)
        db.commit()
        db.refresh(block)
        return block

    @classmethod
    def verify_chain(cls, db: Session) -> Dict[str, Any]:
        """
        Cryptographically verify the integrity of the entire audit chain.
        Returns a verification report:
        - valid: True if all hashes, links, and signatures match
        - total_blocks: total count of verified blocks
        - broken_index: index of first corrupted block if tampered, else None
        - details: diagnostic explanation
        """
        blocks = db.query(AuditBlock).order_by(AuditBlock.block_index.asc()).all()

        if not blocks:
            return {
                "valid": True,
                "total_blocks": 0,
                "broken_index": None,
                "details": "Audit chain is empty. No blocks to verify."
            }

        prev_hash = cls.GENESIS_PREV_HASH

        for idx, block in enumerate(blocks):
            # Check 1: Sequential index
            if block.block_index != idx:
                return {
                    "valid": False,
                    "total_blocks": len(blocks),
                    "broken_index": block.block_index,
                    "details": f"Index gap detected: Expected {idx}, got {block.block_index}"
                }

            # Check 2: Previous hash link
            if block.prev_hash != prev_hash:
                return {
                    "valid": False,
                    "total_blocks": len(blocks),
                    "broken_index": block.block_index,
                    "details": f"Broken link at block #{block.block_index}. Stored prev_hash does not match previous block hash."
                }

            # Check 3: Payload hash integrity
            calculated_payload_hash = hashlib.sha256(block.data_payload.encode("utf-8")).hexdigest()
            if calculated_payload_hash != block.payload_hash:
                return {
                    "valid": False,
                    "total_blocks": len(blocks),
                    "broken_index": block.block_index,
                    "details": f"Payload tampering detected at block #{block.block_index}. Hash mismatch."
                }

            # Check 4: Block hash recalculation
            timestamp_str = block.timestamp.isoformat()
            recalculated_block_hash = cls.compute_block_hash(
                block_index=block.block_index,
                timestamp_str=timestamp_str,
                event_type=block.event_type,
                actor=block.actor,
                payload_hash=block.payload_hash,
                prev_hash=block.prev_hash
            )
            if recalculated_block_hash != block.block_hash:
                return {
                    "valid": False,
                    "total_blocks": len(blocks),
                    "broken_index": block.block_index,
                    "details": f"Block hash tampering detected at block #{block.block_index}."
                }

            # Check 5: Non-repudiation signature
            expected_sig = cls.compute_signature(block.block_hash)
            if block.signature != expected_sig:
                return {
                    "valid": False,
                    "total_blocks": len(blocks),
                    "broken_index": block.block_index,
                    "details": f"Invalid cryptographic signature at block #{block.block_index}."
                }

            prev_hash = block.block_hash

        return {
            "valid": True,
            "total_blocks": len(blocks),
            "broken_index": None,
            "latest_hash": prev_hash,
            "details": f"All {len(blocks)} blocks successfully verified. Chain is intact and tamper-free."
        }

    @classmethod
    def compute_merkle_root(cls, block_hashes: List[str]) -> str:
        """Compute Merkle Tree root hash over a list of block hashes."""
        if not block_hashes:
            return cls.GENESIS_PREV_HASH
        current_layer = list(block_hashes)
        while len(current_layer) > 1:
            if len(current_layer) % 2 != 0:
                current_layer.append(current_layer[-1])
            next_layer = []
            for i in range(0, len(current_layer), 2):
                combined = current_layer[i] + current_layer[i+1]
                h = hashlib.sha256(combined.encode("utf-8")).hexdigest()
                next_layer.append(h)
            current_layer = next_layer
        return current_layer[0]
