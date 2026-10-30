import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure backend root is on sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

os.environ["ENV"] = "test"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["LLM_PROVIDER"] = "mock"

from app.models import Base, get_db, User, Job, Candidate
from app.auth_util import get_password_hash, create_access_token
from app.main import app

# Test SQLite in-memory engine
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    user = db_session.query(User).filter(User.email == "test.recruiter@stap.ai").first()
    if not user:
        user = User(
            email="test.recruiter@stap.ai",
            hashed_password=get_password_hash("password123"),
            full_name="Test Recruiter",
            role="recruiter",
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user):
    token = create_access_token({"sub": test_user.id, "email": test_user.email, "role": test_user.role})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_job(db_session):
    job = db_session.query(Job).first()
    if not job:
        job = Job(
            title="Senior Full Stack Engineer",
            department="Engineering",
            location="Remote",
            type="Full-time",
            status="active",
            description="Develop scalable web platforms using FastAPI and React/Next.js.",
            requirements="Python, FastAPI, TypeScript, React, Docker",
            experience_level="Senior",
        )
        db_session.add(job)
        db_session.commit()
        db_session.refresh(job)
    return job

