import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.limiter import limiter
from app.models import Candidate, Job, Run, get_db
from app.orchestrator import RecruitmentOrchestrator
from app.schemas import (
    PipelineAgentStatus,
    PipelineAnalysisRequest,
    PipelineAnalysisResponse,
    PipelineInterviewQuestion,
)

router = APIRouter(prefix="/pipeline", tags=["Pipeline"])

AGENT_ROLES = {
    "Sourcing": "Resume Parser & Semantic Embedder",
    "Screening": "Job-Candidate Matcher",
    "Interview": "Adaptive Question Generator",
    "Evaluation": "Scorecard Synthesizer",
    "Scheduling": "Calendar Coordinator",
    "Compliance": "Fair Hiring & Bias Guard",
}


@router.post("", response_model=PipelineAnalysisResponse)
@limiter.limit("3/minute")
def run_candidate_pipeline(
    payload: PipelineAnalysisRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    job = Job(
        title=payload.job_role.strip(),
        department="Hiring demo",
        location="Remote",
        type="Full-time",
        status="active",
        description=f"Candidate evaluation for {payload.job_role.strip()}.",
        requirements=payload.required_skills.strip() or "Role requirements provided by recruiter.",
        experience_level="Not specified",
    )
    db.add(job)
    db.flush()

    candidate = Candidate(
        name="Candidate",
        email=f"pipeline-{uuid.uuid4().hex}@example.com",
        role=payload.job_role.strip(),
        resume_text=payload.resume_text.strip(),
        job_id=job.id,
        status="applied",
    )
    db.add(candidate)
    db.flush()

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

    state = RecruitmentOrchestrator(db=db).execute_workflow(run_id=run.id)
    db.refresh(run)

    if state.get("status") == "failed":
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The scoring backend could not complete the candidate pipeline.",
        )
    if run.status == "blocked_compliance":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The Compliance agent blocked this candidate result for recruiter review.",
        )

    sourcing = state.get("sourcing_data")
    screening = state.get("screening_data")
    interview = state.get("interview_data")
    evaluation = state.get("evaluation_data")
    if not all((sourcing, screening, interview, evaluation)):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The scoring backend returned an incomplete pipeline result.",
        )

    step_statuses = {
        step.agent_name: "done" if step.status == "completed" else "blocked"
        for step in run.steps
    }
    agent_statuses = [
        PipelineAgentStatus(
            name=name,
            role=role,
            status=(
                "done"
                if name != "Compliance" or run.status == "paused_review"
                else "blocked"
            ),
        )
        for name, role in AGENT_ROLES.items()
    ]
    for agent in agent_statuses:
        if agent.name in step_statuses:
            agent.status = step_statuses[agent.name]

    score = int(evaluation.get("overall_score", 0))
    recommendation = str(evaluation.get("recommendation", ""))
    questions = [
        PipelineInterviewQuestion(
            category=str(question.get("category", "Interview")),
            question=str(question.get("question", "")),
            what_to_look_for=", ".join(question.get("desired_signals", [])),
        )
        for question in interview.get("questions", [])
        if question.get("question")
    ]

    return PipelineAnalysisResponse(
        candidate_name=str(sourcing.get("name") or "Candidate"),
        overall_score=score,
        screening_score=int(screening.get("match_score", 0)),
        recommendation=recommendation,
        experience_years=int(sourcing.get("experience_years", 0)),
        education=str(sourcing.get("education") or "Not specified"),
        matching_skills=[
            str(skill) for skill in sourcing.get("skills", []) if str(skill).strip()
        ],
        missing_skills=[str(gap) for gap in screening.get("gaps", [])],
        strengths=[str(strength) for strength in screening.get("strengths", [])],
        weaknesses=[str(gap) for gap in screening.get("gaps", [])],
        questions=questions,
        agents=agent_statuses,
    )
