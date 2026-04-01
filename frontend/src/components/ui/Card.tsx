import { HTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
 
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
  hover?: boolean;
}
 
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, noPadding = false, hover = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700',
          'shadow-sm',
          {
            'p-4 sm:p-6': !noPadding,
            'hover:shadow-md transition-shadow cursor-pointer': hover,
          },
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
export default Card;