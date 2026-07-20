'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { getProgressColor } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'segmented';
  showLabel?: boolean;
  labelPosition?: 'top' | 'right' | 'bottom';
  className?: string;
  barClassName?: string;
  animated?: boolean;
  color?: string;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  labelPosition = 'right',
  className,
  barClassName,
  animated = true,
  color,
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  const barColor = color || getProgressColor(percentage);

  const sizes: Record<string, string> = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const labelSizes: Record<string, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const progressBar = (
    <div
      className={cn(
        'w-full rounded-full bg-secondary overflow-hidden',
        sizes[size],
        className
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          variant === 'gradient' && 'bg-gradient-to-r from-primary via-purple-500 to-cyan-500',
          animated && 'shimmer-effect',
          sizes[size],
          barClassName
        )}
        style={{
          width: `${percentage}%`,
          ...(variant !== 'gradient' && !color ? {} : {}),
          ...(variant !== 'gradient' && color ? { backgroundColor: barColor } : {}),
          ...(variant === 'default' && !color ? { backgroundColor: barColor } : {}),
        }}
      />
    </div>
  );

  const label = (
    <span className={cn('font-medium', labelSizes[size])}>
      {Math.round(percentage)}%
    </span>
  );

  if (!showLabel) return progressBar;

  if (labelPosition === 'top') {
    return (
      <div className="space-y-1">
        {label}
        {progressBar}
      </div>
    );
  }

  if (labelPosition === 'bottom') {
    return (
      <div className="space-y-1">
        {progressBar}
        {label}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">{progressBar}</div>
      {label}
    </div>
  );
};

export { Progress };
