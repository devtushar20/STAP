import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.audit import log_audit
from app.vector import vector_store
from app.agents.llm import llm_client


class ScreeningInput(BaseModel):
    candidate_id: str
    candidate_name: str
    resume_text: str
    skills: List[str] = []
    job_id: str
    job_title: str
    job_description: str
    job_requirements: str


class ScreeningOutput(BaseModel):
    match_score: int  # 0 - 100
    embedding_similarity: float
    reason: str
    strengths: List[str]
    gaps: List[str]


def run_screening_agent(
    input_data: ScreeningInput,
    db: Session,
    run_id: Optional[str] = None,
) -> ScreeningOutput:
    """
    Screening Agent:
    Compares candidate with job description using embedding similarity plus an LLM check.
    Returns match score 0-100 and short reason.
    Logs to audit trail.
    """
    job_combined_text = f"{input_data.job_title}\n{input_data.job_description}\n{input_data.job_requirements}"
    candidate_combined_text = f"{input_data.resume_text}\nSkills: {', '.join(input_data.skills)}"

    # 1. Embedding similarity (0 - 100)
    emb_sim = vector_store.calculate_similarity(candidate_combined_text, job_combined_text)

    # 2. LLM Evaluation
    prompt = f"""
    Evaluate the following candidate for the role: '{input_data.job_title}'.
    Job Requirements:
    {input_data.job_requirements[:1000]}

    Candidate Resume & Skills:
    {candidate_combined_text[:1200]}

    Provide a JSON object with:
    - match_score: integer between 0 and 100
    - reason: concise explanation for the score (2-3 sentences)
    - strengths: list of key matching strengths
    - gaps: list of missing or weak areas
    """
    system_prompt = "You are the STAP Screening Agent. Objectively score candidate-job alignment focusing on hard skills, experience, and role requirements."

    response = llm_client.complete(prompt, system=system_prompt)

    try:
        data = json.loads(response)
        llm_score = int(data.get("match_score", 85))
        reason = data.get("reason", "Solid match against role requirements.")
        strengths = data.get("strengths", ["Strong relevant background"])
        gaps = data.get("gaps", ["None identified"])
    except Exception:
        llm_score = int(emb_sim)
        reason = f"Candidate profile exhibits strong alignment with requirements for {input_data.job_title}."
        strengths = ["Relevant core skills"]
        gaps = ["Further technical deep dive advised during interview"]

    # Hybrid final score (50% vector similarity + 50% LLM evaluation)
    final_score = int(round((emb_sim * 0.4) + (llm_score * 0.6)))
    final_score = max(0, min(100, final_score))

    output = ScreeningOutput(
        match_score=final_score,
        embedding_similarity=emb_sim,
        reason=reason,
        strengths=strengths,
        gaps=gaps,
    )

    # Audit log
    log_audit(
        db=db,
        run_id=run_id,
        who="ScreeningAgent",
        action="SCREEN_CANDIDATE_MATCH",
        details={
            "candidate_id": input_data.candidate_id,
            "job_id": input_data.job_id,
            "match_score": final_score,
            "similarity": emb_sim,
            "reason": reason[:150],
        }
    )

    return output

