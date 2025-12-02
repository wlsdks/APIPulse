# APIPulse

**HTTP API 헬스 모니터링 & 테스트 도구**

운영 중인 서비스의 API가 정상적으로 동작하는지 주기적으로 확인하고, 문제가 발생하면 즉시 알림을 받을 수 있습니다.

## 어떤 API를 모니터링할 수 있나요?

**모든 HTTP API를 모니터링할 수 있습니다.** 대상 서버의 기술 스택은 상관없습니다:

- Spring Boot, Node.js, Python, Go, Ruby, PHP 등
- 외부 서비스 (GitHub API, Slack API, AWS 등)
- HTTP 응답을 반환하는 모든 API

APIPulse는 단순히 **HTTP 요청을 보내고 응답을 확인**하는 방식으로 동작합니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| **API 자동 추출** | Swagger/OpenAPI 스펙에서 API 엔드포인트 자동 가져오기 |
| **수동 등록** | Swagger 없어도 API를 직접 등록 가능 |
| **헬스체크 테스트** | 모든 API를 한 번에 테스트하고 결과 확인 |
| **스케줄링** | Cron 표현식으로 정기적인 API 테스트 자동화 |
| **알림** | Slack, Discord, Email로 실패 알림 받기 |
| **대시보드** | 프로젝트별 API 상태를 한눈에 확인 |

## 사용 흐름

```
1. 프로젝트 등록
   └─ 모니터링할 API 서버 정보 입력 (이름, Base URL)

2. 엔드포인트 등록
   ├─ Swagger URL이 있으면 → "Sync" 버튼으로 자동 추출
   └─ 없으면 → 수동으로 API 정보 입력 (Method, Path)

3. 테스트 실행
   ├─ 개별 테스트: 특정 API 하나만 테스트
   └─ 전체 테스트: 프로젝트의 모든 API 테스트

4. 스케줄 설정 (선택)
   └─ Cron 표현식으로 자동 테스트 주기 설정

5. 알림 설정 (선택)
   └─ 테스트 실패 시 Slack/Discord/Email 알림
```

## 모니터링 대상 요구사항

| 요구사항 | 필수 | 설명 |
|---------|------|------|
| **HTTP 접근 가능** | O | APIPulse 서버에서 대상 API에 네트워크 접근 가능 |
| **Swagger/OpenAPI** | X | 없으면 수동 등록 |
| **인증 정보** | X | API가 인증을 요구하면 토큰/키 필요 |

### 지원하는 인증 방식

- Bearer Token
- API Key (Header / Query)
- Basic Auth
- None (공개 API)

## 기술 스택

### Backend
- **Spring Boot 4.0.0** (Kotlin)
- **Java 21**
- **SQLite / PostgreSQL**
- **Quartz Scheduler**
- **WebFlux (WebClient)**

### Frontend
- **Next.js 15**
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

### Frontend

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api` |

## 프로젝트 구조

```
APIPulse/
├── backend/
│   └── api-server/           # Spring Boot 백엔드
│       ├── src/main/kotlin/
│       │   └── com/apipulse/
│       │       ├── controller/   # REST 컨트롤러
│       │       ├── service/      # 비즈니스 로직 (Interface + Impl)
│       │       ├── repository/   # 데이터 접근
│       │       ├── model/        # 엔티티
│       │       ├── dto/          # 요청/응답 DTO
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

## API 문서

백엔드 실행 후 Swagger UI에서 API 문서 확인:
- http://localhost:8080/swagger-ui.html

자세한 API 명세는 [Backend README](./backend/api-server/README.md) 참고

## 라이선스

MIT License
