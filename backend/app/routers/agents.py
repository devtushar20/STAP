from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models import get_db, User
from app.auth_util import get_current_user

router = APIRouter(prefix="/agents", tags=["Agents"])

AGENT_DEFINITIONS = [
    {
        "name": "Sourcing",
        "role": "Resume Parser & Semantic Embedder",
        "description": "Parses candidate resumes (PDF/Text) into structured fields and indexes semantic representations in ChromaDB.",
        "status": "active"
    },
    {
        "name": "Screening",
        "role": "Job-Candidate Matcher",
        "description": "Compares candidate profiles with job requirements using embedding similarity and an objective LLM rubric.",
        "status": "active"
    },
    {
        "name": "Interview",
        "role": "Adaptive Question Generator",
        "description": "Formulates tailored technical and architectural interview questions and captures answers.",
        "status": "active"
    },
    {
        "name": "Evaluation",
        "role": "Scorecard Synthesizer",
        "description": "Aggregates interview responses into merit-based scorecards across technical mastery, communication, and team fit.",
        "status": "active"
    },
    {
        "name": "Scheduling",
        "role": "Calendar Coordinator",
        "description": "Proposes conflict-free interview time slots from mock availability calendars.",
        "status": "idle"
    },
    {
        "name": "Compliance",
        "role": "Fair Hiring & Bias Guard",
        "description": "Monitors all agent outputs for demographic bias or unfair proxies, blocking violations until human review.",
        "status": "active"
    }
]


@router.get("", response_model=List[Dict[str, Any]])
def list_agents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return AGENT_DEFINITIONS

