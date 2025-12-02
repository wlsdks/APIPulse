# APIPulse Backend API Server

Spring Boot 4.0 기반 API 헬스 모니터링 백엔드 서버

## APIPulse란?

APIPulse는 **HTTP API 헬스 모니터링 도구**입니다. 운영 중인 서비스의 API가 정상적으로 동작하는지 주기적으로 확인하고, 문제가 발생하면 즉시 알림을 받을 수 있습니다.

### 어떤 API를 모니터링할 수 있나요?

**모든 HTTP API를 모니터링할 수 있습니다.** 대상 서버의 기술 스택은 상관없습니다:

| 지원 | 예시 |
|------|------|
| Spring Boot (Java/Kotlin) | `https://api.myapp.com/users` |
| Node.js (Express, Nest.js) | `https://api.myapp.com/products` |
| Python (FastAPI, Django, Flask) | `https://api.myapp.com/orders` |
| Go, Rust, Ruby, PHP 등 | HTTP 응답을 반환하는 모든 API |
| 외부 서비스 | GitHub API, Slack API, AWS 등 |

APIPulse는 단순히 **HTTP 요청을 보내고 응답을 확인**하는 방식으로 동작합니다. 대상 서버가 어떤 언어나 프레임워크로 만들어졌는지는 중요하지 않습니다.

## 핵심 개념

### 프로젝트 (Project)

**프로젝트**는 모니터링할 API 서버 하나를 의미합니다.

```
예시:
- 프로젝트 1: "우리 회사 백엔드 API" → https://api.mycompany.com
- 프로젝트 2: "결제 서비스" → https://payment.mycompany.com
- 프로젝트 3: "외부 파트너 API" → https://api.partner.com
```

프로젝트를 등록할 때 입력하는 정보:

| 필드 | 필수 | 설명 |
|------|------|------|
| 이름 | O | 프로젝트 식별 이름 (예: "우리 회사 API") |
| Base URL | O | API 서버 주소 (예: `https://api.mycompany.com`) |
| Swagger URL | X | OpenAPI 스펙 URL - 있으면 API 목록 자동 추출 |
| 인증 정보 | X | API 호출에 필요한 인증 토큰/키 |

### 엔드포인트 (Endpoint)

**엔드포인트**는 프로젝트 내의 개별 API입니다.

```
예시 (프로젝트: "우리 회사 백엔드 API"):
- GET  /users         → 사용자 목록 조회
- GET  /users/{id}    → 사용자 상세 조회
- POST /orders        → 주문 생성
- GET  /health        → 헬스체크
```

엔드포인트 등록 방법:
1. **자동 등록**: Swagger/OpenAPI URL을 입력하면 모든 API를 자동으로 가져옴
2. **수동 등록**: API 정보(Method, Path 등)를 직접 입력

### 테스트 (Test)

**테스트**는 등록된 엔드포인트에 실제 HTTP 요청을 보내고 결과를 확인하는 것입니다.

```
테스트 실행 시 확인하는 항목:
- 응답 상태 코드 (200, 404, 500 등)
- 응답 시간 (ms)
- 에러 메시지 (실패 시)
```

테스트 결과:
- **PASS**: 정상 응답 (2xx, 3xx)
- **FAIL**: 에러 응답 (4xx, 5xx) 또는 타임아웃

### 스케줄 (Schedule)

**스케줄**은 테스트를 자동으로 실행하는 주기를 설정하는 것입니다.

```
예시:
- "0 */5 * * * ?"  → 5분마다 테스트
- "0 0 9 * * ?"    → 매일 오전 9시에 테스트
- "0 0 */1 * * ?"  → 1시간마다 테스트
```

### 알림 (Notification)

**알림**은 테스트 실패 시 받을 수 있는 메시지입니다.

지원 채널:
- **Slack**: Webhook URL로 슬랙 채널에 알림
- **Discord**: Webhook URL로 디스코드 채널에 알림
- **Email**: SMTP 설정으로 이메일 발송

## 사용 흐름

