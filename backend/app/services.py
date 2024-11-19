<<<<<<< HEAD
from langchain.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate
from langchain_community.chat_models import ChatOpenAI
from langchain.chains import LLMChain
import os


class PCBudgetAssistant:
    """
    친절한 조립형 PC 견적 전문가 챗봇 클래스
    """

    def __init__(self, api_key: str, model_name: str = "gpt-4", temperature: float = 0.5):
        """
        클래스 초기화
        Args:
            api_key: OpenAI API 키
            model_name: 사용할 OpenAI 모델 이름
            temperature: 모델의 응답 다양성 설정
        """
        self.llm = ChatOpenAI(
            openai_api_key=api_key,
            model_name=model_name,
            temperature=temperature
        )

        # 메시지 템플릿을 올바른 타입으로 생성
        system_message = SystemMessagePromptTemplate.from_template(
            "당신은 친절한 조립형 PC 견적 전문가입니다. "
            "사용자 입력에 조립형 PC 견적을 만드는데 필요한 예산 정보가 충분하다면 대답을 '예산=실제 예산 금액'으로 시작하세요. "
            "사용자 입력에 조립형 PC 견적을 만드는데 필요한 예산 정보가 충분하지 않다면 대답을 '예산=없음'로 시작하세요. "
            "사용자 입력에 조립형 PC 견적을 만드는데 필요한 사용 목적 정보가 충분히 구체적이라면 대답을 '목적=실제 사용 목적'으로 끝내세요. "
            "사용자 입력에 조립형 PC 견적을 만드는데 필요한 사용 목적 정보가 없거나 충분히 구체적이지 않다면 대답을 '목적=없음'로 끝내세요."
            "예산과 목적 중 부족한 정보가 있다면 시작과 끝 부분 사이에는 예산이나 목적만을 더 채우기 위한 역질문을 포함해 주세요."
        )
        user_message = HumanMessagePromptTemplate.from_template("{user_message}")

        # ChatPromptTemplate 초기화
        self.prompt_template = ChatPromptTemplate.from_messages([system_message, user_message])
        self.chain = LLMChain(llm=self.llm, prompt=self.prompt_template)

    async def process_user_input(self, user_message: str, budget: str, purpose: str) -> dict:
        """
        사용자 입력을 처리하여 예산 및 사용 목적을 추출
        Args:
            user_message: 사용자 입력 메시지
        Returns:
            dict: 응답 텍스트와 추출된 예산 및 목적
        """
        try:
            response = await self.chain.arun(user_message=user_message)
            content = response.strip()
            
            # 예산 및 목적 추출
            
            if "예산=" in content:
                budget_part = content.split("예산=")[1].split()[0].strip()
                if budget_part != "없음":
                    budget = budget_part
            
            if "목적=" in content:
                purpose_part = content.split("목적=")[1].strip()
                if purpose_part != "없음":
                    purpose = purpose_part
            
            return {
                "response": content,
                "budget": budget,
                "purpose": purpose
            }
        except Exception as e:
            print(f"LangChain 호출 중 오류 발생: {e}")
            return {
                "response": "요청을 처리하는 중 오류가 발생했습니다.",
                "budget": None,
                "purpose": None
            }
=======
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
>>>>>>> 583c92befffb32b51eb747ed2ce50ee49d10a30e
