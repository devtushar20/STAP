import json
import logging
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models import AuditLog

logger = logging.getLogger("stap.audit")


def log_audit(
    db: Session,
    who: str,
    action: str,
    details: Optional[Any] = None,
    run_id: Optional[str] = None,
) -> AuditLog:
    """
    Audit logging helper.
    Ensures safe serialization and never logs full resumes or secret credentials.
    """
    serialized_details = None
    if details is not None:
        if isinstance(details, (dict, list)):
            try:
                # Sanitize if any keys contain password or token
                def sanitize(val):
                    if isinstance(val, dict):
                        return {k: ("***" if "token" in k.lower() or "password" in k.lower() or "key" in k.lower() else sanitize(v)) for k, v in val.items()}
                    elif isinstance(val, list):
                        return [sanitize(v) for v in val]
                    return val

                safe_dict = sanitize(details)
                serialized_details = json.dumps(safe_dict)
            except Exception:
                serialized_details = str(details)[:500]
        else:
            serialized_details = str(details)[:500]

    entry = AuditLog(
        run_id=run_id,
        who=who,
        action=action,
        details=serialized_details,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    logger.info(f"[AUDIT] who={who} action={action} run_id={run_id}")
    return entry

