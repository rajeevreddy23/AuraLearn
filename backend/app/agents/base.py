import asyncio
from typing import AsyncGenerator
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from ..core.config import settings

genai.configure(api_key=settings.gemini_api_key)

class RateLimitFallback(Exception):
    pass

class BaseAgent:
    model: str = "gemini-2.0-flash"

    def __init__(self):
        self.client = genai.GenerativeModel(self.model)
        self.system_prompt = ""
        self._fallback_func = None

    def set_fallback(self, func):
        self._fallback_func = func

    async def generate(self, prompt: str) -> str:
        full_prompt = f"{self.system_prompt}\n\n{prompt}"
        try:
            if not settings.gemini_api_key or settings.gemini_api_key == "MOCK_KEY":
                raise Exception("Missing API key")
            response = await self.client.generate_content_async(full_prompt)
            return response.text
        except Exception:
            return self._mock_response(prompt, self.system_prompt)

    async def generate_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        full_prompt = f"{self.system_prompt}\n\n{prompt}"
        try:
            if not settings.gemini_api_key or settings.gemini_api_key == "MOCK_KEY":
                raise Exception("Missing API key")
            response = await self.client.generate_content_async(full_prompt, stream=True)
            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception:
            fallback_text = self._mock_response(prompt, self.system_prompt)
            for line in fallback_text.split('\n'):
                yield line + '\n'
                await asyncio.sleep(0.08) # Simulate active typing delay

    def extract_json(self, text: str) -> dict:
        import json, re
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"text": text}

    def _mock_response(self, prompt: str, system_prompt: str = "general") -> str:
        import hashlib
        base = hashlib.md5(prompt.encode()).hexdigest()
        idx = int(base[:8], 16)

        fallbacks = {
            "teacher": (
                f"##TITLE## Immersive Lesson on Topic\n"
                f"##OBJECTIVES## Understand core building blocks||Establish structural dependencies||Solve conceptual checkpoints\n"
                f"##HEADING## Slide 1: Core Fundamentals & Analogy\n"
                f"##BULLETS## Let's start with first principles logic||Analogies help bridge theory with visual structures||Analyze the visual map on the board\n"
                f"##DIAGRAM## {{\"root\": {{\"label\": \"Fundamentals\"}}, \"children\": [{{\"label\": \"Logic Rules\"}}, {{\"label\": \"Concept Map\"}}]}}\n"
                f"##QUIZ## {{\"question\": \"What helps bridge theory with visual structures?\", \"options\": [\"Conceptual analogies\", \"Rote memorization\", \"Ignoring logic\"], \"answer\": \"Conceptual analogies\", \"explanation\": \"Analogies provide cognitive hooks connecting known things to abstract rules.\"}}\n"
                f"##HEADING## Slide 2: Structural Layout & Code\n"
                f"##BULLETS## Concepts are organized hierarchically||Each node represents a distinct block||Review the implementation example below\n"
                f"##DIAGRAM## {{\"root\": {{\"label\": \"Layout\"}}, \"children\": [{{\"label\": \"Interface\"}}, {{\"label\": \"State Manager\"}}]}}\n"
                f"##CODE## typescript\\n// System implementation sample\\nfunction initializeSystem() {{\\n    console.log('System initialized successfully');\\n}}\\n\\ninitializeSystem();\\n\n"
                f"##QUIZ## {{\"question\": \"What layout structure is used on the visual board?\", \"options\": [\"Hierarchical trees\", \"Linear grids\", \"None of these\"], \"answer\": \"Hierarchical trees\", \"explanation\": \"A tree diagram branches parent to child nodes.\"}}\n"
                f"##HEADING## Slide 3: Pitfalls & Summary\n"
                f"##BULLETS## Avoid skipping basic principles||Continuous practice is key to long-term memory||Keep asking doubts to refine your logic\n"
                f"##DIAGRAM## {{\"root\": {{\"label\": \"Refinement\"}}, \"children\": [{{\"label\": \"Practice\"}}, {{\"label\": \"Review Check\"}}]}}\n"
                f"##QUIZ## {{\"question\": \"Why is continuous practice recommended?\", \"options\": [\"To build coding muscle memory\", \"Only to clear exams\", \"It is not necessary\"], \"answer\": \"To build coding muscle memory\", \"explanation\": \"Regular typing and problem-solving embeds syntactical layouts in long-term memory.\"}}"
            ),
            "coding": (
                f"# Code Analysis: {prompt[:40]}\n\n"
                "```python\ndef example():\n    "
                "# This code demonstrates the concept\n    "
                "result = sum(range(10))\n    "
                "return result\n```\n\n"
                "**Explanation:** This implementation follows standard patterns. "
                "The time complexity is O(n) and space complexity is O(1)."
            ),
            "quiz": (
                "```json\n{\n  \"questions\": [\n    "
                "{\"question\": \"What is the main concept?\", "
                "\"options\": [\"A) Option 1\", \"B) Option 2\", "
                "\"C) Option 3\", \"D) Option 4\"], "
                "\"answer\": 0, \"explanation\": \"This is the correct choice "
                "because it aligns with the fundamental principle.\"}\n  ]\n}\n```"
            ),
        }

        sp_lower = system_prompt.lower()
        if "teacher" in sp_lower or "lesson" in sp_lower:
            key = "teacher"
        elif "code" in sp_lower or "python" in sp_lower or "program" in sp_lower:
            key = "coding"
        elif "quiz" in sp_lower or "question" in sp_lower:
            key = "quiz"
        else:
            keys = list(fallbacks.keys())
            key = keys[idx % len(keys)]

        return fallbacks[key]
