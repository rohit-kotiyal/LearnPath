import { HTMLAttributes } from 'react';
import clsx from 'clsx';
 
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
}
 
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        {
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
            variant === 'success',
          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400':
            variant === 'warning',
          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':
            variant === 'danger',
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400':
            variant === 'info',
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300':
            variant === 'default',
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-sm': size === 'md',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}