# 🖥️ PC Builder Assistant - Chrome Extension

PC Builder Assistant는 컴퓨터 구매를 고민하는 사용자들을 위한 AI 기반 크롬 확장프로그램입니다.

## 📌 주요 기능

- LLM(Large Language Model)을 활용한 맞춤형 PC 구성 추천
- 실시간 채팅 기반 상담 서비스
- 사용자 목적에 맞는 부품 추천

## 🚀 시작하기

### 사전 요구사항

- Chrome 브라우저
- OpenAI API 키

### 설치 방법

1. 이 저장소를 클론합니다
bash
git clone [repository-url]

2. `Chrome` 디렉토리에 `config.js` 파일을 생성하고 다음과 같이 API 키를 설정합니다:
javascript
export const OPENAI_API_KEY = '당신의_API_키';


3. Chrome 브라우저에서 `chrome://extensions/` 접속
4. 개발자 모드 활성화
5. "압축해제된 확장 프로그램을 로드합니다" 클릭
6. `Chrome` 디렉토리를 선택하여 확장프로그램 로드

## ⚠️ 주의사항

- `config.js`는 반드시 `.gitignore`에 포함시켜 관리해야 합니다.
- API 키가 포함된 파일을 실수로 커밋하지 않도록 주의하세요.
- API 키가 노출될 경우 즉시 재발급이 필요합니다.

## 🤝 기여하기

1. 각자 담당한 기능을 개별 브랜치에서 개발
2. 기능 구현 완료 후 main 브랜치에 PR 요청
3. 코드 리뷰 후 main 브랜치에 병합

