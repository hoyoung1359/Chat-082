from pydantic import BaseModel
from typing import List, Dict

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
    parts_data: Dict  # 부품 데이터는 리스트 형태로 전달

class PartsResponse(BaseModel):
    response: str
    selected_part: Dict = None  # 선택된 부품 정보


class UserQuestionRequest(BaseModel):
    user_id: str
    message: str

class UserQuestionResponse(BaseModel):
    answer: str
    part: str
    edit: str