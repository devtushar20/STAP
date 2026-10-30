import os
import sys

# Ensure backend root is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models import Base, engine, SessionLocal, User, Job, Candidate, Run, RunStep, AuditLog
from app.auth_util import get_password_hash
from app.vector import vector_store


def seed_database():
    print("[Seed] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Demo Recruiter User
        demo_user = db.query(User).filter(User.email == "recruiter@stap.ai").first()
        if not demo_user:
            demo_user = User(
                email="recruiter@stap.ai",
                hashed_password=get_password_hash("password123"),
                full_name="Sarah Jenkins",
                role="recruiter",
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print("[Seed] Demo recruiter created: recruiter@stap.ai / password123")
        else:
            print("[Seed] Demo recruiter already exists.")

        # 2. Seed Jobs (12 jobs for rich realistic dashboard metrics)
        job_definitions = [
            {
                "title": "Senior AI Systems Engineer",
                "department": "AI Engineering",
                "location": "San Francisco, CA (Hybrid)",
                "type": "Full-time",
                "description": "Architect and deploy distributed autonomous agent networks and production LLM orchestration pipelines using LangGraph and vector stores.",
                "requirements": "5+ years Python, experience with LangChain/LangGraph, ChromaDB, vector embeddings, high-throughput FastAPI microservices.",
                "experience_level": "Senior",
            },
            {
                "title": "Staff Frontend Architect",
                "department": "Platform Engineering",
                "location": "Remote",
                "type": "Full-time",
                "description": "Lead the architecture and design systems for STAP's mission-critical next-generation recruitment command centers.",
                "requirements": "7+ years React, Next.js (App Router), TypeScript, Tailwind CSS, high-performance web applications, accessibility WCAG AA.",
                "experience_level": "Staff",
            },
            {
                "title": "Lead Backend Engineer (Python/Distributed)",
                "department": "Platform Engineering",
                "location": "New York, NY (Hybrid)",
                "type": "Full-time",
                "description": "Design resilient event-driven microservices, database schemas, and background job runners for global scale recruitment data.",
                "requirements": "6+ years Python, FastAPI, SQLAlchemy, PostgreSQL, Redis, Docker, Kubernetes, CI/CD pipeline automation.",
                "experience_level": "Lead",
            },
            {
                "title": "Machine Learning Research Scientist",
                "department": "AI Research",
                "location": "Remote",
                "type": "Full-time",
                "description": "Conduct applied research on algorithmic fairness, bias mitigation in transformer models, and semantic candidate-job matching rubrics.",
                "requirements": "Ph.D. or M.S. in Computer Science or ML, PyTorch, Hugging Face, bias detection research, NLP information retrieval.",
                "experience_level": "Senior",
            },
            {
                "title": "Cloud Infrastructure & DevOps Lead",
                "department": "DevOps & Cloud",
                "location": "Austin, TX (Remote)",
                "type": "Full-time",
                "description": "Scale zero-downtime infrastructure across AWS and GCP, maintaining Kubernetes clusters, security compliance, and latency metrics.",
                "requirements": "5+ years AWS/GCP, Terraform, Kubernetes, Helm, Prometheus, Grafana, SOC2 & ISO 27001 compliance standards.",
                "experience_level": "Lead",
            },
            {
                "title": "Product Designer (Design Systems)",
                "department": "Product & UX",
                "location": "Remote",
                "type": "Full-time",
                "description": "Shape the visual and interaction design of STAP AI agent workflows, candidate scorecards, and interactive analytics dashboards.",
                "requirements": "Figma, design tokens, micro-interactions, complex workflow UX, data visualization paradigms.",
                "experience_level": "Mid-Senior",
            },
            {
                "title": "Full Stack Engineer (Growth)",
                "department": "Growth",
                "location": "Remote",
                "type": "Full-time",
                "description": "Experiment with onboarding funnels, self-serve integrations, and enterprise landing experiences.",
                "requirements": "Next.js, Node.js, Python, Analytics instrumentation, A/B testing methodologies.",
                "experience_level": "Mid",
            },
            {
                "title": "Security & Compliance Engineer",
                "department": "Security",
                "location": "Remote",
                "type": "Full-time",
                "description": "Audit platform security, implement zero-trust access controls, and ensure GDPR and EEOC recruitment data protection.",
                "requirements": "Application security, penetration testing, automated compliance tooling, OWASP Top 10 mastery.",
                "experience_level": "Senior",
            },
            {
                "title": "Technical Product Manager (AI Core)",
                "department": "Product",
                "location": "San Francisco, CA",
                "type": "Full-time",
                "description": "Define the roadmap for STAP multi-agent orchestration, human-in-the-loop workflows, and enterprise customer integrations.",
                "requirements": "B.S. in CS or equivalent, 4+ years technical PM experience in AI or SaaS platforms, data-driven prioritization.",
                "experience_level": "Senior",
            },
            {
                "title": "Data Engineer (Recruitment Telemetry)",
                "department": "Data Engineering",
                "location": "Remote",
                "type": "Full-time",
                "description": "Build high-throughput ETL data pipelines to compute real-time hiring velocity, agent throughput, and bias audit metrics.",
                "requirements": "Apache Spark, Kafka, Snowflake, dbt, Python, SQL performance tuning.",
                "experience_level": "Mid-Senior",
            },
            {
                "title": "QA Automation Lead",
                "department": "Quality Assurance",
                "location": "Remote",
                "type": "Full-time",
                "description": "Formulate automated end-to-end integration and regression suites across Next.js frontends and FastAPI microservices.",
                "requirements": "Playwright, Cypress, Pytest, Dockerized CI pipelines, performance testing.",
                "experience_level": "Lead",
            },
            {
                "title": "Customer Success Engineer",
                "department": "Customer Engineering",
                "location": "Remote",
                "type": "Full-time",
                "description": "Partner with enterprise recruiting teams to integrate STAP with Workday, Greenhouse, and custom ATS webhooks.",
                "requirements": "REST APIs, webhook architecture, debugging, customer-facing technical support, Python or TypeScript.",
                "experience_level": "Mid",
            },
        ]

        created_jobs = []
        for j_def in job_definitions:
            job = db.query(Job).filter(Job.title == j_def["title"]).first()
            if not job:
                job = Job(**j_def)
                db.add(job)
                db.commit()
                db.refresh(job)
                # Store in vector store
                vector_store.store_job(
                    job_id=job.id,
                    job_text=f"{job.title}\n{job.description}\n{job.requirements}",
                    metadata={"title": job.title, "department": job.department}
                )
            created_jobs.append(job)

        print(f"[Seed] {len(created_jobs)} jobs verified/seeded.")

        # 3. Seed 30 Fake Candidates
        sample_candidates_data = [
            ("Devon Reed", "devon.reed@example.com", "Senior AI Systems Engineer", 96, "offer", 6, ["Python", "LangGraph", "ChromaDB", "FastAPI", "Docker"]),
            ("Maya Lin", "maya.lin@example.com", "Staff Frontend Architect", 94, "offer", 8, ["React", "Next.js", "TypeScript", "Tailwind CSS", "Architecture"]),
            ("Liam O'Connor", "liam.oc@example.com", "Lead Backend Engineer (Python/Distributed)", 91, "evaluation", 7, ["Python", "FastAPI", "PostgreSQL", "Kafka", "Microservices"]),
            ("Zara Patel", "zara.patel@example.com", "Senior AI Systems Engineer", 89, "evaluation", 5, ["Python", "PyTorch", "LangChain", "Vector DBs", "Kubernetes"]),
            ("Carlos Mendoza", "carlos.m@example.com", "Staff Frontend Architect", 88, "evaluation", 6, ["React", "Next.js", "Web Performance", "State Management"]),
            ("Aisha Al-Mansoor", "aisha.m@example.com", "Machine Learning Research Scientist", 93, "evaluation", 5, ["PyTorch", "NLP", "Bias Detection", "Transformers", "Python"]),
            ("Lucas Schmidt", "lucas.s@example.com", "Cloud Infrastructure & DevOps Lead", 90, "interview", 6, ["AWS", "Kubernetes", "Terraform", "Prometheus", "CI/CD"]),
            ("Elena Rostova", "elena.r@example.com", "Lead Backend Engineer (Python/Distributed)", 87, "interview", 6, ["Python", "FastAPI", "SQLAlchemy", "Redis", "Distributed Systems"]),
            ("Tariq Hassan", "tariq.h@example.com", "Senior AI Systems Engineer", 86, "interview", 4, ["Python", "LangGraph", "OpenAI API", "FastAPI"]),
            ("Sophia Zhang", "sophia.z@example.com", "Staff Frontend Architect", 92, "interview", 7, ["TypeScript", "Next.js", "Design Systems", "GraphQL"]),
            ("Marcus Vance", "marcus.v@example.com", "Cloud Infrastructure & DevOps Lead", 85, "interview", 5, ["Kubernetes", "GCP", "Terraform", "Docker"]),
            ("Chloe Dubois", "chloe.d@example.com", "Product Designer (Design Systems)", 89, "interview", 5, ["Figma", "Design Systems", "Prototyping", "UX Research"]),
            ("Kenji Sato", "kenji.s@example.com", "Senior AI Systems Engineer", 84, "screening", 4, ["Python", "FastAPI", "ChromaDB", "LLMs"]),
            ("Fatima Zahra", "fatima.z@example.com", "Lead Backend Engineer (Python/Distributed)", 83, "screening", 5, ["Python", "PostgreSQL", "Docker", "AsyncIO"]),
            ("Oliver Brown", "oliver.b@example.com", "Staff Frontend Architect", 86, "screening", 6, ["React", "TypeScript", "Tailwind", "CSS Architecture"]),
            ("Ananya Rao", "ananya.r@example.com", "Machine Learning Research Scientist", 87, "screening", 4, ["Hugging Face", "PyTorch", "Information Retrieval"]),
            ("Ethan Miller", "ethan.m@example.com", "Cloud Infrastructure & DevOps Lead", 82, "screening", 4, ["AWS", "Docker", "Linux", "Terraform"]),
            ("Isabella Rossi", "isabella.r@example.com", "Product Designer (Design Systems)", 85, "screening", 4, ["Figma", "UI Design", "User Journeys"]),
            ("Noah Taylor", "noah.t@example.com", "Full Stack Engineer (Growth)", 81, "screening", 3, ["JavaScript", "Python", "React", "Node.js"]),
            ("Grace Kim", "grace.k@example.com", "Security & Compliance Engineer", 88, "screening", 5, ["AppSec", "OAuth2", "GDPR", "Penetration Testing"]),
            ("Samuel Jackson", "samuel.j@example.com", "Senior AI Systems Engineer", 78, "applied", 3, ["Python", "Machine Learning", "Git"]),
            ("Hanna Lindberg", "hanna.l@example.com", "Staff Frontend Architect", 79, "applied", 4, ["JavaScript", "React", "HTML/CSS"]),
            ("Vikram Malhotra", "vikram.m@example.com", "Lead Backend Engineer (Python/Distributed)", 80, "applied", 5, ["Python", "Django", "MySQL"]),
            ("Camila Gomez", "camila.g@example.com", "Data Engineer (Recruitment Telemetry)", 84, "applied", 4, ["Python", "SQL", "Spark", "Airflow"]),
            ("Julian Wagner", "julian.w@example.com", "QA Automation Lead", 83, "applied", 5, ["Playwright", "Selenium", "Python", "CI/CD"]),
            ("Nia Adebayo", "nia.a@example.com", "Technical Product Manager (AI Core)", 86, "applied", 4, ["Product Management", "Agile", "AI Products"]),
            ("Gabriel Silva", "gabriel.s@example.com", "Customer Success Engineer", 80, "applied", 3, ["REST APIs", "Troubleshooting", "Python"]),
            ("Zoe Campbell", "zoe.c@example.com", "Full Stack Engineer (Growth)", 77, "applied", 2, ["React", "Node.js", "Express"]),
            ("Arthur Pendelton", "arthur.p@example.com", "Security & Compliance Engineer", 82, "applied", 4, ["Security Auditing", "Cloud Security"]),
            ("Lila Thorne", "lila.t@example.com", "Data Engineer (Recruitment Telemetry)", 81, "applied", 3, ["SQL", "ETL Pipelines", "Python"]),
        ]

        first_job = created_jobs[0]

        for name, email, role, match, status, exp, skills in sample_candidates_data:
            existing_c = db.query(Candidate).filter(Candidate.email == email).first()
            if not existing_c:
                matching_job = next((j for j in created_jobs if j.title == role), first_job)
                cand = Candidate(
                    name=name,
                    email=email,
                    role=role,
                    resume_text=f"Resume of {name}. Experienced in {', '.join(skills)}. Over {exp} years of industry achievements.",
                    skills=", ".join(skills),
                    experience_years=exp,
                    status=status,
                    match_percent=match,
                    job_id=matching_job.id,
                )
                db.add(cand)
                db.commit()
                db.refresh(cand)

                # Add to vector store
                vector_store.store_resume(
                    candidate_id=cand.id,
                    resume_text=cand.resume_text,
                    metadata={"name": name, "role": role, "match": match}
                )

        candidate_count = db.query(Candidate).count()
        print(f"[Seed] {candidate_count} candidates verified/seeded in database and vector store.")

        # 4. Seed Audit Trail entries
        initial_log = db.query(AuditLog).first()
        if not initial_log:
            db.add(AuditLog(
                who="SystemBootstrap",
                action="DATABASE_INITIALIZED_AND_SEEDED",
                details="Initial jobs, candidate embeddings, and admin recruiter initialized."
            ))
            db.commit()
            print("[Seed] Initial audit log entry created.")

        print("[Seed] Database seeding completed successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

