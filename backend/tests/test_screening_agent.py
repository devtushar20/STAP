from app.agents.screening import run_screening_agent, ScreeningInput
from app.models import AuditLog


def test_screening_agent_offline_mock(db_session):
    screening_input = ScreeningInput(
        candidate_id="cand-123",
        candidate_name="Ada Lovelace",
        resume_text="Extensive background in algorithmic design, Python computing, and analytical engine architecture.",
        skills=["Python", "Algorithms", "Mathematics", "FastAPI"],
        job_id="job-456",
        job_title="Senior AI Systems Engineer",
        job_description="Architecting high-performance computing algorithms and API pipelines.",
        job_requirements="Strong foundations in algorithms, Python, and scalable backends."
    )

    output = run_screening_agent(
        input_data=screening_input,
        db=db_session,
        run_id="run-789"
    )

    # Validate output contract
    assert 0 <= output.match_score <= 100
    assert isinstance(output.reason, str)
    assert len(output.reason) > 5
    assert isinstance(output.strengths, list)
    assert len(output.strengths) >= 1
    assert isinstance(output.gaps, list)
    assert 0 <= output.embedding_similarity <= 100

    # Validate audit logging
    audit_entry = (
        db_session.query(AuditLog)
        .filter(AuditLog.run_id == "run-789", AuditLog.who == "ScreeningAgent")
        .first()
    )
    assert audit_entry is not None
    assert audit_entry.action == "SCREEN_CANDIDATE_MATCH"

