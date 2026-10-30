def test_login_success(client, test_user):
    payload = {
        "email": test_user.email,
        "password": "password123"
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_user.email
    assert data["user"]["role"] == test_user.role


def test_login_invalid_password(client, test_user):
    payload = {
        "email": test_user.email,
        "password": "wrongpassword"
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_nonexistent_user(client):
    payload = {
        "email": "ghost@nowhere.com",
        "password": "password123"
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 401

