from pydantic import BaseModel

class ChatRequest(BaseModel):
    """
    사용자의 메시지 요청 스키마
    """
    message: str

class ChatResponse(BaseModel):
    """
    AI의 응답 반환 스키마
    """
    message: str