```
1. 프로젝트 등록
   └─ 모니터링할 API 서버 정보 입력

2. 엔드포인트 등록
   ├─ Swagger URL이 있으면 → "Sync" 버튼으로 자동 추출
   └─ 없으면 → 수동으로 API 정보 입력

3. 테스트 실행
   ├─ 개별 테스트: 특정 API 하나만 테스트
   └─ 전체 테스트: 프로젝트의 모든 API 테스트

4. 스케줄 설정 (선택)
   └─ Cron 표현식으로 자동 테스트 주기 설정

5. 알림 설정 (선택)
   └─ 테스트 실패 시 Slack/Discord/Email 알림
```

## 모니터링 대상 프로젝트 요구사항

APIPulse로 API를 모니터링하려면 대상 프로젝트가 다음 조건을 만족해야 합니다:

| 요구사항 | 필수 | 설명 |
|---------|------|------|
| **HTTP 접근 가능** | O | APIPulse 서버에서 대상 API에 네트워크 접근 가능해야 함 |
| **Swagger/OpenAPI** | X | 자동으로 API 목록을 가져오려면 필요 (없으면 수동 등록) |
| **인증 정보** | X | API가 인증을 요구하면 토큰/키 필요 |

### 지원하는 인증 방식

- **Bearer Token**: `Authorization: Bearer <token>`
- **API Key (Header)**: 커스텀 헤더에 API 키 전달
- **API Key (Query)**: URL 쿼리 파라미터로 API 키 전달
- **Basic Auth**: `Authorization: Basic <base64>`
- **None**: 인증 없이 접근 가능한 공개 API

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                       Controller Layer                      │
│  ProjectController, EndpointController, TestController, ... │
│                     (HTTP 요청/응답 처리만)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Interface                        │
│    ProjectService, EndpointService, TestService, ...        │
│                    (비즈니스 로직 추상화)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Impl                           │
│  ProjectServiceImpl, EndpointServiceImpl, TestServiceImpl   │
│                   (비즈니스 로직 구현)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Repository Layer                        │
│  ProjectRepository, EndpointRepository, TestResultRepository│
│                     (데이터 접근)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Database                             │
│                   SQLite / PostgreSQL                       │
└─────────────────────────────────────────────────────────────┘
```

## 프로젝트 구조

```
src/main/kotlin/com/apipulse/
├── controller/          # REST API 컨트롤러
│   ├── ProjectController.kt
│   ├── ApiEndpointController.kt
│   ├── TestController.kt
│   ├── ScheduleController.kt
│   ├── NotificationController.kt
│   └── DashboardController.kt
│
├── service/             # 비즈니스 로직
│   ├── project/
│   │   ├── ProjectService.kt        # 인터페이스
│   │   └── ProjectServiceImpl.kt    # 구현체
│   ├── endpoint/
│   ├── test/
│   ├── schedule/
│   ├── notification/
│   └── dashboard/
│
├── repository/          # 데이터 접근 계층
│   ├── ProjectRepository.kt
│   ├── ApiEndpointRepository.kt
│   └── TestResultRepository.kt
│
├── model/               # JPA 엔티티
│   ├── Project.kt
│   ├── ApiEndpoint.kt
│   ├── TestResult.kt
│   ├── Schedule.kt
│   └── NotificationConfig.kt
│
├── dto/                 # 데이터 전송 객체
│   ├── request/         # 요청 DTO
│   └── response/        # 응답 DTO
│
└── config/              # 설정
    ├── WebClientConfig.kt
    └── QuartzConfig.kt
```

## API 엔드포인트

### 프로젝트 관리

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects` | 모든 프로젝트 목록 |
| GET | `/api/projects/{id}` | 프로젝트 상세 조회 |
| POST | `/api/projects` | 프로젝트 생성 |
| PUT | `/api/projects/{id}` | 프로젝트 수정 |
| DELETE | `/api/projects/{id}` | 프로젝트 삭제 |
| POST | `/api/projects/{id}/sync` | Swagger에서 API 동기화 |

### API 엔드포인트 관리

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects/{projectId}/endpoints` | 엔드포인트 목록 |
| GET | `/api/projects/{projectId}/endpoints/{id}` | 엔드포인트 상세 |
| POST | `/api/projects/{projectId}/endpoints` | 엔드포인트 생성 |
| PUT | `/api/projects/{projectId}/endpoints/{id}` | 엔드포인트 수정 |
| DELETE | `/api/projects/{projectId}/endpoints/{id}` | 엔드포인트 삭제 |
| POST | `/api/projects/{projectId}/endpoints/{id}/test` | 개별 테스트 실행 |

### 테스트 실행

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/projects/{projectId}/tests/run` | 전체 테스트 실행 |
| GET | `/api/projects/{projectId}/tests/results` | 테스트 결과 목록 (페이지네이션) |
| GET | `/api/projects/{projectId}/tests/latest` | 최근 테스트 결과 |
| GET | `/api/projects/{projectId}/tests/stats` | 테스트 통계 |

