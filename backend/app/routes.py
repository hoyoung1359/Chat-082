from fastapi import APIRouter
<<<<<<< HEAD
from app.schemas import ChatRequest, ChatResponse
from app.services import PCBudgetAssistant
import os
from dotenv import load_dotenv
load_dotenv()
=======
from app.services import get_ai_response
from app.schemas import ChatRequest, ChatResponse
>>>>>>> 583c92befffb32b51eb747ed2ce50ee49d10a30e

chatbot_router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

@chatbot_router.post("/message", response_model=ChatResponse)
async def handle_message(chat_request: ChatRequest):
    """
    사용자 메시지를 받아 OpenAI API를 호출한 결과를 반환합니다.
    """
<<<<<<< HEAD
    # PCBudgetAssistant 초기화
    chatbot = PCBudgetAssistant(api_key=os.environ.get("OPENAI_API_KEY"))
    
    # 초기 budget과 purpose 값

    # 사용자 메시지 입력 처리
    budget = chat_request.budget
    purpose = chat_request.purpose
    response_dict = await chatbot.process_user_input(chat_request.message, budget, purpose)
    budget = response_dict["budget"]
    purpose = response_dict["purpose"]

    # 조건에 따라 응답 생성
    if budget == "없음" or purpose == "없음":
        # 예산 또는 목적이 부족하면 역질문 응답
        response_message = response_dict["response"]
    else:
        # 예산과 목적이 모두 채워지면 최종 응답
        response_message = "이대로 조립형 PC를 맞춰드릴까요?"

    return ChatResponse(
        message=response_message,
        budget=budget,
        purpose=purpose
    )
=======
    response = await get_ai_response(chat_request.message)
    return ChatResponse(message=response)
>>>>>>> 583c92befffb32b51eb747ed2ce50ee49d10a30e
