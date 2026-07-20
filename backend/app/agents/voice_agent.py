from .base import BaseAgent
import httpx
import base64

class VoiceAgent(BaseAgent):
    def __init__(self):
        super().__init__()

    async def text_to_speech(self, text: str, voice: str = "en-US-Standard-D", speed: float = 1.0) -> bytes:
        url = f"https://texttospeech.googleapis.com/v1/text:synthesize"
        payload = {
            "input": {"text": text[:5000]},
            "voice": {
                "languageCode": "en-US",
                "name": voice,
            },
            "audioConfig": {
                "audioEncoding": "MP3",
                "speakingRate": speed,
            },
        }
        params = {"key": self.api_key}
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, params=params)
            if resp.status_code == 200:
                return base64.b64decode(resp.json()["audioContent"])
            return b""

    async def generate_lesson_script(self, topic: str, duration_minutes: int = 5) -> str:
        prompt = f"""Write a natural, conversational lesson script about "{topic}" 
that takes approximately {duration_minutes} minutes to speak.
Use natural pauses, emphasis, and engaging teaching language.
Include verbal cues like "Let's understand this..." and "Now, notice how..."
The script should flow like a real teacher explaining to a student."""
        return await self.generate(prompt)

    async def translate_speech(self, text: str, target_language: str) -> str:
        prompt = f"""Translate this educational content to {target_language} while maintaining the teaching tone and clarity.
Keep technical terms in their original form if there's no good translation.
Translate:\n\n{text}"""
        return await self.generate(prompt)
