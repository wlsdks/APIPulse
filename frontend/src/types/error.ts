export interface ApiError {
  code: string;
  message: string;
  status: number;
  timestamp?: string;
  details?: Record<string, unknown>;
}

export class ApiException extends Error {
  code: string;
  status: number;
  timestamp?: string;
  details?: Record<string, unknown>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.code = error.code;
    this.status = error.status;
    this.timestamp = error.timestamp;
    this.details = error.details;
  }

  static isApiException(error: unknown): error is ApiException {
    return error instanceof ApiException;
  }
}

export const errorMessages: Record<string, { en: string; ko: string }> = {
  // Common errors (1xxx)
  E1000: { en: 'Internal server error', ko: '서버 내부 오류가 발생했습니다' },
  E1001: { en: 'Invalid request', ko: '잘못된 요청입니다' },
  E1002: { en: 'Resource not found', ko: '리소스를 찾을 수 없습니다' },
  E1003: { en: 'Validation failed', ko: '유효성 검사에 실패했습니다' },

  // Project errors (2xxx)
  E2001: { en: 'Project not found', ko: '프로젝트를 찾을 수 없습니다' },
  E2002: { en: 'Project already exists', ko: '이미 존재하는 프로젝트입니다' },
  E2003: { en: 'Swagger URL is required for sync', ko: '동기화를 위해 Swagger URL이 필요합니다' },
  E2004: { en: 'Failed to fetch Swagger specification', ko: 'Swagger 스펙을 가져오는데 실패했습니다' },

  // Endpoint errors (3xxx)
  E3001: { en: 'Endpoint not found', ko: '엔드포인트를 찾을 수 없습니다' },
  E3002: { en: 'Endpoint already exists', ko: '이미 존재하는 엔드포인트입니다' },
  E3003: { en: 'Endpoint test failed', ko: '엔드포인트 테스트에 실패했습니다' },

  // Schedule errors (4xxx)
  E4001: { en: 'Schedule not found', ko: '스케줄을 찾을 수 없습니다' },
  E4002: { en: 'Invalid cron expression', ko: '잘못된 Cron 표현식입니다' },
  E4003: { en: 'Schedule is already paused', ko: '스케줄이 이미 일시정지 상태입니다' },
  E4004: { en: 'Schedule is already active', ko: '스케줄이 이미 활성 상태입니다' },

  // Notification errors (5xxx)
  E5001: { en: 'Notification not found', ko: '알림 설정을 찾을 수 없습니다' },
  E5002: { en: 'Failed to send notification', ko: '알림 전송에 실패했습니다' },
  E5003: { en: 'Invalid webhook URL', ko: '잘못된 웹훅 URL입니다' },

  // Test errors (6xxx)
  E6001: { en: 'No endpoints to test', ko: '테스트할 엔드포인트가 없습니다' },
  E6002: { en: 'Test execution failed', ko: '테스트 실행에 실패했습니다' },
  E6003: { en: 'Test timed out', ko: '테스트 시간이 초과되었습니다' },

  // Database errors (7xxx)
  E7001: { en: 'Database error occurred', ko: '데이터베이스 오류가 발생했습니다' },
  E7002: { en: 'Database is temporarily locked', ko: '데이터베이스가 일시적으로 잠겨 있습니다' },
};

export function getErrorMessage(code: string, language: 'en' | 'ko' = 'en'): string {
  return errorMessages[code]?.[language] ||
    (language === 'ko' ? '알 수 없는 오류가 발생했습니다' : 'An unknown error occurred');
}
