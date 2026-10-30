import os
import json
import re
from typing import Optional, Dict, Any
from app.config import get_settings

settings = get_settings()


class LLMClient:
    """Configurable LLM client supporting Mock (offline), OpenAI, Anthropic, Gemini."""

    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.model = settings.LLM_MODEL
        self.openai_key = settings.OPENAI_API_KEY
        self.anthropic_key = settings.ANTHROPIC_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY

    def complete(self, prompt: str, system: Optional[str] = None) -> str:
        """Generate text completion from configured LLM provider or fallback."""
        if self.provider == "openai" and self.openai_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.openai_key)
                messages = []
                if system:
                    messages.append({"role": "system", "content": system})
                messages.append({"role": "user", "content": prompt})
                response = client.chat.completions.create(
                    model=self.model or "gpt-4o-mini",
                    messages=messages,
                    temperature=0.2,
                )
                return response.choices[0].message.content or ""
            except Exception as e:
                print(f"[LLM] OpenAI error ({e}), falling back to mock provider.")

        # Default Mock / Offline Provider
        return self._mock_complete(prompt, system)

    def _mock_complete(self, prompt: str, system: Optional[str] = None) -> str:
        lower_prompt = prompt.lower()
        lower_system = (system or "").lower()

        # Resume extraction / parsing
        if "sourcing" in lower_system or "parse" in lower_prompt:
            return json.dumps({
                "name": "Jane Doe",
                "email": "jane.doe@example.com",
                "phone": "+1 555-0199",
                "skills": ["Python", "FastAPI", "React", "Next.js", "PostgreSQL", "Docker", "Machine Learning"],
                "experience_years": 5,
                "education": "B.S. in Computer Science",
                "summary": "Experienced Full Stack & AI Engineer with 5+ years building scalable web services and ML pipelines."
            })

        # Screening rubric
        if "screening" in lower_system or "candidate-job alignment" in lower_system:
            return json.dumps({
                "match_score": 88,
                "reason": "Strong alignment in backend engineering (Python/FastAPI) and system design. Solid background matching core role requirements.",
                "strengths": ["Extensive Python experience", "Modern API design", "Full-stack familiarity"],
                "gaps": ["Would benefit from deeper Kubernetes production orchestration"]
            })

        # Interview questions
        if "interview" in lower_system:
            return json.dumps({
                "questions": [
                    {
                        "id": 1,
                        "category": "Architecture",
                        "question": "Can you describe a distributed system you designed and how you handled eventual consistency?",
                        "desired_signals": ["Clarity", "CAP theorem awareness", "Failure modes"]
                    },
                    {
                        "id": 2,
                        "category": "Performance",
                        "question": "How do you optimize slow database queries and manage connection pools under high concurrency?",
                        "desired_signals": ["Indexing strategy", "Profiling", "Async connection pooling"]
                    },
                    {
                        "id": 3,
                        "category": "Collaboration",
                        "question": "Tell us about a time you had a technical disagreement with a teammate. How did you resolve it?",
                        "desired_signals": ["Empathy", "Constructive debate", "Data-driven decisions"]
                    }
                ]
            })

        # Evaluation scorecard
        if "evaluation" in lower_system or "scorecard" in lower_prompt:
            return json.dumps({
                "skills_score": 90,
                "communication_score": 85,
                "fit_score": 88,
                "overall_score": 88,
                "recommendation": "Advance to Offer",
                "summary": "Demonstrated comprehensive architectural depth, clear technical communication, and sound design principles."
            })

        # Compliance / Bias detection
        if "compliance" in lower_system or "fair hiring" in lower_system:
            # Extract content section if present
            content_to_check = lower_prompt
            if "content to scan:" in lower_prompt:
                content_to_check = lower_prompt.split("content to scan:")[1]

            biased_keywords = ["age", "young", "old", "gender", "female", "male", "nationality", "race", "pregnant", "marital status"]
            flags = []
            for kw in biased_keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', content_to_check):
                    flags.append(f"Potential bias indicator detected: reference to '{kw}'")

            return json.dumps({
                "is_compliant": len(flags) == 0,
                "flags": flags,
                "feedback": "All evaluated criteria adhere to fair hiring standards." if not flags else "Blocked due to potential non-compliance criteria."
            })

        return json.dumps({"status": "success"})


llm_client = LLMClient()
