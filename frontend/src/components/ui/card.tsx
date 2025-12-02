'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

/* ═══════════════════════════════════════════════════
 * Card Component with Variants
 * ═══════════════════════════════════════════════════ */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'interactive' | 'status';
  status?: 'healthy' | 'warning' | 'error' | 'unknown';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, variant = 'default', status, ...props }, ref) => {
    const baseStyles = [
      'rounded-xl border bg-white dark:bg-gray-900',
      'transition-all duration-200 ease-out',
    ].join(' ');

    const variants = {
      default: 'border-gray-200 dark:border-gray-800 shadow-sm',
      elevated: [
        'border-gray-200 dark:border-gray-800 shadow-md',
        'hover:shadow-lg hover:-translate-y-0.5',
      ].join(' '),
      interactive: [
        'border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer',
        'hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md hover:-translate-y-0.5',
        'active:scale-[0.99]',
      ].join(' '),
      status: 'border-l-4 shadow-sm',
    };

    const statusColors = {
      healthy: 'border-l-green-500',
      warning: 'border-l-yellow-500',
      error: 'border-l-red-500',
      unknown: 'border-l-gray-400',
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          variant === 'status' && status && statusColors[status],
          variant === 'status' && 'border-t-gray-200 dark:border-t-gray-800 border-r-gray-200 dark:border-r-gray-800 border-b-gray-200 dark:border-b-gray-800',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/* ═══════════════════════════════════════════════════
 * Card Sub-components
 * ═══════════════════════════════════════════════════ */

interface CardSubProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardSubProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-800', className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, CardSubProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, CardSubProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, CardSubProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, CardSubProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-t border-gray-200 dark:border-gray-800', className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
