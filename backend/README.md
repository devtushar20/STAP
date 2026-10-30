# STAP Backend - Multi-Agent AI Recruitment Platform

Production-ready Python FastAPI backend powering the STAP AI recruitment orchestration engine. Connects with the STAP Next.js App Router frontend and implements autonomous agents with LangGraph orchestration, ChromaDB vector indexing, and human-in-the-loop review.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          FastAPI Gateway               │
                      │  CORS / JWT Auth / Rate Limiting       │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────▼────────────────────────┐
                 │       LangGraph Orchestration State Machine    │
                 │                 (Orchestrator)                 │
                 └───────┬───────────────┬────────────────┬───────┘
                         │               │                │
            ┌────────────▼──┐     ┌──────▼─────┐   ┌──────▼──────┐
            │   Sourcing    │     │ Screening  │   │  Interview  │
            │ (ChromaDB Emb)│     │(Cosine+LLM)│   │ (Adaptive)  │
            └───────┬───────┘     └──────┬─────┘   └──────┬──────┘
                    │                    │                │
            ┌───────▼────────────────────▼────────────────▼──────┐
            │      Compliance & Bias Guard (Checked After Step)  │
            └───────┬────────────────────┬────────────────┬──────┘
                    │                    │                │
            ┌───────▼───────┐     ┌──────▼─────┐   ┌──────▼──────┐
            │  Evaluation   │     │ Scheduling │   │Human Review │
            │  (Scorecard)  │     │(Mock Cal)  │   │   (Pause)   │
            └───────────────┘     └────────────┘   └─────────────┘
```

### The 6 Autonomous Agents:
1. **Sourcing Agent** (`app/agents/sourcing.py`): Parses text/PDF resumes into structured fields (name, skills, experience, education) and embeds representations into ChromaDB.
2. **Screening Agent** (`app/agents/screening.py`): Computes hybrid semantic cosine similarity and an objective LLM rubric (0-100 score with reasoning, strengths, and gaps).
3. **Interview Agent** (`app/agents/interview.py`): Formulates adaptive, structured interview questions tailored to candidate depth and records candidate responses.
4. **Evaluation Agent** (`app/agents/evaluation.py`): Evaluates interview responses into a synthesized scorecard (skills, communication, team fit) and hire recommendation.
5. **Scheduling Agent** (`app/agents/scheduling.py`): Proposes conflict-free interview time slots from mock availability calendar slots.
6. **Compliance Agent** (`app/agents/compliance.py`): Audits all agent outputs for demographic bias or unfair proxies (e.g. age, gender, nationality, marital status), flags violations, and halts progression until human compliance officer review.

---

## Directory Structure

```
backend/
├── app/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── compliance.py
│   │   ├── evaluation.py
│   │   ├── interview.py
│   │   ├── llm.py
│   │   ├── scheduling.py
│   │   ├── screening.py
│   │   └── sourcing.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── agents.py
│   │   ├── audit.py
│   │   ├── auth.py
│   │   ├── candidates.py
│   │   ├── dashboard.py
│   │   ├── demo.py
│   │   ├── jobs.py
│   │   ├── pipeline.py
│   │   └── runs.py
│   ├── audit.py
│   ├── auth_util.py
│   ├── config.py
│   ├── limiter.py
│   ├── main.py
│   ├── models.py
│   ├── orchestrator.py
│   ├── schemas.py
│   └── vector.py
├── tests/
│   ├── conftest.py
│   ├── test_audit.py
│   ├── test_auth.py
│   ├── test_candidates_and_runs.py
│   ├── test_compliance.py
│   ├── test_dashboard.py
│   ├── test_demo.py
│   ├── test_jobs.py
│   ├── test_pipeline.py
│   └── test_screening_agent.py
├── .env.example
├── pytest.ini
├── requirements.txt
├── seed.py
└── README.md
```

---

## Setup & Installation

### 1. Requirements
- Python 3.10 or 3.11+
- Virtual environment (recommended)

### 2. Create and Activate Virtual Environment
```bash
cd backend
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Linux / macOS:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PROJECT_NAME` | Service title | `STAP Recruitment Platform API` |
| `ENV` | Environment | `development` |
| `FRONTEND_URL` | Allowed Next.js CORS origin | `http://localhost:3000` |
| `SECRET_KEY` | JWT secret; replace with a random value before deployment | (set locally) |
| `DATABASE_URL` | SQLite or PostgreSQL connection string | `sqlite:///./stap.db` |
| `CHROMA_PERSIST_DIRECTORY` | ChromaDB vector store directory | `./chroma_data` |
| `LLM_PROVIDER` | LLM Provider (`mock`, `openai`, `anthropic`, `gemini`) | `mock` |
| `OPENAI_API_KEY` | Optional OpenAI key | (empty for offline mock) |
| `RATE_LIMIT_LOGIN` | Rate limit on `/auth/login` | `10/minute` |
| `RATE_LIMIT_DEMO` | Rate limit on `/demo-requests` | `5/minute` |

