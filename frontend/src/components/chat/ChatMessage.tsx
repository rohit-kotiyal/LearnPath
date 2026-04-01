import { formatRelativeTime } from '../utils/formatters';
import clsx from 'clsx';
 
interface ChatMessageProps {
  message: {
    username: string;
    message: string;
    timestamp: string;
  };
  isCurrentUser: boolean;
}
 
export default function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  return (
    <div
      className={clsx('flex flex-col', {
        'items-end': isCurrentUser,
        'items-start': !isCurrentUser,
      })}
    >
      <div
        className={clsx('max-w-[80%] rounded-2xl px-4 py-2', {
          'bg-primary-600 text-white': isCurrentUser,
          'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white': !isCurrentUser,
        })}
      >
        {!isCurrentUser && (
          <p className="text-xs font-medium mb-1 opacity-75">{message.username}</p>
        )}
        <p className="text-sm break-words">{message.message}</p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {formatRelativeTime(message.timestamp)}
      </p>
    </div>
  );
}