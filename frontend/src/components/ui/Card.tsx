import { HTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
  hover?: boolean;
  glow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { children, noPadding = false, hover = false, glow = false, className, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          // base
          'relative rounded-2xl border',
          'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
          'border-gray-200/80 dark:border-gray-700/80',

          // depth
          'shadow-sm',

          // padding
          {
            'p-4 sm:p-6': !noPadding,
          },

          // hover effect
          {
            'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl cursor-pointer':
              hover,
          },

          // glow effect
          {
            'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-indigo-500/10 before:to-purple-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity':
              glow,
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