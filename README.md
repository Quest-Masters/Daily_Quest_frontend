# Daily Quest

매일의 목표를 관리하고 달성하는 퀘스트 기반 할 일 관리 애플리케이션

## 주요 기능

### 사용자 인증
- 일반 회원가입 및 로그인
- 소셜 로그인 (카카오, 구글)
- JWT 기반 인증 및 자동 로그인
- 토큰 자동 갱신

### 퀘스트 관리
- 일일 퀘스트 생성 및 관리
- 퀘스트 완료 체크
- 캘린더 기반 퀘스트 조회
- AI 기반 퀘스트 추천

## 기술 스택

### Frontend
- Vue 3 (Composition API)
- Pinia (상태 관리)
- Vue Router (라우팅)
- Axios (HTTP 클라이언트)
- Vite (빌드 도구)

### Backend
- Spring Boot
- Spring Security
- JWT
- OAuth 2.0 (카카오, 구글)

## 프로젝트 설정

### 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 필요한 값을 설정하세요.

```sh
cp .env.example .env
```

### 의존성 설치

```sh
npm install
```

### 개발 서버 실행

```sh
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 빌드

```sh
npm run build
```

### 테스트 실행

```sh
npm run test:unit
```

### 린트 검사

```sh
npm run lint
```

## 소셜 로그인 설정

### 카카오 로그인
1. [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션 등록
2. Redirect URI 설정: `http://localhost:5173/auth/kakao/callback`
3. 백엔드 `.env`에 클라이언트 ID 및 Secret 설정

### 구글 로그인
1. [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth 2.0 클라이언트 생성
2. Redirect URI 설정: `http://localhost:5173/auth/google/callback`
3. 백엔드 `.env`에 클라이언트 ID 및 Secret 설정

## 프로젝트 구조

```
src/
├── assets/          # 정적 리소스 (이미지, 스타일)
├── components/      # 공통 컴포넌트
├── modules/         # 기능별 모듈
│   ├── home/        # 홈 페이지
│   ├── user/        # 사용자 인증 및 프로필
│   │   ├── login/   # 로그인
│   │   ├── register/# 회원가입
│   │   └── auth/    # OAuth 콜백
│   └── quests/      # 퀘스트 관리
├── router/          # 라우팅 설정
├── stores/          # Pinia 스토어
└── utils/           # 유틸리티 함수
```

## 개발 환경

- Node.js 18+
- npm 9+

## IDE 설정

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 사용 권장 (Vetur 비활성화)

## 라이센스

MIT
