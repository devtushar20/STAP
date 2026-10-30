from app.models import Run
from app.orchestrator import RecruitmentOrchestrator


def test_pipeline_returns_backend_analysis(client, db_session, monkeypatch):
    def fake_execute_workflow(self, run_id):
        run = self.db.query(Run).filter(Run.id == run_id).first()
        run.status = "paused_review"
        self.db.commit()
        return {
            "status": "paused_review",
            "sourcing_data": {
                "name": "Alex Candidate",
                "skills": ["Python", "FastAPI"],
                "experience_years": 5,
                "education": "Computer Science",
            },
            "screening_data": {
                "match_score": 87,
                "gaps": ["AWS"],
                "strengths": ["Relevant backend experience"],
            },
            "interview_data": {
                "questions": [
                    {
                        "category": "Technical",
                        "question": "How do you design an API?",
                        "desired_signals": ["Tradeoffs"],
                    }
                ]
            },
            "evaluation_data": {
                "overall_score": 91,
                "recommendation": "Advance to Interview",
            },
        }

    monkeypatch.setattr(
        RecruitmentOrchestrator, "execute_workflow", fake_execute_workflow
    )
    response = client.post(
        "/pipeline",
        json={
            "job_role": "Senior Backend Engineer",
            "required_skills": "Python, FastAPI",
            "resume_text": "Alex Candidate has five years of backend engineering experience.",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["candidate_name"] == "Alex Candidate"
    assert data["overall_score"] == 91
    assert data["matching_skills"] == ["Python", "FastAPI"]
    assert data["questions"][0]["question"] == "How do you design an API?"
    assert [agent["name"] for agent in data["agents"]] == [
        "Sourcing",
        "Screening",
        "Interview",
        "Evaluation",
        "Scheduling",
        "Compliance",
    ]


def test_pipeline_rejects_short_resume(client):
    response = client.post(
        "/pipeline",
        json={
            "job_role": "Backend Engineer",
            "required_skills": "Python",
            "resume_text": "Too short",
        },
    )

    assert response.status_code == 422
