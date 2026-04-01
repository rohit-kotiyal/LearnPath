import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import clsx from 'clsx';
 
export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}
 
export default function Toast({
  id,
  type,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
 
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);
 
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };
 
  const Icon = icons[type];
 
  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl shadow-lg animate-slideIn',
        'bg-white dark:bg-gray-800 border',
        {
          'border-green-200 dark:border-green-800': type === 'success',
          'border-red-200 dark:border-red-800': type === 'error',
          'border-yellow-200 dark:border-yellow-800': type === 'warning',
          'border-blue-200 dark:border-blue-800': type === 'info',
        }
      )}
    >
      <Icon
        className={clsx('w-5 h-5 flex-shrink-0', {
          'text-green-600 dark:text-green-400': type === 'success',
          'text-red-600 dark:text-red-400': type === 'error',
          'text-yellow-600 dark:text-yellow-400': type === 'warning',
          'text-blue-600 dark:text-blue-400': type === 'info',
        })}
      />
      <p className="flex-1 text-sm text-gray-900 dark:text-gray-100">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}