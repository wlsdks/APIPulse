'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'gradient' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center gap-2',
      'font-medium rounded-lg',
      'transition-all duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'active:scale-[0.98]',
    ].join(' ');

    const variants = {
      default: [
        'bg-blue-600 text-white',
        'hover:bg-blue-700 hover:shadow-md',
        'focus-visible:ring-blue-500',
        'dark:bg-blue-500 dark:hover:bg-blue-600',
      ].join(' '),
      outline: [
        'border-2 border-gray-300 dark:border-gray-600 bg-transparent',
        'text-gray-900 dark:text-white',
        'hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500',
        'focus-visible:ring-blue-500',
      ].join(' '),
      ghost: [
        'bg-transparent text-gray-900 dark:text-white',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'focus-visible:ring-blue-500',
      ].join(' '),
      destructive: [
        'bg-red-600 text-white',
        'hover:bg-red-700 hover:shadow-md',
        'focus-visible:ring-red-500',
      ].join(' '),
      gradient: [
        'bg-gradient-to-r from-blue-600 to-blue-500 text-white',
        'hover:from-blue-700 hover:to-blue-600',
        'hover:shadow-lg hover:shadow-blue-500/30',
        'hover:-translate-y-0.5',
        'focus-visible:ring-blue-500',
      ].join(' '),
      success: [
        'bg-green-600 text-white',
        'hover:bg-green-700 hover:shadow-md',
        'focus-visible:ring-green-500',
      ].join(' '),
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
