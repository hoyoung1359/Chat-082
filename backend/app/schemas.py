from pydantic import BaseModel
from typing import Dict, Any

# 기존 ChatRequest와 ChatResponse
class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    message: str
    budget: str
    purpose: str
    next_step: bool

# 새로운 스키마 정의
class EstimateRequest(BaseModel):
    user_id: str

class EstimateResponse(BaseModel):
    response: Dict

class PartsRequest(BaseModel):
    user_id: str
    parts_data: Dict  # 부품 정보

class PartsResponse(BaseModel):
    response: Dict  # 선택된 부품 정보


class UserQuestionRequest(BaseModel):
    user_id: str
    question: str

class UserQuestionResponse(BaseModel):
    answer: str
    edit: bool