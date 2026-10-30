import json
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models import get_db, Run, RunStep, User
from app.schemas import RunDetailResponse, RunStepResponse, RunReviewRequest, RunReviewResponse
from app.orchestrator import RecruitmentOrchestrator
from app.auth_util import get_current_user

router = APIRouter(prefix="/runs", tags=["Runs & Orchestration"])


@router.get("/{run_id}", response_model=RunDetailResponse)
def get_run_details(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Run {run_id} not found")

    steps = db.query(RunStep).filter(RunStep.run_id == run_id).order_by(RunStep.created_at.asc()).all()

    agent_outputs: Dict[str, Any] = {}
    compliance_flags: List[Dict[str, Any]] = []

    for s in steps:
        if s.output_data:
            try:
                agent_outputs[s.agent_name.lower()] = json.loads(s.output_data)
            except Exception:
                agent_outputs[s.agent_name.lower()] = s.output_data

        if s.compliance_flagged:
            compliance_flags.append({
                "step_name": s.step_name,
                "agent_name": s.agent_name,
                "note": s.compliance_note,
            })

    step_responses = [
        RunStepResponse(
            id=s.id,
            agent_name=s.agent_name,
            step_name=s.step_name,
            status=s.status,
            compliance_flagged=s.compliance_flagged,
            compliance_note=s.compliance_note,
            output_data=s.output_data,
            created_at=s.created_at,
        )
        for s in steps
    ]

    return RunDetailResponse(
        run_id=run.id,
        candidate_id=run.candidate_id,
        job_id=run.job_id,
        status=run.status,
        current_step=run.current_step,
        approval_status=run.approval_status,
        review_note=run.review_note,
        created_at=run.created_at,
        updated_at=run.updated_at,
        steps=step_responses,
        agent_outputs=agent_outputs,
        compliance_flags=compliance_flags,
    )


@router.post("/{run_id}/review", response_model=RunReviewResponse)
def review_run(
    run_id: str,
    payload: RunReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Run {run_id} not found")

    if run.status not in ["paused_review", "blocked_compliance", "running"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Run is in '{run.status}' state and cannot be reviewed."
        )

    run.reviewer_id = current_user.id
    db.commit()

    orchestrator = RecruitmentOrchestrator(db=db)
    result = orchestrator.execute_workflow(
        run_id=run.id,
        resume_from_review=True,
        review_decision=payload.action,
        review_note=payload.note or "",
    )

    return RunReviewResponse(
        run_id=run.id,
        status=result["status"],
        approval_status=result["approval_status"],
        message=f"Run decision '{payload.action}' recorded successfully by {current_user.email}."
    )

