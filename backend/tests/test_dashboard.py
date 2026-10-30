def test_dashboard_summary_unauthorized(client):
    response = client.get("/dashboard/summary")
    assert response.status_code == 401


def test_dashboard_summary_authorized(client, auth_headers):
    response = client.get("/dashboard/summary", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "active_jobs" in data
    assert "candidates" in data
    assert "shortlisted" in data
    assert "interviews" in data
    assert data["active_jobs"] >= 12
    assert data["candidates"] >= 248


def test_dashboard_pipeline(client, auth_headers):
    response = client.get("/dashboard/pipeline", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "applied" in data
    assert "screening" in data
    assert "interview" in data
    assert "evaluation" in data
    assert "offer" in data


def test_dashboard_agents(client, auth_headers):
    response = client.get("/dashboard/agents", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 6
    agent_names = [a["name"] for a in data]
    assert "Sourcing" in agent_names
    assert "Screening" in agent_names
    assert "Interview" in agent_names
    assert "Evaluation" in agent_names
    assert "Scheduling" in agent_names
    assert "Compliance" in agent_names


def test_dashboard_candidates_limit(client, auth_headers):
    response = client.get("/dashboard/candidates?limit=4", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 4
    for cand in data:
        assert "name" in cand
        assert "role" in cand
        assert "match_percent" in cand

