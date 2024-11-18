import openai
import os
from dotenv import load_dotenv

# OpenAI API 키를 환경 변수로 관리
load_dotenv()
openai.api_key = os.environ.get("OPENAI_API_KEY")

async def get_ai_response(user_message: str) -> str:
    """
    OpenAI API를 호출하여 AI 응답을 반환합니다.
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": (
                    "You are a custom PC purchase guide expert. "
                    "Answer user questions clearly and concisely about selecting computer parts."
                )},
                {"role": "user", "content": user_message}
            ],
            max_tokens=300,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error during OpenAI API call: {e}")
        return "Sorry, there was an error processing your request."
