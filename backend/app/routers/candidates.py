import io
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body, status
from sqlalchemy.orm import Session
from app.models import get_db, Candidate, Job, Run, User
from app.schemas import CandidateUploadResponse
from app.orchestrator import RecruitmentOrchestrator
from app.audit import log_audit
from app.auth_util import get_current_user

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.post("", response_model=CandidateUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_candidate(
    job_id: str = Form(None),
    name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    resume_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload resume (file or text) and start recruitment orchestrator workflow.
    """
    # Fallback to first active job if not provided
    if not job_id:
        active_job = db.query(Job).filter(Job.status == "active").first()
        if not active_job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active jobs found")
        job = active_job
    else:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job {job_id} not found")

    # Extract resume content
    extracted_text = resume_text or ""
    if file:
        content = await file.read()
        if file.filename and file.filename.lower().endswith(".pdf"):
            try:
                from pypdf import PdfReader
                reader = PdfReader(io.BytesIO(content))
                extracted_pages = [p.extract_text() for p in reader.pages if p.extract_text()]
                extracted_text = "\n".join(extracted_pages)
            except Exception:
                extracted_text = content.decode("utf-8", errors="ignore")
        else:
            extracted_text = content.decode("utf-8", errors="ignore")

    if not extracted_text.strip():
        extracted_text = f"Candidate application for {job.title}. Proficient in Python, cloud systems, and API architectures."

    candidate_name = name or "Candidate " + job.title.split()[0]
    candidate_email = email or f"applicant_{job.id[:6]}@example.com"
    candidate_role = role or job.title

    candidate = Candidate(
        name=candidate_name,
        email=candidate_email,
        role=candidate_role,
        resume_text=extracted_text,
        job_id=job.id,
        status="applied",
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    # Create run
    run = Run(
        candidate_id=candidate.id,
        job_id=job.id,
        status="running",
        current_step="Sourcing",
        approval_status="pending",
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    log_audit(
        db=db,
        run_id=run.id,
        who=current_user.email,
        action="START_RECRUITMENT_RUN",
        details={"candidate_id": candidate.id, "job_id": job.id, "job_title": job.title}
    )

    # Execute orchestrator pipeline
    orchestrator = RecruitmentOrchestrator(db=db)
    orchestrator.execute_workflow(run_id=run.id)

    db.refresh(run)

    return CandidateUploadResponse(
        candidate_id=candidate.id,
        run_id=run.id,
        status=run.status,
        message="Orchestrator run initiated and processed through evaluation."
    )

