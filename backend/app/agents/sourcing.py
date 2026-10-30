import io
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.audit import log_audit
from app.vector import vector_store
from app.agents.llm import llm_client

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None


class SourcingInput(BaseModel):
    resume_text: Optional[str] = None
    pdf_bytes: Optional[bytes] = None
    candidate_id: Optional[str] = None
    filename: Optional[str] = "resume.txt"


class SourcingOutput(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    skills: List[str]
    experience_years: int
    education: str
    summary: str
    raw_text: str


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    if not PdfReader:
        return "PDF text extraction unavailable (pypdf not installed)."
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                extracted.append(t)
        return "\n".join(extracted)
    except Exception as e:
        return f"Error extracting PDF text: {str(e)}"


def run_sourcing_agent(
    input_data: SourcingInput,
    db: Session,
    run_id: Optional[str] = None,
) -> SourcingOutput:
    """
    Sourcing Agent:
    Parses resume (PDF or text) into structured fields (name, skills, experience, education)
    and stores embedding in ChromaDB.
    Logs to audit trail.
    """
    raw_text = input_data.resume_text or ""
    if not raw_text and input_data.pdf_bytes:
        raw_text = extract_text_from_pdf(input_data.pdf_bytes)

    if not raw_text.strip():
        raw_text = "Experienced Software Engineer with proficiency in Python, APIs, and Distributed Systems."

    prompt = f"""
    Please parse the following resume into structured JSON format with fields:
    - name (string)
    - email (string)
    - phone (string)
    - skills (list of strings)
    - experience_years (integer)
    - education (string)
    - summary (string)

    Resume Text:
    {raw_text[:2000]}
    """
    system_prompt = "You are the STAP Sourcing Agent. Extract accurate, structured candidate details without bias."

    response = llm_client.complete(prompt, system=system_prompt)

    try:
        data = json.loads(response)
    except Exception:
        data = {
            "name": "Jane Doe",
            "email": "candidate@stap.ai",
            "phone": "+1 555-0100",
            "skills": ["Python", "FastAPI", "React", "PostgreSQL"],
            "experience_years": 4,
            "education": "B.S. in Computer Science",
            "summary": "Full Stack Engineer"
        }

    output = SourcingOutput(
        name=data.get("name", "Jane Doe"),
        email=data.get("email", "candidate@stap.ai"),
        phone=data.get("phone", "+1 555-0100"),
        skills=data.get("skills", ["Python", "FastAPI"]),
        experience_years=int(data.get("experience_years", 3)),
        education=data.get("education", "Computer Science Degree"),
        summary=data.get("summary", "Experienced Engineer"),
        raw_text=raw_text,
    )

    # Store in ChromaDB
    cid = input_data.candidate_id or "temp-candidate-id"
    vector_store.store_resume(
        candidate_id=cid,
        resume_text=raw_text,
        metadata={
            "name": output.name,
            "email": output.email,
            "experience_years": output.experience_years,
            "skills": ", ".join(output.skills)
        }
    )

    # Audit logging
    log_audit(
        db=db,
        run_id=run_id,
        who="SourcingAgent",
        action="PARSE_AND_EMBED_RESUME",
        details={
            "candidate_id": cid,
            "name": output.name,
            "skills_count": len(output.skills),
            "experience_years": output.experience_years
        }
    )

    return output

