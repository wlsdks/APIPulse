import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

const relativeTimeStrings = {
  en: {
    justNow: 'just now',
    minutesAgo: (n: number) => `${n}m ago`,
    hoursAgo: (n: number) => `${n}h ago`,
    daysAgo: (n: number) => `${n}d ago`,
  },
  ko: {
    justNow: '방금 전',
    minutesAgo: (n: number) => `${n}분 전`,
    hoursAgo: (n: number) => `${n}시간 전`,
    daysAgo: (n: number) => `${n}일 전`,
  },
};

export function formatRelativeTime(date: string | Date, lang: 'en' | 'ko' = 'en'): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const strings = relativeTimeStrings[lang];

  if (diffSecs < 60) return strings.justNow;
  if (diffMins < 60) return strings.minutesAgo(diffMins);
  if (diffHours < 24) return strings.hoursAgo(diffHours);
  if (diffDays < 7) return strings.daysAgo(diffDays);
  return formatDate(date);
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'SUCCESS':
    case 'HEALTHY':
      return 'text-green-500';
    case 'FAILED':
    case 'UNHEALTHY':
      return 'text-red-500';
    case 'ERROR':
    case 'DEGRADED':
      return 'text-yellow-500';
    case 'TIMEOUT':
      return 'text-orange-500';
    default:
      return 'text-gray-500';
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'SUCCESS':
    case 'HEALTHY':
      return 'bg-green-100 dark:bg-green-900/30';
    case 'FAILED':
    case 'UNHEALTHY':
      return 'bg-red-100 dark:bg-red-900/30';
    case 'ERROR':
    case 'DEGRADED':
      return 'bg-yellow-100 dark:bg-yellow-900/30';
    case 'TIMEOUT':
      return 'bg-orange-100 dark:bg-orange-900/30';
    default:
      return 'bg-gray-100 dark:bg-gray-900/30';
  }
}

export function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'bg-blue-500';
    case 'POST':
      return 'bg-green-500';
    case 'PUT':
      return 'bg-yellow-500';
    case 'DELETE':
      return 'bg-red-500';
    case 'PATCH':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
}
