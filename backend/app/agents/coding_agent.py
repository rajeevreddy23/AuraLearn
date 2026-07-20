from .base import BaseAgent
import re

class CodingAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.supported_languages = ["python", "javascript", "typescript", "html", "css", "java", "cpp", "go", "rust", "sql"]

    async def explain_code(self, code: str, language: str) -> dict:
        prompt = f"""Explain this {language} code line by line:
```{language}
{code}
```

For each line/section explain:
- What it does
- How it works
- Key concepts involved
Output as JSON array of {{"line": "...", "explanation": "..."}}"""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def generate_code(self, description: str, language: str = "python") -> dict:
        prompt = f"""Write {language} code for: {description}

Include:
- Clean, well-structured code
- Comments explaining key parts
- Example usage
- Expected output
Output as JSON with: code, explanation, example_output, complexity"""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def debug_code(self, code: str, error: str, language: str) -> dict:
        prompt = f"""Debug this {language} code:
```{language}
{code}
```

Error: {error}

Identify:
1. The bug and root cause
2. Fixed code
3. Prevention tips
Output as JSON."""
        result = await self.generate(prompt)
        return self.extract_json(result)

    async def suggest_optimizations(self, code: str, language: str) -> dict:
        prompt = f"""Optimize this {language} code:
```{language}
{code}
```

Suggest improvements for:
- Performance
- Readability
- Best practices
Output as JSON with: suggestions[], optimized_code, explanation"""
        result = await self.generate(prompt)
        return self.extract_json(result)
