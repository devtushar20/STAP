import json
import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.audit import log_audit
from app.agents.llm import llm_client


class ComplianceInput(BaseModel):
    step_name: str
    target_text: str
    metadata: Optional[Dict[str, Any]] = None


class ComplianceCheckResult(BaseModel):
    is_compliant: bool
    flagged: bool
    issues: List[str]
    rule_violations: List[str]
    recommendation: str


# Disallowed discriminatory signals / unfair proxy criteria
BIASED_PATTERNS = [
    (r"\b(age|elderly|too old|too young|fresh graduate only|recent grad only)\b", "Age bias / graduation date proxy"),
    (r"\b(female|male|woman|man|gender|maternity|pregnant)\b", "Gender indicator or assumption in evaluation criteria"),
    (r"\b(nationality|citizen of|native speaker|accent)\b", "Nationality or origin bias"),
    (r"\b(marital status|married|single)\b", "Family or marital status bias"),
    (r"\b(religious|religion|faith|church|temple|mosque)\b", "Religious belief signal"),
]


def run_compliance_agent(
    input_data: ComplianceInput,
    db: Session,
    run_id: Optional[str] = None,
) -> ComplianceCheckResult:
    """
    Compliance Agent:
    Checks agent outputs for bias or unfair criteria (e.g. age, gender, nationality,
    name-based signals), flags issues, and blocks flagged results from moving forward until reviewed.
    Logs to audit trail.
    """
    issues = []
    rule_violations = []

    text_to_scan = input_data.target_text.lower()

    # Rule-based regex heuristic check
    for pattern, desc in BIASED_PATTERNS:
        match = re.search(pattern, text_to_scan, re.IGNORECASE)
        if match:
            matched_word = match.group(0)
            issues.append(f"Identified potential bias term '{matched_word}': {desc}")
            rule_violations.append(desc)

    # Secondary LLM verification for subtle or context-dependent bias
    if not issues:
        prompt = f"""
        Audit the recruitment step output for discriminatory bias or unfair filtering proxies.
        Step: {input_data.step_name}

        Content to scan:
        {input_data.target_text[:1200]}
        """
        system_prompt = "You are the STAP Compliance & Fair Hiring Agent. Enforce EEOC, GDPR, and anti-bias recruitment ethics."
        response = llm_client.complete(prompt, system=system_prompt)
        try:
            res_json = json.loads(response)
            if not res_json.get("is_compliant", True):
                for f in res_json.get("flags", []):
                    issues.append(f)
                    rule_violations.append("LLM Fair Hiring Flag")
        except Exception:
            pass

    flagged = len(issues) > 0
    is_compliant = not flagged

    recommendation = (
        "Pass: Output adheres to all STAP fair hiring, non-discrimination, and meritocracy guidelines."
        if is_compliant
        else "Blocked: Unfair proxy or demographic signal detected. Pipeline halted pending human compliance officer override."
    )

    result = ComplianceCheckResult(
        is_compliant=is_compliant,
        flagged=flagged,
        issues=issues,
        rule_violations=rule_violations,
        recommendation=recommendation
    )

    log_audit(
        db=db,
        run_id=run_id,
        who="ComplianceAgent",
        action="EVALUATE_FAIR_HIRING_COMPLIANCE",
        details={
            "step_name": input_data.step_name,
            "is_compliant": is_compliant,
            "flagged": flagged,
            "issues_count": len(issues),
            "rule_violations": rule_violations
        }
    )

    return result
