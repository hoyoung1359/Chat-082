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
                "history": []
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
            "예산과 목적이 충분히 구체적이지 않다면, 각각의 value에 '없음'을 입력해 주세요."
            "예산과 목적 중 부족한 정보가 있다면 대답에는 예산이나 목적만을 더 채우기 위한 역질문을 포함해 주세요."
            "예산은 구체적인 금액이 정해지지 않았다면, 사용자가 범위를 제공한 것도 허용됩니다."
            "특히, 사용자가 그냥 게임이나 프로그램이라고 하면 어떤 게임이나 프로그램인지 더 구체적으로 들을 수 있게 다시 질문해 주세요."
            "사용자가 예산 및 목적 구체화를 포기한 것이 확신되면, 예산=불분명 목적=불분명 그래도 일반적인 견적을 맞추실 것인지 질문해주세요."
            "또한 하고 싶은 말은 최대한 친절하지만 예산과 목적 중 한번에 하나만 물어보고 최대한 간결하게 작성해주세요."
            "예산과 목적 정보가 충분하다고 생각되면 더 요구할 것이 있는지 물어보세요."
            "다음은 이전 대화 내용입니다: "
            f"{' '.join(history) if history else '이전 대화 내용 없음'}."
            "다음은 현재 사용자 메시지입니다."
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
        filter_info = read_all_filters()

        if budget == "없음" or purpose == "없음":
            return {"response": "견적을 생성하려면 예산과 목적이 필요합니다. 추가 정보를 입력해주세요."}

        # GPT에게 요청할 입력 메시지 생성
        prompt = (
            f"사용자의 예산은 {budget}이며, 사용 목적은 '{purpose}'입니다. "
            f"{filter_info}의 내용 속에 있는 시리즈만으로 각 부품의 시리즈를 골라서 견적을 완성하되, 반드시 예산을 초과하지 않는 선에서 사용 목적에 맞게 선택해주세요."
            "총 세 종류의 견적을 제시해주세요. 가성비, 밸런스, 고성능 순으로 견적을 제시해주세요. "
            "출력 예시는 다음과 같습니다. 예시일 뿐이므로 구조를 참고하고 내용은 무시하세요."
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
            "이유에는 각 견적의 부품들 선택 이유 모두를 간단히 작성해주세요."
            "다음은 사용자와 AI 어시트턴트의 이전 대화 내용입니다. PC 견적을 맞추는데 참고할 만한 내용만 참고해 주세요."
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
            "예산을 최대한 초과하지 않아야 합니다."
            f"부품 리스트는 다음과 같습니다:{parts_data}"
            "아래는 딥러닝 학습을 위한 PC의 출력 예시이며, 예시일 뿐이므로 구조를 참고하세요"
            """
            {
                'CPU': '[AMD] 라이젠7 그래니트 9700X (8코어/16스레드/3.8GHz/대리점정품/쿨러포함) 멀티팩',
                'CPU이유': '라이젠7 9700X는 8코어 16스레드로 멀티스레딩 작업에 최적화되어 있어 딥러닝 학습 시 병렬 처리에 강점이 있습니다. 높은 기본 클럭 속도(3.8GHz)는 데이터 전처리 및 모델 트레이닝 속도를 증가시킵니다.',
                
                '메모리': '[삼성전자] 삼성 DDR5 PC5-44800 [16GB] (5600)',
                '메모리이유': 'DDR5 메모리는 DDR4보다 대역폭이 더 넓어 데이터 처리 속도가 빠릅니다. 16GB는 기본 딥러닝 학습을 위한 최소 권장 사양이며, 5600MHz는 데이터 로드 및 모델 트레이닝 중 높은 성능을 보장합니다.',

                '그래픽카드': '[MSI] GeForce RTX 4060 Ti 벤투스 2X 블랙 OC D6 8GB',
                '그래픽카드이유': 'RTX 4060 Ti는 8GB VRAM과 CUDA 코어를 지원하여 딥러닝 학습에 필수적인 GPU 가속에 적합합니다. 최신 RTX 아키텍처를 활용하여 Tensor Core와 CUDA Core 성능을 극대화할 수 있습니다. 학습 데이터가 크지 않다면 효율적인 선택입니다.',

                '메인보드': '[GIGABYTE] B650M AORUS ELITE AX ICE 제이씨현 (AMD B650/M-ATX)',
                '메인보드이유': 'B650 칩셋은 라이젠7과 완벽히 호환되며, DDR5 메모리와 PCIe 4.0을 지원해 고속 SSD 및 최신 그래픽카드와의 연결에서 병목현상을 줄입니다. 안정적인 전원 공급도 장점입니다.',

                'SSD': '[삼성전자] 공식인증 980 M.2 NVMe 2280 [500GB MZ-V8V500BW]',
                'SSD이유': '삼성 980 M.2 NVMe SSD는 높은 읽기/쓰기 속도를 제공하여 데이터 로드 및 학습 체크포인트 저장 시간을 단축합니다. 500GB는 딥러닝 학습 환경을 구축하기 위한 최소 용량이며, 빠른 속도는 효율적인 학습에 도움을 줍니다.',

                '파워': '[마이크로닉스] Classic II 풀체인지 600W 80PLUS BRONZE 230V EU (ATX/600W) ATX3.1 벌크형',
                '파워이유': '600W 파워는 라이젠7과 RTX 4060 Ti를 안정적으로 구동하기에 충분하며, 80PLUS BRONZE 인증은 에너지 효율이 높아 장시간 학습 작업에도 안정적입니다. 최신 ATX3.1 규격을 지원하여 확장성도 보장합니다.'
            }
            """
            "단, 대화 형식이 아니라 출력 예시의 json 구조를 반드시 맞춰서 부품 리스트에 있는 실제 부품명만을 선택해주세요."
            "다음은 사용자와 AI 어시트턴트의 이전 대화 내용입니다. 부품을 선택하는데 참고할 만한 내용이 있다면 참고해주세요."
            f"{' '.join(history) if history else '이전 대화 내용 없음'}."
        )


        try:
            # LangChain 호출
            response = await self.chain.arun(user_message=prompt)
            return make_string_to_dict(response)
        except Exception as e:
            print(f"GPT 호출 중 오류 발생: {e}")
            return {"response": "부품을 선택하는 중 오류가 발생했습니다. 다시 시도해주세요."}