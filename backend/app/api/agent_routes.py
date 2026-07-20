from fastapi import APIRouter, Depends, HTTPException, Header, Request
from fastapi.responses import StreamingResponse
from ..agents.teacher_agent import TeacherAgent
from ..agents.curriculum_agent import CurriculumAgent
from ..agents.coding_agent import CodingAgent
from ..agents.voice_agent import VoiceAgent
from ..agents.memory_agent import MemoryAgent
from ..agents.translation_agent import TranslationAgent
from ..agents.analytics_agent import AnalyticsAgent
from ..core.security import verify_firebase_token, rate_limit
from ..schemas.agent_schemas import (
    AgentRequest, AgentResponse, LessonRequest, DoubtRequest,
    CodeRequest, QuizRequest, ProjectRequest, TranslateRequest,
    GenerateRequest
)

router = APIRouter()

teacher = TeacherAgent()
curriculum = CurriculumAgent()
coder = CodingAgent()
voice = VoiceAgent()
memory = MemoryAgent()
translator = TranslationAgent()
analytics = AnalyticsAgent()

@router.post("/teach/lesson", response_model=AgentResponse)
async def teach_lesson(req: LessonRequest, user=Depends(verify_firebase_token)):
    try:
        data = await teacher.generate_lesson(req.topic, req.level)
        if req.language != "en":
            translated = await translator.translate_content(str(data), "en", req.language)
            data = translator.extract_json(translated)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/teach/doubt", response_model=AgentResponse)
async def resolve_doubt(req: DoubtRequest, user=Depends(verify_firebase_token)):
    try:
        data = await teacher.answer_doubt(req.question, req.lesson_context)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/curriculum/course", response_model=AgentResponse)
async def generate_course(req: LessonRequest, user=Depends(verify_firebase_token)):
    try:
        data = await curriculum.generate_course(req.topic, req.level)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/curriculum/quiz", response_model=AgentResponse)
async def generate_quiz(req: QuizRequest, user=Depends(verify_firebase_token)):
    try:
        data = await curriculum.generate_quiz(req.topic, req.num_questions)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/curriculum/project", response_model=AgentResponse)
async def generate_project(req: ProjectRequest, user=Depends(verify_firebase_token)):
    try:
        data = await curriculum.generate_project(req.topic, req.difficulty)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code/explain", response_model=AgentResponse)
async def explain_code(req: CodeRequest, user=Depends(verify_firebase_token)):
    try:
        data = await coder.explain_code(req.code, req.language)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code/generate", response_model=AgentResponse)
async def generate_code(req: CodeRequest, user=Depends(verify_firebase_token)):
    try:
        data = await coder.generate_code(req.code, req.language)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code/debug", response_model=AgentResponse)
async def debug_code(req: CodeRequest, user=Depends(verify_firebase_token)):
    try:
        error = req.error or ""
        data = await coder.debug_code(req.code, error, req.language)
        return AgentResponse(success=True, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voice/generate", response_model=AgentResponse)
async def generate_voice(req: dict, user=Depends(verify_firebase_token)):
    try:
        script = await voice.generate_lesson_script(req.get("topic", ""), req.get("duration", 5))
        return AgentResponse(success=True, data={"script": script})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/memory/analyze", response_model=AgentResponse)
async def analyze_student(data: dict, user=Depends(verify_firebase_token)):
    try:
        result = await memory.analyze_progress(data)
        return AgentResponse(success=True, data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/translate", response_model=AgentResponse)
async def translate_content(req: TranslateRequest, user=Depends(verify_firebase_token)):
    try:
        result = await translator.translate_content(req.content, req.source_language, req.target_language)
        return AgentResponse(success=True, data={"translated": result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analytics/report", response_model=AgentResponse)
async def generate_report(data: dict, user=Depends(verify_firebase_token)):
    try:
        result = await analytics.generate_report(data)
        return AgentResponse(success=True, data={"report": result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/public/ask")
async def public_ask(req: GenerateRequest, request: Request):
    """Public endpoint - no auth required. Ask the AI anything."""
    ip = request.client.host if request.client else "unknown"
    if not await rate_limit(f"rate_limit:public_ask:{ip}", limit=10, window=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")

    from ..agents.base import BaseAgent, RateLimitFallback
    agent = BaseAgent()
    # Force a strict general teaching prompt to avoid jailbreaks/injection
    agent.system_prompt = "You are a helpful education AI assistant. Provide concise, clear explanations."

    async def fallback(prompt):
        from ..agents.base import BaseAgent
        mock = BaseAgent()
        return mock._mock_response(prompt, "general")

    agent.set_fallback(fallback)
    try:
        result = await agent.generate(req.prompt)
        return {"success": True, "data": {"response": result}}
    except RateLimitFallback:
        result = await fallback(req.prompt)
        return {"success": True, "data": {"response": result}}

@router.post("/public/generate-lesson")
async def public_generate_lesson(request: Request, topic: str = "Python", level: str = "beginner"):
    """Public endpoint - generate a lesson without auth."""
    ip = request.client.host if request.client else "unknown"
    if not await rate_limit(f"rate_limit:public_gen:{ip}", limit=5, window=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")

    lesson = await teacher.generate_lesson(topic, level)
    return {"success": True, "data": lesson}

@router.post("/generate/stream")
async def generate_stream(req: GenerateRequest, user=Depends(verify_firebase_token)):
    from ..agents.base import BaseAgent
    agent = BaseAgent()
    agent.system_prompt = req.system_prompt or ""
    return StreamingResponse(
        agent.generate_stream(req.prompt),
        media_type="text/event-stream"
    )
