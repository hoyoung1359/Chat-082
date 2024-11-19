from pydantic import BaseModel

class ChatRequest(BaseModel):
    """
    사용자의 메시지 요청 스키마
    """
    message: str
<<<<<<< HEAD
    budget: str
    purpose: str
=======
>>>>>>> 583c92befffb32b51eb747ed2ce50ee49d10a30e

class ChatResponse(BaseModel):
    """
    AI의 응답 반환 스키마
    """
    message: str
<<<<<<< HEAD
    budget: str
    purpose: str
=======
>>>>>>> 583c92befffb32b51eb747ed2ce50ee49d10a30e
