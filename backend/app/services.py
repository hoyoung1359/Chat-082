from langchain.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate
from langchain_community.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from app.read_filter import read_all_filters, read_one_filter
import json


def make_string_to_dict(string: str) -> dict:
    """
    문자열을 dict 형식으로 변환
    Args:
        string: dict 형식으로 변환할 문자열
    Returns:
        dict: dict 형식으로 변환된 결과
    """
    start_index = string.find("{")  # '{' 위치 찾기
    end_index = string.rfind("}")  # '}' 위치 찾기
    if start_index != -1 and end_index != -1:
        # JSON 부분만 추출
        string = string[start_index:end_index + 1] # JSON 부분만 추출
    try:
        dictionary = json.loads(string)
    except json.JSONDecodeError as e:
        print(f"Invalid JSON: {e}")
    return dictionary

class PCBudgetAssistant:
    """
    친절한 조립형 PC 견적 전문가 챗봇 클래스
    """

    def __init__(self, api_key: str, model_name: str = "gpt-4o", temperature: float = 0.5):
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
            "PC 견적을 만드는데 필요하지 않은 대화를 요청할 경우 아주 친절하게 PC 견적에 필요한 대화로 유도해 주세요."
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
                "history": [],
                "CPU": {},
                "메인보드": {},
                "메모리": {},
                "그래픽카드": {},
                "파워": {},
                "SSD": {}
            }

        user_state = self.user_states[user_id]
        budget = user_state["budget"]
        purpose = user_state["purpose"]
        history = user_state["history"]
        prompt = (
            f"시스템이 이미 알고 있는 사용자의 예산 정보는 {budget}이며, 사용 목적 정보는 '{purpose}'입니다. "
            "사용자의 예산과 목적 정보에 새로운 것이 있다면 추출하고, 없다면 이전 정보를 유지해주세요. "
            """
            반드시 다음과 같은 JSON 구조로 대답해주세요.:
            {
            "예산": "PC의 예산 범위 또는 금액",
            "목적": "사용자의 PC 사용 목적",
            "대답": "당신(AI Assistant)의 대답"
            }
            json이라는 단어가 포함될 
            """
            "예산과 목적이 충분히 구체적이지 않다면, 각각의 value에 '없음'을 입력해 주세요. "
            "예산과 목적 중 부족한 정보가 있다면 대답에는 예산이나 목적만을 더 채우기 위한 역질문을 포함해 주세요. "
            "예산은 구체적인 금액이 정해지지 않았다면, 사용자가 범위를 제공한 것도 허용됩니다. "
            "특히, 사용자가 그냥 게임이나 프로그램이라고 하면 어떤 게임이나 프로그램인지 더 구체적으로 들을 수 있게 다시 질문해 주세요. "
            "사용자가 예산 및 목적 구체화를 포기한 것이 확신되면, '예산'의 'value'를 불분명, '목적'의 value를 '불분명', 대답에는 그래도 일반적인 견적이라도 맞출 것인지 질문해주세요. "
            "또한 하고 싶은 말은 최대한 친절하지만 예산과 목적 중 한번에 하나만 물어보고 최대한 간결하게 작성해주세요. "
            "예산과 목적 정보가 충분하다고 생각되면 더 요구할 것이 있는지 물어보세요. "
            "사용자가 PC 견적과 전혀 관련 없는 얘기를 할 경우, PC 견적과 관련된 얘기로 유도해 주세요. "
            "사용자가 더 요구할 사항이 없다고 대답하면 '견적뽑기'를 클릭해달라고 얘기해주세요."
            "다음은 이전 대화 내용입니다: "
            f"{' '.join(history) if history else '이전 대화 내용 없음'}."
            "다음은 현재 사용자 메시지입니다. "
            f"현재 사용자 메시지: {user_message}"
            )
        try:
            # 대화 기록과 함께 LangChain 호출
            response = await self.chain.arun(user_message=prompt)
            response_dict = make_string_to_dict(response)
            
            # 예산 및 목적 추출
            budget_tmp = response_dict.get("예산", budget)
            purpose_tmp = response_dict.get("목적", purpose)
            if budget_tmp != "없음":
                budget = budget_tmp
            if purpose_tmp != "없음":
                purpose = purpose_tmp
            content = response_dict.get("대답", "")
            
            # 상태 업데이트
            user_state["budget"] = budget
            user_state["purpose"] = purpose
            user_message = "user:" + user_message
            user_state["history"].append(user_message)
            content_history = "assistant:" + content
            user_state["history"].append(content_history)  # 대화 기록 추가
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
        try :
            filter_info = read_all_filters()
        except Exception as e:
            print(f"부품 필터 읽기 중 오류 발생: {e}")
            return {"response": "부품 필터를 읽는 중 오류가 발생했습니다. 다시 시도해주세요."}

        if budget == "없음" or purpose == "없음":
            print("예산 또는 목적 정보가 없습니다.")
            return {"response": "견적을 생성하려면 예산과 목적이 필요합니다. 추가 정보를 입력해주세요."}

        # GPT에게 요청할 입력 메시지 생성
        prompt = (
            f"사용자의 예산은 {budget}이며, 사용 목적은 '{purpose}'입니다. "
            f"{filter_info}의 내용 속에 있는 시리즈만으로 각 부품의 시리즈를 골라서 견적을 완성하되, 반드시 예산을 초과하지 않는 선에서 사용 목적에 맞게 선택해주세요. "
            "총 세 종류의 견적을 제시해주세요. 가성비, 밸런스, 고성능 순으로 견적을 제시해주세요. "
            "모든 견적은 호환성을 고려해 부품을 선택해야 합니다. "
            "출력 예시는 다음과 같습니다. 예시일 뿐이므로 구조를 참고하고 내용은 무시하세요. "
            """
            {
                "가성비": {
                "CPU": "라이젠 5",
                "메모리": "16GB",
                "그래픽카드": "GTX 1660 SUPER",
                "메인보드": "AMD-B450",
                "SSD": "480~512GB",
                "파워": "400~499W"
                "이유": "배틀그라운드를 중간 옵션 이상에서 즐길 수 있도록 GTX 1660 SUPER 그래픽카드를 사용하는 견적을 추천하였습니다. 이 구성은 60fps 이상의 안정적인 성능을 제공하며, 발열을 최소화하여 장시간 쾌적한 게임 환경을 보장합니다. 예산 120만 원 내에서 제안하는 가성비 견적입니다."
                },
                "밸런스": {
                "CPU": "라이젠 5",
                "메모리": "16GB",
                "그래픽카드": "RTX 3060Ti",
                "메인보드": "AMD-B550",
                "SSD": "960GB~1TB",
                "파워": "500~599W"
                "이유": "배틀그라운드를 고옵션에서 즐길 수 있도록 RTX 3060Ti 그래픽카드를 사용하는 견적을 추천하였습니다. 이 구성은 120fps 이상의 성능을 제공하며, 고사양 게임에도 부드러운 그래픽을 제공합니다. 예산 150만 원 내에서 제안하는 밸런스 견적입니다."
                },
                "고성능": {
                "CPU": "라이젠 7",
                "메모리": "32GB",
                "그래픽카드": "RTX 4080 SUPER",
                "메인보드": "AMD-X570",
                "SSD": "1.5~4TB",
                "파워": "700~799W"
                "이유": "배틀그라운드를 고옵션에서 즐길 수 있도록 RTX 4080 SUPER을 추천하였습니다. 120fps 이상의 성능과 부드러운 그래픽을 제공하며, 장시간 안정적인 게임 플레이가 가능합니다. 고사양 게임에 최적화된 구성입니다."
            }
            }
            """
            "단, 대화 형식이 아니라 출력 예시의 json 구조를 반드시 맞춰서 견적을 제시해주세요." 
            "이유에는 각 견적의 부품들 선택 이유 모두를 간단히 작성해주세요. "
            "다음은 사용자와 AI 어시트턴트의 이전 대화 내용입니다. PC 견적을 맞추는데 참고할 만한 내용만 참고해 주세요. "
            f"{' '.join(history) if history else '이전 대화 내용 없음'}."
        )

        try:
            # LangChain 호출
            # 대화 기록과 함께 LangChain 호출
            response = await self.chain.arun(user_message=prompt)
            return make_string_to_dict(response)
        except Exception as e:
            print(f"GPT 호출 중 오류 발생: {e}")
            return {"response": "견적을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요."}

    async def select_parts(self, user_id: str, parts_data: dict) -> dict:
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
        else:
            parts_data = json.dumps(parts_data, ensure_ascii=False, indent=4)
        if user_id not in self.user_states:
            return {"response": "사용자 상태를 찾을 수 없습니다. 먼저 대화를 시작해주세요."}
        user_state = self.user_states[user_id]
        budget = user_state["budget"]
        purpose = user_state["purpose"]
        history = user_state["history"]
        prompt = (
            f"사용자의 예산은 {budget}이며, 사용 목적은 '{purpose}'입니다. "
            "사용자의 예산과 목적에 맞는 부품들을 선택해주세요. "
            "예산을 최대한 초과하지 않아야 합니다. "
            f"부품 리스트는 다음과 같습니다:{parts_data}"
            "아래는 PC의 출력 형식이며, 예시일 뿐이므로 구조를 참고하세요. "
            """
            { "CPU": { "제품명": "", "부품 설명": "", "상세 스펙": { "소켓": "", "공정": "", "코어": "", "기본 클럭": "", "최대 클럭": "", "메모리 규격": "", }, "선택 이유": "" }, "메인보드": { "제품명": "", "부품 설명": "", "상세 스펙": { "소켓": "", "폼팩터": "", "메모리 지원": "", "확장 슬롯": "", "네트워크": "", }, "선택 이유": "" }, "메모리": { "제품명": "", "부품 설명": "", "상세 스펙": { "타입": "", "용량": "", "클럭 속도": "", "레이턴시": "", }, "선택 이유": "" }, "그래픽카드": { "제품명": "", "부품 설명": "", "상세 스펙": { "메모리": "", "코어 클럭": "", "전력 소모": "", "출력 포트": "", }, "선택 이유": "" }, "파워": { "제품명": "", "부품 설명": "", "상세 스펙": { "출력 용량": "", "효율 등급": "", "케이블 타입": "", "팬 크기": "", "보증 기간": "", }, "선택 이유": "" }, "SSD": { "제품명": "", "부품 설명": "", "상세 스펙": { "용량": "", "인터페이스": "", "읽기 속도": "", "쓰기 속도": "", "폼팩터": "", }, "선택 이유": "" } }
            """
            "단, 대화 형식이 아니라 출력 예시의 json 구조를 반드시 맞춰서 부품 리스트에 있는 실제 부품명만을 선택해주세요."
            "다음은 사용자와 AI 어시트턴트의 이전 대화 내용입니다. 부품을 선택하는데 참고할 만한 내용이 있다면 참고해주세요."
            f"{' '.join(history) if history else '이전 대화 내용 없음'}."
        )
        try:
            # LangChain 호출
            response = await self.chain.arun(user_message=prompt)
            dic = make_string_to_dict(response)
            if user_state["CPU"] != {}:
                user_state["CPU"] = dic["CPU"]
            if user_state["메인보드"] != {}:
                user_state["메인보드"] = dic["메인보드"]
            if user_state["메모리"] != {}:
                user_state["메모리"] = dic["메모리"]
            if user_state["그래픽카드"] != {}:
                user_state["그래픽카드"] = dic["그래픽카드"]
            if user_state["파워"] != {}:
                user_state["파워"] = dic["파워"]
            if user_state["SSD"] != {}:
                user_state["SSD"] = dic["SSD"]
            return dic
        except Exception as e:
            print(f"GPT 호출 중 오류 발생: {e}")
            return {"response": "부품을 선택하는 중 오류가 발생했습니다. 다시 시도해주세요."}
    
    async def answer_user_question(self, user_id: str, user_message: str) -> dict:
        """
        사용자가 추가 질문을 했을 때 적절히 대답을 생성하는 함수
        Args:
            user_id: 사용자 ID
            user_message: 사용자가 입력한 추가 질문
        Returns:
            dict: GPT 응답 및 현재 상태
        """
        if user_id not in self.user_states:
            return {"response": "사용자 상태를 찾을 수 없습니다. 먼저 대화를 시작해주세요."}

        user_state = self.user_states[user_id]
        budget = user_state["budget"]
        purpose = user_state["purpose"]
        history = user_state["history"]
        cpu = json.dumps(user_state["CPU"])
        mainboard = json.dumps(user_state["메인보드"])
        memory = json.dumps(user_state["메모리"])
        gpu = json.dumps(user_state["그래픽카드"])
        power = json.dumps(user_state["파워"])
        ssd = json.dumps(user_state["SSD"])
        # 추가 질문에 대한 적절한 답변을 생성하는 프롬프트
        prompt = (
            "친절하고 전문적인 답변을 제공하세요. "
            "답변은 가능한 간단하고 명확하게 작성하되, 사용자가 원하면 더 깊이 있는 설명을 추가하도록 유도하세요. "
            "질문이 PC 견적과 관련이 없더라도, 관련 주제로 대화를 다시 유도하는 답변을 추가해주세요."
            "현재 사용자의 장바구니에 담겨 있는 부품은 다음과 같습니다:"
            f"CPU: {cpu}, 메인보드: {mainboard}, 메모리: {memory}, 그래픽카드: {gpu}, 파워: {power}, SSD: {ssd}."
            """
            편집에는 사용자가 현재 완성된 견적에 대해 특정 부품을 변경하거나 추가하고 싶은 의도가 있다고 확신하면 그 부품의 종류를 '편집부품'에 적고, 그렇지 않으면 'X'로 적어주세요.
            반드시 다음과 같은 JSON 구조로 대답해주세요.:
            {
            "대답": "당신(AI Assistant)의 대답",
            "편집부품": "CPU/메인보드/그래픽카드/메모리/SSD/파워X"
            "시리즈명": "
            }
            f"다음은 이전 대화 내용입니다: {' '.join(history) if history else '이전 대화 내용 없음'}.\n"
            f"현재 사용자의 예산 정보는 '{budget}', 사용 목적은 '{purpose}'입니다.\n"
            f"사용자가 추가적으로 말한 내용은 다음과 같습니다: '{user_message}'\n"
            """
        )
        
        try:
            # LangChain 호출
            response = await self.chain.arun(user_message=prompt)
            response_dict = make_string_to_dict(response)
            # 대화 기록 업데이트
            user_state["history"].append(f"user:{user_message}")
            user_state["history"].append(f"assistant:{response}")

            return response_dict
        except Exception as e:
            print(f"GPT 호출 중 오류 발생: {e}")
            return {"response": "추가 질문에 응답하는 중 오류가 발생했습니다. 다시 시도해주세요.", "budget": budget, "purpose": purpose}
