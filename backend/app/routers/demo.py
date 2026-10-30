from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from app.models import get_db, DemoRequest
from app.schemas import DemoRequestCreate, DemoRequestResponse
from app.audit import log_audit
from app.limiter import limiter
from app.config import get_settings

router = APIRouter(tags=["Demo Requests"])
settings = get_settings()


@router.post("/demo-requests", response_model=DemoRequestResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_DEMO)
def create_demo_request(
    request: Request,
    payload: DemoRequestCreate,
    db: Session = Depends(get_db)
):
    demo = DemoRequest(
        name=payload.name,
        email=payload.email,
        company=payload.company,
        team_size=payload.team_size,
        message=payload.message,
    )
    db.add(demo)
    db.commit()
    db.refresh(demo)

    log_audit(
        db=db,
        who=payload.email,
        action="SUBMIT_DEMO_REQUEST",
        details={"company": payload.company, "team_size": payload.team_size}
    )

    return DemoRequestResponse(id=demo.id)

