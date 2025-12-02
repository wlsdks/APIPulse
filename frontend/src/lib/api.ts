import axios, { AxiosError } from 'axios';
import type {
  Project,
  ApiEndpoint,
  TestResult,
  TestSchedule,
  NotificationConfig,
  DashboardOverview,
  ProjectTestResult,
  TestStats,
  CreateProjectRequest,
  CreateEndpointRequest,
  CreateScheduleRequest,
  CreateNotificationRequest,
} from '@/types';
import { ApiException, type ApiError } from '@/types/error';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include language header
api.interceptors.request.use((config) => {
  const language = typeof window !== 'undefined'
    ? localStorage.getItem('language') || 'en'
    : 'en';
  config.headers['Accept-Language'] = language;
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.data?.code) {
      throw new ApiException(error.response.data);
    }
    // Handle network errors or other non-API errors
    throw new ApiException({
      code: 'E1000',
      message: error.message || 'Network error',
      status: error.response?.status || 500,
    });
  }
);

// Dashboard
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const { data } = await api.get('/dashboard/overview');
  return data;
};

// Projects
export const getProjects = async (): Promise<Project[]> => {
  const { data } = await api.get('/projects');
  return data;
};

export const getProject = async (id: string): Promise<Project> => {
  const { data } = await api.get(`/projects/${id}`);
  return data;
};

export const createProject = async (project: CreateProjectRequest): Promise<Project> => {
  const { data } = await api.post('/projects', project);
  return data;
};

export const updateProject = async (id: string, project: Partial<CreateProjectRequest>): Promise<Project> => {
  const { data } = await api.put(`/projects/${id}`, project);
  return data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};

export const syncProjectApis = async (id: string): Promise<{ newEndpoints: number; updatedEndpoints: number }> => {
  const { data } = await api.post(`/projects/${id}/sync`);
  return data;
};

// Endpoints
export const getEndpoints = async (projectId: string): Promise<ApiEndpoint[]> => {
  const { data } = await api.get(`/projects/${projectId}/endpoints`);
  return data;
};

export const getEndpoint = async (projectId: string, id: string): Promise<ApiEndpoint> => {
  const { data } = await api.get(`/projects/${projectId}/endpoints/${id}`);
  return data;
};

export const createEndpoint = async (projectId: string, endpoint: CreateEndpointRequest): Promise<ApiEndpoint> => {
  const { data } = await api.post(`/projects/${projectId}/endpoints`, endpoint);
  return data;
};

export const updateEndpoint = async (
  projectId: string,
  id: string,
  endpoint: Partial<CreateEndpointRequest>
): Promise<ApiEndpoint> => {
  const { data } = await api.put(`/projects/${projectId}/endpoints/${id}`, endpoint);
  return data;
};

export const deleteEndpoint = async (projectId: string, id: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/endpoints/${id}`);
};

export const testEndpoint = async (projectId: string, id: string): Promise<TestResult> => {
  const { data } = await api.post(`/projects/${projectId}/endpoints/${id}/test`);
  return data;
};

// Tests
export const runProjectTests = async (projectId: string): Promise<ProjectTestResult> => {
  const { data } = await api.post(`/projects/${projectId}/tests/run`);
  return data;
};

export const getTestResults = async (
  projectId: string,
  page = 0,
  size = 50
): Promise<{ results: TestResult[]; totalElements: number; totalPages: number }> => {
  const { data } = await api.get(`/projects/${projectId}/tests/results`, {
    params: { page, size },
  });
  return data;
};

export const getLatestResults = async (projectId: string): Promise<TestResult[]> => {
  const { data } = await api.get(`/projects/${projectId}/tests/latest`);
  return data;
};

export const getTestStats = async (projectId: string): Promise<TestStats> => {
  const { data } = await api.get(`/projects/${projectId}/tests/stats`);
  return data;
};

// Schedules
export const getSchedules = async (projectId: string): Promise<TestSchedule[]> => {
  const { data } = await api.get(`/projects/${projectId}/schedules`);
  return data;
};

export const createSchedule = async (projectId: string, schedule: CreateScheduleRequest): Promise<TestSchedule> => {
  const { data } = await api.post(`/projects/${projectId}/schedules`, schedule);
  return data;
};

export const updateSchedule = async (
  projectId: string,
  id: string,
  schedule: Partial<CreateScheduleRequest>
): Promise<TestSchedule> => {
  const { data } = await api.put(`/projects/${projectId}/schedules/${id}`, schedule);
  return data;
};

export const deleteSchedule = async (projectId: string, id: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/schedules/${id}`);
};

export const pauseSchedule = async (projectId: string, id: string): Promise<TestSchedule> => {
  const { data } = await api.post(`/projects/${projectId}/schedules/${id}/pause`);
  return data;
};

export const resumeSchedule = async (projectId: string, id: string): Promise<TestSchedule> => {
  const { data } = await api.post(`/projects/${projectId}/schedules/${id}/resume`);
  return data;
};

// Notifications
export const getNotifications = async (): Promise<NotificationConfig[]> => {
  const { data } = await api.get('/notifications');
  return data;
};

export const createNotification = async (notification: CreateNotificationRequest): Promise<NotificationConfig> => {
  const { data } = await api.post('/notifications', notification);
  return data;
};

export const updateNotification = async (
  id: string,
  notification: Partial<CreateNotificationRequest>
): Promise<NotificationConfig> => {
  const { data } = await api.put(`/notifications/${id}`, notification);
  return data;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};

export const testNotification = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.post(`/notifications/${id}/test`);
  return data;
};
