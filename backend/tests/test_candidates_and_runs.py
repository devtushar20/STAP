def test_candidate_upload_and_orchestrator_run(client, auth_headers, test_job):
    # Test uploading a candidate via form fields
    form_data = {
        "job_id": test_job.id,
        "name": "Jane Tester",
        "email": "jane.tester@example.com",
        "role": test_job.title,
        "resume_text": "Experienced Python developer with 6 years experience in FastAPI, microservices, and distributed architecture.",
    }
    response = client.post("/candidates", data=form_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert "candidate_id" in data
    assert "run_id" in data
    run_id = data["run_id"]

    # 1. Inspect run details
    run_res = client.get(f"/runs/{run_id}", headers=auth_headers)
    assert run_res.status_code == 200
    run_data = run_res.json()
    assert run_data["run_id"] == run_id
    assert run_data["status"] in ["paused_review", "running", "completed"]
    assert "sourcing" in run_data["agent_outputs"]
    assert "screening" in run_data["agent_outputs"]
    assert len(run_data["steps"]) >= 1

    # 2. Test human review endpoint (approve)
    review_payload = {
        "action": "approve",
        "note": "Candidate shows excellent technical alignment and strong system design foundation."
    }
    review_res = client.post(f"/runs/{run_id}/review", json=review_payload, headers=auth_headers)
    assert review_res.status_code == 200
    review_data = review_res.json()
    assert review_data["approval_status"] == "approve"
    assert review_data["status"] == "approved"

