from fastapi import APIRouter, HTTPException
from app.schemas import ChatRequest, ChatResponse, EstimateRequest, EstimateResponse, PartsRequest, PartsResponse
from app.services import PCBudgetAssistant
import os
from dotenv import load_dotenv

load_dotenv()

# FastAPI Router 생성
chatbot_router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

# PCBudgetAssistant 초기화
chatbot = PCBudgetAssistant(api_key=os.environ.get("OPENAI_API_KEY"))


@chatbot_router.post("/message", response_model=ChatResponse)
async def handle_message(chat_request: ChatRequest):
    """
    사용자 메시지를 받아 OpenAI API를 호출한 결과를 반환합니다.
    """
    try:
        # 사용자 메시지 처리
        response_dict = await chatbot.process_user_input(
            user_id=chat_request.user_id,  # 사용자 ID 전달
            user_message=chat_request.message
        )
        next_step = False
        # 예산과 목적 업데이트
        budget = response_dict["budget"]
        purpose = response_dict["purpose"]
        if budget != "없음" and purpose != "없음":
            next_step = True
        response_message = response_dict["response"]
        return ChatResponse(
            message=response_message,
            budget=budget,
            purpose=purpose,
            next_step=next_step
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {e}")


@chatbot_router.post("/generate-estimate", response_model=EstimateResponse)
async def generate_estimate(estimate_request: EstimateRequest):
    """
    사용자 ID를 기반으로 PC 견적을 생성합니다.
    """
    try:
        response = await chatbot.generate_estimate(user_id=estimate_request.user_id)
        return EstimateResponse(response=response["response"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"견적 생성 오류: {e}")


@chatbot_router.post("/select-parts", response_model=PartsResponse)
async def select_parts(parts_request: PartsRequest):
    """
    부품 데이터를 기반으로 최적의 부품을 선택합니다.
    """
    try:
        response = await chatbot.select_parts(
            user_id=parts_request.user_id,
            parts_data=parts_request.parts_data
        )
        return PartsResponse(response=response["response"], selected_part=response.get("selected_part"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"부품 선택 오류: {e}")
