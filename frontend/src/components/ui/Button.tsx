import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      className,
      disabled,
      ...rest // ✅ only valid DOM props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',

          {
            'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-indigo-500':
              variant === 'primary',

            'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700':
              variant === 'secondary',

            'border border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 dark:hover:bg-indigo-900/20':
              variant === 'outline',

            'text-gray-600 hover:bg-gray-100 focus:ring-gray-400 dark:text-gray-300 dark:hover:bg-gray-800':
              variant === 'ghost',

            'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-red-500':
              variant === 'danger',

            'px-3 py-2 text-sm': size === 'sm',
            'px-4 py-2.5 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',

            'w-full': fullWidth,
          },

          className
        )}
        {...rest} // ✅ prevents custom props leaking to DOM
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {isLoading ? 'Please wait...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
