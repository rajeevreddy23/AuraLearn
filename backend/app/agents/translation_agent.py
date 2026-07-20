from .base import BaseAgent

class TranslationAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.supported_languages = {
            "en": "English", "es": "Spanish", "fr": "French", "de": "German",
            "zh": "Chinese", "ja": "Japanese", "ko": "Korean", "ar": "Arabic",
            "hi": "Hindi", "pt": "Portuguese", "ru": "Russian", "it": "Italian"
        }

    async def translate_content(self, content: str, source_lang: str, target_lang: str) -> str:
        if target_lang == "en":
            return content
        source_name = self.supported_languages.get(source_lang, source_lang)
        target_name = self.supported_languages.get(target_lang, target_lang)
        prompt = f"""Translate this educational content from {source_name} to {target_name}.
Keep all code examples, technical terms, and formatting intact.
Maintain the teaching tone and clarity.

Content to translate:
{content}"""
        return await self.generate(prompt)

    async def translate_quiz(self, quiz_data: dict, target_lang: str) -> dict:
        questions = quiz_data.get("questions", quiz_data)
        prompt = f"""Translate these quiz questions to {self.supported_languages.get(target_lang, target_lang)}.
Keep answers and code samples in their original form.
Maintain educational accuracy.

Quiz data:
{str(questions)}"""
        result = await self.generate(prompt)
        return self.extract_json(result)
