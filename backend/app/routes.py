from fastapi import APIRouter
from app.services import get_ai_response
from app.schemas import ChatRequest, ChatResponse

chatbot_router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

@chatbot_router.post("/message", response_model=ChatResponse)
async def handle_message(chat_request: ChatRequest):
    """
    사용자 메시지를 받아 OpenAI API를 호출한 결과를 반환합니다.
    """
    response = await get_ai_response(chat_request.message)
    return ChatResponse(message=response)
