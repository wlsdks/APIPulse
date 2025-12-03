'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Language = 'en' | 'ko';

interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projects',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    'nav.systemStatus': 'System Status',
    'nav.allOperational': 'All systems operational',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview of all API monitoring',
    'dashboard.totalProjects': 'Total Projects',
    'dashboard.totalEndpoints': 'Total Endpoints',
    'dashboard.activeSchedules': 'Active Schedules',
    'dashboard.successRate': 'Success Rate',
    'dashboard.avgResponseTime': 'Avg Response Time',
    'dashboard.projectHealth': 'Project Health',
    'dashboard.noProjects': 'No projects yet',
    'dashboard.createFirst': 'Create your first project to start monitoring APIs',
    'dashboard.addProject': 'Add Project',

    // Projects
    'projects.title': 'Projects',
    'projects.subtitle': 'Manage your API monitoring projects',
    'projects.new': 'New Project',
    'projects.endpoints': 'endpoints',
    'projects.lastTested': 'Last tested',
    'projects.never': 'Never',
    'projects.healthy': 'Healthy',
    'projects.unhealthy': 'Unhealthy',
    'projects.unknown': 'Unknown',
    'projects.noProjects': 'No projects yet',
    'projects.createDescription': 'Create your first project to start monitoring APIs',

    // Project Detail
    'project.overview': 'Overview',
    'project.endpoints': 'Endpoints',
    'project.schedules': 'Schedules',
    'project.history': 'History',
    'project.runTests': 'Run Tests',
    'project.runAllTests': 'Run All Tests',
    'project.syncApis': 'Sync APIs',
    'project.addEndpoint': 'Add Endpoint',
    'project.addSchedule': 'Add Schedule',
    'project.notFound': 'Project not found',
    'project.noEndpoints': 'No endpoints yet. Click "Sync APIs" to import from Swagger.',
    'project.totalTests': 'Total Tests',
    'project.successRate': 'Success Rate',
    'project.failed': 'Failed',
    'project.avgResponse': 'Avg Response',

    // New Project
    'project.backToProjects': 'Back to Projects',
    'project.createNew': 'Create New Project',
    'project.projectName': 'Project Name',
    'project.projectNamePlaceholder': 'My API Project',
    'project.baseUrl': 'Base URL',
    'project.baseUrlPlaceholder': 'https://api.example.com',
    'project.description': 'Description',
    'project.descriptionPlaceholder': 'Describe your project...',
    'project.swaggerUrl': 'Swagger/OpenAPI URL',
    'project.swaggerUrlPlaceholder': 'https://api.example.com/v3/api-docs',
    'project.swaggerHint': 'If provided, endpoints will be automatically imported from the OpenAPI specification.',
    'project.addUrl': 'Add URL',
    'project.authentication': 'Authentication',
    'project.authType': 'Authentication Type',
    'project.authNone': 'No Authentication',
    'project.authBearer': 'Bearer Token',
    'project.authApiKey': 'API Key',
    'project.authBasic': 'Basic Auth',
    'project.headerName': 'Header Name',
    'project.token': 'Token',
    'project.credentials': 'Credentials (base64)',
    'project.createProject': 'Create Project',
    'project.createFailed': 'Failed to create project. Please try again.',

    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Configure API Pulse settings',
    'settings.appearance': 'Appearance',
    'settings.appearanceDesc': 'Customize the look and feel',
    'settings.theme': 'Theme',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.themeSystem': 'System',
    'settings.language': 'Language',
    'settings.languageDesc': 'Select your preferred language',
    'settings.backend': 'Backend Connection',
    'settings.backendDesc': 'Configure the API Pulse backend server',
    'settings.apiBaseUrl': 'API Base URL',
    'settings.apiUrlHint': 'Set the NEXT_PUBLIC_API_URL environment variable to change this.',
    'settings.database': 'Database',
    'settings.databaseDesc': 'View database configuration',
    'settings.databaseHint': 'Database type is configured via the APIPULSE_PROFILE environment variable on the backend.',
    'settings.databaseSqlite': 'SQLite (default)',
    'settings.databasePostgres': 'PostgreSQL',
    'settings.about': 'About API Pulse',
    'settings.aboutDesc': 'Application information',
    'settings.version': 'Version',
    'settings.backendStack': 'Backend',
    'settings.frontendStack': 'Frontend',
    'settings.viewOnGithub': 'View on GitHub',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.subtitle': 'Configure alerts for API failures',
    'notifications.add': 'Add Channel',
    'notifications.addFirst': 'Add Your First Channel',
    'notifications.addModal': 'Add Notification Channel',
    'notifications.channelName': 'Channel Name',
    'notifications.channelNamePlaceholder': 'Production Alerts',
    'notifications.type': 'Type',
    'notifications.slack': 'Slack',
    'notifications.discord': 'Discord',
    'notifications.email': 'Email',
    'notifications.webhook': 'Webhook URL',
    'notifications.webhookPlaceholder': 'https://hooks.slack.com/...',
    'notifications.emailRecipients': 'Email Recipients',
    'notifications.emailRecipientsPlaceholder': 'dev@example.com, ops@example.com',
    'notifications.notifyOnFailure': 'Notify on failure',
    'notifications.notifyOnRecovery': 'Notify on recovery',
    'notifications.onFailure': 'On Failure',
    'notifications.onRecovery': 'On Recovery',
    'notifications.active': 'Active',
    'notifications.test': 'Test',
    'notifications.noChannels': 'No notification channels',
    'notifications.addDescription': 'Add a channel to receive alerts when API tests fail',
    'notifications.confirmDelete': 'Delete this notification channel?',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.failed': 'Failed',
    'common.enabled': 'Enabled',
    'common.disabled': 'Disabled',
    'common.actions': 'Actions',
    'common.refresh': 'Refresh',
    'common.retry': 'Retry',
    'common.confirmDelete': 'Are you sure you want to delete this?',

    // Error messages
    'error.title': 'Error',
    'error.unknown': 'An unknown error occurred',

    // Success messages
    'success.title': 'Success',
    'success.projectCreated': 'Project created successfully',
    'success.projectUpdated': 'Project updated successfully',
    'success.projectDeleted': 'Project deleted successfully',
    'success.endpointCreated': 'Endpoint created successfully',
    'success.endpointUpdated': 'Endpoint updated successfully',
    'success.endpointDeleted': 'Endpoint deleted successfully',
    'success.testCompleted': 'Test completed successfully',
    'success.syncCompleted': 'API sync completed',
    'success.notificationSent': 'Notification sent successfully',
  },
  ko: {
    // Navigation
    'nav.dashboard': '대시보드',
    'nav.projects': '프로젝트',
    'nav.notifications': '알림',
    'nav.settings': '설정',
    'nav.systemStatus': '시스템 상태',
    'nav.allOperational': '모든 시스템 정상',

    // Dashboard
    'dashboard.title': '대시보드',
    'dashboard.subtitle': '전체 API 모니터링 현황',
    'dashboard.totalProjects': '전체 프로젝트',
    'dashboard.totalEndpoints': '전체 엔드포인트',
    'dashboard.activeSchedules': '활성 스케줄',
    'dashboard.successRate': '성공률',
    'dashboard.avgResponseTime': '평균 응답시간',
    'dashboard.projectHealth': '프로젝트 상태',
    'dashboard.noProjects': '프로젝트가 없습니다',
    'dashboard.createFirst': '첫 번째 프로젝트를 생성하여 API 모니터링을 시작하세요',
    'dashboard.addProject': '프로젝트 추가',

    // Projects
    'projects.title': '프로젝트',
    'projects.subtitle': 'API 모니터링 프로젝트 관리',
    'projects.new': '새 프로젝트',
    'projects.endpoints': '엔드포인트',
    'projects.lastTested': '마지막 테스트',
    'projects.never': '없음',
    'projects.healthy': '정상',
    'projects.unhealthy': '오류',
    'projects.unknown': '알 수 없음',
    'projects.noProjects': '프로젝트가 없습니다',
    'projects.createDescription': '첫 번째 프로젝트를 생성하여 API 모니터링을 시작하세요',

    // Project Detail
    'project.overview': '개요',
    'project.endpoints': '엔드포인트',
    'project.schedules': '스케줄',
    'project.history': '이력',
    'project.runTests': '테스트 실행',
    'project.runAllTests': '전체 테스트 실행',
    'project.syncApis': 'API 동기화',
    'project.addEndpoint': '엔드포인트 추가',
    'project.addSchedule': '스케줄 추가',
    'project.notFound': '프로젝트를 찾을 수 없습니다',
    'project.noEndpoints': '엔드포인트가 없습니다. "API 동기화"를 클릭하여 Swagger에서 가져오세요.',
    'project.totalTests': '전체 테스트',
    'project.successRate': '성공률',
    'project.failed': '실패',
    'project.avgResponse': '평균 응답시간',

    // New Project
    'project.backToProjects': '프로젝트 목록으로',
    'project.createNew': '새 프로젝트 생성',
    'project.projectName': '프로젝트 이름',
    'project.projectNamePlaceholder': '내 API 프로젝트',
    'project.baseUrl': '기본 URL',
    'project.baseUrlPlaceholder': 'https://api.example.com',
    'project.description': '설명',
    'project.descriptionPlaceholder': '프로젝트를 설명해주세요...',
    'project.swaggerUrl': 'Swagger/OpenAPI URL',
    'project.swaggerUrlPlaceholder': 'https://api.example.com/v3/api-docs',
    'project.swaggerHint': '제공하면 OpenAPI 명세에서 엔드포인트를 자동으로 가져옵니다.',
    'project.addUrl': 'URL 추가',
    'project.authentication': '인증',
    'project.authType': '인증 유형',
    'project.authNone': '인증 없음',
    'project.authBearer': 'Bearer 토큰',
    'project.authApiKey': 'API 키',
    'project.authBasic': 'Basic 인증',
    'project.headerName': '헤더 이름',
    'project.token': '토큰',
    'project.credentials': '자격 증명 (base64)',
    'project.createProject': '프로젝트 생성',
    'project.createFailed': '프로젝트 생성에 실패했습니다. 다시 시도해주세요.',

    // Settings
    'settings.title': '설정',
    'settings.subtitle': 'API Pulse 설정 구성',
    'settings.appearance': '외관',
    'settings.appearanceDesc': '화면 모양 설정',
    'settings.theme': '테마',
    'settings.themeLight': '라이트',
    'settings.themeDark': '다크',
    'settings.themeSystem': '시스템',
    'settings.language': '언어',
    'settings.languageDesc': '원하는 언어를 선택하세요',
    'settings.backend': '백엔드 연결',
    'settings.backendDesc': 'API Pulse 백엔드 서버 설정',
    'settings.apiBaseUrl': 'API 기본 URL',
    'settings.apiUrlHint': 'NEXT_PUBLIC_API_URL 환경 변수를 설정하여 변경할 수 있습니다.',
    'settings.database': '데이터베이스',
    'settings.databaseDesc': '데이터베이스 설정 보기',
    'settings.databaseHint': '데이터베이스 유형은 백엔드의 APIPULSE_PROFILE 환경 변수로 설정합니다.',
    'settings.databaseSqlite': 'SQLite (기본값)',
    'settings.databasePostgres': 'PostgreSQL',
    'settings.about': 'API Pulse 정보',
    'settings.aboutDesc': '애플리케이션 정보',
    'settings.version': '버전',
    'settings.backendStack': '백엔드',
    'settings.frontendStack': '프론트엔드',
    'settings.viewOnGithub': 'GitHub에서 보기',

    // Notifications
    'notifications.title': '알림',
    'notifications.subtitle': 'API 실패 알림 설정',
    'notifications.add': '채널 추가',
    'notifications.addFirst': '첫 번째 채널 추가',
    'notifications.addModal': '알림 채널 추가',
    'notifications.channelName': '채널 이름',
    'notifications.channelNamePlaceholder': '프로덕션 알림',
    'notifications.type': '유형',
    'notifications.slack': 'Slack',
    'notifications.discord': 'Discord',
    'notifications.email': '이메일',
    'notifications.webhook': '웹훅 URL',
    'notifications.webhookPlaceholder': 'https://hooks.slack.com/...',
    'notifications.emailRecipients': '이메일 수신자',
    'notifications.emailRecipientsPlaceholder': 'dev@example.com, ops@example.com',
    'notifications.notifyOnFailure': '실패 시 알림',
    'notifications.notifyOnRecovery': '복구 시 알림',
    'notifications.onFailure': '실패 시',
    'notifications.onRecovery': '복구 시',
    'notifications.active': '활성',
    'notifications.test': '테스트',
    'notifications.noChannels': '알림 채널이 없습니다',
    'notifications.addDescription': 'API 테스트 실패 시 알림을 받으려면 채널을 추가하세요',
    'notifications.confirmDelete': '이 알림 채널을 삭제하시겠습니까?',

    // Common
    'common.save': '저장',
    'common.cancel': '취소',
    'common.delete': '삭제',
    'common.edit': '수정',
    'common.create': '생성',
    'common.back': '뒤로',
    'common.loading': '로딩 중...',
    'common.error': '오류',
    'common.success': '성공',
    'common.failed': '실패',
    'common.enabled': '활성화',
    'common.disabled': '비활성화',
    'common.actions': '작업',
    'common.refresh': '새로고침',
    'common.retry': '재시도',
    'common.confirmDelete': '정말 삭제하시겠습니까?',

    // Error messages
    'error.title': '오류',
    'error.unknown': '알 수 없는 오류가 발생했습니다',

    // Success messages
    'success.title': '성공',
    'success.projectCreated': '프로젝트가 생성되었습니다',
    'success.projectUpdated': '프로젝트가 수정되었습니다',
    'success.projectDeleted': '프로젝트가 삭제되었습니다',
    'success.endpointCreated': '엔드포인트가 생성되었습니다',
    'success.endpointUpdated': '엔드포인트가 수정되었습니다',
    'success.endpointDeleted': '엔드포인트가 삭제되었습니다',
    'success.testCompleted': '테스트가 완료되었습니다',
    'success.syncCompleted': 'API 동기화가 완료되었습니다',
    'success.notificationSent': '알림이 전송되었습니다',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language | null;
    if (stored && (stored === 'en' || stored === 'ko')) {
      setLanguage(stored);
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('ko')) {
        setLanguage('ko');
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
