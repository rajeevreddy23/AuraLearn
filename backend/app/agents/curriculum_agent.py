from .base import BaseAgent

class CurriculumAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.system_prompt = """You are an expert curriculum designer for an AI university.
Design comprehensive, progressive learning paths from beginner to expert.
Structure courses with clear modules, chapters, and learning outcomes."""

    async def generate_course(self, topic: str, level: str = "beginner") -> dict:
        prompt = f"""Design a complete course on "{topic}" at {level} level.
Include:
- Course description and learning outcomes
- 4-6 modules with progressive difficulty
- Each module: 3-5 lessons with practical exercises
- Prerequisites and estimated duration
- Projects and assessments

Output as structured JSON."""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_quiz(self, topic: str, num_questions: int = 5) -> dict:
        prompt = f"""Create {num_questions} quiz questions about "{topic}".
Mix of: multiple-choice, true/false, and short answer.
Include correct answers and explanations.
Output as structured JSON array with: question, type, options[], correctAnswer, explanation."""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_project(self, topic: str, difficulty: str = "medium") -> dict:
        prompt = f"""Design a practical project for learning "{topic}" at {difficulty} difficulty.
Include:
- Project title and description
- Learning objectives
- Step-by-step milestones (3-5)
- Technologies/tools needed
- Evaluation criteria
- Suggested timeline
Output as structured JSON."""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_flashcards(self, topic: str, count: int = 10) -> list:
        prompt = f"""Create {count} flashcards about "{topic}".
Each card: front (question/concept) and back (answer/definition).
Output as JSON array of {{front, back}} objects."""
        result = await self.generate(prompt)
        data = self.extract_json(result)
        if isinstance(data, list):
            return data
        return data.get("flashcards", [])
