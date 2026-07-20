from .base import BaseAgent

class AnalyticsAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.system_prompt = """You are a learning analytics agent.
Analyze student data to provide actionable insights for improving learning outcomes."""

    async def analyze_engagement(self, student_data: dict) -> dict:
        prompt = f"""Analyze this student's engagement data:
{student_data}

Provide:
- Engagement score (0-100)
- Risk of dropout (low/medium/high)
- Optimal study times
- Recommended interventions
- Motivational strategies
Output as JSON."""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_report(self, student_data: dict, timeframe: str = "weekly") -> str:
        prompt = f"""Generate a {timeframe} learning report based on:
{student_data}

Include:
- Summary of progress
- Key achievements
- Areas for improvement
- Time spent vs goals
- Recommendations for next week
Format as a friendly, encouraging report."""
        return await self.generate(prompt)

    async def predict_performance(self, student_data: dict) -> dict:
        prompt = f"""Predict this student's learning outcomes:
{student_data}

Predict:
- Expected course completion date
- Estimated final grade
- Concepts likely to need review
- Recommended study adjustments
Output as JSON."""
        result = await self.generate(prompt)
        return self.extract_json(result)
