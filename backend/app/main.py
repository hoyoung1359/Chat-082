from fastapi import FastAPI
from app.routes import chatbot_router

app = FastAPI(
    title="Chat-082: Custom PC Purchase Guide",
    description="A chatbot API to guide users in purchasing custom-built PCs.",
    version="1.0.0"
)

# 라우트 등록
app.include_router(chatbot_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Chat-082 API!"}
