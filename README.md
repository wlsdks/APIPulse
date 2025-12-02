# API Pulse

Spring Boot API 헬스 모니터링 & 테스트 도구

## 주요 기능

- **API 자동 추출**: Swagger/OpenAPI 스펙에서 API 엔드포인트 자동 가져오기
- **헬스체크 테스트**: 모든 API를 한 번에 테스트하고 결과 확인
- **스케줄링**: Cron 표현식으로 정기적인 API 테스트 설정
- **알림**: Slack, Discord, Email로 실패 알림 받기
- **대시보드**: 프로젝트별 API 상태를 한눈에 확인

## 기술 스택

### Backend
- **Spring Boot 4.0.0** (Kotlin)
- **Java 21**
- **SQLite / PostgreSQL**
- **Quartz Scheduler**
- **WebFlux (WebClient)**

### Frontend
- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **TanStack Query**

## 빠른 시작

### Docker Compose (권장)

```bash
# 클론
git clone https://github.com/your-org/api-pulse.git
cd api-pulse

# 실행
docker compose up -d

# 접속
open http://localhost:3000
```

### 개발 환경

#### Backend

```bash
cd backend/api-server

# Gradle Wrapper 다운로드 (최초 1회)
gradle wrapper

# 실행
./gradlew bootRun
```

백엔드: http://localhost:8080

#### Frontend

```bash
cd frontend

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

프론트엔드: http://localhost:3000

## 환경 변수

### Backend

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `APIPULSE_PROFILE` | 데이터베이스 프로필 (`sqlite` / `postgresql`) | `sqlite` |
| `APIPULSE_DB_PATH` | SQLite 데이터베이스 경로 | `./apipulse.db` |
| `SERVER_PORT` | 서버 포트 | `8080` |
| `SLACK_WEBHOOK_URL` | Slack 웹훅 URL | - |
| `DISCORD_WEBHOOK_URL` | Discord 웹훅 URL | - |
| `EMAIL_NOTIFICATION_ENABLED` | 이메일 알림 활성화 | `false` |
| `MAIL_HOST` | SMTP 서버 호스트 | `smtp.gmail.com` |
| `MAIL_USERNAME` | SMTP 사용자명 | - |
| `MAIL_PASSWORD` | SMTP 비밀번호 | - |

### Frontend

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api` |

## API 문서

백엔드 실행 후 Swagger UI에서 API 문서 확인:
- http://localhost:8080/swagger-ui.html

## 프로젝트 구조

```
APIPulse/
├── backend/
│   └── api-server/           # Spring Boot 백엔드
│       ├── src/main/kotlin/
│       │   └── com/apipulse/
│       │       ├── controller/   # REST 컨트롤러
│       │       ├── service/      # 비즈니스 로직
│       │       ├── repository/   # 데이터 접근
│       │       ├── model/        # 엔티티
│       │       └── config/       # 설정
│       └── build.gradle.kts
│
├── frontend/                 # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/             # App Router 페이지
│   │   ├── components/      # React 컴포넌트
│   │   ├── lib/             # API 클라이언트, 유틸리티
│   │   └── types/           # TypeScript 타입
│   └── package.json
│
└── docker-compose.yml
```

## 사용법

### 1. 프로젝트 등록

1. Dashboard에서 "Add Project" 클릭
2. 프로젝트 이름, Base URL 입력
3. Swagger URL 입력 (선택사항 - 자동으로 API 가져오기)
4. 인증 설정 (Bearer Token, API Key 등)

### 2. API 테스트

- **개별 테스트**: 각 엔드포인트 옆 Play 버튼 클릭
- **전체 테스트**: "Run All Tests" 버튼 클릭

### 3. 스케줄 설정

프로젝트 상세 페이지에서 스케줄 추가:
- Cron 표현식으로 주기 설정 (예: `0 */5 * * * ?` = 5분마다)
- 실패 시 알림 설정

### 4. 알림 채널 설정

Notifications 페이지에서:
- Slack Webhook URL 추가
- Discord Webhook URL 추가
- Email 수신자 설정

## 라이선스

MIT License
