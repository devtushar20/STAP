import datetime
import uuid
from typing import List, Optional
from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    DateTime,
    ForeignKey,
    Boolean,
    create_engine,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="recruiter")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False, index=True)
    department = Column(String(100), nullable=False, default="Engineering")
    location = Column(String(100), nullable=False, default="Remote")
    type = Column(String(50), nullable=False, default="Full-time")
    status = Column(String(50), nullable=False, default="active")  # active, closed, draft
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=False)
    experience_level = Column(String(50), nullable=False, default="Senior")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidates = relationship("Candidate", back_populates="job")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(255), nullable=False)
    resume_text = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)  # JSON or comma-separated
    experience_years = Column(Integer, default=0)
    status = Column(String(50), default="applied")  # applied, screening, interview, evaluation, offer, rejected
    match_percent = Column(Integer, default=0)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    job = relationship("Job", back_populates="candidates")
    runs = relationship("Run", back_populates="candidate")


class Run(Base):
    __tablename__ = "runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False)
    status = Column(String(50), default="running")  # running, paused_review, approved, rejected, completed, blocked_compliance
    current_step = Column(String(50), default="Sourcing")
    approval_status = Column(String(50), default="pending")  # pending, approved, rejected
    review_note = Column(Text, nullable=True)
    reviewer_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="runs")
    steps = relationship("RunStep", back_populates="run", cascade="all, delete-orphan")


class RunStep(Base):
    __tablename__ = "run_steps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("runs.id"), nullable=False)
    agent_name = Column(String(50), nullable=False)
    step_name = Column(String(50), nullable=False)
    input_data = Column(Text, nullable=True)  # JSON
    output_data = Column(Text, nullable=True)  # JSON
    status = Column(String(50), default="completed")  # completed, flagged, blocked, pending
    compliance_flagged = Column(Boolean, default=False)
    compliance_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    run = relationship("Run", back_populates="steps")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), nullable=True, index=True)
    who = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)  # JSON string
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class DemoRequest(Base):
    __tablename__ = "demo_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    team_size = Column(String(50), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

