from app.models import AuditLog


def test_get_audit_trail_unauthorized(client):
    response = client.get("/audit")
    assert response.status_code == 401


def test_get_audit_trail_authorized(client, auth_headers, db_session):
    # Add a sample log entry
    sample = AuditLog(
        who="RecruiterTest",
        action="TEST_ACTION",
        details="Sample details",
        run_id="run-sample-123"
    )
    db_session.add(sample)
    db_session.commit()

    response = client.get("/audit", headers=auth_headers)
    assert response.status_code == 200
    logs = response.json()
    assert isinstance(logs, list)
    assert len(logs) >= 1

    # Filter by run_id
    filtered = client.get("/audit?run_id=run-sample-123", headers=auth_headers)
    assert filtered.status_code == 200
    filtered_logs = filtered.json()
    assert len(filtered_logs) >= 1
    assert filtered_logs[0]["run_id"] == "run-sample-123"

