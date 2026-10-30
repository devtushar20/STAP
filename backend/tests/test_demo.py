def test_create_demo_request_success(client):
    payload = {
        "name": "Sarah Connor",
        "email": "sarah@cyberdyne.io",
        "company": "Cyberdyne Systems",
        "team_size": "50-100",
        "message": "Interested in evaluating STAP for multi-agent sourcing."
    }
    response = client.post("/demo-requests", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert len(data["id"]) > 0


def test_create_demo_request_validation_error(client):
    # Missing required email
    payload = {
        "name": "Sarah Connor",
        "company": "Cyberdyne Systems",
        "team_size": "50-100"
    }
    response = client.post("/demo-requests", json=payload)
    assert response.status_code == 422

