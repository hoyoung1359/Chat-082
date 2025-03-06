# Chat-082: AI 기반 맞춤형 조립 PC 견적 서비스

## 프로젝트 소개

Chat-082는 조립형 PC 구매 과정의 복잡성과 정보 불균형 문제를 해결하기 위한 혁신적인 크롬 확장프로그램입니다. 인공지능 기술을 활용하여 사용자에게 최적화된 PC 견적 서비스를 제공합니다.

## 시연 영상
> 서비스 사용 방법과 주요 기능을 확인해보세요
> <video src="[https://user-images.githubusercontent.com/...](https://github.com/user-attachments/assets/99d3b6a3-60ac-4ce5-a929-64a82831059e)"></video>


## 주요 기능

### 1. 맞춤형 견적 상담
- 자연스러운 대화를 통한 사용자 요구사항 분석
- 가성비/밸런스/고성능 3가지 유형의 맞춤형 견적 제안
- 실시간 견적 수정 및 상담 서비스

### 2. 스마트 쇼핑 지원
- 실시간 자동 제품 탐색
- 원클릭 장바구니 담기 기능
- 가격 비교 및 재고 확인

### 3. 전문적인 정보 제공
- RAG(Retrieval Augmented Generation) 모델 기반 상담
- 신뢰성 있는 부품 정보 제공
- 호환성 자동 체크 시스템

## 기술 스택

- **Frontend**: Chrome Extension, JavaScript
- **Backend**: FASTAPI, LangChain, OpenAI API (GPT-4 모델)
- **AI & 데이터베이스**: RAG, OpenAI "text-embedding-ada-002", NoSQL (AWS DocumentDB)

## 설치 방법

### 사전 요구사항
- Chrome 브라우저
- OpenAI API 키

### 설치 단계
1. 저장소 클론
```bash
git clone [repository-url]
```

2. API 키 설정
```javascript
// Chrome/config.js
export const OPENAI_API_KEY = '당신의_API_키';
```

3. 크롬 확장프로그램 설치
- Chrome 브라우저에서 `chrome://extensions/` 접속
- 개발자 모드 활성화
- "압축해제된 확장 프로그램을 로드합니다" 클릭
- `Chrome` 디렉토리 선택

## 보안 주의사항

- `config.js`는 반드시 `.gitignore`에 포함하여 관리
- API 키가 포함된 파일 커밋 금지
- API 키 노출 시 즉시 재발급 필요

## 프로젝트 참여

### 개발 가이드라인
1. 기능별 개별 브랜치에서 개발
2. 개발 완료 후 main 브랜치에 PR 요청
3. 코드 리뷰 후 병합

### 팀 구성
- Frontend/Chrome Extension 개발
- Backend/RAG 구현
- 데이터 수집 및 가공
- UI/UX 디자인

## 기대 효과

- 컴퓨터 구매 시간 및 비용 절감 (10분 내외 견적 완성)
- 시장 정보 불균형 해소
- 투명하고 신뢰성 있는 구매 경험 제공

## 참고 자료

- [프로젝트 보고서](https://docs.google.com/document/u/1/d/1O05Q06-aaC--19eQLkiT3rnmLOSTyPLa67kFXkYSFoI/mobilebasic)

