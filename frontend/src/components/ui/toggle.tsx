'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, size = 'md', id, disabled, ...props }, ref) => {
    const toggleId = id || `toggle-${Math.random().toString(36).slice(2, 9)}`;

    const sizes = {
      sm: {
        track: 'w-8 h-4',
        thumb: 'w-3 h-3',
        translate: 'peer-checked:translate-x-4',
      },
      md: {
        track: 'w-11 h-6',
        thumb: 'w-5 h-5',
        translate: 'peer-checked:translate-x-5',
      },
      lg: {
        track: 'w-14 h-7',
        thumb: 'w-6 h-6',
        translate: 'peer-checked:translate-x-7',
      },
    };

    const sizeConfig = sizes[size];

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <label
          htmlFor={toggleId}
          className={cn(
            'relative inline-flex items-center cursor-pointer shrink-0',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          {/* Track */}
          <div
            className={cn(
              sizeConfig.track,
              'rounded-full transition-colors duration-200 ease-out',
              'bg-gray-300 dark:bg-gray-600',
              'peer-checked:bg-blue-500',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2'
            )}
          />
          {/* Thumb */}
          <div
            className={cn(
              sizeConfig.thumb,
              'absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm',
              'transition-transform duration-200 ease-out',
              sizeConfig.translate
            )}
          />
        </label>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={toggleId}
                className={cn(
                  'text-sm font-medium text-gray-900 dark:text-white cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <span className="text-sm text-gray-500 dark:text-gray-400">{description}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

/* ═══════════════════════════════════════════════════
 * Toggle Group Component
 * ═══════════════════════════════════════════════════ */

export interface ToggleGroupProps {
  children: React.ReactNode;
  className?: string;
}

function ToggleGroup({ children, className }: ToggleGroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}

export { Toggle, ToggleGroup };
