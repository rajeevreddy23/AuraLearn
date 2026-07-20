from .base import BaseAgent

class TeacherAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.system_prompt = """You are an expert AI professor. Your teaching is:
1. Deeply educational and clear: break complex ideas into intuitive, first-principles explanations.
2. Metaphorical: use creative real-world analogies to make abstract concepts stick.
3. Code-annotated: write clean, production-ready code examples with rich, step-by-step comments.
4. Engaging: call out common pitfalls, mistakes, and critical guidelines for the student."""

    async def generate_lesson(self, topic: str, level: str = "beginner") -> dict:
        prompt = f"""Create a comprehensive masterclass lesson on "{topic}" for a {level} student.
Include:
1. Title and Learning objectives (what the student will achieve).
2. Prerequisites needed.
3. Core concepts explained step-by-step from first principles with a creative real-world analogy.
4. Practical, commented code examples demonstrating the concepts.
5. Common pitfalls and mistakes to avoid.
6. A hands-on practice challenge.
7. An actionable summary checklist.

Format the output strictly as JSON with:
"title": "lesson title",
"objectives": ["obj1", "obj2"],
"prerequisites": ["prereq1"],
"sections": [{"title": "section title", "content": "explanations with analogies", "code": "optional code with comments"}],
"exercise": "details of hands-on challenge",
"summary": "actionable checklist summary"
"""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_whiteboard_content(self, topic: str, lesson_part: str) -> str:
        prompt = f"""Generate rich whiteboard content for teaching "{topic}" - specifically about {lesson_part}.
Write it as clean, board-formatted text with:
- Bold headings and structure
- Clear analogies and first-principles bullet points
- Well-commented code blocks
- Simple visual diagrams using ASCII art where helpful
- Pitfalls callouts (What to avoid)
Be highly educational, clear, and structured."""
        return await self.generate(prompt)

    async def answer_doubt(self, question: str, lesson_context: str) -> dict:
        prompt = f"""The student asked this doubt: "{question}"
Current lesson context: {lesson_context}

Provide a clear, helpful, and comprehensive explanation:
- Direct, simple explanation using first principles and a clear analogy if helpful.
- Well-commented code example if relevant.
- Common mistakes relating to this doubt.
- Related concepts the student should review.

Format the response strictly as JSON with:
"explanation": "detailed answer",
"codeExample": "commented code snippet if relevant",
"relatedConcepts": ["concept1", "concept2"]
"""
        result = await self.generate(prompt)
        return self.extract_json(result)
