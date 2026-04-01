import { formatRelativeTime, formatSessionDuration } from '../utils/formatters';
import { Session, SessionStatus } from '../types/session';
import { Clock, User, Users } from 'lucide-react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { useNavigate } from 'react-router-dom';
 
interface SessionCardProps {
  session: Session;
}
 
export default function SessionCard({ session }: SessionCardProps) {
  const navigate = useNavigate();
 
  const getStatusVariant = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.WAITING:
        return 'warning';
      case SessionStatus.ACTIVE:
        return 'success';
      case SessionStatus.ENDED:
        return 'default';
      default:
        return 'default';
    }
  };
 
  const getStatusText = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.WAITING:
        return 'Waiting';
      case SessionStatus.ACTIVE:
        return 'Active';
      case SessionStatus.ENDED:
        return 'Ended';
      default:
        return status;
    }
  };
 
  const handleClick = () => {
    if (session.status !== SessionStatus.ENDED) {
      navigate(`/session/${session.id}`);
    }
  };
 
  return (
    <Card
      hover={session.status !== SessionStatus.ENDED}
      onClick={handleClick}
      className="cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {session.mentor_name}
              {session.student_name && ` & ${session.student_name}`}
            </h3>
            <Badge variant={getStatusVariant(session.status)} size="sm">
              {getStatusText(session.status)}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatRelativeTime(session.created_at)}
          </p>
        </div>
      </div>
 
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4" />
          <span>Mentor: {session.mentor_name}</span>
        </div>
        {session.student_name && (
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>Student: {session.student_name}</span>
          </div>
        )}
      </div>
 
      {session.start_time && session.end_time && (
        <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>
            Duration: {formatSessionDuration(session.start_time, session.end_time)}
          </span>
        </div>
      )}
 
      {session.status === SessionStatus.WAITING && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Passkey:</span>
            <code className="font-mono font-bold text-primary-600 dark:text-primary-400 tracking-wider">
              {session.passkey}
            </code>
          </div>
        </div>
      )}
    </Card>
  );
}
 