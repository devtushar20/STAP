import json
import logging
from typing import Dict, Any, List, Optional, TypedDict
from sqlalchemy.orm import Session
from app.models import SessionLocal, Run, RunStep, Candidate, Job
from app.audit import log_audit
from app.agents.sourcing import run_sourcing_agent, SourcingInput
from app.agents.screening import run_screening_agent, ScreeningInput
from app.agents.interview import run_interview_agent, InterviewInput
from app.agents.evaluation import run_evaluation_agent, EvaluationInput
from app.agents.scheduling import run_scheduling_agent, SchedulingInput
from app.agents.compliance import run_compliance_agent, ComplianceInput

logger = logging.getLogger("stap.orchestrator")


class OrchestratorState(TypedDict, total=False):
    run_id: str
    candidate_id: str
    job_id: str
    current_step: str
    status: str
    approval_status: str
    review_note: Optional[str]
    sourcing_data: Dict[str, Any]
    screening_data: Dict[str, Any]
    interview_data: Dict[str, Any]
    evaluation_data: Dict[str, Any]
    scheduling_data: Dict[str, Any]
    compliance_flags: List[Dict[str, Any]]
    error: Optional[str]


def save_step_progress(
    db: Session,
    run_id: str,
    agent_name: str,
    step_name: str,
    output_dict: Dict[str, Any],
    compliance_result: Any,
) -> RunStep:
    step = RunStep(
        run_id=run_id,
        agent_name=agent_name,
        step_name=step_name,
        output_data=json.dumps(output_dict),
        status="completed" if not compliance_result.flagged else "flagged",
        compliance_flagged=compliance_result.flagged,
        compliance_note=compliance_result.recommendation if compliance_result.flagged else None,
    )
    db.add(step)
    db.commit()
    db.refresh(step)
    return step


