from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class AgentRequest(BaseModel):
    agent_type: str
    action: str
    payload: dict

class AgentResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None

class LessonRequest(BaseModel):
    topic: str
    level: str = "beginner"
    language: str = "en"
    student_context: Optional[dict] = None

class DoubtRequest(BaseModel):
    question: str
    lesson_id: str
    lesson_context: str
    language: str = "en"

class CodeRequest(BaseModel):
    code: str
    language: str = "python"
    action: str = "explain"
    error: Optional[str] = None

class QuizRequest(BaseModel):
    topic: str
    num_questions: int = 5
    difficulty: str = "medium"
    language: str = "en"

class ProjectRequest(BaseModel):
    topic: str
    difficulty: str = "medium"

class TranslateRequest(BaseModel):
    content: str
    target_language: str
    source_language: str = "en"

class VoiceRequest(BaseModel):
    text: str
    voice: str = "en-US-Standard-D"
    speed: float = 1.0

class GenerateRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = None
    model: str = "gemini-2.0-flash"
    stream: bool = False
