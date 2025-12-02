import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-blue-500 text-white',
    POST: 'bg-green-500 text-white',
    PUT: 'bg-yellow-500 text-white',
    DELETE: 'bg-red-500 text-white',
    PATCH: 'bg-purple-500 text-white',
    HEAD: 'bg-gray-500 text-white',
    OPTIONS: 'bg-gray-500 text-white',
  };

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-bold', colors[method] || colors.GET)}>
      {method}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
    SUCCESS: 'success',
    HEALTHY: 'success',
    FAILED: 'error',
    UNHEALTHY: 'error',
    ERROR: 'warning',
    DEGRADED: 'warning',
    TIMEOUT: 'warning',
    UNKNOWN: 'default',
  };

  return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
}
