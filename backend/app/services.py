from langchain.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate
from langchain_community.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from app.read_filter import read_all_filters, read_one_filter


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

        # 메시지 템플릿 생성
        system_message = SystemMessagePromptTemplate.from_template(
            "당신은 친절한 조립형 PC 견적 전문가입니다. 사용자의 요구에 친절하고 전문적이되, 부품명을 제외한 어려운 단어를 최대한 사용하지 않고 답변해주세요."
        )
        user_message = HumanMessagePromptTemplate.from_template("{user_message}")

        # ChatPromptTemplate 초기화
        self.prompt_template = ChatPromptTemplate.from_messages([system_message, user_message])
        self.chain = LLMChain(llm=self.llm, prompt=self.prompt_template)

        # 사용자 상태 저장소
        self.user_states = {}

    async def process_user_input(self, user_id: str, user_message: str) -> dict:
        """
        사용자 입력을 처리하여 예산 및 사용 목적을 추출
        Args:
            user_id: 사용자 ID (상태를 유지하기 위해 필요)
            user_message: 사용자 입력 메시지
        Returns:
            dict: 응답 텍스트와 추출된 예산 및 목적
        """
        # 사용자 상태 초기화 또는 로드
        if user_id not in self.user_states:
            self.user_states[user_id] = {
                "budget": "없음",
                "purpose": "없음",
                "history": []
            }

        user_state = self.user_states[user_id]
        budget = user_state["budget"]
        purpose = user_state["purpose"]
        prompt = ("사용자 입력에 조립형 PC 견적을 만드는데 필요한 예산 정보가 충분하다면 대답을 '예산=실제 예산 금액'으로 시작하세요. "
            "사용자 입력에 조립형 PC 견적을 만드는데 필요한 예산 정보가 충분하지 않다면 대답을 '예산=없음'로 시작하세요. "
            "사용자 입력에 조립형 PC 견적을 만드는데 필요한 사용 목적 정보가 충분히 구체적이라면 대답을 '목적=실제 사용 목적'으로 끝내세요. "
            "사용자 입력에 조립형 PC 견적을 만드는데 필요한 사용 목적 정보가 없거나 충분히 구체적이지 않다면 대답을 '목적=없음'로 끝내세요."
            "예산과 목적 중 부족한 정보가 있다면 시작과 끝 부분 사이에는 예산이나 목적만을 더 채우기 위한 역질문을 포함해 주세요."
            )
        combined_message = f"{prompt} {user_message}"
        try:
            # 대화 기록과 함께 LangChain 호출
            response = await self.chain.arun(user_message=combined_message)
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
            
            # 상태 업데이트
            content = content.replace(f"예산={budget}", "").replace(f"목적={purpose}", "").strip()
            
            user_state["budget"] = budget
            user_state["purpose"] = purpose
            user_state["history"].append(user_message)  # 대화 기록 추가
            return {
                "response": content,
                "budget": budget,
                "purpose": purpose
            }
        except Exception as e:
            print(f"LangChain 호출 중 오류 발생: {e}")
            return {
                "response": "요청을 처리하는 중 오류가 발생했습니다.",
                "budget": budget,
                "purpose": purpose
            }
    async def generate_estimate(self, user_id: str) -> dict:
        """
        사용자 ID로 저장된 예산과 목적에 맞는 견적 생성
        Args:
            user_id: 사용자 ID
        Returns:
            dict: GPT가 생성한 문장형 견적 정보
        """
        if user_id not in self.user_states:
            return {"response": "사용자 상태를 찾을 수 없습니다. 먼저 대화를 시작해주세요."}

        user_state = self.user_states[user_id]
        budget = user_state["budget"]
        purpose = user_state["purpose"]
        history = user_state["history"]
        filter_info = read_all_filters()

        if budget == "없음" or purpose == "없음":
            return {"response": "견적을 생성하려면 예산과 목적이 필요합니다. 추가 정보를 입력해주세요."}

        # GPT에게 요청할 입력 메시지 생성
        prompt = (
            f"사용자의 예산은 {budget}이며, 사용 목적은 '{purpose}'입니다. "
            f"{filter_info}의 내용 속에 있는 시리즈만으로 각 부품의 시리즈를 골라서 견적을 완성하되, 예산을 초과하지 않는 선에서 사용 목적에 맞게 선택해주세요."
            "총 세 종류의 견적을 제시해주세요. 가성비, 밸런스, 고성능 순으로 견적을 제시해주세요. "
            f"{' '.join(history[-3:]) if history else '이전 대화 내용 없음'}."
            "출력 예시는 다음과 같습니다."
            "가성비= CPU: 라이젠 5 메모리: 16GB 그래픽카드: GTX 1660 SUPER 메인보드: AMD-B450 SSD: 480~512GB 파워: 400~499W, 밸런스= CPU: 라이젠 5 메모리: 16GB 그래픽카드: RTX 3060Ti 메인보드: AMD-B550 SSD: 960GB~1TB 파워: 500~599W, 고성능= CPU: 라이젠 7 메모리: 32GB 그래픽카드: RTX 4080 SUPER 메인보드: AMD-X570 SSD: 1.5~4TB 파워: 700~799W"
            "단, 대화 형식이 아니라 출력 예시의 형식을 반드시 맞춰서 견적을 제시해주세요." 
        )

        try:
            # LangChain 호출
            response = await self.chain.arun(user_message=prompt)
            return {"response": response.strip()}
        except Exception as e:
            print(f"GPT 호출 중 오류 발생: {e}")
            return {"response": "견적을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요."}
'''
    async def select_parts(self, user_id: str, parts_data: list) -> dict:
        """
        부품 데이터를 GPT를 통해 최적의 부품 추천
        Args:
            user_id: 사용자 ID
            parts_data: 부품 목록 (딕셔너리 리스트)
        Returns:
            dict: GPT가 생성한 문장형 부품 추천 응답
        """
        if not parts_data:
            return {"response": "부품 데이터가 비어 있습니다. 유효한 데이터를 입력해주세요."}

        if user_id not in self.user_states:
            return {"response": "사용자 상태를 찾을 수 없습니다. 먼저 대화를 시작해주세요."}

        user_state = self.user_states[user_id]
        budget = user_state["budget"]
        purpose = user_state["purpose"]
        history = user_state["history"]

        # GPT에게 요청할 입력 메시지 생성
        parts_description = "\n".join(
            [f"{idx+1}. {part['name']} - 가격 대비 성능: {part['value_for_money']}" for idx, part in enumerate(parts_data)]
        )

        prompt = (
            f"사용자의 예산은 {budget}이며, 사용 목적은 '{purpose}'입니다. "
            "다음은 선택 가능한 부품 목록입니다:\n"
            f"{parts_description}\n\n"
            "이 정보를 기반으로 가장 적합한 부품을 선택하고 이유를 설명해주세요. "
            "참고로 사용자는 이전 대화에서 이렇게 이야기했습니다: "
            f"{' '.join(history[-3:]) if history else '이전 대화 내용 없음'}."
        )

        try:
            # LangChain 호출
            response = await self.chain.arun(user_message=prompt)
            return {"response": response.strip()}
        except Exception as e:
            print(f"GPT 호출 중 오류 발생: {e}")
            return {"response": "부품을 선택하는 중 오류가 발생했습니다. 다시 시도해주세요."}
'''