class RecruitmentOrchestrator:
    """
    LangGraph-based Orchestrator coordinating the 6 agents:
    Sourcing -> Compliance -> Screening -> Compliance -> Interview -> Compliance ->
    Evaluation -> Compliance -> Scheduling -> Compliance -> Human Review -> Final Decision.
    """

    def __init__(self, db: Session):
        self.db = db

    def execute_workflow(self, run_id: str, resume_from_review: bool = False, review_decision: Optional[str] = None, review_note: Optional[str] = None) -> OrchestratorState:
        run = self.db.query(Run).filter(Run.id == run_id).first()
        if not run:
            raise ValueError(f"Run {run_id} not found")

        candidate = self.db.query(Candidate).filter(Candidate.id == run.candidate_id).first()
        job = self.db.query(Job).filter(Job.id == run.job_id).first()
        if not candidate or not job:
            raise ValueError("Candidate or Job not found for run")

        state: OrchestratorState = {
            "run_id": run.id,
            "candidate_id": candidate.id,
            "job_id": job.id,
            "current_step": run.current_step,
            "status": run.status,
            "approval_status": run.approval_status,
            "compliance_flags": [],
        }

        # If resuming from human review
        if resume_from_review:
            log_audit(
                db=self.db,
                run_id=run.id,
                who="Recruiter (Human in the Loop)",
                action=f"REVIEW_DECISION_{review_decision.upper()}",
                details={"note": review_note, "decision": review_decision}
            )

            run.approval_status = review_decision
            run.review_note = review_note
            if review_decision == "approve":
                run.status = "approved"
                candidate.status = "offer"
            else:
                run.status = "rejected"
                candidate.status = "rejected"

            run.current_step = "Completed"
            self.db.commit()
            self.db.refresh(run)

            state["status"] = run.status
            state["approval_status"] = run.approval_status
            state["current_step"] = "Completed"
            return state

        # Step 1: Sourcing
        try:
            run.current_step = "Sourcing"
            self.db.commit()

            sourcing_input = SourcingInput(
                resume_text=candidate.resume_text,
                candidate_id=candidate.id,
            )
            sourcing_out = run_sourcing_agent(sourcing_input, db=self.db, run_id=run.id)
            state["sourcing_data"] = sourcing_out.model_dump()

            # Update candidate extracted profile
            candidate.name = sourcing_out.name or candidate.name
            candidate.skills = ", ".join(sourcing_out.skills)
            candidate.experience_years = sourcing_out.experience_years
            self.db.commit()

            # Compliance check after Sourcing
            comp_res = run_compliance_agent(
                ComplianceInput(step_name="Sourcing", target_text=f"{sourcing_out.summary} {sourcing_out.education}"),
                db=self.db,
                run_id=run.id
            )
            save_step_progress(self.db, run.id, "Sourcing", "Parse and Embed Resume", state["sourcing_data"], comp_res)
            if comp_res.flagged:
                state["compliance_flags"].append({"step": "Sourcing", "issues": comp_res.issues})
                run.status = "blocked_compliance"
                self.db.commit()
                return state

            # Step 2: Screening
            run.current_step = "Screening"
            self.db.commit()

            screening_input = ScreeningInput(
                candidate_id=candidate.id,
                candidate_name=candidate.name,
                resume_text=candidate.resume_text or sourcing_out.raw_text,
                skills=sourcing_out.skills,
                job_id=job.id,
                job_title=job.title,
                job_description=job.description,
                job_requirements=job.requirements,
            )
            screening_out = run_screening_agent(screening_input, db=self.db, run_id=run.id)
            state["screening_data"] = screening_out.model_dump()

            candidate.match_percent = screening_out.match_score
            candidate.status = "screening"
            self.db.commit()

            # Compliance check after Screening
            comp_res = run_compliance_agent(
                ComplianceInput(step_name="Screening", target_text=f"{screening_out.reason} {' '.join(screening_out.gaps)}"),
                db=self.db,
                run_id=run.id
            )
            save_step_progress(self.db, run.id, "Screening", "Match and Rubric Evaluation", state["screening_data"], comp_res)
            if comp_res.flagged:
                state["compliance_flags"].append({"step": "Screening", "issues": comp_res.issues})
                run.status = "blocked_compliance"
                self.db.commit()
                return state

            # Step 3: Interview
            run.current_step = "Interview"
            self.db.commit()

            interview_input = InterviewInput(
                candidate_id=candidate.id,
                role=job.title,
                skills=sourcing_out.skills,
                experience_years=sourcing_out.experience_years,
            )
            interview_out = run_interview_agent(interview_input, db=self.db, run_id=run.id)
            state["interview_data"] = interview_out.model_dump()
            candidate.status = "interview"
            self.db.commit()

            # Compliance check after Interview
            interview_summary_text = " ".join([q.question for q in interview_out.questions])
            comp_res = run_compliance_agent(
                ComplianceInput(step_name="Interview", target_text=interview_summary_text),
                db=self.db,
                run_id=run.id
            )
            save_step_progress(self.db, run.id, "Interview", "Adaptive Interview Generation", state["interview_data"], comp_res)
            if comp_res.flagged:
                state["compliance_flags"].append({"step": "Interview", "issues": comp_res.issues})
                run.status = "blocked_compliance"
                self.db.commit()
                return state

            # Step 4: Evaluation
            run.current_step = "Evaluation"
            self.db.commit()

            eval_input = EvaluationInput(
                candidate_id=candidate.id,
                role=job.title,
                interview_records=interview_out.recorded_answers,
            )
            eval_out = run_evaluation_agent(eval_input, db=self.db, run_id=run.id)
            state["evaluation_data"] = eval_out.model_dump()
            candidate.status = "evaluation"
            self.db.commit()

            # Compliance check after Evaluation
            comp_res = run_compliance_agent(
                ComplianceInput(step_name="Evaluation", target_text=f"{eval_out.summary} {eval_out.recommendation}"),
                db=self.db,
                run_id=run.id
            )
            save_step_progress(self.db, run.id, "Evaluation", "Scorecard and Synthesis", state["evaluation_data"], comp_res)
            if comp_res.flagged:
                state["compliance_flags"].append({"step": "Evaluation", "issues": comp_res.issues})
                run.status = "blocked_compliance"
                self.db.commit()
                return state

            # Step 5: Scheduling
            run.current_step = "Scheduling"
            self.db.commit()

            sched_input = SchedulingInput(
                candidate_id=candidate.id,
                candidate_name=candidate.name,
                candidate_email=candidate.email,
                role=job.title,
            )
            sched_out = run_scheduling_agent(sched_input, db=self.db, run_id=run.id)
            state["scheduling_data"] = sched_out.model_dump()

            # Compliance check after Scheduling
            comp_res = run_compliance_agent(
                ComplianceInput(step_name="Scheduling", target_text=sched_out.note),
                db=self.db,
                run_id=run.id
            )
            save_step_progress(self.db, run.id, "Scheduling", "Calendar Slot Generation", state["scheduling_data"], comp_res)

            # Node 6: Human Review (Paused)
            # The workflow intentionally pauses until recruiter approval/rejection
            run.current_step = "Human Review"
            run.status = "paused_review"
            self.db.commit()

            state["current_step"] = "Human Review"
            state["status"] = "paused_review"

            log_audit(
                db=self.db,
                run_id=run.id,
                who="Orchestrator",
                action="PAUSE_FOR_HUMAN_REVIEW",
                details={
                    "candidate_id": candidate.id,
                    "overall_score": eval_out.overall_score,
                    "recommendation": eval_out.recommendation,
                    "status": "awaiting_recruiter_decision"
                }
            )

            return state

        except Exception as e:
            logger.exception("Error executing orchestrator workflow")
            run.status = "failed"
            self.db.commit()
            state["status"] = "failed"
            state["error"] = str(e)
            return state

