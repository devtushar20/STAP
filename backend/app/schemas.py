import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ==========================================
# Demo Requests
# ==========================================
class DemoRequestCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    company: str = Field(..., min_length=1, max_length=100)
    team_size: str = Field(..., min_length=1, max_length=50)
    message: Optional[str] = None


class DemoRequestResponse(BaseModel):
    id: str


# ==========================================
# Auth
# ==========================================
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


# ==========================================
# Dashboard
# ==========================================
class DashboardSummaryResponse(BaseModel):
    active_jobs: int
    candidates: int
    shortlisted: int
    interviews: int

    @property
    def jobs(self) -> int:
        return self.active_jobs


class DashboardPipelineResponse(BaseModel):
    applied: int
    screening: int
    interview: int
    evaluation: int
    offer: int


class DashboardAgentItem(BaseModel):
    name: str
    status: str  # active | processing | idle
    count: int


class DashboardCandidateItem(BaseModel):
    name: str
    role: str
    match_percent: int


# ==========================================
# Jobs
# ==========================================
class JobCreate(BaseModel):
    title: str
    department: str = "Engineering"
    location: str = "Remote"
    type: str = "Full-time"
    description: str
    requirements: str
    experience_level: str = "Senior"


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    department: str
    location: str
    type: str
    status: str
    description: str
    requirements: str
    experience_level: str
    created_at: datetime.datetime


# ==========================================
# Candidate & Run
# ==========================================
class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    role: str
    job_id: str
    skills: Optional[str] = None
    resume_text: Optional[str] = None


class CandidateUploadResponse(BaseModel):
    candidate_id: str
    run_id: str
    status: str
    message: str


class PipelineAnalysisRequest(BaseModel):
    job_role: str = Field(..., min_length=2, max_length=255)
    required_skills: str = Field(default="", max_length=4000)
    resume_text: str = Field(..., min_length=20, max_length=50000)


class PipelineAgentStatus(BaseModel):
    name: str
    role: str
    status: str


class PipelineInterviewQuestion(BaseModel):
    category: str
    question: str
    what_to_look_for: str


class PipelineAnalysisResponse(BaseModel):
    candidate_name: str
    overall_score: int
    screening_score: int
    recommendation: str
    experience_years: int
    education: str
    matching_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    weaknesses: List[str]
    questions: List[PipelineInterviewQuestion]
    agents: List[PipelineAgentStatus]


class RunStepResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    agent_name: str
    step_name: str
    status: str
    compliance_flagged: bool
    compliance_note: Optional[str] = None
    output_data: Optional[str] = None
    created_at: datetime.datetime


class RunDetailResponse(BaseModel):
    run_id: str
    candidate_id: str
    job_id: str
    status: str
    current_step: str
    approval_status: str
    review_note: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    steps: List[RunStepResponse] = []
    agent_outputs: Dict[str, Any] = {}
    compliance_flags: List[Dict[str, Any]] = []


class RunReviewRequest(BaseModel):
    action: str = Field(..., pattern="^(approve|reject)$")
    note: Optional[str] = None


class RunReviewResponse(BaseModel):
    run_id: str
    status: str
    approval_status: str
    message: str


# ==========================================
# Audit
# ==========================================
class AuditEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: Optional[str] = None
    who: str
    action: str
    details: Optional[str] = None
    timestamp: datetime.datetime
