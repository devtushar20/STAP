def test_list_jobs(client, auth_headers, test_job):
    response = client.get("/jobs", headers=auth_headers)
    assert response.status_code == 200
    jobs = response.json()
    assert isinstance(jobs, list)
    assert len(jobs) >= 1


def test_create_job(client, auth_headers):
    payload = {
        "title": "Principal Architect",
        "department": "Infrastructure",
        "location": "Remote",
        "type": "Full-time",
        "description": "Lead multi-region cloud topology.",
        "requirements": "Kubernetes, Go, Python, Terraform",
        "experience_level": "Principal"
    }
    response = client.post("/jobs", json=payload, headers=auth_headers)
    assert response.status_code == 201
    job = response.json()
    assert job["title"] == "Principal Architect"
    assert "id" in job

