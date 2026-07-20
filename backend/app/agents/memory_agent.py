from .base import BaseAgent
import json

class MemoryAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.system_prompt = """You are a learning memory agent that maintains personalized student profiles.
Track strengths, weaknesses, learning style, and adapt future content.
Provide insights and recommendations based on learning history."""

    async def analyze_progress(self, student_data: dict) -> dict:
        prompt = f"""Analyze this student's learning data and provide insights:
{json.dumps(student_data, indent=2)}

Provide:
- Current strengths (top 3)
- Areas needing improvement
- Recommended next topics
- Estimated proficiency level
- Personalized study tips
Output as JSON."""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_personalized_path(self, student_data: dict, topic: str) -> dict:
        prompt = f"""Create a personalized learning path for this student:
Student data: {json.dumps(student_data, indent=2)}
Requested topic: {topic}

Design a custom curriculum that:
1. Builds on their existing strengths
2. Addresses their weak areas
3. Matches their preferred learning style
4. Sets achievable milestones
Output as structured JSON."""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_review_notes(self, student_data: dict, topic: str) -> str:
        prompt = f"""Generate personalized review notes for {topic} based on this student's history:
{json.dumps(student_data, indent=2)}

Focus on:
- Concepts they struggled with
- Common mistakes
- Key formulas/diagrams
- Mnemonic devices
- Practice problems targeting their weak areas"""
        return await self.generate(prompt)
