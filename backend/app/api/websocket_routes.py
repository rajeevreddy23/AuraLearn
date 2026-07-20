from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from ..agents.teacher_agent import TeacherAgent
from ..agents.coding_agent import CodingAgent
from firebase_admin import auth as firebase_auth
import json

router = APIRouter()
teacher = TeacherAgent()
coder = CodingAgent()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        self.active_connections.pop(client_id, None)

    async def send_message(self, message: dict, client_id: str):
        ws = self.active_connections.get(client_id)
        if ws:
            await ws.send_json(message)

manager = ConnectionManager()

@router.websocket("/classroom/{client_id}")
async def classroom_websocket(websocket: WebSocket, client_id: str, token: str = Query(None)):
    if not token:
        await websocket.accept()
        await websocket.close(code=4008)
        return
    try:
        firebase_auth.verify_id_token(token)
    except Exception:
        await websocket.accept()
        await websocket.close(code=4008)
        return

    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action", "")
            payload = data.get("payload", {})

            if action == "ask_doubt":
                answer = await teacher.answer_doubt(
                    payload.get("question", ""),
                    payload.get("context", "")
                )
                await manager.send_message({
                    "type": "doubt_answer",
                    "data": answer
                }, client_id)

            elif action == "generate_content":
                content = await teacher.generate_whiteboard_content(
                    payload.get("topic", ""),
                    payload.get("part", "")
                )
                await manager.send_message({
                    "type": "board_content",
                    "data": {"content": content}
                }, client_id)

            elif action == "explain_code":
                explanation = await coder.explain_code(
                    payload.get("code", ""),
                    payload.get("language", "python")
                )
                await manager.send_message({
                    "type": "code_explanation",
                    "data": explanation
                }, client_id)

            elif action == "ping":
                await manager.send_message({"type": "pong"}, client_id)

    except WebSocketDisconnect:
        manager.disconnect(client_id)