---

## Seed Database & Initial Data

Run the seeding script to initialize SQLite tables, register ChromaDB vectors, create the demo recruiter account, and populate 12 jobs and 30 candidates:

```bash
python seed.py
```

**Seeded Demo Credentials:**
- Email: `recruiter@stap.ai`
- Password: `password123`

---

## Running the API Server

Start the FastAPI application with Uvicorn:

```bash
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

## Running Tests

Run the test suite offline with Pytest (mocked LLM ensures 100% offline reliability without external API costs or network reliance):

```bash
python -m pytest tests -v
```

All 20 tests cover:
- Authentication, password hashing, and token issuance
- Rate limiting on `/auth/login` and `/demo-requests`
- JWT protection on dashboard and orchestration endpoints
- End-to-end recruitment candidate workflow and pause at human review
- Offline screening agent match score calculation and audit logging
- Anti-bias compliance detection and blocking
- Candidate pipeline analysis response and request validation

---

## API Contract & Example cURL Calls

### Candidate pipeline demo (public, rate-limited)

The Next.js assistant calls `POST /api/pipeline`, which forwards to this backend's
`POST /pipeline` endpoint. Set `BACKEND_URL` in the Next.js deployment to the
reachable backend base URL (for example, `https://api.example.com`).

```bash
curl -X POST http://localhost:8000/pipeline \
  -H "Content-Type: application/json" \
  -d '{"job_role":"Backend Engineer","required_skills":"Python, FastAPI","resume_text":"Candidate resume text with relevant work experience."}'
```

The endpoint allows three requests per minute per client address. Configure
`LLM_PROVIDER` and the matching API key for real model-generated analysis;
the default `mock` provider is intended for local development and tests.

### 1. Authenticate (Get JWT Bearer Token)
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "recruiter@stap.ai", "password": "password123"}'
```
Response:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "email": "recruiter@stap.ai",
    "full_name": "Sarah Jenkins",
    "role": "recruiter"
  }
}
```

### 2. Submit Demo Request (Rate-limited, Public)
```bash
curl -X POST http://localhost:8000/demo-requests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Mercer",
    "email": "alex@enterprise.com",
    "company": "Apex Corp",
    "team_size": "25-50",
    "message": "Looking to evaluate autonomous sourcing."
  }'
```

### 3. Fetch Dashboard Summary (JWT Protected)
```bash
curl -X GET http://localhost:8000/dashboard/summary \
  -H "Authorization: Bearer <TOKEN>"
```
Response:
```json
{
  "active_jobs": 12,
  "candidates": 248,
  "shortlisted": 42,
  "interviews": 18
}
```

### 4. Fetch Dashboard Pipeline Breakdown
```bash
curl -X GET http://localhost:8000/dashboard/pipeline \
  -H "Authorization: Bearer <TOKEN>"
```

### 5. Fetch Active Agent Metrics
```bash
curl -X GET http://localhost:8000/dashboard/agents \
  -H "Authorization: Bearer <TOKEN>"
```

### 6. Upload Candidate & Trigger Orchestrator Run
```bash
curl -X POST http://localhost:8000/candidates \
  -H "Authorization: Bearer <TOKEN>" \
  -F "name=Jordan Taylor" \
  -F "email=jordan.taylor@example.com" \
  -F "resume_text=Senior Backend Engineer with 7 years experience in Python, FastAPI, and Kubernetes."
```
Response:
```json
{
  "candidate_id": "95443b12...",
  "run_id": "4b68e912...",
  "status": "paused_review",
  "message": "Orchestrator run initiated and processed through evaluation."
}
```

### 7. Inspect Run Status & Step Outputs
```bash
curl -X GET http://localhost:8000/runs/<RUN_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

### 8. Human in the Loop Review Decision (Approve / Reject)
```bash
curl -X POST http://localhost:8000/runs/<RUN_ID>/review \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "note": "Exemplary system design answers. Approved for formal offer."
  }'
```

### 9. Query Audit Trail
```bash
curl -X GET "http://localhost:8000/audit?run_id=<RUN_ID>" \
  -H "Authorization: Bearer <TOKEN>"
```
