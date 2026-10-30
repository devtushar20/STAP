from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.models import get_db, AuditLog, User
from app.schemas import AuditEntry
from app.auth_util import get_current_user

router = APIRouter(prefix="/audit", tags=["Audit Log"])


@router.get("", response_model=List[AuditEntry])
def get_audit_trail(
    run_id: Optional[str] = Query(None, description="Filter audit logs by run_id"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(AuditLog)
    if run_id:
        query = query.filter(AuditLog.run_id == run_id)
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs

