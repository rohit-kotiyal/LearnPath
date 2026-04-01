import { Session } from '../types/session';
import SessionCard from './SessionCard';
import EmptyState from './EmptyState';
 
interface SessionListProps {
  sessions: Session[];
  isLoading?: boolean;
}
 
export default function SessionList({ sessions, isLoading }: SessionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }
 
  if (sessions.length === 0) {
    return <EmptyState />;
  }
 
  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
 