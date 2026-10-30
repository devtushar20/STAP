from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models import get_db, Job, User
from app.schemas import JobCreate, JobResponse
from app.vector import vector_store
from app.audit import log_audit
from app.auth_util import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("", response_model=List[JobResponse])
def list_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Job).all()


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    payload: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = Job(
        title=payload.title,
        department=payload.department,
        location=payload.location,
        type=payload.type,
        status="active",
        description=payload.description,
        requirements=payload.requirements,
        experience_level=payload.experience_level,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Index in vector store
    job_text = f"{job.title}\n{job.description}\n{job.requirements}"
    vector_store.store_job(
        job_id=job.id,
        job_text=job_text,
        metadata={"title": job.title, "department": job.department}
    )

    log_audit(
        db=db,
        who=current_user.email,
        action="CREATE_JOB",
        details={"job_id": job.id, "title": job.title}
    )

    return job