### 스케줄 관리

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects/{projectId}/schedules` | 스케줄 목록 |
| POST | `/api/projects/{projectId}/schedules` | 스케줄 생성 |
| PUT | `/api/projects/{projectId}/schedules/{id}` | 스케줄 수정 |
| DELETE | `/api/projects/{projectId}/schedules/{id}` | 스케줄 삭제 |
| POST | `/api/projects/{projectId}/schedules/{id}/pause` | 스케줄 일시정지 |
| POST | `/api/projects/{projectId}/schedules/{id}/resume` | 스케줄 재개 |

### 알림 설정

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/notifications` | 알림 설정 목록 |
| POST | `/api/notifications` | 알림 설정 생성 |
| PUT | `/api/notifications/{id}` | 알림 설정 수정 |
| DELETE | `/api/notifications/{id}` | 알림 설정 삭제 |
| POST | `/api/notifications/{id}/test` | 테스트 알림 발송 |

### 대시보드

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/dashboard/overview` | 대시보드 개요 |
| GET | `/api/dashboard/health` | 시스템 헬스체크 |

## 요청/응답 예시

### 프로젝트 생성

**Request:**
```http
POST /api/projects
Content-Type: application/json

{
  "name": "My API Server",
  "baseUrl": "https://api.example.com",
  "swaggerUrl": "https://api.example.com/v3/api-docs",
  "authType": "BEARER_TOKEN",
  "authValue": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "My API Server",
  "baseUrl": "https://api.example.com",
  "swaggerUrl": "https://api.example.com/v3/api-docs",
  "authType": "BEARER_TOKEN",
  "endpointCount": 0,
  "lastTestedAt": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 테스트 실행 결과

**Request:**
```http
POST /api/projects/{projectId}/tests/run
```

**Response:**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "projectName": "My API Server",
  "totalEndpoints": 15,
  "passedCount": 14,
  "failedCount": 1,
  "executedAt": "2024-01-15T10:35:00Z",
  "duration": 2345,
  "results": [
    {
      "endpointId": "...",
      "method": "GET",
      "path": "/users",
      "status": "PASS",
      "statusCode": 200,
      "responseTime": 156,
      "testedAt": "2024-01-15T10:35:00Z"
    },
    {
      "endpointId": "...",
      "method": "POST",
      "path": "/orders",
      "status": "FAIL",
      "statusCode": 500,
      "responseTime": 1023,
      "errorMessage": "Internal Server Error",
      "testedAt": "2024-01-15T10:35:01Z"
    }
  ]
}
```

## 실행 방법

### 개발 환경

```bash
# Gradle Wrapper 생성 (최초 1회)
gradle wrapper

# 개발 서버 실행
./gradlew bootRun

# 빌드
./gradlew clean build

# JAR 실행
java -jar build/libs/api-server-0.0.1-SNAPSHOT.jar
```

### 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `APIPULSE_PROFILE` | DB 프로필 (`sqlite` / `postgresql`) | `sqlite` |
| `APIPULSE_DB_PATH` | SQLite DB 경로 | `./apipulse.db` |
| `SERVER_PORT` | 서버 포트 | `8080` |

### Docker

```bash
# 빌드
docker build -t apipulse-backend .

# 실행
docker run -p 8080:8080 \
  -e APIPULSE_PROFILE=sqlite \
  -v $(pwd)/data:/app/data \
  apipulse-backend
```

## 기술 스택

- **Spring Boot 4.0.0** - 웹 프레임워크
- **Kotlin 2.1** - 프로그래밍 언어
- **Java 21** - JVM
- **Spring Data JPA** - ORM
- **SQLite / PostgreSQL** - 데이터베이스
- **Quartz Scheduler** - 스케줄링
- **WebClient** - HTTP 클라이언트
- **SpringDoc OpenAPI** - API 문서화
