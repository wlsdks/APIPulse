export type AuthType = 'NONE' | 'BEARER_TOKEN' | 'API_KEY' | 'BASIC_AUTH';
export * from './error';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
export type TestStatus = 'SUCCESS' | 'FAILED' | 'ERROR' | 'TIMEOUT';
export type TriggerType = 'MANUAL' | 'SCHEDULED';
export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
export type NotificationType = 'SLACK' | 'DISCORD' | 'EMAIL';

export interface Project {
  id: string;
  name: string;
  baseUrl: string;
  description?: string;
  swaggerUrls: string[];
  authType: AuthType;
  enabled: boolean;
  endpointCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: HttpMethod;
  summary?: string;
  description?: string;
  sampleRequestBody?: string;
  expectedStatusCode: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  id: string;
  endpointId: string;
  endpointPath: string;
  endpointMethod: string;
  status: TestStatus;
  statusCode: number;
  responseTimeMs: number;
  errorMessage?: string;
  triggerType: TriggerType;
  executedAt: string;
}

export interface TestSchedule {
  id: string;
  name: string;
  cronExpression: string;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  lastRunStatus?: TestStatus;
  notifyOnFailure: boolean;
  notifyOnSuccess: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationConfig {
  id: string;
  name: string;
  type: NotificationType;
  webhookUrl?: string;
  emailRecipients?: string;
  enabled: boolean;
  notifyOnFailure: boolean;
  notifyOnRecovery: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardOverview {
  totalProjects: number;
  totalEndpoints: number;
  activeSchedules: number;
  overallSuccessRate: number;
  overallAvgResponseTimeMs: number;
  projects: ProjectSummary[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  baseUrl: string;
  endpointCount: number;
  healthStatus: HealthStatus;
  successCount: number;
  failedCount: number;
  avgResponseTimeMs: number;
  enabled: boolean;
}

export interface ProjectTestResult {
  projectId: string;
  results: TestResult[];
  successCount: number;
  failedCount: number;
  averageResponseTimeMs: number;
  successRate: number;
}

export interface TestStats {
  totalTests: number;
  successCount: number;
  failedCount: number;
  errorCount: number;
  timeoutCount: number;
  successRate: number;
  averageResponseTimeMs: number;
}

export interface CreateProjectRequest {
  name: string;
  baseUrl: string;
  description?: string;
  swaggerUrls?: string[];
  authType?: AuthType;
  authValue?: string;
  headerName?: string;
}

export interface CreateEndpointRequest {
  path: string;
  method: HttpMethod;
  summary?: string;
  description?: string;
  sampleRequestBody?: string;
  expectedStatusCode?: number;
}

export interface CreateScheduleRequest {
  name: string;
  cronExpression: string;
  notifyOnFailure?: boolean;
  notifyOnSuccess?: boolean;
}

export interface CreateNotificationRequest {
  name: string;
  type: NotificationType;
  webhookUrl?: string;
  emailRecipients?: string;
  notifyOnFailure?: boolean;
  notifyOnRecovery?: boolean;
}
