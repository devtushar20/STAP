from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session
from app.models import get_db, User
from app.schemas import LoginRequest, TokenResponse, UserProfile
from app.auth_util import verify_password, create_access_token
from app.audit import log_audit
from app.limiter import limiter
from app.config import get_settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()


@router.post("/login", response_model=TokenResponse)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
def login(
    request: Request,
    payload: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        log_audit(
            db=db,
            who=payload.email,
            action="LOGIN_FAILED",
            details="Invalid credentials attempt"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )

    log_audit(
        db=db,
        who=user.email,
        action="LOGIN_SUCCESS",
        details={"role": user.role}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserProfile(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
        )
    )

