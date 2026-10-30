from app.agents.compliance import run_compliance_agent, ComplianceInput
from app.models import AuditLog


def test_compliance_clean_text(db_session):
    clean_input = ComplianceInput(
        step_name="Evaluation",
        target_text="Candidate demonstrated deep knowledge in distributed systems, clean code architecture, and proactive mentorship."
    )
    result = run_compliance_agent(clean_input, db=db_session, run_id="run-compliance-1")
    assert result.is_compliant is True
    assert result.flagged is False
    assert len(result.issues) == 0


def test_compliance_flags_bias(db_session):
    biased_input = ComplianceInput(
        step_name="Screening",
        target_text="Looking for a fresh graduate only who is very young and single for intense startup hours."
    )
    result = run_compliance_agent(biased_input, db=db_session, run_id="run-compliance-2")
    assert result.is_compliant is False
    assert result.flagged is True
    assert len(result.issues) >= 1
    assert "Blocked" in result.recommendation

